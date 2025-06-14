// File: Backend.Api/Modules/Engagement/Domain/Entities/Comment.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Backend.Api.Modules.Engagement.Domain.Enums;

namespace Backend.Api.Modules.Engagement.Domain.Entities
{
    public class Comment
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; } // FK UserRelated
        public EngageableEntityType ParentEntityType { get; set; }
        public Guid ParentEntityId { get; set; }
        public Guid? ParentCommentId { get; set; } // Self-referencing FK
        public Comment? ParentComment { get; set; } // Navigation cho self-referencing
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
        public ICollection<Comment> Replies { get; private set; } = new List<Comment>();
        public Comment() { Id = Guid.NewGuid(); }
    }
}