using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.Modules.UserRelated.Domain.Entities;
using Backend.Api.Modules.UserRelated.Domain.Enums;
using Backend.Api.Modules.UserRelated.Domain.Interfaces.Repositories;

namespace Backend.Api.Modules.UserRelated.Infrastructure.Repositories
{
    public class OwnerRegistrationRequestRepository : IOwnerRegistrationRequestRepository
    {
        private readonly AppDbContext _dbContext;

        public OwnerRegistrationRequestRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<OwnerRegistrationRequest?> GetByIdAsync(Guid id)
        {
            return await _dbContext.OwnerRegistrationRequests
                .FirstOrDefaultAsync(orr => orr.Id == id);
        }

        public async Task<OwnerRegistrationRequest?> GetByIdWithUserAsync(Guid id)
        {
            return await _dbContext.OwnerRegistrationRequests
                .Include(orr => orr.User)
                .Include(orr => orr.ProcessedByAdmin)
                .FirstOrDefaultAsync(orr => orr.Id == id);
        }

        public async Task<OwnerRegistrationRequest?> GetLatestByUserIdAsync(Guid userId)
        {
            return await _dbContext.OwnerRegistrationRequests
                .Where(orr => orr.UserId == userId)
                .OrderByDescending(orr => orr.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<OwnerRegistrationRequest?> GetPendingByUserIdAsync(Guid userId)
        {
            return await _dbContext.OwnerRegistrationRequests
                .FirstOrDefaultAsync(orr => orr.UserId == userId && orr.Status == OwnerRegistrationStatus.Pending);
        }

        public async Task<bool> HasPendingRequestAsync(Guid userId)
        {
            return await _dbContext.OwnerRegistrationRequests
                .AnyAsync(orr => orr.UserId == userId && orr.Status == OwnerRegistrationStatus.Pending);
        }

        public async Task<(List<OwnerRegistrationRequest> requests, int totalCount)> GetPagedAsync(
            int pageNumber = 1,
            int pageSize = 10,
            OwnerRegistrationStatus? status = null,
            DateTime? fromDate = null,
            DateTime? toDate = null,
            string? searchTerm = null)
        {
            var query = _dbContext.OwnerRegistrationRequests
                .Include(orr => orr.User)
                .Include(orr => orr.ProcessedByAdmin)
                .AsQueryable();

            // Apply filters
            if (status.HasValue)
            {
                query = query.Where(orr => orr.Status == status.Value);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(orr => orr.CreatedAt >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(orr => orr.CreatedAt <= toDate.Value);
            }

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var searchLower = searchTerm.ToLower();
                query = query.Where(orr =>
                    orr.CompanyName.ToLower().Contains(searchLower) ||
                    orr.User.Username.ToLower().Contains(searchLower) ||
                    orr.User.Email.ToLower().Contains(searchLower) ||
                    (orr.Description != null && orr.Description.ToLower().Contains(searchLower)));
            }

            var totalCount = await query.CountAsync();

            var requests = await query
                .OrderByDescending(orr => orr.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (requests, totalCount);
        }

        public async Task<List<OwnerRegistrationRequest>> GetPendingRequestsAsync()
        {
            return await _dbContext.OwnerRegistrationRequests
                .Include(orr => orr.User)
                .Where(orr => orr.Status == OwnerRegistrationStatus.Pending)
                .OrderBy(orr => orr.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(OwnerRegistrationRequest request)
        {
            await _dbContext.OwnerRegistrationRequests.AddAsync(request);
        }

        public void Update(OwnerRegistrationRequest request)
        {
            _dbContext.OwnerRegistrationRequests.Update(request);
        }

        public void Delete(OwnerRegistrationRequest request)
        {
            _dbContext.OwnerRegistrationRequests.Remove(request);
        }
    }
}
