// src/features/ownerBookingManagement/services/ownerBookingApi.js
import api from '../../../services/api';

/**
 * Convert booking status code to Vietnamese text
 * @param {string} status - Status code
 * @returns {string} Vietnamese status text
 */
const getStatusText = (status) => {
    const statusMap = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Đã xác nhận',
        'cancelled': 'Đã hủy',
        'completed': 'Hoàn thành',
        'no-show': 'Không đến',
        'in-progress': 'Đang sử dụng'
    };
    return statusMap[status] || 'Không xác định';
};

/**
 * Helper function to build URL params
 * @param {Object} params - Parameters to convert to URLSearchParams
 * @returns {string} URL search params string
 */
const buildQueryString = (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value)) {
                value.forEach(v => searchParams.append(key, v));
            } else {
                searchParams.append(key, value);
            }
        }
    });
    return searchParams.toString();
};

/**
 * Structure error response for consistent error handling
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param {any} details - Additional error details
 * @returns {Object} Structured error object
 */
const createErrorResponse = (message, type = 'error', details = null) => ({
    error: {
        message,
        type,
        details,
        timestamp: new Date().toISOString()
    }
});

/**
 * Calculate duration between two dates in hours
 * @param {string} startTime - Start time string
 * @param {string} endTime - End time string
 * @returns {number} Duration in hours
 */
const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    return Math.round(diffMs / (1000 * 60 * 60)); // Convert to hours
};

/**
 * Fetch bookings for owner's spaces
 * @param {Object} filters - Filtering parameters
 * @returns {Promise} API response with owner's bookings data or error object
 */
export const fetchOwnerBookingsAPI = async (filters = {}) => {
    try {
        const { spaceId, ...restFilters } = filters;
        
        if (!spaceId) {
            return createErrorResponse(
                'Vui lòng chọn không gian để xem lịch đặt chỗ.',
                'validation'
            );
        }

        // Build query params except spaceId
        const { spaceType, spaceName, ...otherFilters } = restFilters;
        const queryString = buildQueryString(otherFilters);
        
        console.log('Fetching bookings:', `/bookings/space/${spaceId}?${queryString}`);
        const response = await api.get(`/bookings/space/${spaceId}?${queryString}`);
        
        if (!response.data) {
            return createErrorResponse(
                'Không có dữ liệu đặt chỗ.',
                'empty',
                { spaceId }
            );
        }

        // Format and validate data from backend
        let items = Array.isArray(response.data) ? response.data : [];
        
        // Map data to match component expectations
        items = items.map(booking => {
            const customerName = generateDisplayName(booking.userId);
            
            return {
                id: booking.id,
                customerName: customerName,
                spaceName: booking.spaceName || booking.space?.name || 'Chưa có tên không gian',
                startTime: booking.startTime,
                endTime: booking.endTime,
                duration: booking.duration || calculateDuration(booking.startTime, booking.endTime),
                totalPrice: booking.totalPrice || 0,
                status: booking.status || 'Pending',
                notes: booking.notesFromUser || booking.notes || '',
                paymentStatus: booking.paymentStatus || 'Unpaid',
                notificationEmail: booking.notificationEmail || null, // Map notification email from backend
                numberOfPeople: booking.numberOfPeople || 1,
                // Keep original data for modal details
                customer: {
                    name: customerName,
                    email: 'Thông tin riêng tư',
                    phone: 'Thông tin riêng tư'
                },
                space: {
                    name: booking.spaceName || booking.space?.name || 'Chưa có tên không gian',
                    type: booking.space?.type || 'Không gian làm việc'
                }
            };
        });
        
        if (items.length === 0) {
            return {
                data: [],
                pageNumber: otherFilters.PageNumber || 1,
                pageSize: otherFilters.PageSize || 10,
                totalCount: 0,
                totalPages: 0
            };
        }

        return {
            data: items,
            pageNumber: otherFilters.PageNumber || 1,
            pageSize: otherFilters.PageSize || 10,
            totalCount: items.length,
            totalPages: Math.ceil(items.length / (otherFilters.PageSize || 10))
        };
    } catch (error) {
        console.error('API Error:', error);
        return createErrorResponse(
            error.response?.data?.message || 'Đã xảy ra lỗi khi tải dữ liệu đặt chỗ.',
            'api',
            error.response?.data
        );
    }
};

/**
 * Get booking details for owner
 * @param {string|number} bookingId - Booking ID
 * @returns {Promise} API response with booking details
 */
