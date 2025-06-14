// File: Backend.Api/Modules/CommunityContent/Api/Controllers/PostsController.cs
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.Api.Modules.CommunityContent.Application.Contracts.Dtos;
using Backend.Api.Modules.CommunityContent.Application.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Modules.CommunityContent.Api.Controllers
{
    [ApiController]
    [Route("api/posts")] // Route chung cho posts, hoặc có thể là /api/communities/{communityId}/posts
    public class PostsController : ControllerBase
    {
        private readonly IPostService _postService;
        private readonly ILogger<PostsController> _logger;
        // Có thể cần ICommunityMemberService để kiểm tra quyền trong một số trường hợp phức tạp
        // private readonly ICommunityMemberService _communityMemberService;

        public PostsController(IPostService postService, ILogger<PostsController> logger)
        {
            _postService = postService;
            _logger = logger;
        }

        // POST api/posts (Tạo bài đăng mới)
        // Request body sẽ chứa CommunityId
        [HttpPost]
        [Authorize] // Yêu cầu đăng nhập để đăng bài
        public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest request)
        {
            var authorUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(authorUserIdString, out var authorUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                // Service CreatePostAsync sẽ kiểm tra xem authorUserId có phải là thành viên của request.CommunityId không
                var postDto = await _postService.CreatePostAsync(request, authorUserId);
                return CreatedAtAction(nameof(GetPostById), new { id = postDto.Id }, postDto);
            }
            catch (KeyNotFoundException ex) // Ví dụ: Community không tồn tại
            {
                _logger.LogWarning(ex, "CreatePost: Resource not found for User {UserId}, Request: {@Request}", authorUserIdString, request);
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex) // Ví dụ: User không phải thành viên community
            {
                _logger.LogWarning(ex, "CreatePost: Unauthorized attempt by User {UserId}, Request: {@Request}", authorUserIdString, request);
                return Forbid(ex.Message);
            }
            catch (ArgumentException ex)
            {
                _logger.LogInformation(ex, "CreatePost: Argument exception by User {UserId}, Request: {@Request}", authorUserIdString, request);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CreatePost: Unexpected error for User {UserId}, Request: {@Request}", authorUserIdString, request);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating the post.");
            }
        }

        // GET api/posts/{id}
        [HttpGet("{id:guid}", Name = "GetPostById")]
        [AllowAnonymous] // Ai cũng có thể xem bài đăng (nếu community là public)
        public async Task<IActionResult> GetPostById(Guid id)
        {
            // Service GetPostByIdAsync có thể cần kiểm tra IsPublic của Community nếu người dùng chưa đăng nhập
            var postDto = await _postService.GetPostByIdAsync(id);
            if (postDto == null)
            {
                return NotFound(new { message = $"Post with ID {id} not found." });
            }
            return Ok(postDto);
        }

        // GET api/communities/{communityId}/posts (Lấy bài đăng của một community)
        // Route này có thể đặt ở CommunitiesController hoặc ở đây. Đặt ở đây cũng hợp lý.


        // PUT api/posts/{id}
        [HttpPut("{id:guid}")]
        [Authorize] // Cần đăng nhập
        public async Task<IActionResult> UpdatePost(Guid id, [FromBody] UpdatePostRequest request)
        {
            var editorUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(editorUserIdString, out var editorUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                // Service UpdatePostAsync sẽ kiểm tra quyền (editorUserId phải là tác giả hoặc Admin/Mod của community)
                var updatedPostDto = await _postService.UpdatePostAsync(id, request, editorUserId);
                if (updatedPostDto == null)
                {
                    return NotFound(new { message = $"Post with ID {id} not found for update." });
                }
                return Ok(updatedPostDto);
            }
            // ... (Thêm các catch block: KeyNotFound, Unauthorized, Argument, Exception) ...
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "UpdatePost: Error for Post {PostId} by User {UserId}", id, editorUserIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error updating post.");
            }
        }

        // DELETE api/posts/{id}
        [HttpDelete("{id:guid}")]
        [Authorize] // Cần đăng nhập
        public async Task<IActionResult> DeletePost(Guid id)
        {
            var deleterUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(deleterUserIdString, out var deleterUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                // Service DeletePostAsync sẽ kiểm tra quyền
                var success = await _postService.DeletePostAsync(id, deleterUserId);
                if (!success)
                {
                    return NotFound(new { message = $"Post with ID {id} not found or deletion failed." });
                }
                return NoContent();
            }
            // ... (Thêm các catch block) ...
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DeletePost: Error for Post {PostId} by User {UserId}", id, deleterUserIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error deleting post.");
            }
        }

        // --- Admin/Moderator actions for Posts ---

        // POST api/posts/{id}/pin
        [HttpPost("{id:guid}/pin")]
        [Authorize] // Service sẽ kiểm tra quyền Admin/Mod của Community
        public async Task<IActionResult> PinPost(Guid id)
        {
            var adminOrModUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(adminOrModUserIdString, out var adminOrModUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }
            try
            {
                var success = await _postService.PinPostAsync(id, adminOrModUserId, true); // true để ghim
                if (!success) return NotFound(new { message = "Post not found or operation failed." });
                return Ok(new { message = "Post pinned successfully." });
            }
            // ... (Thêm các catch block) ...
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "PinPost: Error for Post {PostId} by Admin/Mod {UserId}", id, adminOrModUserIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error pinning post.");
            }
        }

        // POST api/posts/{id}/unpin
        [HttpPost("{id:guid}/unpin")]
        [Authorize]
        public async Task<IActionResult> UnpinPost(Guid id)
        {
            var adminOrModUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(adminOrModUserIdString, out var adminOrModUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }
            try
            {
                var success = await _postService.PinPostAsync(id, adminOrModUserId, false); // false để bỏ ghim
                if (!success) return NotFound(new { message = "Post not found or operation failed." });
                return Ok(new { message = "Post unpinned successfully." });
            }
            // ... (Thêm các catch block) ...
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "UnpinPost: Error for Post {PostId} by Admin/Mod {UserId}", id, adminOrModUserIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error unpinning post.");
            }
        }

        // POST api/posts/{id}/lock
        [HttpPost("{id:guid}/lock")]
        [Authorize]
        public async Task<IActionResult> LockPost(Guid id)
        {
            var adminOrModUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(adminOrModUserIdString, out var adminOrModUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }
            try
            {
                var success = await _postService.LockPostAsync(id, adminOrModUserId, true); // true để khóa
                if (!success) return NotFound(new { message = "Post not found or operation failed." });
                return Ok(new { message = "Post locked successfully." });
            }
            // ... (Thêm các catch block) ...
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "LockPost: Error for Post {PostId} by Admin/Mod {UserId}", id, adminOrModUserIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error locking post.");
            }
        }

        // POST api/posts/{id}/unlock
        [HttpPost("{id:guid}/unlock")]
        [Authorize]
        public async Task<IActionResult> UnlockPost(Guid id)
        {
            var adminOrModUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(adminOrModUserIdString, out var adminOrModUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }
            try
            {
                var success = await _postService.LockPostAsync(id, adminOrModUserId, false); // false để mở khóa
                if (!success) return NotFound(new { message = "Post not found or operation failed." });
                return Ok(new { message = "Post unlocked successfully." });
            }
            // ... (Thêm các catch block) ...
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "UnlockPost: Error for Post {PostId} by Admin/Mod {UserId}", id, adminOrModUserIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error unlocking post.");
            }
        }
    }
}