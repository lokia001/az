# Cloudinary Configuration Guide

## 1. Đăng ký tài khoản Cloudinary

1. Truy cập: https://cloudinary.com/
2. Đăng ký tài khoản miễn phí
3. Xác nhận email và đăng nhập

## 2. Lấy thông tin cấu hình

Sau khi đăng nhập, vào Dashboard và lấy thông tin:

- **Cloud Name**: Tên cloud của bạn (ví dụ: "my-cloud-name")
- **API Key**: Key để xác thực (ví dụ: "123456789012345")
- **API Secret**: Secret key (ví dụ: "abcdefghijklmnopqrstuvwxyz123")

## 3. Cập nhật cấu hình Backend

### 3.1. Cập nhật appsettings.Development.json:
```json
{
  "Cloudinary": {
    "CloudName": "your-actual-cloud-name",
    "ApiKey": "your-actual-api-key",
    "ApiSecret": "your-actual-api-secret"
  }
}
```

### 3.2. Cho production, cập nhật appsettings.Production.json:
```json
{
  "Cloudinary": {
    "CloudName": "your-production-cloud-name",
    "ApiKey": "your-production-api-key", 
    "ApiSecret": "your-production-api-secret"
  }
}
```

### 3.3. Hoặc sử dụng User Secrets (khuyến nghị cho development):
```bash
cd src/Backend.Api
dotnet user-secrets set "Cloudinary:CloudName" "your-cloud-name"
dotnet user-secrets set "Cloudinary:ApiKey" "your-api-key"
dotnet user-secrets set "Cloudinary:ApiSecret" "your-api-secret"
```

### 3.4. Hoặc sử dụng Environment Variables (khuyến nghị cho production):
```bash
export Cloudinary__CloudName="your-cloud-name"
export Cloudinary__ApiKey="your-api-key"
export Cloudinary__ApiSecret="your-api-secret"
```

## 4. Cấu hình GitHub Secrets cho CI/CD

Để GitHub Actions có thể deploy với Cloudinary credentials, bạn cần thêm các secrets sau vào GitHub repository:

### 4.1. Truy cập GitHub Secrets:
1. Vào repository GitHub của bạn
2. Chọn **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**

### 4.2. Thêm các secrets sau:

- **CLOUDINARY_CLOUD_NAME**: Cloud name từ Cloudinary dashboard
- **CLOUDINARY_API_KEY**: API Key từ Cloudinary dashboard  
- **CLOUDINARY_API_SECRET**: API Secret từ Cloudinary dashboard

### 4.3. GitHub Actions sẽ tự động sử dụng:
GitHub Actions đã được cập nhật để tự động cấu hình các environment variables này cho production server.

## 5. Tính năng Cloudinary Free Tier

Free tier của Cloudinary bao gồm:
- **25 GB storage** 
- **25 GB monthly bandwidth**
- **25,000 monthly transformations**
- **Auto optimization** (format và quality)
- **Responsive delivery**
- **Basic transformations** (resize, crop, etc.)

## 6. Lợi ích so với lưu trữ local

### 5.1. Performance:
- **CDN global**: Ảnh được deliver từ server gần nhất với user
- **Auto optimization**: Tự động chọn format tối ưu (WebP, AVIF) 
- **Lazy loading**: Hỗ trợ lazy loading tự động
- **Responsive images**: Tự động resize theo device

### 5.2. Storage:
- **Không giới hạn file**: Không lo về disk space của server
- **Backup tự động**: Cloudinary tự backup và replicate
- **Version control**: Có thể giữ nhiều version của cùng 1 ảnh

### 5.3. Bảo mật:
- **HTTPS mặc định**: Tất cả ảnh đều được serve qua HTTPS
- **Access control**: Có thể control ai được access ảnh
- **Signed URLs**: Có thể tạo signed URLs với expiration

### 5.4. Quản lý:
- **Dashboard**: Giao diện web để quản lý ảnh
- **Metadata**: Tự động extract metadata từ ảnh
- **Tags và folders**: Organize ảnh dễ dàng

## 6. Migration từ local storage

Nếu bạn đã có ảnh lưu trữ local, có thể migrate theo cách:

1. **Manual upload**: Upload từng ảnh qua Dashboard
2. **API upload**: Dùng script để upload hàng loạt
3. **URL-based upload**: Cloudinary có thể fetch ảnh từ URL existing

## 7. Best Practices

### 7.1. Folders organization:
```
spaces/{spaceId}/image-1.jpg
spaces/{spaceId}/image-2.jpg
users/avatars/{userId}.jpg
communities/{communityId}/banner.jpg
```

### 7.2. Naming convention:
- Sử dụng unique filename để tránh conflict
- Dùng GUID hoặc timestamp trong tên file
- Organize bằng folders thay vì tên file phức tạp

### 7.3. Transformation:
```javascript
// Frontend có thể request ảnh với transformation on-the-fly
const thumbnailUrl = cloudinaryCore.url('spaces/abc-123/image.jpg', {
  width: 300,
  height: 200,
  crop: 'fill',
  quality: 'auto',
  fetch_format: 'auto'
});
```

## 8. Monitoring

- **Usage dashboard**: Theo dõi bandwidth và storage usage
- **Analytics**: Xem top images, geographic distribution
- **Alerts**: Setup alerts khi gần hết quota

## 9. Troubleshooting

### 9.1. Common errors:
- **401 Unauthorized**: Kiểm tra API Key/Secret
- **400 Bad Request**: Kiểm tra file format hoặc size
- **403 Forbidden**: Kiểm tra permissions hoặc quota

### 9.2. Debug tips:
- Enable logging trong CloudinaryService
- Kiểm tra Cloudinary Dashboard để xem upload logs
- Test với Postman trước khi integrate vào app

## 10. Next Steps

Sau khi cấu hình xong:

1. **Chạy migration**: `dotnet ef database update`
2. **Test upload**: Thử upload ảnh qua API
3. **Verify**: Kiểm tra ảnh hiển thị trong frontend
4. **Monitor**: Theo dõi usage trong Cloudinary Dashboard

---

**Lưu ý**: Đừng commit API Key/Secret vào Git. Luôn sử dụng environment variables hoặc user secrets!
