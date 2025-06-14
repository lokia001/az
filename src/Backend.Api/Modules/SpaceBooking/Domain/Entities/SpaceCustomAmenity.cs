// File: Backend.Api/Modules/SpaceBooking/Domain/Entities/SpaceCustomAmenity.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; // Cho ForeignKey

namespace Backend.Api.Modules.SpaceBooking.Domain.Entities
{
    public class SpaceCustomAmenity
    {
        public Guid Id { get; set; }

        [Required]
        public Guid SpaceId { get; set; } // Khóa ngoại đến Space
        public Space Space { get; set; } = default!; // Navigation property đến Space
        public bool IsDeleted { get; set; } = false;
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty; // Tên tiện ích tùy chỉnh
        // Không cần Description ở đây, nếu cần thì Owner tự mô tả trong Space.Description
        // hoặc thêm trường Description cho SpaceCustomAmenity nếu muốn.

        public SpaceCustomAmenity()
        {
            Id = Guid.NewGuid();
        }
    }
}