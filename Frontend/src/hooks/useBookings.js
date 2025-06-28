import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/slices/authSlice';
import apiClient from '../services/apiClient';

export const useBookings = (filters) => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = useSelector(selectCurrentUser); // Get current user from Redux state

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Construct query parameters from filters
        const params = new URLSearchParams();
        if (filters.status !== 'all') {
          params.append('status', filters.status);
        }
        if (filters.dateRange.start) {
          params.append('startDate', filters.dateRange.start.toISOString());
        }
        if (filters.dateRange.end) {
          params.append('endDate', filters.dateRange.end.toISOString());
        }
        params.append('sortBy', filters.sortBy);

        // Use apiClient which automatically includes the auth token
        const response = await apiClient.get(`/bookings/my-bookings?${params.toString()}`);
        setBookings(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if user is authenticated
    if (currentUser) {
      fetchBookings();
    }
  }, [filters, currentUser]);

  const cancelBooking = async (bookingId) => {
    try {
      await apiClient.post(`/bookings/${bookingId}/cancel`);

      // Update the local state to reflect the cancellation
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' }
          : booking
      ));

      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const submitReview = async (bookingId, reviewData) => {
    try {
      await apiClient.post(`/bookings/${bookingId}/review`, reviewData);

      // Update the local state to reflect the review submission
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, hasReview: true }
          : booking
      ));

      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const downloadInvoice = async (bookingId) => {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}/invoice`, {
        responseType: 'blob'
      });

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to download invoice');
    }
  };

  return {
    bookings,
    isLoading,
    error,
    cancelBooking,
    submitReview,
    downloadInvoice
  };
};
