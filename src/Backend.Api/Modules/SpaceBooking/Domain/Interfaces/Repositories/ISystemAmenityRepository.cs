// File: Backend.Api/Modules/SpaceBooking/Domain/Interfaces/Repositories/ISystemAmenityRepository.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;

namespace Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories
{
    public interface ISystemAmenityRepository
    {
        Task<SystemAmenity?> GetByIdAsync(Guid id);
        Task<IEnumerable<SystemAmenity>> GetAllAsync();
        Task AddAsync(SystemAmenity amenity);
        void Update(SystemAmenity amenity);
        void Delete(SystemAmenity amenity);
        Task<SystemAmenity?> GetByNameAsync(string name);
        Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null); // Thêm
        Task<IEnumerable<SystemAmenity>> GetByIdsAsync(IEnumerable<Guid> ids);
    }
}