// src/features/systemItems/slices/systemSpaceServicesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchSystemSpaceServicesAPI,
    createSystemSpaceServiceAPI,
    updateSystemSpaceServiceAPI,
    deleteSystemSpaceServiceAPI
} from '../services/systemSpaceServicesApi';

const initialState = {
    services: [],
    status: 'idle',
    error: null,
    createStatus: 'idle',
    createError: null,
    updateStatus: 'idle',
    updateError: null,
    deleteStatus: 'idle',
    deleteError: null,
};

export const fetchSystemSpaceServices = createAsyncThunk(
    'systemSpaceServices/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchSystemSpaceServicesAPI();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch system space services.');
        }
    }
);

export const createSystemSpaceService = createAsyncThunk(
    'systemSpaceServices/create',
    async (serviceData, { dispatch, rejectWithValue }) => {
        try {
            const response = await createSystemSpaceServiceAPI(serviceData);
            dispatch(fetchSystemSpaceServices()); // Refresh the list
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create system space service.');
        }
    }
);

export const updateSystemSpaceService = createAsyncThunk(
    'systemSpaceServices/update',
    async ({ serviceId, serviceData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await updateSystemSpaceServiceAPI(serviceId, serviceData);
            dispatch(fetchSystemSpaceServices()); // Refresh the list
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update system space service.');
        }
    }
);

export const deleteSystemSpaceService = createAsyncThunk(
    'systemSpaceServices/delete',
    async (serviceId, { dispatch, rejectWithValue }) => {
        try {
            await deleteSystemSpaceServiceAPI(serviceId);
            dispatch(fetchSystemSpaceServices()); // Refresh the list
            return serviceId;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete system space service.');
        }
    }
);

const systemSpaceServicesSlice = createSlice({
    name: 'systemSpaceServices',
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = null;
            state.createError = null;
            state.updateError = null;
            state.deleteError = null;
        },
        clearCreateStatus: (state) => {
            state.createStatus = 'idle';
            state.createError = null;
        },
        clearUpdateStatus: (state) => {
            state.updateStatus = 'idle';
            state.updateError = null;
        },
        clearDeleteStatus: (state) => {
            state.deleteStatus = 'idle';
            state.deleteError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch services
            .addCase(fetchSystemSpaceServices.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchSystemSpaceServices.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.services = action.payload;
            })
            .addCase(fetchSystemSpaceServices.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Create service
            .addCase(createSystemSpaceService.pending, (state) => {
                state.createStatus = 'loading';
                state.createError = null;
            })
            .addCase(createSystemSpaceService.fulfilled, (state) => {
                state.createStatus = 'succeeded';
            })
            .addCase(createSystemSpaceService.rejected, (state, action) => {
                state.createStatus = 'failed';
                state.createError = action.payload;
            })
            // Update service
            .addCase(updateSystemSpaceService.pending, (state) => {
                state.updateStatus = 'loading';
                state.updateError = null;
            })
            .addCase(updateSystemSpaceService.fulfilled, (state) => {
                state.updateStatus = 'succeeded';
            })
            .addCase(updateSystemSpaceService.rejected, (state, action) => {
                state.updateStatus = 'failed';
                state.updateError = action.payload;
            })
            // Delete service
            .addCase(deleteSystemSpaceService.pending, (state) => {
                state.deleteStatus = 'loading';
                state.deleteError = null;
            })
            .addCase(deleteSystemSpaceService.fulfilled, (state) => {
                state.deleteStatus = 'succeeded';
            })
            .addCase(deleteSystemSpaceService.rejected, (state, action) => {
                state.deleteStatus = 'failed';
                state.deleteError = action.payload;
            });
    },
});

export const {
    clearErrors,
    clearCreateStatus,
    clearUpdateStatus,
    clearDeleteStatus,
} = systemSpaceServicesSlice.actions;

// Selectors
export const selectSystemSpaceServices = (state) => state.systemSpaceServices.services;
export const selectSystemSpaceServicesStatus = (state) => state.systemSpaceServices.status;
export const selectSystemSpaceServicesError = (state) => state.systemSpaceServices.error;
export const selectCreateStatus = (state) => state.systemSpaceServices.createStatus;
export const selectCreateError = (state) => state.systemSpaceServices.createError;
export const selectUpdateStatus = (state) => state.systemSpaceServices.updateStatus;
export const selectUpdateError = (state) => state.systemSpaceServices.updateError;
export const selectDeleteStatus = (state) => state.systemSpaceServices.deleteStatus;
export const selectDeleteError = (state) => state.systemSpaceServices.deleteError;

export default systemSpaceServicesSlice.reducer;