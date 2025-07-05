// File: Backend.Api/Modules/SpaceBooking/Domain/Entities/PrivateService.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Modules.SpaceBooking.Domain.Entities
{
    /// <summary>
    /// Private service that can be offered by space owners
    /// Each owner can create their own services with custom pricing
    /// </summary>
    [Table("PrivateServices")]
    public class PrivateService
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [StringLength(50)]
        public string? Unit { get; set; } = "item"; // e.g., "hour", "piece", "session"

        [Required]
        public Guid OwnerId { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public Guid CreatedByUserId { get; set; }
        public Guid? LastEditedByUserId { get; set; }

        // Navigation properties
        public virtual ICollection<BookingService> BookingServices { get; set; } = new List<BookingService>();
    }
}
