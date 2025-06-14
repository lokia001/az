// File: Backend.Api/Modules/SpaceBooking/Api/Controllers/SystemAmenitiesController.cs
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
    [Route("api/admin/system/amenities")]

    public class SystemAmenitiesController : ControllerBase
    {
        private readonly ISystemAmenityService _systemAmenityService;
        private readonly ILogger<SystemAmenitiesController> _logger;

        public SystemAmenitiesController(ISystemAmenityService systemAmenityService, ILogger<SystemAmenitiesController> logger)
        {
            _systemAmenityService = systemAmenityService;
            _logger = logger;
        }

        // GET: api/system-amenities
        [HttpGet]
        [AllowAnonymous] // Chỉ SysAdmin được truy cập
        public async Task<ActionResult<IEnumerable<SystemAmenityDto>>> GetAllSystemAmenities()
        {
            var amenities = await _systemAmenityService.GetAllAsync();
            return Ok(amenities);
        }

        // GET: api/system-amenities/{id}
        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<ActionResult<SystemAmenityDto>> GetSystemAmenityById(Guid id)
        {
            var amenity = await _systemAmenityService.GetByIdAsync(id);
            if (amenity == null)
            {
                return NotFound(new { message = $"System amenity with ID {id} not found." });
            }
            return Ok(amenity);
        }

        // POST: api/system-amenities
        [HttpPost]
        [Authorize(Roles = "SysAdmin")] // Chỉ SysAdmin được truy cập
        public async Task<ActionResult<SystemAmenityDto>> CreateSystemAmenity([FromBody] CreateSystemAmenityRequest request)
        {
            try
            {
                var createdAmenity = await _systemAmenityService.CreateAsync(request);
                // Trả về 201 Created với URI của resource mới và resource đó
                return CreatedAtAction(nameof(GetSystemAmenityById), new { id = createdAmenity.Id }, createdAmenity);
            }
            catch (ArgumentException ex) // Ví dụ: tên đã tồn tại
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating system amenity.");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating the system amenity.");
            }
        }

        // PUT: api/system-amenities/{id}
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "SysAdmin")] // Chỉ SysAdmin được truy cập
        public async Task<IActionResult> UpdateSystemAmenity(Guid id, [FromBody] UpdateSystemAmenityRequest request)
        {
            try
            {
                var updatedAmenity = await _systemAmenityService.UpdateAsync(id, request);
                if (updatedAmenity == null)
                {
                    return NotFound(new { message = $"System amenity with ID {id} not found for update." });
                }
                return Ok(updatedAmenity);
            }
            catch (ArgumentException ex) // Ví dụ: tên mới đã tồn tại
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating system amenity with ID {Id}.", id);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating the system amenity.");
            }
        }

        // DELETE: api/system-amenities/{id}
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "SysAdmin")] // Chỉ SysAdmin được truy cập
        public async Task<IActionResult> DeleteSystemAmenity(Guid id)
        {
            try
            {
                var success = await _systemAmenityService.DeleteAsync(id);
                if (!success)
                {
                    return NotFound(new { message = $"System amenity with ID {id} not found or deletion failed." });
                }
                return NoContent();
            }
            catch (InvalidOperationException ex) // Ví dụ: không thể xóa do đang được sử dụng (nếu bạn implement logic đó)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting system amenity with ID {Id}.", id);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while deleting the system amenity.");
            }
        }
    }
}