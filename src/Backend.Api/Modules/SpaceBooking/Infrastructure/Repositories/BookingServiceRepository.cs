// File: Backend.Api/Modules/SpaceBooking/Infrastructure/Repositories/BookingServiceRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Api.Data;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Modules.SpaceBooking.Infrastructure.Repositories
{
    public class BookingServiceRepository : IBookingServiceRepository
    {
        private readonly AppDbContext _context;

        public BookingServiceRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<BookingService?> GetByIdAsync(Guid id)
        {
            return await _context.Set<BookingService>()
                .Include(bs => bs.PrivateService)
                .FirstOrDefaultAsync(bs => bs.Id == id);
        }

        public async Task<IEnumerable<BookingService>> GetByBookingIdAsync(Guid bookingId)
        {
            return await _context.Set<BookingService>()
                .Include(bs => bs.PrivateService)
                .Where(bs => bs.BookingId == bookingId)
                .OrderBy(bs => bs.ServiceName)
                .ToListAsync();
        }

        public async Task<IEnumerable<BookingService>> GetByPrivateServiceIdAsync(Guid privateServiceId)
        {
            return await _context.Set<BookingService>()
                .Include(bs => bs.Booking)
                .Where(bs => bs.PrivateServiceId == privateServiceId)
                .OrderByDescending(bs => bs.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(BookingService bookingService)
        {
            await _context.Set<BookingService>().AddAsync(bookingService);
        }

        public async Task AddRangeAsync(IEnumerable<BookingService> bookingServices)
        {
            await _context.Set<BookingService>().AddRangeAsync(bookingServices);
        }

        public void Update(BookingService bookingService)
        {
            _context.Set<BookingService>().Update(bookingService);
        }

        public void Delete(BookingService bookingService)
        {
            _context.Set<BookingService>().Remove(bookingService);
        }

        public void DeleteRange(IEnumerable<BookingService> bookingServices)
        {
            _context.Set<BookingService>().RemoveRange(bookingServices);
        }

        public async Task<bool> ExistsAsync(Guid bookingId, Guid privateServiceId)
        {
            return await _context.Set<BookingService>()
                .AnyAsync(bs => bs.BookingId == bookingId && bs.PrivateServiceId == privateServiceId);
        }

        public async Task<decimal> CalculateTotalServicesAmountAsync(Guid bookingId)
        {
            return await _context.Set<BookingService>()
                .Where(bs => bs.BookingId == bookingId)
                .SumAsync(bs => bs.TotalPrice);
        }
    }
}
