// File: Backend.Api/Modules/SpaceBooking/Domain/Entities/SpaceCustomService.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Modules.SpaceBooking.Domain.Entities
{
    public class SpaceCustomService
    {
        public Guid Id { get; set; }

        [Required]
        public Guid SpaceId { get; set; }
        public Space Space { get; set; } = default!;

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")] // Giữ lại nếu dịch vụ tùy chỉnh có giá riêng
        public decimal? Price { get; set; }
        public bool IsDeleted { get; set; } = false;
        public string? Notes { get; set; }
        public bool IsIncludedInBasePrice { get; set; } = false; // Có bao gồm trong giá thuê Space không

        public SpaceCustomService()
        {
            Id = Guid.NewGuid();
        }
    }
}