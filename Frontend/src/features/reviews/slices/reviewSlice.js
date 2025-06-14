// src/features/reviews/slices/reviewSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchReviewsForSpaceAPI, createReviewAPI } from '../services/reviewApi';

const initialState = {
    reviewsBySpaceId: {}, // Object to store reviews keyed by spaceId: { [spaceId]: { items: [], pagination: {}, status, error } }
    // Status for creating a new review (global for now)
    createReviewStatus: 'idle',
    createReviewError: null,
};

export const fetchReviewsForSpace = createAsyncThunk(
    'reviews/fetchForSpace',
    async ({ spaceId, pageNumber, pageSize, forceRefresh = false }, { getState, rejectWithValue }) => {
        const currentSpaceReviews = getState().reviews.reviewsBySpaceId[spaceId];
        if (!forceRefresh && currentSpaceReviews && currentSpaceReviews.status === 'succeeded' && currentSpaceReviews.pagination.PageNumber === (pageNumber || 1)) {
            console.log(`[ReviewSlice] Reviews for space ${spaceId} page ${pageNumber || 1} already loaded. Skipping fetch.`);
            return null; // Indicate no fetch was needed, or return existing data
        }
        console.log(`[ReviewSlice] fetchReviewsForSpace thunk for spaceId: ${spaceId}, Page: ${pageNumber || 1}`);
        try {
            const response = await fetchReviewsForSpaceAPI(spaceId, {
                PageNumber: pageNumber || 1,
                PageSize: pageSize || 5,
            });
            return { spaceId, ...response }; // PagedResultDto<ReviewDto> plus spaceId
        } catch (error) {
            return rejectWithValue({ spaceId, error: error.message });
        }
    }
);

