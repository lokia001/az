// File: Backend.Api/Modules/SpaceBooking/Application/Contracts/Dtos/BookingDtos.cs
using System;
using System.ComponentModel.DataAnnotations;
using Backend.Api.Modules.SpaceBooking.Domain.Enums; // Cho BookingStatus

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos
{
    public class BookingDto
    {
        public Guid Id { get; set; }
        public Guid SpaceId { get; set; }
        public string SpaceName { get; set; } = string.Empty;
        public Guid? UserId { get; set; } // Make nullable for guest bookings
        public string? UserFullName { get; set; } // Full name of the user who made the booking
        // public string? BookerUsername { get; set; } // Giữ nguyên không có theo loose coupling
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public DateTime? ActualCheckIn { get; set; }
        public DateTime? ActualCheckOut { get; set; }
        public decimal TotalPrice { get; set; }
        public BookingStatus Status { get; set; }
        public int NumberOfPeople { get; set; }
        public string? BookingCode { get; set; }
        public string? NotesFromUser { get; set; }
        public string? NotesFromOwner { get; set; }
        public string? NotificationEmail { get; set; } // Email nhận thông báo cho booking này
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedByUserId { get; set; }
        public bool CanReview { get; set; } // << THÊM VÀO: Cho biết user có thể review booking này không
        
        // Guest booking fields
        public string? GuestName { get; set; }
        public string? GuestEmail { get; set; }
        public string? GuestPhone { get; set; }
        public bool IsGuestBooking { get; set; }

        public BookingDto() { } // Constructor không tham số
    }

    public record CreateBookingRequest(
        [Required] Guid SpaceId,
        // UserId sẽ được lấy từ user đang đăng nhập
        [Required] DateTime StartTime,
        [Required] DateTime EndTime,
        [Required][Range(1, 1000)] int NumberOfPeople,
        [StringLength(500)] string? NotesFromUser,
        [StringLength(255)] string? NotificationEmail // Email nhận thông báo (tùy chọn, validation sẽ được xử lý trong service)
    // TotalPrice sẽ được tính toán bởi service
    );

    public record UpdateBookingStatusRequest( // Dùng cho Owner/Admin cập nhật trạng thái
        [Required] BookingStatus NewStatus,
        string? Notes // Ghi chú cho việc thay đổi trạng thái (ví dụ: lý do hủy)
    );

    // DTO cho Owner tạo booking
    public record CreateOwnerBookingRequest(
        [Required] Guid SpaceId,
        [Required] DateTime StartTime,
        [Required] DateTime EndTime,
        [Required][Range(1, 1000)] int NumberOfPeople,
        [StringLength(500)] string? NotesFromUser,
        [StringLength(500)] string? NotesFromOwner,
        [StringLength(255)] string? NotificationEmail, // Email nhận thông báo (bắt buộc)
        
        // Guest info (nếu không phải user đã đăng ký)
        Guid? UserId, // null nếu là guest
        [StringLength(255)] string? GuestName, // Bắt buộc nếu UserId = null
        [StringLength(255)] string? GuestEmail, // Bắt buộc nếu UserId = null
        [StringLength(20)] string? GuestPhone,
        
        BookingStatus Status = BookingStatus.Confirmed // Owner có thể đặt status ngay, mặc định là Confirmed
    );

    // Các DTO khác cho việc check-in, check-out nếu cần truyền thêm dữ liệu
    public record CheckInRequest(string? NotesByStaff);
    public record CheckOutRequest(string? NotesByStaff, decimal? FinalPriceAdjustment); // Ví dụ
}