export const getOwnerBookingDetailsAPI = async (bookingId) => {
    try {
        const response = await api.get(`/bookings/${bookingId}`);
        const booking = response.data;
        
        // Map the booking data to include notification email
        return {
            ...booking,
            notificationEmail: booking.notificationEmail || null,
            customerName: generateDisplayName(booking.userId),
            spaceName: booking.spaceName || booking.space?.name || 'Chưa có tên không gian'
        };
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Update booking status
 * @param {string} bookingId - Booking ID
 * @param {string} status - New status
 * @returns {Promise} API response with updated booking or error object
 */
export const updateBookingStatusAPI = async (bookingId, status) => {
    try {
        if (!bookingId) {
            return createErrorResponse(
                'ID đặt chỗ không hợp lệ.',
                'validation'
            );
        }

        // Debug: log the status parameter
        console.log('updateBookingStatusAPI called with:', { bookingId, status, statusType: typeof status });

        // Ensure status is a string
        const statusString = String(status || '').trim();
        
        if (!statusString) {
            return createErrorResponse(
                'Trạng thái không hợp lệ.',
                'validation'
            );
        }

        // Convert frontend status to backend enum format
        const statusMap = {
            // Lowercase versions
            'pending': 'Pending',
            'confirmed': 'Confirmed', 
            'cancelled': 'Cancelled',
            'completed': 'Completed',
            'checkedin': 'CheckedIn',
            'overdue': 'Overdue',
            'noshow': 'NoShow',
            'abandoned': 'Abandoned',
            'external': 'External',
            'conflict': 'Conflict',
            // Capitalized versions (from component clicks)
            'Pending': 'Pending',
            'Confirmed': 'Confirmed', 
            'Cancelled': 'Cancelled',
            'Completed': 'Completed',
            'CheckedIn': 'CheckedIn',
            'Overdue': 'Overdue',
            'NoShow': 'NoShow',
            'Abandoned': 'Abandoned',
            'External': 'External',
            'Conflict': 'Conflict'
        };

        const backendStatus = statusMap[statusString] || statusMap[statusString.toLowerCase()] || statusString;

        console.log('Sending request with status:', backendStatus);

        const response = await api.put(`/bookings/${bookingId}/status`, { 
            NewStatus: backendStatus,
            Notes: null // Optional notes field
        });
        return response.data;
    } catch (error) {
        console.error('Status Update Error:', error);
        return createErrorResponse(
            error.response?.data?.message || 'Không thể cập nhật trạng thái đặt chỗ.',
            'api',
            error.response?.data
        );
    }
};

/**
 * Get iCal settings for a space
 * @param {string} spaceId - Space ID
 * @returns {Promise} API response with iCal settings or error object
 */
export const getSpaceICalSettingsAPI = async (spaceId) => {
    try {
        if (!spaceId) {
            return createErrorResponse(
                'ID không gian không hợp lệ.',
                'validation'
            );
        }

        const response = await api.get(`/bookings/space/${spaceId}/ical-settings`);
        return response.data;
    } catch (error) {
        console.error('iCal Settings Error:', error);
        return createErrorResponse(
            error.response?.data?.message || 'Không thể tải cài đặt iCal.',
            'api',
            error.response?.data
        );
    }
};

/**
 * Sync iCal for a space
 * @param {string} spaceId - Space ID
 * @param {Object} settings - iCal sync settings
 * @returns {Promise} API response with sync result or error object
 */
export const syncICalAPI = async (spaceId, settings) => {
    try {
        if (!spaceId) {
            return createErrorResponse(
                'ID không gian không hợp lệ.',
                'validation'
            );
        }

        if (!settings?.url) {
            return createErrorResponse(
                'URL iCal không hợp lệ.',
                'validation'
            );
        }

        const response = await api.post(`/bookings/space/${spaceId}/ical-sync`, settings);
        return response.data;
    } catch (error) {
        console.error('iCal Sync Error:', error);
        return createErrorResponse(
            error.response?.data?.message || 'Không thể đồng bộ dữ liệu iCal.',
            'api',
            error.response?.data
        );
    }
};

/**
 * Check for booking conflicts in a space
 * @param {string} spaceId - Space ID
 * @param {Object} booking - Booking details to check
 * @returns {Promise} API response with conflict check result or error object
 */
export const checkBookingConflictsAPI = async (spaceId, booking) => {
    try {
        if (!spaceId) {
            return createErrorResponse(
                'ID không gian không hợp lệ.',
                'validation'
            );
        }

        if (!booking?.startTime || !booking?.endTime) {
            return createErrorResponse(
                'Thời gian đặt chỗ không hợp lệ.',
                'validation'
            );
        }

        const response = await api.post(`/bookings/space/${spaceId}/conflicts`, booking);
        return response.data;
    } catch (error) {
        console.error('Conflict Check Error:', error);
        return createErrorResponse(
            error.response?.data?.message || 'Không thể kiểm tra xung đột lịch đặt chỗ.',
            'api',
            error.response?.data
        );
    }
};

/**
 * Get owner booking statistics
 * @param {Object} params - Date range and other parameters
 * @returns {Promise} API response with booking statistics
 */
export const getOwnerBookingStatsAPI = async (params = {}) => {
    try {
        const queryString = buildQueryString(params);
        // For now, return mock stats since backend doesn't have this endpoint
        return {
            totalBookings: 0,
            upcomingBookings: 0,
            completedBookings: 0,
            cancelledBookings: 0,
            conflictedBookings: 0,
        };
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Export owner bookings
 * @param {Object} params - Export parameters
 * @returns {Promise} API response with export data
 */
export const exportOwnerBookingsAPI = async (params = {}) => {
    try {
        // For now, return empty blob since backend doesn't have this endpoint
        return new Blob(['No export available'], { type: 'text/plain' });
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Add a new booking by owner
 * @param {Object} bookingData - New booking data
 * @returns {Promise} API response with created booking
 */
/**
 * Create a new booking for owner
 * @param {Object} bookingData - Booking data including spaceId, startTime, endTime, etc.
 * @returns {Promise} API response with created booking data
 */
export const addOwnerBookingAPI = async (bookingData) => {
    try {
        console.log('Creating owner booking:', bookingData);
        const response = await api.post('/bookings/owner', bookingData);
        return response.data;
    } catch (error) {
        console.error('Failed to create owner booking:', error);
        throw error.response?.data || error.message;
    }
};

/**
 * Update iCal settings for a space
 * @param {string|number} spaceId - Space ID
 * @param {Object} settings - iCal settings data
 * @returns {Promise} API response with updated settings
 */
export const updateSpaceICalSettingsAPI = async (spaceId, settings) => {
    try {
        if (!spaceId) {
            return createErrorResponse(
                'ID không gian không hợp lệ.',
                'validation'
            );
        }

        if (!settings) {
            return createErrorResponse(
                'Thiếu thông tin cài đặt iCal.',
                'validation'
            );
        }

        const response = await api.put(`/bookings/space/${spaceId}/ical-settings`, settings);
        return response.data;
    } catch (error) {
        console.error('iCal Settings Update Error:', error);
        return createErrorResponse(
            error.response?.data?.message || 'Không thể cập nhật cài đặt iCal.',
            'api',
            error.response?.data
        );
    }
};

/**
 * Contact customer about a booking
 * @param {string|number} bookingId - Booking ID
 * @param {Object} messageData - Message data to send
 * @returns {Promise} API response with message status
 */
export const contactCustomerAPI = async (bookingId, messageData) => {
    try {
        const response = await api.post(`/bookings/${bookingId}/contact`, messageData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get customer information
 * @param {string|number} customerId - Customer ID
 * @returns {Promise} API response with customer information
 */
export const getCustomerInfoAPI = async (customerId) => {
    try {
        const response = await api.get(`/owner/customers/${customerId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get space availability
 * @param {string|number} spaceId - Space ID
 * @param {Object} params - Date range and other parameters
 * @returns {Promise} API response with space availability data
 */
export const getSpaceAvailabilityAPI = async (spaceId, params = {}) => {
    try {
        const queryString = buildQueryString(params);
        const response = await api.get(`/bookings/space/${spaceId}?${queryString}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Generate a display name from user ID
 * @param {string} userId - User ID to generate name from
 * @returns {string} Display name
 */
const generateDisplayName = (userId) => {
    if (!userId) return 'Chưa có tên';
    // Create a simple display name from the first 8 characters of UUID
    const shortId = userId.toString().substring(0, 8);
    return `Khách hàng ${shortId}`;
};

export default {
    fetchOwnerBookingsAPI,
    getOwnerBookingDetailsAPI,
    updateBookingStatusAPI,
    getOwnerBookingStatsAPI,
    exportOwnerBookingsAPI,
    addOwnerBookingAPI,
    updateSpaceICalSettingsAPI,
    getSpaceICalSettingsAPI,
    contactCustomerAPI,
    getCustomerInfoAPI,
    getSpaceAvailabilityAPI,
};
