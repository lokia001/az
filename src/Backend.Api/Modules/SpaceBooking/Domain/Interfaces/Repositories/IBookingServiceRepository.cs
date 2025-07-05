// File: Backend.Api/Modules/SpaceBooking/Domain/Interfaces/Repositories/IBookingServiceRepository.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;

namespace Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories
{
    public interface IBookingServiceRepository
    {
        Task<BookingService?> GetByIdAsync(Guid id);
        Task<IEnumerable<BookingService>> GetByBookingIdAsync(Guid bookingId);
        Task<IEnumerable<BookingService>> GetByPrivateServiceIdAsync(Guid privateServiceId);
        Task AddAsync(BookingService bookingService);
        Task AddRangeAsync(IEnumerable<BookingService> bookingServices);
        void Update(BookingService bookingService);
        void Delete(BookingService bookingService);
        void DeleteRange(IEnumerable<BookingService> bookingServices);
        Task<bool> ExistsAsync(Guid bookingId, Guid privateServiceId);
        Task<decimal> CalculateTotalServicesAmountAsync(Guid bookingId);
    }
}
