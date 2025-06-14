
// File: Backend.Api/Modules/UserRelated/Domain/Interfaces/Repositories/IOwnerProfileRepository.cs
using System;
using System.Threading.Tasks;
using Backend.Api.Modules.UserRelated.Domain.Entities;

namespace Backend.Api.Modules.UserRelated.Domain.Interfaces.Repositories
{
    public interface IOwnerProfileRepository
    {
        Task<OwnerProfile?> GetByUserIdAsync(Guid userId);
        Task AddAsync(OwnerProfile ownerProfile);
        void Update(OwnerProfile ownerProfile);
        // Task SaveChangesAsync();
    }
}