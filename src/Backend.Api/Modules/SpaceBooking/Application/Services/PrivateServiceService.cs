// File: Backend.Api/Modules/SpaceBooking/Application/Services/PrivateServiceService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Backend.Api.Data;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Services;
using Backend.Api.Modules.SpaceBooking.Domain.Entities;
using Backend.Api.Modules.SpaceBooking.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Modules.SpaceBooking.Application.Services
{
    public class PrivateServiceService : IPrivateServiceService
    {
        private readonly IPrivateServiceRepository _privateServiceRepository;
        private readonly IMapper _mapper;
        private readonly AppDbContext _dbContext;
        private readonly ILogger<PrivateServiceService> _logger;

        public PrivateServiceService(
            IPrivateServiceRepository privateServiceRepository,
            IMapper mapper,
            AppDbContext dbContext,
            ILogger<PrivateServiceService> logger)
        {
            _privateServiceRepository = privateServiceRepository;
            _mapper = mapper;
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<PrivateServiceDto> CreatePrivateServiceAsync(CreatePrivateServiceRequest request, Guid ownerId)
        {
            _logger.LogInformation("Creating private service '{Name}' for owner {OwnerId}", request.Name, ownerId);

            // Validate input
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                throw new ArgumentException("Service name is required.");
            }

            if (request.UnitPrice < 0)
            {
                throw new ArgumentException("Unit price cannot be negative.");
            }

            // Check for duplicate name
            if (await _privateServiceRepository.ExistsByNameAndOwnerAsync(request.Name, ownerId))
            {
                throw new InvalidOperationException($"A service with name '{request.Name}' already exists for this owner.");
            }

            var privateService = _mapper.Map<PrivateService>(request);
            privateService.Id = Guid.NewGuid();
            privateService.OwnerId = ownerId;
            privateService.CreatedByUserId = ownerId;
            privateService.CreatedAt = DateTime.UtcNow;
            privateService.UpdatedAt = DateTime.UtcNow;

            await _privateServiceRepository.AddAsync(privateService);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Private service '{Name}' created with ID {ServiceId} for owner {OwnerId}", 
                request.Name, privateService.Id, ownerId);

            return _mapper.Map<PrivateServiceDto>(privateService);
        }

        public async Task<PrivateServiceDto?> GetPrivateServiceByIdAsync(Guid id, Guid ownerId)
        {
            var privateService = await _privateServiceRepository.GetByIdAndOwnerIdAsync(id, ownerId);
            return privateService != null ? _mapper.Map<PrivateServiceDto>(privateService) : null;
        }

        public async Task<IEnumerable<PrivateServiceDto>> GetPrivateServicesByOwnerAsync(Guid ownerId)
        {
            var privateServices = await _privateServiceRepository.GetByOwnerIdAsync(ownerId);
            return _mapper.Map<IEnumerable<PrivateServiceDto>>(privateServices);
        }

        public async Task<IEnumerable<PrivateServiceDto>> GetActivePrivateServicesByOwnerAsync(Guid ownerId)
        {
            var privateServices = await _privateServiceRepository.GetActiveByOwnerIdAsync(ownerId);
            return _mapper.Map<IEnumerable<PrivateServiceDto>>(privateServices);
        }

        public async Task<PrivateServiceDto?> UpdatePrivateServiceAsync(Guid id, UpdatePrivateServiceRequest request, Guid ownerId)
        {
            _logger.LogInformation("Updating private service {ServiceId} for owner {OwnerId}", id, ownerId);

            var privateService = await _privateServiceRepository.GetByIdAndOwnerIdAsync(id, ownerId);
            if (privateService == null)
            {
                _logger.LogWarning("Private service {ServiceId} not found for owner {OwnerId}", id, ownerId);
                return null;
            }

            // Validate input
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                throw new ArgumentException("Service name is required.");
            }

            if (request.UnitPrice < 0)
            {
                throw new ArgumentException("Unit price cannot be negative.");
            }

            // Check for duplicate name (excluding current service)
            if (await _privateServiceRepository.ExistsByNameAndOwnerAsync(request.Name, ownerId, id))
            {
                throw new InvalidOperationException($"A service with name '{request.Name}' already exists for this owner.");
            }

            // Update properties
            privateService.Name = request.Name;
            privateService.Description = request.Description;
            privateService.UnitPrice = request.UnitPrice;
            privateService.Unit = request.Unit;
            privateService.IsActive = request.IsActive;
            privateService.UpdatedAt = DateTime.UtcNow;
            privateService.LastEditedByUserId = ownerId;

            _privateServiceRepository.Update(privateService);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Private service {ServiceId} updated for owner {OwnerId}", id, ownerId);

            return _mapper.Map<PrivateServiceDto>(privateService);
        }

        public async Task<bool> DeletePrivateServiceAsync(Guid id, Guid ownerId)
        {
            _logger.LogInformation("Deleting private service {ServiceId} for owner {OwnerId}", id, ownerId);

            var privateService = await _privateServiceRepository.GetByIdAndOwnerIdAsync(id, ownerId);
            if (privateService == null)
            {
                _logger.LogWarning("Private service {ServiceId} not found for owner {OwnerId}", id, ownerId);
                return false;
            }

            privateService.IsDeleted = true;
            privateService.UpdatedAt = DateTime.UtcNow;
            privateService.LastEditedByUserId = ownerId;

            _privateServiceRepository.Update(privateService);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Private service {ServiceId} deleted for owner {OwnerId}", id, ownerId);

            return true;
        }

        public async Task<bool> TogglePrivateServiceStatusAsync(Guid id, Guid ownerId)
        {
            _logger.LogInformation("Toggling private service {ServiceId} status for owner {OwnerId}", id, ownerId);

            var privateService = await _privateServiceRepository.GetByIdAndOwnerIdAsync(id, ownerId);
            if (privateService == null)
            {
                _logger.LogWarning("Private service {ServiceId} not found for owner {OwnerId}", id, ownerId);
                return false;
            }

            privateService.IsActive = !privateService.IsActive;
            privateService.UpdatedAt = DateTime.UtcNow;
            privateService.LastEditedByUserId = ownerId;

            _privateServiceRepository.Update(privateService);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Private service {ServiceId} status toggled to {IsActive} for owner {OwnerId}", 
                id, privateService.IsActive, ownerId);

            return true;
        }
    }
}
