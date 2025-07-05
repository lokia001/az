using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Services;
using Backend.Api.Modules.UserRelated.Application.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Modules.SpaceBooking.Api.Controllers
{
    public class CustomerBookingInfo
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal? TotalPrice { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? NotificationEmail { get; set; }
        public string? GuestPhone { get; set; }
        public Guid SpaceId { get; set; }
        public string SpaceName { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/owner/customers")]
    [Authorize(Roles = "Owner,SysAdmin")]
    public class OwnerCustomersController : ControllerBase
    {
        private readonly ISpaceService _spaceService;
        private readonly IBookingService _bookingService;
        private readonly IUserService _userService;
        private readonly ILogger<OwnerCustomersController> _logger;

        public OwnerCustomersController(
            ISpaceService spaceService, 
            IBookingService bookingService,
            IUserService userService,
            ILogger<OwnerCustomersController> logger)
        {
            _spaceService = spaceService;
            _bookingService = bookingService;
            _userService = userService;
            _logger = logger;
        }

        // GET api/owner/customers - Get customers for owner's spaces
        [HttpGet]
        public async Task<IActionResult> GetOwnerCustomers()
        {
            var ownerUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(ownerUserIdString, out var ownerUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                // Get owner's spaces
                var ownerSpaces = await _spaceService.GetSpacesByOwnerAsync(ownerUserId);
                
                if (!ownerSpaces.Any())
                {
                    return Ok(new { data = new List<object>(), totalCount = 0 });
                }

                // Get all bookings for owner's spaces
                var allBookings = new List<CustomerBookingInfo>();
                foreach (var space in ownerSpaces)
                {
                    var spaceBookings = await _bookingService.GetBookingsBySpaceIdAsync(space.Id);
                    foreach (var booking in spaceBookings)
                    {
                        allBookings.Add(new CustomerBookingInfo
                        {
                            Id = booking.Id,
                            UserId = booking.UserId,
                            Status = booking.Status.ToString(),
                            TotalPrice = booking.TotalPrice,
                            StartTime = booking.StartTime,
                            EndTime = booking.EndTime,
                            NotificationEmail = booking.NotificationEmail,
                            GuestPhone = booking.GuestPhone,
                            SpaceId = space.Id,
                            SpaceName = space.Name
                        });
                    }
                }

                // Group by userId and get user details
                var customerGroups = allBookings
                    .Where(b => b.UserId != null)
                    .GroupBy(b => b.UserId)
                    .ToList();

                var customers = new List<object>();

                foreach (var group in customerGroups)
                {
                    try
                    {
                        var userId = group.Key;
                        if (!userId.HasValue) continue;
                        
                        // Get user details
                        var userDetails = await _userService.GetUserByIdAsync(userId.Value);
                        if (userDetails != null)
                        {
                            var bookings = group.ToList();
                            var totalBookings = bookings.Count;
                            var completedBookings = bookings.Count(b => b.Status == "Completed");
                            var totalSpent = bookings.Sum(b => b.TotalPrice ?? 0);
                            var lastBooking = bookings.OrderByDescending(b => b.StartTime).FirstOrDefault()?.StartTime;

                            // Get email from booking first, fallback to user email
                            var latestBookingWithEmail = bookings
                                .OrderByDescending(b => b.StartTime)
                                .FirstOrDefault(b => !string.IsNullOrWhiteSpace(b.NotificationEmail));
                            var customerEmail = latestBookingWithEmail?.NotificationEmail ?? userDetails.Email;

                            // Get phone from booking (guest phone) first, fallback to user phone
                            var latestBookingWithPhone = bookings
                                .OrderByDescending(b => b.StartTime)
                                .FirstOrDefault(b => !string.IsNullOrWhiteSpace(b.GuestPhone));
                            var customerPhone = latestBookingWithPhone?.GuestPhone ?? userDetails.PhoneNumber;

                            customers.Add(new
                            {
                                id = userDetails.Id,
                                userId = userDetails.Id,
                                name = userDetails.FullName ?? userDetails.Username,
                                fullName = userDetails.FullName,
                                username = userDetails.Username,
                                email = customerEmail,
                                phone = customerPhone,
                                avatarUrl = userDetails.AvatarUrl,
                                totalBookings,
                                completedBookings,
                                cancelledBookings = bookings.Count(b => b.Status == "Cancelled"),
                                totalSpent,
                                lastBooking,
                                bookings = bookings
                            });
                        }
                    }
                    catch (Exception ex)
                    {
                        var userId = group.Key;
                        _logger.LogWarning("Failed to get user details for userId {UserId}: {Error}", userId, ex.Message);
                    }
                }

                return Ok(new { data = customers, totalCount = customers.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting owner customers for userId {UserId}", ownerUserId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while fetching customers." });
            }
        }

        // GET api/owner/customers/{customerId} - Get specific customer details
        [HttpGet("{customerId:guid}")]
        public async Task<IActionResult> GetCustomerDetails(Guid customerId)
        {
            var ownerUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(ownerUserIdString, out var ownerUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                // Verify owner has access to this customer through bookings
                var ownerSpaces = await _spaceService.GetSpacesByOwnerAsync(ownerUserId);
                
                var hasAccess = false;
                foreach (var space in ownerSpaces)
                {
                    var spaceBookings = await _bookingService.GetBookingsBySpaceIdAsync(space.Id);
                    if (spaceBookings.Any(b => b.UserId == customerId))
                    {
                        hasAccess = true;
                        break;
                    }
                }

                if (!hasAccess)
                {
                    return Forbid("You don't have access to this customer's information.");
                }

                // Get customer details
                var customerDetails = await _userService.GetUserByIdAsync(customerId);
                if (customerDetails == null)
                {
                    return NotFound(new { message = "Customer not found." });
                }

                return Ok(customerDetails);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer details for customerId {CustomerId} by owner {OwnerId}", customerId, ownerUserId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while fetching customer details." });
            }
        }
    }
}
