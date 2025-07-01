import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPostDetailAPI, updatePostAPI, deletePostAPI } from '../services/postApi';
import { logoutUser } from '../../auth/slices/authSlice'; // Import logout action

// Async thunk để lấy chi tiết post
export const fetchPostDetail = createAsyncThunk(
  'postDetail/fetchPostDetail',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await fetchPostDetailAPI(postId);
      console.log('[PostDetailSlice] fetchPostDetail response:', response);
      return response;
    } catch (error) {
      console.error('[PostDetailSlice] fetchPostDetail error:', error);
      return rejectWithValue(error.message || 'Failed to fetch post detail');
    }
  }
);

// Async thunk để cập nhật post
export const updatePost = createAsyncThunk(
  'postDetail/updatePost',
  async ({ postId, updateData }, { rejectWithValue }) => {
    try {
      const response = await updatePostAPI(postId, updateData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update post');
    }
  }
);

// Async thunk để xóa post
export const deletePost = createAsyncThunk(
  'postDetail/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await deletePostAPI(postId);
      return postId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete post');
    }
  }
);

const initialState = {
  post: null,
  loading: false,
  error: null,
  updateStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
  updateError: null,
  deleteStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
  deleteError: null,
};

const postDetailSlice = createSlice({
  name: 'postDetail',
  initialState,
  reducers: {
    clearPostDetail: (state) => {
      state.post = null;
      state.error = null;
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
      // Fetch post detail
      .addCase(fetchPostDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.post = action.payload;
        state.error = null;
      })
      .addCase(fetchPostDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update post
      .addCase(updatePost.pending, (state) => {
        state.updateStatus = 'loading';
        state.updateError = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        state.post = action.payload;
        state.updateError = null;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.updateError = action.payload;
      })
      // Delete post
      .addCase(deletePost.pending, (state) => {
        state.deleteStatus = 'loading';
        state.deleteError = null;
      })
      .addCase(deletePost.fulfilled, (state) => {
        state.deleteStatus = 'succeeded';
        state.deleteError = null;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.deleteError = action.payload;
      })
      // Clear post detail state when user logs out
      .addCase(logoutUser, (state) => {
        state.post = null;
        state.loading = false;
        state.error = null;
        state.updateStatus = 'idle';
        state.updateError = null;
        state.deleteStatus = 'idle';
        state.deleteError = null;
      });
  },
});

export const { clearPostDetail, clearUpdateStatus, clearDeleteStatus } = postDetailSlice.actions;

export default postDetailSlice.reducer;
