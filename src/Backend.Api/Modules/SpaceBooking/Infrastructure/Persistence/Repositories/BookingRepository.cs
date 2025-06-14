// File: Backend.Api/Modules/SpaceBooking/Infrastructure/Persistence/Repositories/BookingRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Backend.Api.Data;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Modules.SpaceBooking.Infrastructure.Persistence.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly AppDbContext _context;

        public BookingRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        private IQueryable<Booking> GetBaseQuery()
        {
            return _context.Set<Booking>()
                           .Include(b => b.Space); // Luôn tải thông tin Space kèm theo Booking
        }

        public async Task<Booking?> GetByIdAsync(Guid id)
        {
            return await GetBaseQuery().FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted);
        }

        public async Task<IEnumerable<Booking>> GetAllAsync()
        {
            return await GetBaseQuery().Where(b => !b.IsDeleted).ToListAsync();
        }

        public async Task<IEnumerable<Booking>> FindAsync(Expression<Func<Booking, bool>> predicate)
        {
            return await GetBaseQuery()
                         .Where(b => !b.IsDeleted)
                         .Where(predicate)
                         .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetByUserIdAsync(Guid userId)
        {
            return await GetBaseQuery()
                         .Where(b => b.UserId == userId && !b.IsDeleted)
                         .OrderByDescending(b => b.StartTime) // Sắp xếp theo thời gian đặt mới nhất
                         .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetBySpaceIdAsync(Guid spaceId)
        {
            return await GetBaseQuery()
                         .Where(b => b.SpaceId == spaceId && !b.IsDeleted)
                         .OrderByDescending(b => b.StartTime)
                         .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetUpcomingBookingsBySpaceIdAsync(Guid spaceId, DateTime fromDate)
        {
            return await GetBaseQuery()
                         .Where(b => b.SpaceId == spaceId &&
                                     b.StartTime >= fromDate &&
                                     !b.IsDeleted &&
                                     (b.Status == Domain.Enums.BookingStatus.Confirmed || b.Status == Domain.Enums.BookingStatus.Pending)) // Chỉ lấy Confirmed hoặc Pending
                         .OrderBy(b => b.StartTime)
                         .ToListAsync();
        }

        public async Task<bool> HasOverlappingBookingAsync(Guid spaceId, DateTime startTime, DateTime endTime, Guid? excludeBookingId = null)
        {
            // Logic kiểm tra trùng lịch:
            // Một booking mới (newStartTime, newEndTime) bị trùng nếu:
            // (oldStartTime < newEndTime) AND (oldEndTime > newStartTime)
            var query = _context.Set<Booking>()
                .Where(b => b.SpaceId == spaceId &&
                            !b.IsDeleted &&
                            (b.Status == Domain.Enums.BookingStatus.Confirmed || b.Status == Domain.Enums.BookingStatus.Pending) && // Chỉ xét các booking còn hiệu lực
                            b.StartTime < endTime && // Booking cũ bắt đầu trước khi booking mới kết thúc
                            b.EndTime > startTime);   // Booking cũ kết thúc sau khi booking mới bắt đầu

            if (excludeBookingId.HasValue)
            {
                query = query.Where(b => b.Id != excludeBookingId.Value);
            }

            return await query.AnyAsync();
        }


        public async Task AddAsync(Booking booking)
        {
            await _context.Set<Booking>().AddAsync(booking);
        }

        public void Update(Booking booking)
        {
            _context.Set<Booking>().Update(booking);
        }

        public void Delete(Booking booking) // Implementation cho soft delete
        {
            booking.IsDeleted = true;
            booking.UpdatedAt = DateTime.UtcNow;
            // booking.UpdatedByUserId = ... // Cần truyền userId nếu muốn audit ai xóa
            _context.Set<Booking>().Update(booking);
        }

        public async Task<Booking?> GetByBookingCodeAsync(string bookingCode)
        {
            if (string.IsNullOrWhiteSpace(bookingCode)) return null;
            return await GetBaseQuery()
                         .FirstOrDefaultAsync(b => b.BookingCode == bookingCode && !b.IsDeleted);
        }
    }
}