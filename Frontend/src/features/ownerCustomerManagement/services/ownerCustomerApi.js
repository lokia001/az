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
 * Fetch customers for owner's spaces
 * @param {string} ownerId - Owner ID
 * @param {Object} params - Query parameters
 * @returns {Promise} API response with customers data
 */
export const fetchOwnerCustomersAPI = async (ownerId, params = {}) => {
    try {
        if (!ownerId) {
            throw new Error('Owner ID is required');
        }

        // First, get owner's spaces
        const spacesResponse = await api.get(`/owner/spaces/owner/${ownerId}`);
        const ownerSpaces = spacesResponse.data || [];

        if (ownerSpaces.length === 0) {
            return {
                data: [],
                totalCount: 0,
                pageNumber: 1,
                pageSize: params.pageSize || 10,
                totalPages: 0
            };
        }

        // Get all bookings for owner's spaces
        const allBookings = [];
        
        for (const space of ownerSpaces) {
            try {
                const bookingsResponse = await api.get(`/bookings/space/${space.id}`);
                const spaceBookings = bookingsResponse.data || [];
                
                // Add space info to each booking
                spaceBookings.forEach(booking => {
                    booking.spaceName = space.name;
                    booking.spaceId = space.id;
                });
                
                allBookings.push(...spaceBookings);
            } catch (error) {
                console.warn(`Failed to fetch bookings for space ${space.id}:`, error);
            }
        }

        // Group bookings by userId to create customer records
        const customerMap = new Map();
        
        allBookings.forEach(booking => {
            const userId = booking.userId;
            if (!userId) return;

            if (!customerMap.has(userId)) {
                customerMap.set(userId, {
                    id: userId,
                    userId: userId,
                    name: generateCustomerDisplayName(userId),
                    email: 'Thông tin riêng tư', // Privacy protection
                    phone: 'Thông tin riêng tư', // Privacy protection
                    bookings: []
                });
            }

            customerMap.get(userId).bookings.push(booking);
        });

        // Convert to customers array with statistics
        let customers = Array.from(customerMap.values()).map(customer => {
            const stats = calculateCustomerStats(customer.bookings);
            
            return {
                id: customer.id,
                userId: customer.userId,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                totalBookings: stats.totalBookings,
                completedBookings: stats.completedBookings,
                cancelledBookings: stats.cancelledBookings,
                totalSpent: stats.totalSpent,
                lastBooking: stats.lastBookingDate,
                bookings: customer.bookings // Keep for details
            };
        });

        // Apply filters
        if (params.search) {
            const searchTerm = params.search.toLowerCase();
            customers = customers.filter(customer =>
                customer.name.toLowerCase().includes(searchTerm) ||
                customer.email.toLowerCase().includes(searchTerm) ||
                customer.phone.toLowerCase().includes(searchTerm)
            );
        }

        if (params.bookingStatus && params.bookingStatus !== 'all') {
            customers = customers.filter(customer => {
                switch (params.bookingStatus) {
                    case 'active':
                        return customer.bookings.some(b => 
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
 * @param {string} ownerId - Owner ID
 * @returns {Promise} Customer details with booking history
 */
export const getCustomerDetailsAPI = async (customerId, ownerId) => {
    try {
        // Get all customers and find the specific one
        const customersResponse = await fetchOwnerCustomersAPI(ownerId);
        const customer = customersResponse.data.find(c => c.id === customerId);
        
        if (!customer) {
            throw new Error('Customer not found');
        }

        // Return detailed customer info
        return {
            ...customer,
            bookingHistory: customer.bookings.sort((a, b) => 
                new Date(b.startTime) - new Date(a.startTime)
            )
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
