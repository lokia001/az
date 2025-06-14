// File: Backend.Api/Modules/Engagement/Infrastructure/Persistence/Repositories/ReactionRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Api.Data;
using Backend.Api.Modules.Engagement.Domain.Entities;
using Backend.Api.Modules.Engagement.Domain.Enums;
using Backend.Api.Modules.Engagement.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Modules.Engagement.Infrastructure.Persistence.Repositories
{
    public class ReactionRepository : IReactionRepository
    {
        private readonly AppDbContext _dbContext;

        public ReactionRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        public async Task<Reaction?> GetByIdAsync(Guid id)
        {
            return await _dbContext.Set<Reaction>().FindAsync(id);
        }

        public async Task<Reaction?> GetUserReactionAsync(Guid userId, EngageableEntityType targetType, Guid targetId, ReactionType reactionType)
        {
            return await _dbContext.Set<Reaction>()
                .FirstOrDefaultAsync(r => r.UserId == userId &&
                                          r.TargetEntityType == targetType &&
                                          r.TargetEntityId == targetId &&
                                          r.Type == reactionType);
        }

        public async Task<Reaction?> GetUserReactionForTargetAsync(Guid userId, EngageableEntityType targetType, Guid targetId)
        {
            // Nếu logic là user chỉ có 1 reaction bất kể type cho 1 target, thì không cần filter theo Type ở đây.
            // Nhưng vì Reaction entity có Type, và unique constraint có thể là (UserId, Target, Type),
            // phương thức này có thể trả về reaction đầu tiên tìm thấy, hoặc cần logic rõ ràng hơn từ service.
            // Giả sử chúng ta muốn tìm bất kỳ reaction nào của user cho target đó.
            return await _dbContext.Set<Reaction>()
                .FirstOrDefaultAsync(r => r.UserId == userId &&
                                          r.TargetEntityType == targetType &&
                                          r.TargetEntityId == targetId);
        }


        public async Task<IEnumerable<Reaction>> GetByTargetEntityAsync(EngageableEntityType targetType, Guid targetId)
        {
            return await _dbContext.Set<Reaction>()
                .Where(r => r.TargetEntityType == targetType && r.TargetEntityId == targetId)
                .ToListAsync();
        }

        public async Task<Dictionary<ReactionType, int>> GetReactionCountsAsync(EngageableEntityType targetType, Guid targetId)
        {
            return await _dbContext.Set<Reaction>()
                .Where(r => r.TargetEntityType == targetType && r.TargetEntityId == targetId)
                .GroupBy(r => r.Type)
                .Select(g => new { ReactionType = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.ReactionType, x => x.Count);
        }

        public async Task AddAsync(Reaction reaction)
        {
            await _dbContext.Set<Reaction>().AddAsync(reaction);
        }

        public void Delete(Reaction reaction)
        {
            // Reaction thường là hard delete
            _dbContext.Set<Reaction>().Remove(reaction);
        }
    }
}