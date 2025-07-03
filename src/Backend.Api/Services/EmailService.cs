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

        public async Task SendBookingConfirmationEmailAsync(string toEmail, string customerName, string spaceName, 
            string startTime, string endTime, string checkInTime, string ownerEmail, string bookingCode)
        {
            var smtpSettings = _configuration.GetSection("SmtpSettings");
            var smtpHost = smtpSettings["Host"];
            var smtpPort = int.Parse(smtpSettings["Port"] ?? "587");
            var smtpUsername = smtpSettings["Username"];
            var senderName = smtpSettings["SenderName"] ?? "Working Space Booking";

            _logger.LogInformation("Sending booking confirmation email to {ToEmail} for booking {BookingCode}", toEmail, bookingCode);

            if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUsername) || string.IsNullOrEmpty(_smtpPassword))
            {
                _logger.LogError("SMTP settings are not fully configured. Cannot send booking confirmation email.");
                return;
            }

            try
            {
                var emailMessage = new MimeMessage();
                emailMessage.From.Add(new MailboxAddress(senderName, smtpUsername));
                emailMessage.To.Add(new MailboxAddress(customerName, toEmail));
                emailMessage.Subject = $"Xác nhận đặt chỗ - {bookingCode}";

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = $@"
                        <div style=""font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"">
                            <h2 style=""color: #28a745;"">🎉 Booking của bạn đã được xác nhận!</h2>
                            
                            <p>Xin chào <strong>{customerName}</strong>,</p>
                            
                            <p>Chúng tôi vui mừng thông báo rằng booking của bạn đã được chủ không gian xác nhận.</p>
                            
                            <div style=""background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;"">
                                <h3 style=""margin-top: 0; color: #495057;"">📋 Thông tin booking</h3>
                                <p><strong>Mã booking:</strong> {bookingCode}</p>
                                <p><strong>Không gian:</strong> {spaceName}</p>
                                <p><strong>Thời gian:</strong> {startTime} - {endTime}</p>
                                <p><strong>⏰ Giờ check-in:</strong> <span style=""color: #dc3545; font-weight: bold;"">{checkInTime}</span></p>
                            </div>
                            
                            <div style=""background-color: #e7f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;"">
                                <h4 style=""margin-top: 0; color: #007bff;"">📞 Liên hệ hỗ trợ</h4>
                                <p>Nếu bạn có thắc mắc hoặc cần hỗ trợ, vui lòng liên hệ trực tiếp với chủ không gian:</p>
                                <p><strong>Email:</strong> <a href=""mailto:{ownerEmail}"">{ownerEmail}</a></p>
                            </div>
                            
                            <div style=""margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;"">
                                <p style=""color: #6c757d; font-size: 14px;"">
                                    📌 <strong>Lưu ý:</strong> Vui lòng đến đúng giờ check-in và mang theo giấy tờ tùy thân nếu cần thiết.
                                </p>
                                <p style=""color: #6c757d; font-size: 14px;"">
                                    Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
                                </p>
                            </div>
                        </div>"
                };
                emailMessage.Body = bodyBuilder.ToMessageBody();

                using (var client = new SmtpClient())
                {
                    await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
                    await client.AuthenticateAsync(smtpUsername, _smtpPassword);
                    await client.SendAsync(emailMessage);
                    await client.DisconnectAsync(true);
                    
                    _logger.LogInformation("Booking confirmation email successfully sent to {ToEmail} for booking {BookingCode}", toEmail, bookingCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send booking confirmation email to {ToEmail} for booking {BookingCode}", toEmail, bookingCode);
            }
        }
        
        public async Task SendBookingCancellationEmailAsync(string toEmail, string customerName, string spaceName,
            string startTime, string endTime, string cancellationReason, string ownerEmail, string bookingCode, string? timeline = null)
        {
            var smtpSettings = _configuration.GetSection("SmtpSettings");
            var smtpHost = smtpSettings["Host"];
            var smtpPort = int.Parse(smtpSettings["Port"] ?? "587");
            var smtpUsername = smtpSettings["Username"];
            var senderName = smtpSettings["SenderName"] ?? "Working Space Booking";

            _logger.LogInformation("Sending booking cancellation email to {ToEmail} for booking {BookingCode}", toEmail, bookingCode);

            if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUsername) || string.IsNullOrEmpty(_smtpPassword))
            {
                _logger.LogError("SMTP settings are not fully configured. Cannot send booking cancellation email.");
                return;
            }

            try
            {
                var emailMessage = new MimeMessage();
                emailMessage.From.Add(new MailboxAddress(senderName, smtpUsername));
                emailMessage.To.Add(new MailboxAddress(customerName, toEmail));
                emailMessage.Subject = $"Thông báo hủy booking - {bookingCode}";

                // Create timeline HTML if provided
                var timelineHtml = "";
                if (!string.IsNullOrEmpty(timeline))
                {
                    timelineHtml = $@"
                        <div style=""background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;"">
                            <h4 style=""margin-top: 0; color: #495057;"">📅 Lịch trình thời gian (giờ Việt Nam, 24h)</h4>
                            <div style=""font-family: monospace; font-size: 14px; line-height: 1.5;"">
                                {timeline}
                            </div>
                            <p style=""font-size: 12px; color: #6c757d; margin-top: 10px;"">
                                <span style=""color: #28a745;"">● Xanh:</span> Thời gian có thể đặt &nbsp;&nbsp;
                                <span style=""color: #dc3545;"">● Đỏ:</span> Thời gian đã có booking khác
                            </p>
                        </div>";
                }

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = $@"
                        <div style=""font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"">
                            <h2 style=""color: #dc3545;"">❌ Booking của bạn đã bị hủy</h2>
                            
                            <p>Xin chào <strong>{customerName}</strong>,</p>
                            
                            <p>Chúng tôi rất tiếc phải thông báo rằng booking của bạn đã bị hủy do xung đột thời gian.</p>
                            
                            <div style=""background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;"">
                                <h3 style=""margin-top: 0; color: #495057;"">📋 Thông tin booking đã hủy</h3>
                                <p><strong>Mã booking:</strong> {bookingCode}</p>
                                <p><strong>Không gian:</strong> {spaceName}</p>
                                <p><strong>Thời gian:</strong> {startTime} - {endTime}</p>
                                <p><strong>Lý do hủy:</strong> <span style=""color: #dc3545;"">{cancellationReason}</span></p>
                            </div>
                            
                            {timelineHtml}
                            
                            <div style=""background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;"">
                                <h4 style=""margin-top: 0; color: #856404;"">💡 Làm thế nào để tránh xung đột?</h4>
                                <p>Xung đột thời gian xảy ra khi có nhiều booking được tạo cùng lúc cho cùng một thời điểm. Chủ không gian sẽ xác nhận booking đầu tiên và các booking còn lại sẽ tự động bị hủy.</p>
                                <p><strong>Gợi ý:</strong> Hãy thử đặt lại với thời gian khác hoặc liên hệ trực tiếp với chủ không gian.</p>
                            </div>
                            
                            <div style=""background-color: #e7f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;"">
                                <h4 style=""margin-top: 0; color: #007bff;"">📞 Liên hệ hỗ trợ</h4>
                                <p>Nếu bạn có thắc mắc hoặc cần hỗ trợ đặt lại booking, vui lòng liên hệ trực tiếp với chủ không gian:</p>
                                <p><strong>Email:</strong> <a href=""mailto:{ownerEmail}"">{ownerEmail}</a></p>
                            </div>
                            
                            <div style=""margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;"">
                                <p style=""color: #6c757d; font-size: 14px;"">
                                    Chúng tôi rất xin lỗi vì sự bất tiện này và hy vọng được phục vụ bạn trong tương lai.
                                </p>
                            </div>
                        </div>"
                };
                emailMessage.Body = bodyBuilder.ToMessageBody();

                using (var client = new SmtpClient())
                {
                    await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
                    await client.AuthenticateAsync(smtpUsername, _smtpPassword);
                    await client.SendAsync(emailMessage);
                    await client.DisconnectAsync(true);
                    
                    _logger.LogInformation("Booking cancellation email successfully sent to {ToEmail} for booking {BookingCode}", toEmail, bookingCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send booking cancellation email to {ToEmail} for booking {BookingCode}", toEmail, bookingCode);
            }
        }
    }
}