// File: Backend.Api/Modules/SpaceBooking/Infrastructure/Repositories/PrivateServiceRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Api.Data;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Modules.SpaceBooking.Infrastructure.Repositories
{
    public class PrivateServiceRepository : IPrivateServiceRepository
    {
        private readonly AppDbContext _context;

        public PrivateServiceRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PrivateService?> GetByIdAsync(Guid id)
        {
            return await _context.Set<PrivateService>()
                .FirstOrDefaultAsync(ps => ps.Id == id && !ps.IsDeleted);
        }

        public async Task<IEnumerable<PrivateService>> GetByOwnerIdAsync(Guid ownerId)
        {
            return await _context.Set<PrivateService>()
                .Where(ps => ps.OwnerId == ownerId && !ps.IsDeleted)
                .OrderBy(ps => ps.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<PrivateService>> GetActiveByOwnerIdAsync(Guid ownerId)
        {
            return await _context.Set<PrivateService>()
                .Where(ps => ps.OwnerId == ownerId && ps.IsActive && !ps.IsDeleted)
                .OrderBy(ps => ps.Name)
                .ToListAsync();
        }

        public async Task<PrivateService?> GetByIdAndOwnerIdAsync(Guid id, Guid ownerId)
        {
            return await _context.Set<PrivateService>()
                .FirstOrDefaultAsync(ps => ps.Id == id && ps.OwnerId == ownerId && !ps.IsDeleted);
        }

        public async Task AddAsync(PrivateService privateService)
        {
            await _context.Set<PrivateService>().AddAsync(privateService);
        }

        public void Update(PrivateService privateService)
        {
            _context.Set<PrivateService>().Update(privateService);
        }

        public void Delete(PrivateService privateService)
        {
            privateService.IsDeleted = true;
            privateService.UpdatedAt = DateTime.UtcNow;
            _context.Set<PrivateService>().Update(privateService);
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Set<PrivateService>()
                .AnyAsync(ps => ps.Id == id && !ps.IsDeleted);
        }

        public async Task<bool> ExistsByNameAndOwnerAsync(string name, Guid ownerId, Guid? excludeId = null)
        {
            var query = _context.Set<PrivateService>()
                .Where(ps => ps.Name.ToLower() == name.ToLower() && ps.OwnerId == ownerId && !ps.IsDeleted);

            if (excludeId.HasValue)
            {
                query = query.Where(ps => ps.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }
    }
}
