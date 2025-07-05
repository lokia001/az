// File: Backend.Api/Modules/SpaceBooking/Application/Contracts/Services/IBookingServiceService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Api.Modules.SpaceBooking.Application.Contracts.Dtos;

namespace Backend.Api.Modules.SpaceBooking.Application.Contracts.Services
{
    public interface IBookingServiceService
    {
        Task<IEnumerable<BookingServiceDto>> GetBookingServicesAsync(Guid bookingId, Guid requestorUserId);
        Task<BookingServiceDto> AddServiceToBookingAsync(Guid bookingId, AddServiceToBookingRequest request, Guid requestorUserId);
        Task<BookingServiceDto?> UpdateBookingServiceAsync(Guid bookingServiceId, UpdateBookingServiceRequest request, Guid requestorUserId);
        Task<bool> RemoveServiceFromBookingAsync(Guid bookingServiceId, Guid requestorUserId);
        Task UpdateBookingServicesAsync(Guid bookingId, BookingServicesUpdateRequest request, Guid requestorUserId);
        Task<decimal> CalculateBookingServicesAmountAsync(Guid bookingId);
        Task RecalculateBookingTotalPriceAsync(Guid bookingId);
    }
}
