using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Services
{
    public interface IBookingNotificationService
    {
        Task NotifyBookingConflictAsync(Space space, IEnumerable<Booking> conflictingBookings);
    }
}
