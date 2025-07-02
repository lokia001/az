// File: Backend.Api/Modules/UserRelated/Api/Controllers/FavoriteSpacesController.cs
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Backend.Api.Modules.UserRelated.Application.Contracts.Services;
using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos;

namespace Backend.Api.Modules.UserRelated.Api.Controllers
{
    [ApiController]
    [Route("api/favorite-spaces")]
    [Authorize]
    public class FavoriteSpacesController : ControllerBase
    {
        private readonly IFavoriteSpaceService _favoriteSpaceService;
        private readonly ILogger<FavoriteSpacesController> _logger;

        public FavoriteSpacesController(
            IFavoriteSpaceService favoriteSpaceService,
            ILogger<FavoriteSpacesController> logger)
        {
            _favoriteSpaceService = favoriteSpaceService;
            _logger = logger;
        }

        /// <summary>
        /// Get all favorite spaces for the current user
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<FavoriteSpaceDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetMyFavoriteSpaces()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var favoriteSpaces = await _favoriteSpaceService.GetUserFavoriteSpacesAsync(userId);
                return Ok(favoriteSpaces);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting favorite spaces for user {UserId}", userId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while retrieving favorite spaces." });
            }
        }

        /// <summary>
        /// Add a space to favorites
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(FavoriteSpaceDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> AddToFavorites([FromBody] AddFavoriteSpaceRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            if (request.SpaceId == Guid.Empty)
            {
                return BadRequest(new { message = "Space ID is required." });
            }

            try
            {
                var favoriteSpace = await _favoriteSpaceService.AddToFavoritesAsync(userId, request.SpaceId);
                return CreatedAtAction(nameof(GetFavoriteStatus), 
                    new { spaceId = request.SpaceId }, favoriteSpace);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid request to add space {SpaceId} to favorites for user {UserId}", 
                    request.SpaceId, userId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding space {SpaceId} to favorites for user {UserId}", 
                    request.SpaceId, userId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while adding space to favorites." });
            }
        }

        /// <summary>
        /// Remove a space from favorites
        /// </summary>
        [HttpDelete("{spaceId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RemoveFromFavorites(Guid spaceId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var removed = await _favoriteSpaceService.RemoveFromFavoritesAsync(userId, spaceId);
                if (!removed)
                {
                    return NotFound(new { message = "Space not found in favorites." });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing space {SpaceId} from favorites for user {UserId}", 
                    spaceId, userId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while removing space from favorites." });
            }
        }

        /// <summary>
        /// Get favorite status for a specific space
        /// </summary>
        [HttpGet("status/{spaceId:guid}")]
        [ProducesResponseType(typeof(FavoriteSpaceStatusDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetFavoriteStatus(Guid spaceId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var status = await _favoriteSpaceService.GetFavoriteStatusAsync(userId, spaceId);
                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting favorite status for space {SpaceId} and user {UserId}", 
                    spaceId, userId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while getting favorite status." });
            }
        }

        /// <summary>
        /// Get favorite statuses for multiple spaces
        /// </summary>
        [HttpPost("statuses")]
        [ProducesResponseType(typeof(IEnumerable<FavoriteSpaceStatusDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetFavoriteStatuses([FromBody] IEnumerable<Guid> spaceIds)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            try
            {
                var statuses = await _favoriteSpaceService.GetFavoriteStatusesAsync(userId, spaceIds);
                return Ok(statuses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting favorite statuses for user {UserId}", userId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while getting favorite statuses." });
            }
        }
    }
}
