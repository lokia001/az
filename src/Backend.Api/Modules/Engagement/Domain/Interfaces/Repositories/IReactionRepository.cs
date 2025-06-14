// File: Backend.Api/Modules/Engagement/Domain/Interfaces/Repositories/IReactionRepository.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.Engagement.Domain.Entities;
using Backend.Api.Modules.Engagement.Domain.Enums;

namespace Backend.Api.Modules.Engagement.Domain.Interfaces.Repositories
{
    public interface IReactionRepository
    {
        Task<Reaction?> GetByIdAsync(Guid id);
        // Lấy reaction cụ thể của một user cho một target và một type (dựa trên unique constraint)
        Task<Reaction?> GetUserReactionAsync(Guid userId, EngageableEntityType targetType, Guid targetId, ReactionType reactionType);
        // Lấy reaction cụ thể của một user cho một target (nếu logic là user chỉ có 1 reaction bất kể type)
        Task<Reaction?> GetUserReactionForTargetAsync(Guid userId, EngageableEntityType targetType, Guid targetId);
        // Lấy tất cả reactions của một target entity (ví dụ: tất cả reactions của một Post)
        Task<IEnumerable<Reaction>> GetByTargetEntityAsync(EngageableEntityType targetType, Guid targetId);
        // Đếm số lượng reaction theo từng type cho một target entity
        Task<Dictionary<ReactionType, int>> GetReactionCountsAsync(EngageableEntityType targetType, Guid targetId);
        Task AddAsync(Reaction reaction);
        void Delete(Reaction reaction); // Reaction thường là hard delete
        // Update reaction thường không cần, user sẽ xóa reaction cũ và tạo reaction mới nếu đổi type
    }
}