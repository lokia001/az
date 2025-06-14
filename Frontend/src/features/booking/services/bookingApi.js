// src/features/booking/services/bookingApi.js
import api from '../../../services/api';

/**
 * Fetch all bookings with optional filters
 * @param {Object} filters - Filtering parameters
 * @returns {Promise} API response with bookings data
 */
export const fetchBookingsAPI = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });

        const response = await api.get(`/bookings?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Create a new booking
 * @param {Object} bookingData - Booking data
 * @returns {Promise} API response with created booking data
 */
export const createBookingAPI = async (bookingData) => {
    try {
        console.log('[BookingApiService] Creating booking with data:', bookingData);
        const response = await api.post('/bookings', bookingData);
        console.log('[BookingApiService] Booking created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('[BookingApiService] Error creating booking:', error.response?.data || error.message);
        if (error.response?.data) {
            // Handle structured error responses from the API
            const errorData = error.response.data;
            let errorMessage = 'Đặt phòng không thành công.';
            
            if (errorData.message) {
                errorMessage = errorData.message;
            } else if (errorData.title) {
                errorMessage = errorData.title;
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            }
            
            throw errorMessage;
        } else {
            throw error.message || 'Đặt phòng không thành công. Vui lòng thử lại sau.';
        }
    }
};

/**
 * Update an existing booking
 * @param {string|number} bookingId - Booking ID
 * @param {Object} bookingData - Updated booking data
 * @returns {Promise} API response with updated booking data
 */
export const updateBookingAPI = async (bookingId, bookingData) => {
    try {
        const response = await api.put(`/bookings/${bookingId}`, bookingData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Cancel a booking
 * @param {string|number} bookingId - Booking ID
 * @param {Object} cancellationData - Cancellation reason and details
 * @returns {Promise} API response
 */
export const cancelBookingAPI = async (bookingId, cancellationData = {}) => {
    try {
        const response = await api.patch(`/bookings/${bookingId}/cancel`, cancellationData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get booking details by ID
 * @param {string|number} bookingId - Booking ID
 * @returns {Promise} API response with booking details
 */
export const getBookingByIdAPI = async (bookingId) => {
    try {
        const response = await api.get(`/bookings/${bookingId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Confirm a booking
 * @param {string|number} bookingId - Booking ID
 * @returns {Promise} API response
 */
export const confirmBookingAPI = async (bookingId) => {
    try {
        const response = await api.patch(`/bookings/${bookingId}/confirm`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Reject a booking
 * @param {string|number} bookingId - Booking ID
 * @param {Object} rejectionData - Rejection reason
 * @returns {Promise} API response
 */
export const rejectBookingAPI = async (bookingId, rejectionData) => {
    try {
        const response = await api.patch(`/bookings/${bookingId}/reject`, rejectionData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get booking statistics
 * @param {Object} filters - Date range and other filters
 * @returns {Promise} API response with booking statistics
 */
export const getBookingStatsAPI = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });

        const response = await api.get(`/bookings/stats?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Check space availability
 * @param {Object} availabilityData - Space ID, date, time range
 * @returns {Promise} API response with availability status
 */
export const checkSpaceAvailabilityAPI = async (availabilityData) => {
    try {
        const response = await api.post('/bookings/check-availability', availabilityData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Process booking payment
 * @param {string|number} bookingId - Booking ID
 * @param {Object} paymentData - Payment information
 * @returns {Promise} API response with payment status
 */
export const processBookingPaymentAPI = async (bookingId, paymentData) => {
    try {
        const response = await api.post(`/bookings/${bookingId}/payment`, paymentData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
