// File: Backend.Api/Modules/SpaceBooking/Domain/Entities/Space.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // Sẽ dùng cho Fluent API thay vì Data Annotations nhiều
using Backend.Api.Modules.SpaceBooking.Domain.Enums;

namespace Backend.Api.Modules.SpaceBooking.Domain.Entities
{
    public class Space
    {
        public Guid Id { get; set; }

        [Required] // Vẫn có thể dùng vài Data Annotation cơ bản
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }
        public string Address { get; set; } = string.Empty; // Địa chỉ đơn giản, có thể là required

        public decimal? Latitude { get; set; } // Để nullable nếu không phải lúc nào cũng có
        public decimal? Longitude { get; set; } // Để nullable

        public SpaceType Type { get; set; }
        public SpaceStatus Status { get; set; } // OperationalStatus
        public int Capacity { get; set; }

        // Pricing
        public decimal PricePerHour { get; set; }
        public decimal? PricePerDay { get; set; }

        // Time & Booking Constraints
        public TimeSpan? OpenTime { get; set; } // Giờ mở cửa
        public TimeSpan? CloseTime { get; set; } // Giờ đóng cửa
        public int MinBookingDurationMinutes { get; set; } = 30;
        public int MaxBookingDurationMinutes { get; set; } = 8 * 60; // Ví dụ: max 8 tiếng
        public int CancellationNoticeHours { get; set; } = 24; // Báo trước bao nhiêu tiếng để hủy
        public int CleaningDurationMinutes { get; set; } = 0; // Thời gian dọn dẹp sau mỗi lượt đặt
        public int BufferMinutes { get; set; } = 0; // Thời gian nghỉ giữa các lượt đặt (sau dọn dẹp)

        // Additional Information
        public string? AccessInstructions { get; set; } // Hướng dẫn vào không gian
        public string? HouseRules { get; set; } // Nội quy
        public string? Slug { get; set; } // Cho URL thân thiện, cần unique

        // Foreign Keys & Audit
        [Required]
        public Guid OwnerId { get; set; } // ID của User (Owner) từ module UserRelated

        public Guid CreatedByUserId { get; set; } // ID của User đã tạo Space
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid? LastEditedByUserId { get; set; } // ID của User sửa cuối cùng
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
        // Navigation Properties (Nội bộ module SpaceBooking)
        public ICollection<SpaceImage> SpaceImages { get; private set; } = new List<SpaceImage>();
        public ICollection<Booking> Bookings { get; private set; } = new List<Booking>();

        // Liên kết đến System Amenities/Services (Many-to-Many)
        public ICollection<SpaceSystemAmenity> SystemAmenitiesLink { get; private set; } = new List<SpaceSystemAmenity>();
        public ICollection<SpaceSystemSpaceService> SystemServicesLink { get; private set; } = new List<SpaceSystemSpaceService>();

        // Custom Amenities/Services (One-to-Many)
        public ICollection<SpaceCustomAmenity> CustomAmenities { get; private set; } = new List<SpaceCustomAmenity>();
        public ICollection<SpaceCustomService> CustomServices { get; private set; } = new List<SpaceCustomService>();

        // iCal Settings
        public SpaceIcalSetting? IcalSettings { get; set; }

        // Constructor (nếu cần)
        public Space()
        {
            Id = Guid.NewGuid(); // Hoặc để DB tự sinh nếu dùng int ID
        }

        // Domain Methods (ví dụ)
        public void UpdateDetails(string name, string description, string address /*... các tham số khác ...*/, Guid editorUserId)
        {
            Name = name;
            Description = description;
            Address = address;
            // ... cập nhật các thuộc tính khác ...
            LastEditedByUserId = editorUserId;
            UpdatedAt = DateTime.UtcNow;
        }

        public void AddImage(SpaceImage image)
        {
            SpaceImages.Add(image);
            UpdatedAt = DateTime.UtcNow;
        }

        // Các method khác để quản lý amenities, services, status...
    }
}