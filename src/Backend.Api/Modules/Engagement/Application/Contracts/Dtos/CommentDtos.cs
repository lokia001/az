// File: Backend.Api/Modules/Engagement/Application/Contracts/Dtos/CommentDtos.cs
using System;
using System.Collections.Generic; // Cho List<CommentDto>
using System.ComponentModel.DataAnnotations;
using Backend.Api.Modules.Engagement.Domain.Enums; // Cho EngageableEntityType

namespace Backend.Api.Modules.Engagement.Application.Contracts.Dtos
{
    public class CommentDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; } // ID của người bình luận
        // public string? Username { get; set; }
        // public string? UserAvatarUrl { get; set; }
        public EngageableEntityType ParentEntityType { get; set; }
        public Guid ParentEntityId { get; set; }
        public Guid? ParentCommentId { get; set; } // ID của comment cha (nếu là reply)
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int ReplyCount { get; set; } // Số lượng trả lời (sẽ được service tính toán)
        public List<CommentDto> Replies { get; set; } = new List<CommentDto>(); // Danh sách các comment trả lời (nếu query có eager load)

        public CommentDto() { }
    }

    public class CreateCommentRequest
    {
        [Required]
        public EngageableEntityType ParentEntityType { get; set; }

        [Required]
        public Guid ParentEntityId { get; set; }

        public Guid? ParentCommentId { get; set; } // Nếu là trả lời một comment khác

        [Required]
        [StringLength(2000, MinimumLength = 1, ErrorMessage = "Comment content must be between 1 and 2000 characters.")]
        public string Content { get; set; } = string.Empty;
        // UserId sẽ được lấy từ user đang đăng nhập
    }

    public class UpdateCommentRequest
    {
        [Required]
        [StringLength(2000, MinimumLength = 1, ErrorMessage = "Comment content must be between 1 and 2000 characters.")]
        public string Content { get; set; } = string.Empty;
        // UserId (người sửa) và CommentId sẽ được lấy từ context/route
    }

    // DTO cho tiêu chí tìm kiếm Comment (ví dụ)
    public class CommentSearchCriteriaDto
    {
        public EngageableEntityType? ParentEntityType { get; set; }
        public Guid? ParentEntityId { get; set; } // Lấy comment của một parent cụ thể
        public Guid? UserId { get; set; } // Lấy comment của một user cụ thể
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public bool IncludeReplies { get; set; } = false; // Có tải các comment con không
    }
}