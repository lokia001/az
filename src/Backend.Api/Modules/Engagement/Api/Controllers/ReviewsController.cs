// File: Backend.Api/Modules/Engagement/Api/Controllers/ReviewsController.cs
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.Api.Modules.Engagement.Application.Contracts.Dtos;
using Backend.Api.Modules.Engagement.Application.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Modules.Engagement.Api.Controllers
{
    [ApiController]
    [Route("api/reviews")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        private readonly ILogger<ReviewsController> _logger;

        public ReviewsController(IReviewService reviewService, ILogger<ReviewsController> logger)
        {
            _reviewService = reviewService;
            _logger = logger;
        }

        // GET api/reviews
        [HttpGet] // Sẽ map tới route gốc của controller: "api/reviews"
        [AllowAnonymous] // Hoặc [Authorize(Roles="SysAdmin")] nếu chỉ admin được xem tất cả
        public async Task<IActionResult> GetAllReviews([FromQuery] ReviewSearchCriteriaDto criteria)
        {
            try
            {
                var pagedResult = await _reviewService.GetAllReviewsAsync(criteria);
                // pagedResult sẽ không bao giờ là null nếu service được implement đúng
                return Ok(pagedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetAllReviews: Error fetching all reviews with criteria {@Criteria}", criteria);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while fetching reviews.");
            }
        }

        // POST api/reviews (Tạo review mới)
        [HttpPost]
        [Authorize] // Yêu cầu đăng nhập để tạo review
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var reviewDto = await _reviewService.CreateReviewAsync(request, userId);
                // Trả về 201 Created với URI của resource mới và resource đó
                // Giả sử có endpoint GetReviewById (sẽ tạo bên dưới)
                return CreatedAtAction(nameof(GetReviewById), new { id = reviewDto.Id }, reviewDto);
            }
            catch (KeyNotFoundException ex) // Ví dụ: Space hoặc Booking không tồn tại
            {
                _logger.LogWarning(ex, "CreateReview: Resource not found for User {UserId}, Request: {@Request}", userIdString, request);
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex) // Ví dụ: User không có quyền review booking/space này
            {
                _logger.LogWarning(ex, "CreateReview: Unauthorized attempt by User {UserId}, Request: {@Request}", userIdString, request);
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (InvalidOperationException ex) // Ví dụ: Đã review booking này rồi, hoặc booking chưa completed
            {
                _logger.LogInformation(ex, "CreateReview: Invalid operation by User {UserId}, Request: {@Request}", userIdString, request);
                return BadRequest(new { message = ex.Message }); // Hoặc Conflict (409) nếu là "đã review"
            }
            catch (ArgumentException ex) // Input không hợp lệ khác
            {
                _logger.LogInformation(ex, "CreateReview: Argument exception by User {UserId}, Request: {@Request}", userIdString, request);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CreateReview: Unexpected error for User {UserId}, Request: {@Request}", userIdString, request);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating the review.");
            }
        }



        // GET api/reviews/{id}
        [HttpGet("{id:guid}", Name = "GetReviewById")]
        [AllowAnonymous] // Ai cũng có thể xem review
        public async Task<IActionResult> GetReviewById(Guid id)
        {
            var reviewDto = await _reviewService.GetReviewByIdAsync(id);
            if (reviewDto == null)
            {
                return NotFound(new { message = $"Review with ID {id} not found." });
            }
            return Ok(reviewDto);
        }

        // GET api/spaces/{spaceId}/reviews (Lấy review của một Space)
        // Route này có thể đặt ở SpacesController hoặc ở đây. Đặt ở đây cũng hợp lý.
        [HttpGet("/api/spaces/{spaceId:guid}/reviews")] // Route cụ thể hơn
        [AllowAnonymous]
        public async Task<IActionResult> GetReviewsForSpace(Guid spaceId, [FromQuery] ReviewSearchCriteriaDto criteria)
        {
            // Gán SpaceId từ route vào criteria nếu criteria không có
            criteria.SpaceId = spaceId;
            try
            {
                var pagedResult = await _reviewService.GetReviewsForSpaceAsync(spaceId, criteria);
                return Ok(pagedResult);
            }
            catch (KeyNotFoundException ex) // Space không tồn tại (service có thể throw)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetReviewsForSpace: Error for Space {SpaceId}, Criteria: {@Criteria}", spaceId, criteria);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while fetching reviews for the space.");
            }
        }

        // GET api/users/{userId}/reviews (Lấy review do một User viết)
        [HttpGet("/api/users/{userId:guid}/reviews")]
        [AllowAnonymous] // Hoặc [Authorize] nếu chỉ muốn user đó hoặc admin xem
        public async Task<IActionResult> GetReviewsByUser(Guid userId)
        {
            try
            {
                var reviews = await _reviewService.GetReviewsByUserAsync(userId);
                return Ok(reviews); // Service trả về IEnumerable<ReviewDto>
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetReviewsByUser: Error for User {UserId}", userId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while fetching user's reviews.");
            }
        }

        // PUT api/reviews/{id} (Cập nhật review)
        [HttpPut("{id:guid}")]
        [Authorize] // Chỉ người viết review mới được sửa
        public async Task<IActionResult> UpdateReview(Guid id, [FromBody] UpdateReviewRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var updatedReviewDto = await _reviewService.UpdateReviewAsync(id, request, userId);
                if (updatedReviewDto == null)
                {
                    return NotFound(new { message = $"Review with ID {id} not found for update." });
                }
                return Ok(updatedReviewDto);
            }
            // ... (Thêm các catch block: KeyNotFound, Unauthorized, Argument, Exception) ...
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message }); }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "UpdateReview: Error for Review {ReviewId} by User {UserId}", id, userIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error updating review.");
            }
        }

        // DELETE api/reviews/{id} (Xóa review)
        [HttpDelete("{id:guid}")]
        [Authorize] // Chỉ người viết review hoặc SysAdmin/Moderator của Space mới được xóa
        public async Task<IActionResult> DeleteReview(Guid id)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                // Service DeleteReviewAsync sẽ kiểm tra quyền
                var success = await _reviewService.DeleteReviewAsync(id, userId);
                if (!success)
                {
                    return NotFound(new { message = $"Review with ID {id} not found or deletion failed." });
                }
                return NoContent();
            }
            // ... (Thêm các catch block) ...
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message }); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DeleteReview: Error for Review {ReviewId} by User {UserId}", id, userIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error deleting review.");
            }
        }
    }

    [ApiController]
    [Route("api/bookings/{bookingId:guid}/reviews")]
    public class BookingReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        private readonly ILogger<BookingReviewsController> _logger;

        public BookingReviewsController(IReviewService reviewService, ILogger<BookingReviewsController> logger)
        {
            _reviewService = reviewService;
            _logger = logger;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReview(Guid bookingId, [FromBody] CreateReviewRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
                return Unauthorized(new { message = "Invalid user identifier in token." });

            // Gán bookingId vào request nếu cần
            request.BookingId = bookingId;

            try
            {
                var reviewDto = await _reviewService.CreateReviewAsync(request, userId);
                return CreatedAtAction(nameof(CreateReview), new { bookingId = bookingId, id = reviewDto.Id }, reviewDto);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "CreateReview: Resource not found for User {UserId}, Request: {@Request}", userIdString, request);
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CreateReview: Unexpected error for User {UserId}, Request: {@Request}", userIdString, request);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating the review.");
            }
        }
    }
}
