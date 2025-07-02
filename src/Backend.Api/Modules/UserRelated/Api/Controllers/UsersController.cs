// File: Backend.Api/Modules/UserRelated/Api/Controllers/UsersController.cs
using Backend.Api.Modules.CommunityContent.Application.Contracts.Dtos;
using Backend.Api.Modules.CommunityContent.Application.Contracts.Services;
using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos;
using Backend.Api.Modules.UserRelated.Application.Contracts.Services;
using Microsoft.AspNetCore.Authorization; // Cho [Authorize]
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims; // Để lấy UserId từ token
using System.Threading.Tasks;

namespace Backend.Api.Modules.UserRelated.Api.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize] // Yêu cầu xác thực cho tất cả các action trong controller này
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IPostService _postService;


        public UsersController(IUserService userService, IPostService postService)
        {
            _postService = postService;
            _userService = userService;
        }

        // GET api/users/me (Lấy thông tin của user đang đăng nhập)
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            // Lấy UserId từ claims của token JWT
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            var userDto = await _userService.GetUserByIdAsync(userId);
            if (userDto == null)
            {
                return NotFound(new { message = "User profile not found." });
            }
            return Ok(userDto);
        }

        // GET api/users/{id} (Lấy thông tin user theo ID - có thể chỉ cho Admin hoặc user đó tự xem)
        [HttpGet("{id:guid}")]
        // [Authorize(Roles = "SysAdmin")] // Ví dụ: Chỉ SysAdmin mới được xem profile người khác bằng ID
        // Hoặc có thể thêm logic kiểm tra nếu id là của user đang đăng nhập thì cho phép
        public async Task<IActionResult> GetUserById(Guid id)
        {
            // Logic kiểm tra quyền:
            var currentUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(currentUserIdString, out var currentUserId);

            // Chỉ cho phép SysAdmin hoặc user tự xem profile của mình bằng ID
            if (!User.IsInRole("SysAdmin") && currentUserId != id)
            {
                return Forbid(); // Hoặc NotFound() để không tiết lộ sự tồn tại
            }

            var userDto = await _userService.GetUserByIdAsync(id);
            if (userDto == null)
            {
                return NotFound(new { message = $"User with ID {id} not found." });
            }
            return Ok(userDto);
        }

        // PUT api/users/me/profile (Cập nhật profile của user đang đăng nhập)
        [HttpPut("me/profile")]
        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateUserProfileRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                await _userService.UpdateUserProfileAsync(userId, request);
                return NoContent(); // Hoặc Ok(new { message = "Profile updated successfully." });
            }
            catch (ArgumentException ex) // Ví dụ: User not found từ service
            {
                return NotFound(new { message = ex.Message });
            }
            // Bắt các lỗi validation khác nếu có
        }


        // GET api/users/{authorUserId}/posts (Lấy bài đăng của một tác giả)
        // Route này có thể đặt ở UsersController hoặc ở đây.
        [HttpGet("{authorUserId:guid}/posts")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPostsByAuthor(Guid authorUserId, [FromQuery] PostSearchCriteriaDto criteria)
        {
            try
            {
                var effectiveCriteria = criteria with { AuthorUserId = authorUserId };
                var pagedResult = await _postService.GetPostsByAuthorAsync(authorUserId, effectiveCriteria);
                return Ok(pagedResult);
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while fetching posts by the author.");
            }
        }

        // GET api/users/search (Tìm kiếm users cho owner booking)
        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                return BadRequest(new { message = "Query must be at least 2 characters long." });
            }

            try
            {
                var users = await _userService.SearchUsersAsync(query);
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while searching users.", details = ex.Message });
            }
        }

    }
}