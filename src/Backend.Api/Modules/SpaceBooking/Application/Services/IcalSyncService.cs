using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;
using Backend.Api.Data;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Services;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.Modules.SpaceBooking.Domain.Enums;
using Ical.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace Backend.Api.Modules.SpaceBooking.Application.Services
{
    public class IcalSyncService : IIcalSyncService
    {
        private readonly AppDbContext _dbContext;
        private readonly ILogger<IcalSyncService> _logger;
        private readonly HttpClient _httpClient;

        public IcalSyncService(
            AppDbContext dbContext,
            ILogger<IcalSyncService> logger,
            IHttpClientFactory httpClientFactory)
        {
            _dbContext = dbContext;
            _logger = logger;
            _httpClient = httpClientFactory.CreateClient("IcalSync");
        }

        public async Task SyncAllSpacesAsync()
        {
            var spaces = await _dbContext.SpaceIcalSettings
                .Include(s => s.Space)
                .Where(s => !string.IsNullOrEmpty(s.ImportIcalUrlsJson))
                .ToListAsync();

            foreach (var space in spaces)
            {
                await SyncSpaceInternalAsync(space.SpaceId);
            }
        }

        public async Task SyncSpaceAsync(Guid spaceId)
        {
            await SyncSpaceInternalAsync(spaceId);
        }

        private async Task SyncSpaceInternalAsync(Guid spaceId)
        {
            var settings = await _dbContext.SpaceIcalSettings
                .Include(s => s.Space)
                .FirstOrDefaultAsync(s => s.SpaceId == spaceId);

            if (settings == null || string.IsNullOrEmpty(settings.ImportIcalUrlsJson))
            {
                _logger.LogInformation($"No iCal settings found for space {spaceId}");
                return;
            }

            var importUrls = JsonSerializer.Deserialize<List<string>>(settings.ImportIcalUrlsJson) ?? new List<string>();
            if (!importUrls.Any())
            {
                _logger.LogInformation($"No iCal URLs configured for space {spaceId}");
                return;
            }

            try
            {
                // Update sync status
                settings.LastSyncAttempt = DateTime.UtcNow;
                settings.IsSyncInProgress = true;
                settings.SyncStatus = SyncStatus.InProgress;
                await _dbContext.SaveChangesAsync();

                foreach (var url in importUrls)
                {
                    await ProcessIcalUrlAsync(settings.Space, url);
                }

                // Update sync status on success
                settings.SyncStatus = SyncStatus.Success;
                settings.LastSyncError = null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error syncing iCal for space {spaceId}");
                settings.LastSyncError = ex.Message;
                settings.SyncStatus = SyncStatus.Failed;
            }
            finally
            {
                settings.IsSyncInProgress = false;
                await _dbContext.SaveChangesAsync();
            }
        }

        private async Task ProcessIcalUrlAsync(Space space, string url)
        {
            try
            {
                // Get current external bookings for this space and URL
                var existingBookings = await _dbContext.Bookings
                    .Where(b => 
                        b.SpaceId == space.Id && 
                        b.ExternalIcalUrl == url &&
                        b.IsExternalBooking &&
                        b.Status != BookingStatus.Cancelled)
                    .ToListAsync();

                var processedEventIds = new HashSet<string>();
                var response = await _httpClient.GetStringAsync(url);
                var calendar = Calendar.Load(response);

                if (calendar?.Events == null)
                {
                    _logger.LogWarning($"No events found in iCal feed: {url}");
                    // Mark all existing bookings from this URL as cancelled since the feed is empty
                    await MarkOldBookingsAsCancelled(existingBookings);
                    return;
                }

                foreach (var evt in calendar.Events)
                {
                    // Skip events without required fields
                    if (evt.Start?.Value == null || evt.End?.Value == null || string.IsNullOrEmpty(evt.Uid))
                    {
                        _logger.LogWarning($"Skipping event with missing required fields from URL {url}");
                        continue;
                    }

                    processedEventIds.Add(evt.Uid);
                    var startTime = evt.Start.Value;
                    var endTime = evt.End.Value;
                    var summary = evt.Summary ?? "External Booking";

                    var existingBooking = existingBookings
                        .FirstOrDefault(b => b.ExternalIcalUid == evt.Uid);

                    if (existingBooking == null)
                    {
                        // Create new booking
                        var booking = new Booking
                        {
                            SpaceId = space.Id,
                            StartTime = startTime,
                            EndTime = endTime,
                            NotesFromUser = summary,
                            Status = BookingStatus.External,
                            ExternalIcalUrl = url,
                            ExternalIcalUid = evt.Uid,
                            IsExternalBooking = true,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow,
                            // Required fields
                            UserId = Guid.Empty, // System user or a designated external booking user
                            NumberOfPeople = 1, // Default value
                            TotalPrice = 0 // External bookings might not have pricing
                        };

                        _dbContext.Bookings.Add(booking);
                        _logger.LogInformation($"Created new external booking from iCal: {evt.Uid}");
                    }
                    else
                    {
                        // Update existing booking if changed
                        if (existingBooking.StartTime != startTime ||
                            existingBooking.EndTime != endTime ||
                            existingBooking.NotesFromUser != summary)
                        {
                            existingBooking.StartTime = startTime;
                            existingBooking.EndTime = endTime;
                            existingBooking.NotesFromUser = summary;
                            existingBooking.UpdatedAt = DateTime.UtcNow;
                            _logger.LogInformation($"Updated external booking from iCal: {evt.Uid}");
                        }
                    }
                }

                // Find and cancel any existing bookings that were not in the iCal feed
                var bookingsToCancel = existingBookings
                    .Where(b => b.ExternalIcalUid != null && !processedEventIds.Contains(b.ExternalIcalUid))
                    .ToList();

                await MarkOldBookingsAsCancelled(bookingsToCancel);
                await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing iCal URL {url} for space {space.Id}");
                throw;
            }
        }

        private async Task MarkOldBookingsAsCancelled(List<Booking> bookings)
        {
            if (!bookings.Any())
            {
                return;
            }

            foreach (var booking in bookings)
            {
                if (booking.Status != BookingStatus.Cancelled)
                {
                    booking.Status = BookingStatus.Cancelled;
                    booking.UpdatedAt = DateTime.UtcNow;
                    booking.NotesFromOwner = booking.NotesFromOwner + "\nCancelled: Event removed from external calendar";
                    _logger.LogInformation($"Marking external booking as cancelled (removed from source): {booking.ExternalIcalUid}");
                }
            }

            await _dbContext.SaveChangesAsync();
        }
    }
    
}
