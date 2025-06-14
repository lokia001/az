// File: Backend.Api/Modules/SpaceBooking/Domain/Entities/SystemSpaceService.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Modules.SpaceBooking.Domain.Entities
{
    public class SystemSpaceService
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        // Navigation property đến bảng join SpaceSystemSpaceService
        public ICollection<SpaceSystemSpaceService> SpaceLinks { get; private set; } = new List<SpaceSystemSpaceService>();

        public SystemSpaceService()
        {
            Id = Guid.NewGuid();
        }
    }
}