# Services & Amenities Management Feature - README

## Tổng quan
Tính năng quản lý Dịch vụ & Tiện ích (Services & Amenities) cho phép owner:
- Tạo, sửa, xóa các dịch vụ riêng (Private Services)
- Thêm dịch vụ vào booking của khách hàng
- Quản lý số lượng và giá dịch vụ cho từng booking
- Tự động tính toán tổng tiền bao gồm dịch vụ

## Backend API Endpoints

### Private Services Management (Owner CRUD)
- `GET /api/private-services` - Lấy danh sách dịch vụ của owner
- `GET /api/private-services/{id}` - Lấy chi tiết 1 dịch vụ
- `POST /api/private-services` - Tạo dịch vụ mới
- `PUT /api/private-services/{id}` - Cập nhật dịch vụ
- `DELETE /api/private-services/{id}` - Xóa dịch vụ

### Booking Services Management 
- `GET /api/bookings/{bookingId}/services` - Lấy dịch vụ của booking
- `POST /api/bookings/{bookingId}/services` - Thêm dịch vụ vào booking
- `PUT /api/bookings/{bookingId}/services/{serviceId}` - Cập nhật dịch vụ trong booking
- `DELETE /api/bookings/{bookingId}/services/{serviceId}` - Xóa dịch vụ khỏi booking

## Frontend Features

### 1. Owner Services Management Page (`/owner/services-amenities`)
- Hiển thị grid các dịch vụ của owner
- Modal tạo/sửa dịch vụ với form validation
- Xóa dịch vụ với confirmation dialog
- Responsive design

### 2. Booking Services Management
- Tích hợp vào Owner Booking Management
- Button "Quản lý dịch vụ" trong dropdown actions
- Modal quản lý dịch vụ cho booking:
  - Thêm dịch vụ từ danh sách dịch vụ của owner
  - Chỉnh sửa số lượng dịch vụ
  - Xóa dịch vụ khỏi booking
  - Hiển thị tổng tiền dịch vụ

### 3. Booking Detail Enhancement
- Hiển thị danh sách dịch vụ đã sử dụng
- Tổng tiền dịch vụ trong booking detail

## Database Schema

### PrivateService Table
```sql
- Id (PrimaryKey)
- Name (string, required)
- UnitPrice (decimal, required)
- Unit (string, required - ví dụ: "ly", "trang", "giờ")
- Description (string, nullable)
- OwnerId (ForeignKey to User)
- IsActive (boolean, default true)
- CreatedAt (datetime)
- UpdatedAt (datetime)
```

### BookingService Table (Junction)
```sql
- Id (PrimaryKey)
- BookingId (ForeignKey to Booking)
- PrivateServiceId (ForeignKey to PrivateService)
- Quantity (int, required)
- UnitPrice (decimal, snapshot giá tại thời điểm booking)
- ServiceName (string, snapshot tên tại thời điểm booking)
- Unit (string, snapshot đơn vị tại thời điểm booking)
- CreatedAt (datetime)
- UpdatedAt (datetime)
```

## Usage Examples

### 1. Owner tạo dịch vụ mới
1. Vào `/owner/services-amenities`
2. Click "Thêm dịch vụ mới"
3. Điền form: Tên, Giá, Đơn vị, Mô tả
4. Click "Thêm mới"

### 2. Owner thêm dịch vụ vào booking
1. Vào `/owner/bookings`
2. Click dropdown "Hành động" của booking
3. Chọn "🛎️ Quản lý dịch vụ"
4. Chọn dịch vụ và số lượng
5. Click "Thêm"

### 3. Update booking total với dịch vụ
- Tổng tiền booking sẽ tự động được tính lại khi thêm/sửa/xóa dịch vụ
- Hiển thị riêng biệt: tiền phòng + tiền dịch vụ = tổng tiền

## Technical Implementation

### Frontend Tech Stack
- React với Redux Toolkit
- RTK Query cho API calls
- React Bootstrap cho UI
- CSS modules cho styling

### Backend Tech Stack  
- ASP.NET Core Web API
- Entity Framework Core
- Repository Pattern
- Service Layer Pattern
- AutoMapper cho DTO mapping

### Security
- JWT Authentication
- Owner chỉ có thể CRUD dịch vụ của mình
- Owner chỉ có thể quản lý dịch vụ cho booking của space thuộc về mình

## Testing Notes
1. Database migration đã được apply
2. API endpoints đã được test
3. Frontend components đã được integrate
4. Role-based access control đã được implement

## Next Steps (Optional)
1. Thêm reporting cho doanh thu dịch vụ
2. Bulk actions cho nhiều dịch vụ
3. Service categories/tags
4. Service availability schedule
5. Integration với payment processing
