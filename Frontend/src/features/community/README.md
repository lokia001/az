# Community Posts - Bug Fixes

## Các vấn đề đã sửa

### 1. Thời gian hiển thị sai múi giờ
**Vấn đề:** Posts hiển thị thời gian theo UTC thay vì giờ Việt Nam (UTC+7), và logic tính toán relative time không chính xác

**Giải pháp:** 
- Tạo utility `src/utils/timeUtils.js` với function `formatVietnameseTime()`
- Sử dụng `timeZone: 'Asia/Ho_Chi_Minh'` thay vì cộng thêm 7 giờ thủ công
- Hiển thị thời gian relative chính xác (vừa xong, X phút trước, X giờ trước, X ngày trước)
- Với thời gian > 30 ngày thì hiển thị ngày tháng cụ thể
- Export utility để sử dụng chung cho toàn bộ ứng dụng

### 2. Avatar hiển thị không đúng với profile
**Vấn đề:** Posts dùng random avatar thay vì avatar thật từ profile user

**Giải pháp:**
- Import `DEFAULT_PROFILE_AVATAR` từ profileApi.js để đồng nhất
- Tạo user cache utility (`src/utils/userCache.js`) để cache thông tin user
- Sử dụng `getCachedUserInfo()` để lấy thông tin user đầy đủ bao gồm avatar thật
- Fallback về avatar mặc định nếu không có hoặc lỗi

### 3. Tên người dùng hiển thị không tối ưu
**Vấn đề:** Hiển thị "User + id" thay vì tên thật của user

**Giải pháp:**
- Sử dụng `getCachedUserInfo()` để lấy `fullName` và `username` từ API
- Ưu tiên hiển thị: `fullName` > `username` > `User + last6chars`
- Cache thông tin user để tránh gọi API liên tục
- TTL cache = 5 phút

## Cấu trúc file đã thay đổi

### PostCard.jsx
- Thêm import `getCachedUserInfo`, `DEFAULT_PROFILE_AVATAR`, và `formatVietnameseTime`
- Thêm state `authorInfo` để lưu thông tin tác giả
- Thêm useEffect để load thông tin tác giả
- Sử dụng `formatVietnameseTime()` từ timeUtils.js
- Cập nhật logic hiển thị avatar với fallback error handling

### timeUtils.js (mới)
- Utility functions cho format thời gian: `formatVietnameseTime`, `formatVietnameseDate`, `formatVietnameseDateTime`
- Helper functions: `isToday`, `isYesterday`
- Sử dụng `timeZone: 'Asia/Ho_Chi_Minh'` để đảm bảo đúng múi giờ Việt Nam
- Export để sử dụng chung cho toàn bộ ứng dụng

### MainFeed.jsx  
- Đơn giản hóa props truyền vào PostCard
- Chỉ truyền `post` object thay vì nhiều props riêng lẻ

### userCache.js (mới)
- Utility để cache thông tin user
- TTL = 5 phút
- Fallback graceful khi API lỗi
- Export functions: `getCachedUserInfo`, `clearUserCache`, `invalidateUserCache`

## Cách hoạt động

1. **Load post:** PostCard nhận post object từ MainFeed
2. **Load author info:** 
   - Nếu post đã có author info → dùng luôn
   - Nếu chỉ có authorUserId → gọi `getCachedUserInfo()`
   - Cache kết quả trong 5 phút
3. **Hiển thị thời gian:** 
   - Convert sang giờ VN (UTC+7)
   - Hiển thị relative time cho dễ đọc
4. **Hiển thị avatar:**
   - Dùng avatar thật từ user profile
   - Fallback về DEFAULT_PROFILE_AVATAR nếu lỗi

## Performance

- **Caching:** Thông tin user được cache 5 phút, giảm số lần gọi API
- **Async Loading:** Author info load bất đồng bộ, không block render
- **Graceful Fallback:** Luôn có fallback khi API lỗi
- **Memory Management:** Cache có TTL tự động xóa entries cũ

## Testing

Để test các fix này:
1. Tạo posts với các user khác nhau
2. Kiểm tra thời gian hiển thị đúng múi giờ VN
3. Verify avatar hiển thị đúng với profile user  
4. Check tên user hiển thị fullName thay vì User+ID
