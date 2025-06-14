# Hướng dẫn cài đặt Secret và Cấu hình Nhạy cảm

Dự án này sử dụng các secret và cấu hình nhạy cảm (như API keys, Dialogflow credentials...) không được lưu trực tiếp trong source code. Dưới đây là cách thiết lập các giá trị này cho các môi trường khác nhau.

## Môi trường Development

Trong môi trường development, sử dụng User Secrets của .NET Core:

1. Mở terminal trong thư mục `/src/Backend.Api` và khởi tạo user secrets:

   ```bash
   dotnet user-secrets init
   ```

2. Thêm các giá trị bí mật:

   ```bash
   # Cài đặt Dialogflow
   dotnet user-secrets set "Dialogflow:ProjectId" "your-project-id"
   dotnet user-secrets set "Dialogflow:AgentId" "your-agent-id"
   dotnet user-secrets set "Dialogflow:CredentialsPath" "path/to/credentials.json"
   
   # Cài đặt JWT
   dotnet user-secrets set "Jwt:Key" "your-strong-random-key"
   
   # Cài đặt SMTP
   dotnet user-secrets set "SmtpSettings:Password" "your-email-password"
   
   # Cài đặt ImgBB
   dotnet user-secrets set "ImgBB:ApiKey" "your-imgbb-api-key"
   ```

## Môi trường Production

Trong môi trường production, sử dụng biến môi trường:

```bash
# Cài đặt Dialogflow
export Dialogflow__ProjectId="your-project-id"
export Dialogflow__AgentId="your-agent-id"
export Dialogflow__CredentialsPath="path/to/credentials.json"

# Cài đặt JWT
export Jwt__Key="your-strong-random-key"

# Cài đặt SMTP
export SmtpSettings__Password="your-email-password"

# Cài đặt ImgBB
export ImgBB__ApiKey="your-imgbb-api-key"
```

Lưu ý: Trong Linux/macOS, sử dụng dấu hai gạch dưới (`__`) thay cho dấu hai chấm (`:`) trong tên biến môi trường.

## File Credentials của Dialogflow

Bạn cần tải xuống file credentials JSON từ Google Cloud Console và lưu nó vào thư mục `/src/Backend.Api/credentials/` với tên `dialogflow-credentials.json`. Thư mục này đã được thêm vào .gitignore để không bị commit vào repository.

## Kiểm tra thiết lập

Để kiểm tra xem bạn đã thiết lập đúng các giá trị bí mật, hãy chạy ứng dụng trong môi trường development và kiểm tra log. Nếu có cảnh báo về cấu hình Dialogflow bị thiếu hoặc sử dụng placeholder, hãy kiểm tra lại các bước thiết lập ở trên.
