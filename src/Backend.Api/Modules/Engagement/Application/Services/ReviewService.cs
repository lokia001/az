// File: Backend.Api/Modules/Engagement/Application/Services/ReviewService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Backend.Api.Data;
using Backend.Api.Modules.Engagement.Application.Contracts.Dtos;
using Backend.Api.Modules.Engagement.Application.Contracts.Services;
using Backend.Api.Modules.Engagement.Domain.Entities;
using Backend.Api.Modules.Engagement.Domain.Interfaces.Repositories;
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories; // ISpaceRepository, IBookingRepository
using Backend.Api.SharedKernel.Dtos; // PagedResultDto
using Microsoft.Extensions.Logging;
using Backend.Api.Modules.SpaceBooking.Domain.Enums;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.Modules.UserRelated.Application.Contracts.Services; // Thêm using cho IUserLookupService

namespace Backend.Api.Modules.Engagement.Application.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly ISpaceRepository _spaceRepository; // Để kiểm tra Space tồn tại
        private readonly IBookingRepository _bookingRepository; // Để kiểm tra Booking tồn tại và user đã booking
        private readonly IMapper _mapper;
        private readonly AppDbContext _dbContext;
        private readonly ILogger<ReviewService> _logger;
        private readonly IUserLookupService _userLookupService;
        // private readonly IUserService _userService;

        public ReviewService(
            IReviewRepository reviewRepository,
            ISpaceRepository spaceRepository,
            IBookingRepository bookingRepository,
            IMapper mapper,
            AppDbContext dbContext,
            ILogger<ReviewService> logger,
            IUserLookupService userLookupService
            // IUserService userService
            )
        {
            _reviewRepository = reviewRepository;
            _spaceRepository = spaceRepository;
            _bookingRepository = bookingRepository;
            _mapper = mapper;
            _dbContext = dbContext;
            _logger = logger;
            _userLookupService = userLookupService;
            // _userService = userService;
        }

        public async Task<PagedResultDto<ReviewDto>> GetAllReviewsAsync(ReviewSearchCriteriaDto criteria)
        {
            _logger.LogInformation("Fetching all reviews with criteria: {@Criteria}", criteria);

            var query = _dbContext.Set<Review>().AsQueryable(); // HasQueryFilter sẽ tự động áp dụng !IsDeleted

            // Áp dụng thêm filter từ criteria nếu cần (ví dụ: MinRating, UserId, SpaceId nếu có trong criteria)
            if (criteria.UserId.HasValue) query = query.Where(r => r.UserId == criteria.UserId.Value);
            if (criteria.SpaceId.HasValue) query = query.Where(r => r.SpaceId == criteria.SpaceId.Value);
            if (criteria.MinRating.HasValue) query = query.Where(r => r.Rating >= criteria.MinRating.Value);


            var totalCount = await query.CountAsync();

            var reviews = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((criteria.PageNumber - 1) * criteria.PageSize)
                .Take(criteria.PageSize)
                .ToListAsync();

            var userIds = reviews.Select(r => r.UserId).Distinct().ToList();
            var userNames = await _userLookupService.GetUserNamesAsync(userIds);

            var reviewDtos = _mapper.Map<List<ReviewDto>>(reviews);
            foreach (var dto in reviewDtos)
            {
                dto.UserName = userNames.TryGetValue(dto.UserId, out var name) ? name : "Ẩn danh";
            }

            return new PagedResultDto<ReviewDto>(reviewDtos, criteria.PageNumber, criteria.PageSize, totalCount);
        }

        public async Task<ReviewDto> CreateReviewAsync(CreateReviewRequest request, Guid userId)
        {
            _logger.LogInformation("User {UserId} attempting to create review for Space {SpaceId}, Booking {BookingId}",
                userId, request.SpaceId, request.BookingId);

            // Nếu có BookingId, luôn lấy booking từ DB và ghi đè SpaceId
            if (request.BookingId.HasValue)
            {
                var booking = await _bookingRepository.GetByIdAsync(request.BookingId.Value);
                if (booking == null || booking.UserId != userId)
                {
                    throw new UnauthorizedAccessException("User is not authorized to review this booking.");
                }
                if (booking.Status != BookingStatus.Completed)
                {
                    throw new InvalidOperationException($"Booking {request.BookingId.Value} must be completed to be reviewed. Current status: {booking.Status}");
                }
                // Ghi đè SpaceId từ booking
                request.SpaceId = booking.SpaceId;
                if (await _reviewRepository.UserHasReviewedBookingAsync(request.BookingId.Value, userId))
                {
                    throw new InvalidOperationException("User has already reviewed this booking.");
                }
            }

            // 1. Kiểm tra Space tồn tại
            var space = await _spaceRepository.GetByIdAsync(request.SpaceId);
            if (space == null)
            {
                throw new KeyNotFoundException($"Space with ID {request.SpaceId} not found.");
            }

            // 2. Kiểm tra nghiệp vụ: User có quyền review không?
            // Ví dụ: User phải có booking đã hoàn thành cho Space này.
            if (request.BookingId.HasValue)
            {
                var booking = await _bookingRepository.GetByIdAsync(request.BookingId.Value);
                if (booking == null || booking.UserId != userId || booking.SpaceId != request.SpaceId)
                {
                    throw new UnauthorizedAccessException("User is not authorized to review this booking/space or booking does not match space.");
                }
                if (booking.Status != BookingStatus.Completed) // Chỉ cho review booking đã hoàn thành
                {
                    throw new InvalidOperationException($"Booking {request.BookingId.Value} must be completed to be reviewed. Current status: {booking.Status}");
                }

                // Kiểm tra xem user đã review booking này chưa
                if (await _reviewRepository.UserHasReviewedBookingAsync(request.BookingId.Value, userId))
                {
                    throw new InvalidOperationException("User has already reviewed this booking.");
                }
            }
            else
            {
                // Logic nếu cho phép review Space mà không cần BookingId cụ thể (ít phổ biến hơn)
                // Có thể kiểm tra xem user đã từng có booking nào hoàn thành cho space này không.
                // Hiện tại, nếu không có BookingId, sẽ bỏ qua kiểm tra này.
                _logger.LogWarning("Creating review for Space {SpaceId} without a specific BookingId.", request.SpaceId);
            }


            var review = _mapper.Map<Review>(request);
            review.UserId = userId;
            review.CreatedAt = DateTime.UtcNow;
            // SpaceId đã được map từ DTO

            await _reviewRepository.AddAsync(review);
            await _dbContext.SaveChangesAsync();

            // Lấy userName
            var userNames = await _userLookupService.GetUserNamesAsync(new[] { userId });
            var reviewDto = _mapper.Map<ReviewDto>(review);
            reviewDto.UserName = userNames.TryGetValue(userId, out var name) ? name : "Ẩn danh";
            // Đảm bảo commentText đúng (nếu mapping tự động không đúng)
            if (string.IsNullOrEmpty(reviewDto.CommentText) && !string.IsNullOrEmpty(request.CommentText))
                reviewDto.CommentText = request.CommentText;

            _logger.LogInformation("Review {ReviewId} created successfully by User {UserId} for Space {SpaceId}",
                review.Id, userId, request.SpaceId);

            return _mapper.Map<ReviewDto>(review);
        }

        public async Task<ReviewDto?> GetReviewByIdAsync(Guid reviewId)
        {
            _logger.LogInformation("Fetching review by ID: {ReviewId}", reviewId);
            var review = await _reviewRepository.GetByIdAsync(reviewId);
            // ReviewConfiguration đã có HasQueryFilter(!r.IsDeleted)
            return _mapper.Map<ReviewDto>(review);
        }

        public async Task<PagedResultDto<ReviewDto>> GetReviewsForSpaceAsync(Guid spaceId, ReviewSearchCriteriaDto criteria)
        {
            // Ghi đè spaceId từ criteria bằng spaceId từ path param để đảm bảo đúng
            criteria.SpaceId = spaceId;

            // Kiểm tra Space tồn tại
            var spaceExists = await _dbContext.Set<Space>().AnyAsync(s => s.Id == criteria.SpaceId.Value && !s.IsDeleted);
            if (!spaceExists)
            {
                throw new KeyNotFoundException($"Space with ID {criteria.SpaceId.Value} not found.");
            }

            var query = _dbContext.Set<Review>().AsQueryable();

            // Filter theo SpaceId (bắt buộc)
            query = query.Where(r => r.SpaceId == criteria.SpaceId.Value);

            // Filter theo UserId (nếu có trong criteria)
            if (criteria.UserId.HasValue)
            {
                query = query.Where(r => r.UserId == criteria.UserId.Value);
            }

            // Filter theo MinRating (nếu có trong criteria)
            if (criteria.MinRating.HasValue)
            {
                query = query.Where(r => r.Rating >= criteria.MinRating.Value);
            }

            var totalCount = await query.CountAsync();

            var reviews = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((criteria.PageNumber - 1) * criteria.PageSize)
                .Take(criteria.PageSize)
                .ToListAsync();

            // Lấy user name cho từng review
            var userIds = reviews.Select(r => r.UserId).Distinct().ToList();
            var userNames = await _userLookupService.GetUserNamesAsync(userIds);

            var reviewDtos = _mapper.Map<List<ReviewDto>>(reviews);
            foreach (var dto in reviewDtos)
            {
                dto.UserName = userNames.TryGetValue(dto.UserId, out var name) ? name : "Ẩn danh";
            }

            return new PagedResultDto<ReviewDto>(reviewDtos, criteria.PageNumber, criteria.PageSize, totalCount);
        }

        public async Task<IEnumerable<ReviewDto>> GetReviewsByUserAsync(Guid userId)
        {
            _logger.LogInformation("Fetching reviews by User {UserId}", userId);
            var reviews = await _reviewRepository.GetByUserIdAsync(userId); // Repository sẽ trả về các review chưa bị soft delete
            return _mapper.Map<IEnumerable<ReviewDto>>(reviews);
        }

        public async Task<ReviewDto?> UpdateReviewAsync(Guid reviewId, UpdateReviewRequest request, Guid userId)
        {
            _logger.LogInformation("User {UserId} attempting to update Review {ReviewId}", userId, reviewId);

            // Lấy review hiện tại từ repository.
            // GetByIdAsync của repository không nên tự động lọc IsDeleted nếu admin/mod có thể sửa review đã bị ẩn (ít phổ biến).
            // Hiện tại, ReviewConfiguration có HasQueryFilter, nên GetByIdAsync sẽ không trả về review đã IsDeleted.
            // Điều này có nghĩa là user không thể update review đã bị soft delete. OK.
            var review = await _reviewRepository.GetByIdAsync(reviewId);

            if (review == null) // HasQueryFilter đã lọc IsDeleted
            {
                _logger.LogWarning("UpdateReviewAsync: Review {ReviewId} not found or already deleted, cannot be updated by User {UserId}.", reviewId, userId);
                return null; // Hoặc throw KeyNotFoundException
            }

            // Kiểm tra quyền: Chỉ người viết review mới được sửa.
            // SysAdmin hoặc Moderator của Space có thể có quyền sửa/xóa review không? (Hiện tại là không)
            if (review.UserId != userId)
            {
                _logger.LogWarning("User {UserId} is not authorized to update Review {ReviewId} (Author: {AuthorId}).", userId, reviewId, review.UserId);
                throw new UnauthorizedAccessException("User is not authorized to update this review.");
            }

            // Áp dụng các thay đổi từ DTO vào entity
            // UpdateReviewRequest chỉ có Rating và CommentText
            bool changed = false;
            if (review.Rating != request.Rating)
            {
                review.Rating = request.Rating;
                changed = true;
            }
            if (review.CommentText != request.CommentText) // So sánh cả trường hợp null
            {
                review.CommentText = request.CommentText;
                changed = true;
            }

            if (changed)
            {
                review.UpdatedAt = DateTime.UtcNow;
                // review.UpdatedByUserId = userId; // Nếu Review entity có trường này

                _reviewRepository.Update(review); // Đánh dấu entity là modified
                await _dbContext.SaveChangesAsync();
                _logger.LogInformation("Review {ReviewId} updated successfully by User {UserId}.", reviewId, userId);
            }
            else
            {
                _logger.LogInformation("Review {ReviewId} no changes detected for update by User {UserId}.", reviewId, userId);
            }

            return _mapper.Map<ReviewDto>(review); // Trả về DTO của review (dù có thay đổi hay không)
        }

        public async Task<bool> DeleteReviewAsync(Guid reviewId, Guid userId)
        {
            _logger.LogInformation("User {UserId} attempting to delete Review {ReviewId}", userId, reviewId);

            // Lấy review, bỏ qua Global Query Filter để có thể "xóa lại" hoặc xử lý đúng nếu đã IsDeleted
            var review = await _dbContext.Set<Review>()
                                     .IgnoreQueryFilters() // Quan trọng để admin/mod có thể xóa review đã bị ẩn (nếu logic cho phép)
                                     .FirstOrDefaultAsync(r => r.Id == reviewId);

            if (review == null)
            {
                _logger.LogWarning("DeleteReviewAsync: Review {ReviewId} not found for deletion by User {UserId}.", reviewId, userId);
                return false; // Hoặc throw KeyNotFoundException
            }

            // Nếu đã soft delete rồi, có thể coi như thành công hoặc báo lỗi tùy logic
            if (review.IsDeleted)
            {
                _logger.LogInformation("Review {ReviewId} was already soft-deleted. No action taken by User {UserId}.", reviewId, userId);
                return true; // Coi như đã xóa
            }

            // Kiểm tra quyền:
            // 1. Người viết review có thể tự xóa review của mình.
            // 2. Owner của Space có thể xóa review về Space của họ (cần inject ISpaceRepository và IUserService để kiểm tra).
            // 3. SysAdmin có thể xóa bất kỳ review nào (cần inject IUserService).
            // Hiện tại, chúng ta chỉ implement cho người viết review tự xóa.
            bool canDelete = false;
            if (review.UserId == userId) // Người viết tự xóa
            {
                canDelete = true;
            }
            // else
            // {
            //     // Kiểm tra nếu userId là Owner của Space mà review này thuộc về
            //     var space = await _spaceRepository.GetByIdAsync(review.SpaceId);
            //     if (space != null && space.OwnerId == userId)
            //     {
            //         canDelete = true;
            //     }
            //     // else if (await _userService.UserHasRoleAsync(userId, UserRole.SysAdmin)) // Kiểm tra SysAdmin
            //     // {
            //     //     canDelete = true;
            //     // }
            // }

            if (!canDelete)
            {
                _logger.LogWarning("User {UserId} is not authorized to delete Review {ReviewId} (Author: {AuthorId}).", userId, reviewId, review.UserId);
                throw new UnauthorizedAccessException("User is not authorized to delete this review.");
            }

            // Thực hiện Soft Delete
            review.IsDeleted = true;
            review.UpdatedAt = DateTime.UtcNow;
            // review.UpdatedByUserId = userId; // Nếu Review entity có trường này

            _reviewRepository.Update(review); // Đánh dấu entity là modified để IsDeleted được lưu
            var result = await _dbContext.SaveChangesAsync();

            if (result > 0)
            {
                _logger.LogInformation("Review {ReviewId} soft deleted successfully by User {UserId}.", reviewId, userId);
            }
            else
            {
                _logger.LogWarning("Review {ReviewId} soft delete by User {UserId} did not result in DB changes.", reviewId, userId);
            }
            return result > 0;
        }






    }
}