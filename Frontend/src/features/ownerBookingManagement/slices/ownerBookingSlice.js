// src/features/ownerBookingManagement/slices/ownerBookingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchOwnerBookingsAPI,
    updateBookingStatusAPI,
    getOwnerBookingStatsAPI,
    exportOwnerBookingsAPI
} from '../services/ownerBookingApi';

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
    bookingStats: null,
    statsStatus: 'idle',
    statsError: null,
    updateStatus: 'idle',
    updateError: null,
    exportStatus: 'idle',
    exportError: null,
};

export const fetchOwnerBookings = createAsyncThunk(
    'ownerBooking/fetchBookings',
    async (params = {}, { getState, rejectWithValue }) => {
        const state = getState().ownerBooking;
        const apiParams = {
            ...state.filters,
            PageNumber: state.pagination.PageNumber,
            PageSize: state.pagination.PageSize,
            ...params,
        };

        try {
            const response = await fetchOwnerBookingsAPI(apiParams);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch owner bookings.');
        }
    }
);

export const fetchOwnerBookingStats = createAsyncThunk(
    'ownerBooking/fetchStats',
    async (dateRange = {}, { rejectWithValue }) => {
        try {
            const response = await getOwnerBookingStatsAPI(dateRange);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch booking statistics.');
        }
    }
);

export const updateBookingStatus = createAsyncThunk(
    'ownerBooking/updateStatus',
    async ({ bookingId, newStatus, reason }, { dispatch, rejectWithValue }) => {
        try {
            const response = await updateBookingStatusAPI(bookingId, newStatus, reason);
            dispatch(fetchOwnerBookings()); // Refresh the list
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update booking status.');
        }
    }
);

export const exportOwnerBookings = createAsyncThunk(
    'ownerBooking/exportBookings',
    async (params = {}, { getState, rejectWithValue }) => {
        const state = getState().ownerBooking;
        const exportParams = {
            ...state.filters,
            ...params,
        };

        try {
            const response = await exportOwnerBookingsAPI(exportParams);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to export bookings.');
        }
    }
);

const ownerBookingSlice = createSlice({
    name: 'ownerBooking',
    initialState,
    reducers: {
        setOwnerBookingFilter: (state, action) => {
            const { filterName, value } = action.payload;
            state.filters[filterName] = value;
            state.pagination.PageNumber = 1;
            state.status = 'idle';
        },
        setOwnerBookingPage: (state, action) => {
            state.pagination.PageNumber = action.payload;
            state.status = 'idle';
        },
        resetOwnerBookingFilters: (state) => {
            state.filters = { ...initialFilters };
            state.pagination.PageNumber = 1;
            state.status = 'idle';
        },
        clearOwnerBookingErrors: (state) => {
            state.error = null;
            state.statsError = null;
            state.updateError = null;
            state.exportError = null;
        },
        clearUpdateStatus: (state) => {
            state.updateStatus = 'idle';
            state.updateError = null;
        },
        clearExportStatus: (state) => {
            state.exportStatus = 'idle';
            state.exportError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch owner bookings
            .addCase(fetchOwnerBookings.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchOwnerBookings.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.bookings = action.payload.items;
                state.pagination = {
                    PageNumber: action.payload.pageNumber,
                    PageSize: action.payload.pageSize,
                    totalCount: action.payload.totalCount,
                    totalPages: action.payload.totalPages,
                };
            })
            .addCase(fetchOwnerBookings.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.bookings = [];
            })
            // Fetch booking stats
            .addCase(fetchOwnerBookingStats.pending, (state) => {
                state.statsStatus = 'loading';
                state.statsError = null;
            })
            .addCase(fetchOwnerBookingStats.fulfilled, (state, action) => {
                state.statsStatus = 'succeeded';
                state.bookingStats = action.payload;
            })
            .addCase(fetchOwnerBookingStats.rejected, (state, action) => {
                state.statsStatus = 'failed';
                state.statsError = action.payload;
            })
            // Update booking status
            .addCase(updateBookingStatus.pending, (state) => {
                state.updateStatus = 'loading';
                state.updateError = null;
            })
            .addCase(updateBookingStatus.fulfilled, (state) => {
                state.updateStatus = 'succeeded';
            })
            .addCase(updateBookingStatus.rejected, (state, action) => {
                state.updateStatus = 'failed';
                state.updateError = action.payload;
            })
            // Export bookings
            .addCase(exportOwnerBookings.pending, (state) => {
                state.exportStatus = 'loading';
                state.exportError = null;
            })
            .addCase(exportOwnerBookings.fulfilled, (state) => {
                state.exportStatus = 'succeeded';
            })
            .addCase(exportOwnerBookings.rejected, (state, action) => {
                state.exportStatus = 'failed';
                state.exportError = action.payload;
            });
    },
});

export const {
    setOwnerBookingFilter,
    setOwnerBookingPage,
    resetOwnerBookingFilters,
    clearOwnerBookingErrors,
    clearUpdateStatus,
    clearExportStatus,
} = ownerBookingSlice.actions;

// Selectors
export const selectOwnerBookings = (state) => state.ownerBooking.bookings;
export const selectOwnerBookingFilters = (state) => state.ownerBooking.filters;
export const selectOwnerBookingPagination = (state) => state.ownerBooking.pagination;
export const selectOwnerBookingStatus = (state) => state.ownerBooking.status;
export const selectOwnerBookingError = (state) => state.ownerBooking.error;
export const selectOwnerBookingStats = (state) => state.ownerBooking.bookingStats;
export const selectOwnerBookingStatsStatus = (state) => state.ownerBooking.statsStatus;
export const selectOwnerBookingStatsError = (state) => state.ownerBooking.statsError;
export const selectOwnerBookingUpdateStatus = (state) => state.ownerBooking.updateStatus;
export const selectOwnerBookingUpdateError = (state) => state.ownerBooking.updateError;
export const selectOwnerBookingExportStatus = (state) => state.ownerBooking.exportStatus;
export const selectOwnerBookingExportError = (state) => state.ownerBooking.exportError;

export default ownerBookingSlice.reducer;
