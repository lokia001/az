// src/features/ownerCustomerManagement/services/ownerCustomerApi.js
import api from '../../../services/api';

/**
 * Generate customer display name from user ID
 * @param {string} userId - User ID
 * @returns {string} Display name for customer
 */
const generateCustomerDisplayName = (userId) => {
    if (!userId) return 'Khách hàng';
    const shortId = userId.toString().substring(0, 8);
    return `Khách hàng ${shortId}`;
};

/**
 * Calculate customer statistics from bookings
 * @param {Array} bookings - Array of bookings for the customer
 * @returns {Object} Customer statistics
 */
const calculateCustomerStats = (bookings) => {
    if (!bookings || bookings.length === 0) {
        return {
            totalBookings: 0,
            completedBookings: 0,
            cancelledBookings: 0,
            totalSpent: 0,
            lastBookingDate: null
        };
    }

    const stats = {
        totalBookings: bookings.length,
        completedBookings: bookings.filter(b => b.status === 'Completed').length,
        cancelledBookings: bookings.filter(b => b.status === 'Cancelled').length,
        totalSpent: bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
        lastBookingDate: null
    };

    // Find the most recent booking date
    const sortedBookings = bookings.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    if (sortedBookings.length > 0) {
        stats.lastBookingDate = sortedBookings[0].startTime;
    }

    return stats;
};

/**
 * Fetch customers for owner's spaces using the dedicated backend endpoint
 * @param {string} ownerId - Owner ID
 * @param {Object} params - Query parameters
 * @returns {Promise} API response with customers data
 */
export const fetchOwnerCustomersAPI = async (ownerId, params = {}) => {
    try {
        if (!ownerId) {
            throw new Error('Owner ID is required');
        }

        console.log('fetchOwnerCustomersAPI - ownerId:', ownerId);
        console.log('fetchOwnerCustomersAPI - params:', params);

        // Use the dedicated owner customers endpoint
        const response = await api.get('/owner/customers');
        console.log('Owner customers response:', response);
        
        let customers = response.data?.data || [];
        console.log('Owner customers:', customers);

        // Apply frontend filters
        if (params.search) {
            const searchTerm = params.search.toLowerCase();
            customers = customers.filter(customer =>
                customer.name?.toLowerCase().includes(searchTerm) ||
                customer.fullName?.toLowerCase().includes(searchTerm) ||
                customer.username?.toLowerCase().includes(searchTerm) ||
                customer.email?.toLowerCase().includes(searchTerm) ||
                customer.phone?.toLowerCase().includes(searchTerm)
            );
        }

        if (params.bookingStatus && params.bookingStatus !== 'all') {
            customers = customers.filter(customer => {
                switch (params.bookingStatus) {
                    case 'active':
                        return customer.bookings?.some(b => 
                            b.status === 'Confirmed' || b.status === 'Pending'
                        );
                    case 'completed':
                        return customer.completedBookings > 0;
                    case 'cancelled':
                        return customer.cancelledBookings > 0;
                    default:
                        return true;
                }
            });
        }

        // Sort by last booking date (most recent first)
        customers.sort((a, b) => {
            if (!a.lastBooking && !b.lastBooking) return 0;
            if (!a.lastBooking) return 1;
            if (!b.lastBooking) return -1;
            return new Date(b.lastBooking) - new Date(a.lastBooking);
        });

        // Apply pagination
        const pageSize = parseInt(params.pageSize) || 10;
        const pageNumber = parseInt(params.pageNumber) || 1;
        const totalCount = customers.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        const startIndex = (pageNumber - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedCustomers = customers.slice(startIndex, endIndex);

        return {
            data: paginatedCustomers,
            totalCount,
            pageNumber,
            pageSize,
            totalPages
        };

    } catch (error) {
        console.error('Error fetching owner customers:', error);
        throw error;
    }
};

/**
 * Get detailed customer information including booking history
 * @param {string} customerId - Customer ID (userId)
 * @param {string} ownerId - Owner ID (not needed with dedicated endpoint)
 * @returns {Promise} Customer details with booking history
 */
export const getCustomerDetailsAPI = async (customerId, ownerId) => {
    try {
        console.log('getCustomerDetailsAPI - customerId:', customerId);
        
        // Use the dedicated customer detail endpoint
        const response = await api.get(`/owner/customers/${customerId}`);
        console.log('Customer details response:', response);
        
        const customer = response.data;
        
        if (!customer) {
            throw new Error('Customer not found');
        }

        // Return detailed customer info with additional processing if needed
        return {
            ...customer,
            bookingHistory: customer.bookings ? customer.bookings.sort((a, b) => 
                new Date(b.startTime) - new Date(a.startTime)
            ) : []
        };
    } catch (error) {
        console.error('Error fetching customer details:', error);
        throw error;
    }
};

export default {
    fetchOwnerCustomersAPI,
    getCustomerDetailsAPI
};
