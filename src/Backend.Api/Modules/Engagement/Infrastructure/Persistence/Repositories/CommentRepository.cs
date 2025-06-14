// File: Backend.Api/Modules/Engagement/Infrastructure/Persistence/Repositories/CommentRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Backend.Api.Data;
using Backend.Api.Modules.Engagement.Domain.Entities;
using Backend.Api.Modules.Engagement.Domain.Enums;
using Backend.Api.Modules.Engagement.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Modules.Engagement.Infrastructure.Persistence.Repositories
{
    public class CommentRepository : ICommentRepository
    {
        private readonly AppDbContext _dbContext;

        public CommentRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        private IQueryable<Comment> GetBaseQuery(bool includeReplies = false)
        {
            var query = _dbContext.Set<Comment>().AsQueryable();
            // HasQueryFilter(c => !c.IsDeleted) đã được áp dụng trong CommentConfiguration

            if (includeReplies)
            {
                // Eager load replies, có thể cần nhiều cấp nếu muốn (ví dụ: Replies.Replies)
                // Để tránh N+1, nhưng cũng cẩn thận với việc tải quá nhiều dữ liệu.
                // Service sẽ quyết định độ sâu của replies cần tải.
                // Hiện tại, chỉ tải 1 cấp replies.
                query = query.Include(c => c.Replies.Where(r => !r.IsDeleted)); // Chỉ include replies chưa bị xóa
            }
            return query;
        }

        public async Task<Comment?> GetByIdAsync(Guid id, bool includeReplies = false)
        {
            return await GetBaseQuery(includeReplies)
                         .Include(c => c.ParentComment) // Luôn include ParentComment để biết nó là reply của ai
                         .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<IEnumerable<Comment>> GetByParentEntityAsync(EngageableEntityType parentType, Guid parentId, bool includeReplies = false)
        {
            // Chỉ lấy các comment gốc (không phải là reply của comment khác) cho parent entity này
            return await GetBaseQuery(includeReplies)
                         .Where(c => c.ParentEntityType == parentType &&
                                     c.ParentEntityId == parentId &&
                                     c.ParentCommentId == null) // Chỉ comment gốc
                         .OrderByDescending(c => c.CreatedAt)
                         .ToListAsync();
        }

        public async Task<IEnumerable<Comment>> FindAsync(Expression<Func<Comment, bool>> predicate, bool includeReplies = false)
        {
            return await GetBaseQuery(includeReplies).Where(predicate).ToListAsync();
        }

        public async Task AddAsync(Comment comment)
        {
            await _dbContext.Set<Comment>().AddAsync(comment);
        }

        public void Update(Comment comment)
        {
            _dbContext.Set<Comment>().Update(comment);
        }

        public void Delete(Comment comment)
        {
            // Service sẽ set comment.IsDeleted = true và gọi Update(comment)
            // Nếu đây là hard delete:
            _dbContext.Set<Comment>().Remove(comment);
        }

        public async Task<int> GetReplyCountAsync(Guid commentId)
        {
            // Đếm số replies không bị xóa của một comment
            return await _dbContext.Set<Comment>()
                                 .CountAsync(c => c.ParentCommentId == commentId && !c.IsDeleted);
        }
    }
}