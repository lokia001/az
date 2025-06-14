using Backend.Api.Modules.PaymentService.Entities;

namespace Backend.Api.Modules.PaymentService.Services;

public interface IPaymentService
{
    Task<Payment?> GetPaymentByIdAsync(Guid id);
    Task<Payment?> GetPaymentByBookingIdAsync(Guid bookingId);
    Task<Payment?> CreatePaymentAsync(Payment payment);
    Task<bool> UpdatePaymentStatusAsync(Guid id, PaymentStatus status);
}