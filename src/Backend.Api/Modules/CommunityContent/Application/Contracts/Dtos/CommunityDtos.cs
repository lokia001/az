// File: Backend.Api/Modules/CommunityContent/Application/Contracts/Dtos/CommunityDtos.cs
using System;
using System.ComponentModel.DataAnnotations; // Cần cho các DTO request

namespace Backend.Api.Modules.CommunityContent.Application.Contracts.Dtos
{
    public class CommunityDto // Đổi thành class
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverImageUrl { get; set; }
        public bool IsPublic { get; set; }
        public Guid CreatedByUserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedByUserId { get; set; }
        public int MemberCount { get; set; }
        public int PostCount { get; set; }

        public CommunityDto() { } // Constructor không tham số
    }

    public class CommunitySummaryDto // Đổi thành class
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverImageUrl { get; set; }
        public bool IsPublic { get; set; }
        public int MemberCount { get; set; }
        public Guid CreatedByUserId { get; set; }

        public CommunitySummaryDto() { } // Constructor không tham số
    }

    // Các DTO Request (CreateCommunityRequest, UpdateCommunityRequest, CommunitySearchCriteriaDto)
    // có thể giữ nguyên là record nếu chúng không gây lỗi.
    // Lỗi "No available constructor" thường xảy ra khi AutoMapper cố gắng map *sang* DTO (tức là DTO Response).
    public record CreateCommunityRequest(
        [Required][StringLength(100, MinimumLength = 3)] string Name,
        [StringLength(500)] string? Description,
        [Url][StringLength(2048)] string? CoverImageUrl,
        bool IsPublic = true
    );

    public record UpdateCommunityRequest(
        [Required][StringLength(100, MinimumLength = 3)] string Name,
        [StringLength(500)] string? Description,
        [Url][StringLength(2048)] string? CoverImageUrl,
        bool? IsPublic
    );

    public record CommunitySearchCriteriaDto(
        string? NameKeyword,
        bool? IsPublic,
        int PageNumber = 1,
        int PageSize = 10
    );
}