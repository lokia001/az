using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Api.Modules.SpaceBooking.Application.Services;
using Backend.Api.Modules.SpaceBooking.Application.DTOs;
using System;
using System.Threading.Tasks;

namespace Backend.Api.Modules.SpaceBooking.Api.Controllers
{
    [ApiController]
    [Route("api/spaces")]
    [Authorize]
    public class SpaceIcalSettingsController : ControllerBase
    {
        private readonly ISpaceIcalSettingsService _icalSettingsService;

        public SpaceIcalSettingsController(ISpaceIcalSettingsService icalSettingsService)
        {
            _icalSettingsService = icalSettingsService;
        }

        /// <summary>
        /// Get iCal settings for a specific space
        /// </summary>
        /// <param name="spaceId">ID of the space</param>
        /// <returns>iCal settings for the space</returns>
        [HttpGet("{spaceId}/ical-settings")]
        [ProducesResponseType(typeof(SpaceIcalSettingsDto), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetSpaceIcalSettings(Guid spaceId)
        {
            var result = await _icalSettingsService.GetSpaceIcalSettingsAsync(spaceId);
            return Ok(result);
        }
    }
}
