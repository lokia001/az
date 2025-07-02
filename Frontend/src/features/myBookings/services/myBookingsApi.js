// src/features/myBookings/services/myBookingsApi.js
import api from '../../../services/api';

/**
 * Fetch user's bookings
 * @param {Object} filters - Filtering parameters (status, date range, etc.)
 * @returns {Promise} API response with user's bookings data
 */
export const fetchMyBookingsAPI = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });

        const response = await api.get(`/user/bookings?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Cancel user's booking
 * @param {string|number} bookingId - Booking ID
 * @param {Object} cancellationData - Cancellation reason and details
 * @returns {Promise} API response
 */
export const cancelMyBookingAPI = async (bookingId, cancellationData = {}) => {
    try {
        const response = await api.put(`/user/bookings/${bookingId}/cancel`, cancellationData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Submit review for a completed booking
 * @param {string|number} bookingId - Booking ID
 * @param {Object} reviewData - Review data (rating, comment, etc.)
 * @returns {Promise} API response with review data
 */
export const submitBookingReviewAPI = async (bookingId, reviewData) => {
    try {
        const response = await api.post(`/user/bookings/${bookingId}/review`, reviewData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get user's booking history with detailed information
 * @param {Object} filters - Filtering parameters
 * @returns {Promise} API response with booking history
 */
export const getMyBookingHistoryAPI = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });

        const response = await api.get(`/user/bookings/history?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get specific booking details
 * @param {string|number} bookingId - Booking ID
 * @returns {Promise} API response with booking details
 */
export const getMyBookingDetailsAPI = async (bookingId) => {
    try {
        const response = await api.get(`/user/bookings/${bookingId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Update booking details (if allowed)
 * @param {string|number} bookingId - Booking ID
 * @param {Object} updateData - Updated booking data
 * @returns {Promise} API response with updated booking
 */
export const updateMyBookingAPI = async (bookingId, updateData) => {
    try {
        const response = await api.put(`/user/bookings/${bookingId}`, updateData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Request booking modification
 * @param {string|number} bookingId - Booking ID
 * @param {Object} modificationData - Requested changes
 * @returns {Promise} API response
 */
export const requestBookingModificationAPI = async (bookingId, modificationData) => {
    try {
        const response = await api.post(`/user/bookings/${bookingId}/modification-request`, modificationData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get booking receipts/invoices
 * @param {string|number} bookingId - Booking ID
 * @returns {Promise} API response with receipt data
 */
export const getBookingReceiptAPI = async (bookingId) => {
    try {
        const response = await api.get(`/user/bookings/${bookingId}/receipt`, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get upcoming bookings for user
 * @returns {Promise} API response with upcoming bookings
 */
export const getUpcomingBookingsAPI = async () => {
    try {
        const response = await api.get('/user/bookings/upcoming');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get booking reminders/notifications
 * @returns {Promise} API response with booking reminders
 */
export const getBookingRemindersAPI = async () => {
    try {
        const response = await api.get('/user/bookings/reminders');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Mark booking reminder as read
 * @param {string|number} reminderId - Reminder ID
 * @returns {Promise} API response
 */
export const markReminderAsReadAPI = async (reminderId) => {
    try {
        const response = await api.put(`/user/bookings/reminders/${reminderId}/read`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
