// src/features/reactions/slices/reactionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { setReactionAPI, removeReactionAPI, fetchReactionSummaryAPI } from '../services/reactionApi';
import { logoutUser } from '../../auth/slices/authSlice'; // Import logout action

// State will store reaction summaries keyed by "entityType-entityId"
// e.g., "Post-guid123": { counts: {"Like": 10}, currentUserReactionType: "Like", status: 'succeeded' }
const initialState = {
    reactionSummaries: {}, // Key: "EntityType-EntityId", Value: { data: ReactionSummaryDto, status: 'idle'|'loading'|'succeeded'|'failed', error: null }
    // Global status for set/remove operations, or could be per-entity
    setReactionStatus: 'idle',
    setReactionError: null,
};

// Thunk to fetch the initial reaction summary for an entity
export const fetchReactionSummary = createAsyncThunk(
    'reactions/fetchSummary',
    async ({ targetEntityType, targetEntityId, forceRefresh = false }, { getState, rejectWithValue }) => {
        const key = `${targetEntityType}-${targetEntityId}`;
        const currentSummary = getState().reactions.reactionSummaries[key];
        if (!forceRefresh && currentSummary && currentSummary.status === 'succeeded') {
            return { key, data: currentSummary.data, noFetchNeeded: true }; // Already loaded
        }
        try {
            const summaryData = await fetchReactionSummaryAPI(targetEntityType, targetEntityId);
            return { key, data: summaryData }; // summaryData is ReactionSummaryDto
        } catch (error) {
            return rejectWithValue({ key, error: error.message });
        }
    }
);

// Thunk to set (like) or change a reaction
export const setReaction = createAsyncThunk(
    'reactions/setReaction',
    async (reactionData, { rejectWithValue }) => {
        // reactionData: { targetEntityType, targetEntityId, reactionType }
        try {
            const summaryData = await setReactionAPI(reactionData);
            return { key: `${reactionData.targetEntityType}-${reactionData.targetEntityId}`, data: summaryData };
        } catch (error) {
            return rejectWithValue({ key: `${reactionData.targetEntityType}-${reactionData.targetEntityId}`, error: error.message });
        }
    }
);

// Thunk to remove (unlike) a reaction
export const removeReaction = createAsyncThunk(
    'reactions/removeReaction',
    async (reactionData, { rejectWithValue }) => {
        // reactionData: { targetEntityType, targetEntityId, reactionTypeToRemove (optional, for "Like" it's "Like") }
        try {
            const summaryData = await removeReactionAPI(reactionData);
            return { key: `${reactionData.targetEntityType}-${reactionData.targetEntityId}`, data: summaryData };
        } catch (error) {
            return rejectWithValue({ key: `${reactionData.targetEntityType}-${reactionData.targetEntityId}`, error: error.message });
        }
    }
);

const reactionSlice = createSlice({
    name: 'reactions',
    initialState,
    reducers: {
        clearSetReactionStatus: (state) => {
            state.setReactionStatus = 'idle';
            state.setReactionError = null;
        },
        // If a post/comment is deleted, its reaction summary should be cleared
        clearReactionSummary: (state, action) => {
            const { targetEntityType, targetEntityId } = action.payload;
            const key = `${targetEntityType}-${targetEntityId}`;
            if (state.reactionSummaries[key]) {
                delete state.reactionSummaries[key];
            }
        },
        // Clear all reactions when user logs out
        clearAllReactions: (state) => {
            state.reactionSummaries = {};
            state.setReactionStatus = 'idle';
            state.setReactionError = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch Reaction Summary
        builder
            .addCase(fetchReactionSummary.pending, (state, action) => {
                const key = action.meta.arg.key || `${action.meta.arg.targetEntityType}-${action.meta.arg.targetEntityId}`;
                state.reactionSummaries[key] = { ...state.reactionSummaries[key], status: 'loading', error: null };
            })
            .addCase(fetchReactionSummary.fulfilled, (state, action) => {
                if (action.payload.noFetchNeeded) return;
                const { key, data } = action.payload;
                state.reactionSummaries[key] = { data, status: 'succeeded', error: null };
            })
            .addCase(fetchReactionSummary.rejected, (state, action) => {
                const key = action.payload.key || action.meta.arg.key || `${action.meta.arg.targetEntityType}-${action.meta.arg.targetEntityId}`;
                state.reactionSummaries[key] = { ...state.reactionSummaries[key], status: 'failed', error: action.payload.error };
            });

        // Set Reaction & Remove Reaction (they both update the summary)
        const handleReactionUpdatePending = (state) => {
            state.setReactionStatus = 'loading';
            state.setReactionError = null;
        };
        const handleReactionUpdateFulfilled = (state, action) => {
            state.setReactionStatus = 'succeeded';
            const { key, data } = action.payload; // data is ReactionSummaryDto
            state.reactionSummaries[key] = { data, status: 'succeeded', error: null };
        };
        const handleReactionUpdateRejected = (state, action) => {
            state.setReactionStatus = 'failed';
            state.setReactionError = action.payload.error;
            // Optionally update the specific entity's status to failed too
            const key = action.payload.key || action.meta.arg.key;
            if (key && state.reactionSummaries[key]) {
                state.reactionSummaries[key].status = 'failed'; // Revert optimistic or show error for this entity
                state.reactionSummaries[key].error = action.payload.error;
            }
        };
        builder
            .addCase(setReaction.pending, handleReactionUpdatePending)
            .addCase(setReaction.fulfilled, handleReactionUpdateFulfilled)
            .addCase(setReaction.rejected, handleReactionUpdateRejected)
            .addCase(removeReaction.pending, handleReactionUpdatePending)
            .addCase(removeReaction.fulfilled, handleReactionUpdateFulfilled)
            .addCase(removeReaction.rejected, handleReactionUpdateRejected)
            // Reset reactions state when user logs out to force fresh fetch on next login
            .addCase(logoutUser, (state) => {
                // Don't clear the data, just reset status to 'idle' to force refetch
                Object.keys(state.reactionSummaries).forEach(key => {
                    state.reactionSummaries[key].status = 'idle';
                });
                state.setReactionStatus = 'idle';
                state.setReactionError = null;
            });
    },
});

export const { clearSetReactionStatus, clearReactionSummary, clearAllReactions } = reactionSlice.actions;

// Selectors
export const selectReactionSummary = (targetEntityType, targetEntityId) => (state) => {
    const key = `${targetEntityType}-${targetEntityId}`;
    return state.reactions.reactionSummaries[key] || { data: { counts: {}, currentUserReactionType: null }, status: 'idle', error: null };
};
export const selectSetReactionStatus = (state) => state.reactions.setReactionStatus;
export const selectSetReactionError = (state) => state.reactions.setReactionError;

export default reactionSlice.reducer;