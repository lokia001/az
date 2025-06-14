// File: Backend.Api/Modules/Engagement/Api/Controllers/ReactionsController.cs
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.Api.Modules.Engagement.Application.Contracts.Dtos;
using Backend.Api.Modules.Engagement.Application.Contracts.Services;
using Backend.Api.Modules.Engagement.Domain.Enums; // Cho EngageableEntityType
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Modules.Engagement.Api.Controllers
{
    [ApiController]
    [Route("api/reactions")]
    public class ReactionsController : ControllerBase
    {
        private readonly IReactionService _reactionService;
        private readonly ILogger<ReactionsController> _logger;

        public ReactionsController(IReactionService reactionService, ILogger<ReactionsController> logger)
        {
            _reactionService = reactionService;
            _logger = logger;
        }

        // POST api/reactions (User đặt/thay đổi/xóa reaction)
        [HttpPost]
        [Authorize] // Yêu cầu đăng nhập để reaction
        public async Task<IActionResult> SetReaction([FromBody] SetReactionRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                // Service SetReactionAsync sẽ xử lý logic:
                // - Nếu user chưa reaction target này -> tạo mới.
                // - Nếu user đã reaction target này với CÙNG loại -> xóa reaction đó (toggle off).
                // - Nếu user đã reaction target này với KHÁC loại -> xóa reaction cũ, tạo reaction mới.
                var reactionSummaryDto = await _reactionService.SetReactionAsync(request, userId);
                return Ok(reactionSummaryDto); // Trả về summary mới của target entity
            }
            catch (KeyNotFoundException ex) // Target entity không tồn tại
            {
                _logger.LogWarning(ex, "SetReaction: Target entity not found. User {UserId}, Request: {@Request}", userIdString, request);
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex) // Ví dụ: ReactionType không hợp lệ
            {
                _logger.LogInformation(ex, "SetReaction: Argument exception. User {UserId}, Request: {@Request}", userIdString, request);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SetReaction: Unexpected error. User {UserId}, Request: {@Request}", userIdString, request);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while setting the reaction.");
            }
        }

        // DELETE api/reactions (User xóa reaction của mình khỏi một target)
        // Cách này tường minh hơn là dùng POST với logic toggle.
        // Client sẽ gửi thông tin target và có thể cả loại reaction muốn xóa.
        [HttpDelete]
        [Authorize]
        public async Task<IActionResult> RemoveReaction([FromBody] RemoveReactionRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var reactionSummaryDto = await _reactionService.RemoveReactionAsync(request, userId);
                return Ok(reactionSummaryDto); // Trả về summary mới của target entity
            }
            catch (KeyNotFoundException ex) // Target entity không tồn tại (service có thể không throw lỗi này khi xóa)
            {
                _logger.LogWarning(ex, "RemoveReaction: Target entity not found. User {UserId}, Request: {@Request}", userIdString, request);
                return NotFound(new { message = ex.Message }); // Hoặc Ok(summary rỗng) nếu target không tồn tại
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RemoveReaction: Unexpected error. User {UserId}, Request: {@Request}", userIdString, request);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while removing the reaction.");
            }
        }


        // GET api/entities/{targetEntityTypeString}/{targetId:guid}/reactions/summary
        // Ví dụ: /api/entities/Post/guid-cua-post/reactions/summary
        [HttpGet("/api/entities/{targetEntityTypeString}/{targetId:guid}/reactions/summary")]
        [AllowAnonymous] // Ai cũng có thể xem summary reactions
        public async Task<IActionResult> GetReactionSummary(string targetEntityTypeString, Guid targetId)
        {
            if (!Enum.TryParse<EngageableEntityType>(targetEntityTypeString, true, out var targetEntityType))
            {
                return BadRequest(new { message = $"Invalid target entity type: {targetEntityTypeString}." });
            }

            Guid? currentUserId = null;
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (Guid.TryParse(userIdString, out var parsedUserId))
                {
                    currentUserId = parsedUserId;
                }
            }

            try
            {
                var summaryDto = await _reactionService.GetReactionSummaryAsync(targetEntityType, targetId, currentUserId);
                if (summaryDto == null) // Có thể xảy ra nếu target entity không tồn tại
                {
                    return NotFound(new { message = $"Target entity {targetEntityTypeString} with ID {targetId} not found." });
                }
                return Ok(summaryDto);
            }
            catch (KeyNotFoundException ex) // Service có thể throw nếu target không tồn tại
            {
                _logger.LogWarning(ex, "GetReactionSummary: Target entity {TargetTypeString}:{TargetId} not found.", targetEntityTypeString, targetId);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetReactionSummary: Error for {TargetTypeString}:{TargetId}, CurrentUserId: {CurrentUserId}",
                    targetEntityTypeString, targetId, currentUserId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while fetching reaction summary.");
            }
        }
    }
}