// File: Backend.Api/Modules/SpaceBooking/Application/Contracts/Services/IBookingService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos;
using Backend.Api.Modules.SpaceBooking.Domain.Enums;

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Services
{
    public interface IBookingService
    {
        Task<BookingDto> CreateBookingAsync(CreateBookingRequest request, Guid userId);
        Task<BookingDto> CreateOwnerBookingAsync(CreateOwnerBookingRequest request, Guid ownerUserId); // New method for owner booking creation
        Task<BookingDto?> GetBookingByIdAsync(Guid bookingId, Guid requestorUserId); // Đã có, nhưng GetMyBookingsAsync sẽ cụ thể hơn cho user hiện tại
        Task<IEnumerable<BookingDto>> GetMyBookingsAsync(Guid userId, BookingSearchParameters? parameters = null); // API mới cho user lấy booking của họ
        Task<IEnumerable<BookingDto>> GetBookingsForUserAsync(Guid userId); // Giữ lại nếu có mục đích khác, hoặc có thể thay thế bằng GetMyBookingsAsync
        Task<IEnumerable<BookingDto>> GetBookingsForSpaceAsync(Guid spaceId, Guid requestorUserId); // Đổi ownerId thành requestorUserId cho nhất quán
        Task<bool> CancelBookingAsync(Guid bookingId, Guid userId, string? cancellationReason = null);
        Task<BookingDto?> UpdateBookingStatusAsync(Guid bookingId, UpdateBookingStatusRequest request, Guid updaterUserId); // Truyền DTO thay vì từng tham số
        Task<BookingDto?> CheckInAsync(Guid bookingId, CheckInRequest request, Guid staffUserId); // Truyền DTO
        Task<BookingDto?> CheckOutAsync(Guid bookingId, CheckOutRequest request, Guid staffUserId); // Truyền DTO
        Task<BookingDto?> MarkAsNoShowAsync(Guid bookingId, Guid markerUserId);
        Task<bool> IsSpaceAvailableAsync(Guid spaceId, DateTime startTime, DateTime endTime, Guid? excludeBookingId = null); // Bỏ comment
    }
}