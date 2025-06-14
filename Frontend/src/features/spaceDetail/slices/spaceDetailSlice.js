// src/features/spaceDetail/slices/spaceDetailSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSpaceByIdentifierAPI } from '../services/spaceDetailApi';

const initialState = {
    currentSpace: null,
    status: 'idle',
    error: null,
};

// Helper function to check if a string is likely a GUID
const isGuid = (str) => {
    if (typeof str !== 'string') return false;
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    // Convert to lowercase for checking to ensure case-insensitive comparison
    return guidRegex.test(str.toLowerCase());
};

export const fetchSpaceDetail = createAsyncThunk(
    'spaceDetail/fetchSpaceDetail',
    async (spaceIdOrSlug, { rejectWithValue }) => {
        console.log('[SpaceDetailSlice] fetchSpaceDetail thunk for identifier:', spaceIdOrSlug);
        if (!spaceIdOrSlug) {
            return rejectWithValue('Space ID or slug is missing for fetching details.');
        }

        // Enhanced logging for debugging
        console.log(`[SpaceDetailSlice] Input identifier type: ${typeof spaceIdOrSlug}, value: "${spaceIdOrSlug}"`);
        
        const identifierIsSlug = !isGuid(spaceIdOrSlug);
        console.log(`[SpaceDetailSlice] Identifier "${spaceIdOrSlug}" is considered a ${identifierIsSlug ? 'slug' : 'GUID (ID)'}.`);

        try {
            // Additional logging for the API call
            console.log(`[SpaceDetailSlice] Calling fetchSpaceByIdentifierAPI with identifier: "${spaceIdOrSlug}", isSlug: ${identifierIsSlug}`);
            
            const spaceData = await fetchSpaceByIdentifierAPI(spaceIdOrSlug, identifierIsSlug);
            
            if (!spaceData || !spaceData.id) {
                console.error('[SpaceDetailSlice] API returned data without ID:', spaceData);
                return rejectWithValue('Invalid space data received from server.');
            }
            
            console.log('[SpaceDetailSlice] fetchSpaceDetail thunk success, data:', spaceData);
            return spaceData; // This is the SpaceDto
        } catch (error) {
            // error.message here is from fetchSpaceByIdentifierAPI's throw
            console.error('[SpaceDetailSlice] fetchSpaceDetail thunk FAILED. Error message:', error.message, "Original error from API service:", error);
            return rejectWithValue(error.message || 'Failed to load space details.');
        }
    }
);

const spaceDetailSlice = createSlice({
    name: 'spaceDetail',
    initialState,
    reducers: {
        clearCurrentSpace: (state) => {
            state.currentSpace = null;
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSpaceDetail.pending, (state) => {
                state.status = 'loading';
                state.currentSpace = null;
                state.error = null;
            })
            .addCase(fetchSpaceDetail.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentSpace = action.payload;
                
                // Nếu đây là đối tượng không gian giả lập (isNotFound=true), vẫn đánh dấu thành công
                // nhưng UI sẽ xử lý nó đặc biệt dựa vào thuộc tính isNotFound
                if (action.payload?.isNotFound) {
                    console.log('[SpaceDetailSlice] Received a mock space object for not found ID');
                }
                
                state.error = null;
            })
            .addCase(fetchSpaceDetail.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload; // Error message string
                state.currentSpace = null;
            });
    },
});

export const { clearCurrentSpace } = spaceDetailSlice.actions;

export const selectCurrentSpaceDetail = (state) => state.spaceDetail.currentSpace;
export const selectSpaceDetailStatus = (state) => state.spaceDetail.status;
export const selectSpaceDetailError = (state) => state.spaceDetail.error;

export default spaceDetailSlice.reducer;