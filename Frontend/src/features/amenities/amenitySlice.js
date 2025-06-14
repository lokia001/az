// src/features/amenities/amenitySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/api'; // Đường dẫn đến file api.js của bạn

export const fetchAmenities = createAsyncThunk(
    'amenities/fetchAmenities',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.getAmenities();
            console.log("=> check fetchAmenities, response: ", response);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createAmenityAsync = createAsyncThunk(
    'amenities/createAmenity',
    async (amenity, { rejectWithValue }) => {
        try {
            const response = await api.createAmenity(amenity);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const amenitySlice = createSlice({
    name: 'amenities',
    initialState: {
        amenities: [],
        loading: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAmenities.pending, (state) => {
                state.loading = 'pending';
            })
            .addCase(fetchAmenities.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                console.log("=> owner check act amenity payload: ", action.payload)
                state.amenities = action.payload;
            })
            .addCase(fetchAmenities.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })
            .addCase(createAmenityAsync.fulfilled, (state, action) => {
                state.amenities.push(action.payload);
            });
    },
});

export const selectAmenities = (state) => state.amenities.amenities;
export const selectAmenitiesLoading = (state) => state.amenities.loading;
export const selectAmenitiesError = (state) => state.amenities.error;
export default amenitySlice.reducer;