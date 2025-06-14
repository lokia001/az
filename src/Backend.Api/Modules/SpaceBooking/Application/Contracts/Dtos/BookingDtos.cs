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
        public Guid UserId { get; set; }
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
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedByUserId { get; set; }
        public bool CanReview { get; set; } // << THÊM VÀO: Cho biết user có thể review booking này không

        public BookingDto() { } // Constructor không tham số
    }

    public record CreateBookingRequest(
        [Required] Guid SpaceId,
        // UserId sẽ được lấy từ user đang đăng nhập
        [Required] DateTime StartTime,
        [Required] DateTime EndTime,
        [Required][Range(1, 1000)] int NumberOfPeople,
        [StringLength(500)] string? NotesFromUser
    // TotalPrice sẽ được tính toán bởi service
    );

    public record UpdateBookingStatusRequest( // Dùng cho Owner/Admin cập nhật trạng thái
        [Required] BookingStatus NewStatus,
        string? Notes // Ghi chú cho việc thay đổi trạng thái (ví dụ: lý do hủy)
    );

    // Các DTO khác cho việc check-in, check-out nếu cần truyền thêm dữ liệu
    public record CheckInRequest(string? NotesByStaff);
    public record CheckOutRequest(string? NotesByStaff, decimal? FinalPriceAdjustment); // Ví dụ
}