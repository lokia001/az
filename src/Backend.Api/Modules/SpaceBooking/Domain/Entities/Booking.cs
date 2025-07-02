// File: Backend.Api/Modules/SpaceBooking/Domain/Entities/Booking.cs
using System;
using System.ComponentModel.DataAnnotations; // Sẽ dùng ít lại, ưu tiên Fluent API
using System.ComponentModel.DataAnnotations.Schema;
using Backend.Api.Modules.SpaceBooking.Domain.Enums;

namespace Backend.Api.Modules.SpaceBooking.Domain.Entities
{
    public class Booking
    {
        public Guid Id { get; set; }

        // Khóa ngoại đến Space (cùng module)
        [Required]
        public Guid SpaceId { get; set; }
        public Space Space { get; set; } = default!; // Navigation property

        // Khóa ngoại đến User (từ module UserRelated) - người đặt
        // Có thể null cho guest bookings
        public Guid? UserId { get; set; }
        
        // Thông tin guest (nếu UserId = null)
        [MaxLength(255)]
        public string? GuestName { get; set; }
        
        [MaxLength(255)]
        public string? GuestEmail { get; set; }
        
        [MaxLength(20)]
        public string? GuestPhone { get; set; }
        
        public bool IsGuestBooking { get; set; } = false;
        // KHÔNG có navigation property trực tiếp đến User entity

        [Required]
        public DateTime StartTime { get; set; } // Đổi tên từ StartDateTime

        [Required]
        public DateTime EndTime { get; set; } // Đổi tên từ EndDateTime

        public DateTime? ActualCheckIn { get; set; }
        public DateTime? ActualCheckOut { get; set; }
        public Guid? CheckedInByUserId { get; set; } // Người thực hiện check-in
        public Guid? CheckedOutByUserId { get; set; } // Người thực hiện check-out
        public int? ActualNumberOfPeople { get; set; } // Số người thực tế khi check-in

        public bool IsDeleted { get; set; } = false;
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; } // Sẽ được tính toán và lưu khi tạo/xác nhận

        public BookingStatus Status { get; set; } = BookingStatus.Pending;

        [Range(1, 1000)] // Giới hạn số người hợp lý
        public int NumberOfPeople { get; set; } // Đổi tên từ NumPeople

        [MaxLength(20)]
        public string? BookingCode { get; set; } // Cần unique constraint

        [MaxLength(500)]
        public string? NotesFromUser { get; set; } // Đổi tên từ Note

        [MaxLength(500)]
        public string? NotesFromOwner { get; set; } // Ghi chú từ chủ không gian (nếu có)

        [MaxLength(500)]
        public string? CancellationReason { get; set; } // Lý do hủy (nếu có)

        [MaxLength(500)]
        public string? Notes { get; set; } // Ghi chú chung

        [MaxLength(255)]
        [EmailAddress]
        public string? NotificationEmail { get; set; } // Email nhận thông báo cho booking này

        // Audit fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid? CreatedByUserId { get; set; } // Ai đã tạo booking (thường là UserId ở trên)

        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedByUserId { get; set; } // Ai đã cập nhật booking

        // External iCal integration fields
        [MaxLength(1000)]
        public string? ExternalCalendarEventId { get; set; }

        [MaxLength(1000)]
        public string? ExternalCalendarEventUrl { get; set; }

        [MaxLength(1000)]
        public string? ExternalIcalUrl { get; set; }

        [MaxLength(1000)]
        public string? ExternalIcalUid { get; set; }

        public bool IsExternalBooking { get; set; }

        public DateTime? LastSyncedAt { get; set; } // Thời điểm cuối cùng đồng bộ với lịch bên ngoài
    }
}