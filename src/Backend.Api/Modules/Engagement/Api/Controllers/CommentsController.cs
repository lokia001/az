// File: Backend.Api/Modules/Engagement/Api/Controllers/CommentsController.cs
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.Api.Modules.Engagement.Application.Contracts.Dtos;
using Backend.Api.Modules.Engagement.Application.Contracts.Services;
using Backend.Api.Modules.Engagement.Domain.Enums; // Cho EngageableEntityType
using Backend.Api.SharedKernel.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Modules.Engagement.Api.Controllers
{
    [ApiController]
    [Route("api/comments")]
    public class CommentsController : ControllerBase
    {
        private readonly ICommentService _commentService;
        private readonly ILogger<CommentsController> _logger;

        public CommentsController(ICommentService commentService, ILogger<CommentsController> logger)
        {
            _commentService = commentService;
            _logger = logger;
        }

        // POST api/comments (Tạo comment mới)
        [HttpPost]
        [Authorize] // Yêu cầu đăng nhập
        public async Task<IActionResult> CreateComment([FromBody] CreateCommentRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var commentDto = await _commentService.CreateCommentAsync(request, userId);
                return CreatedAtAction(nameof(GetCommentById), new { id = commentDto.Id }, commentDto);
            }
            catch (KeyNotFoundException ex) // ParentEntity hoặc ParentComment không tồn tại
            {
                _logger.LogWarning(ex, "CreateComment: Resource not found. User {UserId}, Request: {@Request}", userIdString, request);
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex) // User không có quyền comment trên parent entity
            {
                _logger.LogWarning(ex, "CreateComment: Unauthorized attempt. User {UserId}, Request: {@Request}", userIdString, request);
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (ArgumentException ex) // Ví dụ: ParentCommentId không hợp lệ với ParentEntity
            {
                _logger.LogInformation(ex, "CreateComment: Argument exception. User {UserId}, Request: {@Request}", userIdString, request);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CreateComment: Unexpected error. User {UserId}, Request: {@Request}", userIdString, request);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating the comment.");
            }
        }

        // GET api/comments/{id}
        [HttpGet("{id:guid}", Name = "GetCommentById")]
        [AllowAnonymous] // Service sẽ kiểm tra quyền xem dựa trên parent entity
        public async Task<ActionResult<CommentDto>> GetCommentById(Guid id, [FromQuery] bool includeReplies = false)
        {
            try
            {
                var commentDto = await _commentService.GetCommentByIdAsync(id, includeReplies);
                if (commentDto == null)
                {
                    return NotFound(new { message = $"Comment with ID {id} not found." });
                }
                return Ok(commentDto);
            }
            catch (UnauthorizedAccessException ex) // Nếu service throw khi không có quyền xem parent
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetCommentById: Error fetching comment {CommentId}.", id);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred.");
            }
        }

        // GET api/entities/{parentEntityType}/{parentId}/comments
        // Ví dụ: /api/entities/Post/guid-cua-post/comments
        // Ví dụ: /api/entities/Space/guid-cua-space/comments
        [HttpGet("/api/entities/{parentEntityTypeString}/{parentId:guid}/comments")]
        [AllowAnonymous] // Service sẽ kiểm tra quyền xem dựa trên parent entity
        public async Task<ActionResult<PagedResultDto<CommentDto>>> GetCommentsForParentEntity(
            string parentEntityTypeString, Guid parentId, [FromQuery] CommentSearchCriteriaDto criteria)
        {
            if (!Enum.TryParse<EngageableEntityType>(parentEntityTypeString, true, out var parentEntityType))
            {
                return BadRequest(new { message = $"Invalid parent entity type: {parentEntityTypeString}." });
            }

            // Gán ParentEntityType và ParentId từ path vào criteria

            criteria.ParentEntityType = parentEntityType;
            criteria.ParentEntityId = parentId;

            try
            {
                var pagedResult = await _commentService.GetCommentsForParentEntityAsync(parentEntityType, parentId, criteria);
                return Ok(pagedResult);
            }
            catch (KeyNotFoundException ex) // Parent entity không tồn tại
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex) // Không có quyền xem parent entity
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetCommentsForParentEntity: Error for {ParentType}:{ParentId}, Criteria: {@Criteria}",
                    parentEntityTypeString, parentId, criteria);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred.");
            }
        }

        // PUT api/comments/{id}
        [HttpPut("{id:guid}")]
        [Authorize] // Chỉ người viết comment mới được sửa
        public async Task<IActionResult> UpdateComment(Guid id, [FromBody] UpdateCommentRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var updatedCommentDto = await _commentService.UpdateCommentAsync(id, request, userId);
                if (updatedCommentDto == null)
                {
                    return NotFound(new { message = $"Comment with ID {id} not found for update." });
                }
                return Ok(updatedCommentDto);
            }
            // ... (Thêm các catch block: KeyNotFound, Unauthorized, Argument, InvalidOperation, Exception) ...
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); } // Ví dụ: comment trên entity bị khóa
            catch (Exception ex)
            {
                _logger.LogError(ex, "UpdateComment: Error for Comment {CommentId} by User {UserId}", id, userIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error updating comment.");
            }
        }

        // DELETE api/comments/{id}
        [HttpDelete("{id:guid}")]
        [Authorize] // Người viết comment hoặc Mod/Admin của parent entity
        public async Task<IActionResult> DeleteComment(Guid id)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                // Service DeleteCommentAsync sẽ kiểm tra quyền
                var success = await _commentService.DeleteCommentAsync(id, userId);
                if (!success)
                {
                    return NotFound(new { message = $"Comment with ID {id} not found or deletion failed." });
                }
                return NoContent();
            }
            // ... (Thêm các catch block) ...
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message }); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DeleteComment: Error for Comment {CommentId} by User {UserId}", id, userIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error deleting comment.");
            }
        }
    }
}