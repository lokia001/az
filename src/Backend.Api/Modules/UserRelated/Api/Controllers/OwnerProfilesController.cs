// File: Backend.Api/Modules/UserRelated/Api/Controllers/OwnerProfilesController.cs
using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos;
using Backend.Api.Modules.UserRelated.Application.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Backend.Api.Modules.UserRelated.Api.Controllers
{
    [ApiController]
    [Route("api/owner-profiles")]
    [Authorize] // Yêu cầu xác thực
    public class OwnerProfilesController : ControllerBase
    {
        private readonly IOwnerProfileService _ownerProfileService;
        private readonly IUserService _userService; // Có thể cần để kiểm tra vai trò

        public OwnerProfilesController(IOwnerProfileService ownerProfileService, IUserService userService)
        {
            _ownerProfileService = ownerProfileService;
            _userService = userService;
        }

        // GET api/owner-profiles/me (Lấy OwnerProfile của user đang đăng nhập)
        [HttpGet("me")]
        [Authorize(Roles = "Owner,SysAdmin")] // Chỉ Owner hoặc SysAdmin mới có OwnerProfile
        public async Task<IActionResult> GetMyOwnerProfile()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            var ownerProfileDto = await _ownerProfileService.GetOwnerProfileByUserIdAsync(userId);
            if (ownerProfileDto == null)
            {
                return NotFound(new { message = "Owner profile not found for the current user." });
            }
            return Ok(ownerProfileDto);
        }

        // POST api/owner-profiles/me (Tạo OwnerProfile cho user đang đăng nhập)
        [HttpPost("me")]
        [Authorize(Roles = "Owner")] // Chỉ user có vai trò Owner mới được tạo (service cũng có kiểm tra)
        public async Task<IActionResult> CreateMyOwnerProfile([FromBody] UpsertOwnerProfileRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                await _ownerProfileService.CreateOwnerProfileAsync(userId, request);
                // Lấy lại profile vừa tạo để trả về kèm theo Location header
                var createdProfile = await _ownerProfileService.GetOwnerProfileByUserIdAsync(userId);
                if (createdProfile == null) // Trường hợp hiếm gặp
                {
                    return StatusCode(500, "Failed to retrieve created owner profile.");
                }
                // Trả về 201 Created với URI của resource mới tạo và resource đó
                return CreatedAtAction(nameof(GetMyOwnerProfile), new { /* routeValues if any */ }, createdProfile);
            }
            catch (InvalidOperationException ex) // Ví dụ: User đã có profile, hoặc không phải Owner
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex) // Ví dụ: User không tồn tại
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // PUT api/owner-profiles/me (Cập nhật OwnerProfile của user đang đăng nhập)
        [HttpPut("me")]
        [Authorize(Roles = "Owner,SysAdmin")] // Chỉ Owner (tự sửa) hoặc SysAdmin (sửa của người khác nếu cần)
        public async Task<IActionResult> UpdateMyOwnerProfile([FromBody] UpsertOwnerProfileRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            // Nếu là SysAdmin, họ có thể cập nhật profile của người khác bằng cách truyền userId khác
            // Tuy nhiên, endpoint "me" này ngụ ý là của user hiện tại.
            // Nếu muốn cho SysAdmin sửa của người khác, cần endpoint riêng /api/owner-profiles/{userId}

            try
            {
                await _ownerProfileService.UpdateOwnerProfileAsync(userId, request);
                return NoContent(); // Hoặc Ok với message
            }
            catch (ArgumentException ex) // Ví dụ: OwnerProfile không tồn tại
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // GET api/owner-profiles/{userId} (Lấy OwnerProfile theo UserId - Dành cho Admin)
        [HttpGet("{userId:guid}")]
        [Authorize(Roles = "SysAdmin")]
        public async Task<IActionResult> GetOwnerProfileByUserId(Guid userId)
        {
            var ownerProfileDto = await _ownerProfileService.GetOwnerProfileByUserIdAsync(userId);
            if (ownerProfileDto == null)
            {
                return NotFound(new { message = $"Owner profile for user ID {userId} not found." });
            }
            return Ok(ownerProfileDto);
        }

        // GET api/owner-profiles/public/{userId} (Lấy thông tin công khai của Owner - Không cần xác thực)
        [HttpGet("public/{userId:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicOwnerProfileByUserId(Guid userId)
        {
            var ownerProfileDto = await _ownerProfileService.GetOwnerProfileByUserIdAsync(userId);
            if (ownerProfileDto == null)
            {
                return NotFound(new { message = $"Owner profile for user ID {userId} not found." });
            }

            // Trả về thông tin công khai (loại bỏ thông tin nhạy cảm nếu cần)
            var publicProfile = new
            {
                ownerProfileDto.UserId,
                ownerProfileDto.CompanyName,
                ownerProfileDto.Description,
                ownerProfileDto.Website,
                ownerProfileDto.LogoUrl,
                ownerProfileDto.IsVerified
            };

            return Ok(publicProfile);
        }
    }
}