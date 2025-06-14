// Backend.Api/Services/Shared/IEmailService.cs (Hoặc vị trí phù hợp)
using System.Threading.Tasks;

namespace Backend.Api.Services.Shared
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string toEmail, string recipientName, string resetLink);
        // Các phương thức gửi email khác
    }
}