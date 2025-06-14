// File: Backend.Api/Modules/SpaceBooking/Infrastructure/Persistence/Repositories/SystemSpaceServiceRepository.cs
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
    public class SystemSpaceServiceRepository : ISystemSpaceServiceRepository
    {
        private readonly AppDbContext _context;

        public SystemSpaceServiceRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<SystemSpaceService?> GetByIdAsync(Guid id)
        {
            return await _context.Set<SystemSpaceService>().FindAsync(id);
        }

        public async Task<SystemSpaceService?> GetByNameAsync(string name)
        {
            return await _context.Set<SystemSpaceService>().FirstOrDefaultAsync(s => s.Name.ToLower() == name.ToLower());
        }

        public async Task<IEnumerable<SystemSpaceService>> GetAllAsync()
        {
            return await _context.Set<SystemSpaceService>().ToListAsync();
        }

        public async Task<IEnumerable<SystemSpaceService>> GetByIdsAsync(IEnumerable<Guid> ids)
        {
            return await _context.Set<SystemSpaceService>().Where(s => ids.Contains(s.Id)).ToListAsync();
        }

        public async Task AddAsync(SystemSpaceService service)
        {
            await _context.Set<SystemSpaceService>().AddAsync(service);
        }

        public void Update(SystemSpaceService service)
        {
            _context.Set<SystemSpaceService>().Update(service);
        }

        public void Delete(SystemSpaceService service)
        {
            _context.Set<SystemSpaceService>().Remove(service);
        }

        public async Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null)
        {
            var query = _context.Set<SystemSpaceService>().Where(s => s.Name.ToLower() == name.ToLower());
            if (excludeId.HasValue)
            {
                query = query.Where(s => s.Id != excludeId.Value);
            }
            return await query.AnyAsync();
        }
    }
}