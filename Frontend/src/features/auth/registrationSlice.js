// ----- PHẦN 1: REDUX SLICE CHO ĐĂNG KÝ (Ví dụ: đặt trong features/auth/registrationSlice.js) -----
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api'; // Giả sử đây là instance Axios đã cấu hình của bạn

// --- Thunk Action để gọi API đăng ký ---
export const registerUser = createAsyncThunk(
    'registration/registerUser', // Tên action type
    async (userData, { rejectWithValue }) => {
        // userData sẽ là object: { username, email, password, confirmPassword, fullName, phoneNumber }
        try {
            const response = await api.post('/auth/register', userData);
            // Giả sử API trả về dữ liệu người dùng hoặc thông báo thành công
            return response.data;
        } catch (error) {
            // Xử lý lỗi từ API
            if (error.response && error.response.data) {
                // Nếu API trả về thông tin lỗi cụ thể
                return rejectWithValue(error.response.data);
            }
            // Lỗi mạng hoặc lỗi không xác định khác
            return rejectWithValue(error.message || 'Đã có lỗi xảy ra trong quá trình đăng ký.');
        }
    }
);

// --- Slice cho trạng thái đăng ký ---
const registrationSlice = createSlice({
    name: 'registration',
    initialState: {
        loading: false,
        success: false, // Để theo dõi trạng thái đăng ký thành công
        error: null,    // Để lưu thông tin lỗi
        // userInfo: null, // Có thể lưu thông tin người dùng trả về nếu cần
    },
    reducers: {
        // Action để reset trạng thái khi component unmount hoặc sau khi xử lý xong
        resetRegistrationState: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
            // state.userInfo = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // state.userInfo = action.payload; // Lưu dữ liệu nếu API trả về
                state.error = null;
                // console.log('Đăng ký thành công:', action.payload);
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload || 'Đăng ký thất bại.'; // action.payload là lỗi từ rejectWithValue
                // console.error('Đăng ký thất bại:', action.payload);
            });
    },
});

export const { resetRegistrationState } = registrationSlice.actions;

// Selectors (nếu cần truy cập state này từ bên ngoài)
export const selectRegistrationLoading = (state) => state.registration.loading;
export const selectRegistrationSuccess = (state) => state.registration.success;
export const selectRegistrationError = (state) => state.registration.error;

export default registrationSlice.reducer;

// !!! QUAN TRỌNG: Bạn cần thêm reducer này vào rootReducer trong store của bạn !!!
// Ví dụ trong store/index.js:
// import registrationReducer from './features/auth/registrationSlice'; // Đường dẫn đúng
// const rootReducer = combineReducers({
//   auth: authReducer,
//   registration: registrationReducer, // THÊM DÒNG NÀY
//   // ... các reducers khác
// });