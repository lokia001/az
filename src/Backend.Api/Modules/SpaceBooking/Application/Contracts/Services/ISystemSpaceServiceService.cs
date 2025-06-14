// File: Backend.Api/Modules/SpaceBooking/Application/Contracts/Services/ISystemSpaceServiceService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos;

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Services
{
    public interface ISystemSpaceServiceService
    {
        Task<IEnumerable<SystemSpaceServiceDto>> GetAllAsync();
        Task<SystemSpaceServiceDto?> GetByIdAsync(Guid id);
        Task<SystemSpaceServiceDto> CreateAsync(CreateSystemSpaceServiceRequest request); // Giữ nguyên
        Task<SystemSpaceServiceDto?> UpdateAsync(Guid id, UpdateSystemSpaceServiceRequest request); // Giữ nguyên
        Task<bool> DeleteAsync(Guid id);
    }
}