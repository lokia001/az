// File: Backend.Api/Modules/UserRelated/Infrastructure/Repositories/FavoriteSpaceRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.Modules.UserRelated.Domain.Entities;
using Backend.Api.Modules.UserRelated.Domain.Interfaces.Repositories;

namespace Backend.Api.Modules.UserRelated.Infrastructure.Repositories
{
    public class FavoriteSpaceRepository : IFavoriteSpaceRepository
    {
        private readonly AppDbContext _context;

        public FavoriteSpaceRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<FavoriteSpace?> GetByUserAndSpaceAsync(Guid userId, Guid spaceId)
        {
            return await _context.FavoriteSpaces
                .FirstOrDefaultAsync(fs => fs.UserId == userId && fs.SpaceId == spaceId);
        }

        public async Task<IEnumerable<FavoriteSpace>> GetByUserIdAsync(Guid userId)
        {
            return await _context.FavoriteSpaces
                .Where(fs => fs.UserId == userId)
                .OrderByDescending(fs => fs.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(Guid userId, Guid spaceId)
        {
            return await _context.FavoriteSpaces
                .AnyAsync(fs => fs.UserId == userId && fs.SpaceId == spaceId);
        }

        public async Task<int> GetFavoriteCountForSpaceAsync(Guid spaceId)
        {
            return await _context.FavoriteSpaces
                .CountAsync(fs => fs.SpaceId == spaceId);
        }

        public async Task AddAsync(FavoriteSpace favoriteSpace)
        {
            await _context.FavoriteSpaces.AddAsync(favoriteSpace);
        }

        public void Remove(FavoriteSpace favoriteSpace)
        {
            _context.FavoriteSpaces.Remove(favoriteSpace);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
