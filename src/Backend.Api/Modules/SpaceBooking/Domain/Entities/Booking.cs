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
        [Required]
        public Guid UserId { get; set; }
        // KHÔNG có navigation property trực tiếp đến User entity

        [Required]
        public DateTime StartTime { get; set; } // Đổi tên từ StartDateTime

        [Required]
        public DateTime EndTime { get; set; } // Đổi tên từ EndDateTime

        public DateTime? ActualCheckIn { get; set; }
        public DateTime? ActualCheckOut { get; set; }
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


        // Audit fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid? CreatedByUserId { get; set; } // Ai đã tạo booking (thường là UserId ở trên)

        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedByUserId { get; set; } // Ai đã cập nhật booking

        public Booking()
        {
            Id = Guid.NewGuid();
            // CreatedByUserId sẽ được gán trong service khi tạo booking, thường là UserId của người đặt.
        }

        // --- Domain Methods ---
        public void Confirm(Guid confirmerUserId)
        {
            if (Status == BookingStatus.Pending)
            {
                Status = BookingStatus.Confirmed;
                UpdatedAt = DateTime.UtcNow;
                UpdatedByUserId = confirmerUserId;
            }
            else
            {
                // throw new InvalidOperationException("Only pending bookings can be confirmed.");
            }
        }

        public void Cancel(Guid cancellerUserId, string? cancellationReason = null) // Thêm lý do hủy nếu cần
        {
            // Thêm logic kiểm tra chính sách hủy (ví dụ: dựa trên Space.CancellationNoticeHours)
            // if (DateTime.UtcNow > StartTime.AddHours(-Space.CancellationNoticeHours))
            // {
            //     throw new InvalidOperationException("Cannot cancel booking due to cancellation policy.");
            // }

            if (Status == BookingStatus.Pending || Status == BookingStatus.Confirmed)
            {
                Status = BookingStatus.Cancelled;
                UpdatedAt = DateTime.UtcNow;
                UpdatedByUserId = cancellerUserId;
                // Lưu trữ cancellationReason nếu có trường riêng
            }
            else
            {
                // throw new InvalidOperationException($"Cannot cancel booking with status {Status}.");
            }
        }

        public void CheckIn(Guid staffUserId) // staffUserId là người thực hiện check-in (có thể là owner hoặc nhân viên)
        {
            if (Status == BookingStatus.Confirmed)
            {
                Status = BookingStatus.CheckedIn;
                ActualCheckIn = DateTime.UtcNow;
                UpdatedAt = DateTime.UtcNow;
                UpdatedByUserId = staffUserId;
            }
            // else throw error
        }

        public void CheckOut(Guid staffUserId)
        {
            if (Status == BookingStatus.CheckedIn)
            {
                Status = BookingStatus.Completed;
                ActualCheckOut = DateTime.UtcNow;
                UpdatedAt = DateTime.UtcNow;
                UpdatedByUserId = staffUserId;
                // Có thể tính toán lại TotalPrice ở đây nếu giá phụ thuộc vào thời gian sử dụng thực tế
            }
            // else throw error
        }

        public void MarkAsNoShow(Guid markerUserId)
        {
            if (Status == BookingStatus.Confirmed || Status == BookingStatus.Overdue) // Hoặc chỉ Confirmed
            {
                Status = BookingStatus.NoShow;
                UpdatedAt = DateTime.UtcNow;
                UpdatedByUserId = markerUserId;
            }
            // else throw error
        }

        // Các domain methods khác nếu cần...
    }
}