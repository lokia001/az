// File: Backend.Api/Modules/SpaceBooking/Domain/Interfaces/Repositories/ISystemSpaceServiceRepository.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;

namespace Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories
{
    public interface ISystemSpaceServiceRepository
    {
        Task<SystemSpaceService?> GetByIdAsync(Guid id);
        Task<IEnumerable<SystemSpaceService>> GetAllAsync();
        Task AddAsync(SystemSpaceService service);
        void Update(SystemSpaceService service);
        void Delete(SystemSpaceService service);
        Task<SystemSpaceService?> GetByNameAsync(string name);
        Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null); // Thêm
        Task<IEnumerable<SystemSpaceService>> GetByIdsAsync(IEnumerable<Guid> ids);
    }
}