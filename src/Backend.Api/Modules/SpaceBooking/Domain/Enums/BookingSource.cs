// File: Backend.Api/Modules/SpaceBooking/Domain/Enums/BookingStatus.cs
namespace Backend.Api.Modules.SpaceBooking.Domain.Enums
{
    public enum BookingSource
{
    MyPlatform, // Booking tạo trên hệ thống của bạn
    Airbnb,
    GoogleCalendar,
    OutlookCalendar,
    OtherIcal // Nguồn iCal chung chung khác
}

}