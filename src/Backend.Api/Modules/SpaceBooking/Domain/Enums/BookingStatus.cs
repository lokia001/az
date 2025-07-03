// File: Backend.Api/Modules/SpaceBooking/Domain/Enums/BookingStatus.cs
namespace Backend.Api.Modules.SpaceBooking.Domain.Enums
{
    public enum BookingStatus
    {
        Pending,            // Chờ xác nhận
        Confirmed,          // Đã xác nhận
        CheckedIn,          // Đã check-in
        Checkout,           // Đã checkout - chờ xử lý cuối cùng
        Completed,          // Đã hoàn thành (sau khi check-out)
        NoShow,             // Khách không đến
        Cancelled,          // Đã hủy
        Abandoned,          // Bắt đầu đặt nhưng không hoàn thành (ví dụ: thanh toán lỗi - hiện tại chưa có payment)
        External,           // Booking from external iCal source
        Conflict,           // Booking has a time conflict with another booking
        OverduePending,     // Pending quá hạn - booking hết hạn mà chưa được xác nhận
        OverdueCheckin,     // Confirmed quá hạn - đã xác nhận nhưng quá giờ check-in
        OverdueCheckout     // CheckedIn quá hạn - đã check-in nhưng quá giờ check-out
    }
}