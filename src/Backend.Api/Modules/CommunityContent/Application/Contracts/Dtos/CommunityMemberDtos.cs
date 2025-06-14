// File: Backend.Api/Modules/CommunityContent/Application/Contracts/Dtos/CommunityMemberDtos.cs
using System;
using System.ComponentModel.DataAnnotations;
using Backend.Api.Modules.CommunityContent.Domain.Enums; // Cho CommunityRole
// using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos; // Nếu muốn nhúng UserDto

namespace Backend.Api.Modules.CommunityContent.Application.Contracts.Dtos
{
    // DTO để hiển thị thông tin thành viên trong một Community
    public record CommunityMemberDto(
        Guid CommunityId,
        Guid UserId,
        // string Username, // Tạm thời không làm giàu, client tự lấy
        // string? AvatarUrl, // Tạm thời không làm giàu
        CommunityRole Role,
        DateTime JoinedAt
    );

    // DTO để Admin/Moderator của Community thay đổi vai trò của thành viên
    public record UpdateCommunityMemberRoleRequest(
        [Required] CommunityRole NewRole
    );

    // DTO để hiển thị danh sách các Community mà một User tham gia
    public class UserCommunityMembershipDto // Đổi thành class
    {
        public Guid CommunityId { get; set; }
        public string CommunityName { get; set; } = string.Empty;
        public string? CommunityCoverImageUrl { get; set; }

        public Guid UserId { get; set; } // << THÊM TRƯỜNG NÀY
        public CommunityRole RoleInCommunity { get; set; }
        public DateTime JoinedAt { get; set; }

        public UserCommunityMembershipDto() { } // Constructor không tham số
    }
}