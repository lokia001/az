// src/features/posts/slices/postDetailSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPostDetailAPI } from '../services/postApi'; // Assuming postApi.js is in the same directory

const initialState = {
    currentPost: null, // Will hold the full PostDto object
    status: 'idle',    // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

export const fetchPostDetails = createAsyncThunk(
    'postDetail/fetchDetails',
    async (postId, { rejectWithValue }) => {
        console.log('[PostDetailSlice] fetchPostDetails thunk for postId:', postId);
        if (!postId) {
            return rejectWithValue('Post ID is missing for fetching details.');
        }
        try {
            const postData = await fetchPostDetailAPI(postId); // Returns PostDto
            console.log('[PostDetailSlice] fetchPostDetails thunk success, data:', postData);
            return postData;
        } catch (error) {
            console.error('[PostDetailSlice] fetchPostDetails thunk FAILED. Error:', error.message);
            return rejectWithValue(error.message || 'Failed to load post details.');
        }
    }
);

const postDetailSlice = createSlice({
    name: 'postDetail',
    initialState,
    reducers: {
        clearCurrentPostDetail: (state) => {
            state.currentPost = null;
            state.status = 'idle';
            state.error = null;
            console.log('[PostDetailSlice] Cleared current post detail.');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPostDetails.pending, (state) => {
                state.status = 'loading';
                state.currentPost = null; // Clear previous post while loading new one
                state.error = null;
            })
            .addCase(fetchPostDetails.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentPost = action.payload; // The fetched PostDto
                state.error = null;
            })
            .addCase(fetchPostDetails.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload; // Error message string
                state.currentPost = null;
            });
    },
});

export const { clearCurrentPostDetail } = postDetailSlice.actions;

export const selectCurrentPost = (state) => state.postDetail.currentPost;
export const selectPostDetailStatus = (state) => state.postDetail.status;
export const selectPostDetailError = (state) => state.postDetail.error;

export default postDetailSlice.reducer;