// File: Backend.Api/Modules/SpaceBooking/Domain/Interfaces/Repositories/IPrivateServiceRepository.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;

namespace Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories
{
    public interface IPrivateServiceRepository
    {
        Task<PrivateService?> GetByIdAsync(Guid id);
        Task<IEnumerable<PrivateService>> GetByOwnerIdAsync(Guid ownerId);
        Task<IEnumerable<PrivateService>> GetActiveByOwnerIdAsync(Guid ownerId);
        Task<PrivateService?> GetByIdAndOwnerIdAsync(Guid id, Guid ownerId);
        Task AddAsync(PrivateService privateService);
        void Update(PrivateService privateService);
        void Delete(PrivateService privateService);
        Task<bool> ExistsAsync(Guid id);
        Task<bool> ExistsByNameAndOwnerAsync(string name, Guid ownerId, Guid? excludeId = null);
    }
}
