using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Services;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Modules.SpaceBooking.Application.Services
{
    public class BookingNotificationService : IBookingNotificationService
    {
        private readonly ILogger<BookingNotificationService> _logger;

        public BookingNotificationService(ILogger<BookingNotificationService> logger)
        {
            _logger = logger;
        }

        public async Task NotifyBookingConflictAsync(Space space, IEnumerable<Booking> conflictingBookings)
        {
            // TODO: Implement actual email/notification sending
            // For now, just log the conflict
            var bookingDetails = string.Join(", ", conflictingBookings.Select(b => 
                $"ID: {b.Id}, Status: {b.Status}, Time: {b.StartTime:g} - {b.EndTime:g}"));
            
            _logger.LogWarning(
                "Booking conflict detected for space {SpaceId} ({SpaceName}). Conflicting bookings: {BookingDetails}",
                space.Id,
                space.Name,
                bookingDetails);

            await Task.CompletedTask; // Placeholder for actual async notification
        }
    }
}
