// File: Backend.Api/Modules/SpaceBooking/Domain/Entities/SpaceSystemAmenity.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Modules.SpaceBooking.Domain.Entities
{
    public class SpaceSystemAmenity
    {
        // Khóa chính kết hợp sẽ được định nghĩa trong Fluent API
        [Required]
        public Guid SpaceId { get; set; }
        public Space Space { get; set; } = default!;

        [Required]
        public Guid SystemAmenityId { get; set; }
        public SystemAmenity SystemAmenity { get; set; } = default!;

        // Có thể thêm các thuộc tính cho mối quan hệ này nếu cần, ví dụ:
        // public string? Notes { get; set; } // Ghi chú cụ thể về tiện ích này tại Space này
    }
}