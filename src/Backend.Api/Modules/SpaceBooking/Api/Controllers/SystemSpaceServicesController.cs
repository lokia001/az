// File: Backend.Api/Modules/SpaceBooking/Api/Controllers/SystemSpaceServicesController.cs
using System;
using System.Collections.Generic;
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
    [Route("api/admin/system/space-services")] // Đổi route cho phù hợp
    public class SystemSpaceServicesController : ControllerBase
    {
        private readonly ISystemSpaceServiceService _systemSpaceService; // Sửa tên biến
        private readonly ILogger<SystemSpaceServicesController> _logger;

        public SystemSpaceServicesController(ISystemSpaceServiceService systemSpaceService, ILogger<SystemSpaceServicesController> logger)
        {
            _systemSpaceService = systemSpaceService;
            _logger = logger;
        }

        // GET: api/system-services
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<SystemSpaceServiceDto>>> GetAllSystemSpaceServices()
        {
            var services = await _systemSpaceService.GetAllAsync();
            return Ok(services);
        }

        // GET: api/system-services/{id}
        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<ActionResult<SystemSpaceServiceDto>> GetSystemSpaceServiceById(Guid id)
        {
            var serviceDto = await _systemSpaceService.GetByIdAsync(id); // Sửa tên biến
            if (serviceDto == null)
            {
                return NotFound(new { message = $"System space service with ID {id} not found." });
            }
            return Ok(serviceDto);
        }

        // POST: api/system-services
        [HttpPost]
        [Authorize(Roles = "SysAdmin")] // Chỉ SysAdmin

        public async Task<ActionResult<SystemSpaceServiceDto>> CreateSystemSpaceService([FromBody] CreateSystemSpaceServiceRequest request)
        {
            try
            {
                var createdService = await _systemSpaceService.CreateAsync(request);
                return CreatedAtAction(nameof(GetSystemSpaceServiceById), new { id = createdService.Id }, createdService);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating system space service.");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating the system space service.");
            }
        }

        // PUT: api/system-services/{id}
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "SysAdmin")] // Chỉ SysAdmin

        public async Task<IActionResult> UpdateSystemSpaceService(Guid id, [FromBody] UpdateSystemSpaceServiceRequest request)
        {
            try
            {
                var updatedService = await _systemSpaceService.UpdateAsync(id, request);
                if (updatedService == null)
                {
                    return NotFound(new { message = $"System space service with ID {id} not found for update." });
                }
                return Ok(updatedService);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating system space service with ID {Id}.", id);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating the system space service.");
            }
        }

        // DELETE: api/system-services/{id}
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "SysAdmin")] // Chỉ SysAdmin
        public async Task<IActionResult> DeleteSystemSpaceService(Guid id)
        {
            try
            {
                var success = await _systemSpaceService.DeleteAsync(id);
                if (!success)
                {
                    return NotFound(new { message = $"System space service with ID {id} not found or deletion failed." });
                }
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting system space service with ID {Id}.", id);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while deleting the system space service.");
            }
        }
    }
}