using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Backend.Api.Data;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Services;
using Backend.Api.Modules.SpaceBooking.Domain.Entities; // SystemSpaceService entity
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories; // ISystemSpaceServiceRepository
using Microsoft.EntityFrameworkCore; // Cho AnyAsync
using Microsoft.Extensions.Logging;

namespace Backend.Api.Modules.SpaceBooking.Application.Services
{
    public class SystemSpaceServiceService : ISystemSpaceServiceService
    {
        private readonly ISystemSpaceServiceRepository _systemSpaceServiceRepository;
        private readonly IMapper _mapper;
        private readonly AppDbContext _dbContext;
        private readonly ILogger<SystemSpaceServiceService> _logger;

        public SystemSpaceServiceService(
            ISystemSpaceServiceRepository systemSpaceServiceRepository,
            IMapper mapper,
            AppDbContext dbContext,
            ILogger<SystemSpaceServiceService> logger)
        {
            _systemSpaceServiceRepository = systemSpaceServiceRepository;
            _mapper = mapper;
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<SystemSpaceServiceDto> CreateAsync(CreateSystemSpaceServiceRequest request)
        {
            _logger.LogInformation("Attempting to create system space service with name: {Name}", request.Name);

            if (await _systemSpaceServiceRepository.ExistsByNameAsync(request.Name))
            {
                throw new ArgumentException($"System space service with name '{request.Name}' already exists.");
            }

            var serviceEntity = _mapper.Map<SystemSpaceService>(request);

            await _systemSpaceServiceRepository.AddAsync(serviceEntity);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("System space service created successfully with ID: {Id}", serviceEntity.Id);
            return _mapper.Map<SystemSpaceServiceDto>(serviceEntity);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            _logger.LogInformation("Attempting to delete system space service with ID: {Id}", id);
            var serviceEntity = await _systemSpaceServiceRepository.GetByIdAsync(id);
            if (serviceEntity == null)
            {
                _logger.LogWarning("System space service with ID: {Id} not found for deletion.", id);
                return false;
            }

            // Tương tự SystemAmenity, kiểm tra xem có đang được sử dụng không
            bool isUsed = await _dbContext.Set<SpaceSystemSpaceService>().AnyAsync(link => link.SystemSpaceServiceId == id);
            if (isUsed)
            {
                // throw new InvalidOperationException($"System space service '{serviceEntity.Name}' is currently in use and cannot be deleted.");
                _logger.LogWarning("System space service {Id} is in use but will be deleted due to cascade behavior (if configured).", id);
            }

            _systemSpaceServiceRepository.Delete(serviceEntity);
            var result = await _dbContext.SaveChangesAsync();

            if (result > 0)
            {
                _logger.LogInformation("System space service with ID: {Id} deleted successfully.", id);
                return true;
            }
            _logger.LogWarning("System space service with ID: {Id} was not deleted (no changes saved).", id);
            return false;
        }

        public async Task<IEnumerable<SystemSpaceServiceDto>> GetAllAsync()
        {
            _logger.LogInformation("Fetching all system space services.");
            var services = await _systemSpaceServiceRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<SystemSpaceServiceDto>>(services);
        }

        public async Task<SystemSpaceServiceDto?> GetByIdAsync(Guid id)
        {
            _logger.LogInformation("Fetching system space service with ID: {Id}", id);
            var serviceEntity = await _systemSpaceServiceRepository.GetByIdAsync(id);
            if (serviceEntity == null)
            {
                _logger.LogWarning("System space service with ID: {Id} not found.", id);
                return null;
            }
            return _mapper.Map<SystemSpaceServiceDto>(serviceEntity);
        }

        public async Task<SystemSpaceServiceDto?> UpdateAsync(Guid id, UpdateSystemSpaceServiceRequest request)
        {
            _logger.LogInformation("Attempting to update system space service with ID: {Id}", id);
            var serviceEntity = await _systemSpaceServiceRepository.GetByIdAsync(id);
            if (serviceEntity == null)
            {
                _logger.LogWarning("System space service with ID: {Id} not found for update.", id);
                return null;
            }

            if (serviceEntity.Name.ToLower() != request.Name.ToLower() && await _systemSpaceServiceRepository.ExistsByNameAsync(request.Name, id))
            {
                throw new ArgumentException($"System space service with name '{request.Name}' already exists.");
            }

            _mapper.Map(request, serviceEntity);
            // serviceEntity.UpdatedAt = DateTime.UtcNow; // Nếu có

            _systemSpaceServiceRepository.Update(serviceEntity);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("System space service with ID: {Id} updated successfully.", id);
            return _mapper.Map<SystemSpaceServiceDto>(serviceEntity);
        }
    }
}