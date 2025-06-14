// File: Backend.Api/Modules/SpaceBooking/Domain/Entities/SystemAmenity.cs
using System;
using System.Collections.Generic; // Cho ICollection
using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Modules.SpaceBooking.Domain.Entities
{
    public class SystemAmenity
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)] // Giới hạn độ dài tên
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(255)]
        public string? IconUrl { get; set; } // Tùy chọn: icon cho tiện ích

        // Navigation property đến bảng join SpaceSystemAmenity
        public ICollection<SpaceSystemAmenity> SpaceLinks { get; private set; } = new List<SpaceSystemAmenity>();

        public SystemAmenity()
        {
            Id = Guid.NewGuid();
        }
    }
}