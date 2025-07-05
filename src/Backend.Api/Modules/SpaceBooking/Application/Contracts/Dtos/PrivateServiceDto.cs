// File: Backend.Api/Modules/SpaceBooking/Application/Contracts/Dtos/PrivateServiceDto.cs
using System;

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos
{
    public class PrivateServiceDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal UnitPrice { get; set; }
        public string? Unit { get; set; }
        public Guid OwnerId { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreatePrivateServiceRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal UnitPrice { get; set; }
        public string? Unit { get; set; } = "item";
        public bool IsActive { get; set; } = true;
    }

    public class UpdatePrivateServiceRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal UnitPrice { get; set; }
        public string? Unit { get; set; }
        public bool IsActive { get; set; }
    }
}
