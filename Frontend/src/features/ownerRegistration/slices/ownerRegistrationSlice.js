// Frontend/src/features/ownerRegistration/slices/ownerRegistrationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    submitOwnerRegistrationAPI,
    getMyOwnerRegistrationAPI,
    cancelOwnerRegistrationAPI,
    getOwnerRegistrationRequestsAPI,
    getOwnerRegistrationRequestByIdAPI,
    getPendingOwnerRegistrationCountAPI,
    processOwnerRegistrationAPI
} from '../services/ownerRegistrationApi';

// Async thunks

// User thunks
export const submitOwnerRegistration = createAsyncThunk(
    'ownerRegistration/submitOwnerRegistration',
    async (requestData, { rejectWithValue }) => {
        try {
            const response = await submitOwnerRegistrationAPI(requestData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to submit registration request.');
        }
    }
);

export const getMyOwnerRegistration = createAsyncThunk(
    'ownerRegistration/getMyOwnerRegistration',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getMyOwnerRegistrationAPI();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to get registration request.');
        }
    }
);

export const cancelOwnerRegistration = createAsyncThunk(
    'ownerRegistration/cancelOwnerRegistration',
    async (requestId, { rejectWithValue, dispatch }) => {
        try {
            const response = await cancelOwnerRegistrationAPI(requestId);
            // Refresh the user's registration request after cancellation
            dispatch(getMyOwnerRegistration());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to cancel registration request.');
        }
    }
);

// Admin thunks
export const getOwnerRegistrationRequests = createAsyncThunk(
    'ownerRegistration/getOwnerRegistrationRequests',
    async (params, { rejectWithValue }) => {
        try {
            const response = await getOwnerRegistrationRequestsAPI(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to get registration requests.');
        }
    }
);

export const getOwnerRegistrationRequestById = createAsyncThunk(
    'ownerRegistration/getOwnerRegistrationRequestById',
    async (requestId, { rejectWithValue }) => {
        try {
            const response = await getOwnerRegistrationRequestByIdAPI(requestId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to get registration request details.');
        }
    }
);

export const getPendingOwnerRegistrationCount = createAsyncThunk(
    'ownerRegistration/getPendingOwnerRegistrationCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getPendingOwnerRegistrationCountAPI();
            return response.pendingCount;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to get pending requests count.');
        }
    }
);

export const processOwnerRegistration = createAsyncThunk(
    'ownerRegistration/processOwnerRegistration',
    async ({ requestId, processData }, { rejectWithValue, dispatch }) => {
        try {
            const response = await processOwnerRegistrationAPI(requestId, processData);
            // Refresh the admin list after processing
            dispatch(getOwnerRegistrationRequests());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to process registration request.');
        }
    }
);

// Initial state
const initialState = {
    // User state
    userRequest: null, // Current user's registration request
    userRequestStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    userRequestError: null,

    // Submit/cancel actions
    actionStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    actionError: null,

    // Admin state
    adminRequests: [], // List of registration requests for admin
    adminPagination: {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
    },
    adminFilters: {
        status: '',
        fromDate: '',
        toDate: '',
        searchTerm: ''
    },
    adminRequestsStatus: 'idle',
    adminRequestsError: null,

    // Selected request for admin details
    selectedRequest: null,
    selectedRequestStatus: 'idle',
    selectedRequestError: null,

    // Pending count for admin dashboard
    pendingCount: 0,
    pendingCountStatus: 'idle',
    pendingCountError: null,

    // Process request status
    processStatus: 'idle',
    processError: null
};

