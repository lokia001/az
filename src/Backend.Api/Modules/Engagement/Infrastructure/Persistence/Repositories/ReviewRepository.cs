// File: Backend.Api/Modules/Engagement/Infrastructure/Persistence/Repositories/ReviewRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Backend.Api.Data; // AppDbContext
using Backend.Api.Modules.Engagement.Domain.Entities;
using Backend.Api.Modules.Engagement.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Modules.Engagement.Infrastructure.Persistence.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly AppDbContext _dbContext;

        public ReviewRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        // HasQueryFilter(r => !r.IsDeleted) đã được áp dụng trong ReviewConfiguration

        public async Task<Review?> GetByIdAsync(Guid id)
        {
            return await _dbContext.Set<Review>().FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Review>> GetAllAsync()
        {
            return await _dbContext.Set<Review>()
                                 .OrderByDescending(r => r.CreatedAt)
                                 .ToListAsync();
        }

        public async Task<IEnumerable<Review>> FindAsync(Expression<Func<Review, bool>> predicate)
        {
            return await _dbContext.Set<Review>().Where(predicate).ToListAsync();
        }

        public async Task<IEnumerable<Review>> GetBySpaceIdAsync(Guid spaceId)
        {
            return await _dbContext.Set<Review>()
                                 .Where(r => r.SpaceId == spaceId)
                                 .OrderByDescending(r => r.CreatedAt)
                                 .ToListAsync();
        }

        public async Task<IEnumerable<Review>> GetByUserIdAsync(Guid userId)
        {
            return await _dbContext.Set<Review>()
                                 .Where(r => r.UserId == userId)
                                 .OrderByDescending(r => r.CreatedAt)
                                 .ToListAsync();
        }

        public async Task<Review?> GetByBookingIdAsync(Guid bookingId)
        {
            // Giả định một booking chỉ có một review chính từ người đặt
            return await _dbContext.Set<Review>()
                                 .FirstOrDefaultAsync(r => r.BookingId == bookingId);
        }

        public async Task<bool> UserHasReviewedBookingAsync(Guid bookingId, Guid userId)
        {
            return await _dbContext.Set<Review>()
                                 .AnyAsync(r => r.BookingId == bookingId && r.UserId == userId);
        }

        public async Task AddAsync(Review review)
        {
            await _dbContext.Set<Review>().AddAsync(review);
        }

        public void Update(Review review)
        {
            _dbContext.Set<Review>().Update(review);
        }

        public void Delete(Review review)
        {
            // Service sẽ set review.IsDeleted = true và gọi Update(review)
            // Nếu đây là hard delete (không khuyến khích vì có soft delete):
            // _dbContext.Set<Review>().Remove(review);
            // Hiện tại, để trống hoặc throw NotImplemented nếu repo không nên tự soft delete.
            // Hoặc, nếu Delete() trong interface có nghĩa là "đánh dấu để xóa", thì service đã làm.
            // => Giả sử service đã set IsDeleted, repo chỉ cần Update.
            // => Tuy nhiên, để nhất quán với các repo khác, nếu Delete là hard delete:
            _dbContext.Set<Review>().Remove(review); // Nếu service quyết định hard delete
        }
    }
}