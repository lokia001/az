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
        
        console.log('Fetching bookings:', `/api/bookings/space/${spaceId}?${queryString}`);
        const response = await api.get(`/api/bookings/space/${spaceId}?${queryString}`);
        
        if (!response.data) {
            return createErrorResponse(
                'Không có dữ liệu đặt chỗ.',
                'empty',
                { spaceId }
            );
        }

        // Format and validate data from backend
        let items = Array.isArray(response.data) ? response.data : [];
        
        // Map data to user-friendly format
        items = items.map(booking => ({
            id: booking.id,
            customer: {
                name: booking.customer?.name || 'Chưa có tên',
                email: booking.customer?.email || 'Chưa có email',
                phone: booking.customer?.phone || 'Chưa có SĐT'
            },
            space: {
                name: booking.space?.name || 'Chưa có tên không gian',
                type: booking.space?.type || 'Không gian làm việc'
            },
            time: {
                start: new Date(booking.startTime).toLocaleString('vi-VN'),
                end: new Date(booking.endTime).toLocaleString('vi-VN'),
                duration: booking.duration || '0 giờ'
            },
            payment: {
                total: new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(booking.totalPrice || 0),
                status: booking.paymentStatus || 'Chưa thanh toán'
            },
            status: {
                code: booking.status || 'pending',
                text: getStatusText(booking.status || 'pending')
            },
            rawData: booking // Giữ lại dữ liệu gốc cho các thao tác khác
        }));
        
        if (items.length === 0) {
            return {
                items: [],
                message: 'Chưa có đặt chỗ nào cho không gian này',
                totalItems: 0,
                currentPage: otherFilters.PageNumber || 1,
                itemsPerPage: otherFilters.PageSize || 10,
                totalPages: 0
            };
        }

        return {
            items,
            totalItems: items.length,
            currentPage: otherFilters.PageNumber || 1,
            itemsPerPage: otherFilters.PageSize || 10,
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
        return response.data;
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

        const response = await api.patch(`/api/bookings/${bookingId}/status`, { status });
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

        const response = await api.get(`/api/bookings/space/${spaceId}/ical-settings`);
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

        const response = await api.post(`/api/bookings/space/${spaceId}/ical-sync`, settings);
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

        const response = await api.post(`/api/bookings/space/${spaceId}/conflicts`, booking);
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
 * Export owner bookings data
 * @param {Object} filters - Export filters and options
 * @returns {Promise} API response with export data blob
 */
export const exportOwnerBookingsAPI = async (filters = {}) => {
    try {
        const queryString = buildQueryString(filters);
        const response = await api.get(`/bookings/export?${queryString}`, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Add a new booking by owner
 * @param {Object} bookingData - New booking data
 * @returns {Promise} API response with created booking
 */
export const addOwnerBookingAPI = async (bookingData) => {
    try {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    } catch (error) {
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

        const response = await api.put(`/api/bookings/space/${spaceId}/ical-settings`, settings);
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

export default {
    fetchOwnerBookingsAPI,
    getOwnerBookingDetailsAPI,
    updateBookingStatusAPI,
    // Stats and export APIs removed as they're not available in backend
    addOwnerBookingAPI,
    updateSpaceICalSettingsAPI,
    getSpaceICalSettingsAPI,
    contactCustomerAPI,
    getCustomerInfoAPI,
    getSpaceAvailabilityAPI,
};
