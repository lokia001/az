// src/features/profile/services/profileApi.js
import api from '../../../services/api';

// Default profile avatar constants and helpers
export const DEFAULT_PROFILE_AVATAR = 'https://ui-avatars.com/api/?name=User&size=120&background=6c757d&color=ffffff&format=png';

/**
 * Get random default avatar from predefined list
 * @returns {string} Random default avatar URL
 */
export const getRandomDefaultAvatar = () => {
    const defaultAvatars = [
        '/images/avatar-1.png',
        '/images/avatar-2.png',
        '/images/avatar-3.png',
        '/images/avatar-4.png',
        '/images/avatar-5.png',
        DEFAULT_PROFILE_AVATAR
    ];
    const randomIndex = Math.floor(Math.random() * defaultAvatars.length);
    return defaultAvatars[randomIndex];
};

/**
 * Ensure profile has valid avatar URL
 * @param {Object} profile - Profile object
 * @returns {Object} Profile with ensured avatar
 */
export const ensureProfileAvatar = (profile) => {
    if (!profile.avatarUrl || profile.avatarUrl === '' || profile.avatarUrl === null) {
        // Use a stable default avatar to prevent rerender
        return {
            ...profile,
            avatarUrl: DEFAULT_PROFILE_AVATAR
        };
    }
    return profile;
};

/**
 * Fetch user profile information
 * @returns {Promise} API response with profile data
 */
export const fetchProfileAPI = async () => {
    try {
        const response = await api.get('/users/me');
        const userData = response.data;
        
        // Debug log để kiểm tra data
        console.log('Fetched user data:', userData);
        
        // Nếu user có role Owner, lấy thêm thông tin OwnerProfile
        if (userData.role === 'Owner') {
            try {
                const ownerResponse = await api.get('/api/owner-profiles/me');
                console.log('Fetched owner profile:', ownerResponse.data);
                
                // Merge thông tin Owner với User
                const mergedData = {
                    ...userData,
                    ownerProfile: ownerResponse.data,
                    // Sử dụng LogoUrl từ OwnerProfile làm avatar cho Owner nếu có
                    avatarUrl: ownerResponse.data?.logoUrl || userData.avatarUrl
                };
                
                console.log('Merged profile data:', mergedData);
                return mergedData;
            } catch (ownerError) {
                console.warn('Failed to fetch owner profile:', ownerError);
                // Nếu chưa có OwnerProfile, trả về user data thông thường
                // với ownerProfile là null để frontend hiển thị form tạo mới
                return {
                    ...userData,
                    ownerProfile: null
                };
            }
        }
        
        return userData;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Update user profile information
 * @param {Object} profileData - Updated profile data
 * @returns {Promise} API response with updated profile
 */
export const updateProfileAPI = async (profileData) => {
    try {
        // Nếu có ownerProfile trong profileData, cập nhật riêng
        if (profileData.ownerProfile) {
            const ownerData = profileData.ownerProfile;
            const userUpdateData = { ...profileData };
            delete userUpdateData.ownerProfile;
            
            // Cập nhật user profile
            if (Object.keys(userUpdateData).length > 0) {
                await api.put('/users/me/profile', userUpdateData);
            }
            
            // Cập nhật hoặc tạo mới owner profile
            try {
                const ownerResponse = await api.put('/api/owner-profiles/me', ownerData);
                
                // Trả về combined data
                return {
                    ...userUpdateData,
                    ownerProfile: ownerResponse.data,
                    avatarUrl: ownerResponse.data?.logoUrl || userUpdateData.avatarUrl
                };
            } catch (ownerError) {
                // Nếu PUT thất bại (404 - chưa có OwnerProfile), thử POST để tạo mới
                if (ownerError.response?.status === 404) {
                    console.log('OwnerProfile not found, creating new one...');
                    const ownerResponse = await api.post('/api/owner-profiles/me', ownerData);
                    
                    return {
                        ...userUpdateData,
                        ownerProfile: ownerResponse.data,
                        avatarUrl: ownerResponse.data?.logoUrl || userUpdateData.avatarUrl
                    };
                } else {
                    throw ownerError;
                }
            }
        } else {
            // Cập nhật thông thường cho user
            const response = await api.put('/users/me/profile', profileData);
            return response.data;
        }
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Change user password
 * @param {Object} passwordData - Current and new password data
 * @returns {Promise} API response
 */
export const changePasswordAPI = async (passwordData) => {
    try {
        const response = await api.post('/user/profile/change-password', passwordData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Upload profile picture
 * @param {FormData} formData - Form data containing the image file
 * @returns {Promise} API response with uploaded image URL
 */
export const uploadProfilePictureAPI = async (formData) => {
    try {
        const response = await api.post('/user/profile/upload-picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Request account deletion
 * @param {Object} deletionData - Account deletion request data
 * @returns {Promise} API response
 */
export const requestAccountDeletionAPI = async (deletionData) => {
    try {
        const response = await api.post('/user/profile/request-deletion', deletionData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get user preferences
 * @returns {Promise} API response with user preferences
 */
export const getUserPreferencesAPI = async () => {
    try {
        const response = await api.get('/user/profile/preferences');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Update user preferences
 * @param {Object} preferences - User preference settings
 * @returns {Promise} API response
 */
export const updateUserPreferencesAPI = async (preferences) => {
    try {
        const response = await api.put('/user/profile/preferences', preferences);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get user notification settings
 * @returns {Promise} API response with notification settings
 */
export const getNotificationSettingsAPI = async () => {
    try {
        const response = await api.get('/user/profile/notifications');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Update user notification settings
 * @param {Object} notificationSettings - Notification preference settings
 * @returns {Promise} API response
 */
export const updateNotificationSettingsAPI = async (notificationSettings) => {
    try {
        const response = await api.put('/user/profile/notifications', notificationSettings);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Verify user email
 * @param {string} verificationToken - Email verification token
 * @returns {Promise} API response
 */
export const verifyEmailAPI = async (verificationToken) => {
    try {
        const response = await api.post('/user/profile/verify-email', { token: verificationToken });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Resend email verification
 * @returns {Promise} API response
 */
export const resendEmailVerificationAPI = async () => {
    try {
        const response = await api.post('/user/profile/resend-verification');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
