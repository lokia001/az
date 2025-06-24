using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Backend.Api.Data;
using Backend.Api.Infrastructure.Identity;
using Backend.Api.Infrastructure.Exceptions;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.Modules.SpaceBooking.Domain.Enums;
using Backend.Api.Modules.SpaceBooking.Application.DTOs;

namespace Backend.Api.Modules.SpaceBooking.Application.Services
{
    public class SpaceIcalSettingsService : ISpaceIcalSettingsService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IConfiguration _configuration;

        public SpaceIcalSettingsService(
            AppDbContext context,
            ICurrentUserService currentUserService,
            IConfiguration configuration)
        {
            _context = context;
            _currentUserService = currentUserService;
            _configuration = configuration;
        }

        public async Task<SpaceIcalSettingsDto> GetSpaceIcalSettingsAsync(Guid spaceId)
        {
            var space = await _context.Spaces
                .Include(s => s.IcalSettings)
                .FirstOrDefaultAsync(s => s.Id == spaceId);
 
            if (space == null)
            {
                throw new Backend.Api.Infrastructure.Exceptions.NotFoundException($"Space with ID {spaceId} not found");
            }

            // Check ownership
            if (space.OwnerId.ToString() != _currentUserService.UserId)
            {
                throw new UnauthorizedException("You don't have permission to access this space's iCal settings");
            }

            var settings = space.IcalSettings;
            if (settings == null)
            {
                // Create default settings if none exist
                var exportUrl = await Task.FromResult($"{_configuration["AppUrl"]?.TrimEnd('/')}/api/ical/space/{spaceId}.ics");
                settings = new SpaceIcalSetting
                {
                    SpaceId = spaceId,
                    Space = space,
                    ImportIcalUrlsJson = "[]",
                    ExportIcalUrl = exportUrl,
                    CreatedBy = _currentUserService.UserId,
                    UpdatedBy = _currentUserService.UserId
                };
                _context.SpaceIcalSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return new SpaceIcalSettingsDto
            {
                SpaceId = spaceId,
                ImportIcalUrls = JsonSerializer.Deserialize<List<string>>(settings.ImportIcalUrlsJson) ?? new(),
                ExportIcalUrl = settings.ExportIcalUrl,
                LastSyncAttempt = settings.LastSyncAttempt,
                LastSyncStatus = settings.SyncStatus.ToString(),
                LastSyncError = settings.LastSyncError
            };
        }

        public Task<string> GenerateExportUrlAsync(Guid spaceId)
        {
            var baseUrl = _configuration["AppUrl"] ?? throw new InvalidOperationException("AppUrl not configured");
            var url = $"{baseUrl.TrimEnd('/')}/api/ical/space/{spaceId}.ics";
            return Task.FromResult(url);
        }

        public async Task<SpaceIcalSettingsDto> UpdateSpaceIcalSettingsAsync(Guid spaceId, UpdateSpaceIcalSettingsDto dto)
        {
            var settings = await _context.SpaceIcalSettings
                .Include(s => s.Space)
                .FirstOrDefaultAsync(s => s.SpaceId == spaceId);

            if (settings?.Space == null)
            {
                throw new NotFoundException($"Space iCal settings not found for space {spaceId}");
            }

            // Check ownership
            if (settings.Space.OwnerId.ToString() != _currentUserService.UserId)
            {
                throw new UnauthorizedException("You don't have permission to update this space's iCal settings");
            }

            // Update settings
            settings.ImportIcalUrlsJson = JsonSerializer.Serialize(dto.ImportIcalUrls);
            settings.UpdatedAt = DateTime.UtcNow;
            settings.UpdatedBy = _currentUserService.UserId;

            await _context.SaveChangesAsync();

            // Trigger sync after update
            await TriggerSyncAsync(spaceId);

            return await GetSpaceIcalSettingsAsync(spaceId);
        }

        public async Task<bool> TriggerSyncAsync(Guid spaceId)
        {
            var settings = await _context.SpaceIcalSettings
                .FirstOrDefaultAsync(s => s.SpaceId == spaceId);

            if (settings == null)
            {
                throw new NotFoundException($"iCal settings not found for space {spaceId}");
            }

            if (settings.IsSyncInProgress)
            {
                return false; // Already syncing
            }

            // Update sync status
            settings.IsSyncInProgress = true;
            settings.LastSyncAttempt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // TODO: Trigger background job for actual sync
            // For now, we'll just mark it as successful
            settings.IsSyncInProgress = false;
            settings.SyncStatus = SyncStatus.Success;
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
