// File: Backend.Api/Modules/CommunityContent/Domain/Entities/Post.cs
using System;
using System.Collections.Generic; // Nếu Post có Comment/Reaction là collection con
using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Modules.CommunityContent.Domain.Entities
{
    public class Post
    {
        public Guid Id { get; set; }

        [Required]
        public Guid CommunityId { get; set; } // FK đến Community
        public Community Community { get; set; } = default!;

        [Required]
        public Guid AuthorUserId { get; set; } // FK đến User (từ UserRelated) - người đăng bài
        // KHÔNG có navigation property trực tiếp đến User entity

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty; // Có thể là Markdown, HTML, hoặc text thuần

        public int ViewCount { get; set; } = 0;
        // Các thông tin khác như Upvotes, Downvotes có thể thêm sau

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedByUserId { get; set; } // FK đến User (từ UserRelated)

        public bool IsDeleted { get; set; } = false; // Soft delete
        public bool IsPinned { get; set; } = false; // Bài đăng được ghim
        public bool IsLocked { get; set; } = false; // Bài đăng bị khóa (không cho bình luận thêm)

        // Navigation Properties (nếu Comment/Reaction thuộc module này)
        // public ICollection<Comment> Comments { get; private set; } = new List<Comment>();
        // public ICollection<Reaction> Reactions { get; private set; } = new List<Reaction>();
        // Hiện tại, chúng ta giả định Comment/Reaction thuộc module Engagement và sẽ liên kết qua PostId.

        public Post()
        {
            Id = Guid.NewGuid();
        }
    }
}