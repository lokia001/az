// src/features/ownerBookingManagement/services/ownerBookingApi.js
import api from '../../../services/api';

/**
 * Fetch bookings for owner's spaces
 * @param {Object} filters - Filtering parameters
 * @returns {Promise} API response with owner's bookings data
 */
export const fetchOwnerBookingsAPI = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });

        const response = await api.get(`/owner/bookings?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Update booking status by owner
 * @param {string|number} bookingId - Booking ID
 * @param {Object} statusData - Status update data (approved, rejected, etc.)
 * @returns {Promise} API response with updated booking
 */
export const updateBookingStatusAPI = async (bookingId, statusData) => {
    try {
        const response = await api.patch(`/owner/bookings/${bookingId}/status`, statusData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get owner booking statistics
 * @param {Object} filters - Date range and other filters
 * @returns {Promise} API response with booking statistics
 */
export const getOwnerBookingStatsAPI = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });

        const response = await api.get(`/owner/bookings/stats?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Export owner bookings data
 * @param {Object} filters - Export filters and options
 * @returns {Promise} API response with export data or download link
 */
export const exportOwnerBookingsAPI = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });

        const response = await api.get(`/owner/bookings/export?${params.toString()}`, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get booking details for owner
 * @param {string|number} bookingId - Booking ID
 * @returns {Promise} API response with booking details
 */
export const getOwnerBookingDetailsAPI = async (bookingId) => {
    try {
        const response = await api.get(`/owner/bookings/${bookingId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Approve a booking
 * @param {string|number} bookingId - Booking ID
 * @param {Object} approvalData - Approval details
 * @returns {Promise} API response
 */
export const approveBookingAPI = async (bookingId, approvalData = {}) => {
    try {
        const response = await api.patch(`/owner/bookings/${bookingId}/approve`, approvalData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Reject a booking
 * @param {string|number} bookingId - Booking ID
 * @param {Object} rejectionData - Rejection reason and details
 * @returns {Promise} API response
 */
export const rejectBookingAPI = async (bookingId, rejectionData) => {
    try {
        const response = await api.patch(`/owner/bookings/${bookingId}/reject`, rejectionData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get owner's space availability calendar
 * @param {Object} filters - Date range and space filters
 * @returns {Promise} API response with availability data
 */
export const getOwnerSpaceAvailabilityAPI = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });

        const response = await api.get(`/owner/spaces/availability?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Update space availability settings
 * @param {string|number} spaceId - Space ID
 * @param {Object} availabilityData - Availability settings
 * @returns {Promise} API response
 */
export const updateSpaceAvailabilityAPI = async (spaceId, availabilityData) => {
    try {
        const response = await api.put(`/owner/spaces/${spaceId}/availability`, availabilityData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get revenue report for owner
 * @param {Object} filters - Date range and grouping options
 * @returns {Promise} API response with revenue data
 */
export const getOwnerRevenueReportAPI = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });

        const response = await api.get(`/owner/revenue/report?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
