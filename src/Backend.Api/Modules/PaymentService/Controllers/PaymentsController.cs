using Microsoft.AspNetCore.Mvc;
using Backend.Api.Modules.PaymentService.Models;
using System;
using Backend.Api.Modules.PaymentService.Entities; // Add this import

namespace Backend.Api.Modules.PaymentService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetPayments(int count = 10)
    {

        return null;
    }
}

// using Backend.Api.Modules.PaymentService.Entities;
// using Backend.Api.Modules.PaymentService.Models;
// using Backend.Api.Modules.PaymentService.Services;
// using Microsoft.AspNetCore.Mvc;

// namespace Backend.Api.Modules.PaymentService.Controllers;

// [ApiController]
// [Route("api/[controller]")]
// public class PaymentsController : ControllerBase
// {
//     private readonly IPaymentService _paymentService;

//     public PaymentsController(IPaymentService paymentService)
//     {
//         _paymentService = paymentService;
//     }

//     [HttpGet("{id}")]
//     public async Task<ActionResult<PaymentDto>> GetPayment(Guid id)
//     {
//         var payment = await _paymentService.GetPaymentByIdAsync(id);

//         if (payment == null)
//         {
//             return NotFound();
//         }

//         // Map Payment to PaymentDto
//         var paymentDto = new PaymentDto
//         {
//             Id = payment.Id,
//             BookingId = payment.BookingId,
//             Amount = payment.Amount,
//             PaymentDate = payment.PaidAt,
//             PaymentMethod = payment.PaymentMethod,
//             Status = payment.PaymentStatus,
//         };

//         return paymentDto;
//     }

//     [HttpGet("booking/{bookingId}")]
//     public async Task<ActionResult<PaymentDto>> GetPaymentByBookingId(Guid bookingId)
//     {
//         var payment = await _paymentService.GetPaymentByBookingIdAsync(bookingId);

//         if (payment == null)
//         {
//             return NotFound();
//         }

//         // Map Payment to PaymentDto
//         var paymentDto = new PaymentDto
//         {
//             Id = payment.Id,
//             BookingId = payment.BookingId,
//             Amount = payment.Amount,
//             PaymentDate = payment.PaidAt,
//             PaymentMethod = payment.PaymentMethod,
//             Status = payment.PaymentStatus,
//         };

//         return paymentDto;
//     }


//     [HttpPost]
//     public async Task<ActionResult<PaymentDto>> CreatePayment(CreatePaymentRequest request)
//     {
//         var payment = new Payment
//         {
//             BookingId = request.BookingId,
//             Amount = request.Amount,
//             PaidAt = DateTime.UtcNow, // Or request.PaymentDate if provided
//             PaymentMethod = request.PaymentMethod
//         };

//         var createdPayment = await _paymentService.CreatePaymentAsync(payment);

//         if (createdPayment == null)
//         {
//             return BadRequest();
//         }

//         // Map Payment to PaymentDto
//         var paymentDto = new PaymentDto
//         {
//             Id = payment.Id,
//             BookingId = payment.BookingId,
//             Amount = payment.Amount,
//             PaymentDate = payment.PaidAt,
//             PaymentMethod = payment.PaymentMethod,
//             Status = payment.PaymentStatus,
//         };

//         return CreatedAtAction(nameof(GetPayment), new { id = paymentDto.Id }, paymentDto);
//     }

//     [HttpPut("{id}/status")]
//     public async Task<IActionResult> UpdatePaymentStatus(Guid id, [FromBody] PaymentStatus status)
//     {
//         var result = await _paymentService.UpdatePaymentStatusAsync(id, status);

//         if (!result)
//         {
//             return NotFound();
//         }

//         return NoContent();
//     }
// }