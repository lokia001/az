// File: Backend.Api/Modules/UserRelated/Application/Contracts/Services/IFavoriteSpaceService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos;

namespace Backend.Api.Modules.UserRelated.Application.Contracts.Services
{
    public interface IFavoriteSpaceService
    {
        Task<FavoriteSpaceDto> AddToFavoritesAsync(Guid userId, Guid spaceId);
        Task<bool> RemoveFromFavoritesAsync(Guid userId, Guid spaceId);
        Task<IEnumerable<FavoriteSpaceDto>> GetUserFavoriteSpacesAsync(Guid userId);
        Task<FavoriteSpaceStatusDto> GetFavoriteStatusAsync(Guid userId, Guid spaceId);
        Task<IEnumerable<FavoriteSpaceStatusDto>> GetFavoriteStatusesAsync(Guid userId, IEnumerable<Guid> spaceIds);
        Task<bool> IsFavoritedByUserAsync(Guid userId, Guid spaceId);
        Task<int> GetFavoriteCountForSpaceAsync(Guid spaceId);
    }
}
