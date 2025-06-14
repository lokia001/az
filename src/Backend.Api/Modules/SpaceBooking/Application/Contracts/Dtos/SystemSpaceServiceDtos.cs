// File: Backend.Api/Modules/SpaceBooking/Application/Contracts/Dtos/SystemSpaceServiceDtos.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos
{
    public record SystemSpaceServiceDto(
        Guid Id,
        string Name,
        string? Description
    );

    public record CreateSystemSpaceServiceRequest(
        [Required]
        [StringLength(100, MinimumLength = 2)]
        string Name,

        [StringLength(500)]
        string? Description
    );

    public record UpdateSystemSpaceServiceRequest(
        [Required]
        [StringLength(100, MinimumLength = 2)]
        string Name,

        [StringLength(500)]
        string? Description
    );
}