using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos;
using Backend.Api.Modules.UserRelated.Application.Contracts.Services;

namespace Backend.Api.Modules.UserRelated.Api.Controllers
{
    [ApiController]
    [Route("api/owner-registration")]
    [Authorize] // All endpoints require authentication
    public class OwnerRegistrationController : ControllerBase
    {
        private readonly IOwnerRegistrationRequestService _ownerRegistrationRequestService;
        private readonly ILogger<OwnerRegistrationController> _logger;

        public OwnerRegistrationController(
            IOwnerRegistrationRequestService ownerRegistrationRequestService,
            ILogger<OwnerRegistrationController> logger)
        {
            _ownerRegistrationRequestService = ownerRegistrationRequestService;
            _logger = logger;
        }

        /// <summary>
        /// Submit a new owner registration request
        /// </summary>
        /// <param name="request">Registration request details</param>
        /// <returns>Created registration request</returns>
        [HttpPost]
        [Authorize(Roles = "User")] // Only regular users can submit registration requests
        public async Task<IActionResult> SubmitRegistrationRequest([FromBody] CreateOwnerRegistrationRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var registrationRequest = await _ownerRegistrationRequestService.SubmitRegistrationRequestAsync(userId, request);
                
                _logger.LogInformation("User {UserId} submitted owner registration request {RequestId}", 
                    userId, registrationRequest.Id);

                return CreatedAtAction(
                    nameof(GetMyRegistrationRequest),
                    new { },
                    registrationRequest);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting owner registration request for user {UserId}", userId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while submitting the registration request." });
            }
        }

        /// <summary>
        /// Get the current user's registration request
        /// </summary>
        /// <returns>User's registration request or 404 if none exists</returns>
        [HttpGet("me")]
        [Authorize(Roles = "User,Owner")] // Users and Owners can check their request status
        public async Task<IActionResult> GetMyRegistrationRequest()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var registrationRequest = await _ownerRegistrationRequestService.GetUserRegistrationRequestAsync(userId);
                
                if (registrationRequest == null)
                {
                    return NotFound(new { message = "No registration request found for the current user." });
                }

                return Ok(registrationRequest);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving registration request for user {UserId}", userId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while retrieving the registration request." });
            }
        }

        /// <summary>
        /// Cancel the current user's pending registration request
        /// </summary>
        /// <param name="requestId">ID of the request to cancel</param>
        /// <returns>Success message</returns>
        [HttpDelete("{requestId:guid}")]
        [Authorize(Roles = "User")] // Only users can cancel their own requests
        public async Task<IActionResult> CancelRegistrationRequest(Guid requestId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                await _ownerRegistrationRequestService.CancelRegistrationRequestAsync(requestId, userId);
                
                _logger.LogInformation("User {UserId} cancelled registration request {RequestId}", userId, requestId);

                return Ok(new { message = "Registration request has been cancelled successfully." });
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling registration request {RequestId} for user {UserId}", requestId, userId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while cancelling the registration request." });
            }
        }
    }
}
