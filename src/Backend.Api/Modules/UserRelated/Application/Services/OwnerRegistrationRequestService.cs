using System;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Backend.Api.Data;
using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos;
using Backend.Api.Modules.UserRelated.Application.Contracts.Services;
using Backend.Api.Modules.UserRelated.Domain.Entities;
using Backend.Api.Modules.UserRelated.Domain.Enums;
using Backend.Api.Modules.UserRelated.Domain.Interfaces.Repositories;

namespace Backend.Api.Modules.UserRelated.Application.Services
{
    public class OwnerRegistrationRequestService : IOwnerRegistrationRequestService
    {
        private readonly IOwnerRegistrationRequestRepository _ownerRegistrationRequestRepository;
        private readonly IUserRepository _userRepository;
        private readonly IUserService _userService;
        private readonly AppDbContext _dbContext;
        private readonly IMapper _mapper;
        private readonly ILogger<OwnerRegistrationRequestService> _logger;

        public OwnerRegistrationRequestService(
            IOwnerRegistrationRequestRepository ownerRegistrationRequestRepository,
            IUserRepository userRepository,
            IUserService userService,
            AppDbContext dbContext,
            IMapper mapper,
            ILogger<OwnerRegistrationRequestService> logger)
        {
            _ownerRegistrationRequestRepository = ownerRegistrationRequestRepository;
            _userRepository = userRepository;
            _userService = userService;
            _dbContext = dbContext;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<OwnerRegistrationRequestDto> SubmitRegistrationRequestAsync(Guid userId, CreateOwnerRegistrationRequest request)
        {
            _logger.LogInformation("User {UserId} submitting owner registration request", userId);

            // Validate user exists
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new ArgumentException($"User with ID {userId} not found.");
            }

            // Check if user is already an Owner
            if (user.Role == UserRole.Owner)
            {
                throw new InvalidOperationException("User is already an Owner.");
            }

            // Check if user already has a pending request
            var existingPendingRequest = await _ownerRegistrationRequestRepository.HasPendingRequestAsync(userId);
            if (existingPendingRequest)
            {
                throw new InvalidOperationException("User already has a pending owner registration request.");
            }

            // Create new registration request
            var registrationRequest = _mapper.Map<OwnerRegistrationRequest>(request);
            registrationRequest.UserId = userId;

            await _ownerRegistrationRequestRepository.AddAsync(registrationRequest);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Owner registration request {RequestId} created for user {UserId}", 
                registrationRequest.Id, userId);

            // Return the created request with user info
            var createdRequest = await _ownerRegistrationRequestRepository.GetByIdWithUserAsync(registrationRequest.Id);
            return _mapper.Map<OwnerRegistrationRequestDto>(createdRequest!);
        }

        public async Task CancelRegistrationRequestAsync(Guid requestId, Guid userId)
        {
            _logger.LogInformation("User {UserId} cancelling registration request {RequestId}", userId, requestId);

            var request = await _ownerRegistrationRequestRepository.GetByIdAsync(requestId);
            if (request == null)
            {
                throw new ArgumentException($"Registration request with ID {requestId} not found.");
            }

            // Verify ownership
            if (request.UserId != userId)
            {
                throw new UnauthorizedAccessException("User can only cancel their own registration requests.");
            }

            // Can only cancel pending requests
            if (request.Status != OwnerRegistrationStatus.Pending)
            {
                throw new InvalidOperationException("Can only cancel pending registration requests.");
            }

            request.Status = OwnerRegistrationStatus.Cancelled;
            request.MarkAsUpdated();

            _ownerRegistrationRequestRepository.Update(request);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Registration request {RequestId} cancelled by user {UserId}", requestId, userId);
        }

        public async Task<OwnerRegistrationRequestDto?> GetUserRegistrationRequestAsync(Guid userId)
        {
            var request = await _ownerRegistrationRequestRepository.GetLatestByUserIdAsync(userId);
            return request != null ? _mapper.Map<OwnerRegistrationRequestDto>(request) : null;
        }

        public async Task<OwnerRegistrationRequestDto?> GetRegistrationRequestByIdAsync(Guid requestId)
        {
            var request = await _ownerRegistrationRequestRepository.GetByIdWithUserAsync(requestId);
            return request != null ? _mapper.Map<OwnerRegistrationRequestDto>(request) : null;
        }

        public async Task<PagedOwnerRegistrationRequestDto> GetRegistrationRequestsAsync(
            int pageNumber = 1,
            int pageSize = 10,
            string? status = null,
            DateTime? fromDate = null,
            DateTime? toDate = null,
            string? searchTerm = null)
        {
            OwnerRegistrationStatus? statusEnum = null;
            if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OwnerRegistrationStatus>(status, true, out var parsedStatus))
            {
                statusEnum = parsedStatus;
            }

            var (requests, totalCount) = await _ownerRegistrationRequestRepository.GetPagedAsync(
                pageNumber, pageSize, statusEnum, fromDate, toDate, searchTerm);

            var requestDtos = _mapper.Map<List<OwnerRegistrationRequestDto>>(requests);

            return new PagedOwnerRegistrationRequestDto
            {
                Requests = requestDtos,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<int> GetPendingRequestsCountAsync()
        {
            var (_, totalCount) = await _ownerRegistrationRequestRepository.GetPagedAsync(
                pageNumber: 1, 
                pageSize: 1, 
                status: OwnerRegistrationStatus.Pending);
            
            return totalCount;
        }

        public async Task ProcessRegistrationRequestAsync(Guid requestId, Guid adminUserId, ProcessOwnerRegistrationRequest processRequest)
        {
            _logger.LogInformation("Admin {AdminUserId} processing registration request {RequestId} with approval: {IsApproved}", 
                adminUserId, requestId, processRequest.IsApproved);

            var request = await _ownerRegistrationRequestRepository.GetByIdWithUserAsync(requestId);
            if (request == null)
            {
                throw new ArgumentException($"Registration request with ID {requestId} not found.");
            }

            if (request.Status != OwnerRegistrationStatus.Pending)
            {
                throw new InvalidOperationException($"Cannot process request that is already {request.Status}");
            }

            // Verify admin user exists
            var adminUser = await _userRepository.GetByIdAsync(adminUserId);
            if (adminUser == null || adminUser.Role != UserRole.SysAdmin)
            {
                throw new UnauthorizedAccessException("Only SysAdmin can process owner registration requests.");
            }

            var newStatus = processRequest.IsApproved ? OwnerRegistrationStatus.Approved : OwnerRegistrationStatus.Rejected;
            
            // Process the request
            request.ProcessRequest(
                newStatus, 
                adminUserId, 
                processRequest.AdminNotes, 
                processRequest.RejectionReason);

            // If approved, change user role to Owner
            if (processRequest.IsApproved)
            {
                _logger.LogInformation("Changing user {UserId} role to Owner after request approval", request.UserId);
                var roleChangeSuccess = await _userService.ChangeUserRoleAsync(request.UserId, UserRole.Owner, adminUserId);
                
                if (!roleChangeSuccess)
                {
                    _logger.LogError("Failed to change user {UserId} role to Owner", request.UserId);
                    throw new InvalidOperationException("Failed to change user role to Owner. Request processing aborted.");
                }
            }

            _ownerRegistrationRequestRepository.Update(request);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Registration request {RequestId} processed with status {Status} by admin {AdminUserId}", 
                requestId, newStatus, adminUserId);
        }
    }
}