// Slice
const ownerRegistrationSlice = createSlice({
    name: 'ownerRegistration',
    initialState,
    reducers: {
        clearUserRequestError: (state) => {
            state.userRequestError = null;
        },
        clearActionError: (state) => {
            state.actionError = null;
        },
        clearAdminRequestsError: (state) => {
            state.adminRequestsError = null;
        },
        clearSelectedRequestError: (state) => {
            state.selectedRequestError = null;
        },
        clearProcessError: (state) => {
            state.processError = null;
        },
        setAdminFilters: (state, action) => {
            state.adminFilters = { ...state.adminFilters, ...action.payload };
        },
        setAdminPage: (state, action) => {
            state.adminPagination.pageNumber = action.payload;
        },
        resetAdminFilters: (state) => {
            state.adminFilters = {
                status: '',
                fromDate: '',
                toDate: '',
                searchTerm: ''
            };
            state.adminPagination.pageNumber = 1;
        },
        clearSelectedRequest: (state) => {
            state.selectedRequest = null;
            state.selectedRequestError = null;
            state.selectedRequestStatus = 'idle';
        }
    },
    extraReducers: (builder) => {
        // Submit owner registration
        builder
            .addCase(submitOwnerRegistration.pending, (state) => {
                state.actionStatus = 'loading';
                state.actionError = null;
            })
            .addCase(submitOwnerRegistration.fulfilled, (state, action) => {
                state.actionStatus = 'succeeded';
                state.userRequest = action.payload;
            })
            .addCase(submitOwnerRegistration.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.actionError = action.payload;
            });

        // Get my owner registration
        builder
            .addCase(getMyOwnerRegistration.pending, (state) => {
                state.userRequestStatus = 'loading';
                state.userRequestError = null;
            })
            .addCase(getMyOwnerRegistration.fulfilled, (state, action) => {
                state.userRequestStatus = 'succeeded';
                state.userRequest = action.payload;
            })
            .addCase(getMyOwnerRegistration.rejected, (state, action) => {
                state.userRequestStatus = 'failed';
                state.userRequestError = action.payload;
            });

        // Cancel owner registration
        builder
            .addCase(cancelOwnerRegistration.pending, (state) => {
                state.actionStatus = 'loading';
                state.actionError = null;
            })
            .addCase(cancelOwnerRegistration.fulfilled, (state) => {
                state.actionStatus = 'succeeded';
            })
            .addCase(cancelOwnerRegistration.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.actionError = action.payload;
            });

        // Get owner registration requests (admin)
        builder
            .addCase(getOwnerRegistrationRequests.pending, (state) => {
                state.adminRequestsStatus = 'loading';
                state.adminRequestsError = null;
            })
            .addCase(getOwnerRegistrationRequests.fulfilled, (state, action) => {
                state.adminRequestsStatus = 'succeeded';
                state.adminRequests = action.payload.requests;
                state.adminPagination = {
                    pageNumber: action.payload.pageNumber,
                    pageSize: action.payload.pageSize,
                    totalCount: action.payload.totalCount,
                    totalPages: action.payload.totalPages,
                    hasNextPage: action.payload.hasNextPage,
                    hasPreviousPage: action.payload.hasPreviousPage
                };
            })
            .addCase(getOwnerRegistrationRequests.rejected, (state, action) => {
                state.adminRequestsStatus = 'failed';
                state.adminRequestsError = action.payload;
                state.adminRequests = [];
            });

        // Get owner registration request by ID (admin)
        builder
            .addCase(getOwnerRegistrationRequestById.pending, (state) => {
                state.selectedRequestStatus = 'loading';
                state.selectedRequestError = null;
            })
            .addCase(getOwnerRegistrationRequestById.fulfilled, (state, action) => {
                state.selectedRequestStatus = 'succeeded';
                state.selectedRequest = action.payload;
            })
            .addCase(getOwnerRegistrationRequestById.rejected, (state, action) => {
                state.selectedRequestStatus = 'failed';
                state.selectedRequestError = action.payload;
                state.selectedRequest = null;
            });

        // Get pending count
        builder
            .addCase(getPendingOwnerRegistrationCount.pending, (state) => {
                state.pendingCountStatus = 'loading';
                state.pendingCountError = null;
            })
            .addCase(getPendingOwnerRegistrationCount.fulfilled, (state, action) => {
                state.pendingCountStatus = 'succeeded';
                state.pendingCount = action.payload;
            })
            .addCase(getPendingOwnerRegistrationCount.rejected, (state, action) => {
                state.pendingCountStatus = 'failed';
                state.pendingCountError = action.payload;
            });

        // Process owner registration (admin)
        builder
            .addCase(processOwnerRegistration.pending, (state) => {
                state.processStatus = 'loading';
                state.processError = null;
            })
            .addCase(processOwnerRegistration.fulfilled, (state) => {
                state.processStatus = 'succeeded';
            })
            .addCase(processOwnerRegistration.rejected, (state, action) => {
                state.processStatus = 'failed';
                state.processError = action.payload;
            });
    }
});

export const {
    clearUserRequestError,
    clearActionError,
    clearAdminRequestsError,
    clearSelectedRequestError,
    clearProcessError,
    setAdminFilters,
    setAdminPage,
    resetAdminFilters,
    clearSelectedRequest
} = ownerRegistrationSlice.actions;

// Selectors
export const selectUserRequest = (state) => state.ownerRegistration.userRequest;
export const selectUserRequestStatus = (state) => state.ownerRegistration.userRequestStatus;
export const selectUserRequestError = (state) => state.ownerRegistration.userRequestError;

export const selectActionStatus = (state) => state.ownerRegistration.actionStatus;
export const selectActionError = (state) => state.ownerRegistration.actionError;

export const selectAdminRequests = (state) => state.ownerRegistration.adminRequests;
export const selectAdminPagination = (state) => state.ownerRegistration.adminPagination;
export const selectAdminFilters = (state) => state.ownerRegistration.adminFilters;
export const selectAdminRequestsStatus = (state) => state.ownerRegistration.adminRequestsStatus;
export const selectAdminRequestsError = (state) => state.ownerRegistration.adminRequestsError;

export const selectSelectedRequest = (state) => state.ownerRegistration.selectedRequest;
export const selectSelectedRequestStatus = (state) => state.ownerRegistration.selectedRequestStatus;
export const selectSelectedRequestError = (state) => state.ownerRegistration.selectedRequestError;

export const selectPendingCount = (state) => state.ownerRegistration.pendingCount;
export const selectPendingCountStatus = (state) => state.ownerRegistration.pendingCountStatus;
export const selectPendingCountError = (state) => state.ownerRegistration.pendingCountError;

export const selectProcessStatus = (state) => state.ownerRegistration.processStatus;
export const selectProcessError = (state) => state.ownerRegistration.processError;

export default ownerRegistrationSlice.reducer;
