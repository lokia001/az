// src/features/systemItems/slices/systemAmenitiesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchSystemAmenitiesAPI,
    createSystemAmenityAPI,
    updateSystemAmenityAPI,
    deleteSystemAmenityAPI
} from '../services/systemAmenitiesApi';

const initialState = {
    amenities: [],
    status: 'idle',
    error: null,
    createStatus: 'idle',
    createError: null,
    updateStatus: 'idle',
    updateError: null,
    deleteStatus: 'idle',
    deleteError: null,
};

export const fetchSystemAmenities = createAsyncThunk(
    'systemAmenities/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchSystemAmenitiesAPI();
            // Ensure we handle the response structure correctly
            if (response && typeof response === 'object') {
                // If response has data or items property, use that
                if (response.data) return response.data;
                if (response.items) return response.items;
                // If response is an array, use it directly
                if (Array.isArray(response)) return response;
                // If response has results property, use that
                if (response.results) return response.results;
            }
            // Fallback to empty array if no valid data structure is found
            return [];
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch system amenities.');
        }
    }
);

export const createSystemAmenity = createAsyncThunk(
    'systemAmenities/create',
    async (amenityData, { dispatch, rejectWithValue }) => {
        try {
            const response = await createSystemAmenityAPI(amenityData);
            dispatch(fetchSystemAmenities()); // Refresh the list
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create system amenity.');
        }
    }
);

export const updateSystemAmenity = createAsyncThunk(
    'systemAmenities/update',
    async ({ amenityId, amenityData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await updateSystemAmenityAPI(amenityId, amenityData);
            dispatch(fetchSystemAmenities()); // Refresh the list
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update system amenity.');
        }
    }
);

export const deleteSystemAmenity = createAsyncThunk(
    'systemAmenities/delete',
    async (amenityId, { dispatch, rejectWithValue }) => {
        try {
            await deleteSystemAmenityAPI(amenityId);
            dispatch(fetchSystemAmenities()); // Refresh the list
            return amenityId;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete system amenity.');
        }
    }
);

const systemAmenitiesSlice = createSlice({
    name: 'systemAmenities',
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
            .addCase(fetchSystemAmenities.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchSystemAmenities.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.amenities = Array.isArray(action.payload) ? action.payload : [];
                state.error = null;
            })
            .addCase(fetchSystemAmenities.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.amenities = [];
            })
            // Create amenity
            .addCase(createSystemAmenity.pending, (state) => {
                state.createStatus = 'loading';
                state.createError = null;
            })
            .addCase(createSystemAmenity.fulfilled, (state) => {
                state.createStatus = 'succeeded';
            })
            .addCase(createSystemAmenity.rejected, (state, action) => {
                state.createStatus = 'failed';
                state.createError = action.payload;
            })
            // Update amenity
            .addCase(updateSystemAmenity.pending, (state) => {
                state.updateStatus = 'loading';
                state.updateError = null;
            })
            .addCase(updateSystemAmenity.fulfilled, (state) => {
                state.updateStatus = 'succeeded';
            })
            .addCase(updateSystemAmenity.rejected, (state, action) => {
                state.updateStatus = 'failed';
                state.updateError = action.payload;
            })
            // Delete amenity
            .addCase(deleteSystemAmenity.pending, (state) => {
                state.deleteStatus = 'loading';
                state.deleteError = null;
            })
            .addCase(deleteSystemAmenity.fulfilled, (state) => {
                state.deleteStatus = 'succeeded';
            })
            .addCase(deleteSystemAmenity.rejected, (state, action) => {
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
} = systemAmenitiesSlice.actions;

// Selectors
export const selectSystemAmenities = (state) => state.systemAmenities.amenities;
export const selectSystemAmenitiesStatus = (state) => state.systemAmenities.status;
export const selectSystemAmenitiesError = (state) => state.systemAmenities.error;
export const selectCreateStatus = (state) => state.systemAmenities.createStatus;
export const selectCreateError = (state) => state.systemAmenities.createError;
export const selectUpdateStatus = (state) => state.systemAmenities.updateStatus;
export const selectUpdateError = (state) => state.systemAmenities.updateError;
export const selectDeleteStatus = (state) => state.systemAmenities.deleteStatus;
export const selectDeleteError = (state) => state.systemAmenities.deleteError;

export default systemAmenitiesSlice.reducer;