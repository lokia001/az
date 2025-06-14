// src/services/userBookingApi.js
// Utility to get bookings for the current user (mock version)
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/slices/authSlice';
import { initialBookings } from '../pages/BookingManagementPage';

/**
 * Returns bookings for the current user and a given spaceId with status 'Checked-Out'.
 * @param {string} userId
 * @param {string} spaceId
 * @returns {Array} Array of eligible bookings
 */
export function getCompletedBookingsForUserAndSpace(user, spaceId) {
    if (!user) return [];
    // Try to match by id, username, or name (for mock/demo flexibility)
    return initialBookings.filter(
        b => b.spaceId === spaceId && b.status === 'Checked-Out' && (
            (user.id && b.customerId && b.customerId === user.id) ||
            (user.username && b.customerUsername && b.customerUsername === user.username) ||
            (user.name && b.customerName && b.customerName.toLowerCase() === user.name.toLowerCase())
        )
    );
}

// Optionally, you could add a hook for React usage
export function useCompletedBookingsForSpace(spaceId) {
    const currentUser = useSelector(selectCurrentUser);
    if (!currentUser) return [];
    return getCompletedBookingsForUserAndSpace(currentUser, spaceId);
}
