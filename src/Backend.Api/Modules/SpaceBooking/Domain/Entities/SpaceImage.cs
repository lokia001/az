// File: Backend.Api/Modules/SpaceBooking/Domain/Entities/SpaceImage.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Modules.SpaceBooking.Domain.Entities
{
    public class SpaceImage
    {
        public Guid Id { get; set; }

        [Required]
        public Guid SpaceId { get; set; } // Khóa ngoại đến Space
        public Space Space { get; set; } = default!; // Navigation property đến Space

        [Required]
        [Url] // Thêm validation cho URL
        [MaxLength(2048)] // Giới hạn độ dài URL
        public string ImageUrl { get; set; } = string.Empty;
        
        [MaxLength(255)] // Cloudinary public_id for deletion
        public string? CloudinaryPublicId { get; set; }
        
        public bool IsDeleted { get; set; } = false;
        [MaxLength(255)]
        public string? Caption { get; set; } // Chú thích cho ảnh (tùy chọn)

        public bool IsCoverImage { get; set; } = false; // Đánh dấu ảnh bìa
        public int DisplayOrder { get; set; } = 0; // Thứ tự hiển thị

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public SpaceImage()
        {
            Id = Guid.NewGuid();
        }
    }
}