// File: Backend.Api/Modules/UserRelated/Application/Contracts/Services/IOwnerProfileService.cs
using System;
using System.Threading.Tasks;
using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos;

namespace Backend.Api.Modules.UserRelated.Application.Contracts.Services
{
    public interface IOwnerProfileService
    {
        Task<OwnerProfileDto?> GetOwnerProfileByUserIdAsync(Guid userId);
        Task CreateOwnerProfileAsync(Guid userId, UpsertOwnerProfileRequest request);
        Task UpdateOwnerProfileAsync(Guid userId, UpsertOwnerProfileRequest request);
        // Task VerifyOwnerProfileAsync(Guid userId, bool isVerified); // Chức năng cho SysAdmin
    }
}