// File: Backend.Api/Modules/SpaceBooking/Application/Contracts/Dtos/BookingServiceDto.cs
using System;
using System.Collections.Generic;

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos
{
    public class BookingServiceDto
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public Guid PrivateServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public string? Unit { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AddServiceToBookingRequest
    {
        public Guid PrivateServiceId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class UpdateBookingServiceRequest
    {
        public int Quantity { get; set; }
    }

    public class BookingServicesUpdateRequest
    {
        public List<AddServiceToBookingRequest> Services { get; set; } = new List<AddServiceToBookingRequest>();
    }
}
