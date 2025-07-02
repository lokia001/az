// Frontend/src/features/favoriteSpaces/slices/favoriteSpacesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as favoriteSpacesAPI from '../services/favoriteSpacesApi';

// Async thunks
export const fetchFavoriteSpaces = createAsyncThunk(
    'favoriteSpaces/fetchFavoriteSpaces',
    async (_, { rejectWithValue }) => {
        try {
            return await favoriteSpacesAPI.getFavoriteSpacesAPI();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addToFavorites = createAsyncThunk(
    'favoriteSpaces/addToFavorites',
    async (spaceId, { rejectWithValue }) => {
        try {
            const result = await favoriteSpacesAPI.addToFavoritesAPI(spaceId);
            return { ...result, spaceId }; // Include spaceId for easier state updates
        } catch (error) {
            return rejectWithValue({ message: error.message, spaceId });
        }
    }
);

export const removeFromFavorites = createAsyncThunk(
    'favoriteSpaces/removeFromFavorites',
    async (spaceId, { rejectWithValue }) => {
        try {
            await favoriteSpacesAPI.removeFromFavoritesAPI(spaceId);
            return spaceId;
        } catch (error) {
            return rejectWithValue({ message: error.message, spaceId });
        }
    }
);

export const fetchFavoriteStatus = createAsyncThunk(
    'favoriteSpaces/fetchFavoriteStatus',
    async (spaceId, { rejectWithValue }) => {
        try {
            return await favoriteSpacesAPI.getFavoriteStatusAPI(spaceId);
        } catch (error) {
            return rejectWithValue({ message: error.message, spaceId });
        }
    }
);

export const fetchFavoriteStatuses = createAsyncThunk(
    'favoriteSpaces/fetchFavoriteStatuses',
    async (spaceIds, { rejectWithValue }) => {
        try {
            return await favoriteSpacesAPI.getFavoriteStatusesAPI(spaceIds);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    favoriteSpaces: [],
    favoriteStatuses: {}, // spaceId -> { isFavorited, totalFavorites }
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    operationStatus: 'idle' // For add/remove operations
};

const favoriteSpacesSlice = createSlice({
    name: 'favoriteSpaces',
    initialState,
    reducers: {
        clearFavoriteSpaces: (state) => {
            state.favoriteSpaces = [];
            state.favoriteStatuses = {};
            state.status = 'idle';
            state.error = null;
            state.operationStatus = 'idle';
        },
        clearError: (state) => {
            state.error = null;
        },
        // Update favorite status optimistically
        updateFavoriteStatusOptimistically: (state, action) => {
            const { spaceId, isFavorited } = action.payload;
            if (state.favoriteStatuses[spaceId]) {
                state.favoriteStatuses[spaceId].isFavorited = isFavorited;
                // Adjust total count optimistically
                if (isFavorited) {
                    state.favoriteStatuses[spaceId].totalFavorites += 1;
                } else {
                    state.favoriteStatuses[spaceId].totalFavorites = Math.max(0, state.favoriteStatuses[spaceId].totalFavorites - 1);
                }
            } else {
                state.favoriteStatuses[spaceId] = {
                    spaceId,
                    isFavorited,
                    totalFavorites: isFavorited ? 1 : 0
                };
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch favorite spaces
            .addCase(fetchFavoriteSpaces.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchFavoriteSpaces.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.favoriteSpaces = action.payload;
                state.error = null;
            })
            .addCase(fetchFavoriteSpaces.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Add to favorites
            .addCase(addToFavorites.pending, (state) => {
                state.operationStatus = 'loading';
                state.error = null;
            })
            .addCase(addToFavorites.fulfilled, (state, action) => {
                state.operationStatus = 'succeeded';
                const favoriteSpace = action.payload;
                
                // Add to favoriteSpaces array if not already present
                const exists = state.favoriteSpaces.find(fs => fs.spaceId === favoriteSpace.spaceId);
                if (!exists) {
                    state.favoriteSpaces.unshift(favoriteSpace);
                }
                
                // Update favorite status
                state.favoriteStatuses[favoriteSpace.spaceId] = {
                    spaceId: favoriteSpace.spaceId,
                    isFavorited: true,
                    totalFavorites: (state.favoriteStatuses[favoriteSpace.spaceId]?.totalFavorites || 0) + 1
                };
                
                state.error = null;
            })
            .addCase(addToFavorites.rejected, (state, action) => {
                state.operationStatus = 'failed';
                state.error = action.payload.message;
                
                // Revert optimistic update if it was made
                const spaceId = action.payload.spaceId;
                if (state.favoriteStatuses[spaceId]) {
                    state.favoriteStatuses[spaceId].isFavorited = false;
                    state.favoriteStatuses[spaceId].totalFavorites = Math.max(0, state.favoriteStatuses[spaceId].totalFavorites - 1);
                }
            })

            // Remove from favorites
            .addCase(removeFromFavorites.pending, (state) => {
                state.operationStatus = 'loading';
                state.error = null;
            })
            .addCase(removeFromFavorites.fulfilled, (state, action) => {
                state.operationStatus = 'succeeded';
                const spaceId = action.payload;
                
                // Remove from favoriteSpaces array
                state.favoriteSpaces = state.favoriteSpaces.filter(fs => fs.spaceId !== spaceId);
                
                // Update favorite status
                if (state.favoriteStatuses[spaceId]) {
                    state.favoriteStatuses[spaceId].isFavorited = false;
                    state.favoriteStatuses[spaceId].totalFavorites = Math.max(0, state.favoriteStatuses[spaceId].totalFavorites - 1);
                }
                
                state.error = null;
            })
            .addCase(removeFromFavorites.rejected, (state, action) => {
                state.operationStatus = 'failed';
                state.error = action.payload.message;
                
                // Revert optimistic update if it was made
                const spaceId = action.payload.spaceId;
                if (state.favoriteStatuses[spaceId]) {
                    state.favoriteStatuses[spaceId].isFavorited = true;
                    state.favoriteStatuses[spaceId].totalFavorites += 1;
                }
            })

            // Fetch favorite status
            .addCase(fetchFavoriteStatus.fulfilled, (state, action) => {
                const status = action.payload;
                state.favoriteStatuses[status.spaceId] = status;
            })
            .addCase(fetchFavoriteStatus.rejected, (state, action) => {
                console.error('Failed to fetch favorite status:', action.payload);
            })

            // Fetch favorite statuses
            .addCase(fetchFavoriteStatuses.fulfilled, (state, action) => {
                const statuses = action.payload;
                statuses.forEach(status => {
                    state.favoriteStatuses[status.spaceId] = status;
                });
            })
            .addCase(fetchFavoriteStatuses.rejected, (state, action) => {
                console.error('Failed to fetch favorite statuses:', action.payload);
            });
    }
});

export const { 
    clearFavoriteSpaces, 
    clearError, 
    updateFavoriteStatusOptimistically 
} = favoriteSpacesSlice.actions;

// Selectors
export const selectFavoriteSpaces = (state) => state.favoriteSpaces.favoriteSpaces;
export const selectFavoriteSpacesStatus = (state) => state.favoriteSpaces.status;
export const selectFavoriteSpacesError = (state) => state.favoriteSpaces.error;
export const selectFavoriteSpacesOperationStatus = (state) => state.favoriteSpaces.operationStatus;
export const selectFavoriteStatuses = (state) => state.favoriteSpaces.favoriteStatuses;

// Selector for checking if a specific space is favorited
export const selectIsSpaceFavorited = (spaceId) => (state) => {
    return state.favoriteSpaces.favoriteStatuses[spaceId]?.isFavorited || false;
};

// Selector for getting favorite count of a specific space
export const selectSpaceFavoriteCount = (spaceId) => (state) => {
    return state.favoriteSpaces.favoriteStatuses[spaceId]?.totalFavorites || 0;
};

export default favoriteSpacesSlice.reducer;
