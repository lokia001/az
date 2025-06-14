// File: Backend.Api/Modules/CommunityContent/Domain/Interfaces/Repositories/IPostRepository.cs
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Backend.Api.Modules.CommunityContent.Domain.Entities;

namespace Backend.Api.Modules.CommunityContent.Domain.Interfaces.Repositories
{
    public interface IPostRepository
    {
        Task<Post?> GetByIdAsync(Guid id, bool includeCommunity = false);
        Task<IEnumerable<Post>> GetAllByCommunityIdAsync(Guid communityId, bool includeAuthorDetails = false); // Phân trang/sắp xếp có thể thêm sau
        Task<IEnumerable<Post>> FindAsync(Expression<Func<Post, bool>> predicate, bool includeCommunity = false);
        Task AddAsync(Post post);
        void Update(Post post);
        void Delete(Post post); // Service sẽ xử lý soft delete
        // Task<IEnumerable<Post>> GetByUserAuthorIdAsync(Guid authorUserId); // Nếu cần lấy tất cả bài viết của một tác giả
    }
}