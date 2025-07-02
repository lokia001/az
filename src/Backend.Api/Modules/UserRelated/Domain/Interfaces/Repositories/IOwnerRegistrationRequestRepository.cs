using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Backend.Api.Modules.UserRelated.Domain.Entities;
using Backend.Api.Modules.UserRelated.Domain.Enums;

namespace Backend.Api.Modules.UserRelated.Domain.Interfaces.Repositories
{
    public interface IOwnerRegistrationRequestRepository
    {
        /// <summary>
        /// Get owner registration request by ID
        /// </summary>
        Task<OwnerRegistrationRequest?> GetByIdAsync(Guid id);

        /// <summary>
        /// Get owner registration request by ID with User navigation property loaded
        /// </summary>
        Task<OwnerRegistrationRequest?> GetByIdWithUserAsync(Guid id);

        /// <summary>
        /// Get the most recent owner registration request for a user
        /// </summary>
        Task<OwnerRegistrationRequest?> GetLatestByUserIdAsync(Guid userId);

        /// <summary>
        /// Get pending owner registration request for a user (if any)
        /// </summary>
        Task<OwnerRegistrationRequest?> GetPendingByUserIdAsync(Guid userId);

        /// <summary>
        /// Check if user has any pending owner registration request
        /// </summary>
        Task<bool> HasPendingRequestAsync(Guid userId);

        /// <summary>
        /// Get all owner registration requests with optional filtering and pagination
        /// </summary>
        Task<(List<OwnerRegistrationRequest> requests, int totalCount)> GetPagedAsync(
            int pageNumber = 1,
            int pageSize = 10,
            OwnerRegistrationStatus? status = null,
            DateTime? fromDate = null,
            DateTime? toDate = null,
            string? searchTerm = null);

        /// <summary>
        /// Get all pending requests for admin review
        /// </summary>
        Task<List<OwnerRegistrationRequest>> GetPendingRequestsAsync();

        /// <summary>
        /// Add a new owner registration request
        /// </summary>
        Task AddAsync(OwnerRegistrationRequest request);

        /// <summary>
        /// Update an existing owner registration request
        /// </summary>
        void Update(OwnerRegistrationRequest request);

        /// <summary>
        /// Delete an owner registration request (soft delete if implemented)
        /// </summary>
        void Delete(OwnerRegistrationRequest request);
    }
}
