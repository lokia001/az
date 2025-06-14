// src/features/booking/slices/bookingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchBookingsAPI,
    createBookingAPI,
    updateBookingAPI,
    cancelBookingAPI,
    getBookingByIdAPI
} from '../services/bookingApi';

const initialFilters = {
    customerName: '',
    spaceName: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    spaceType: '',
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
    currentBooking: null,
    currentBookingStatus: 'idle',
    currentBookingError: null,
    createStatus: 'idle',
    createError: null,
    updateStatus: 'idle',
    updateError: null,
    cancelStatus: 'idle',
    cancelError: null,
};

export const fetchBookings = createAsyncThunk(
    'booking/fetchBookings',
    async (params = {}, { getState, rejectWithValue }) => {
        const state = getState().booking;
        const apiParams = {
            ...state.filters,
            PageNumber: state.pagination.PageNumber,
            PageSize: state.pagination.PageSize,
            ...params,
        };

        try {
            const response = await fetchBookingsAPI(apiParams);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch bookings.');
        }
    }
);

export const fetchBookingById = createAsyncThunk(
    'booking/fetchBookingById',
    async (bookingId, { rejectWithValue }) => {
        try {
            const response = await getBookingByIdAPI(bookingId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch booking details.');
        }
    }
);

export const createBooking = createAsyncThunk(
    'booking/createBooking',
    async (bookingData, { dispatch, rejectWithValue }) => {
        try {
            const response = await createBookingAPI(bookingData);
            dispatch(fetchBookings()); // Refresh the list
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create booking.');
        }
    }
);

export const updateBooking = createAsyncThunk(
    'booking/updateBooking',
    async ({ bookingId, bookingData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await updateBookingAPI(bookingId, bookingData);
            dispatch(fetchBookings()); // Refresh the list
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update booking.');
        }
    }
);

export const cancelBooking = createAsyncThunk(
    'booking/cancelBooking',
    async ({ bookingId, reason }, { dispatch, rejectWithValue }) => {
        try {
            const response = await cancelBookingAPI(bookingId, reason);
            dispatch(fetchBookings()); // Refresh the list
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to cancel booking.');
        }
    }
);

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        setBookingFilter: (state, action) => {
            const { filterName, value } = action.payload;
            state.filters[filterName] = value;
            state.pagination.PageNumber = 1;
            state.status = 'idle';
        },
        setBookingPage: (state, action) => {
            state.pagination.PageNumber = action.payload;
            state.status = 'idle';
        },
        resetBookingFilters: (state) => {
            state.filters = { ...initialFilters };
            state.pagination.PageNumber = 1;
            state.status = 'idle';
        },
        clearBookingErrors: (state) => {
            state.error = null;
            state.currentBookingError = null;
            state.createError = null;
            state.updateError = null;
            state.cancelError = null;
        },
        clearCurrentBooking: (state) => {
            state.currentBooking = null;
            state.currentBookingStatus = 'idle';
            state.currentBookingError = null;
        },
        clearCreateStatus: (state) => {
            state.createStatus = 'idle';
            state.createError = null;
        },
        clearUpdateStatus: (state) => {
            state.updateStatus = 'idle';
            state.updateError = null;
        },
        clearCancelStatus: (state) => {
            state.cancelStatus = 'idle';
            state.cancelError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch bookings
            .addCase(fetchBookings.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchBookings.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.bookings = action.payload.items;
                state.pagination = {
                    PageNumber: action.payload.pageNumber,
                    PageSize: action.payload.pageSize,
                    totalCount: action.payload.totalCount,
                    totalPages: action.payload.totalPages,
                };
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.bookings = [];
            })
            // Fetch booking by ID
            .addCase(fetchBookingById.pending, (state) => {
                state.currentBookingStatus = 'loading';
                state.currentBookingError = null;
            })
            .addCase(fetchBookingById.fulfilled, (state, action) => {
                state.currentBookingStatus = 'succeeded';
                state.currentBooking = action.payload;
            })
            .addCase(fetchBookingById.rejected, (state, action) => {
                state.currentBookingStatus = 'failed';
                state.currentBookingError = action.payload;
            })
            // Create booking
            .addCase(createBooking.pending, (state) => {
                state.createStatus = 'loading';
                state.createError = null;
            })
            .addCase(createBooking.fulfilled, (state) => {
                state.createStatus = 'succeeded';
            })
            .addCase(createBooking.rejected, (state, action) => {
                state.createStatus = 'failed';
                state.createError = action.payload;
            })
            // Update booking
            .addCase(updateBooking.pending, (state) => {
                state.updateStatus = 'loading';
                state.updateError = null;
            })
            .addCase(updateBooking.fulfilled, (state) => {
                state.updateStatus = 'succeeded';
            })
            .addCase(updateBooking.rejected, (state, action) => {
                state.updateStatus = 'failed';
                state.updateError = action.payload;
            })
            // Cancel booking
            .addCase(cancelBooking.pending, (state) => {
                state.cancelStatus = 'loading';
                state.cancelError = null;
            })
            .addCase(cancelBooking.fulfilled, (state) => {
                state.cancelStatus = 'succeeded';
            })
            .addCase(cancelBooking.rejected, (state, action) => {
                state.cancelStatus = 'failed';
                state.cancelError = action.payload;
            });
    },
});

export const {
    setBookingFilter,
    setBookingPage,
    resetBookingFilters,
    clearBookingErrors,
    clearCurrentBooking,
    clearCreateStatus,
    clearUpdateStatus,
    clearCancelStatus,
} = bookingSlice.actions;

// Selectors
export const selectAllBookings = (state) => state.booking.bookings;
export const selectBookingFilters = (state) => state.booking.filters;
export const selectBookingPagination = (state) => state.booking.pagination;
export const selectBookingStatus = (state) => state.booking.status;
export const selectBookingError = (state) => state.booking.error;
export const selectCurrentBooking = (state) => state.booking.currentBooking;
export const selectCurrentBookingStatus = (state) => state.booking.currentBookingStatus;
export const selectCurrentBookingError = (state) => state.booking.currentBookingError;
export const selectCreateStatus = (state) => state.booking.createStatus;
export const selectCreateError = (state) => state.booking.createError;
export const selectUpdateStatus = (state) => state.booking.updateStatus;
export const selectUpdateError = (state) => state.booking.updateError;
export const selectCancelStatus = (state) => state.booking.cancelStatus;
export const selectCancelError = (state) => state.booking.cancelError;

export default bookingSlice.reducer;
