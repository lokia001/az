// File: Backend.Api/Modules/CommunityContent/Infrastructure/Persistence/Repositories/CommunityRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Backend.Api.Data; // AppDbContext
using Backend.Api.Modules.CommunityContent.Domain.Entities;
using Backend.Api.Modules.CommunityContent.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Modules.CommunityContent.Infrastructure.Persistence.Repositories
{
    public class CommunityRepository : ICommunityRepository
    {
        private readonly AppDbContext _dbContext;

        public CommunityRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        private IQueryable<Community> GetBaseQuery(bool includeMembers = false, bool includePosts = false)
        {
            var query = _dbContext.Set<Community>().AsQueryable();

            // Global query filter cho IsDeleted đã được cấu hình trong CommunityConfiguration,
            // nên không cần .Where(c => !c.IsDeleted) ở đây nữa.

            if (includeMembers)
            {
                query = query.Include(c => c.Members);
            }
            if (includePosts)
            {
                // Nếu muốn phân trang Posts ở đây thì phức tạp hơn,
                // thường thì sẽ lấy Posts riêng khi cần chi tiết Community.
                // Hiện tại chỉ Include tất cả.
                query = query.Include(c => c.Posts);
            }
            return query;
        }

        public async Task<Community?> GetByIdAsync(Guid id, bool includeMembers = false, bool includePosts = false)
        {
            return await GetBaseQuery(includeMembers, includePosts)
                         .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Community?> GetByNameAsync(string name, bool includeMembers = false, bool includePosts = false)
        {
            var nameLower = name.ToLowerInvariant();
            return await GetBaseQuery(includeMembers, includePosts)
                         .FirstOrDefaultAsync(c => c.Name.ToLower() == nameLower); // SQLite mặc định case-insensitive cho LIKE, nhưng ToLower() cho chắc chắn
        }

        public async Task<IEnumerable<Community>> GetAllAsync(bool includeMembers = false, bool includePosts = false)
        {
            // Sẽ không tối ưu nếu includePosts=true và có nhiều posts.
            // Cân nhắc bỏ includePosts ở đây và để service lấy riêng nếu cần.
            return await GetBaseQuery(includeMembers, includePosts)
                         .OrderBy(c => c.Name) // Ví dụ sắp xếp
                         .ToListAsync();
        }

        public async Task<IEnumerable<Community>> FindAsync(Expression<Func<Community, bool>> predicate, bool includeMembers = false, bool includePosts = false)
        {
            return await GetBaseQuery(includeMembers, includePosts)
                         .Where(predicate)
                         .ToListAsync();
        }

        public async Task<IEnumerable<Community>> GetByUserMembershipAsync(Guid userId)
        {
            // Lấy các community mà user là thành viên (và community đó chưa bị xóa)
            return await _dbContext.Set<CommunityMember>()
                .Where(cm => cm.UserId == userId)
                .Include(cm => cm.Community) // Include Community entity
                                             // .ThenInclude(c => c.Posts) // Tùy chọn có include Posts của Community không
                                             // .ThenInclude(c => c.Members) // Tùy chọn có include Members của Community không
                .Select(cm => cm.Community)
                .Where(c => c != null && !c.IsDeleted) // Đảm bảo community không null và chưa bị xóa
                .Distinct() // Tránh trường hợp user có nhiều vai trò trong cùng 1 community (hiếm)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }


        public async Task AddAsync(Community community)
        {
            await _dbContext.Set<Community>().AddAsync(community);
        }

        public void Update(Community community)
        {
            _dbContext.Set<Community>().Update(community);
        }

        public void Delete(Community community)
        {
            // Service sẽ set community.IsDeleted = true và gọi Update(community)
            // Nếu muốn hard delete từ repo (không khuyến khích nếu có soft delete):
            // _dbContext.Set<Community>().Remove(community);
            // Hiện tại, để trống để service xử lý soft delete qua Update.
            // Nếu interface yêu cầu repo phải làm gì đó, thì implement ở đây.
            // Vì interface là void Delete(Community community), nó ngụ ý repo có thể thay đổi state.
            // Nhưng với soft delete, service làm sẽ rõ ràng hơn.
            // Nếu muốn repo hỗ trợ hard delete:
            // _dbContext.Remove(community);
            // Nếu muốn repo hỗ trợ soft delete (ít phổ biến, thường service làm):
            // community.IsDeleted = true; this.Update(community);
            // => Để service xử lý soft delete, phương thức này trong repo có thể không làm gì,
            // hoặc nếu interface bắt buộc, thì throw NotImplementedException nếu repo không nên tự soft delete.
            // Hoặc, chúng ta có thể hiểu ngầm là service đã set IsDeleted=true, và repo chỉ cần gọi Update.
            // => Để nhất quán, nếu service set IsDeleted, thì repo chỉ cần Update.
            // => Nếu Delete này có nghĩa là Hard Delete, thì _dbContext.Remove(community);
            // => Giả sử Delete này là Hard Delete (nếu service gọi đến nó)
            _dbContext.Set<Community>().Remove(community);
        }

        public async Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null)
        {
            var nameLower = name.ToLowerInvariant();
            var query = _dbContext.Set<Community>().Where(c => c.Name.ToLower() == nameLower);
            if (excludeId.HasValue)
            {
                query = query.Where(c => c.Id != excludeId.Value);
            }
            return await query.AnyAsync();
        }
    }
}