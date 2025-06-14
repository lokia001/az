// File: Backend.Api/Modules/CommunityContent/Infrastructure/Persistence/Repositories/CommunityMemberRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Api.Data;
using Backend.Api.Modules.CommunityContent.Domain.Entities;
using Backend.Api.Modules.CommunityContent.Domain.Enums;
using Backend.Api.Modules.CommunityContent.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Modules.CommunityContent.Infrastructure.Persistence.Repositories
{
    public class CommunityMemberRepository : ICommunityMemberRepository
    {
        private readonly AppDbContext _dbContext;

        public CommunityMemberRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        public async Task<CommunityMember?> GetByIdAsync(Guid communityId, Guid userId)
        {
            return await _dbContext.Set<CommunityMember>()
                .FirstOrDefaultAsync(cm => cm.CommunityId == communityId && cm.UserId == userId);
        }

        public async Task<IEnumerable<CommunityMember>> GetMembersByCommunityIdAsync(Guid communityId)
        {
            return await _dbContext.Set<CommunityMember>()
                .Where(cm => cm.CommunityId == communityId)
                // .Include(cm => cm.User) // KHÔNG INCLUDE User từ module khác
                .ToListAsync();
        }

        public async Task<IEnumerable<CommunityMember>> GetCommunitiesByUserIdAsync(Guid userId)
        {
            return await _dbContext.Set<CommunityMember>()
                .Where(cm => cm.UserId == userId)
                .Include(cm => cm.Community) // << ĐÃ CÓ INCLUDE, RẤT TỐT!
                .Where(cm => cm.Community != null && !cm.Community.IsDeleted)
                .ToListAsync(); // Bỏ OrderBy ở đây nếu không cần thiết cho mapping
        }

        public async Task AddAsync(CommunityMember communityMember)
        {
            await _dbContext.Set<CommunityMember>().AddAsync(communityMember);
        }

        public void Update(CommunityMember communityMember)
        {
            _dbContext.Set<CommunityMember>().Update(communityMember);
        }

        public void Delete(CommunityMember communityMember)
        {
            _dbContext.Set<CommunityMember>().Remove(communityMember); // Xóa bản ghi thành viên
        }

        public async Task<bool> IsUserMemberAsync(Guid communityId, Guid userId)
        {
            return await _dbContext.Set<CommunityMember>()
                .AnyAsync(cm => cm.CommunityId == communityId && cm.UserId == userId);
        }

        public async Task<CommunityRole?> GetUserRoleInCommunityAsync(Guid communityId, Guid userId)
        {
            var member = await _dbContext.Set<CommunityMember>()
                .FirstOrDefaultAsync(cm => cm.CommunityId == communityId && cm.UserId == userId);
            return member?.Role;
        }
    }
}