# Navbar Component

Navbar component đã được tối ưu để hiển thị menu động theo từng vai trò người dùng.

## Cấu trúc Menu theo Vai trò

### 1. Guest (Chưa đăng nhập)
**Layout:** Logo + Search Bar + Menu Links + Language Switcher + Login/Register Buttons
- **Menu Links:** Explore, Community, About us
- **Search Bar:** Có sẵn để tìm kiếm spaces và community
- **Authentication:** Hiển thị nút Login và Register

### 2. User (Người dùng thường)
**Layout:** Logo + Search Bar + Menu Links + Language Switcher + Avatar Dropdown
- **Menu Links:** Explore, Community, About us
- **Search Bar:** Có sẵn để tìm kiếm spaces và community
- **Avatar Dropdown:** Profile, Logout

### 3. Owner (Chủ doanh nghiệp)
**Layout:** Logo + Menu Links + Language Switcher + Avatar Dropdown
- **Menu Links:** Dash, Space, S&A, Book, Customer, Community
- **No Search Bar:** Owner không cần tìm kiếm, chỉ cần quản lý
- **Avatar Dropdown:** Profile, Logout

### 4. SysAdmin (Quản trị viên hệ thống)
**Layout:** Logo + Menu Links + Language Switcher + Avatar Dropdown
- **Menu Links:** Dash, S&A, Account, Community
- **No Search Bar:** Admin không cần tìm kiếm, chỉ cần quản lý
- **Avatar Dropdown:** Profile, Logout

## Tính năng đã loại bỏ

1. **Notifications:** Đã loại bỏ hoàn toàn icon và dropdown notification
2. **Multiple Account Options:** Avatar dropdown chỉ còn Profile và Logout
3. **Role-specific Profile Routes:** Tất cả role đều dùng `/profile` chung

## Tính năng Search Bar

- **Chỉ hiển thị cho:** Guest và User
- **Scope Switcher:** Cho phép chuyển đổi giữa "Spaces" và "Community"
- **Responsive:** Có search icon riêng cho mobile

## Language Switcher

- **Hiển thị:** "🌐 En" thay vì dynamic language code
- **Options:** English và Tiếng Việt
- **Available for:** Tất cả vai trò

## Avatar và Authentication

- **Authenticated Users:** Hiển thị avatar hoặc icon user mặc định
- **Guest Users:** Hiển thị nút Login/Register
- **Avatar Fallback:** Sử dụng UserIcon khi không có avatarUrl

## Mobile Support

- **Hamburger Menu:** Cho tất cả vai trò
- **Mobile Search:** Chỉ cho Guest và User
- **Responsive Design:** Tự động ẩn/hiện các element phù hợp

## API Integration

- **Routes:** Tương thích với các route hiện có
- **Redux:** Tích hợp với authSlice để lấy user data
- **Logout:** Xử lý logout an toàn và navigate về login page

## Performance

- **Optimized Rendering:** Chỉ render các component cần thiết theo role
- **Event Handling:** Debounced dropdown toggles
- **Memory Management:** Proper cleanup của event listeners
