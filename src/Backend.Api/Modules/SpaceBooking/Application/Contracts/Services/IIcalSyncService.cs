using System;
using System.Threading.Tasks;

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Services
{
    public interface IIcalSyncService
    {
        /// <summary>
        /// Synchronizes all spaces that have iCal import settings configured
        /// </summary>
        Task SyncAllSpacesAsync();

        /// <summary>
        /// Synchronizes a specific space's iCal calendars
        /// </summary>
        /// <param name="spaceId">The ID of the space to synchronize</param>
        Task SyncSpaceAsync(Guid spaceId);
    }
}
