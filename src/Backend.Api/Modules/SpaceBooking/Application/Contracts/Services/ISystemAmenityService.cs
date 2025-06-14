// File: Backend.Api/Modules/SpaceBooking/Application/Contracts/Services/ISystemAmenityService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos;

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Services
{
    public interface ISystemAmenityService
    {
        Task<IEnumerable<SystemAmenityDto>> GetAllAsync();
        Task<SystemAmenityDto?> GetByIdAsync(Guid id);
        Task<SystemAmenityDto> CreateAsync(CreateSystemAmenityRequest request); // Giữ nguyên, trả về DTO
        Task<SystemAmenityDto?> UpdateAsync(Guid id, UpdateSystemAmenityRequest request); // Giữ nguyên, trả về DTO?
        Task<bool> DeleteAsync(Guid id);
    }
}