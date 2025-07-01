// src/features/comments/slices/commentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCommentsAPI, createCommentAPI, fetchCommentWithRepliesAPI, updateCommentAPI, deleteCommentAPI } from '../services/commentApi'; // Ensure path is correct
import { updatePostCommentCount } from '../../community/slices/communitySlice'; // *** ADDED IMPORT ***
import { createSelector } from 'reselect'; // *** ADDED IMPORT ***
import { logoutUser } from '../../auth/slices/authSlice'; // Import logout action

const initialPagination = { PageNumber: 1, PageSize: 5, totalCount: 0, totalPages: 0 };

const initialState = {
    comments: [],
    pagination: { ...initialPagination }, // Use a copy
    status: 'idle',
    error: null,
    currentParentEntityType: null,
    currentParentEntityId: null,
    createCommentStatus: 'idle',
    createCommentError: null,
    fetchRepliesStatus: 'idle',
    fetchRepliesError: null,
    updateStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
    updateError: null,
    deleteStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
    deleteError: null,
};

const findCommentRecursive = (commentsArray, commentId) => { /* ... same as your checkpoint ... */
    for (let i = 0; i < commentsArray.length; i++) { const comment = commentsArray[i]; if (comment.id === commentId) { return { comment, parentArray: commentsArray, index: i }; } if (comment.replies && comment.replies.length > 0) { const foundInReply = findCommentRecursive(comment.replies, commentId); if (foundInReply.comment) return foundInReply; } } return { comment: null, parentArray: null, index: -1 };
};

export const fetchCommentsForParent = createAsyncThunk(
    'comments/fetchForParent',
    async ({ parentEntityType, parentId, pageNumber, pageSize }, { getState, dispatch, rejectWithValue }) => {
        const state = getState().comments;
        const currentPage = pageNumber || state.pagination.PageNumber; // Use current page from state if not provided
        const currentSize = pageSize || state.pagination.PageSize; // Use current page size from state
        try {
            const response = await fetchCommentsAPI(parentEntityType, parentId, {
                PageNumber: currentPage, PageSize: currentSize, IncludeReplies: false,
            });
            // *** MODIFIED: Dispatch updatePostCommentCount if parent is "Post" ***
            if (parentEntityType === "Post" && parentId) {
                dispatch(updatePostCommentCount({ postId: parentId, newCommentCount: response.totalCount }));
            }
            return { parentEntityType, parentId, ...response };
        } catch (error) { return rejectWithValue(error.message); }
    }
);

export const addNewComment = createAsyncThunk(
    'comments/addNew',
    async (commentData, { dispatch, getState, rejectWithValue }) => {
        try {
            const newComment = await createCommentAPI(commentData);
            const { parentEntityType, parentEntityId, parentCommentId } = commentData;
            if (parentCommentId) { // It's a reply
                dispatch(incrementReplyCountOptimistic(parentCommentId));
                dispatch(fetchRepliesForComment(parentCommentId));
            } else if (parentEntityType && parentEntityId) { // It's a top-level comment
                // This fetch will trigger updatePostCommentCount in its fulfilled case
                dispatch(fetchCommentsForParent({ parentEntityType, parentId: parentEntityId, pageNumber: 1, forceRefresh: true }));
            }
            return newComment;
        } catch (error) { return rejectWithValue(error.message); }
    }
);

export const fetchRepliesForComment = createAsyncThunk( /* ... same as your checkpoint ... */
    'comments/fetchReplies',
    async (commentId, { rejectWithValue }) => { if (!commentId) return rejectWithValue('Comment ID is required.'); try { const commentWithReplies = await fetchCommentWithRepliesAPI(commentId, true); return commentWithReplies; } catch (error) { return rejectWithValue(error.message); } }
);

