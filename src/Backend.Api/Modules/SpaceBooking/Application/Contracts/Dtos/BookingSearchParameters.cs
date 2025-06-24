using Backend.Api.Modules.SpaceBooking.Domain.Enums; // Assuming BookingStatus is here
using System;

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos
{
    public class BookingSearchParameters
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "StartTime"; // Default sort
        public string? SortOrder { get; set; } = "desc"; // Default order
        public BookingStatus? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}