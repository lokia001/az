// File: Backend.Api/Modules/SpaceBooking/Domain/Enums/BookingStatus.cs
namespace Backend.Api.Modules.SpaceBooking.Domain.Enums
{
    public enum BookingStatus
    {
        Pending,    // Chờ xác nhận
        Confirmed,  // Đã xác nhận
        CheckedIn,  // Đã check-in
        Completed,  // Đã hoàn thành (sau khi check-out)
        Overdue,    // Quá hạn (thời gian kết thúc đã qua nhưng chưa có trạng thái cuối cùng)
        NoShow,     // Khách không đến
        Cancelled,  // Đã hủy
        Abandoned,  // Bắt đầu đặt nhưng không hoàn thành (ví dụ: thanh toán lỗi - hiện tại chưa có payment)
        External,   // Booking from external iCal source
        Conflict    // Booking has a time conflict with another booking
    }
}