// Async thunk để cập nhật comment
export const updateComment = createAsyncThunk(
    'comments/updateComment',
    async ({ commentId, updateData }, { rejectWithValue }) => {
        try {
            const response = await updateCommentAPI(commentId, updateData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update comment');
        }
    }
);

// Async thunk để xóa comment
export const deleteComment = createAsyncThunk(
    'comments/deleteComment',
    async (commentId, { rejectWithValue }) => {
        try {
            await deleteCommentAPI(commentId);
            return commentId;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete comment');
        }
    }
);

const commentSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: { /* ... same reducers as your checkpoint: setCurrentParentEntityForComments, clearCurrentParentEntityForComments, setCommentsPage, clearCreateCommentStatus, toggleRepliesVisibility, incrementReplyCountOptimistic ... */
        setCurrentParentEntityForComments: (state, action) => {
            const { parentEntityType, parentId } = action.payload;
            console.log(`[CommentSlice] setCurrentParentEntity. Current: ${state.currentParentEntityType}/${state.currentParentEntityId}, New: ${parentEntityType}/${parentId}, Current Status: ${state.status}`);
            if (state.currentParentEntityType !== parentEntityType || state.currentParentEntityId !== parentId) {
                state.currentParentEntityType = parentEntityType;
                state.currentParentEntityId = parentId;
                state.comments = [];
                state.pagination = { ...initialPagination }; // Reset to defined initial pagination
                state.status = 'idle'; // CRITICAL: Set to 'idle' to trigger fetch
                state.error = null;
                console.log(`[CommentSlice] Parent CHANGED to ${parentEntityType}/${parentId}. Status set to 'idle', page reset to 1.`);
            } else {
                // If it's the same parent, but we want to force a refresh (e.g. pull to refresh)
                // we could set status to 'idle' here too if it's not already loading.
                // For now, if parent is same, no state change unless explicitly told to refresh.
                console.log(`[CommentSlice] Parent ${parentEntityType}/${parentId} is already current. No change.`);
            }
        },
        clearCurrentParentEntityForComments: (state) => { /* ... same ... */
            state.currentParentEntityType = null; state.currentParentEntityId = null;
            state.comments = []; state.pagination = { ...initialPagination };
            state.status = 'idle'; state.error = null;
        },
        setCommentsPage: (state, action) => { /* ... same, ensure it sets status to 'idle' ... */
            const { parentId, pageNumber } = action.payload;
            if (state.currentParentEntityId === parentId) { // Check if it's for the active parent
                state.pagination.PageNumber = pageNumber;
                state.status = 'idle';
            }
        },


        clearCreateCommentStatus: (state) => { state.createCommentStatus = 'idle'; state.createCommentError = null; },
        clearUpdateStatus: (state) => { state.updateStatus = 'idle'; state.updateError = null; },
        clearDeleteStatus: (state) => { state.deleteStatus = 'idle'; state.deleteError = null; },
        toggleRepliesVisibility: (state, action) => { const commentId = action.payload; const { comment: foundComment } = findCommentRecursive(state.comments, commentId); if (foundComment) { foundComment.showReplies = !foundComment.showReplies; } },
        incrementReplyCountOptimistic: (state, action) => { const parentCommentId = action.payload; const { comment: parentComment } = findCommentRecursive(state.comments, parentCommentId); if (parentComment) { parentComment.replyCount = (parentComment.replyCount || 0) + 1; } },
    },
    extraReducers: (builder) => { /* ... same extraReducers as your checkpoint ... */
        builder.addCase(fetchCommentsForParent.pending, (state, action) => {
            const { parentEntityType, parentId } = action.meta.arg;
            if (state.currentParentEntityType === parentEntityType && state.currentParentEntityId === parentId) {
                state.status = 'loading'; state.error = null;
            }
        });
        builder.addCase(fetchCommentsForParent.fulfilled, (state, action) => {
            if (action.payload && state.currentParentEntityType === action.payload.parentEntityType && state.currentParentEntityId === action.payload.parentId) {
                state.status = 'succeeded';
                state.comments = action.payload.items.map(c => ({ ...c, showReplies: c.showReplies || false, repliesLoading: false, replies: c.replies || [] }));
                state.pagination = { 
                    PageNumber: action.payload.pageNumber, 
                    PageSize: action.payload.pageSize, 
                    totalCount: action.payload.totalCount, 
                    totalPages: action.payload.totalPages 
                };
            }
        });



        builder.addCase(fetchCommentsForParent.rejected, (state, action) => {
            const { parentEntityType, parentId } = action.meta.arg;
            if (state.currentParentEntityType === parentEntityType && state.currentParentEntityId === parentId) {
                state.status = 'failed'; state.error = action.payload?.error || action.payload; state.comments = [];
            }
        });


        builder.addCase(addNewComment.pending, (s) => { s.createCommentStatus = 'loading'; s.createCommentError = null; });
        builder.addCase(addNewComment.fulfilled, (s) => { s.createCommentStatus = 'succeeded'; });
        builder.addCase(addNewComment.rejected, (s, a) => { s.createCommentStatus = 'failed'; s.createCommentError = a.payload; });
        builder.addCase(fetchRepliesForComment.pending, (s, a) => { s.fetchRepliesStatus = 'loading'; s.fetchRepliesError = null; const { comment } = findCommentRecursive(s.comments, a.meta.arg); if (comment) comment.repliesLoading = true; });
        builder.addCase(fetchRepliesForComment.fulfilled, (s, a) => { s.fetchRepliesStatus = 'succeeded'; const pCWR = a.payload; const { comment: fPC, parentArray: pA, index: idx } = findCommentRecursive(s.comments, pCWR.id); if (fPC) { const uC = { ...pCWR, replies: (pCWR.replies || []).map(r => ({ ...r, showReplies: false, repliesLoading: false, replies: r.replies || [] })), showReplies: true, repliesLoading: false, }; if (pA && idx !== -1) pA[idx] = uC; } });
        builder.addCase(fetchRepliesForComment.rejected, (s, a) => { s.fetchRepliesStatus = 'failed'; s.fetchRepliesError = a.payload; const { comment } = findCommentRecursive(s.comments, a.meta.arg); if (comment) comment.repliesLoading = false; });
        
        // Update comment
        builder.addCase(updateComment.pending, (state) => {
            state.updateStatus = 'loading';
            state.updateError = null;
        });
        builder.addCase(updateComment.fulfilled, (state, action) => {
            state.updateStatus = 'succeeded';
            const updatedComment = action.payload;
            const { comment, parentArray, index } = findCommentRecursive(state.comments, updatedComment.id);
            if (comment && parentArray) {
                parentArray[index] = { ...comment, ...updatedComment };
            }
        });
        builder.addCase(updateComment.rejected, (state, action) => {
            state.updateStatus = 'failed';
            state.updateError = action.payload;
        });
        
        // Delete comment
        builder.addCase(deleteComment.pending, (state) => {
            state.deleteStatus = 'loading';
            state.deleteError = null;
        });
        builder.addCase(deleteComment.fulfilled, (state, action) => {
            state.deleteStatus = 'succeeded';
            const deletedCommentId = action.payload;
            const { parentArray, index } = findCommentRecursive(state.comments, deletedCommentId);
            if (parentArray && index >= 0) {
                parentArray.splice(index, 1);
                // Cập nhật totalCount khi xóa comment thành công
                if (state.pagination.totalCount > 0) {
                    state.pagination.totalCount -= 1;
                    // Tính lại totalPages
                    state.pagination.totalPages = Math.ceil(state.pagination.totalCount / state.pagination.PageSize);
                    // Nếu trang hiện tại không còn comment và không phải trang 1, chuyển về trang trước
                    if (state.comments.length === 0 && state.pagination.PageNumber > 1) {
                        state.pagination.PageNumber = Math.max(1, state.pagination.PageNumber - 1);
                        state.status = 'idle'; // Trigger fetch for previous page
                    }
                }
            }
        });
        builder.addCase(deleteComment.rejected, (state, action) => {
            state.deleteStatus = 'failed';
            state.deleteError = action.payload;
        })
        // Clear comments state when user logs out
        .addCase(logoutUser, (state) => {
            Object.assign(state, {
                comments: [],
                pagination: { ...initialPagination },
                status: 'idle',
                error: null,
                currentParentEntityType: null,
                currentParentEntityId: null,
                createCommentStatus: 'idle',
                createCommentError: null,
                fetchRepliesStatus: 'idle',
                fetchRepliesError: null,
                updateStatus: 'idle',
                updateError: null,
                deleteStatus: 'idle',
                deleteError: null,
            });
        });
    },
});

