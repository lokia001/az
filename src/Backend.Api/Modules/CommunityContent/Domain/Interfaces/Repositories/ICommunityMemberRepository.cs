// File: Backend.Api/Modules/CommunityContent/Domain/Interfaces/Repositories/ICommunityMemberRepository.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.CommunityContent.Domain.Entities;
using Backend.Api.Modules.CommunityContent.Domain.Enums;

namespace Backend.Api.Modules.CommunityContent.Domain.Interfaces.Repositories
{
    public interface ICommunityMemberRepository
    {
        Task<CommunityMember?> GetByIdAsync(Guid communityId, Guid userId);
        Task<IEnumerable<CommunityMember>> GetMembersByCommunityIdAsync(Guid communityId);
        Task<IEnumerable<CommunityMember>> GetCommunitiesByUserIdAsync(Guid userId); // Tương tự ICommunityRepository.GetByUserMembershipAsync nhưng trả về CommunityMember
        Task AddAsync(CommunityMember communityMember);
        void Update(CommunityMember communityMember); // Ví dụ: để thay đổi Role
        void Delete(CommunityMember communityMember); // User rời khỏi community hoặc bị xóa bởi admin
        Task<bool> IsUserMemberAsync(Guid communityId, Guid userId);
        Task<CommunityRole?> GetUserRoleInCommunityAsync(Guid communityId, Guid userId);
    }
}