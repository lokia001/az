using System.ComponentModel.DataAnnotations;
using Backend.Api.Modules.PaymentService.Entities;

namespace Backend.Api.Modules.PaymentService.Models;

public class CreatePaymentRequest
{
    [Required]
    public Guid BookingId { get; set; }
    [Required]
    public decimal Amount { get; set; }
    [Required]
    public PaymentMethod PaymentMethod { get; set; }
}