export const { setCurrentParentEntityForComments,
    clearCurrentParentEntityForComments,
    setCommentsPage,
    clearCreateCommentStatus,
    clearUpdateStatus,
    clearDeleteStatus,
    toggleRepliesVisibility,
    incrementReplyCountOptimistic,
} = commentSlice.actions;

const selectSelf = (state) => state.comments; // Select the slice state



export const selectCurrentParentEntityType = createSelector([selectSelf], (commentsState) => commentsState.currentParentEntityType);
export const selectCurrentParentEntityId = createSelector([selectSelf], (commentsState) => commentsState.currentParentEntityId);

export const selectCurrentParentEntityInfo = createSelector(
    [selectCurrentParentEntityType, selectCurrentParentEntityId],
    (type, id) => {
        // console.log('[CommentSlice Selector] selectCurrentParentEntityInfo recomputed. Type:', type, 'ID:', id);
        return { type, id };
    }
);

export const selectCommentsForCurrentParent = createSelector([selectSelf], (commentsState) => commentsState.comments);
export const selectCommentsPagination = createSelector([selectSelf], (commentsState) => commentsState.pagination || initialPagination); // Ensure fallback
export const selectCommentsStatus = createSelector([selectSelf], (commentsState) => commentsState.status);
export const selectCommentsError = createSelector([selectSelf], (commentsState) => commentsState.error);



// *** END MODIFIED ***

export const selectCreateCommentStatus = (state) => state.comments.createCommentStatus;
export const selectCreateCommentError = (state) => state.comments.createCommentError;
export const selectFetchRepliesStatus = (state) => state.comments.fetchRepliesStatus;
// *** MODIFIED: Individual named exports for all selectors ***


// *** END MODIFIED ***
export default commentSlice.reducer;