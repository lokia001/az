// File: Backend.Api/Modules/CommunityContent/Application/Contracts/Dtos/PostDtos.cs
using System;
using System.ComponentModel.DataAnnotations;
using Backend.Api.Modules.CommunityContent.Domain.Enums; // Cho CommunityRole

namespace Backend.Api.Modules.CommunityContent.Application.Contracts.Dtos
{
    // DTO để hiển thị thông tin Post
    public class PostDto // << THAY ĐỔI TỪ RECORD SANG CLASS
    {
        public Guid Id { get; set; }
        public Guid CommunityId { get; set; }
        public Guid AuthorUserId { get; set; }
        public CommunityRole? AuthorCommunityRole { get; set; } // Đã thêm ở bước trước
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int ViewCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedByUserId { get; set; }
        public bool IsPinned { get; set; }
        public bool IsLocked { get; set; }
        // public int CommentCount { get; set; } // Sẽ được lấy từ module Engagement
        // public int ReactionCount { get; set; } // Sẽ được lấy từ module Engagement

        public PostDto() { } // Constructor không tham số
    }

    // DTO để hiển thị Post rút gọn (ví dụ trong danh sách)
    public class PostSummaryDto // << THAY ĐỔI TỪ RECORD SANG CLASS
    {
        public Guid Id { get; set; }
        public Guid CommunityId { get; set; }
        public Guid AuthorUserId { get; set; }
        public CommunityRole? AuthorCommunityRole { get; set; } // Đã thêm ở bước trước
        public string Title { get; set; } = string.Empty;
        public int ViewCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsPinned { get; set; }
        public bool IsLocked { get; set; }
        // public int CommentCount { get; set; }
        // public int ReactionCount { get; set; }

        public PostSummaryDto() { } // Constructor không tham số
    }

    // CreatePostRequest, UpdatePostRequest, PostSearchCriteriaDto có thể giữ nguyên là record
    // vì chúng thường được tạo từ client request, không phải do AutoMapper map *sang*.
    public record CreatePostRequest(
        [Required] Guid CommunityId,
        [Required][StringLength(200, MinimumLength = 5)] string Title,
        [Required][StringLength(10000, MinimumLength = 10)] string Content
    );

    public record UpdatePostRequest(
        [Required][StringLength(200, MinimumLength = 5)] string Title,
        [Required][StringLength(10000, MinimumLength = 10)] string Content
    );

    public record PostSearchCriteriaDto(
        Guid? CommunityId,
        Guid? AuthorUserId,
        string? TitleKeyword,
        string? ContentKeyword,
        bool? IsPinned,
        bool? IsLocked,
        int PageNumber = 1,
        int PageSize = 10
    );
}