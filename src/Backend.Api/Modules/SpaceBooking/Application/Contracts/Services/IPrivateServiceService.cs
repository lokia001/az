// File: Backend.Api/Modules/SpaceBooking/Application/Contracts/Services/IPrivateServiceService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos;

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Services
{
    public interface IPrivateServiceService
    {
        Task<PrivateServiceDto> CreatePrivateServiceAsync(CreatePrivateServiceRequest request, Guid ownerId);
        Task<PrivateServiceDto?> GetPrivateServiceByIdAsync(Guid id, Guid ownerId);
        Task<IEnumerable<PrivateServiceDto>> GetPrivateServicesByOwnerAsync(Guid ownerId);
        Task<IEnumerable<PrivateServiceDto>> GetActivePrivateServicesByOwnerAsync(Guid ownerId);
        Task<PrivateServiceDto?> UpdatePrivateServiceAsync(Guid id, UpdatePrivateServiceRequest request, Guid ownerId);
        Task<bool> DeletePrivateServiceAsync(Guid id, Guid ownerId);
        Task<bool> TogglePrivateServiceStatusAsync(Guid id, Guid ownerId);
    }
}
