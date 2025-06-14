// File: Backend.Api/Modules/CommunityContent/Domain/Entities/CommunityMember.cs
using System;
using System.ComponentModel.DataAnnotations;
using Backend.Api.Modules.CommunityContent.Domain.Enums;

namespace Backend.Api.Modules.CommunityContent.Domain.Entities
{
    public class CommunityMember
    {
        // Khóa chính kết hợp (CommunityId, UserId) sẽ được định nghĩa trong Fluent API
        [Required]
        public Guid CommunityId { get; set; }
        public Community Community { get; set; } = default!;

        [Required]
        public Guid UserId { get; set; } // FK đến User (từ UserRelated)
        // KHÔNG có navigation property trực tiếp đến User entity để giữ loose coupling

        [Required]
        public CommunityRole Role { get; set; } = CommunityRole.Member; // Vai trò trong Community

        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        // Có thể thêm các trạng thái khác nếu cần (ví dụ: Banned, PendingApproval)
    }
}