// File: Backend.Api/Modules/UserRelated/Domain/Interfaces/Repositories/IFavoriteSpaceRepository.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.UserRelated.Domain.Entities;

namespace Backend.Api.Modules.UserRelated.Domain.Interfaces.Repositories
{
    public interface IFavoriteSpaceRepository
    {
        Task<FavoriteSpace?> GetByUserAndSpaceAsync(Guid userId, Guid spaceId);
        Task<IEnumerable<FavoriteSpace>> GetByUserIdAsync(Guid userId);
        Task<bool> ExistsAsync(Guid userId, Guid spaceId);
        Task<int> GetFavoriteCountForSpaceAsync(Guid spaceId);
        Task AddAsync(FavoriteSpace favoriteSpace);
        void Remove(FavoriteSpace favoriteSpace);
        Task<bool> SaveChangesAsync();
    }
}
