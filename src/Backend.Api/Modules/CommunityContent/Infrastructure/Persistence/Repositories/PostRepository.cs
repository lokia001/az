// File: Backend.Api/Modules/CommunityContent/Infrastructure/Persistence/Repositories/PostRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Backend.Api.Data;
using Backend.Api.Modules.CommunityContent.Domain.Entities;
using Backend.Api.Modules.CommunityContent.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Modules.CommunityContent.Infrastructure.Persistence.Repositories
{
    public class PostRepository : IPostRepository
    {
        private readonly AppDbContext _dbContext;

        public PostRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        private IQueryable<Post> GetBaseQuery(bool includeCommunity = false)
        {
            var query = _dbContext.Set<Post>().AsQueryable();
            // Global query filter cho IsDeleted đã được cấu hình trong PostConfiguration

            if (includeCommunity)
            {
                query = query.Include(p => p.Community)
                             .Where(p => p.Community != null && !p.Community.IsDeleted); // Chỉ lấy post của community còn tồn tại
            }
            return query;
        }

        public async Task<Post?> GetByIdAsync(Guid id, bool includeCommunity = false)
        {
            return await GetBaseQuery(includeCommunity)
                         .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Post>> GetAllByCommunityIdAsync(Guid communityId, bool includeAuthorDetails = false)
        {
            // includeAuthorDetails sẽ được service xử lý (gọi IUserService)
            // Repo chỉ trả về Post entity
            return await GetBaseQuery(includeCommunity: true) // Include Community để có thể filter hoặc hiển thị CommunityName
                         .Where(p => p.CommunityId == communityId)
                         .OrderByDescending(p => p.IsPinned) // Ưu tiên bài ghim
                         .ThenByDescending(p => p.CreatedAt) // Sau đó là bài mới nhất
                         .ToListAsync();
        }

        public async Task<IEnumerable<Post>> FindAsync(Expression<Func<Post, bool>> predicate, bool includeCommunity = false)
        {
            return await GetBaseQuery(includeCommunity)
                         .Where(predicate)
                         .ToListAsync();
        }

        public async Task AddAsync(Post post)
        {
            await _dbContext.Set<Post>().AddAsync(post);
        }

        public void Update(Post post)
        {
            _dbContext.Set<Post>().Update(post);
        }

        public void Delete(Post post)
        {
            // Tương tự Community.Delete, service sẽ xử lý soft delete.
            // Nếu đây là hard delete:
            _dbContext.Set<Post>().Remove(post);
        }
    }
}