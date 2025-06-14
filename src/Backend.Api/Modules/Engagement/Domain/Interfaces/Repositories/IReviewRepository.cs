// File: Backend.Api/Modules/Engagement/Domain/Interfaces/Repositories/IReviewRepository.cs
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Backend.Api.Modules.Engagement.Domain.Entities;

namespace Backend.Api.Modules.Engagement.Domain.Interfaces.Repositories
{
    public interface IReviewRepository
    {
        Task<Review?> GetByIdAsync(Guid id);
        Task<IEnumerable<Review>> GetAllAsync(); // Có thể thêm phân trang/lọc sau
        Task<IEnumerable<Review>> FindAsync(Expression<Func<Review, bool>> predicate);
        Task<IEnumerable<Review>> GetBySpaceIdAsync(Guid spaceId); // Lấy tất cả review của một Space
        Task<IEnumerable<Review>> GetByUserIdAsync(Guid userId);   // Lấy tất cả review của một User
        Task<Review?> GetByBookingIdAsync(Guid bookingId); // Một booking thường chỉ có 1 review từ người đặt
        Task<bool> UserHasReviewedBookingAsync(Guid bookingId, Guid userId); // Kiểm tra user đã review booking này chưa
        Task AddAsync(Review review);
        void Update(Review review);
        void Delete(Review review); // Service sẽ xử lý soft delete
    }
}