// File: Backend.Api/Modules/UserRelated/Application/Services/FavoriteSpaceService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Backend.Api.Data;
using Backend.Api.Modules.UserRelated.Application.Contracts.Services;
using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos;
using Backend.Api.Modules.UserRelated.Domain.Interfaces.Repositories;
using Backend.Api.Modules.UserRelated.Domain.Entities;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;

namespace Backend.Api.Modules.UserRelated.Application.Services
{
    public class FavoriteSpaceService : IFavoriteSpaceService
    {
        private readonly IFavoriteSpaceRepository _favoriteSpaceRepository;
        private readonly IUserRepository _userRepository;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<FavoriteSpaceService> _logger;

        public FavoriteSpaceService(
            IFavoriteSpaceRepository favoriteSpaceRepository,
            IUserRepository userRepository,
            AppDbContext context,
            IMapper mapper,
            ILogger<FavoriteSpaceService> logger)
        {
            _favoriteSpaceRepository = favoriteSpaceRepository;
            _userRepository = userRepository;
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<FavoriteSpaceDto> AddToFavoritesAsync(Guid userId, Guid spaceId)
        {
            _logger.LogInformation("Adding space {SpaceId} to favorites for user {UserId}", spaceId, userId);

            // Check if user exists
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new ArgumentException($"User with ID {userId} not found.", nameof(userId));
            }

            // Check if already favorited
            var existingFavorite = await _favoriteSpaceRepository.GetByUserAndSpaceAsync(userId, spaceId);
            if (existingFavorite != null)
            {
                _logger.LogInformation("Space {SpaceId} is already in favorites for user {UserId}", spaceId, userId);
                return _mapper.Map<FavoriteSpaceDto>(existingFavorite);
            }

            // Add to favorites
            var favoriteSpace = new FavoriteSpace(userId, spaceId);
            await _favoriteSpaceRepository.AddAsync(favoriteSpace);
            await _favoriteSpaceRepository.SaveChangesAsync();

            _logger.LogInformation("Successfully added space {SpaceId} to favorites for user {UserId}", spaceId, userId);
            return _mapper.Map<FavoriteSpaceDto>(favoriteSpace);
        }

        public async Task<bool> RemoveFromFavoritesAsync(Guid userId, Guid spaceId)
        {
            _logger.LogInformation("Removing space {SpaceId} from favorites for user {UserId}", spaceId, userId);

            var favoriteSpace = await _favoriteSpaceRepository.GetByUserAndSpaceAsync(userId, spaceId);
            if (favoriteSpace == null)
            {
                _logger.LogInformation("Space {SpaceId} is not in favorites for user {UserId}", spaceId, userId);
                return false;
            }

            _favoriteSpaceRepository.Remove(favoriteSpace);
            var result = await _favoriteSpaceRepository.SaveChangesAsync();

            if (result)
            {
                _logger.LogInformation("Successfully removed space {SpaceId} from favorites for user {UserId}", spaceId, userId);
            }

            return result;
        }

        public async Task<IEnumerable<FavoriteSpaceDto>> GetUserFavoriteSpacesAsync(Guid userId)
        {
            _logger.LogInformation("Getting favorite spaces for user {UserId}", userId);

            // Get all favorite spaces with space details in one query
            var favoriteSpacesWithDetails = await (from fs in _context.FavoriteSpaces
                                                  join s in _context.Set<Space>() on fs.SpaceId equals s.Id
                                                  where fs.UserId == userId
                                                  orderby fs.CreatedAt descending
                                                  select new 
                                                  {
                                                      FavoriteSpace = fs,
                                                      Space = s,
                                                      CoverImage = s.SpaceImages.FirstOrDefault(img => img.IsCoverImage) ??
                                                                  s.SpaceImages.OrderBy(img => img.DisplayOrder).FirstOrDefault()
                                                  })
                                                 .ToListAsync();

            var results = favoriteSpacesWithDetails.Select(item => new FavoriteSpaceDto
            {
                Id = item.FavoriteSpace.Id,
                UserId = item.FavoriteSpace.UserId,
                SpaceId = item.FavoriteSpace.SpaceId,
                CreatedAt = item.FavoriteSpace.CreatedAt,
                // Space details
                SpaceName = item.Space.Name,
                SpaceAddress = item.Space.Address,
                SpacePricePerHour = item.Space.PricePerHour,
                SpaceImageUrl = item.CoverImage?.ImageUrl // This will be Cloudinary URL if configured
            }).ToList();

            return results;
        }

        public async Task<FavoriteSpaceStatusDto> GetFavoriteStatusAsync(Guid userId, Guid spaceId)
        {
            var isFavorited = await _favoriteSpaceRepository.ExistsAsync(userId, spaceId);
            var totalFavorites = await _favoriteSpaceRepository.GetFavoriteCountForSpaceAsync(spaceId);

            return new FavoriteSpaceStatusDto
            {
                SpaceId = spaceId,
                IsFavorited = isFavorited,
                TotalFavorites = totalFavorites
            };
        }

        public async Task<IEnumerable<FavoriteSpaceStatusDto>> GetFavoriteStatusesAsync(Guid userId, IEnumerable<Guid> spaceIds)
        {
            var results = new List<FavoriteSpaceStatusDto>();

            foreach (var spaceId in spaceIds)
            {
                var status = await GetFavoriteStatusAsync(userId, spaceId);
                results.Add(status);
            }

            return results;
        }

        public async Task<bool> IsFavoritedByUserAsync(Guid userId, Guid spaceId)
        {
            return await _favoriteSpaceRepository.ExistsAsync(userId, spaceId);
        }

        public async Task<int> GetFavoriteCountForSpaceAsync(Guid spaceId)
        {
            return await _favoriteSpaceRepository.GetFavoriteCountForSpaceAsync(spaceId);
        }
    }
}
