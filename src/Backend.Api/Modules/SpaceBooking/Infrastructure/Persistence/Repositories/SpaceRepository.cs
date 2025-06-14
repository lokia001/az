// File: Backend.Api/Modules/SpaceBooking/Infrastructure/Persistence/Repositories/SpaceRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Backend.Api.Data;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos; // Cần cho SpaceSearchCriteria
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.Modules.SpaceBooking.Domain.Enums; // Cần cho BookingStatus trong SearchAsync
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Modules.SpaceBooking.Infrastructure.Persistence.Repositories
{
    public class SpaceRepository : ISpaceRepository
    {
        private readonly AppDbContext _context;

        public SpaceRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        private IQueryable<Space> ApplyIncludes(IQueryable<Space> query, bool includeDetails)
        {
            if (includeDetails)
            {
                query = query
                    .Include(s => s.SpaceImages)
                    .Include(s => s.SystemAmenitiesLink)
                        .ThenInclude(sal => sal.SystemAmenity)
                    .Include(s => s.SystemServicesLink)
                        .ThenInclude(ssl => ssl.SystemSpaceService)
                    .Include(s => s.CustomAmenities)
                    .Include(s => s.CustomServices);
            }
            return query;
        }

        public async Task<Space?> GetByIdAsync(Guid id)
        {
            return await ApplyIncludes(_context.Set<Space>(), false)
                         .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Space?> GetByIdWithDetailsAsync(Guid id)
        {
            return await ApplyIncludes(_context.Set<Space>(), true)
                         .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<IEnumerable<Space>> GetAllAsync() // Chữ ký này khớp với ISpaceRepository đã chốt
        {
            return await ApplyIncludes(_context.Set<Space>(), false).ToListAsync();
        }

        public async Task<IEnumerable<Space>> GetAllWithDetailsAsync() // Chữ ký này khớp
        {
            return await ApplyIncludes(_context.Set<Space>(), true).ToListAsync();
        }

        public async Task<IEnumerable<Space>> FindAsync(Expression<Func<Space, bool>> predicate) // Chữ ký này khớp
        {
            return await ApplyIncludes(_context.Set<Space>(), false)
                         .Where(predicate)
                         .ToListAsync();
        }

        public async Task<IEnumerable<Space>> FindWithDetailsAsync(Expression<Func<Space, bool>> predicate) // Chữ ký này khớp
        {
            return await ApplyIncludes(_context.Set<Space>(), true)
                         .Where(predicate)
                         .ToListAsync();
        }

        public async Task AddAsync(Space space)
        {
            await _context.Set<Space>().AddAsync(space);
        }

        public void Update(Space space)
        {
            _context.Set<Space>().Update(space);
        }

        public void Delete(Space space)
        {
            _context.Set<Space>().Remove(space);
        }

        public async Task<Space?> GetBySlugAsync(string slug) // Chữ ký này khớp
        {
            return await ApplyIncludes(_context.Set<Space>(), false)
                         .FirstOrDefaultAsync(s => s.Slug == slug);
        }

        public async Task<Space?> GetBySlugWithDetailsAsync(string slug) // Chữ ký này khớp
        {
            return await ApplyIncludes(_context.Set<Space>(), true)
                         .FirstOrDefaultAsync(s => s.Slug == slug);
        }

        public async Task<bool> ExistsBySlugAsync(string slug, Guid? excludeSpaceId = null) // Chữ ký này khớp
        {
            var query = _context.Set<Space>().Where(s => s.Slug == slug);
            if (excludeSpaceId.HasValue)
            {
                query = query.Where(s => s.Id != excludeSpaceId.Value);
            }
            return await query.AnyAsync();
        }

        public async Task<IEnumerable<Space>> GetByOwnerIdAsync(Guid ownerId) // Chữ ký này khớp
        {
            return await ApplyIncludes(_context.Set<Space>(), false)
                         .Where(s => s.OwnerId == ownerId)
                         .ToListAsync();
        }

        public async Task<IEnumerable<Space>> GetByOwnerIdWithDetailsAsync(Guid ownerId) // Chữ ký này khớp
        {
            return await ApplyIncludes(_context.Set<Space>(), true)
                         .Where(s => s.OwnerId == ownerId)
                         .ToListAsync();
        }

        // CHỈ CÓ MỘT PHIÊN BẢN CỦA SearchAsync
        public async Task<(IEnumerable<Space> Items, int TotalCount)> SearchAsync(SpaceSearchCriteria criteria, bool includeDetails)
        {
            var query = _context.Set<Space>().AsQueryable();

            if (!string.IsNullOrWhiteSpace(criteria.Keyword))
            {
                var keywordLower = criteria.Keyword.ToLower();
                query = query.Where(s =>
            (s.Name != null && s.Name.ToLower().Contains(keywordLower)) || // << SỬA Ở ĐÂY
            (s.Description != null && s.Description.ToLower().Contains(keywordLower)) // << SỬA Ở ĐÂY
        );
            }

            if (!string.IsNullOrWhiteSpace(criteria.Address))
            {
                var addressLower = criteria.Address.ToLowerInvariant();
                query = query.Where(s => s.Address != null && s.Address.ToLowerInvariant().Contains(addressLower));
            }

            if (criteria.Type.HasValue)
            {
                query = query.Where(s => s.Type == criteria.Type.Value);
            }

            if (criteria.MinCapacity.HasValue && criteria.MinCapacity.Value > 0)
            {
                query = query.Where(s => s.Capacity >= criteria.MinCapacity.Value);
            }

            if (criteria.MaxPricePerHour.HasValue && criteria.MaxPricePerHour.Value > 0)
            {
                query = query.Where(s => s.PricePerHour <= criteria.MaxPricePerHour.Value);
            }

            if (criteria.AvailabilityStartDate.HasValue && criteria.AvailabilityEndDate.HasValue)
            {
                var startDate = criteria.AvailabilityStartDate.Value;
                var endDate = criteria.AvailabilityEndDate.Value;
                if (startDate < endDate)
                {
                    var bookedSpaceIds = await _context.Set<Booking>()
                        .Where(b => !b.IsDeleted &&
                                    (b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Pending) &&
                                    b.StartTime < endDate &&
                                    b.EndTime > startDate)
                        .Select(b => b.SpaceId)
                        .Distinct()
                        .ToListAsync();
                    if (bookedSpaceIds.Any())
                    {
                        query = query.Where(s => !bookedSpaceIds.Contains(s.Id));
                    }
                }
            }

            if (criteria.AmenityIds != null && criteria.AmenityIds.Any())
            {
                var requiredAmenityIds = criteria.AmenityIds.ToHashSet();
                query = query.Where(s => s.SystemAmenitiesLink
                                          .Select(sal => sal.SystemAmenityId)
                                          .Distinct()
                                          .Count(amenityIdOnSpace => requiredAmenityIds.Contains(amenityIdOnSpace)) == requiredAmenityIds.Count
                                );
            }

            var totalCount = await query.CountAsync();
            query = query.OrderBy(s => s.Name); // Hoặc một tiêu chí sắp xếp khác

            var pageNumber = criteria.PageNumber > 0 ? criteria.PageNumber : 1;
            var pageSize = criteria.PageSize > 0 ? criteria.PageSize : 10;
            query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);

            query = ApplyIncludes(query, includeDetails);

            var items = await query.ToListAsync();
            return (items, totalCount);
        }
    } // Đóng class SpaceRepository
} // Đóng namespace Backend.Api.Modules.SpaceBooking.Infrastructure.Persistence.Repositories