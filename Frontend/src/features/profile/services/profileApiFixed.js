// src/features/profile/services/profileApiFixed.js
import api from '../../../services/api';

/**
 * Change user password
 * @param {Object} passwordData - Current and new password data
 * @returns {Promise} API response
 */
export const changePasswordAPI = async (passwordData) => {
    try {
        // Note: Backend might need this endpoint to be implemented
        const response = await api.post('/auth/change-password', passwordData);
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
        // Note: Backend might need this endpoint to be implemented
        const response = await api.post('/users/me/upload-avatar', formData, {
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
        // Note: Backend might need this endpoint to be implemented
        const response = await api.post('/users/me/request-deletion', deletionData);
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
        // Note: Backend might need this endpoint to be implemented
        const response = await api.get('/users/me/preferences');
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
        // Note: Backend might need this endpoint to be implemented
        const response = await api.put('/users/me/preferences', preferences);
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
        // Note: Backend might need this endpoint to be implemented
        const response = await api.get('/users/me/notifications');
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
        // Note: Backend might need this endpoint to be implemented
        const response = await api.put('/users/me/notifications', notificationSettings);
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
        // Note: Backend might need this endpoint to be implemented
        const response = await api.post('/auth/verify-email', { token: verificationToken });
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
        // Note: Backend might need this endpoint to be implemented
        const response = await api.post('/auth/resend-verification');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
