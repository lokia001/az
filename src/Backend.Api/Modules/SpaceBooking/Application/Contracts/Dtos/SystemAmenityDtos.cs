// File: Backend.Api/Modules/SpaceBooking/Application/Contracts/Dtos/SystemAmenityDtos.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos
{
    public record SystemAmenityDto(
        Guid Id,
        string Name,
        string? Description,
        string? IconUrl
    );

    public record CreateSystemAmenityRequest(
        [Required]
        [StringLength(100, MinimumLength = 2)]
        string Name,

        [StringLength(500)]
        string? Description,

        [StringLength(255)]
        [Url]
        string? IconUrl
    );

    public record UpdateSystemAmenityRequest(
        [Required]
        [StringLength(100, MinimumLength = 2)]
        string Name,

        [StringLength(500)]
        string? Description,

        [StringLength(255)]
        [Url]
        string? IconUrl
    );
}