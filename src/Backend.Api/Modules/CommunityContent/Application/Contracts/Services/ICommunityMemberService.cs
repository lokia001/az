using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.CommunityContent.Application.Contracts.Dtos;
using Backend.Api.Modules.CommunityContent.Domain.Enums;

namespace Backend.Api.Modules.CommunityContent.Application.Contracts.Services
{
    public interface ICommunityMemberService
    {
        Task<CommunityMemberDto> JoinCommunityAsync(Guid communityId, Guid userId);
        Task<bool> LeaveCommunityAsync(Guid communityId, Guid userId);
        Task<CommunityMemberDto?> UpdateMemberRoleAsync(Guid communityId, Guid targetUserId, CommunityRole newRole, Guid adminOrModUserId);
        Task<bool> RemoveMemberAsync(Guid communityId, Guid targetUserId, Guid adminOrModUserId); // Kick member
        Task<IEnumerable<CommunityMemberDto>> GetCommunityMembersAsync(Guid communityId);
        Task<IEnumerable<UserCommunityMembershipDto>> GetUserMembershipsAsync(Guid userId);
        Task<CommunityMemberDto?> GetMembershipDetailsAsync(Guid communityId, Guid userId);
        Task<bool> IsUserMemberOfCommunityAsync(Guid communityId, Guid userId);
        Task<CommunityRole?> GetUserRoleInCommunityAsync(Guid communityId, Guid userId); // << PHƯƠNG THỨC QUAN TRỌNG
        Task<bool> UserHasPermissionAsync(Guid communityId, Guid userId, CommunityRole requiredRole);
    }
}