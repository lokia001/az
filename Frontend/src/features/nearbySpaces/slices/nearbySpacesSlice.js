// Frontend/src/features/nearbySpaces/slices/nearbySpacesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { findNearbySpaces } from '../../../services/api';

// Async thunks
export const fetchNearbySpaces = createAsyncThunk(
    'nearbySpaces/fetchNearbySpaces',
    async ({ latitude, longitude, maxDistanceKm = 5, maxResults = 20 }, { rejectWithValue }) => {
        try {
            return await findNearbySpaces({ 
                latitude, 
                longitude, 
                maxDistanceKm, 
                maxResults 
            });
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    spaces: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    userLocation: null,
    searchRadius: 5 // km
};

const nearbySpacesSlice = createSlice({
    name: 'nearbySpaces',
    initialState,
    reducers: {
        clearNearbySpaces: (state) => {
            state.spaces = [];
            state.status = 'idle';
            state.error = null;
        },
        setUserLocation: (state, action) => {
            state.userLocation = action.payload;
        },
        setSearchRadius: (state, action) => {
            state.searchRadius = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNearbySpaces.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchNearbySpaces.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.spaces = action.payload;
                state.error = null;
            })
            .addCase(fetchNearbySpaces.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.spaces = [];
            });
    }
});

// Actions
export const { clearNearbySpaces, setUserLocation, setSearchRadius, clearError } = nearbySpacesSlice.actions;

// Selectors
export const selectNearbySpaces = (state) => state.nearbySpaces.spaces;
export const selectNearbySpacesStatus = (state) => state.nearbySpaces.status;
export const selectNearbySpacesError = (state) => state.nearbySpaces.error;
export const selectUserLocation = (state) => state.nearbySpaces.userLocation;
export const selectSearchRadius = (state) => state.nearbySpaces.searchRadius;

export default nearbySpacesSlice.reducer;
