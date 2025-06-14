// src/features/profile/slices/profileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchProfileAPI,
    updateProfileAPI,
    changePasswordAPI,
    uploadProfilePictureAPI,
    requestAccountDeletionAPI
} from '../services/profileApi';

// Initialize profile state
const initialState = {
    profileData: null,
    loading: false,
    error: null,
    updateStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    updateError: null,
    passwordStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    passwordError: null,
    uploadPictureStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    uploadPictureError: null,
    accountDeletionStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    accountDeletionError: null,
};

// Import the default avatar and profile helpers
import { DEFAULT_PROFILE_AVATAR, getRandomDefaultAvatar, ensureProfileAvatar } from '../services/profileApi';

// Async thunk actions
export const fetchProfile = createAsyncThunk(
    'profile/fetch',
    async (_, { rejectWithValue }) => {
        try {
            let profileData = await fetchProfileAPI();

            // Double-check avatar URLs at the Redux level
            profileData = ensureProfileAvatar(profileData);

            return profileData;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateProfile = createAsyncThunk(
    'profile/update',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await updateProfileAPI(profileData);
            return response;
        } catch (error) {

            // Enhanced error message for debugging
            let errorMessage = error.message;

            if (error.response) {

                // Include HTTP status in the error message if available
                if (error.response.status) {
                    errorMessage = `[${error.response.status}] ${errorMessage}`;
                }

                // Include more detailed error info if available
                const serverErrorMsg =
                    error.response.data?.detail ||
                    error.response.data?.message ||
                    error.response.data?.title ||
                    error.response.data?.error;

                if (serverErrorMsg) {
                    errorMessage = `${errorMessage}: ${serverErrorMsg}`;
                }
            }

            return rejectWithValue(errorMessage);
        }
    }
);

export const changePassword = createAsyncThunk(
    'profile/changePassword',
    async (passwordData, { rejectWithValue }) => {
        try {
            const response = await changePasswordAPI(passwordData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const uploadProfilePicture = createAsyncThunk(
    'profile/uploadPicture',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await uploadProfilePictureAPI(formData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const requestAccountDeletion = createAsyncThunk(
    'profile/requestDeletion',
    async (reason, { rejectWithValue }) => {
        try {
            const response = await requestAccountDeletionAPI(reason);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Profile slice
const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        resetUpdateStatus: (state) => {
            state.updateStatus = 'idle';
            state.updateError = null;
        },
        resetPasswordStatus: (state) => {
            state.passwordStatus = 'idle';
            state.passwordError = null;
        },
        resetUploadPictureStatus: (state) => {
            state.uploadPictureStatus = 'idle';
            state.uploadPictureError = null;
        },
        resetAccountDeletionStatus: (state) => {
            state.accountDeletionStatus = 'idle';
            state.accountDeletionError = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch profile
        builder
            .addCase(fetchProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;

                // Only update the profileData if it changed to avoid triggering unnecessary re-renders
                const profileData = ensureProfileAvatar(action.payload);

                // Deep equality check before updating state
                if (!state.profileData || JSON.stringify(state.profileData) !== JSON.stringify(profileData)) {
                    state.profileData = profileData;
                }
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update profile
            .addCase(updateProfile.pending, (state) => {
                state.updateStatus = 'loading';
                state.updateError = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.updateStatus = 'succeeded';

                // Only update if there are actually changes
                if (action.payload) {
                    // Apply changes while ensuring avatar URLs are consistent
                    const updatedProfile = ensureProfileAvatar({
                        ...state.profileData,
                        ...action.payload
                    });

                    // Avoid unnecessary re-renders by checking if data actually changed
                    if (JSON.stringify(updatedProfile) !== JSON.stringify(state.profileData)) {
                        state.profileData = updatedProfile;
                    }
                }
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.updateStatus = 'failed';
                state.updateError = action.payload;
            })
            // Change password
            .addCase(changePassword.pending, (state) => {
                state.passwordStatus = 'loading';
                state.passwordError = null;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.passwordStatus = 'succeeded';
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.passwordStatus = 'failed';
                state.passwordError = action.payload;
            })
            // Upload profile picture
            .addCase(uploadProfilePicture.pending, (state) => {
                state.uploadPictureStatus = 'loading';
                state.uploadPictureError = null;
            })
            .addCase(uploadProfilePicture.fulfilled, (state, action) => {
                state.uploadPictureStatus = 'succeeded';
                if (action.payload.profilePictureUrl) {
                    state.profileData = {
                        ...state.profileData,
                        profilePictureUrl: action.payload.profilePictureUrl
                    };
                }
            })
            .addCase(uploadProfilePicture.rejected, (state, action) => {
                state.uploadPictureStatus = 'failed';
                state.uploadPictureError = action.payload;
            })
            // Account deletion request
            .addCase(requestAccountDeletion.pending, (state) => {
                state.accountDeletionStatus = 'loading';
                state.accountDeletionError = null;
            })
            .addCase(requestAccountDeletion.fulfilled, (state) => {
                state.accountDeletionStatus = 'succeeded';
            })
            .addCase(requestAccountDeletion.rejected, (state, action) => {
                state.accountDeletionStatus = 'failed';
                state.accountDeletionError = action.payload;
            });
    },
});

// Export actions
export const {
    resetUpdateStatus,
    resetPasswordStatus,
    resetUploadPictureStatus,
    resetAccountDeletionStatus
} = profileSlice.actions;

// Selectors
export const selectProfileData = (state) => state.profile.profileData;
export const selectProfileLoading = (state) => state.profile.loading;
export const selectProfileError = (state) => state.profile.error;
export const selectUpdateStatus = (state) => state.profile.updateStatus;
export const selectUpdateError = (state) => state.profile.updateError;
export const selectPasswordStatus = (state) => state.profile.passwordStatus;
export const selectPasswordError = (state) => state.profile.passwordError;
export const selectUploadPictureStatus = (state) => state.profile.uploadPictureStatus;
export const selectUploadPictureError = (state) => state.profile.uploadPictureError;
export const selectAccountDeletionStatus = (state) => state.profile.accountDeletionStatus;
export const selectAccountDeletionError = (state) => state.profile.accountDeletionError;


export default profileSlice.reducer;
