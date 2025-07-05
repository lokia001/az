// File: Backend.Api/Modules/SpaceBooking/Api/Controllers/BookingsController.cs
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Modules.SpaceBooking.Api.Controllers
{
    [ApiController]
    [Route("api/bookings")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly IBookingServiceService _bookingServiceService;
        private readonly ILogger<BookingsController> _logger;

        public BookingsController(
            IBookingService bookingService, 
            IBookingServiceService bookingServiceService,
            ILogger<BookingsController> logger)
        {
            _bookingService = bookingService;
            _bookingServiceService = bookingServiceService;
            _logger = logger;
        }

        // POST api/bookings
        [HttpPost]
        [Authorize] // Yêu cầu người dùng phải đăng nhập để đặt chỗ
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var bookingDto = await _bookingService.CreateBookingAsync(request, userId);
                // Trả về 201 Created với URI của resource mới và resource đó
                return CreatedAtAction(nameof(GetBookingById), new { id = bookingDto.Id }, bookingDto);
            }
            catch (KeyNotFoundException ex) // Ví dụ: Space không tồn tại
            {
                _logger.LogWarning("CreateBooking: Resource not found. Message: {Message}", ex.Message);
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex) // Ví dụ: Space không available, trùng lịch, không đáp ứng criteria
            {
                _logger.LogInformation("CreateBooking: Invalid operation. Message: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message }); // Hoặc Conflict (409) nếu là trùng lịch
            }
            catch (ArgumentException ex) // Ví dụ: StartTime >= EndTime
            {
                _logger.LogInformation("CreateBooking: Argument exception. Message: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CreateBooking: Unexpected error for UserId {UserId}, Request: {@Request}", userId, request);
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred while creating the booking.");
            }
        }

        // POST api/bookings/owner
        [HttpPost("owner")]
        [Authorize] // Owner phải đăng nhập
        public async Task<IActionResult> CreateOwnerBooking([FromBody] CreateOwnerBookingRequest request)
        {
            var ownerUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(ownerUserIdString, out var ownerUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var bookingDto = await _bookingService.CreateOwnerBookingAsync(request, ownerUserId);
                return CreatedAtAction(nameof(GetBookingById), new { id = bookingDto.Id }, bookingDto);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning("CreateOwnerBooking: Resource not found. Message: {Message}", ex.Message);
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("CreateOwnerBooking: Unauthorized. Message: {Message}", ex.Message);
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogInformation("CreateOwnerBooking: Invalid operation. Message: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogInformation("CreateOwnerBooking: Argument exception. Message: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CreateOwnerBooking: Unexpected error for OwnerId {OwnerId}, Request: {@Request}", ownerUserId, request);
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred while creating the owner booking.");
            }
        }

        // GET api/bookings/{id}
        [HttpGet("{id:guid}", Name = "GetBookingById")]
        [Authorize] // Người dùng đăng nhập mới được xem booking (cần logic kiểm tra quyền chi tiết hơn)
        public async Task<IActionResult> GetBookingById(Guid id)
        {
            var requestorUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(requestorUserIdString, out var requestorUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var bookingDto = await _bookingService.GetBookingByIdAsync(id, requestorUserId);
                if (bookingDto == null)
                {
                    return NotFound(new { message = $"Booking with ID {id} not found." });
                }
                return Ok(bookingDto);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("GetBookingById: Unauthorized attempt for Booking {BookingId} by User {UserId}. Message: {Message}", id, requestorUserIdString, ex.Message);
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetBookingById: Unexpected error for Booking {BookingId} by User {UserId}.", id, requestorUserIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred while retrieving the booking.");
            }
        }

        // GET api/bookings/my-bookings (Lấy danh sách booking của user đang đăng nhập)
        [HttpGet("my-bookings")]
        [Authorize]
        public async Task<IActionResult> GetMyBookings([FromQuery] BookingSearchParameters? parameters)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }
            _logger.LogInformation("User {UserId} requesting their bookings with parameters: {@Parameters}", userId, parameters);

            try
            {
                var bookings = await _bookingService.GetMyBookingsAsync(userId, parameters);
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetMyBookings: Unexpected error for User {UserId}.", userIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred while retrieving your bookings.");
            }
        }

        // GET api/bookings/space/{spaceId} (Lấy danh sách booking của một space - dành cho Owner/SysAdmin)
        [HttpGet("space/{spaceId:guid}")]
        [Authorize(Roles = "Owner,SysAdmin")] // Chỉ Owner của Space hoặc SysAdmin
        public async Task<IActionResult> GetBookingsForSpace(Guid spaceId)
        {
            var requestorUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(requestorUserIdString, out var requestorUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                // BookingService.GetBookingsForSpaceAsync sẽ cần kiểm tra quyền của requestorUserId với spaceId
                var bookings = await _bookingService.GetBookingsForSpaceAsync(spaceId, requestorUserId);
                return Ok(bookings);
            }
            catch (KeyNotFoundException ex) // Space không tồn tại
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("GetBookingsForSpace: Unauthorized attempt for Space {SpaceId} by User {UserId}. Message: {Message}", spaceId, requestorUserIdString, ex.Message);
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetBookingsForSpace: Unexpected error for Space {SpaceId} by User {UserId}.", spaceId, requestorUserIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving bookings for the space.");
            }
        }

        // TODO: Implement endpoints cho CancelBooking, UpdateBookingStatus, CheckIn, CheckOut, MarkAsNoShow
        // Ví dụ cho CancelBooking:
        // PUT api/bookings/{id}/cancel
        [HttpPut("{id:guid}/cancel")]
        [Authorize] // Người dùng tự hủy booking của mình
        public async Task<IActionResult> CancelBooking(Guid id, [FromBody] CancelBookingReasonDto? reasonDto) // Tạo DTO nếu cần lý do
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var success = await _bookingService.CancelBookingAsync(id, userId, reasonDto?.Reason);
                if (!success)
                {
                    // Có thể là booking không tìm thấy, hoặc không có quyền, hoặc không thể hủy do chính sách
                    return BadRequest(new { message = "Failed to cancel booking. It may not exist, you may not have permission, or it's too late to cancel." });
                }
                return Ok(new { message = "Booking cancelled successfully." }); // Hoặc NoContent()
            }
            catch (InvalidOperationException ex) // Ví dụ: không thể hủy do chính sách
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CancelBooking: Unexpected error for Booking {BookingId} by User {UserId}.", id, userIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while cancelling the booking.");
            }
        }




        // PUT/PATCH api/bookings/{id}/status (Owner/SysAdmin cập nhật trạng thái chung)
        [HttpPut("{id:guid}/status")]
        [HttpPatch("{id:guid}/status")] // Support both PUT and PATCH methods
        [Authorize(Roles = "Owner,SysAdmin")] // Chỉ Owner của Space hoặc SysAdmin
        public async Task<IActionResult> UpdateBookingStatus(Guid id, [FromBody] UpdateBookingStatusRequest request)
        {
            var updaterUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(updaterUserIdString, out var updaterUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var updatedBookingDto = await _bookingService.UpdateBookingStatusAsync(id, request, updaterUserId);
                if (updatedBookingDto == null)
                {
                    return NotFound(new { message = $"Booking with ID {id} not found or status update failed." });
                }
                return Ok(updatedBookingDto);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning("UpdateBookingStatus: Booking or related resource not found for BookingId {BookingId}. Message: {Message}", id, ex.Message);
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("UpdateBookingStatus: Unauthorized attempt for Booking {BookingId} by User {UserId}. Message: {Message}", id, updaterUserIdString, ex.Message);
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (ArgumentException ex) // Ví dụ: NewStatus không hợp lệ
            {
                _logger.LogInformation("UpdateBookingStatus: Argument exception for Booking {BookingId}. Message: {Message}", id, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex) // Ví dụ: không thể chuyển sang trạng thái đó từ trạng thái hiện tại
            {
                _logger.LogInformation("UpdateBookingStatus: Invalid operation for Booking {BookingId}. Message: {Message}", id, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "UpdateBookingStatus: Unexpected error for Booking {BookingId} by User {UserId}.", id, updaterUserIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred while updating booking status.");
            }
        }

        // POST api/bookings/{id}/check-in (Owner/SysAdmin thực hiện check-in)
        [HttpPost("{id:guid}/check-in")]
        [Authorize(Roles = "Owner,SysAdmin")]
        public async Task<IActionResult> CheckInBooking(Guid id, [FromBody] CheckInRequest request)
        {
            var staffUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier); // Người thực hiện check-in
            if (!Guid.TryParse(staffUserIdString, out var staffUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var bookingDto = await _bookingService.CheckInAsync(id, request, staffUserId);
                if (bookingDto == null)
                {
                    return NotFound(new { message = $"Booking with ID {id} not found or check-in failed." });
                }
                return Ok(bookingDto);
            }
            // ... (Tương tự, thêm các catch block cho KeyNotFound, Unauthorized, InvalidOperation, Argument, Exception) ...
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CheckInBooking: Error for Booking {BookingId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error during check-in.");
            }
        }

        // POST api/bookings/{id}/check-out (Owner/SysAdmin thực hiện check-out)
        [HttpPost("{id:guid}/check-out")]
        [Authorize(Roles = "Owner,SysAdmin")]
        public async Task<IActionResult> CheckOutBooking(Guid id, [FromBody] CheckOutRequest request)
        {
            var staffUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(staffUserIdString, out var staffUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var bookingDto = await _bookingService.CheckOutAsync(id, request, staffUserId);
                if (bookingDto == null)
                {
                    return NotFound(new { message = $"Booking with ID {id} not found or check-out failed." });
                }
                return Ok(bookingDto);
            }
            // ... (Thêm các catch block tương tự) ...
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CheckOutBooking: Error for Booking {BookingId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error during check-out.");
            }
        }

        // POST api/bookings/{id}/mark-no-show (Owner/SysAdmin đánh dấu không đến)
        [HttpPost("{id:guid}/mark-no-show")]
        [Authorize(Roles = "Owner,SysAdmin")]
        public async Task<IActionResult> MarkBookingAsNoShow(Guid id) // Có thể không cần request body
        {
            var markerUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(markerUserIdString, out var markerUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var bookingDto = await _bookingService.MarkAsNoShowAsync(id, markerUserId);
                if (bookingDto == null)
                {
                    return NotFound(new { message = $"Booking with ID {id} not found or operation failed." });
                }
                return Ok(bookingDto);
            }
            // ... (Thêm các catch block tương tự) ...
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "MarkBookingAsNoShow: Error for Booking {BookingId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error marking booking as no-show.");
            }
        }

        // ========== BOOKING SERVICES ENDPOINTS ==========

        // GET api/bookings/{id}/services
        [HttpGet("{id}/services")]
        [Authorize]
        public async Task<IActionResult> GetBookingServices(Guid id)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var services = await _bookingServiceService.GetBookingServicesAsync(id, userId);
                return Ok(services);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning("GetBookingServices: Booking {BookingId} not found by User {UserId}. Message: {Message}", 
                    id, userId, ex.Message);
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("GetBookingServices: Unauthorized access to Booking {BookingId} by User {UserId}. Message: {Message}", 
                    id, userId, ex.Message);
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetBookingServices: Unexpected error for Booking {BookingId} by User {UserId}", id, userId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An unexpected error occurred while retrieving booking services." });
            }
        }

        // POST api/bookings/{id}/services
        [HttpPost("{id}/services")]
        [Authorize(Roles = "Owner,SysAdmin")]
        public async Task<IActionResult> AddServiceToBooking(Guid id, [FromBody] AddServiceToBookingRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var bookingService = await _bookingServiceService.AddServiceToBookingAsync(id, request, userId);
                return Ok(bookingService);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning("AddServiceToBooking: Resource not found for Booking {BookingId} by User {UserId}. Message: {Message}", 
                    id, userId, ex.Message);
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("AddServiceToBooking: Unauthorized access to Booking {BookingId} by User {UserId}. Message: {Message}", 
                    id, userId, ex.Message);
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("AddServiceToBooking: Invalid input for Booking {BookingId} by User {UserId}. Message: {Message}", 
                    id, userId, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("AddServiceToBooking: Business logic error for Booking {BookingId} by User {UserId}. Message: {Message}", 
                    id, userId, ex.Message);
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AddServiceToBooking: Unexpected error for Booking {BookingId} by User {UserId}", id, userId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An unexpected error occurred while adding service to booking." });
            }
        }

        // PUT api/bookings/{id}/services
        [HttpPut("{id}/services")]
        [Authorize(Roles = "Owner,SysAdmin")]
        public async Task<IActionResult> UpdateBookingServices(Guid id, [FromBody] BookingServicesUpdateRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                await _bookingServiceService.UpdateBookingServicesAsync(id, request, userId);
                return Ok(new { message = "Booking services updated successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning("UpdateBookingServices: Booking {BookingId} not found by User {UserId}. Message: {Message}", 
                    id, userId, ex.Message);
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("UpdateBookingServices: Unauthorized access to Booking {BookingId} by User {UserId}. Message: {Message}", 
                    id, userId, ex.Message);
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "UpdateBookingServices: Unexpected error for Booking {BookingId} by User {UserId}", id, userId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An unexpected error occurred while updating booking services." });
            }
        }

        // DELETE api/bookings/services/{serviceId}
        [HttpDelete("services/{serviceId}")]
        [Authorize(Roles = "Owner,SysAdmin")]
        public async Task<IActionResult> RemoveServiceFromBooking(Guid serviceId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var removed = await _bookingServiceService.RemoveServiceFromBookingAsync(serviceId, userId);
                if (!removed)
                {
                    return NotFound(new { message = $"Booking service with ID {serviceId} not found." });
                }

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("RemoveServiceFromBooking: Unauthorized access to BookingService {ServiceId} by User {UserId}. Message: {Message}", 
                    serviceId, userId, ex.Message);
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RemoveServiceFromBooking: Unexpected error for BookingService {ServiceId} by User {UserId}", serviceId, userId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An unexpected error occurred while removing service from booking." });
            }
        }

    }



    // (Tùy chọn) DTO cho lý do hủy booking
    public record CancelBookingReasonDto(string? Reason);
}