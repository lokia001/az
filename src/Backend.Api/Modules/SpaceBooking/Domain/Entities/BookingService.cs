// File: Backend.Api/Modules/SpaceBooking/Domain/Entities/BookingService.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Modules.SpaceBooking.Domain.Entities
{
    /// <summary>
    /// Junction table between Booking and PrivateService
    /// Stores the quantity and price snapshot for each service in a booking
    /// </summary>
    [Table("BookingServices")]
    public class BookingService
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid BookingId { get; set; }

        [Required]
        public Guid PrivateServiceId { get; set; }

        [Required]
        public int Quantity { get; set; } = 1;

        /// <summary>
        /// Snapshot of unit price at the time of booking
        /// This preserves pricing even if the service price changes later
        /// </summary>
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        /// <summary>
        /// Calculated total: Quantity * UnitPrice
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        /// <summary>
        /// Snapshot of service name at time of booking
        /// </summary>
        [StringLength(200)]
        public string ServiceName { get; set; } = string.Empty;

        /// <summary>
        /// Snapshot of unit type at time of booking
        /// </summary>
        [StringLength(50)]
        public string? Unit { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public Guid CreatedByUserId { get; set; }

        // Navigation properties
        public virtual Booking? Booking { get; set; }
        public virtual PrivateService? PrivateService { get; set; }
    }
}
