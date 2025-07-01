// src/features/auth/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginAPI, registerAPI, fetchUserProfileAPI, refreshTokenAPI, setAuthTokens, clearAuthTokens } from '../services/authApi';
import { fetchMyJoinedCommunities } from '../../community/slices/communitySlice'; // *** THÊM import ***
import apiClient from '../../../services/apiClient';

// Helper to set tokens in localStorage and apiClient
// const setAuthTokens = (data) => {
//     // data should be { accessToken, refreshToken, (accessTokenExpiration) }
//     localStorage.setItem('accessToken', data.accessToken);
//     if (data.refreshToken) {
//         localStorage.setItem('refreshToken', data.refreshToken);
//     }
//     // accessTokenExpiration can also be stored if needed for client-side expiry checks
//     if (data.accessTokenExpiration) {
//         localStorage.setItem('accessTokenExpiration', data.accessTokenExpiration);
//     }
//     apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
// };

// Helper to clear tokens
// const clearAuthTokens = () => {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     localStorage.removeItem('authUser'); // User object
//     localStorage.removeItem('accessTokenExpiration');
//     delete apiClient.defaults.headers.common['Authorization'];
// };

const initialState = {
    user: JSON.parse(localStorage.getItem('authUser')) || null,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    accessTokenExpiration: localStorage.getItem('accessTokenExpiration') || null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// Async Thunk for Login
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { dispatch, rejectWithValue }) => {
        try {
            // Step 1: Call loginAPI to get tokens
            const tokenData = await loginAPI(credentials); // { accessToken, refreshToken, accessTokenExpiration }
            setAuthTokens(tokenData);

            // Step 2: Call fetchUserProfileAPI to get user details
            // The fetchUserProfileAPI will use the accessToken set in apiClient by setAuthTokens
            const userProfile = await fetchUserProfileAPI();
            localStorage.setItem('authUser', JSON.stringify(userProfile));

            // *** THÊM: Fetch joined communities ngay sau khi login thành công ***
            console.log('[AuthSlice] Login successful, fetching joined communities...');
            dispatch(fetchMyJoinedCommunities());

            return { ...tokenData, user: userProfile }; // Return combined data
        } catch (error) {
            clearAuthTokens();
            return rejectWithValue(error.message || 'Login process failed');
        }
    }
);

