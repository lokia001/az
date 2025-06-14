// File: Backend.Api/Modules/UserRelated/Api/Controllers/AdminUsersController.cs
using System;
using System.Threading.Tasks;
using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos;
using Backend.Api.Modules.UserRelated.Application.Contracts.Services;
using Backend.Api.Modules.UserRelated.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Security.Claims;


namespace Backend.Api.Modules.UserRelated.Api.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Roles = "SysAdmin")] // Chỉ SysAdmin được truy cập tất cả các endpoint trong controller này
    public class AdminUsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<AdminUsersController> _logger;

        public AdminUsersController(IUserService userService, ILogger<AdminUsersController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        // GET api/admin/users
        [HttpGet]
        public async Task<IActionResult> GetAllUsers([FromQuery] UserSearchCriteriaDto criteria)
        {
            try
            {
                var users = await _userService.GetAllUsersAsync(criteria);
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Admin: Error fetching all users with criteria {@Criteria}", criteria);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while fetching users.");
            }
        }

        // GET api/admin/users/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            var userDto = await _userService.GetUserByIdForAdminAsync(id); // Gọi phương thức mới
            if (userDto == null)
            {
                return NotFound(new { message = $"User with ID {id} not found." });
            }
            return Ok(userDto);
        }

        // PUT api/admin/users/{id}/set-active
        [HttpPut("{id:guid}/set-active")]
        public async Task<IActionResult> SetUserActiveStatus(Guid id, [FromBody] SetUserActiveStatusRequest request)
        {
            var adminUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(adminUserIdString, out var adminUserId))
            {
                return Unauthorized(new { message = "Invalid admin user identifier in token." });
            }

            try
            {
                var success = await _userService.SetUserActiveStatusAsync(id, request.IsActive, adminUserId);
                if (!success)
                {
                    return NotFound(new { message = $"User with ID {id} not found or status update failed." });
                }
                return Ok(new { message = $"User {id} active status set to {request.IsActive}." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Admin: Error setting active status for User {UserId} by Admin {AdminUserId}", id, adminUserId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred.");
            }
        }

        // PUT api/admin/users/{id}/change-role
        [HttpPut("{id:guid}/change-role")]
        public async Task<IActionResult> ChangeUserRole(Guid id, [FromBody] ChangeUserRoleRequest request)
        {
            var adminUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(adminUserIdString, out var adminUserId))
            {
                return Unauthorized(new { message = "Invalid admin user identifier in token." });
            }

            try
            {
                var success = await _userService.ChangeUserRoleAsync(id, request.NewRole, adminUserId);
                if (!success)
                {
                    return NotFound(new { message = $"User with ID {id} not found or role change failed." });
                }
                return Ok(new { message = $"User {id} role changed to {request.NewRole}." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Admin: Error changing role for User {UserId} by Admin {AdminUserId}", id, adminUserId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred.");
            }
        }
    }

    // DTOs cho request của Admin Controller (có thể đặt trong UserDtos.cs)
    public record SetUserActiveStatusRequest([Required] bool IsActive);
    public record ChangeUserRoleRequest([Required] UserRole NewRole);
}