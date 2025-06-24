using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Backend.Api.Infrastructure.Exceptions;
using Backend.Api.Modules.SpaceBooking.Application.Services;

namespace Backend.Api.Modules.SpaceBooking.Api.Controllers
{
    [ApiController]
    [Route("api/ical")]
    public class IcalExportController : ControllerBase
    {
        private readonly IIcalExportService _icalExportService;

        public IcalExportController(IIcalExportService icalExportService)
        {
            _icalExportService = icalExportService;
        }

        /// <summary>
        /// Get iCal calendar for a space's bookings
        /// </summary>
        /// <param name="spaceId">ID of the space</param>
        /// <returns>iCal calendar file</returns>
        [HttpGet("space/{spaceId}.ics")]
        [Produces("text/calendar")]
        public async Task<IActionResult> GetSpaceCalendar(Guid spaceId)
        {
            try
            {
                var calendarContent = await _icalExportService.GenerateSpaceCalendarAsync(spaceId);
                return Content(calendarContent, "text/calendar");
            }
            catch (NotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                // Log the error
                return StatusCode(500, "An error occurred while generating the calendar");
            }
        }
    }
}
