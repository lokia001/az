// File: Backend.Api/Modules/SpaceBooking/Api/Controllers/PublicSpacesController.cs
using System;
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
    [Route("api/spaces")]
    public class PublicSpacesController : ControllerBase
    {
        private readonly ISpaceService _spaceService;
        private readonly ILogger<PublicSpacesController> _logger;

        public PublicSpacesController(ISpaceService spaceService, ILogger<PublicSpacesController> logger)
        {
            _spaceService = spaceService;
            _logger = logger;
        }

        /// <summary>
        /// Search spaces with filters (Public endpoint for users/guests)
        /// </summary>
        /// <param name="criteria">Search criteria including filters</param>
        /// <returns>Paginated list of spaces</returns>
        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchSpaces([FromQuery] SpaceSearchCriteria criteria)
        {
            try
            {
                _logger.LogInformation("SearchSpaces: Searching spaces with criteria {@Criteria}", criteria);
                var pagedResult = await _spaceService.SearchSpacesAsync(criteria);
                _logger.LogInformation("SearchSpaces: Found {Count} spaces", pagedResult.Items?.Count() ?? 0);
                return Ok(pagedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SearchSpaces: Error searching spaces with criteria {@Criteria}", criteria);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while searching for spaces.");
            }
        }

        /// <summary>
        /// Find nearby spaces based on user location (Public endpoint for users/guests)
        /// </summary>
        /// <param name="criteria">Nearby search criteria including user coordinates</param>
        /// <returns>List of nearby spaces</returns>
        [HttpGet("nearby")]
        [AllowAnonymous]
        public async Task<IActionResult> GetNearbySpaces([FromQuery] NearbySpaceSearchCriteria criteria)
        {
            try
            {
                _logger.LogInformation("GetNearbySpaces: Searching nearby spaces with criteria {@Criteria}", criteria);
                var spaces = await _spaceService.FindNearbySpacesAsync(criteria);
                _logger.LogInformation("GetNearbySpaces: Found {Count} nearby spaces", spaces?.Count() ?? 0);
                return Ok(spaces);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetNearbySpaces: Error finding nearby spaces with criteria {@Criteria}", criteria);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while finding nearby spaces.");
            }
        }

        /// <summary>
        /// Get space details by ID (Public endpoint for users/guests)
        /// </summary>
        /// <param name="id">Space ID</param>
        /// <returns>Space details</returns>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSpaceById(Guid id)
        {
            try
            {
                _logger.LogInformation("GetSpaceById: Getting space with ID {SpaceId}", id);
                var space = await _spaceService.GetSpaceByIdAsync(id);
                if (space == null)
                {
                    _logger.LogWarning("GetSpaceById: Space with ID {SpaceId} not found", id);
                    return NotFound(new { message = "Space not found." });
                }
                return Ok(space);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetSpaceById: Error getting space with ID {SpaceId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving the space.");
            }
        }

        /// <summary>
        /// Get all available spaces (Public endpoint for users/guests)
        /// </summary>
        /// <returns>List of all available spaces</returns>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllSpaces()
        {
            try
            {
                _logger.LogInformation("GetAllSpaces: Getting all available spaces");
                var spaces = await _spaceService.GetAllAvailableSpacesAsync();
                _logger.LogInformation("GetAllSpaces: Found {Count} available spaces", spaces?.Count() ?? 0);
                return Ok(spaces);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetAllSpaces: Error getting all available spaces");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving spaces.");
            }
        }
    }
}
