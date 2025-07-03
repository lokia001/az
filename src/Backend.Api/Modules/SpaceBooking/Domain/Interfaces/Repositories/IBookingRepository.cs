// File: Backend.Api/Modules/SpaceBooking/Domain/Interfaces/Repositories/IBookingRepository.cs
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;

namespace Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories
{
    public interface IBookingRepository
    {
        Task<Booking?> GetByIdAsync(Guid id);
        Task<IEnumerable<Booking>> GetAllAsync();
        Task<IEnumerable<Booking>> FindAsync(Expression<Func<Booking, bool>> predicate); // Thêm
        Task<IEnumerable<Booking>> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<Booking>> GetBySpaceIdAsync(Guid spaceId);
        Task<IEnumerable<Booking>> GetUpcomingBookingsBySpaceIdAsync(Guid spaceId, DateTime fromDate);
        Task<IEnumerable<Booking>> GetActiveBookingsAsync(); // Get bookings that are not in final states
        Task<bool> HasOverlappingBookingAsync(Guid spaceId, DateTime startTime, DateTime endTime, Guid? excludeBookingId = null);
        Task<Booking?> GetOverlappingBookingAsync(Guid spaceId, DateTime startTime, DateTime endTime, Guid? excludeBookingId = null);
        Task AddAsync(Booking booking);
        void Update(Booking booking);
        void Delete(Booking booking); // Giữ lại, implementation sẽ xử lý soft delete
        Task<Booking?> GetByBookingCodeAsync(string bookingCode);
    }
}