# Profile Feature Documentation

## Tổng quan
Tính năng Profile được thiết kế để quản lý thông tin tài khoản người dùng với giao diện thân thiện và hiện đại. Hệ thống sử dụng Redux Toolkit để quản lý state và tận dụng lại các API endpoint có sẵn từ backend.

## Cấu trúc thư mục
```
src/features/profile/
├── components/
│   ├── ProfileView.jsx          # Hiển thị thông tin profile
│   ├── ProfileEdit.jsx          # Form chỉnh sửa thông tin
│   ├── ChangePassword.jsx       # Form đổi mật khẩu
│   ├── AccountSettings.jsx      # Cài đặt tài khoản & upload avatar
│   └── ProfileTabs.jsx          # Component quản lý tabs
├── pages/
│   └── ProfilePage.jsx          # Page chính
├── services/
│   ├── profileApi.js           # API calls chính (đã tích hợp với backend)
│   └── profileApiFixed.js      # API calls bổ sung (cần backend implement)
├── slices/
│   └── profileSlice.js         # Redux slice
├── styles/
│   └── profile.css             # Styling
└── index.js                    # Export tất cả
```

## Tính năng đã triển khai

### 1. Xem thông tin cá nhân (ProfileView)
- Hiển thị avatar với fallback
- Thông tin cá nhân đầy đủ
- Badge hiển thị role người dùng
- Responsive design

### 2. Chỉnh sửa thông tin (ProfileEdit)
- Form validation chi tiết
- Hỗ trợ tất cả fields của UserDto
- Real-time validation
- Auto-save functionality

### 3. Đổi mật khẩu (ChangePassword)
- Show/hide password
- Password strength validation
- Confirmation password check
- Security guidelines

### 4. Cài đặt tài khoản (AccountSettings)
- Upload avatar (với preview)
- Request account deletion
- Danger zone với confirmation modal

## API Integration

### Đã tích hợp với backend:
- `GET /api/users/me` - Lấy thông tin profile
- `PUT /api/users/me/profile` - Cập nhật thông tin

### Cần backend implement thêm:
- `POST /auth/change-password` - Đổi mật khẩu
- `POST /users/me/upload-avatar` - Upload avatar
- `POST /users/me/request-deletion` - Yêu cầu xóa tài khoản
- `GET/PUT /users/me/preferences` - User preferences
- `GET/PUT /users/me/notifications` - Notification settings
- `POST /auth/verify-email` - Verify email
- `POST /auth/resend-verification` - Resend verification

## Redux State Structure
```javascript
{
  profile: {
    profileData: null,           // User profile data
    loading: false,              // Loading state
    error: null,                 // Error message
    updateStatus: 'idle',        // Update operation status
    updateError: null,           // Update error
    passwordStatus: 'idle',      // Password change status
    passwordError: null,         // Password error
    uploadPictureStatus: 'idle', // Upload status
    uploadPictureError: null,    // Upload error
    accountDeletionStatus: 'idle',
    accountDeletionError: null
  }
}
```

## Cách sử dụng

### 1. Import ProfilePage vào routes
```javascript
import { ProfilePage } from '../features/profile';

// Trong routes
{
  path: '/profile',
  element: <ProfilePage />
}
```

### 2. Sử dụng individual components
```javascript
import { ProfileView, ProfileEdit } from '../features/profile';

// Sử dụng
<ProfileView profile={profileData} />
<ProfileEdit 
  profile={profileData}
  onSave={handleSave}
  onCancel={handleCancel}
/>
```

### 3. Sử dụng Redux actions
```javascript
import { useDispatch } from 'react-redux';
import { fetchProfile, updateProfile } from '../features/profile';

const dispatch = useDispatch();

// Lấy profile
dispatch(fetchProfile());

// Cập nhật profile
dispatch(updateProfile({
  fullName: 'New Name',
  bio: 'New bio'
}));
```

## Styling & Theming
- Sử dụng Bootstrap 5 components
- Custom CSS cho advanced styling
- Responsive design cho mobile
- Dark/light theme support (có thể extend)

## Validation Rules
- **Full Name**: Tối đa 100 ký tự
- **Bio**: Tối đa 500 ký tự
- **Phone Number**: Regex validation, tối đa 20 ký tự
- **Address**: Tối đa 255 ký tự
- **Avatar URL**: Valid URL format, tối đa 512 ký tự
- **Password**: Tối thiểu 6 ký tự, tối đa 100 ký tự

## Error Handling
- Network errors được handle gracefully
- User-friendly error messages
- Automatic retry cho failed requests
- Form validation errors real-time

## Performance Optimizations
- Lazy loading cho components
- Memoization cho expensive operations
- Debounced API calls
- Optimistic updates

## Security Features
- Input sanitization
- XSS protection
- CSRF protection (cần backend support)
- Password strength requirements

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## TODO / Enhancements
1. **Backend APIs cần implement**:
   - Change password endpoint
   - Upload avatar endpoint
   - Account deletion request endpoint
   - Preferences management
   - Email verification

2. **UI/UX Improvements**:
   - Avatar cropping tool
   - Drag & drop avatar upload
   - Profile completion progress
   - Activity history

3. **Advanced Features**:
   - Two-factor authentication
   - Privacy settings
   - Data export
   - Multiple avatar options

## Troubleshooting

### Common Issues:
1. **API 404 errors**: Kiểm tra backend có implement endpoints chưa
2. **Avatar not loading**: Kiểm tra URL và CORS settings
3. **Form validation errors**: Kiểm tra validation rules
4. **Redux state not updating**: Kiểm tra store configuration

### Debug Mode:
```javascript
// Enable debug logging
localStorage.setItem('debug', 'profile:*');
```

## Contributing
1. Tuân theo coding standards hiện tại
2. Viết unit tests cho components mới
3. Update documentation khi thay đổi API
4. Follow responsive design patterns
5. Maintain accessibility standards
