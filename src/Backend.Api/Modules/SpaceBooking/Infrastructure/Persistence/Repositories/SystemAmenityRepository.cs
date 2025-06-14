// File: Backend.Api/Modules/SpaceBooking/Infrastructure/Persistence/Repositories/SystemAmenityRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Api.Data;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Modules.SpaceBooking.Infrastructure.Persistence.Repositories
{
    public class SystemAmenityRepository : ISystemAmenityRepository
    {
        private readonly AppDbContext _context;

        public SystemAmenityRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<SystemAmenity?> GetByIdAsync(Guid id)
        {
            return await _context.Set<SystemAmenity>().FindAsync(id);
        }

        public async Task<SystemAmenity?> GetByNameAsync(string name)
        {
            return await _context.Set<SystemAmenity>().FirstOrDefaultAsync(sa => sa.Name.ToLower() == name.ToLower());
        }

        public async Task<IEnumerable<SystemAmenity>> GetAllAsync()
        {
            return await _context.Set<SystemAmenity>().ToListAsync();
        }

        public async Task<IEnumerable<SystemAmenity>> GetByIdsAsync(IEnumerable<Guid> ids)
        {
            return await _context.Set<SystemAmenity>().Where(sa => ids.Contains(sa.Id)).ToListAsync();
        }

        public async Task AddAsync(SystemAmenity amenity)
        {
            await _context.Set<SystemAmenity>().AddAsync(amenity);
        }

        public void Update(SystemAmenity amenity)
        {
            _context.Set<SystemAmenity>().Update(amenity);
        }

        public void Delete(SystemAmenity amenity)
        {
            // SystemAmenity thường là hard delete, vì nếu xóa thì không nên còn liên kết
            // Tuy nhiên, cần đảm bảo OnDelete behavior trong SpaceSystemAmenityConfiguration là Cascade hoặc Restrict phù hợp
            _context.Set<SystemAmenity>().Remove(amenity);
        }

        public async Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null)
        {
            var query = _context.Set<SystemAmenity>().Where(sa => sa.Name.ToLower() == name.ToLower());
            if (excludeId.HasValue)
            {
                query = query.Where(sa => sa.Id != excludeId.Value);
            }
            return await query.AnyAsync();
        }
    }
}