// Async Thunk for Registration
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { dispatch, rejectWithValue }) => {
        try {
            // IMPORTANT: This assumes your register API also returns tokens
            // and requires a subsequent call to fetch user profile. Adjust if different.
            const tokenData = await registerAPI(userData);
            setAuthTokens(tokenData);

            const userProfile = await fetchUserProfileAPI();
            localStorage.setItem('authUser', JSON.stringify(userProfile));

            // *** THÊM: Fetch joined communities ngay sau khi register thành công ***
            console.log('[AuthSlice] Register successful, fetching joined communities...');
            dispatch(fetchMyJoinedCommunities());

            return { ...tokenData, user: userProfile };
        } catch (error) {
            clearAuthTokens();
            console.log('Registration error in thunk:', error);
            
            // Kiểm tra xem error có phải là instance của Error hay không
            let errorMessage = 'Registration process failed';
            
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (error && error.response && error.response.data) {
                const responseData = error.response.data;
                if (typeof responseData === 'string') {
                    errorMessage = responseData;
                } else if (responseData.message) {
                    errorMessage = responseData.message;
                } else if (responseData.errors) {
                    // Lấy lỗi đầu tiên nếu có nhiều lỗi
                    const firstErrorKey = Object.keys(responseData.errors)[0];
                    if (firstErrorKey && responseData.errors[firstErrorKey][0]) {
                        errorMessage = responseData.errors[firstErrorKey][0];
                    }
                }
            }
            
            console.log('Final error message for rejectWithValue:', errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

// Async Thunk to load user if accessToken exists (e.g., on app startup)
export const loadUserFromToken = createAsyncThunk(
    'auth/loadUserFromToken',
    async (_, { getState, rejectWithValue, dispatch }) => {
        const tokenFromState = getState().auth.accessToken; // Check state first
        const tokenFromStorage = localStorage.getItem('accessToken');
        const accessToken = tokenFromState || tokenFromStorage;

        if (!accessToken) {
            // No token, so don't treat as an error, just no user to load.
            // Return empty object to indicate no authentication but don't show an error
            console.log('No access token found, user is likely logged out');
            return { user: null, accessToken: null, refreshToken: null, accessTokenExpiration: null };
        }

        try {
            // Ensure the token is set in apiClient for the upcoming request
            // The request interceptor in apiClient.js should handle this.
            // apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`; // Already handled by interceptor

            const userProfile = await fetchUserProfileAPI(); // This will use the token via interceptor
            localStorage.setItem('authUser', JSON.stringify(userProfile));
            const refreshToken = localStorage.getItem('refreshToken'); // Also retrieve these for consistent state
            const accessTokenExpiration = localStorage.getItem('accessTokenExpiration');

            // *** THÊM: Fetch joined communities khi load user từ token thành công ***
            console.log('[AuthSlice] Load user from token successful, fetching joined communities...');
            dispatch(fetchMyJoinedCommunities());

            return { user: userProfile, accessToken, refreshToken, accessTokenExpiration };
        } catch (error) {
            // If fetchUserProfileAPI fails (e.g. 401 due to invalid/expired token),
            // this catch block will be executed.
            console.error('loadUserFromToken failed:', error.message);
            clearAuthTokens();
            dispatch(logoutUser()); // Dispatch logoutUser action to clear state and localStorage
            return rejectWithValue(error.message || 'Failed to load user from token');
        }
    }
);

// Async Thunk for refresh token
export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async (_, { getState, dispatch, rejectWithValue }) => {
        const state = getState().auth;
        const accessToken = state.accessToken || localStorage.getItem('accessToken');
        const refreshTokenValue = state.refreshToken || localStorage.getItem('refreshToken');

        if (!accessToken || !refreshTokenValue) {
            console.error('No access token or refresh token found');
            dispatch(logoutUser());
            return rejectWithValue('No tokens available for refresh');
        }

        try {
            const tokenData = await refreshTokenAPI(accessToken, refreshTokenValue);
            setAuthTokens(tokenData);

            // *** THÊM: Fetch joined communities khi refresh token thành công ***
            console.log('[AuthSlice] Token refresh successful, fetching joined communities...');
            dispatch(fetchMyJoinedCommunities());

            return tokenData;
        } catch (error) {
            console.error('Token refresh failed:', error.message);
            clearAuthTokens();
            dispatch(logoutUser());
            return rejectWithValue(error.message || 'Token refresh failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logoutUser: (state) => {
            clearAuthTokens();
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.accessTokenExpiration = null;
            state.status = 'idle';
            state.error = null;
        },
        clearAuthError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        const sharedPendingHandler = (state) => {
            state.status = 'loading';
            state.error = null;
        };
        const sharedFulfilledHandler = (state, action) => {
            state.status = 'succeeded';
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.accessTokenExpiration = action.payload.accessTokenExpiration;
            state.error = null;
        };
        const sharedRejectedHandler = (state, action) => {
            state.status = 'failed';
            state.error = action.payload; // error message from rejectWithValue
            console.log('Rejection handler received error:', action.payload);
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.accessTokenExpiration = null;
        };

        builder
            // Login
            .addCase(loginUser.pending, sharedPendingHandler)
            .addCase(loginUser.fulfilled, sharedFulfilledHandler)
            .addCase(loginUser.rejected, sharedRejectedHandler)
            // Register
            .addCase(registerUser.pending, sharedPendingHandler)
            .addCase(registerUser.fulfilled, sharedFulfilledHandler)
            .addCase(registerUser.rejected, sharedRejectedHandler)
            // Load User From Token
            .addCase(loadUserFromToken.pending, (state) => { // Keep existing user data while loading
                state.status = 'loading';
                state.error = null; // Clear previous error on new attempt
            })
            .addCase(loadUserFromToken.fulfilled, sharedFulfilledHandler)
            .addCase(loadUserFromToken.rejected, (state, action) => {
                // For loadUserFromToken, if it fails, it means the stored token was bad
                // or the user is logged out
                
                // Don't set error if it's just because the user is logged out
                if (action.payload === 'No access token found') {
                    state.status = 'idle';
                    state.user = null;
                    state.accessToken = null;
                    state.refreshToken = null;
                    state.accessTokenExpiration = null;
                } else {
                    sharedRejectedHandler(state, action);
                }
                // Ensure everything is cleared if logoutUser wasn't dispatched from thunk
                if (state.user || state.accessToken) { // Double check if not already cleared
                    clearAuthTokens();
                    state.user = null;
                    state.accessToken = null;
                    state.refreshToken = null;
                    state.accessTokenExpiration = null;
                }
            })
            // Refresh Token
            .addCase(refreshToken.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(refreshToken.fulfilled, sharedFulfilledHandler)
            .addCase(refreshToken.rejected, (state, action) => {
                // For refresh token failure, user should be logged out
                sharedRejectedHandler(state, action);
                clearAuthTokens();
            });
    },
});

export const { logoutUser, clearAuthError } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAuthenticated = (state) => !!state.auth.accessToken && !!state.auth.user;

export default authSlice.reducer;