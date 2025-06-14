// File: Backend.Api/Modules/CommunityContent/Api/Controllers/CommunitiesController.cs
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.Api.Modules.CommunityContent.Application.Contracts.Dtos;
using Backend.Api.Modules.CommunityContent.Application.Contracts.Services;
using Backend.Api.Modules.CommunityContent.Domain.Enums; // Cho CommunityRole
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Modules.CommunityContent.Api.Controllers
{
    [ApiController]
    [Route("api/communities")]
    public class CommunitiesController : ControllerBase
    {
        private readonly ICommunityService _communityService;
        private readonly ICommunityMemberService _communityMemberService;
        private readonly ILogger<CommunitiesController> _logger;
        private readonly IPostService _postService;

        public CommunitiesController(
            ICommunityService communityService,
            ICommunityMemberService communityMemberService,
            ILogger<CommunitiesController> logger,
            IPostService postService)
        {
            _communityService = communityService;
            _communityMemberService = communityMemberService;
            _logger = logger;
            _postService = postService;
        }

        // --- Community Management ---

        // POST api/communities
        [HttpPost]
        [Authorize] // Bất kỳ user nào đã đăng nhập cũng có thể tạo community (theo logic hiện tại)
        public async Task<IActionResult> CreateCommunity([FromBody] CreateCommunityRequest request)
        {
            var creatorUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(creatorUserIdString, out var creatorUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var communityDto = await _communityService.CreateCommunityAsync(request, creatorUserId);
                return CreatedAtAction(nameof(GetCommunityById), new { id = communityDto.Id }, communityDto);
            }
            catch (ArgumentException ex) // Ví dụ: Tên community đã tồn tại
            {
                _logger.LogInformation(ex, "CreateCommunity: Argument exception by User {UserId}.", creatorUserIdString);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CreateCommunity: Unexpected error for request by User {UserId}.", creatorUserIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating the community.");
            }
        }

        // GET api/communities/{id}
        [HttpGet("{id:guid}", Name = "GetCommunityById")]
        [AllowAnonymous] // Cho phép xem chi tiết Community mà không cần đăng nhập (nếu IsPublic)
                         // Service sẽ cần kiểm tra IsPublic nếu người dùng chưa đăng nhập
        public async Task<IActionResult> GetCommunityById(Guid id)
        {
            // var requestorUserId = User.Identity.IsAuthenticated ? Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)) : (Guid?)null;
            // Service GetCommunityByIdAsync có thể cần requestorUserId để kiểm tra quyền xem private community
            var communityDto = await _communityService.GetCommunityByIdAsync(id);
            if (communityDto == null)
            {
                return NotFound(new { message = $"Community with ID {id} not found." });
            }
            // Nếu community không public và người dùng chưa đăng nhập (hoặc không phải thành viên/admin), service nên trả về null hoặc throw Unauthorized
            return Ok(communityDto);
        }

        // GET api/communities/name/{name}
        [HttpGet("name/{name}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCommunityByName(string name)
        {
            var communityDto = await _communityService.GetCommunityByNameAsync(name);
            if (communityDto == null)
            {
                return NotFound(new { message = $"Community with name '{name}' not found." });
            }
            return Ok(communityDto);
        }

        // GET api/communities/search
        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchCommunities([FromQuery] CommunitySearchCriteriaDto criteria)
        {
            try
            {
                var pagedResult = await _communityService.SearchCommunitiesAsync(criteria);
                return Ok(pagedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SearchCommunities: Error searching communities with criteria {@Criteria}", criteria);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while searching for communities.");
            }
        }

        // PUT api/communities/{id}
        [HttpPut("{id:guid}")]
        [Authorize] // Cần đăng nhập
        public async Task<IActionResult> UpdateCommunity(Guid id, [FromBody] UpdateCommunityRequest request)
        {
            var updaterUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(updaterUserIdString, out var updaterUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                // Service UpdateCommunityAsync sẽ kiểm tra quyền (updaterUserId phải là creator hoặc Admin/Mod của community)
                var updatedCommunityDto = await _communityService.UpdateCommunityAsync(id, request, updaterUserId);
                if (updatedCommunityDto == null)
                {
                    return NotFound(new { message = $"Community with ID {id} not found for update." });
                }
                return Ok(updatedCommunityDto);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "UpdateCommunity: Unauthorized attempt for Community {CommunityId} by User {UserId}.", id, updaterUserIdString);
                return Forbid(ex.Message);
            }
            catch (ArgumentException ex) // Ví dụ: Tên mới đã tồn tại
            {
                _logger.LogInformation(ex, "UpdateCommunity: Argument exception for Community {CommunityId}.", id);
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogInformation(ex, "UpdateCommunity: Community not found for ID {CommunityId}.", id);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "UpdateCommunity: Unexpected error for Community {CommunityId} by User {UserId}.", id, updaterUserIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating the community.");
            }
        }

        // DELETE api/communities/{id}
        [HttpDelete("{id:guid}")]
        [Authorize] // Cần đăng nhập
        public async Task<IActionResult> DeleteCommunity(Guid id)
        {
            var deleterUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(deleterUserIdString, out var deleterUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                // Service DeleteCommunityAsync sẽ kiểm tra quyền
                var success = await _communityService.DeleteCommunityAsync(id, deleterUserId);
                if (!success)
                {
                    return NotFound(new { message = $"Community with ID {id} not found or deletion failed." });
                }
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "DeleteCommunity: Unauthorized attempt for Community {CommunityId} by User {UserId}.", id, deleterUserIdString);
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogInformation(ex, "DeleteCommunity: Community not found for ID {CommunityId}.", id);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DeleteCommunity: Unexpected error for Community {CommunityId} by User {UserId}.", id, deleterUserIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while deleting the community.");
            }
        }


        // --- Community Member Management ---

        // POST api/communities/{communityId}/members/join
        [HttpPost("{communityId:guid}/members/join")]
        [Authorize] // User phải đăng nhập để join
        public async Task<IActionResult> JoinCommunity(Guid communityId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var memberDto = await _communityMemberService.JoinCommunityAsync(communityId, userId);
                return Ok(memberDto); // Hoặc CreatedAtAction nếu có endpoint GetMemberDetails
            }
            catch (KeyNotFoundException ex) // Community không tồn tại
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex) // Ví dụ: đã là thành viên, hoặc community private
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex) // Ví dụ: community private không cho join
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "JoinCommunity: User {UserId} error joining Community {CommunityId}.", userIdString, communityId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while joining the community.");
            }
        }

        // DELETE api/communities/{communityId}/members/leave (User tự rời)
        [HttpDelete("{communityId:guid}/members/leave")]
        [Authorize]
        public async Task<IActionResult> LeaveCommunity(Guid communityId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var success = await _communityMemberService.LeaveCommunityAsync(communityId, userId);
                if (!success)
                {
                    // Có thể user không phải là thành viên
                    return BadRequest(new { message = "Failed to leave community. You might not be a member." });
                }
                return Ok(new { message = "Successfully left the community." }); // Hoặc NoContent()
            }
            catch (InvalidOperationException ex) // Ví dụ: admin cuối cùng không được rời
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "LeaveCommunity: User {UserId} error leaving Community {CommunityId}.", userIdString, communityId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while leaving the community.");
            }
        }

        // GET api/communities/{communityId}/members
        [HttpGet("{communityId:guid}/members")]
        [AllowAnonymous] // Hoặc [Authorize] nếu chỉ member/admin mới được xem
        public async Task<IActionResult> GetCommunityMembers(Guid communityId)
        {
            // Service có thể cần kiểm tra IsPublic của community nếu người dùng chưa đăng nhập
            try
            {
                var members = await _communityMemberService.GetCommunityMembersAsync(communityId);
                return Ok(members);
            }
            catch (KeyNotFoundException ex) // Community không tồn tại
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetCommunityMembers: Error fetching members for Community {CommunityId}.", communityId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while fetching community members.");
            }
        }


        // --- Admin/Moderator actions for Community Members ---

        // PUT api/communities/{communityId}/members/{targetUserId}/role
        [HttpPut("{communityId:guid}/members/{targetUserId:guid}/role")]
        [Authorize] // Cần đăng nhập, service sẽ kiểm tra quyền Admin/Mod của community
        public async Task<IActionResult> UpdateMemberRole(Guid communityId, Guid targetUserId, [FromBody] UpdateCommunityMemberRoleRequest request)
        {
            var adminOrModUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(adminOrModUserIdString, out var adminOrModUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var updatedMemberDto = await _communityMemberService.UpdateMemberRoleAsync(communityId, targetUserId, request.NewRole, adminOrModUserId);
                if (updatedMemberDto == null)
                {
                    return NotFound(new { message = $"Membership for user {targetUserId} in community {communityId} not found or update failed." });
                }
                return Ok(updatedMemberDto);
            }
            // ... (Thêm các catch block: KeyNotFound, Unauthorized, InvalidOperation, Argument, Exception) ...
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "UpdateMemberRole error for TargetUser {TargetUserId} in Community {CommunityId} by Admin/Mod {AdminOrModUserId}", targetUserId, communityId, adminOrModUserId);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error updating member role.");
            }
        }

        // DELETE api/communities/{communityId}/members/{targetUserId} (Admin/Mod kick member)
        [HttpDelete("{communityId:guid}/members/{targetUserId:guid}")]
        [Authorize]
        public async Task<IActionResult> RemoveMemberFromCommunity(Guid communityId, Guid targetUserId)
        {
            var adminOrModUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(adminOrModUserIdString, out var adminOrModUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var success = await _communityMemberService.RemoveMemberAsync(communityId, targetUserId, adminOrModUserId);
                if (!success)
                {
                    return NotFound(new { message = $"Membership for user {targetUserId} in community {communityId} not found or removal failed." });
                }
                return Ok(new { message = $"User {targetUserId} removed from community {communityId}." }); // Hoặc NoContent()
            }
            // ... (Thêm các catch block) ...
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RemoveMemberFromCommunity error for TargetUser {TargetUserId} in Community {CommunityId} by Admin/Mod {AdminOrModUserId}", targetUserId, communityId, adminOrModUserId);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error removing member.");
            }
        }

        // GET api/users/me/communities (Lấy danh sách community mà user hiện tại tham gia)
        // Endpoint này có thể đặt ở UsersController hoặc ở đây. Đặt ở đây có vẻ hợp lý hơn.
        [HttpGet("my-memberships")] // Route tuyệt đối để tránh xung đột với /api/communities
        [Authorize]
        public async Task<IActionResult> GetMyCommunityMemberships()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }
            var memberships = await _communityMemberService.GetUserMembershipsAsync(userId);
            return Ok(memberships);
        }


        [HttpGet("{communityId:guid}/posts")] // Route cụ thể hơn
        [AllowAnonymous]
        public async Task<IActionResult> GetPostsByCommunity(Guid communityId, [FromQuery] PostSearchCriteriaDto criteria)
        {
            // Service GetPostsByCommunityAsync có thể cần kiểm tra IsPublic của community
            try
            {
                // Gán CommunityId từ route vào criteria nếu criteria không có
                var effectiveCriteria = criteria with { CommunityId = communityId };
                var pagedResult = await _postService.GetPostsByCommunityAsync(communityId, effectiveCriteria);
                return Ok(pagedResult);
            }
            catch (KeyNotFoundException ex) // Community không tồn tại
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetPostsByCommunity: Error for Community {CommunityId}, Criteria: {@Criteria}", communityId, criteria);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while fetching posts for the community.");
            }
        }
    }
}