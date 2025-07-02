// Backend.Api/Services/Shared/IEmailService.cs (Hoặc vị trí phù hợp)
using System.Threading.Tasks;

namespace Backend.Api.Services.Shared
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string toEmail, string recipientName, string resetLink);
        Task SendBookingConfirmationEmailAsync(string toEmail, string customerName, string spaceName, 
            string startTime, string endTime, string checkInTime, string ownerEmail, string bookingCode);
        // Các phương thức gửi email khác
    }
}