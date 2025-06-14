// src/features/auth/forgotPasswordSlice.js (ví dụ)
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const requestPasswordReset = createAsyncThunk(
    'forgotPassword/requestReset',
    async (email, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return response.data; // Giả sử backend trả về { message: "..." }
        } catch (error) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error.message || 'Lỗi không xác định khi yêu cầu đặt lại mật khẩu.');
        }
    }
);

const forgotPasswordSlice = createSlice({
    name: 'forgotPassword',
    initialState: {
        loading: false,
        successMessage: null,
        error: null,
    },
    reducers: {
        resetForgotPasswordState: (state) => {
            state.loading = false;
            state.successMessage = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(requestPasswordReset.pending, (state) => {
                state.loading = true;
                state.successMessage = null;
                state.error = null;
            })
            .addCase(requestPasswordReset.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload?.message || 'Yêu cầu đặt lại mật khẩu đã được gửi.';
                state.error = null;
            })
            .addCase(requestPasswordReset.rejected, (state, action) => {
                state.loading = false;
                state.successMessage = null;
                state.error = action.payload?.message || action.payload || 'Gửi yêu cầu thất bại.';
            });
    },
});

export const { resetForgotPasswordState } = forgotPasswordSlice.actions;
export const selectForgotPasswordLoading = (state) => state.forgotPassword.loading;
export const selectForgotPasswordSuccessMessage = (state) => state.forgotPassword.successMessage;
export const selectForgotPasswordError = (state) => state.forgotPassword.error;

export default forgotPasswordSlice.reducer;

// Đừng quên thêm reducer này vào store/index.js