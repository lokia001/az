// File: Backend.Api/Modules/Engagement/Domain/Interfaces/Repositories/ICommentRepository.cs
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Backend.Api.Modules.Engagement.Domain.Entities;
using Backend.Api.Modules.Engagement.Domain.Enums;

namespace Backend.Api.Modules.Engagement.Domain.Interfaces.Repositories
{
    public interface ICommentRepository
    {
        Task<Comment?> GetByIdAsync(Guid id, bool includeReplies = false);
        // Lấy tất cả comment của một parent entity (ví dụ: tất cả comment của một Post)
        Task<IEnumerable<Comment>> GetByParentEntityAsync(EngageableEntityType parentType, Guid parentId, bool includeReplies = false);
        Task<IEnumerable<Comment>> FindAsync(Expression<Func<Comment, bool>> predicate, bool includeReplies = false);
        Task AddAsync(Comment comment);
        void Update(Comment comment);
        void Delete(Comment comment); // Service sẽ xử lý soft delete
        Task<int> GetReplyCountAsync(Guid commentId); // Đếm số lượng trả lời cho một comment
    }
}