// src/features/myBookings/slices/myBookingsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchMyBookingsAPI,
    cancelMyBookingAPI,
    submitBookingReviewAPI,
    getMyBookingHistoryAPI
} from '../services/myBookingsApi';

const initialFilters = {
    status: '',
    dateFrom: '',
    dateTo: '',
    spaceName: '',
};

const initialState = {
    bookings: [],
    filters: { ...initialFilters },
    pagination: {
        PageNumber: 1,
        PageSize: 10,
        totalCount: 0,
        totalPages: 0,
    },
    status: 'idle',
    error: null,
    bookingHistory: [],
    historyStatus: 'idle',
    historyError: null,
    cancelStatus: 'idle',
    cancelError: null,
    reviewStatus: 'idle',
    reviewError: null,
};

export const fetchMyBookings = createAsyncThunk(
    'myBookings/fetchBookings',
    async (params = {}, { getState, rejectWithValue }) => {
        const state = getState().myBookings;
        const apiParams = {
            ...state.filters,
            PageNumber: state.pagination.PageNumber,
            PageSize: state.pagination.PageSize,
            ...params,
        };

        try {
            const response = await fetchMyBookingsAPI(apiParams);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch my bookings.');
        }
    }
);

export const fetchMyBookingHistory = createAsyncThunk(
    'myBookings/fetchHistory',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await getMyBookingHistoryAPI(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch booking history.');
        }
    }
);

export const cancelMyBooking = createAsyncThunk(
    'myBookings/cancelBooking',
    async ({ bookingId, reason }, { dispatch, rejectWithValue }) => {
        try {
            const response = await cancelMyBookingAPI(bookingId, reason);
            dispatch(fetchMyBookings()); // Refresh the list
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to cancel booking.');
        }
    }
);

export const submitBookingReview = createAsyncThunk(
    'myBookings/submitReview',
    async ({ bookingId, reviewData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await submitBookingReviewAPI(bookingId, reviewData);
            dispatch(fetchMyBookings()); // Refresh the list to update review status
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to submit review.');
        }
    }
);

const myBookingsSlice = createSlice({
    name: 'myBookings',
    initialState,
    reducers: {
        setMyBookingFilter: (state, action) => {
            const { filterName, value } = action.payload;
            state.filters[filterName] = value;
            state.pagination.PageNumber = 1;
            state.status = 'idle';
        },
        setMyBookingPage: (state, action) => {
            state.pagination.PageNumber = action.payload;
            state.status = 'idle';
        },
        resetMyBookingFilters: (state) => {
            state.filters = { ...initialFilters };
            state.pagination.PageNumber = 1;
            state.status = 'idle';
        },
        clearMyBookingErrors: (state) => {
            state.error = null;
            state.historyError = null;
            state.cancelError = null;
            state.reviewError = null;
        },
        clearCancelStatus: (state) => {
            state.cancelStatus = 'idle';
            state.cancelError = null;
        },
        clearReviewStatus: (state) => {
            state.reviewStatus = 'idle';
            state.reviewError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch my bookings
            .addCase(fetchMyBookings.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchMyBookings.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.bookings = action.payload.items;
                state.pagination = {
                    PageNumber: action.payload.pageNumber,
                    PageSize: action.payload.pageSize,
                    totalCount: action.payload.totalCount,
                    totalPages: action.payload.totalPages,
                };
            })
            .addCase(fetchMyBookings.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.bookings = [];
            })
            // Fetch booking history
            .addCase(fetchMyBookingHistory.pending, (state) => {
                state.historyStatus = 'loading';
                state.historyError = null;
            })
            .addCase(fetchMyBookingHistory.fulfilled, (state, action) => {
                state.historyStatus = 'succeeded';
                state.bookingHistory = action.payload;
            })
            .addCase(fetchMyBookingHistory.rejected, (state, action) => {
                state.historyStatus = 'failed';
                state.historyError = action.payload;
            })
            // Cancel booking
            .addCase(cancelMyBooking.pending, (state) => {
                state.cancelStatus = 'loading';
                state.cancelError = null;
            })
            .addCase(cancelMyBooking.fulfilled, (state) => {
                state.cancelStatus = 'succeeded';
            })
            .addCase(cancelMyBooking.rejected, (state, action) => {
                state.cancelStatus = 'failed';
                state.cancelError = action.payload;
            })
            // Submit review
            .addCase(submitBookingReview.pending, (state) => {
                state.reviewStatus = 'loading';
                state.reviewError = null;
            })
            .addCase(submitBookingReview.fulfilled, (state) => {
                state.reviewStatus = 'succeeded';
            })
            .addCase(submitBookingReview.rejected, (state, action) => {
                state.reviewStatus = 'failed';
                state.reviewError = action.payload;
            });
    },
});

export const {
    setMyBookingFilter,
    setMyBookingPage,
    resetMyBookingFilters,
    clearMyBookingErrors,
    clearCancelStatus,
    clearReviewStatus,
} = myBookingsSlice.actions;

// Selectors
export const selectMyBookings = (state) => state.myBookings.bookings;
export const selectMyBookingFilters = (state) => state.myBookings.filters;
export const selectMyBookingPagination = (state) => state.myBookings.pagination;
export const selectMyBookingStatus = (state) => state.myBookings.status;
export const selectMyBookingError = (state) => state.myBookings.error;
export const selectMyBookingHistory = (state) => state.myBookings.bookingHistory;
export const selectMyBookingHistoryStatus = (state) => state.myBookings.historyStatus;
export const selectMyBookingHistoryError = (state) => state.myBookings.historyError;
export const selectMyBookingCancelStatus = (state) => state.myBookings.cancelStatus;
export const selectMyBookingCancelError = (state) => state.myBookings.cancelError;
export const selectMyBookingReviewStatus = (state) => state.myBookings.reviewStatus;
export const selectMyBookingReviewError = (state) => state.myBookings.reviewError;

export default myBookingsSlice.reducer;
