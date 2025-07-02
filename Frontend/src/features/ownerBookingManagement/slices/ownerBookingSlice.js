// src/features/ownerBookingManagement/slices/ownerBookingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchOwnerBookingsAPI,
    updateBookingStatusAPI,
    getOwnerBookingDetailsAPI,
    getOwnerBookingStatsAPI,
    exportOwnerBookingsAPI,
    addOwnerBookingAPI
} from '../services/ownerBookingApi';
import * as api from '../../../services/api';

const initialFilters = {
    searchTerm: '', // For searching by customer name, booking ID, space name
    status: '', // All, Confirmed, Pending, Cancelled, Completed, Conflicted, NoShow, External
    source: '', // All, Platform, Airbnb, GoogleCalendar, OtherICal
    dateFrom: '',
    dateTo: '',
    spaceId: '', // Required for the API call
    sort: 'startTime_desc',
};

const initialState = {
    // Main bookings data
    bookings: [],
    filters: { ...initialFilters },
    pagination: {
        PageNumber: 1,
        PageSize: 10,
        totalCount: 0,
        totalPages: 0,
    },

    // Overview stats
    stats: {
        totalBookings: 0,
        upcomingBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        conflictedBookings: 0,
    },

    // Statuses for different operations
    status: 'idle', // For main bookings fetch
    error: null,
    updateStatus: 'idle',
    updateError: null,
    createStatus: 'idle', // For creating new bookings
    createError: null,
    selectedBooking: null,
    selectedBookingStatus: 'idle',
    selectedBookingError: null,
    
    // iCal Integration
    icalSettings: {
        importUrls: [], // URLs from external platforms
        exportUrl: '', // Our platform's iCal URL for this space
        lastSync: null,
        autoSync: true,
    },
    icalStatus: 'idle',
    icalError: null,

    // Conflict Detection
    conflicts: [], // Array of booking conflicts
    lastConflictCheck: null,
    
    // View Mode
    viewMode: 'list', // 'list' or 'calendar'
};

// Thunk actions
export const fetchOwnerBookings = createAsyncThunk(
    'ownerBooking/fetchBookings',
    async (params = {}, { getState, rejectWithValue }) => {
        try {
            const state = getState().ownerBooking;
            if (!state.filters.spaceId) {
                return rejectWithValue('Space ID is required to fetch bookings.');
            }

            const apiParams = {
                spaceId: state.filters.spaceId,
                PageNumber: state.pagination.PageNumber,
                PageSize: state.pagination.PageSize,
                sort: state.filters.sort || 'startTime_desc',
                ...params,
            };

            console.log('Fetching with params:', apiParams);
            const response = await fetchOwnerBookingsAPI(apiParams);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch owner bookings.');
        }
    }
);

export const fetchOwnerBookingStats = createAsyncThunk(
    'ownerBooking/fetchStats',
    async (dateRange = {}, { getState, rejectWithValue }) => {
        try {
            const state = getState().ownerBooking;
            const params = {
                dateFrom: state.filters.dateFrom,
                dateTo: state.filters.dateTo,
                ...dateRange,
            };
            const response = await getOwnerBookingStatsAPI(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch booking statistics.');
        }
    }
);

export const updateBookingStatus = createAsyncThunk(
    'ownerBooking/updateStatus',
    async ({ bookingId, newStatus, reason }, { rejectWithValue }) => {
        try {
            // Pass newStatus directly as a string, not wrapped in an object
            const response = await updateBookingStatusAPI(bookingId, newStatus);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update booking status.');
        }
    }
);

export const exportOwnerBookings = createAsyncThunk(
    'ownerBooking/exportBookings',
    async (params = {}, { getState, rejectWithValue }) => {
        try {
            const state = getState().ownerBooking;
            const exportParams = {
                ...state.filters,
                ...params,
            };
            return await exportOwnerBookingsAPI(exportParams);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to export bookings.');
        }
    }
);

export const fetchBookingDetails = createAsyncThunk(
    'ownerBooking/fetchBookingDetails',
    async (bookingId, { rejectWithValue }) => {
        try {
            const response = await getOwnerBookingDetailsAPI(bookingId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch booking details.');
        }
    }
);

// Thunk actions for iCal integration
export const getIcalSettings = createAsyncThunk(
    'ownerBooking/getIcalSettings',
    async (spaceId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/api/bookings/space/${spaceId}/ical-settings`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to get iCal settings.');
        }
    }
);

export const updateIcalSettings = createAsyncThunk(
    'ownerBooking/updateIcalSettings',
    async ({ spaceId, settings }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/api/bookings/space/${spaceId}/ical-settings`, settings);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update iCal settings.');
        }
    }
);

