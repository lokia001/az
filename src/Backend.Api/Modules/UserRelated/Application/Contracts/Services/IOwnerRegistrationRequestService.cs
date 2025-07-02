using System;
using System.Threading.Tasks;
using Backend.Api.Modules.UserRelated.Application.Contracts.Dtos;

namespace Backend.Api.Modules.UserRelated.Application.Contracts.Services
{
    public interface IOwnerRegistrationRequestService
    {
        /// <summary>
        /// Submit a new owner registration request
        /// </summary>
        Task<OwnerRegistrationRequestDto> SubmitRegistrationRequestAsync(Guid userId, CreateOwnerRegistrationRequest request);

        /// <summary>
        /// Cancel a pending registration request
        /// </summary>
        Task CancelRegistrationRequestAsync(Guid requestId, Guid userId);

        /// <summary>
        /// Get user's current registration request (if any)
        /// </summary>
        Task<OwnerRegistrationRequestDto?> GetUserRegistrationRequestAsync(Guid userId);

        /// <summary>
        /// Get registration request by ID (for admin)
        /// </summary>
        Task<OwnerRegistrationRequestDto?> GetRegistrationRequestByIdAsync(Guid requestId);

        /// <summary>
        /// Get paginated list of registration requests (for admin)
        /// </summary>
        Task<PagedOwnerRegistrationRequestDto> GetRegistrationRequestsAsync(
            int pageNumber = 1,
            int pageSize = 10,
            string? status = null,
            DateTime? fromDate = null,
            DateTime? toDate = null,
            string? searchTerm = null);

        /// <summary>
        /// Get pending registration requests count (for admin dashboard)
        /// </summary>
        Task<int> GetPendingRequestsCountAsync();

        /// <summary>
        /// Process a registration request (approve or reject)
        /// </summary>
        Task ProcessRegistrationRequestAsync(Guid requestId, Guid adminUserId, ProcessOwnerRegistrationRequest request);
    }
}
