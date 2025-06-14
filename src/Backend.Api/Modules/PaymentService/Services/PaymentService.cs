using Backend.Api.Modules.PaymentService.Entities;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
namespace Backend.Api.Modules.PaymentService.Services;

public class PaymentService : IPaymentService
{
    private readonly AppDbContext _dbContext;

    public PaymentService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Payment?> GetPaymentByIdAsync(Guid id)
    {
        // return await _dbContext.Payments.FindAsync(id);
        return null;
    }

    public async Task<Payment?> GetPaymentByBookingIdAsync(Guid bookingId)
    {
        // return await _dbContext.Payments.FirstOrDefaultAsync(p => p.BookingId == bookingId);
        return null;
    }

    public async Task<Payment?> CreatePaymentAsync(Payment payment)
    {
        // _dbContext.Payments.Add(payment);
        await _dbContext.SaveChangesAsync();
        return payment;
    }

    public async Task<bool> UpdatePaymentStatusAsync(Guid id, PaymentStatus status)
    {
        // var payment = await _dbContext.Payments.FindAsync(id);
        // if (payment == null)
        // {
        //     return false;
        // }

        // payment.PaymentStatus = status;
        // _dbContext.Payments.Update(payment);
        await _dbContext.SaveChangesAsync();
        return true;
    }
}