export const addNewReview = createAsyncThunk(
    'reviews/addNew',
    async (reviewData, { dispatch, rejectWithValue }) => {
        // reviewData: { spaceId, bookingId, rating, commentText }
        console.log('[ReviewSlice] addNewReview thunk with data:', reviewData);
        try {
            const newReview = await createReviewAPI(reviewData); // Returns new ReviewDto
            // After successfully creating a review, re-fetch the first page of reviews for that space
            if (newReview && newReview.spaceId) {
                dispatch(fetchReviewsForSpace({ spaceId: newReview.spaceId, pageNumber: 1, forceRefresh: true }));
            }
            return newReview;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const reviewSlice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {
        clearCreateReviewStatus: (state) => {
            state.createReviewStatus = 'idle';
            state.createReviewError = null;
        },
        clearReviewsForSpace: (state, action) => {
            const spaceId = action.payload;
            if (state.reviewsBySpaceId[spaceId]) {
                delete state.reviewsBySpaceId[spaceId];
            }
        },
        // *** ADDED setReviewsPage REDUCER ***
        setReviewsPage: (state, action) => {
            const { spaceId, pageNumber } = action.payload;
            if (state.reviewsBySpaceId[spaceId]) {
                // Only update if page number is actually different and within bounds
                if (state.reviewsBySpaceId[spaceId].pagination.PageNumber !== pageNumber &&
                    pageNumber > 0 &&
                    (state.reviewsBySpaceId[spaceId].pagination.totalPages === 0 || pageNumber <= state.reviewsBySpaceId[spaceId].pagination.totalPages)
                ) {
                    state.reviewsBySpaceId[spaceId].pagination.PageNumber = pageNumber;
                    state.reviewsBySpaceId[spaceId].status = 'idle'; // CRITICAL: Trigger re-fetch
                    console.log(`[ReviewSlice] Set page for space ${spaceId} to ${pageNumber}. Status set to idle.`);
                } else {
                    console.log(`[ReviewSlice] setReviewsPage: Page ${pageNumber} is same as current or invalid for space ${spaceId}. No change.`);
                }
            } else {
                console.warn(`[ReviewSlice] setReviewsPage called for unknown spaceId ${spaceId}`);
            }
        },
    },
    extraReducers: (builder) => {
        // Fetch Reviews For Space
        builder
            .addCase(fetchReviewsForSpace.pending, (state, action) => {
                const { spaceId, pageNumber } = action.meta.arg;
                if (!state.reviewsBySpaceId[spaceId]) { // Initialize if not exists
                    state.reviewsBySpaceId[spaceId] = {
                        items: [],
                        // VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
                        pagination: { // <--- THIS INITIALIZATION IS GOOD
                            PageNumber: pageNumber || 1, // Use pageNumber from arg or default
                            PageSize: action.meta.arg?.pageSize || initialState.pagination?.PageSize || 5, // Use pageSize from arg or slice initial state
                            totalCount: 0,
                            totalPages: 0
                        },
                        // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                        status: 'idle', // Should actually be 'loading' here, but will be set right after
                        error: null
                    };
                }
                state.reviewsBySpaceId[spaceId].status = 'loading';
                state.reviewsBySpaceId[spaceId].error = null;
                console.log(`[ReviewSlice] fetchReviews.pending for ${spaceId}, page ${pageNumber}`);
            })
            .addCase(fetchReviewsForSpace.fulfilled, (state, action) => {
                if (action.payload === null) return; // Skipped fetch
                const { spaceId, items, pageNumber, pageSize, totalCount, totalPages } = action.payload;
                if (state.reviewsBySpaceId[spaceId]) {
                    // If pageNumber > 1, this is "load more" - append items. Otherwise, replace.
                    // For simplicity and to match current ReviewList, we replace.
                    // To implement true "load more", you'd append:
                    // state.reviewsBySpaceId[spaceId].items = pageNumber > 1 ? [...state.reviewsBySpaceId[spaceId].items, ...items] : items;
                    state.reviewsBySpaceId[spaceId].items = items;
                    state.reviewsBySpaceId[spaceId].pagination = { PageNumber: pageNumber, PageSize: pageSize, totalCount, totalPages };
                    state.reviewsBySpaceId[spaceId].status = 'succeeded';
                    state.reviewsBySpaceId[spaceId].error = null;
                    console.log(`[ReviewSlice] fetchReviews.fulfilled for ${spaceId}, received ${items.length} items. Total: ${totalCount}`);
                }
            })
            .addCase(fetchReviewsForSpace.rejected, (state, action) => {
                // action.payload should be { spaceId, error: errorMessage }
                const spaceIdFromPayload = action.payload?.spaceId;
                const errorMessageFromPayload = action.payload?.error;
                // action.meta.arg contains the original arguments passed to the thunk, including spaceId
                const spaceIdFromMeta = action.meta.arg?.spaceId;

                const targetSpaceId = spaceIdFromPayload || spaceIdFromMeta;

                console.error(`[ReviewSlice] fetchReviews.rejected for targetSpaceId: ${targetSpaceId}. Error in payload:`, action.payload, "Meta arg:", action.meta.arg);

                if (targetSpaceId) {
                    // Ensure the entry for this spaceId exists before trying to update it
                    if (!state.reviewsBySpaceId[targetSpaceId]) {
                        state.reviewsBySpaceId[targetSpaceId] = {
                            items: [],
                            pagination: { // Use default pagination values
                                PageNumber: action.meta.arg?.pageNumber || 1,
                                PageSize: action.meta.arg?.pageSize || 5,
                                totalCount: 0,
                                totalPages: 0
                            },
                            status: 'idle', // Initialize before setting to failed
                            error: null
                        };
                    }
                    state.reviewsBySpaceId[targetSpaceId].status = 'failed'; // <--- SETTING TO FAILED
                    state.reviewsBySpaceId[targetSpaceId].error = errorMessageFromPayload || String(action.payload) || 'Unknown error fetching reviews.'; // Ensure error is a string
                    state.reviewsBySpaceId[targetSpaceId].items = []; // Clear items on error
                    console.log(`[ReviewSlice] State for ${targetSpaceId} after rejection:`, JSON.parse(JSON.stringify(state.reviewsBySpaceId[targetSpaceId])));
                } else {
                    console.error('[ReviewSlice] fetchReviews.rejected but could not determine targetSpaceId. Action:', action);
                }
            });

        // Create New Review
        builder
            .addCase(addNewReview.pending, (state) => {
                state.createReviewStatus = 'loading';
                state.createReviewError = null;
            })
            .addCase(addNewReview.fulfilled, (state, action) => {
                state.createReviewStatus = 'succeeded';
                // List is refreshed by the thunk dispatching fetchReviewsForSpace.
                console.log('New review created successfully:', action.payload);
            })
            .addCase(addNewReview.rejected, (state, action) => {
                state.createReviewStatus = 'failed';
                state.createReviewError = action.payload;
            });
    },
});

export const { clearCreateReviewStatus, clearReviewsForSpace, setReviewsPage } = reviewSlice.actions;

// Selectors
export const selectReviewsForSpace = (spaceId) => (state) => state.reviews.reviewsBySpaceId[spaceId]?.items || [];
export const selectReviewsPaginationForSpace = (spaceId) => (state) => state.reviews.reviewsBySpaceId[spaceId]?.pagination || { PageNumber: 1, PageSize: 5, totalCount: 0, totalPages: 0 };
export const selectReviewsStatusForSpace = (spaceId) => (state) => state.reviews.reviewsBySpaceId[spaceId]?.status || 'idle';
export const selectReviewsErrorForSpace = (spaceId) => (state) => state.reviews.reviewsBySpaceId[spaceId]?.error;

export const selectCreateReviewStatus = (state) => state.reviews.createReviewStatus;
export const selectCreateReviewError = (state) => state.reviews.createReviewError;

export default reviewSlice.reducer;