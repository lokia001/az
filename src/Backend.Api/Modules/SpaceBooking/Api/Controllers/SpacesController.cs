// File: Backend.Api/Modules/SpaceBooking/Api/Controllers/SpacesController.cs
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging; // Thêm using cho ILogger

namespace Backend.Api.Modules.SpaceBooking.Api.Controllers
{
    [ApiController]
    [Route("api/owner/spaces")]
    public class SpacesController : ControllerBase
    {
        private readonly ISpaceService _spaceService;
        private readonly ILogger<SpacesController> _logger;

        public SpacesController(ISpaceService spaceService, ILogger<SpacesController> logger)
        {
            _spaceService = spaceService;
            _logger = logger;
        }

        // POST api/spaces
        [HttpPost]
        [Authorize(Roles = "Owner,SysAdmin")] // Chỉ Owner hoặc SysAdmin được tạo Space
        public async Task<IActionResult> CreateSpace([FromBody] CreateSpaceRequest request)
        {
            var creatorUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(creatorUserIdString, out var creatorUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var spaceDto = await _spaceService.CreateSpaceAsync(request, creatorUserId);
                return CreatedAtAction(nameof(GetSpaceById), new { id = spaceDto.Id }, spaceDto);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("CreateSpace: Unauthorized attempt by User {UserId}. Message: {Message}", creatorUserIdString, ex.Message);
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogInformation("CreateSpace: Argument exception. Message: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CreateSpace: Unexpected error for request by User {UserId}.", creatorUserIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred while creating the space.");
            }
        }


        // GET api/spaces/{id}
        [HttpGet("{id:guid}", Name = "GetSpaceById")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSpaceById(Guid id)
        {
            var spaceDto = await _spaceService.GetSpaceByIdAsync(id);
            if (spaceDto == null)
            {
                return NotFound(new { message = $"Space with ID {id} not found." });
            }
            return Ok(spaceDto);
        }

        // GET api/spaces/slug/{slug}
        [HttpGet("slug/{slug}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSpaceBySlug(string slug)
        {
            var spaceDto = await _spaceService.GetSpaceBySlugAsync(slug);
            if (spaceDto == null)
            {
                return NotFound(new { message = $"Space with slug '{slug}' not found." });
            }
            return Ok(spaceDto);
        }

        // GET api/spaces/owner/{ownerId}
        [HttpGet("owner/{ownerId:guid}")]
        [AllowAnonymous] // Hoặc [Authorize] nếu muốn bảo vệ
        public async Task<IActionResult> GetSpacesByOwner(Guid ownerId)
        {
            var spaces = await _spaceService.GetSpacesByOwnerAsync(ownerId);
            return Ok(spaces);
        }

        // PUT api/spaces/{id}
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Owner,SysAdmin")]
        public async Task<IActionResult> UpdateSpace(Guid id, [FromBody] UpdateSpaceRequest request)
        {
            var editorUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(editorUserIdString, out var editorUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var updatedSpaceDto = await _spaceService.UpdateSpaceAsync(id, request, editorUserId);
                if (updatedSpaceDto == null) // Service có thể trả về null nếu không tìm thấy space để update
                {
                    return NotFound(new { message = $"Space with ID {id} not found for update." });
                }
                return Ok(updatedSpaceDto);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogInformation("UpdateSpace: Space not found for ID {SpaceId}. Message: {Message}", id, ex.Message);
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("UpdateSpace: Unauthorized attempt for Space {SpaceId} by User {UserId}. Message: {Message}", id, editorUserIdString, ex.Message);
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogInformation("UpdateSpace: Argument exception for Space {SpaceId}. Message: {Message}", id, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "UpdateSpace: Unexpected error for Space {SpaceId} by User {UserId}.", id, editorUserIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred while updating the space.");
            }
        }

        // DELETE api/spaces/{id}
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Owner,SysAdmin")]
        public async Task<IActionResult> DeleteSpace(Guid id)
        {
            var deleterUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(deleterUserIdString, out var deleterUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var success = await _spaceService.DeleteSpaceAsync(id, deleterUserId);
                if (!success)
                {
                    return NotFound(new { message = $"Space with ID {id} not found or deletion failed." });
                }
                return NoContent();
            }
            catch (InvalidOperationException ex) // Ví dụ: không thể xóa do còn active bookings
            {
                _logger.LogInformation("DeleteSpace: Invalid operation for Space {SpaceId}. Message: {Message}", id, ex.Message);
                return BadRequest(new { message = ex.Message }); // Hoặc Conflict (409)
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogInformation("DeleteSpace: Space not found for ID {SpaceId}. Message: {Message}", id, ex.Message);
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("DeleteSpace: Unauthorized attempt for Space {SpaceId} by User {UserId}. Message: {Message}", id, deleterUserIdString, ex.Message);
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DeleteSpace: Unexpected error for Space {SpaceId} by User {UserId}.", id, deleterUserIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred while deleting the space.");
            }
        }

        // --- Endpoints cho quản lý ảnh ---


        // POST api/spaces/{spaceId}/images
        [HttpPost("{spaceId:guid}/images")]
        [Authorize(Roles = "Owner,SysAdmin")]
        public async Task<IActionResult> AddImageToSpace(Guid spaceId, [FromForm] UploadSpaceImageRequest request)
        {
            var uploaderUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(uploaderUserIdString, out var uploaderUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            if (request.ImageFile == null || request.ImageFile.Length == 0)
            {
                return BadRequest(new { message = "Image file is required." });
            }
            // Thêm kiểm tra kích thước file, loại file nếu cần
            // Ví dụ: if (request.ImageFile.Length > 5 * 1024 * 1024) return BadRequest("File size exceeds 5MB limit.");
            // Ví dụ: if (!IsImageFile(request.ImageFile)) return BadRequest("Invalid file type.");

            try
            {
                var imageDto = await _spaceService.AddImageToSpaceAsync(spaceId, request, uploaderUserId);
                // Trả về thông tin ảnh vừa tạo, có thể trỏ đến một endpoint GET ảnh cụ thể nếu có
                return Ok(imageDto); // Hoặc CreatedAtAction nếu có endpoint GetImageById
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (ArgumentException ex) // Từ FileStorageService hoặc logic nghiệp vụ
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AddImageToSpace: Error for Space {SpaceId} by User {UserId}", spaceId, uploaderUserIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while adding the image.");
            }
        }

        // DELETE api/spaces/{spaceId}/images/{imageId}
        [HttpDelete("{spaceId:guid}/images/{imageId:guid}")]
        [Authorize(Roles = "Owner,SysAdmin")]
        public async Task<IActionResult> RemoveImageFromSpace(Guid spaceId, Guid imageId)
        {
            var removerUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(removerUserIdString, out var removerUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var success = await _spaceService.RemoveImageFromSpaceAsync(spaceId, imageId, removerUserId);
                if (!success)
                {
                    return NotFound(new { message = $"Image with ID {imageId} not found for space {spaceId}, or deletion failed." });
                }
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RemoveImageFromSpace: Error for Image {ImageId}, Space {SpaceId} by User {UserId}", imageId, spaceId, removerUserIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while removing the image.");
            }
        }

        // PUT api/spaces/{spaceId}/images/{imageId}/details
        [HttpPut("{spaceId:guid}/images/{imageId:guid}/details")]
        [Authorize(Roles = "Owner,SysAdmin")]
        public async Task<IActionResult> UpdateSpaceImageDetails(Guid spaceId, Guid imageId, [FromBody] UpdateSpaceImageDetailsRequest request)
        {
            var editorUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(editorUserIdString, out var editorUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var updatedImageDto = await _spaceService.UpdateSpaceImageDetailsAsync(spaceId, imageId, request, editorUserId);
                if (updatedImageDto == null)
                {
                    return NotFound(new { message = $"Image with ID {imageId} not found for space {spaceId}." });
                }
                return Ok(updatedImageDto);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "UpdateSpaceImageDetails: Error for Image {ImageId}, Space {SpaceId} by User {UserId}", imageId, spaceId, editorUserIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating image details.");
            }
        }

        // POST api/spaces/{spaceId}/images/{imageId}/set-cover
        [HttpPost("{spaceId:guid}/images/{imageId:guid}/set-cover")]
        [Authorize(Roles = "Owner,SysAdmin")]
        public async Task<IActionResult> SetCoverImage(Guid spaceId, Guid imageId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var success = await _spaceService.SetCoverImageAsync(spaceId, imageId, userId);
                if (!success)
                {
                    return NotFound(new { message = $"Image with ID {imageId} not found for space {spaceId}, or failed to set as cover." });
                }
                return Ok(new { message = "Cover image set successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SetCoverImage: Error for Image {ImageId}, Space {SpaceId} by User {UserId}", imageId, spaceId, userIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while setting the cover image.");
            }
        }

        // GET api/spaces/search
        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchSpaces([FromQuery] SpaceSearchCriteria criteria)
        {
            try
            {
                var pagedResult = await _spaceService.SearchSpacesAsync(criteria);
                return Ok(pagedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SearchSpaces: Error searching spaces with criteria {@Criteria}", criteria);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while searching for spaces.");
            }
        }

        // GET api/owner/spaces/{spaceId}/images
        [HttpGet("{spaceId:guid}/images")]
        [Authorize(Roles = "Owner,SysAdmin")]
        public async Task<IActionResult> GetImagesForSpace(Guid spaceId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var spaceDto = await _spaceService.GetSpaceByIdAsync(spaceId);
                if (spaceDto == null)
                {
                    return NotFound(new { message = $"Space with ID {spaceId} not found." });
                }
                if (spaceDto.OwnerId != userId)
                {
                    return StatusCode(StatusCodes.Status403Forbidden, new { message = "You are not the owner of this space." });
                }
                // Return the images list (spaceImages)
                return Ok(spaceDto.SpaceImages ?? new List<SpaceImageDto>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetImagesForSpace: Error for Space {SpaceId} by User {UserId}", spaceId, userIdString);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving images for the space.");
            }
        }
    }
}