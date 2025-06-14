// File: Backend.Api/Modules/Engagement/Application/Contracts/Services/IReactionService.cs
using System;
using System.Threading.Tasks;
using Backend.Api.Modules.Engagement.Application.Contracts.Dtos;
using Backend.Api.Modules.Engagement.Domain.Enums;

namespace Backend.Api.Modules.Engagement.Application.Contracts.Services
{
    public interface IReactionService
    {
        // Set (Thêm mới hoặc cập nhật nếu đã có reaction khác loại, hoặc xóa nếu cùng loại)
        Task<ReactionSummaryDto> SetReactionAsync(SetReactionRequest request, Guid userId);

        // Xóa reaction (ví dụ: unlike)
        Task<ReactionSummaryDto> RemoveReactionAsync(RemoveReactionRequest request, Guid userId);

        // Lấy tổng hợp reaction cho một target
        Task<ReactionSummaryDto?> GetReactionSummaryAsync(EngageableEntityType targetType, Guid targetId, Guid? currentUserId);
        // currentUserId để biết reaction hiện tại của người dùng (nếu đã đăng nhập)
    }
}