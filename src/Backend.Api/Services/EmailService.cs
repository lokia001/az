// Backend.Api/Services/Shared/EmailService.cs
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration; // Cho IConfiguration
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security; // Cho SecureSocketOptions
using MimeKit;
using MimeKit.Text; // Cho TextFormat
using System; // Cho ArgumentNullException

namespace Backend.Api.Services.Shared
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;
        private readonly IConfiguration _configuration;
        private readonly string _smtpPassword; // Biến để lưu mật khẩu từ biến môi trường

        public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));

            // Lấy mật khẩu từ biến môi trường
            _smtpPassword = _configuration["SmtpSettings:Password"]; // << SỬA Ở ĐÂY
            // _smtpPassword = Environment.GetEnvironmentVariable("SMTP_PASSWORD_HAHUU3675");
            if (string.IsNullOrEmpty(_smtpPassword))
            {
                _logger.LogError("SMTP_PASSWORD_HAHUU3675 environment variable is not set.");
                // Quyết định cách xử lý: throw exception, hoặc để app chạy nhưng không gửi được mail
                // throw new InvalidOperationException("SMTP password environment variable is not configured.");
            }
            else
            {
                _logger.LogInformation("SMTP_PASSWORD_HAHUU3675 environment variable was loaded (length: {Length}). First few chars: {Start}", _smtpPassword.Length, _smtpPassword.Substring(0, Math.Min(_smtpPassword.Length, 3)) + "..."); // Log một phần để xác nhận nó có giá trị
            }
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string recipientName, string resetLink)
        {
            var smtpSettings = _configuration.GetSection("SmtpSettings");
            var smtpHost = smtpSettings["Host"];
            var smtpPort = int.Parse(smtpSettings["Port"] ?? "587"); // Mặc định port 587
            var smtpUsername = smtpSettings["Username"]; // Username từ config (hahuu3675@gmail.com)
            var senderName = smtpSettings["SenderName"] ?? "WorkingAdmin";

            _logger.LogInformation("==>> SMTP Config - Host: {SmtpHost}, Port: {SmtpPort}, Username: {SmtpUsername}, SenderName: {SenderName}", smtpHost, smtpPort, smtpUsername, senderName);

            if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUsername) || string.IsNullOrEmpty(_smtpPassword))
            {
                _logger.LogError("SMTP settings (Host, Username, or Password from Env) are not fully configured. Cannot send email.");
                // Không throw lỗi ở đây để không làm sập flow forgot password, nhưng email sẽ không được gửi.
                // Người dùng vẫn nhận được thông báo "Nếu email tồn tại..."
                return;
            }

            try
            {
                var emailMessage = new MimeMessage();
                emailMessage.From.Add(new MailboxAddress(senderName, smtpUsername));
                emailMessage.To.Add(new MailboxAddress(recipientName, toEmail));
                emailMessage.Subject = "Password Reset Request";

                // Tạo nội dung email HTML
                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = $@"
                        <p>Hello {recipientName},</p>
                        <p>We received a request to reset your password for your account with Your Application Name. If you did not make this request, please ignore this email.</p>
                        <p>To reset your password, please click on the link below (or copy and paste it into your browser):</p>
                        <p><a href=""{resetLink}"" style=""display: inline-block; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px;"">Reset Your Password</a></p>
                        <p>This link is valid for a limited time (e.g., 30 minutes).</p>
                        <p>If you’re having trouble clicking the password reset button, copy and paste the URL below into your web browser:<br>{resetLink}</p>
                        <p>Thanks,<br/>The Your Application Name Team</p>"
                };
                emailMessage.Body = bodyBuilder.ToMessageBody();

                using (var client = new SmtpClient())
                {
                    // Đối với Gmail, thường dùng StartTls trên port 587
                    // Hoặc SslOnConnect trên port 465
                    await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls); // Hoặc SecureSocketOptions.Auto nếu server hỗ trợ
                    _logger.LogInformation("Connected to SMTP server: {SmtpHost}:{SmtpPort}", smtpHost, smtpPort);

                    // Sử dụng username từ config và password từ biến môi trường
                    await client.AuthenticateAsync(smtpUsername, _smtpPassword);
                    _logger.LogInformation("Authenticated with SMTP server using username: {SmtpUsername}", smtpUsername);

                    await client.SendAsync(emailMessage);
                    _logger.LogInformation("Password reset email successfully sent to {ToEmail}", toEmail);

                    await client.DisconnectAsync(true);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset email to {ToEmail}. SMTP Host: {SmtpHost}, Port: {SmtpPort}, Username: {SmtpUsername}",
                                 toEmail, smtpHost, smtpPort, smtpUsername);
                // Không throw lỗi ra ngoài để flow "Forgot Password" vẫn trả về thông báo chung cho người dùng.
                // Lỗi gửi email sẽ được ghi lại để admin kiểm tra.
            }
        }
    }
}