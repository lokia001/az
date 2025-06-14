// File: Backend.Api/Modules/CommunityContent/Domain/Entities/Community.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // Sẽ dùng ít, ưu tiên Fluent API

namespace Backend.Api.Modules.CommunityContent.Domain.Entities
{
    public class Community
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(255)]
        public string? CoverImageUrl { get; set; } // Ảnh bìa cho Community

        public bool IsPublic { get; set; } = true; // true: Ai cũng thấy và xin join; false: Private, cần mời

        [Required]
        public Guid CreatedByUserId { get; set; } // FK đến User (từ UserRelated) - người tạo Community

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedByUserId { get; set; } // FK đến User (từ UserRelated)

        public bool IsDeleted { get; set; } = false; // Soft delete

        // Navigation Properties (nội bộ module CommunityContent)
        public ICollection<CommunityMember> Members { get; private set; } = new List<CommunityMember>();
        public ICollection<Post> Posts { get; private set; } = new List<Post>();

        public Community()
        {
            Id = Guid.NewGuid();
        }
    }
}