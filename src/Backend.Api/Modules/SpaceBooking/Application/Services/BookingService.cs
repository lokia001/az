// File: Backend.Api/Modules/SpaceBooking/Application/Services/BookingService.cs
namespace Backend.Api.Modules.SpaceBooking.Application.Services;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Backend.Api.Data; // AppDbContext
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Services;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.Modules.SpaceBooking.Domain.Enums;
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore; // Đảm bảo đã có dòng này

using Backend.Api.Modules.UserRelated.Application.Contracts.Services; // Cần IUserService để lấy email user
using Backend.Api.Services.Shared; // IEmailService


public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly ISpaceRepository _spaceRepository; // Cần để lấy thông tin Space (giá, trạng thái)
    private readonly IMapper _mapper;
    private readonly AppDbContext _dbContext; // Unit of Work
    private readonly IUserService _userService; // Cần để lấy email user cho NotificationEmail
    private readonly IEmailService _emailService; // For sending booking confirmation emails
    private readonly ILogger<BookingService> _logger;
    
    // Vietnam timezone for proper time validation
    private static readonly TimeZoneInfo VietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

    public BookingService(
        IBookingRepository bookingRepository,
        ISpaceRepository spaceRepository,
        IMapper mapper,
        AppDbContext dbContext,
        IUserService userService,
        IEmailService emailService,
        ILogger<BookingService> logger
        )
    {
        _bookingRepository = bookingRepository;
        _spaceRepository = spaceRepository;
        _mapper = mapper;
        _dbContext = dbContext;
        _userService = userService;
        _emailService = emailService;
        _logger = logger;
    }
    
    /// <summary>
    /// Convert UTC datetime to Vietnam local time for proper time validation
    /// </summary>
    private DateTime ConvertToVietnamTime(DateTime utcDateTime)
    {
        if (utcDateTime.Kind == DateTimeKind.Unspecified)
        {
            // Assume it's already in Vietnam time if not specified
            return utcDateTime;
        }
        return TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, VietnamTimeZone);
    }

    public async Task<bool> IsSpaceAvailableAsync(Guid spaceId, DateTime startTime, DateTime endTime, Guid? excludeBookingId = null)
    {
        _logger.LogInformation("Checking availability for SpaceId: {SpaceId} from {StartTime} to {EndTime}, excluding BookingId: {ExcludeBookingId}",
            spaceId, startTime, endTime, excludeBookingId);

        if (startTime >= endTime)
        {
            _logger.LogWarning("Availability check failed: Start time must be before end time.");
            return false;
        }
        if (startTime < DateTime.UtcNow.AddMinutes(-5)) // Cho phép sai số 5 phút
        {
            _logger.LogWarning("Availability check failed: Start time cannot be significantly in the past.");
            return false;
        }

        var space = await _spaceRepository.GetByIdAsync(spaceId);
        if (space == null)
        {
            _logger.LogWarning("Availability check failed: Space {SpaceId} not found.", spaceId);
            return false;
        }
        if (space.Status != SpaceStatus.Available)
        {
            _logger.LogWarning("Availability check failed: Space {SpaceId} is not available (Status: {SpaceStatus}).", spaceId, space.Status);
            return false;
        }

        // Convert UTC times to Vietnam local time for operating hours validation
        var localStartTime = ConvertToVietnamTime(startTime);
        var localEndTime = ConvertToVietnamTime(endTime);

        _logger.LogInformation("Converted times - Local start: {LocalStart}, Local end: {LocalEnd}", 
            localStartTime, localEndTime);

        if (space.OpenTime.HasValue && localStartTime.TimeOfDay < space.OpenTime.Value)
        {
            _logger.LogWarning("Availability check failed: Booking starts before space open time for SpaceId: {SpaceId}. Local start time: {LocalStartTime}, Open time: {OpenTime}", 
                spaceId, localStartTime.TimeOfDay, space.OpenTime.Value);
            return false;
        }
        if (space.CloseTime.HasValue)
        {
            var effectiveEndTimeForCheck = localEndTime;
            // Nếu booking kết thúc đúng 00:00, coi như là cuối ngày hôm trước cho việc so sánh với CloseTime
            if (localEndTime.TimeOfDay == TimeSpan.Zero && localEndTime.Date > localStartTime.Date)
            {
                effectiveEndTimeForCheck = localEndTime.AddTicks(-1); // Lùi lại 1 tick để nó là ngày hôm trước
            }

            if (effectiveEndTimeForCheck.Date > localStartTime.Date && space.CloseTime.Value.Hours != 23 && space.CloseTime.Value.Minutes != 59) // Booking qua ngày và space không phải 24/7 (gần đúng)
            {
                // Cần logic chính xác hơn nếu CloseTime là 00:00 (nghĩa là 24h)
                if (space.CloseTime.Value < effectiveEndTimeForCheck.TimeOfDay && space.CloseTime.Value != TimeSpan.Zero)
                { // Nếu giờ đóng cửa < giờ kết thúc hiệu quả của ngày cuối cùng VÀ giờ đóng cửa không phải là 00:00 (24h)
                    _logger.LogWarning("Availability check failed: Overnight booking part ends after space close time for SpaceId: {SpaceId}. Local end time: {LocalEndTime}, Close time: {CloseTime}", 
                        spaceId, effectiveEndTimeForCheck.TimeOfDay, space.CloseTime.Value);
                    return false;
                }
            }
            else if (effectiveEndTimeForCheck.TimeOfDay > space.CloseTime.Value && space.CloseTime.Value != TimeSpan.Zero) // Cùng ngày, kết thúc sau giờ đóng cửa
            {
                _logger.LogWarning("Availability check failed: Booking ends after space close time for SpaceId: {SpaceId}. Local end time: {LocalEndTime}, Close time: {CloseTime}", 
                    spaceId, effectiveEndTimeForCheck.TimeOfDay, space.CloseTime.Value);
                return false;
            }
        }

        var durationMinutes = (int)(endTime - startTime).TotalMinutes;
        if (durationMinutes < space.MinBookingDurationMinutes)
        {
            _logger.LogWarning("Availability check failed: Duration {DurationMinutes}m is less than MinBookingDuration {MinDuration}m for SpaceId: {SpaceId}.", durationMinutes, space.MinBookingDurationMinutes, spaceId);
            return false;
        }
        if (space.MaxBookingDurationMinutes > 0 && durationMinutes > space.MaxBookingDurationMinutes)
        {
            _logger.LogWarning("Availability check failed: Duration {DurationMinutes}m is greater than MaxBookingDuration {MaxDuration}m for SpaceId: {SpaceId}.", durationMinutes, space.MaxBookingDurationMinutes, spaceId);
            return false;
        }

        // Logic kiểm tra Cleaning/Buffer time (ví dụ đơn giản)
        // Thời gian hiệu quả của slot cần kiểm tra là [startTime - bufferBefore, endTime + cleaningAfter + bufferAfter]
        // Hiện tại HasOverlappingBookingAsync chưa tính cái này.
        // Chúng ta cần điều chỉnh startTime và endTime truyền vào HasOverlappingBookingAsync.
        var checkStartTime = startTime.AddMinutes(-space.BufferMinutes); // Buffer trước booking mới
        var checkEndTime = endTime.AddMinutes(space.CleaningDurationMinutes + space.BufferMinutes); // Cleaning và Buffer sau booking mới

        bool isOverlapping = await _bookingRepository.HasOverlappingBookingAsync(spaceId, checkStartTime, checkEndTime, excludeBookingId);
        if (isOverlapping)
        {
            _logger.LogWarning("Availability check failed: Overlapping booking (considering buffer/cleaning) found for SpaceId: {SpaceId}.", spaceId);
        }
        return !isOverlapping;
    }


    public async Task<BookingDto> CreateBookingAsync(CreateBookingRequest request, Guid userId)
    {

        if (request.StartTime >= request.EndTime)
        {
            throw new ArgumentException("Booking start time must be before end time.");
        }
        if (request.StartTime < DateTime.UtcNow.AddMinutes(-5)) // Cho phép một chút sai số đồng hồ, hoặc không cho đặt quá khứ
        {
            throw new ArgumentException("Booking start time cannot be in the past.");
        }

        var space = await _spaceRepository.GetByIdAsync(request.SpaceId); // Lấy thông tin Space
        if (space == null)
        {
            throw new KeyNotFoundException($"Space with ID {request.SpaceId} not found.");
        }
        if (space.Status != SpaceStatus.Available)
        {
            throw new InvalidOperationException($"Space '{space.Name}' is not available for booking (Status: {space.Status}).");
        }

        // Kiểm tra lịch trống và các ràng buộc
        if (!await IsSpaceAvailableAsync(request.SpaceId, request.StartTime, request.EndTime))
        {
            throw new InvalidOperationException($"The requested time slot for space '{space.Name}' is not available or does not meet booking criteria.");
        }

        // Tính toán TotalPrice
        decimal totalPrice = 0;
        var duration = request.EndTime - request.StartTime;

        // Ưu tiên giá theo ngày nếu có và thời gian đặt đủ dài (ví dụ >= 1 ngày)
        // Cần định nghĩa rõ "đủ dài" là như thế nào. Ví dụ: nếu duration.TotalHours >= 8 (một ngày làm việc)
        // Hoặc nếu space chỉ có giá theo ngày.
        if (space.PricePerDay.HasValue && space.PricePerDay > 0 && duration.TotalHours >= (space.MaxBookingDurationMinutes < 1440 ? (double)space.MaxBookingDurationMinutes / 60 : 8)) // Ví dụ: nếu đặt >= 8 tiếng hoặc bằng max duration nếu max < 1 ngày
        {
            // Logic tính số ngày, có thể làm tròn lên
            // Ví dụ đơn giản: nếu đặt 1.5 ngày, tính 2 ngày.
            // Cần cẩn thận với cách tính "ngày" (ví dụ: qua đêm, block 24h)
            int numberOfDays = (int)Math.Ceiling(duration.TotalDays);
            if (numberOfDays == 0 && duration.TotalHours > 0) numberOfDays = 1; // Ít nhất 1 ngày nếu có PricePerDay
            totalPrice = space.PricePerDay.Value * numberOfDays;
        }
        else if (space.PricePerHour > 0) // Nếu không có giá theo ngày hoặc không đủ điều kiện, tính theo giờ
        {
            // Làm tròn số giờ lên, ví dụ: 1.5 giờ tính 2 giờ, hoặc tính chính xác từng phút
            // Ví dụ tính chính xác:
            totalPrice = space.PricePerHour * (decimal)duration.TotalHours;
        }
        else
        {
            // Trường hợp không có giá nào được cấu hình hợp lệ
            throw new InvalidOperationException("Pricing for this space is not configured correctly.");
        }
        totalPrice = Math.Round(totalPrice, 2); // Làm tròn đến 2 chữ số thập phân

        var booking = _mapper.Map<Booking>(request);
        booking.UserId = userId;
        booking.CreatedByUserId = userId; // Gán CreatedByUserId
        booking.TotalPrice = totalPrice;
        booking.Status = BookingStatus.Pending; // Mặc định là Confirmed, hoặc Pending nếu cần duyệt
        booking.CreatedAt = DateTime.UtcNow;
        booking.BookingCode = GenerateBookingCodeInternal(booking.Id); // Tự sinh mã booking

        // Validate và xử lý NotificationEmail
        if (!string.IsNullOrWhiteSpace(booking.NotificationEmail))
        {
            // Validate email format nếu được cung cấp
            if (!IsValidEmail(booking.NotificationEmail))
            {
                throw new ArgumentException("NotificationEmail không có định dạng email hợp lệ.");
            }
        }
        else
        {
            // Nếu không được cung cấp, dùng email của user
            var user = await _userService.GetUserByIdAsync(userId);
            if (user != null && !string.IsNullOrWhiteSpace(user.Email))
            {
                booking.NotificationEmail = user.Email;
            }
            else
            {
                _logger.LogWarning("User {UserId} not found or has no email, NotificationEmail will be null", userId);
            }
        }

        await _bookingRepository.AddAsync(booking);
        await _dbContext.SaveChangesAsync();


        // Lấy lại booking với thông tin Space để map SpaceName
        var createdBookingWithDetails = await _bookingRepository.GetByIdAsync(booking.Id); // BookingRepository.GetByIdAsync cần Include(b => b.Space)
        if (createdBookingWithDetails == null)
        {
            throw new Exception("Booking was created but could not be retrieved.");
        }
        return _mapper.Map<BookingDto>(createdBookingWithDetails);
    }

    private string GenerateBookingCodeInternal(Guid bookingId)
    {
        // Ví dụ đơn giản: "BK-" + 8 ký tự cuối của GUID (không có dấu gạch nối), viết hoa.
        // Bạn có thể tùy chỉnh logic này để phức tạp hơn nếu cần (ví dụ: thêm ngày tháng, tiền tố theo Space).
        return $"BK-{bookingId.ToString("N").Substring(bookingId.ToString("N").Length - 8).ToUpper()}";
    }


    // --- CÁC PHƯƠNG THỨC KHÁC CỦA IBookingService SẼ ĐƯỢC IMPLEMENT Ở ĐÂY ---
    public async Task<BookingDto?> GetBookingByIdAsync(Guid bookingId, Guid requestorUserId)
    {
        _logger.LogInformation("Fetching booking with ID: {BookingId} for RequestorId: {RequestorId}", bookingId, requestorUserId);

        // BookingRepository.GetByIdAsync nên Include(b => b.Space) để mapper có thể lấy SpaceName
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null || booking.IsDeleted) // Kiểm tra cả IsDeleted
        {
            _logger.LogWarning("Booking with ID: {BookingId} not found or is deleted.", bookingId);
            return null;
        }

        // Kiểm tra quyền:
        // 1. Người đặt booking có quyền xem (nếu không phải guest booking).
        // 2. Owner của Space mà booking đó thuộc về có quyền xem.
        // 3. SysAdmin có quyền xem (nếu có logic này).
        bool canView = false;
        if (booking.UserId.HasValue && booking.UserId == requestorUserId)
        {
            canView = true;
        }
        else
        {
            // Không cần lấy lại Space nếu BookingRepository.GetByIdAsync đã Include(b => b.Space)
            // var space = await _spaceRepository.GetByIdAsync(booking.SpaceId);
            if (booking.Space != null && booking.Space.OwnerId == requestorUserId)
            {
                canView = true;
            }
            // else if (await _userService.UserHasRoleAsync(requestorUserId, UserRole.SysAdmin)) // Ví dụ kiểm tra SysAdmin
            // {
            //     canView = true;
            // }
        }

        if (!canView)
        {
            _logger.LogWarning("User {RequestorId} is not authorized to view booking {BookingId}.", requestorUserId, bookingId);
            throw new UnauthorizedAccessException("User is not authorized to view this booking.");
        }

        var bookingDto = _mapper.Map<BookingDto>(booking);
        
        // If NotificationEmail is null or empty, fallback to user email (if not guest)
        if (string.IsNullOrWhiteSpace(bookingDto.NotificationEmail))
        {
            if (booking.UserId.HasValue)
            {
                try
                {
                    var user = await _userService.GetUserByIdAsync(booking.UserId.Value);
                    if (user != null && !string.IsNullOrWhiteSpace(user.Email))
                    {
                        bookingDto.NotificationEmail = user.Email;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get user email for booking {BookingId}, user {UserId}", 
                        bookingId, booking.UserId);
                }
            }
            else if (!string.IsNullOrWhiteSpace(booking.GuestEmail))
            {
                // For guest bookings, fallback to guest email
                bookingDto.NotificationEmail = booking.GuestEmail;
            }
        }
        
        // Làm giàu DTO với BookerName nếu cần và nếu IUserService được inject
        // if (booking.UserId == requestorUserId) { // Chỉ làm giàu nếu người xem là người đặt
        //    var booker = await _userService.GetUserByIdAsync(booking.UserId);
        //    if (booker != null) bookingDto = bookingDto with { BookerUsername = booker.FullName ?? booker.Username };
        // }
        return bookingDto;
    }


    public async Task<IEnumerable<BookingDto>> GetBookingsForUserAsync(Guid userId)
    {
        var bookings = await _bookingRepository.GetByUserIdAsync(userId);
        return _mapper.Map<IEnumerable<BookingDto>>(bookings); // Làm giàu DTO nếu cần
    }

    public async Task<IEnumerable<BookingDto>> GetBookingsForSpaceAsync(Guid spaceId, Guid requestorUserId)
    {
        _logger.LogInformation("Fetching bookings for SpaceId: {SpaceId} by RequestorId: {RequestorId}", spaceId, requestorUserId);

        var space = await _spaceRepository.GetByIdAsync(spaceId);
        if (space == null)
        {
            throw new KeyNotFoundException($"Space with ID {spaceId} not found.");
        }

        // Kiểm tra quyền: requestorUserId phải là Owner của Space hoặc SysAdmin
        if (space.OwnerId != requestorUserId /* && !await _userService.UserHasRoleAsync(requestorUserId, UserRole.SysAdmin) */)
        {
            _logger.LogWarning("User {RequestorId} is not authorized to view bookings for Space {SpaceId}.", requestorUserId, spaceId);
            throw new UnauthorizedAccessException("User is not authorized to view bookings for this space.");
        }

        // BookingRepository.GetBySpaceIdAsync nên Include(b => b.Space)
        var bookings = await _bookingRepository.GetBySpaceIdAsync(spaceId);
        var bookingDtos = _mapper.Map<IEnumerable<BookingDto>>(bookings).ToList();
        
        // Enrich booking DTOs with user email fallback for notification email
        foreach (var bookingDto in bookingDtos)
        {
            // If NotificationEmail is null or empty, fallback to user email
            if (string.IsNullOrWhiteSpace(bookingDto.NotificationEmail))
            {
                try
                {
                    var user = await _userService.GetUserByIdAsync(bookingDto.UserId);
                    if (user != null && !string.IsNullOrWhiteSpace(user.Email))
                    {
                        bookingDto.NotificationEmail = user.Email;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get user email for booking {BookingId}, user {UserId}", 
                        bookingDto.Id, bookingDto.UserId);
                }
            }
        }
        
        return bookingDtos;
        // Không cần làm giàu BookerUsername ở đây vì đây là Owner xem, họ quan tâm ai đặt chứ không phải tên của chính họ.
    }

    public async Task<IEnumerable<BookingDto>> GetMyBookingsAsync(Guid userId, BookingSearchParameters? parameters = null)
    {
        _logger.LogInformation("Fetching bookings for User {UserId} with parameters: {@Parameters}", userId, parameters);

        // Lấy tất cả bookings của user, sau đó lọc và phân trang bằng LINQ trên bộ nhớ
        var allBookings = await _bookingRepository.GetByUserIdAsync(userId);
        var filteredBookings = allBookings.Where(b => !b.IsDeleted);

        if (parameters != null)
        {
            if (parameters.Status.HasValue)
            {
                filteredBookings = filteredBookings.Where(b => b.Status == parameters.Status.Value);
            }
            if (parameters.StartDate.HasValue)
            {
                filteredBookings = filteredBookings.Where(b => b.StartTime >= parameters.StartDate.Value);
            }
            if (parameters.EndDate.HasValue)
            {
                // Đảm bảo EndDate được hiểu là cuối ngày nếu chỉ có Date
                var endDateInclusive = parameters.EndDate.Value.Date.AddDays(1);
                filteredBookings = filteredBookings.Where(b => b.StartTime < endDateInclusive);
            }

            // Logic sắp xếp (Cải thiện để an toàn hơn và linh hoạt hơn)
            var sortBy = parameters.SortBy?.ToLowerInvariant();
            var sortOrder = parameters.SortOrder?.ToLowerInvariant();
            bool isDescending = sortOrder == "desc";

            // Mặc định sắp xếp theo StartTime giảm dần nếu không có thông tin sắp xếp hợp lệ
            IOrderedEnumerable<Booking> orderedBookings;
            switch (sortBy)
            {
                case "starttime":
                    orderedBookings = isDescending ? filteredBookings.OrderByDescending(b => b.StartTime) : filteredBookings.OrderBy(b => b.StartTime);
                    break;
                case "createdat":
                    orderedBookings = isDescending ? filteredBookings.OrderByDescending(b => b.CreatedAt) : filteredBookings.OrderBy(b => b.CreatedAt);
                    break;
                // Thêm các trường hợp sắp xếp khác nếu cần (ví dụ: totalprice, status)
                default:
                    orderedBookings = filteredBookings.OrderByDescending(b => b.StartTime); // Sắp xếp mặc định
                    break;
            }
            filteredBookings = orderedBookings;

            // Logic phân trang
            filteredBookings = filteredBookings.Skip((parameters.PageNumber - 1) * parameters.PageSize).Take(parameters.PageSize);
        }
        else // Nếu không có parameters, vẫn nên có sắp xếp mặc định
        {
            filteredBookings = filteredBookings.OrderByDescending(b => b.StartTime);
            // Cân nhắc có nên phân trang mặc định ở đây không, hoặc trả về tất cả nếu không có parameters.
            // Ví dụ: filteredBookings = filteredBookings.Take(100); // Giới hạn số lượng trả về nếu không phân trang
        }

        var bookingDtos = _mapper.Map<IEnumerable<BookingDto>>(filteredBookings.ToList());

        // Thiết lập cờ CanReview cho mỗi DTO
        // Logic đơn giản: Nếu booking đã Completed, user có thể thấy nút review.
        // Việc kiểm tra "đã review rồi" sẽ do API POST review xử lý.
        foreach (var dto in bookingDtos)
        {
            dto.CanReview = dto.Status == BookingStatus.Completed;
        }
        return bookingDtos;
    }


    public async Task<bool> CancelBookingAsync(Guid bookingId, Guid userId, string? cancellationReason = null)
    {
        _logger.LogInformation("Attempting to cancel booking {BookingId} by User {UserId}. Reason: {Reason}", bookingId, userId, cancellationReason);

        // BookingRepository.GetByIdAsync nên Include(b => b.Space) để lấy CancellationNoticeHours
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null || booking.IsDeleted)
        {
            _logger.LogWarning("CancelBooking: Booking {BookingId} not found or already deleted.", bookingId);
            return false; // Hoặc throw KeyNotFoundException
        }

        // Kiểm tra quyền:
        // 1. Người đặt (userId) có thể tự hủy booking của mình.
        // 2. Owner của Space có thể hủy booking trong Space của họ (tùy logic nghiệp vụ).
        // 3. SysAdmin có thể hủy (tùy logic nghiệp vụ).
        bool canCancel = false;
        if (booking.UserId.HasValue && booking.UserId == userId) // Người đặt tự hủy (chỉ cho user bookings, không cho guest)
        {
            canCancel = true;
            // Kiểm tra chính sách hủy của Space đối với người dùng
            if (booking.Space != null && DateTime.UtcNow > booking.StartTime.AddHours(-booking.Space.CancellationNoticeHours))
            {
                throw new InvalidOperationException($"Booking cannot be cancelled now. Cancellation must be made at least {booking.Space.CancellationNoticeHours} hours in advance.");
            }
        }
        // else if (booking.Space != null && booking.Space.OwnerId == userId /* && userIsOwner */) // Owner hủy
        // {
        //     canCancel = true;
        //     // Owner có thể có chính sách hủy riêng hoặc không bị ràng buộc
        // }
        // else if (/* userIsSysAdmin */) // SysAdmin hủy
        // {
        //     canCancel = true;
        // }


        if (!canCancel)
        {
            _logger.LogWarning("User {UserId} is not authorized to cancel booking {BookingId}.", userId, bookingId);
            throw new UnauthorizedAccessException("User is not authorized to cancel this booking.");
        }

        // Kiểm tra trạng thái booking có cho phép hủy không
        if (booking.Status != BookingStatus.Pending && booking.Status != BookingStatus.Confirmed)
        {
            throw new InvalidOperationException($"Booking with status '{booking.Status}' cannot be cancelled.");
        }

        // Update booking status
        booking.Status = BookingStatus.Cancelled;
        booking.UpdatedAt = DateTime.UtcNow;
        booking.UpdatedByUserId = userId;
        booking.CancellationReason = cancellationReason;
        booking.NotesFromUser = string.IsNullOrWhiteSpace(booking.NotesFromUser) 
            ? $"Cancelled by user. Reason: {cancellationReason}" 
            : $"{booking.NotesFromUser}\nCancelled by user. Reason: {cancellationReason}";

        _bookingRepository.Update(booking);
        var result = await _dbContext.SaveChangesAsync();

        if (result > 0)
        {
            _logger.LogInformation("Booking {BookingId} cancelled successfully by User {UserId}.", bookingId, userId);
            // TODO: Gửi thông báo cho Owner và User (nếu có Notification module)
        }
        return result > 0;
    }



    public async Task<BookingDto?> UpdateBookingStatusAsync(Guid bookingId, UpdateBookingStatusRequest request, Guid updaterUserId)
    {
        _logger.LogInformation("Attempting to update status for BookingId: {BookingId} to {NewStatus} by UpdaterId: {UpdaterId}",
            bookingId, request.NewStatus, updaterUserId);

        var booking = await _bookingRepository.GetByIdAsync(bookingId); // Repository nên Include(b => b.Space)
        if (booking == null || booking.IsDeleted)
        {
            _logger.LogWarning("UpdateBookingStatus: Booking {BookingId} not found or is deleted.", bookingId);
            return null; // Hoặc throw KeyNotFoundException
        }

        // Kiểm tra quyền của updaterUserId (phải là Owner của Space hoặc SysAdmin)
        // Giả sử booking.Space đã được Include
        if (booking.Space == null) // Phòng trường hợp Space bị xóa hoặc lỗi Include
        {
            _logger.LogError("UpdateBookingStatus: Space information is missing for Booking {BookingId}.", bookingId);
            throw new InvalidOperationException("Associated space information is missing for this booking.");
        }

        if (booking.Space.OwnerId != updaterUserId /* && !await _userService.UserHasRoleAsync(updaterUserId, UserRole.SysAdmin) */)
        {
            _logger.LogWarning("User {UpdaterId} is not authorized to update status for booking {BookingId} (Space Owner: {OwnerId}).",
                updaterUserId, bookingId, booking.Space.OwnerId);
            throw new UnauthorizedAccessException("User is not authorized to update this booking's status.");
        }

        // Logic kiểm tra tính hợp lệ của việc chuyển đổi trạng thái
        // Ví dụ: không thể chuyển từ Completed sang Pending, v.v.
        string errorMessage = string.Empty;

        switch (booking.Status)
        {
            case BookingStatus.Pending:
                if (request.NewStatus != BookingStatus.Confirmed && request.NewStatus != BookingStatus.Cancelled)
                    errorMessage = $"Cannot change status from Pending to {request.NewStatus}. Allowed: Confirmed, Cancelled.";
                break;
            case BookingStatus.Confirmed:
                if (request.NewStatus != BookingStatus.CheckedIn && request.NewStatus != BookingStatus.Cancelled && request.NewStatus != BookingStatus.NoShow)
                    errorMessage = $"Cannot change status from Confirmed to {request.NewStatus}. Allowed: CheckedIn, Cancelled, NoShow.";
                break;
            case BookingStatus.CheckedIn:
                if (request.NewStatus != BookingStatus.Completed && request.NewStatus != BookingStatus.Cancelled) // Hiếm khi hủy khi đã check-in
                    errorMessage = $"Cannot change status from CheckedIn to {request.NewStatus}. Allowed: Completed, Cancelled (with caution).";
                break;
            case BookingStatus.Completed:
            case BookingStatus.Cancelled:
            case BookingStatus.NoShow:
            case BookingStatus.Abandoned:
            case BookingStatus.Overdue: // Các trạng thái cuối, không nên cho thay đổi qua API này nữa
                errorMessage = $"Booking with status {booking.Status} cannot be updated via this method.";
                break;
        }

        if (!string.IsNullOrEmpty(errorMessage))
        {
            _logger.LogWarning("UpdateBookingStatus: Invalid status transition for Booking {BookingId}. {ErrorMessage}", bookingId, errorMessage);
            throw new InvalidOperationException(errorMessage);
        }

        // Nếu NewStatus là một hành động cụ thể (CheckIn, CheckOut, NoShow, Cancel),
        // nên gọi các domain method tương ứng để có logic nghiệp vụ đầy đủ.
        // Phương thức này chủ yếu dùng để Owner/Admin xác nhận (Pending -> Confirmed) hoặc các điều chỉnh khác.

        bool wasConfirmed = false; // Track if booking was confirmed to send email

        if (request.NewStatus == BookingStatus.Confirmed && booking.Status == BookingStatus.Pending)
        {
            // Update to confirmed status
            booking.Status = BookingStatus.Confirmed;
            booking.UpdatedAt = DateTime.UtcNow;
            booking.UpdatedByUserId = updaterUserId;
            booking.NotesFromOwner = string.IsNullOrWhiteSpace(booking.NotesFromOwner)
                ? $"[Confirmed by {updaterUserId}]"
                : $"{booking.NotesFromOwner}\n[Confirmed by {updaterUserId}]";
            wasConfirmed = true;
        }
        else if (request.NewStatus == BookingStatus.Cancelled && (booking.Status == BookingStatus.Pending || booking.Status == BookingStatus.Confirmed))
        {
            // Update to cancelled status
            booking.Status = BookingStatus.Cancelled;
            booking.UpdatedAt = DateTime.UtcNow;
            booking.UpdatedByUserId = updaterUserId;
            booking.CancellationReason = request.Notes ?? "Cancelled by administrator";
            booking.NotesFromOwner = string.IsNullOrWhiteSpace(booking.NotesFromOwner)
                ? $"[Cancelled by administrator {updaterUserId}]"
                : $"{booking.NotesFromOwner}\n[Cancelled by administrator {updaterUserId}]";
        }
        else if (booking.Status != request.NewStatus)
        {
            _logger.LogWarning("UpdateBookingStatus: Attempting a generic status update for Booking {BookingId} from {OldStatus} to {NewStatus} by {UpdaterId}. This might bypass specific business logic.",
               bookingId, booking.Status, request.NewStatus, updaterUserId);
            booking.Status = request.NewStatus;
            booking.UpdatedAt = DateTime.UtcNow;
            booking.UpdatedByUserId = updaterUserId;
        }


        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            booking.NotesFromOwner = string.IsNullOrWhiteSpace(booking.NotesFromOwner)
                ? $"[{DateTime.UtcNow:g} by {updaterUserId} for status {request.NewStatus}]: {request.Notes}"
                : $"{booking.NotesFromOwner}\n[{DateTime.UtcNow:g} by {updaterUserId} for status {request.NewStatus}]: {request.Notes}";
        }

        _bookingRepository.Update(booking);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Status for BookingId: {BookingId} updated to {NewStatus} by UpdaterId: {UpdaterId}",
            bookingId, request.NewStatus, updaterUserId);

        // Send email notification if booking was confirmed (Pending -> Confirmed)
        if (wasConfirmed)
        {
            try
            {
                string? notificationEmail = null;
                string? customerName = null;

                if (booking.UserId.HasValue)
                {
                    // Get user info for email
                    var user = await _userService.GetUserByIdAsync(booking.UserId.Value);
                    if (user != null)
                    {
                        customerName = user.FullName ?? user.Username;
                        // Determine notification email (use NotificationEmail if provided, otherwise fallback to user email)
                        notificationEmail = !string.IsNullOrWhiteSpace(booking.NotificationEmail) 
                            ? booking.NotificationEmail 
                            : user.Email;
                    }
                }
                else
                {
                    // Guest booking
                    customerName = booking.GuestName;
                    notificationEmail = booking.NotificationEmail ?? booking.GuestEmail;
                }

                if (!string.IsNullOrWhiteSpace(notificationEmail) && !string.IsNullOrWhiteSpace(customerName))
                {

                    // Get owner email from space
                    var ownerUser = await _userService.GetUserByIdAsync(booking.Space.OwnerId);
                    var ownerEmail = ownerUser?.Email ?? "support@workingspace.com"; // Fallback email

                    // Format dates for email
                    var vietnamTime = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
                    var startTimeLocal = TimeZoneInfo.ConvertTimeFromUtc(booking.StartTime, vietnamTime);
                    var endTimeLocal = TimeZoneInfo.ConvertTimeFromUtc(booking.EndTime, vietnamTime);

                    var startTimeStr = startTimeLocal.ToString("dd/MM/yyyy HH:mm");
                    var endTimeStr = endTimeLocal.ToString("dd/MM/yyyy HH:mm");
                    var checkInTimeStr = startTimeLocal.ToString("dd/MM/yyyy HH:mm"); // Use StartTime as check-in time

                    // Send confirmation email
                    await _emailService.SendBookingConfirmationEmailAsync(
                        toEmail: notificationEmail,
                        customerName: customerName,
                        spaceName: booking.Space.Name,
                        startTime: startTimeStr,
                        endTime: endTimeStr,
                        checkInTime: checkInTimeStr,
                        ownerEmail: ownerEmail,
                        bookingCode: booking.Id.ToString("N")[..8].ToUpper() // Use first 8 chars of GUID as booking code
                    );

                    _logger.LogInformation("Booking confirmation email sent to {Email} for booking {BookingId}", 
                        notificationEmail, bookingId);
                }
                else
                {
                    _logger.LogWarning("Could not find user {UserId} to send booking confirmation email for booking {BookingId}", 
                        booking.UserId, bookingId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send booking confirmation email for booking {BookingId}", bookingId);
                // Don't throw exception - email failure shouldn't affect booking confirmation
            }
        }

        // Lấy lại booking với thông tin Space để map SpaceName
        var updatedBookingWithDetails = await _bookingRepository.GetByIdAsync(booking.Id);
        return _mapper.Map<BookingDto>(updatedBookingWithDetails);
    }

    // Implement các phương thức còn lại (CheckInAsync, CheckOutAsync, MarkAsNoShowAsync)
    // tương tự, gọi domain methods trên Booking entity và lưu.
    public async Task<BookingDto?> CheckInAsync(Guid bookingId, CheckInRequest request, Guid staffUserId)
    {
        _logger.LogInformation("Attempting to check-in BookingId: {BookingId} by StaffId: {StaffId}", bookingId, staffUserId);
        var booking = await _bookingRepository.GetByIdAsync(bookingId); // Cần Include Space
        if (booking == null || booking.IsDeleted)
        {
            _logger.LogWarning("CheckInAsync: Booking {BookingId} not found or is deleted.", bookingId);
            return null;
        }

        // Kiểm tra quyền của staffUserId (phải là Owner của Space hoặc SysAdmin)
        if (booking.Space == null) throw new InvalidOperationException("Associated space information is missing.");
        if (booking.Space.OwnerId != staffUserId /* && !isSysAdmin */)
        {
            _logger.LogWarning("User {StaffId} is not authorized to check-in booking {BookingId}.", staffUserId, bookingId);
            throw new UnauthorizedAccessException("User is not authorized to check-in this booking.");
        }

        // Kiểm tra thời gian check-in (ví dụ: không quá sớm hoặc quá muộn so với StartTime)
        // if (DateTime.UtcNow < booking.StartTime.AddHours(-1)) // Ví dụ: không cho check-in sớm hơn 1 tiếng
        // {
        //     throw new InvalidOperationException("Cannot check-in too early.");
        // }
        // if (DateTime.UtcNow > booking.EndTime) // Không cho check-in nếu đã qua giờ kết thúc booking
        // {
        //     throw new InvalidOperationException("Cannot check-in after booking period has ended.");
        // }


        // Update booking status and check-in information
        booking.Status = BookingStatus.CheckedIn;
        booking.ActualCheckIn = DateTime.UtcNow;
        booking.CheckedInByUserId = staffUserId;
        booking.UpdatedAt = DateTime.UtcNow;
        booking.UpdatedByUserId = staffUserId;

        booking.NotesFromOwner = string.IsNullOrWhiteSpace(booking.NotesFromOwner)
            ? $"[Check-In by {staffUserId}]"
            : $"{booking.NotesFromOwner}\n[Check-In by {staffUserId}]";

        _bookingRepository.Update(booking);
        await _dbContext.SaveChangesAsync();
        _logger.LogInformation("BookingId: {BookingId} checked-in successfully by StaffId: {StaffId}", bookingId, staffUserId);
        return _mapper.Map<BookingDto>(await _bookingRepository.GetByIdAsync(bookingId));
    }

    public async Task<BookingDto?> CheckOutAsync(Guid bookingId, CheckOutRequest request, Guid staffUserId)
    {
        _logger.LogInformation("Attempting to check-out BookingId: {BookingId} by StaffId: {StaffId}", bookingId, staffUserId);
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null || booking.IsDeleted)
        {
            _logger.LogWarning("CheckOutAsync: Booking {BookingId} not found or is deleted.", bookingId);
            return null;
        }

        if (booking.Space == null) // Đảm bảo Space được load nếu cần kiểm tra OwnerId của Space
        {
            _logger.LogError("CheckOutAsync: Associated space information is missing for Booking {BookingId}.", bookingId);
            throw new InvalidOperationException("Associated space information is missing for this booking.");
        }

        // Kiểm tra quyền của staffUserId (phải là Owner của Space hoặc SysAdmin)
        if (booking.Space.OwnerId != staffUserId /* && !await _userService.UserHasRoleAsync(staffUserId, UserRole.SysAdmin) */)
        {
            _logger.LogWarning("User {StaffId} is not authorized to check-out booking {BookingId}.", staffUserId, bookingId);
            throw new UnauthorizedAccessException("User is not authorized to check-out this booking.");
        }

        // Update booking status and check-out information
        booking.Status = BookingStatus.Completed;
        booking.ActualCheckOut = DateTime.UtcNow;
        booking.CheckedOutByUserId = staffUserId;
        booking.UpdatedAt = DateTime.UtcNow;
        booking.UpdatedByUserId = staffUserId;
        
        booking.NotesFromOwner = string.IsNullOrWhiteSpace(booking.NotesFromOwner)
            ? $"[Check-Out by {staffUserId}]"
            : $"{booking.NotesFromOwner}\n[Check-Out by {staffUserId}]";

        _bookingRepository.Update(booking);
        await _dbContext.SaveChangesAsync();
        _logger.LogInformation("BookingId: {BookingId} checked-out successfully (Status: {Status}) by StaffId: {StaffId}", bookingId, booking.Status, staffUserId);
        return _mapper.Map<BookingDto>(await _bookingRepository.GetByIdAsync(bookingId));
    }


    public async Task<BookingDto?> MarkAsNoShowAsync(Guid bookingId, Guid markerUserId)
    {
        _logger.LogInformation("Attempting to mark BookingId: {BookingId} as NoShow by MarkerId: {MarkerId}", bookingId, markerUserId);
        var booking = await _bookingRepository.GetByIdAsync(bookingId); // Cần Include Space
        if (booking == null || booking.IsDeleted)
        {
            _logger.LogWarning("MarkAsNoShowAsync: Booking {BookingId} not found or is deleted.", bookingId);
            return null;
        }

        if (booking.Space == null) throw new InvalidOperationException("Associated space information is missing.");
        if (booking.Space.OwnerId != markerUserId /* && !isSysAdmin */)
        {
            _logger.LogWarning("User {MarkerId} is not authorized to mark booking {BookingId} as no-show.", markerUserId, bookingId);
            throw new UnauthorizedAccessException("User is not authorized to mark this booking as no-show.");
        }

        // Update booking status and mark as no-show
        booking.Status = BookingStatus.NoShow;
        booking.UpdatedAt = DateTime.UtcNow;
        booking.UpdatedByUserId = markerUserId;
        booking.NotesFromOwner = string.IsNullOrWhiteSpace(booking.NotesFromOwner)
            ? $"[Marked as No-Show by {markerUserId}]"
            : $"{booking.NotesFromOwner}\n[Marked as No-Show by {markerUserId}]";

        _bookingRepository.Update(booking);
        await _dbContext.SaveChangesAsync();
        _logger.LogInformation("BookingId: {BookingId} marked as NoShow successfully by MarkerId: {MarkerId}", bookingId, markerUserId);
        return _mapper.Map<BookingDto>(await _bookingRepository.GetByIdAsync(bookingId));
    }

    /// <summary>
    /// Validates email format using simple regex pattern
    /// </summary>
    private static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        try
        {
            // Use simple but effective email regex pattern
            return System.Text.RegularExpressions.Regex.IsMatch(email,
                @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        }
        catch
        {
            return false;
        }
    }

    public async Task<BookingDto> CreateOwnerBookingAsync(CreateOwnerBookingRequest request, Guid ownerUserId)
    {
        _logger.LogInformation("Creating owner booking for SpaceId: {SpaceId} by OwnerId: {OwnerId}", request.SpaceId, ownerUserId);

        // Validate times
        if (request.StartTime >= request.EndTime)
        {
            throw new ArgumentException("Booking start time must be before end time.");
        }
        if (request.StartTime < DateTime.UtcNow.AddMinutes(-5))
        {
            throw new ArgumentException("Booking start time cannot be in the past.");
        }

        // Validate space and ownership
        var space = await _spaceRepository.GetByIdAsync(request.SpaceId);
        if (space == null)
        {
            throw new KeyNotFoundException($"Space with ID {request.SpaceId} not found.");
        }
        if (space.OwnerId != ownerUserId)
        {
            throw new UnauthorizedAccessException("You can only create bookings for your own spaces.");
        }
        if (space.Status != SpaceStatus.Available)
        {
            throw new InvalidOperationException($"Space '{space.Name}' is not available for booking (Status: {space.Status}).");
        }

        // Validate guest vs user booking
        if (!request.UserId.HasValue)
        {
            // Guest booking - validate required guest fields
            if (string.IsNullOrWhiteSpace(request.GuestName))
            {
                throw new ArgumentException("Guest name is required for guest bookings.");
            }
            if (string.IsNullOrWhiteSpace(request.GuestEmail))
            {
                throw new ArgumentException("Guest email is required for guest bookings.");
            }
            if (!IsValidEmail(request.GuestEmail))
            {
                throw new ArgumentException("Guest email must be a valid email format.");
            }
        }
        else
        {
            // User booking - validate user exists
            var user = await _userService.GetUserByIdAsync(request.UserId.Value);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {request.UserId} not found.");
            }
        }

        // Check space availability
        if (!await IsSpaceAvailableAsync(request.SpaceId, request.StartTime, request.EndTime))
        {
            throw new InvalidOperationException($"The requested time slot for space '{space.Name}' is not available or does not meet booking criteria.");
        }

        // Calculate total price
        decimal totalPrice = 0;
        var duration = request.EndTime - request.StartTime;

        if (space.PricePerDay.HasValue && space.PricePerDay > 0 && duration.TotalHours >= (space.MaxBookingDurationMinutes < 1440 ? (double)space.MaxBookingDurationMinutes / 60 : 8))
        {
            int numberOfDays = (int)Math.Ceiling(duration.TotalDays);
            if (numberOfDays == 0 && duration.TotalHours > 0) numberOfDays = 1;
            totalPrice = space.PricePerDay.Value * numberOfDays;
        }
        else if (space.PricePerHour > 0)
        {
            totalPrice = space.PricePerHour * (decimal)duration.TotalHours;
        }
        else
        {
            throw new InvalidOperationException("Pricing for this space is not configured correctly.");
        }
        totalPrice = Math.Round(totalPrice, 2);

        // Create booking entity using AutoMapper then set additional fields
        var booking = _mapper.Map<Booking>(request);
        booking.CreatedByUserId = ownerUserId; // Owner created this booking
        booking.TotalPrice = totalPrice;
        booking.CreatedAt = DateTime.UtcNow;
        booking.BookingCode = string.Empty; // Will be set after save

        // Set notification email if not provided
        if (string.IsNullOrWhiteSpace(booking.NotificationEmail))
        {
            if (booking.UserId.HasValue)
            {
                var user = await _userService.GetUserByIdAsync(booking.UserId.Value);
                if (user != null && !string.IsNullOrWhiteSpace(user.Email))
                {
                    booking.NotificationEmail = user.Email;
                }
            }
            else
            {
                booking.NotificationEmail = booking.GuestEmail;
            }
        }
        else if (!IsValidEmail(booking.NotificationEmail))
        {
            throw new ArgumentException("Notification email must be a valid email format.");
        }

        // Save booking
        await _bookingRepository.AddAsync(booking);
        booking.BookingCode = GenerateBookingCodeInternal(booking.Id);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Owner booking created successfully. BookingId: {BookingId}, Status: {Status}", booking.Id, booking.Status);

        // Get booking with space details for response
        var createdBookingWithDetails = await _bookingRepository.GetByIdAsync(booking.Id);
        if (createdBookingWithDetails == null)
        {
            throw new Exception("Booking was created but could not be retrieved.");
        }

        return _mapper.Map<BookingDto>(createdBookingWithDetails);
    }
}