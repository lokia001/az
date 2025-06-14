// File: Backend.Api/Modules/UserRelated/Infrastructure/Persistence/Repositories/OwnerProfileRepository.cs
using System;
using System.Threading.Tasks;
using Backend.Api.Data; // Using AppDbContext
using Backend.Api.Modules.UserRelated.Domain.Entities;
using Backend.Api.Modules.UserRelated.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Modules.UserRelated.Infrastructure.Persistence.Repositories
{
    public class OwnerProfileRepository : IOwnerProfileRepository
    {
        private readonly AppDbContext _context;

        public OwnerProfileRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<OwnerProfile?> GetByUserIdAsync(Guid userId)
        {
            // UserId là khóa chính của OwnerProfile
            return await _context.Set<OwnerProfile>()
                                 // .Include(op => op.User) // Có thể include User nếu cần thông tin User ngay
                                 .FirstOrDefaultAsync(op => op.UserId == userId);
        }

        public async Task AddAsync(OwnerProfile ownerProfile)
        {
            await _context.Set<OwnerProfile>().AddAsync(ownerProfile);
        }

        public void Update(OwnerProfile ownerProfile)
        {
            _context.Set<OwnerProfile>().Update(ownerProfile);
        }
    }
}