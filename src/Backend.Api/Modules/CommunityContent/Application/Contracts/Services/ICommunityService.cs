// File: Backend.Api/Modules/CommunityContent/Application/Contracts/Services/ICommunityService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.CommunityContent.Application.Contracts.Dtos;
using Backend.Api.SharedKernel.Dtos;
// using Backend.Api.SharedKernel.Dtos; // Nếu PagedResultDto ở SharedKernel

namespace Backend.Api.Modules.CommunityContent.Application.Contracts.Services
{
    public interface ICommunityService
    {
        Task<CommunityDto> CreateCommunityAsync(CreateCommunityRequest request, Guid creatorUserId);
        Task<CommunityDto?> GetCommunityByIdAsync(Guid communityId);
        Task<CommunityDto?> GetCommunityByNameAsync(string name); // Tên Community là unique
        Task<PagedResultDto<CommunitySummaryDto>> SearchCommunitiesAsync(CommunitySearchCriteriaDto criteria); // Phân trang và tìm kiếm
        Task<CommunityDto?> UpdateCommunityAsync(Guid communityId, UpdateCommunityRequest request, Guid updaterUserId);
        Task<bool> DeleteCommunityAsync(Guid communityId, Guid deleterUserId); // Soft delete

        // Các nghiệp vụ liên quan đến thành viên sẽ nằm trong ICommunityMemberService
        // Ví dụ: JoinCommunity, LeaveCommunity, ManageMemberRole
    }
}