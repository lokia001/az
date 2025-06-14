// File: Backend.Api/Modules/Engagement/Application/Contracts/Dtos/ReactionDtos.cs
using System;
using System.ComponentModel.DataAnnotations;
using Backend.Api.Modules.Engagement.Domain.Enums; // Cho EngageableEntityType, ReactionType

namespace Backend.Api.Modules.Engagement.Application.Contracts.Dtos
{
    // DTO để hiển thị thông tin Reaction (có thể không cần thiết nếu chỉ quan tâm đến count)
    public class ReactionDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public EngageableEntityType TargetEntityType { get; set; }
        public Guid TargetEntityId { get; set; }
        public ReactionType Type { get; set; }
        public DateTime CreatedAt { get; set; }

        public ReactionDto() { }
    }

    // DTO để tạo/cập nhật một Reaction
    // User chỉ có thể có một loại reaction cho một target,
    // nên việc "tạo" có thể là tạo mới hoặc cập nhật type nếu đã có reaction.
    // Hoặc, client sẽ gọi API "toggle" reaction.
    public class SetReactionRequest
    {
        [Required]
        public EngageableEntityType TargetEntityType { get; set; }

        [Required]
        public Guid TargetEntityId { get; set; }

        [Required]
        public ReactionType ReactionType { get; set; } // Loại reaction muốn đặt
        // UserId sẽ được lấy từ user đang đăng nhập
    }

    // DTO để xóa một Reaction (ví dụ: unlike)
    public class RemoveReactionRequest
    {
        [Required]
        public EngageableEntityType TargetEntityType { get; set; }

        [Required]
        public Guid TargetEntityId { get; set; }

        // ReactionType có thể không cần thiết nếu logic là xóa bất kỳ reaction nào của user cho target đó.
        // Hoặc cần nếu user có thể có nhiều loại reaction khác nhau (ít phổ biến).
        // Hiện tại, Reaction entity có Type, nên có thể cần để xóa đúng loại.
        public ReactionType? ReactionTypeToRemove { get; set; }
        // UserId sẽ được lấy từ user đang đăng nhập
    }

    // DTO để hiển thị tổng hợp số lượng reaction (ví dụ cho một Post hoặc Space)
    public class ReactionSummaryDto
    {
        public Guid TargetEntityId { get; set; }
        public EngageableEntityType TargetEntityType { get; set; }
        public Dictionary<ReactionType, int> Counts { get; set; } = new Dictionary<ReactionType, int>();
        public ReactionType? CurrentUserReactionType { get; set; } // Reaction của người dùng hiện tại (nếu có)

        public ReactionSummaryDto() { }
    }
}