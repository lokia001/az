using System;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Application.DTOs;

namespace Backend.Api.Modules.SpaceBooking.Application.Services
{
    public interface ISpaceIcalSettingsService
    {
        Task<SpaceIcalSettingsDto> GetSpaceIcalSettingsAsync(Guid spaceId);
        Task<SpaceIcalSettingsDto> UpdateSpaceIcalSettingsAsync(Guid spaceId, UpdateSpaceIcalSettingsDto dto);
        Task<bool> TriggerSyncAsync(Guid spaceId);
        Task<string> GenerateExportUrlAsync(Guid spaceId);
    }
}
