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
    [Route("api/admin/owner-registration")]
    [Authorize(Roles = "SysAdmin")] // All endpoints require SysAdmin role
    public class AdminOwnerRegistrationController : ControllerBase
    {
        private readonly IOwnerRegistrationRequestService _ownerRegistrationRequestService;
        private readonly ILogger<AdminOwnerRegistrationController> _logger;

        public AdminOwnerRegistrationController(
            IOwnerRegistrationRequestService ownerRegistrationRequestService,
            ILogger<AdminOwnerRegistrationController> logger)
        {
            _ownerRegistrationRequestService = ownerRegistrationRequestService;
            _logger = logger;
        }

        /// <summary>
        /// Get paginated list of owner registration requests
        /// </summary>
        /// <param name="pageNumber">Page number (default: 1)</param>
        /// <param name="pageSize">Page size (default: 10)</param>
        /// <param name="status">Filter by status (optional)</param>
        /// <param name="fromDate">Filter from date (optional)</param>
        /// <param name="toDate">Filter to date (optional)</param>
        /// <param name="searchTerm">Search term for company name, username, email (optional)</param>
        /// <returns>Paginated list of registration requests</returns>
        [HttpGet]
        public async Task<IActionResult> GetRegistrationRequests(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] string? searchTerm = null)
        {
            try
            {
                // Validate parameters
                if (pageNumber < 1) pageNumber = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 10;

                var result = await _ownerRegistrationRequestService.GetRegistrationRequestsAsync(
                    pageNumber, pageSize, status, fromDate, toDate, searchTerm);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving owner registration requests");
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while retrieving registration requests." });
            }
        }

        /// <summary>
        /// Get a specific registration request by ID
        /// </summary>
        /// <param name="requestId">Registration request ID</param>
        /// <returns>Registration request details</returns>
        [HttpGet("{requestId:guid}")]
        public async Task<IActionResult> GetRegistrationRequest(Guid requestId)
        {
            try
            {
                var request = await _ownerRegistrationRequestService.GetRegistrationRequestByIdAsync(requestId);
                
                if (request == null)
                {
                    return NotFound(new { message = $"Registration request with ID {requestId} not found." });
                }

                return Ok(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving registration request {RequestId}", requestId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while retrieving the registration request." });
            }
        }

        /// <summary>
        /// Get count of pending registration requests
        /// </summary>
        /// <returns>Count of pending requests</returns>
        [HttpGet("pending/count")]
        public async Task<IActionResult> GetPendingRequestsCount()
        {
            try
            {
                var count = await _ownerRegistrationRequestService.GetPendingRequestsCountAsync();
                return Ok(new { pendingCount = count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pending registration requests count");
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while retrieving pending requests count." });
            }
        }

        /// <summary>
        /// Process a registration request (approve or reject)
        /// </summary>
        /// <param name="requestId">Registration request ID</param>
        /// <param name="processRequest">Processing details</param>
        /// <returns>Success message</returns>
        [HttpPut("{requestId:guid}/process")]
        public async Task<IActionResult> ProcessRegistrationRequest(
            Guid requestId, 
            [FromBody] ProcessOwnerRegistrationRequest processRequest)
        {
            var adminUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(adminUserIdString, out var adminUserId))
            {
                return Unauthorized(new { message = "Invalid admin user identifier in token." });
            }

            try
            {
                await _ownerRegistrationRequestService.ProcessRegistrationRequestAsync(requestId, adminUserId, processRequest);
                
                var action = processRequest.IsApproved ? "approved" : "rejected";
                _logger.LogInformation("Admin {AdminUserId} {Action} registration request {RequestId}", 
                    adminUserId, action, requestId);

                return Ok(new { 
                    message = $"Registration request has been {action} successfully.",
                    isApproved = processRequest.IsApproved
                });
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
                _logger.LogError(ex, "Error processing registration request {RequestId} by admin {AdminUserId}", 
                    requestId, adminUserId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while processing the registration request." });
            }
        }
    }
}