export const syncIcalCalendars = createAsyncThunk(
    'ownerBooking/syncIcalCalendars',
    async (spaceId, { rejectWithValue }) => {
        try {
            const response = await api.post(`/api/bookings/space/${spaceId}/ical-sync`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to sync iCal calendars.');
        }
    }
);

// Conflict Detection Thunks
export const checkBookingConflicts = createAsyncThunk(
    'ownerBooking/checkConflicts',
    async (spaceId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/api/bookings/space/${spaceId}/conflicts`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to check booking conflicts.');
        }
    }
);

export const createOwnerBooking = createAsyncThunk(
    'ownerBooking/createBooking',
    async (bookingData, { rejectWithValue }) => {
        try {
            const response = await addOwnerBookingAPI(bookingData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create booking.');
        }
    }
);

// Slice
const ownerBookingSlice = createSlice({
    name: 'ownerBooking',
    initialState,
    reducers: {
        setOwnerBookingFilter: (state, action) => {
            const { filterName, value } = action.payload;
            state.filters[filterName] = value;
            // Reset to first page when filters change
            state.pagination.PageNumber = 1;
        },
        setOwnerBookingPage: (state, action) => {
            state.pagination.PageNumber = action.payload;
        },
        resetOwnerBookingFilters: (state) => {
            state.filters = { ...initialFilters };
            state.pagination.PageNumber = 1;
        },
        clearSelectedBooking: (state) => {
            state.selectedBooking = null;
            state.selectedBookingStatus = 'idle';
            state.selectedBookingError = null;
        },
        setViewMode: (state, action) => {
            state.viewMode = action.payload;
        },
        clearConflicts: (state) => {
            state.conflicts = [];
            state.lastConflictCheck = new Date().toISOString();
        },
        clearCreateStatus: (state) => {
            state.createStatus = 'idle';
            state.createError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch bookings
            .addCase(fetchOwnerBookings.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchOwnerBookings.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Handle both data.items and data.data for compatibility
                const items = action.payload.items || action.payload.data || [];
                state.bookings = items;
                
                // Handle pagination with both camelCase and PascalCase fields
                const pageNumber = action.payload.pageNumber || action.payload.PageNumber;
                const pageSize = action.payload.pageSize || action.payload.PageSize;
                const totalCount = action.payload.totalCount || action.payload.TotalCount;
                const totalPages = action.payload.totalPages || action.payload.TotalPages;

                state.pagination = {
                    PageNumber: parseInt(pageNumber) || 1,
                    PageSize: parseInt(pageSize) || 10,
                    totalCount: parseInt(totalCount) || 0,
                    totalPages: parseInt(totalPages) || 0
                };
                state.error = null;
            })
            .addCase(fetchOwnerBookings.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Fetch stats
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
            // Update status
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
            // Export
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
            })
            // Fetch booking details
            .addCase(fetchBookingDetails.pending, (state) => {
                state.selectedBookingStatus = 'loading';
                state.selectedBookingError = null;
            })
            .addCase(fetchBookingDetails.fulfilled, (state, action) => {
                state.selectedBookingStatus = 'succeeded';
                state.selectedBooking = action.payload;
            })
            .addCase(fetchBookingDetails.rejected, (state, action) => {
                state.selectedBookingStatus = 'failed';
                state.selectedBookingError = action.payload;
            })
            // iCal Settings
            .addCase(getIcalSettings.pending, (state) => {
                state.icalStatus = 'loading';
                state.icalError = null;
            })
            .addCase(getIcalSettings.fulfilled, (state, action) => {
                state.icalStatus = 'succeeded';
                state.icalSettings = action.payload;
            })
            .addCase(getIcalSettings.rejected, (state, action) => {
                state.icalStatus = 'failed';
                state.icalError = action.payload;
            })

            // iCal Sync
            .addCase(syncIcalCalendars.pending, (state) => {
                state.icalStatus = 'syncing';
                state.icalError = null;
            })
            .addCase(syncIcalCalendars.fulfilled, (state, action) => {
                state.icalStatus = 'succeeded';
                state.icalSettings.lastSync = new Date().toISOString();
                // After sync, update bookings list and check conflicts
                state.status = 'loading'; // This will trigger a re-fetch of bookings
            })
            .addCase(syncIcalCalendars.rejected, (state, action) => {
                state.icalStatus = 'failed';
                state.icalError = action.payload;
            })

            // Conflict Check
            .addCase(checkBookingConflicts.pending, (state) => {
                state.conflictCheckStatus = 'checking';
            })
            .addCase(checkBookingConflicts.fulfilled, (state, action) => {
                state.conflicts = action.payload;
                state.lastConflictCheck = new Date().toISOString();
                state.stats.conflictedBookings = action.payload.length;
            })
            .addCase(checkBookingConflicts.rejected, (state, action) => {
                state.conflictCheckStatus = 'failed';
                state.error = action.payload;
            })

            // Create Booking
            .addCase(createOwnerBooking.pending, (state) => {
                state.createStatus = 'loading';
                state.createError = null;
            })
            .addCase(createOwnerBooking.fulfilled, (state, action) => {
                state.createStatus = 'succeeded';
                // Don't modify bookings array here - let the main fetch handle it
                state.status = 'loading'; // This will trigger a re-fetch
            })
            .addCase(createOwnerBooking.rejected, (state, action) => {
                state.createStatus = 'failed';
                state.createError = action.payload;
            });
    },
});

// Actions
export const {
    setOwnerBookingFilter,
    setOwnerBookingPage,
    resetOwnerBookingFilters,
    clearSelectedBooking,
    setViewMode,
    clearConflicts,
    clearCreateStatus,
} = ownerBookingSlice.actions;

// Selectors
export const selectOwnerBookings = (state) => state.ownerBooking.bookings;
export const selectOwnerBookingFilters = (state) => state.ownerBooking.filters;
export const selectOwnerBookingPagination = (state) => state.ownerBooking.pagination;
export const selectOwnerBookingStatus = (state) => state.ownerBooking.status;
export const selectOwnerBookingError = (state) => state.ownerBooking.error;
export const selectOwnerBookingStats = (state) => state.ownerBooking.stats;
export const selectOwnerBookingViewMode = (state) => state.ownerBooking.viewMode;
export const selectOwnerBookingIcalSettings = (state) => state.ownerBooking.icalSettings;
export const selectOwnerBookingIcalStatus = (state) => state.ownerBooking.icalStatus;
export const selectOwnerBookingIcalError = (state) => state.ownerBooking.icalError;
export const selectOwnerBookingConflicts = (state) => state.ownerBooking.conflicts;
export const selectOwnerBookingLastConflictCheck = (state) => state.ownerBooking.lastConflictCheck;
export const selectOwnerBookingCreateStatus = (state) => state.ownerBooking.createStatus;
export const selectOwnerBookingCreateError = (state) => state.ownerBooking.createError;
export const selectSelectedBooking = (state) => state.ownerBooking.selectedBooking;
export const selectSelectedBookingStatus = (state) => state.ownerBooking.selectedBookingStatus;
export const selectSelectedBookingError = (state) => state.ownerBooking.selectedBookingError;

export default ownerBookingSlice.reducer;
