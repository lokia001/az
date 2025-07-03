// File: Backend.Api/Modules/SpaceBooking/Application/Contracts/Services/ISpaceService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.SharedKernel.Dtos; // Đảm bảo using này đúng

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Services
{
    public interface ISpaceService
    {
        Task<SpaceDto> CreateSpaceAsync(CreateSpaceRequest request, Guid creatorUserId);
        Task<SpaceDto?> UpdateSpaceAsync(Guid spaceId, UpdateSpaceRequest request, Guid editorUserId);
        Task<SpaceDto?> UpdateSpaceStatusAsync(Guid spaceId, UpdateSpaceStatusRequest request, Guid updaterUserId);
        Task<bool> DeleteSpaceAsync(Guid spaceId, Guid deleterUserId);
        Task<IEnumerable<SpaceDto>> GetSpacesByOwnerAsync(Guid ownerId);
        Task<SpaceImageDto> AddImageToSpaceAsync(Guid spaceId, UploadSpaceImageRequest request, Guid uploaderUserId);
        Task<bool> RemoveImageFromSpaceAsync(Guid spaceId, Guid imageId, Guid removerUserId);
        Task<SpaceImageDto?> UpdateSpaceImageDetailsAsync(Guid spaceId, Guid imageId, UpdateSpaceImageDetailsRequest request, Guid editorUserId);
        Task<bool> SetCoverImageAsync(Guid spaceId, Guid imageId, Guid ownerId);
        Task<SpaceDto?> GetSpaceByIdAsync(Guid spaceId);
        Task<SpaceDto?> GetSpaceBySlugAsync(string slug);
        Task<PagedResultDto<SpaceDto>> SearchSpacesAsync(SpaceSearchCriteria criteria);
        Task<IEnumerable<SpaceWithDistanceDto>> FindNearbySpacesAsync(NearbySpaceSearchCriteria criteria);
    }
}