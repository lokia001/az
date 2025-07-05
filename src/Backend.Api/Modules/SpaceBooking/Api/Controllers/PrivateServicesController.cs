// File: Backend.Api/Modules/SpaceBooking/Api/Controllers/PrivateServicesController.cs
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
    [Route("api/owner/private-services")]
    [Authorize(Roles = "Owner,SysAdmin")]
    public class PrivateServicesController : ControllerBase
    {
        private readonly IPrivateServiceService _privateServiceService;
        private readonly ILogger<PrivateServicesController> _logger;

        public PrivateServicesController(
            IPrivateServiceService privateServiceService,
            ILogger<PrivateServicesController> logger)
        {
            _privateServiceService = privateServiceService;
            _logger = logger;
        }

        // POST api/owner/private-services
        [HttpPost]
        public async Task<IActionResult> CreatePrivateService([FromBody] CreatePrivateServiceRequest request)
        {
            var ownerUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(ownerUserIdString, out var ownerId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var serviceDto = await _privateServiceService.CreatePrivateServiceAsync(request, ownerId);
                return CreatedAtAction(nameof(GetPrivateServiceById), new { id = serviceDto.Id }, serviceDto);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("CreatePrivateService: Invalid input by Owner {OwnerId}. Message: {Message}", 
                    ownerId, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("CreatePrivateService: Business logic error for Owner {OwnerId}. Message: {Message}", 
                    ownerId, ex.Message);
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CreatePrivateService: Unexpected error for Owner {OwnerId}", ownerId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An unexpected error occurred while creating the private service." });
            }
        }

        // GET api/owner/private-services
        [HttpGet]
        public async Task<IActionResult> GetPrivateServices([FromQuery] bool activeOnly = false)
        {
            var ownerUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(ownerUserIdString, out var ownerId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                IEnumerable<PrivateServiceDto> services;
                if (activeOnly)
                {
                    services = await _privateServiceService.GetActivePrivateServicesByOwnerAsync(ownerId);
                }
                else
                {
                    services = await _privateServiceService.GetPrivateServicesByOwnerAsync(ownerId);
                }

                return Ok(services);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetPrivateServices: Unexpected error for Owner {OwnerId}", ownerId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An unexpected error occurred while retrieving private services." });
            }
        }

        // GET api/owner/private-services/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPrivateServiceById(Guid id)
        {
            var ownerUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(ownerUserIdString, out var ownerId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var serviceDto = await _privateServiceService.GetPrivateServiceByIdAsync(id, ownerId);
                if (serviceDto == null)
                {
                    return NotFound(new { message = $"Private service with ID {id} not found." });
                }

                return Ok(serviceDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetPrivateServiceById: Unexpected error for Service {ServiceId} and Owner {OwnerId}", 
                    id, ownerId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An unexpected error occurred while retrieving the private service." });
            }
        }

        // PUT api/owner/private-services/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePrivateService(Guid id, [FromBody] UpdatePrivateServiceRequest request)
        {
            var ownerUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(ownerUserIdString, out var ownerId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var updatedServiceDto = await _privateServiceService.UpdatePrivateServiceAsync(id, request, ownerId);
                if (updatedServiceDto == null)
                {
                    return NotFound(new { message = $"Private service with ID {id} not found." });
                }

                return Ok(updatedServiceDto);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("UpdatePrivateService: Invalid input for Service {ServiceId} and Owner {OwnerId}. Message: {Message}", 
                    id, ownerId, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("UpdatePrivateService: Business logic error for Service {ServiceId} and Owner {OwnerId}. Message: {Message}", 
                    id, ownerId, ex.Message);
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "UpdatePrivateService: Unexpected error for Service {ServiceId} and Owner {OwnerId}", 
                    id, ownerId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An unexpected error occurred while updating the private service." });
            }
        }

        // DELETE api/owner/private-services/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePrivateService(Guid id)
        {
            var ownerUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(ownerUserIdString, out var ownerId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var deleted = await _privateServiceService.DeletePrivateServiceAsync(id, ownerId);
                if (!deleted)
                {
                    return NotFound(new { message = $"Private service with ID {id} not found." });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DeletePrivateService: Unexpected error for Service {ServiceId} and Owner {OwnerId}", 
                    id, ownerId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An unexpected error occurred while deleting the private service." });
            }
        }

        // PATCH api/owner/private-services/{id}/toggle-status
        [HttpPatch("{id}/toggle-status")]
        public async Task<IActionResult> TogglePrivateServiceStatus(Guid id)
        {
            var ownerUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(ownerUserIdString, out var ownerId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var toggled = await _privateServiceService.TogglePrivateServiceStatusAsync(id, ownerId);
                if (!toggled)
                {
                    return NotFound(new { message = $"Private service with ID {id} not found." });
                }

                return Ok(new { message = "Service status toggled successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "TogglePrivateServiceStatus: Unexpected error for Service {ServiceId} and Owner {OwnerId}", 
                    id, ownerId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An unexpected error occurred while toggling the service status." });
            }
        }
    }
}
