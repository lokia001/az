// File: Backend.Api/Modules/SpaceBooking/Domain/Entities/SpaceSystemSpaceService.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Modules.SpaceBooking.Domain.Entities
{
    public class SpaceSystemSpaceService
    {
        [Required]
        public Guid SpaceId { get; set; }
        public Space Space { get; set; } = default!;

        [Required]
        public Guid SystemSpaceServiceId { get; set; }
        public SystemSpaceService SystemSpaceService { get; set; } = default!;

        // Các thuộc tính cho mối quan hệ này, tương tự như ServiceSpace cũ của bạn
        [Column(TypeName = "decimal(18,2)")]
        public decimal? PriceOverride { get; set; } // Giá cụ thể cho service hệ thống này tại space này

        public string? Notes { get; set; }
        public bool IsIncludedInBasePrice { get; set; } = false;
        // public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Có thể thêm nếu cần
    }
}