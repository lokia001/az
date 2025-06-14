// File: Backend.Api/Modules/SpaceBooking/Domain/Interfaces/Repositories/ISpaceRepository.cs
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;

namespace Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories
{
    public interface ISpaceRepository
    {
        Task<Space?> GetByIdAsync(Guid id);
        Task<Space?> GetByIdWithDetailsAsync(Guid id); // Lấy kèm details
        Task<IEnumerable<Space>> GetAllAsync(); // Lấy tất cả, không kèm details mặc định
        Task<IEnumerable<Space>> GetAllWithDetailsAsync(); // Lấy tất cả, kèm details
        Task<IEnumerable<Space>> FindAsync(Expression<Func<Space, bool>> predicate); // Tìm kiếm cơ bản
        Task<IEnumerable<Space>> FindWithDetailsAsync(Expression<Func<Space, bool>> predicate); // Tìm kiếm kèm details
        Task AddAsync(Space space);
        void Update(Space space);
        void Delete(Space space); // Service sẽ quyết định soft hay hard delete
        Task<Space?> GetBySlugAsync(string slug);
        Task<Space?> GetBySlugWithDetailsAsync(string slug);
        Task<bool> ExistsBySlugAsync(string slug, Guid? excludeSpaceId = null); // excludeSpaceId để dùng khi update
        Task<IEnumerable<Space>> GetByOwnerIdAsync(Guid ownerId);
        Task<IEnumerable<Space>> GetByOwnerIdWithDetailsAsync(Guid ownerId);
        Task<(IEnumerable<Space> Items, int TotalCount)> SearchAsync(SpaceSearchCriteria criteria, bool includeDetails);
    }
}