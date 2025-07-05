// File: Backend.Api/Modules/SpaceBooking/Application/Services/BookingService.cs
namespace Backend.Api.Modules.SpaceBooking.Application.Services;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text;
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
    private readonly ISpaceService _spaceService; // For auto-updating space status
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
        ISpaceService spaceService,
        ILogger<BookingService> logger
        )
    {
        _bookingRepository = bookingRepository;
        _spaceRepository = spaceRepository;
        _mapper = mapper;
        _dbContext = dbContext;
        _userService = userService;
        _emailService = emailService;
        _spaceService = spaceService;
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

    /// <summary>
    /// Validate space availability rules without checking for conflicts (time overlap)
    /// Used for creating bookings that will be checked for conflicts later
    /// </summary>
    public async Task<bool> IsSpaceAvailableForBookingAsync(Guid spaceId, DateTime startTime, DateTime endTime)
    {
        if (startTime >= endTime)
        {
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

        return true; // No conflict checking - just space rules validation
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

        // Kiểm tra lịch trống và các ràng buộc (không check conflict)
        if (!await IsSpaceAvailableForBookingAsync(request.SpaceId, request.StartTime, request.EndTime))
        {
            throw new InvalidOperationException($"The requested time slot for space '{space.Name}' does not meet booking criteria (time, duration, operating hours).");
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

        // Check for conflicts with this new booking and mark conflicts if any exist
        try
        {
            var spaceBookings = await _bookingRepository.GetBySpaceIdAsync(booking.SpaceId);
            var conflictCount = await CheckAndMarkConflictBookingsAsync(spaceBookings);
            if (conflictCount > 0)
            {
                _logger.LogInformation("New booking {BookingId} creation resulted in {ConflictCount} conflicts being detected and marked", 
                    booking.Id, conflictCount);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check conflicts after creating booking {BookingId}", booking.Id);
            // Don't fail the booking creation, just log the error
        }

        // Auto-update space status after booking creation
        try
        {
            await _spaceService.UpdateSpaceAutoStatusAsync(booking.SpaceId);
            _logger.LogInformation("Auto-updated space status for SpaceId: {SpaceId} after booking creation", booking.SpaceId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to auto-update space status for SpaceId: {SpaceId} after booking creation", booking.SpaceId);
            // Don't fail the main operation, just log the error
        }


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
        
        // Check and update overdue status for all bookings before mapping
        await CheckAndMarkOverdueBookingsAsync(bookings);
        
        // Check for conflicts and mark them automatically
        var conflictCount = await CheckAndMarkConflictBookingsAsync(bookings);
        if (conflictCount > 0)
        {
            _logger.LogInformation("Automatically detected and marked {ConflictCount} conflict bookings for space {SpaceId}", 
                conflictCount, spaceId);
        }
        
        var bookingDtos = _mapper.Map<IEnumerable<BookingDto>>(bookings).ToList();
        
        // Enrich booking DTOs with user information and email fallback
        foreach (var bookingDto in bookingDtos)
        {
            // Set user full name if available
            if (bookingDto.UserId.HasValue)
            {
                try
                {
                    var user = await _userService.GetUserByIdAsync(bookingDto.UserId.Value);
                    if (user != null)
                    {
                        // Set user full name
                        bookingDto.UserFullName = user.FullName ?? user.Username;
                        
                        // If NotificationEmail is null or empty, fallback to user email
                        if (string.IsNullOrWhiteSpace(bookingDto.NotificationEmail) && !string.IsNullOrWhiteSpace(user.Email))
                        {
                            bookingDto.NotificationEmail = user.Email;
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get user info for booking {BookingId}, user {UserId}", 
                        bookingDto.Id, bookingDto.UserId);
                }
            }
        }
        
        return bookingDtos;
        // Không cần làm giàu BookerUsername ở đây vì đây là Owner xem, họ quan tâm ai đặt chứ không phải tên của chính họ.
    }

    // Method for internal use without permission checks (used by OwnerCustomersController)
    public async Task<IEnumerable<BookingDto>> GetBookingsBySpaceIdAsync(Guid spaceId)
    {
        _logger.LogInformation("Fetching bookings for SpaceId: {SpaceId} (internal)", spaceId);

        var bookings = await _bookingRepository.GetBySpaceIdAsync(spaceId);
        
        // Check and update overdue status for all bookings before mapping
        await CheckAndMarkOverdueBookingsAsync(bookings);
        
        var bookingDtos = _mapper.Map<IEnumerable<BookingDto>>(bookings).ToList();
        
        return bookingDtos;
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
            
            // Auto-update space status after booking cancellation
            try
            {
                await _spaceService.UpdateSpaceAutoStatusAsync(booking.SpaceId);
                _logger.LogInformation("Auto-updated space status for SpaceId: {SpaceId} after booking cancellation", booking.SpaceId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to auto-update space status for SpaceId: {SpaceId} after booking cancellation", booking.SpaceId);
                // Don't fail the main operation, just log the error
            }
            
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
        string errorMessage = string.Empty;

        switch (booking.Status)
        {
            case BookingStatus.Pending:
                if (request.NewStatus != BookingStatus.Confirmed && 
                    request.NewStatus != BookingStatus.Cancelled)
                    errorMessage = $"Cannot change status from Pending to {request.NewStatus}. Allowed: Confirmed, Cancelled.";
                break;
            case BookingStatus.Confirmed:
                if (request.NewStatus != BookingStatus.CheckedIn && 
                    request.NewStatus != BookingStatus.Cancelled && 
                    request.NewStatus != BookingStatus.NoShow &&
                    request.NewStatus != BookingStatus.Completed &&
                    request.NewStatus != BookingStatus.Abandoned) // Allow manual abandon for emergencies
                    errorMessage = $"Cannot change status from Confirmed to {request.NewStatus}. Allowed: CheckedIn, Cancelled, NoShow, Completed, Abandoned.";
                break;
            case BookingStatus.CheckedIn:
                if (request.NewStatus != BookingStatus.Checkout &&
                    request.NewStatus != BookingStatus.Completed && 
                    request.NewStatus != BookingStatus.Cancelled &&
                    request.NewStatus != BookingStatus.Abandoned) // Allow manual abandon for emergencies
                    errorMessage = $"Cannot change status from CheckedIn to {request.NewStatus}. Allowed: Checkout, Completed, Cancelled, Abandoned. Note: Overdue states are set automatically.";
                break;
            case BookingStatus.Checkout:
                if (request.NewStatus != BookingStatus.Completed && 
                    request.NewStatus != BookingStatus.Cancelled &&
                    request.NewStatus != BookingStatus.Abandoned) // Allow manual abandon for emergencies
                    errorMessage = $"Cannot change status from Checkout to {request.NewStatus}. Allowed: Completed, Cancelled, Abandoned.";
                break;
            case BookingStatus.OverduePending:
                if (request.NewStatus != BookingStatus.Confirmed &&
                    request.NewStatus != BookingStatus.CheckedIn &&
                    request.NewStatus != BookingStatus.Cancelled) // Allow skip to CheckedIn
                    errorMessage = $"Cannot change status from OverduePending to {request.NewStatus}. Allowed: Confirmed, CheckedIn, Cancelled.";
                break;
            case BookingStatus.OverdueCheckin:
                if (request.NewStatus != BookingStatus.CheckedIn &&
                    request.NewStatus != BookingStatus.NoShow &&
                    request.NewStatus != BookingStatus.Cancelled) // Allow cancellation even when overdue
                    errorMessage = $"Cannot change status from OverdueCheckin to {request.NewStatus}. Allowed: CheckedIn, NoShow, Cancelled.";
                break;
            case BookingStatus.OverdueCheckout:
                if (request.NewStatus != BookingStatus.Checkout &&
                    request.NewStatus != BookingStatus.Abandoned &&
                    request.NewStatus != BookingStatus.Cancelled) // Allow cancellation even when overdue
                    errorMessage = $"Cannot change status from OverdueCheckout to {request.NewStatus}. Allowed: Checkout, Abandoned, Cancelled.";
                break;
            case BookingStatus.Completed:
            case BookingStatus.Cancelled:
            case BookingStatus.NoShow:
                // These are final states - but allow manual abandon in special cases
                if (request.NewStatus == BookingStatus.Abandoned)
                {
                    // Allow transition to Abandoned for administrative purposes
                    break;
                }
                errorMessage = $"Booking with status {booking.Status} is in a final state and generally cannot be updated. Only Abandoned status is allowed for administrative purposes.";
                break;
            case BookingStatus.Abandoned:
                errorMessage = $"Booking with status {booking.Status} is final and cannot be updated.";
                break;
            case BookingStatus.External:
                errorMessage = $"Booking with status {booking.Status} requires special handling and cannot be updated via this method.";
                break;
            case BookingStatus.Conflict:
                // Allow specific transitions from Conflict status for resolution
                if (request.NewStatus != BookingStatus.Confirmed && request.NewStatus != BookingStatus.Cancelled)
                {
                    errorMessage = $"Booking with status {booking.Status} can only be resolved to Confirmed or Cancelled status.";
                }
                break;
        }

        if (!string.IsNullOrEmpty(errorMessage))
        {
            _logger.LogWarning("UpdateBookingStatus: Invalid status transition for Booking {BookingId}. {ErrorMessage}", bookingId, errorMessage);
            throw new InvalidOperationException(errorMessage);
        }

        // Handle specific status transitions with appropriate business logic
        bool wasConfirmed = false; // Track if booking was confirmed to send email
        string statusUpdateReason = "";

        switch (request.NewStatus)
        {
            case BookingStatus.Confirmed when booking.Status == BookingStatus.Pending:
                booking.Status = BookingStatus.Confirmed;
                statusUpdateReason = "Confirmed by owner";
                wasConfirmed = true;
                break;
                
            case BookingStatus.Confirmed when booking.Status == BookingStatus.Conflict:
                booking.Status = BookingStatus.Confirmed;
                statusUpdateReason = "Conflict resolved - confirmed by owner";
                wasConfirmed = true;
                break;
                
            case BookingStatus.Cancelled:
                booking.Status = BookingStatus.Cancelled;
                booking.CancellationReason = request.Notes ?? "Cancelled by owner";
                statusUpdateReason = "Cancelled by owner";
                break;
                
            case BookingStatus.Abandoned:
                booking.Status = BookingStatus.Abandoned;
                booking.CancellationReason = request.Notes ?? "Abandoned due to emergency/technical issues";
                statusUpdateReason = "Marked as abandoned by owner";
                break;
                
            case BookingStatus.CheckedIn when booking.Status == BookingStatus.Confirmed:
                booking.Status = BookingStatus.CheckedIn;
                booking.ActualCheckIn = DateTime.UtcNow;
                booking.CheckedInByUserId = updaterUserId;
                statusUpdateReason = "Checked in by owner";
                break;
                
            case BookingStatus.CheckedIn when (booking.Status == BookingStatus.OverduePending || booking.Status == BookingStatus.OverdueCheckin):
                booking.Status = BookingStatus.CheckedIn;
                booking.ActualCheckIn = DateTime.UtcNow;
                booking.CheckedInByUserId = updaterUserId;
                statusUpdateReason = "Late check-in by owner";
                break;
                
            case BookingStatus.Checkout when booking.Status == BookingStatus.CheckedIn:
                booking.Status = BookingStatus.Checkout;
                booking.ActualCheckOut = DateTime.UtcNow;
                booking.CheckedOutByUserId = updaterUserId;
                statusUpdateReason = "Checked out by owner";
                break;
                
            case BookingStatus.Checkout when booking.Status == BookingStatus.OverdueCheckout:
                booking.Status = BookingStatus.Checkout;
                booking.ActualCheckOut = DateTime.UtcNow;
                booking.CheckedOutByUserId = updaterUserId;
                statusUpdateReason = "Late check-out by owner";
                break;
                
            case BookingStatus.Completed when booking.Status == BookingStatus.Checkout:
                booking.Status = BookingStatus.Completed;
                statusUpdateReason = "Completed by owner";
                break;
                
            case BookingStatus.Completed:
                booking.Status = BookingStatus.Completed;
                if (booking.ActualCheckOut == null)
                {
                    booking.ActualCheckOut = DateTime.UtcNow;
                    booking.CheckedOutByUserId = updaterUserId;
                }
                statusUpdateReason = "Completed by owner";
                break;
                
            case BookingStatus.NoShow when booking.Status == BookingStatus.Confirmed:
                booking.Status = BookingStatus.NoShow;
                statusUpdateReason = "Marked as no-show by owner";
                break;
                
            default:
                if (booking.Status != request.NewStatus)
                {
                    _logger.LogWarning("UpdateBookingStatus: Generic status update for Booking {BookingId} from {OldStatus} to {NewStatus} by {UpdaterId}. This might bypass specific business logic.",
                       bookingId, booking.Status, request.NewStatus, updaterUserId);
                    booking.Status = request.NewStatus;
                    statusUpdateReason = $"Status updated to {request.NewStatus}";
                }
                break;
        }

        // Update common fields for all status changes
        booking.UpdatedAt = DateTime.UtcNow;
        booking.UpdatedByUserId = updaterUserId;
        
        // Add status update note with additional notes if provided
        string noteText = $"[{statusUpdateReason} by {updaterUserId}]";
        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            noteText += $": {request.Notes}";
        }
        
        booking.NotesFromOwner = string.IsNullOrWhiteSpace(booking.NotesFromOwner)
            ? noteText
            : $"{booking.NotesFromOwner}\n{noteText}";

        _bookingRepository.Update(booking);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Status for BookingId: {BookingId} updated to {NewStatus} by UpdaterId: {UpdaterId}",
            bookingId, request.NewStatus, updaterUserId);

        // Auto-update space status after booking status change
        try
        {
            await _spaceService.UpdateSpaceAutoStatusAsync(booking.SpaceId);
            _logger.LogInformation("Auto-updated space status for SpaceId: {SpaceId} after booking status change", booking.SpaceId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to auto-update space status for SpaceId: {SpaceId} after booking status change", booking.SpaceId);
            // Don't fail the main operation, just log the error
        }

        // Auto-cancel conflicting bookings if this booking was confirmed
        List<Guid> cancelledBookingIds = new List<Guid>();
        if (wasConfirmed)
        {
            try 
            {
                cancelledBookingIds = await AutoCancelConflictingBookingsAsync(booking);
                if (cancelledBookingIds.Any())
                {
                    _logger.LogInformation("Auto-cancelled {Count} conflicting bookings when confirming booking {BookingId}", 
                        cancelledBookingIds.Count, bookingId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to auto-cancel conflicting bookings for confirmed booking {BookingId}", bookingId);
                // Don't fail the main operation, just log the error
            }
        }

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
        
        // Auto-update space status after check-in
        try
        {
            await _spaceService.UpdateSpaceAutoStatusAsync(booking.SpaceId);
            _logger.LogInformation("Auto-updated space status for SpaceId: {SpaceId} after check-in", booking.SpaceId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to auto-update space status for SpaceId: {SpaceId} after check-in", booking.SpaceId);
            // Don't fail the main operation, just log the error
        }
        
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
        
        // Auto-update space status after check-out
        try
        {
            await _spaceService.UpdateSpaceAutoStatusAsync(booking.SpaceId);
            _logger.LogInformation("Auto-updated space status for SpaceId: {SpaceId} after check-out", booking.SpaceId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to auto-update space status for SpaceId: {SpaceId} after check-out", booking.SpaceId);
            // Don't fail the main operation, just log the error
        }
        
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
        
        // Auto-update space status after marking as no-show
        try
        {
            await _spaceService.UpdateSpaceAutoStatusAsync(booking.SpaceId);
            _logger.LogInformation("Auto-updated space status for SpaceId: {SpaceId} after marking booking as no-show", booking.SpaceId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to auto-update space status for SpaceId: {SpaceId} after marking booking as no-show", booking.SpaceId);
            // Don't fail the main operation, just log the error
        }
        
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

        // Check space availability (không check conflict)
        if (!await IsSpaceAvailableForBookingAsync(request.SpaceId, request.StartTime, request.EndTime))
        {
            throw new InvalidOperationException($"The requested time slot for space '{space.Name}' does not meet booking criteria (time, duration, operating hours).");
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

        // Check for conflicts with this new booking and mark conflicts if any exist
        try
        {
            var spaceBookings = await _bookingRepository.GetBySpaceIdAsync(booking.SpaceId);
            var conflictCount = await CheckAndMarkConflictBookingsAsync(spaceBookings);
            if (conflictCount > 0)
            {
                _logger.LogInformation("New owner booking {BookingId} creation resulted in {ConflictCount} conflicts being detected and marked", 
                    booking.Id, conflictCount);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check conflicts after creating owner booking {BookingId}", booking.Id);
            // Don't fail the booking creation, just log the error
        }

        // Send booking confirmation email to customer
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

            if (!string.IsNullOrWhiteSpace(notificationEmail) && !string.IsNullOrWhiteSpace(customerName) && booking.Space != null)
            {
                // Get owner email from space
                var ownerUser = await _userService.GetUserByIdAsync(space.OwnerId);
                var ownerEmail = ownerUser?.Email ?? "support@workingspace.com";

                // Format dates for email
                var startTimeLocal = ConvertToVietnamTime(booking.StartTime);
                var endTimeLocal = ConvertToVietnamTime(booking.EndTime);
                var startTimeStr = startTimeLocal.ToString("dd/MM/yyyy HH:mm");
                var endTimeStr = endTimeLocal.ToString("dd/MM/yyyy HH:mm");
                var checkInTimeStr = startTimeLocal.ToString("dd/MM/yyyy HH:mm");

                // Send confirmation email (not cancellation!)
                await _emailService.SendBookingConfirmationEmailAsync(
                    toEmail: notificationEmail,
                    customerName: customerName,
                    spaceName: booking.Space?.Name ?? "Unknown Space",
                    startTime: startTimeStr,
                    endTime: endTimeStr,
                    checkInTime: checkInTimeStr,
                    ownerEmail: ownerEmail,
                    bookingCode: booking.Id.ToString("N")[..8].ToUpper()
                );

                _logger.LogInformation("Sent confirmation email to {Email} for owner booking {BookingId}", 
                    notificationEmail, booking.Id);
            }
            else
            {
                _logger.LogWarning("Could not send confirmation email for owner booking {BookingId} - missing email or customer name", 
                    booking.Id);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send confirmation email for owner booking {BookingId}", booking.Id);
            // Don't fail the entire operation, just log the error
        }

        // Auto-update space status after owner booking creation
        try
        {
            await _spaceService.UpdateSpaceAutoStatusAsync(booking.SpaceId);
            _logger.LogInformation("Auto-updated space status for SpaceId: {SpaceId} after owner booking creation", booking.SpaceId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to auto-update space status for SpaceId: {SpaceId} after owner booking creation", booking.SpaceId);
            // Don't fail the main operation, just log the error
        }

        // Get booking with space details and return
        var createdBookingWithDetails = await _bookingRepository.GetByIdAsync(booking.Id);
        if (createdBookingWithDetails == null)
        {
            throw new Exception("Owner booking was created but could not be retrieved.");
        }
        return _mapper.Map<BookingDto>(createdBookingWithDetails);
    }

    /// <summary>
    /// Generate a simple timeline showing available and conflicted time slots for email
    /// </summary>
    private async Task<string> GenerateTimelineForEmailAsync(Booking cancelledBooking)
    {
        try
        {
            // Get booking date in Vietnam time
            var bookingDate = ConvertToVietnamTime(cancelledBooking.StartTime).Date;
            var dayStart = new DateTime(bookingDate.Year, bookingDate.Month, bookingDate.Day, 0, 0, 0, DateTimeKind.Unspecified);
            var dayEnd = dayStart.AddDays(1).AddTicks(-1);
            
            // Convert to UTC for database query
            var utcDayStart = TimeZoneInfo.ConvertTimeToUtc(dayStart, VietnamTimeZone);
            var utcDayEnd = TimeZoneInfo.ConvertTimeToUtc(dayEnd, VietnamTimeZone);
            
            // Get all bookings for the same space on the same day
            var spaceBookings = await _bookingRepository.GetBySpaceIdAsync(cancelledBooking.SpaceId);
            var activeBookings = spaceBookings.Where(b => 
                b.Status != BookingStatus.Cancelled && 
                b.Status != BookingStatus.NoShow && 
                b.Status != BookingStatus.Abandoned &&
                b.Id != cancelledBooking.Id && // Exclude the cancelled booking itself
                b.StartTime >= utcDayStart && b.StartTime < utcDayEnd // Filter by day
            ).OrderBy(b => b.StartTime).ToList();

            var timeline = new StringBuilder();
            timeline.AppendLine($"Ngày {bookingDate:dd/MM/yyyy}:");
            timeline.AppendLine();

            // Generate hourly timeline from 6 AM to 11 PM
            for (int hour = 6; hour <= 23; hour++)
            {
                var hourStart = new DateTime(bookingDate.Year, bookingDate.Month, bookingDate.Day, hour, 0, 0);
                var hourEnd = hourStart.AddHours(1);
                
                // Convert to UTC for comparison
                var utcHourStart = TimeZoneInfo.ConvertTimeToUtc(hourStart, VietnamTimeZone);
                var utcHourEnd = TimeZoneInfo.ConvertTimeToUtc(hourEnd, VietnamTimeZone);
                
                // Check if this hour overlaps with any active booking
                bool hasConflict = activeBookings.Any(b => 
                    b.StartTime < utcHourEnd && b.EndTime > utcHourStart);
                
                // Check if cancelled booking was in this time slot
                bool wasCancelledBookingHere = cancelledBooking.StartTime < utcHourEnd && 
                                             cancelledBooking.EndTime > utcHourStart;
                
                var timeStr = $"{hour:D2}:00";
                var status = hasConflict ? "🔴" : "🟢";
                var statusText = hasConflict ? "Đã đặt" : "Trống";
                
                if (wasCancelledBookingHere)
                {
                    statusText += " (booking bị hủy)";
                }
                
                timeline.AppendLine($"{timeStr} {status} {statusText}");
            }

            return timeline.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate timeline for cancelled booking {BookingId}", cancelledBooking.Id);
            return ""; // Return empty string if generation fails
        }
    }

    /// <summary>
    /// Check and update booking status to Overdue if conditions are met
    /// </summary>
    /// <param name="booking">The booking to check</param>
    /// <returns>True if status was updated to Overdue</returns>
    private bool CheckAndMarkOverdue(Booking booking)
    {
        var now = DateTime.UtcNow;
        var vietnamNow = ConvertToVietnamTime(now);
        
        // Check for test bookings (no StartTime/EndTime) and auto-cancel them
        if (booking.StartTime == DateTime.MinValue || booking.EndTime == DateTime.MinValue || 
            booking.StartTime == default(DateTime) || booking.EndTime == default(DateTime))
        {
            booking.Status = BookingStatus.Cancelled;
            booking.UpdatedAt = now;
            booking.CancellationReason = "Auto-cancelled: Test booking without valid time range";
            booking.NotesFromOwner = string.IsNullOrWhiteSpace(booking.NotesFromOwner)
                ? "[Auto-cancelled: Test booking without valid time range]"
                : $"{booking.NotesFromOwner}\n[Auto-cancelled: Test booking without valid time range]";
            
            _logger.LogInformation("Booking {BookingId} automatically cancelled: Test booking without valid time range", 
                booking.Id);
            
            return true;
        }
        
        var localStartTime = ConvertToVietnamTime(booking.StartTime);
        var localEndTime = ConvertToVietnamTime(booking.EndTime);
        
        bool shouldMarkOverdue = false;
        string overdueReason = "";

        switch (booking.Status)
        {
            case BookingStatus.Pending:
                // If booking is still pending but end time has passed, mark as overdue
                if (vietnamNow > localEndTime)
                {
                    shouldMarkOverdue = true;
                    booking.Status = BookingStatus.OverduePending;
                    overdueReason = "Pending quá hạn - Booking expired without confirmation";
                }
                break;
                
            case BookingStatus.Confirmed:
                // If confirmed but start time has passed significantly (e.g., 30 minutes) without check-in
                if (vietnamNow > localStartTime.AddMinutes(30))
                {
                    shouldMarkOverdue = true;
                    booking.Status = BookingStatus.OverdueCheckin;
                    overdueReason = "Confirmed quá hạn - No-show: Failed to check-in within 30 minutes of start time";
                }
                break;
                
            case BookingStatus.CheckedIn:
                // If checked in but end time has passed significantly (e.g., 15 minutes) without check-out
                if (vietnamNow > localEndTime.AddMinutes(15))
                {
                    shouldMarkOverdue = true;
                    booking.Status = BookingStatus.OverdueCheckout;
                    overdueReason = "CheckedIn quá hạn - Overstayed: Failed to check-out within 15 minutes of end time";
                }
                break;
        }

        if (shouldMarkOverdue)
        {
            booking.UpdatedAt = now;
            booking.NotesFromOwner = string.IsNullOrWhiteSpace(booking.NotesFromOwner)
                ? $"[Auto-marked as overdue: {overdueReason}]"
                : $"{booking.NotesFromOwner}\n[Auto-marked as overdue: {overdueReason}]";
            
            _logger.LogInformation("Booking {BookingId} automatically marked as overdue: {Reason}", 
                booking.Id, overdueReason);
            
            return true;
        }

        return false;
    }

    /// <summary>
    /// Check and update booking status to Overdue for multiple bookings
    /// </summary>
    /// <param name="bookings">List of bookings to check</param>
    /// <returns>Number of bookings marked as overdue</returns>
    public async Task<int> CheckAndMarkOverdueBookingsAsync(IEnumerable<Booking> bookings)
    {
        int overdueCount = 0;
        var bookingsToUpdate = new List<Booking>();

        foreach (var booking in bookings)
        {
            if (CheckAndMarkOverdue(booking))
            {
                bookingsToUpdate.Add(booking);
                overdueCount++;
            }
        }

        if (bookingsToUpdate.Any())
        {
            foreach (var booking in bookingsToUpdate)
            {
                _bookingRepository.Update(booking);
            }
            await _dbContext.SaveChangesAsync();
            
            _logger.LogInformation("Automatically marked {Count} bookings as overdue", overdueCount);
            
            // Auto-update space status for all affected spaces
            var affectedSpaceIds = bookingsToUpdate.Select(b => b.SpaceId).Distinct();
            foreach (var spaceId in affectedSpaceIds)
            {
                try
                {
                    await _spaceService.UpdateSpaceAutoStatusAsync(spaceId);
                    _logger.LogInformation("Auto-updated space status for SpaceId: {SpaceId} after marking bookings as overdue", spaceId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to auto-update space status for SpaceId: {SpaceId} after marking bookings as overdue", spaceId);
                    // Don't fail the main operation, just log the error
                }
            }
        }

        return overdueCount;
    }

    /// <summary>
    /// Check for conflicts and mark pending bookings as conflict if they overlap with confirmed bookings
    /// </summary>
    /// <param name="bookings">List of bookings to check for conflicts</param>
    /// <returns>Number of bookings marked as conflict</returns>
    public async Task<int> CheckAndMarkConflictBookingsAsync(IEnumerable<Booking> bookings)
    {
        int conflictCount = 0;
        var bookingsToUpdate = new List<Booking>();
        var bookingsList = bookings.ToList();

        // Get pending bookings that might have conflicts
        var pendingBookings = bookingsList.Where(b => b.Status == BookingStatus.Pending).ToList();
        
        foreach (var pendingBooking in pendingBookings)
        {
            // Check if this pending booking conflicts with any confirmed/active bookings
            var conflictingBookings = bookingsList.Where(b => 
                b.Id != pendingBooking.Id && 
                b.SpaceId == pendingBooking.SpaceId &&
                (b.Status == BookingStatus.Confirmed || 
                 b.Status == BookingStatus.CheckedIn || 
                 b.Status == BookingStatus.Checkout ||
                 b.Status == BookingStatus.OverdueCheckin ||
                 b.Status == BookingStatus.OverdueCheckout) &&
                DoBookingsOverlap(pendingBooking, b)
            ).ToList();

            if (conflictingBookings.Any())
            {
                pendingBooking.Status = BookingStatus.Conflict;
                pendingBooking.UpdatedAt = DateTime.UtcNow;
                
                // Add conflict details to notes

                var conflictDetails = string.Join(", ", conflictingBookings.Select(cb => 
                    $"ID:{cb.Id.ToString("N")[..8]} ({ConvertToVietnamTime(cb.StartTime):dd/MM/yyyy HH:mm}-{ConvertToVietnamTime(cb.EndTime):HH:mm})"));
                
                var conflictNote = $"[Auto-marked as conflict: Overlaps with {conflictingBookings.Count} booking(s) - {conflictDetails}]";
                pendingBooking.NotesFromOwner = string.IsNullOrWhiteSpace(pendingBooking.NotesFromOwner)
                    ? conflictNote
                    : $"{pendingBooking.NotesFromOwner}\n{conflictNote}";
                
                bookingsToUpdate.Add(pendingBooking);
                conflictCount++;
                
                _logger.LogInformation("Booking {BookingId} marked as conflict due to overlap with {ConflictCount} other bookings", 
                    pendingBooking.Id, conflictingBookings.Count);
            }
        }

        if (bookingsToUpdate.Any())
        {
            foreach (var booking in bookingsToUpdate)
            {
                _bookingRepository.Update(booking);
            }
            await _dbContext.SaveChangesAsync();
            
            _logger.LogInformation("Automatically marked {Count} bookings as conflict", conflictCount);
            
            // Auto-update space status for all affected spaces
            var affectedSpaceIds = bookingsToUpdate.Select(b => b.SpaceId).Distinct();
            foreach (var spaceId in affectedSpaceIds)
            {
                try
                {
                    await _spaceService.UpdateSpaceAutoStatusAsync(spaceId);
                    _logger.LogInformation("Auto-updated space status for SpaceId: {SpaceId} after marking bookings as conflict", spaceId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to auto-update space status for SpaceId: {SpaceId} after marking bookings as conflict", spaceId);
                    // Don't fail the main operation, just log the error
                }
            }
        }

        return conflictCount;
    }

    /// <summary>
    /// Check if two bookings overlap in time (considering buffer and cleaning time)
    /// </summary>
    private bool DoBookingsOverlap(Booking booking1, Booking booking2)
    {
        // For conflict detection, we need to consider buffer and cleaning time
        // Get the space details if we need buffer/cleaning info, for now use simple overlap
        var start1 = booking1.StartTime;
        var end1 = booking1.EndTime;
        var start2 = booking2.StartTime;
        var end2 = booking2.EndTime;

        // Simple overlap check: booking1 starts before booking2 ends AND booking2 starts before booking1 ends
        return start1 < end2 && start2 < end1;
    }

    /// <summary>
    /// Auto-cancel conflicting bookings when owner confirms a conflict booking
    /// </summary>
    /// <param name="confirmedBooking">The booking that was confirmed</param>
    /// <returns>List of cancelled booking IDs</returns>
    public async Task<List<Guid>> AutoCancelConflictingBookingsAsync(Booking confirmedBooking)
    {
        var cancelledBookingIds = new List<Guid>();
        
        // Get all bookings for the same space
        var spaceBookings = await _bookingRepository.GetBySpaceIdAsync(confirmedBooking.SpaceId);
        
        // Find bookings that conflict with the confirmed booking
        var conflictingBookings = spaceBookings.Where(b => 
            b.Id != confirmedBooking.Id && 
            (b.Status == BookingStatus.Pending || 
             b.Status == BookingStatus.Conflict ||
             b.Status == BookingStatus.Confirmed ||
             b.Status == BookingStatus.CheckedIn ||
             b.Status == BookingStatus.Checkout) &&
            DoBookingsOverlap(confirmedBooking, b)
        ).ToList();

        foreach (var conflictingBooking in conflictingBookings)
        {
            conflictingBooking.Status = BookingStatus.Cancelled;
            conflictingBooking.UpdatedAt = DateTime.UtcNow;
            conflictingBooking.CancellationReason = "Auto-cancelled due to time conflict with confirmed booking";
            
            var cancelNote = $"[Auto-cancelled: Conflicts with confirmed booking {confirmedBooking.Id.ToString("N")[..8]}]";
            conflictingBooking.NotesFromOwner = string.IsNullOrWhiteSpace(conflictingBooking.NotesFromOwner)
                ? cancelNote
                : $"{conflictingBooking.NotesFromOwner}\n{cancelNote}";
            
            _bookingRepository.Update(conflictingBooking);
            cancelledBookingIds.Add(conflictingBooking.Id);
            
            _logger.LogInformation("Auto-cancelled booking {BookingId} due to conflict with confirmed booking {ConfirmedBookingId}", 
                conflictingBooking.Id, confirmedBooking.Id);
        }

        if (cancelledBookingIds.Any())
        {
            await _dbContext.SaveChangesAsync();
            
            // Auto-update space status after auto-cancelling conflicting bookings
            try
            {
                await _spaceService.UpdateSpaceAutoStatusAsync(confirmedBooking.SpaceId);
                _logger.LogInformation("Auto-updated space status for SpaceId: {SpaceId} after auto-cancelling conflicting bookings", confirmedBooking.SpaceId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to auto-update space status for SpaceId: {SpaceId} after auto-cancelling conflicting bookings", confirmedBooking.SpaceId);
                // Don't fail the main operation, just log the error
            }
            
            // Send cancellation emails to affected users
            await SendCancellationEmailsAsync(conflictingBookings);
        }

        return cancelledBookingIds;
    }

    /// <summary>
    /// Send cancellation emails to users whose bookings were cancelled due to conflicts
    /// </summary>
    private async Task SendCancellationEmailsAsync(List<Booking> cancelledBookings)
    {
        foreach (var booking in cancelledBookings)
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

                if (!string.IsNullOrWhiteSpace(notificationEmail) && !string.IsNullOrWhiteSpace(customerName) && booking.Space != null)
                {
                    // Get owner email from space
                    var ownerUser = await _userService.GetUserByIdAsync(booking.Space.OwnerId);
                    var ownerEmail = ownerUser?.Email ?? "support@workingspace.com";

                    // Format dates for email
                    var startTimeLocal = ConvertToVietnamTime(booking.StartTime);
                    var endTimeLocal = ConvertToVietnamTime(booking.EndTime);
                    var startTimeStr = startTimeLocal.ToString("dd/MM/yyyy HH:mm");
                    var endTimeStr = endTimeLocal.ToString("dd/MM/yyyy HH:mm");

                    // Generate timeline for this booking
                    var timeline = await GenerateTimelineForEmailAsync(booking);

                    // Send cancellation email
                    await _emailService.SendBookingCancellationEmailAsync(
                        notificationEmail,
                        customerName,
                        booking.Space?.Name ?? "Unknown Space",
                        startTimeStr,
                        endTimeStr,
                        booking.CancellationReason ?? "Conflict with another booking",
                        ownerEmail,
                        booking.Id.ToString("N")[..8].ToUpper(),
                        timeline
                    );

                    _logger.LogInformation("Sent cancellation email to {Email} for booking {BookingId}", 
                        notificationEmail, booking.Id);
                }
                else
                {
                    _logger.LogWarning("Could not send cancellation email for booking {BookingId} - missing email or customer name", 
                        booking.Id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send cancellation email for booking {BookingId}", booking.Id);
                // Don't fail the entire operation, just log the error
            }
        }
    }
}