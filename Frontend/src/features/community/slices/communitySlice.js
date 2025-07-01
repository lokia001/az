// src/features/community/slices/communitySlice.js
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import {
    createCommunityAPI,
    updateCommunityAPI,
    deleteCommunityAPI,
    fetchCommunityDetailAPI,
    searchCommunitiesAPI,
    fetchMyJoinedCommunitiesAPI,
    fetchPostsForCommunityAPI,
    createPostAPI,
    joinCommunityAPI,
    leaveCommunityAPI,
    checkCommunityMembershipAPI,
} from '../services/communityApi'; // Ensure this path is correct
import { logoutUser } from '../../auth/slices/authSlice'; // Import logout action

const initialSearchFilters = { NameKeyword: '', IsPublic: '' };
const initialCommunityPostsPagination = { PageNumber: 1, PageSize: 10, totalCount: 0, totalPages: 0 };

const initialState = {
    myJoinedCommunities: [],
    myJoinedCommunitiesStatus: 'idle',
    myJoinedCommunitiesError: null,
    searchedCommunities: [],
    searchFilters: { ...initialSearchFilters },
    searchPagination: { PageNumber: 1, PageSize: 10, totalCount: 0, totalPages: 0 },
    searchStatus: 'idle',
    searchError: null,
    createCommunityStatus: 'idle',
    createCommunityError: null,
    selectedCommunityId: null,
    selectedCommunityName: null,
    communityPosts: [], // Array of PostSummaryDto, will be augmented with commentsCount
    communityPostsPagination: { ...initialCommunityPostsPagination },
    communityPostsStatus: 'idle',
    communityPostsError: null,
    createPostStatus: 'idle',
    createPostError: null,
    // THÊM: Track post nào đang mở comment để tránh conflict
    activeCommentPostId: null, // Chỉ cho phép 1 post mở comment tại một thời điểm
    // THÊM: Community management states
    updateCommunityStatus: 'idle',
    updateCommunityError: null,
    deleteCommunityStatus: 'idle',
    deleteCommunityError: null,
    communityDetailStatus: 'idle',
    communityDetailError: null,
    communityDetail: null, // CommunityDto khi fetch detail
    // THÊM: Community membership states
    joinCommunityStatus: 'idle',
    joinCommunityError: null,
    leaveCommunityStatus: 'idle',
    leaveCommunityError: null,
    membershipCheckStatus: 'idle',
    membershipCheckError: null,
    currentCommunityMembership: null, // CommunityMemberDto for current community
};

export const fetchMyJoinedCommunities = createAsyncThunk(/* ... as in your checkpoint ... */
    'community/fetchMyJoined', async (_, { rejectWithValue }) => { try { return await fetchMyJoinedCommunitiesAPI(); } catch (error) { return rejectWithValue(error.message); } }
);
export const searchCommunities = createAsyncThunk(/* ... as in your checkpoint ... */
    'community/search', async (argFilters, { getState, rejectWithValue }) => { const s = getState().community; const p = { ...s.searchFilters, PageNumber: s.searchPagination.PageNumber, PageSize: s.searchPagination.PageSize, ...(argFilters || {}) }; try { return await searchCommunitiesAPI(p); } catch (e) { return rejectWithValue(e.message); } }
);
export const createCommunity = createAsyncThunk(/* ... as in your checkpoint ... */
    'community/create', async (data, { dispatch, rejectWithValue }) => { try { const newComm = await createCommunityAPI(data); dispatch(fetchMyJoinedCommunities()); return newComm; } catch (e) { return rejectWithValue(e.message); } }
);

export const fetchCommunityPosts = createAsyncThunk(
    'community/fetchPosts',
    async ({ communityId, pageNumber, pageSize, postFilters = {} }, { getState, rejectWithValue }) => {
        // ... (same as your checkpoint, ensuring paramsForApi is built correctly)
        if (!communityId) return rejectWithValue('Community ID is required.');
        const state = getState().community; // Ensure correct slice name if different
        const currentPage = pageNumber || state.communityPostsPagination.PageNumber;
        const currentSize = pageSize || state.communityPostsPagination.PageSize;
        const paramsForApi = { PageNumber: currentPage, PageSize: currentSize, ...postFilters };
        try {
            const response = await fetchPostsForCommunityAPI(communityId, paramsForApi);
            return { communityIdForState: communityId, ...response };
        } catch (error) { return rejectWithValue(error.message); }
    }
);

export const createNewPost = createAsyncThunk(
    'community/createPost',
    async (postData, { getState, dispatch, rejectWithValue }) => {
        // ... (same as your checkpoint)
        if (!postData.communityId) return rejectWithValue("Cannot create post: Community ID is missing.");
        try {
            const newPost = await createPostAPI(postData);
            const { selectedCommunityId, communityPostsPagination } = getState().community;
            if (selectedCommunityId === newPost.communityId) {
                dispatch(fetchCommunityPosts({
                    communityId: selectedCommunityId,
                    pageNumber: 1,
                    pageSize: communityPostsPagination.PageSize,
                }));
            }
            return newPost;
        } catch (error) { return rejectWithValue(error.message); }
    }
);

// THÊM: Thunk để update community
export const updateCommunity = createAsyncThunk(
    'community/updateCommunity',
    async ({ communityId, updateData }, { dispatch, rejectWithValue }) => {
        try {
            const updatedCommunity = await updateCommunityAPI(communityId, updateData);
            // Refresh joined communities list nếu cần
            dispatch(fetchMyJoinedCommunities());
            return updatedCommunity;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// THÊM: Thunk để delete community
export const deleteCommunity = createAsyncThunk(
    'community/deleteCommunity',
    async (communityId, { dispatch, rejectWithValue }) => {
        try {
            const success = await deleteCommunityAPI(communityId);
            if (success) {
                // Refresh joined communities list
                dispatch(fetchMyJoinedCommunities());
                return communityId;
            } else {
                throw new Error('Delete failed');
            }
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// THÊM: Thunk để fetch community detail
export const fetchCommunityDetail = createAsyncThunk(
    'community/fetchCommunityDetail',
    async (communityId, { rejectWithValue }) => {
        try {
            return await fetchCommunityDetailAPI(communityId);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// THÊM: Thunk để join community
export const joinCommunity = createAsyncThunk(
    'community/joinCommunity',
    async (communityId, { dispatch, rejectWithValue }) => {
        try {
            const membershipResult = await joinCommunityAPI(communityId);
            // Refresh joined communities list
            dispatch(fetchMyJoinedCommunities());
            return membershipResult;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// THÊM: Thunk để leave community
export const leaveCommunity = createAsyncThunk(
    'community/leaveCommunity',
    async (communityId, { dispatch, rejectWithValue }) => {
        try {
            const success = await leaveCommunityAPI(communityId);
            if (success) {
                // Refresh joined communities list
                dispatch(fetchMyJoinedCommunities());
                return communityId;
            } else {
                throw new Error('Leave community failed');
            }
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// THÊM: Thunk để check membership
export const checkMembership = createAsyncThunk(
    'community/checkMembership',
    async (communityId, { rejectWithValue }) => {
        try {
            return await checkCommunityMembershipAPI(communityId);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const communitySlice = createSlice({
    name: 'community',
    initialState,
    reducers: {
        setSelectedCommunity: (state, action) => { /* ... same as your checkpoint ... */
            const { id, name } = action.payload;
            if (state.selectedCommunityId !== id) {
                state.selectedCommunityId = id; state.selectedCommunityName = name || null;
                state.communityPosts = []; state.communityPostsPagination = { ...initialCommunityPostsPagination };
                state.communityPostsStatus = 'idle'; state.communityPostsError = null;
            } else if (name && state.selectedCommunityName !== name) { state.selectedCommunityName = name; }
        },
        clearSelectedCommunity: (state) => { /* ... same as your checkpoint ... */
            state.selectedCommunityId = null; state.selectedCommunityName = null;
            state.communityPosts = []; state.communityPostsPagination = { ...initialCommunityPostsPagination };
            state.communityPostsStatus = 'idle'; state.communityPostsError = null;
        },
        setCommunityPostsPage: (state, action) => { /* ... same as your checkpoint ... */
            state.communityPostsPagination.PageNumber = action.payload;
            state.communityPostsStatus = 'idle';
        },
        clearCommunityPostsError: (state) => { state.communityPostsError = null; },
        clearCreatePostStatus: (state) => { state.createPostStatus = 'idle'; state.createPostError = null; },
        setCommunitySearchFilter: (state, action) => {


        },
        setCommunitySearchFilter: (state, action) => { const { filterName, value } = action.payload; state.searchFilters[filterName] = value; state.searchPagination.PageNumber = 1; state.searchStatus = 'idle'; },
        setCommunitySearchPage: (state, action) => { state.searchPagination.PageNumber = action.payload; state.searchStatus = 'idle'; },
        resetCommunitySearchFilters: (state) => { state.searchFilters = { ...initialSearchFilters }; state.searchPagination.PageNumber = 1; state.searchStatus = 'idle'; },
        clearCreateCommunityStatus: (state) => { state.createCommunityStatus = 'idle'; state.createCommunityError = null; },


        // *** ADDED Reducer to update a specific post's comment count ***
        updatePostCommentCount: (state, action) => {
            const { postId, newCommentCount } = action.payload;
            const postIndex = state.communityPosts.findIndex(p => p.id === postId);
            if (postIndex !== -1) {
                // Ensure commentsCount is treated as a number
                state.communityPosts[postIndex].commentsCount = Number(newCommentCount) || 0;
                console.log(`[CommunitySlice] Updated commentsCount for post ${postId} to ${newCommentCount}`);
            } else {
                console.warn(`[CommunitySlice] updatePostCommentCount: Post with ID ${postId} not found in communityPosts.`);
            }
        },
        
        // *** THÊM: Quản lý post nào đang mở comment ***
        setActiveCommentPost: (state, action) => {
            const postId = action.payload;
            if (state.activeCommentPostId !== postId) {
                console.log(`[CommunitySlice] Setting active comment post from ${state.activeCommentPostId} to ${postId}`);
                state.activeCommentPostId = postId;
            }
        },
        clearActiveCommentPost: (state) => {
            console.log(`[CommunitySlice] Clearing active comment post ${state.activeCommentPostId}`);
            state.activeCommentPostId = null;
        },

        // *** THÊM: Clear community management status ***
        clearUpdateCommunityStatus: (state) => { state.updateCommunityStatus = 'idle'; state.updateCommunityError = null; },
        clearDeleteCommunityStatus: (state) => { state.deleteCommunityStatus = 'idle'; state.deleteCommunityError = null; },
        clearCommunityDetailStatus: (state) => { state.communityDetailStatus = 'idle'; state.communityDetailError = null; },

        // *** THÊM: Clear membership status actions ***
        clearJoinCommunityStatus: (state) => { state.joinCommunityStatus = 'idle'; state.joinCommunityError = null; },
        clearLeaveCommunityStatus: (state) => { state.leaveCommunityStatus = 'idle'; state.leaveCommunityError = null; },
        clearMembershipCheckStatus: (state) => { state.membershipCheckStatus = 'idle'; state.membershipCheckError = null; },
        clearCurrentMembership: (state) => { state.currentCommunityMembership = null; }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCommunityPosts.pending, (state) => {
                state.communityPostsStatus = 'loading';
                state.communityPostsError = null;
            })
            .addCase(fetchCommunityPosts.fulfilled, (state, action) => {
                if (state.selectedCommunityId === action.payload.communityIdForState) {
                    state.communityPostsStatus = 'succeeded';
                    state.communityPosts = action.payload.items.map(post => ({
                        ...post,
                        commentsCount: typeof post.commentsCount === 'number'
                            ? post.commentsCount
                            : 0
                    }));
                    state.communityPostsPagination = {
                        PageNumber: action.payload.pageNumber,
                        PageSize: action.payload.pageSize,
                        totalCount: action.payload.totalCount,
                        totalPages: action.payload.totalPages
                    };
                }
            })
            .addCase(fetchCommunityPosts.rejected, (state, action) => {
                state.communityPostsStatus = 'failed';
                state.communityPostsError = action.payload;
                state.communityPosts = [];
            });

        builder
            .addCase(createNewPost.pending, (state) => { state.createPostStatus = 'loading'; state.createPostError = null; })
            .addCase(createNewPost.fulfilled, (state) => { state.createPostStatus = 'succeeded'; })
            .addCase(createNewPost.rejected, (state, action) => { state.createPostStatus = 'failed'; state.createPostError = action.payload; });

        // ... (other extraReducers for fetchMyJoinedCommunities, searchCommunities, createCommunity - same as your checkpoint) ...
        builder.addCase(fetchMyJoinedCommunities.pending, (s) => { s.myJoinedCommunitiesStatus = 'loading'; s.myJoinedCommunitiesError = null; }).addCase(fetchMyJoinedCommunities.fulfilled, (s, a) => { s.myJoinedCommunitiesStatus = 'succeeded'; s.myJoinedCommunities = a.payload; }).addCase(fetchMyJoinedCommunities.rejected, (s, a) => { s.myJoinedCommunitiesStatus = 'failed'; s.myJoinedCommunitiesError = a.payload; });
        builder.addCase(searchCommunities.pending, (s) => { s.searchStatus = 'loading'; s.searchError = null; }).addCase(searchCommunities.fulfilled, (s, a) => { s.searchStatus = 'succeeded'; s.searchedCommunities = a.payload.items; s.searchPagination = { PageNumber: a.payload.pageNumber, PageSize: a.payload.pageSize, totalCount: a.payload.totalCount, totalPages: a.payload.totalPages }; }).addCase(searchCommunities.rejected, (s, a) => { s.searchStatus = 'failed'; s.searchError = a.payload; });
        builder.addCase(createCommunity.pending, (s) => { s.createCommunityStatus = 'loading'; s.createCommunityError = null; }).addCase(createCommunity.fulfilled, (s, a) => { s.createCommunityStatus = 'succeeded'; }).addCase(createCommunity.rejected, (s, a) => { s.createCommunityStatus = 'failed'; s.createCommunityError = a.payload; });

        // *** THÊM extraReducers cho community management ***
        builder
            .addCase(fetchCommunityDetail.pending, (state) => { state.communityDetailStatus = 'loading'; state.communityDetailError = null; })
            .addCase(fetchCommunityDetail.fulfilled, (state, action) => { state.communityDetailStatus = 'succeeded'; state.communityDetail = action.payload; })
            .addCase(fetchCommunityDetail.rejected, (state, action) => { state.communityDetailStatus = 'failed'; state.communityDetailError = action.payload; });

        builder
            .addCase(updateCommunity.pending, (state) => { state.updateCommunityStatus = 'loading'; state.updateCommunityError = null; })
            .addCase(updateCommunity.fulfilled, (state, action) => { 
                state.updateCommunityStatus = 'succeeded'; 
                // Cập nhật community detail nếu cùng ID
                if (state.communityDetail && state.communityDetail.id === action.payload.id) {
                    state.communityDetail = action.payload;
                }
            })
            .addCase(updateCommunity.rejected, (state, action) => { state.updateCommunityStatus = 'failed'; state.updateCommunityError = action.payload; });

        builder
            .addCase(deleteCommunity.pending, (state) => { state.deleteCommunityStatus = 'loading'; state.deleteCommunityError = null; })
            .addCase(deleteCommunity.fulfilled, (state, action) => { 
                state.deleteCommunityStatus = 'succeeded'; 
                // Clear community detail nếu bị xóa
                if (state.communityDetail && state.communityDetail.id === action.payload) {
                    state.communityDetail = null;
                }
            })
            .addCase(deleteCommunity.rejected, (state, action) => { state.deleteCommunityStatus = 'failed'; state.deleteCommunityError = action.payload; });

        // *** THÊM extraReducers cho community membership ***
        builder
            .addCase(joinCommunity.pending, (state) => { state.joinCommunityStatus = 'loading'; state.joinCommunityError = null; })
            .addCase(joinCommunity.fulfilled, (state, action) => { 
                state.joinCommunityStatus = 'succeeded'; 
                state.currentCommunityMembership = action.payload;
                // Reset membership check status to force re-check
                state.membershipCheckStatus = 'idle';
            })
            .addCase(joinCommunity.rejected, (state, action) => { state.joinCommunityStatus = 'failed'; state.joinCommunityError = action.payload; });

        builder
            .addCase(leaveCommunity.pending, (state) => { state.leaveCommunityStatus = 'loading'; state.leaveCommunityError = null; })
            .addCase(leaveCommunity.fulfilled, (state, action) => { 
                state.leaveCommunityStatus = 'succeeded'; 
                state.currentCommunityMembership = null;
                // Reset membership check status to force re-check
                state.membershipCheckStatus = 'idle';
            })
            .addCase(leaveCommunity.rejected, (state, action) => { state.leaveCommunityStatus = 'failed'; state.leaveCommunityError = action.payload; });

        builder
            .addCase(checkMembership.pending, (state) => { state.membershipCheckStatus = 'loading'; state.membershipCheckError = null; })
            .addCase(checkMembership.fulfilled, (state, action) => { 
                state.membershipCheckStatus = 'succeeded'; 
                state.currentCommunityMembership = action.payload; // null if not member
            })
            .addCase(checkMembership.rejected, (state, action) => { state.membershipCheckStatus = 'failed'; state.membershipCheckError = action.payload; })
            // Clear community state when user logs out
            .addCase(logoutUser, clearCommunityStateOnLogout);
    },
});

export const {
    setSelectedCommunity, clearSelectedCommunity, setCommunityPostsPage, clearCommunityPostsError,
    clearCreatePostStatus,
    setCommunitySearchFilter, setCommunitySearchPage, resetCommunitySearchFilters, clearCreateCommunityStatus,
    updatePostCommentCount, // *** EXPORTED NEW ACTION ***
    setActiveCommentPost, clearActiveCommentPost, // *** THÊM exports cho comment post management ***
    clearUpdateCommunityStatus, clearDeleteCommunityStatus, clearCommunityDetailStatus, // *** THÊM exports cho community management ***
    clearJoinCommunityStatus, clearLeaveCommunityStatus, clearMembershipCheckStatus, clearCurrentMembership // *** THÊM exports cho community membership management ***
} = communitySlice.actions;

// Selectors
export const selectSelectedCommunityId = (state) => state.community.selectedCommunityId;
export const selectSelectedCommunityName = (state) => state.community.selectedCommunityName;
export const selectCommunityPosts = (state) => state.community.communityPosts;
export const selectCommunityPostsPagination = (state) => state.community.communityPostsPagination;
export const selectCommunityPostsStatus = (state) => state.community.communityPostsStatus;
export const selectCommunityPostsError = (state) => state.community.communityPostsError;
export const selectCreatePostStatus = (state) => state.community.createPostStatus;
export const selectCreatePostError = (state) => state.community.createPostError;
export const selectMyJoinedCommunities = (state) => state.community.myJoinedCommunities;
export const selectSearchedCommunities = (state) => state.community.searchedCommunities;
export const selectCreateCommunityStatus = (state) => state.community.createCommunityStatus;
export const selectCreateCommunityError = (state) => state.community.createCommunityError;
export const selectMyJoinedCommunitiesStatus = (state) => state.community.myJoinedCommunitiesStatus;
export const selectMyJoinedCommunitiesError = (state) => state.community.myJoinedCommunitiesError;
export const selectSearchStatus = (state) => state.community.searchStatus;
export const selectSearchError = (state) => state.community.searchError;
// *** THÊM selector cho active comment post ***
export const selectActiveCommentPostId = (state) => state.community.activeCommentPostId;

// *** THÊM selectors cho community management ***
export const selectCommunityDetail = (state) => state.community.communityDetail;
export const selectCommunityDetailStatus = (state) => state.community.communityDetailStatus;
export const selectCommunityDetailError = (state) => state.community.communityDetailError;
export const selectUpdateCommunityStatus = (state) => state.community.updateCommunityStatus;
export const selectUpdateCommunityError = (state) => state.community.updateCommunityError;
export const selectDeleteCommunityStatus = (state) => state.community.deleteCommunityStatus;
export const selectDeleteCommunityError = (state) => state.community.deleteCommunityError;

// *** THÊM selectors cho community membership ***
export const selectJoinCommunityStatus = (state) => state.community.joinCommunityStatus;
export const selectJoinCommunityError = (state) => state.community.joinCommunityError;
export const selectLeaveCommunityStatus = (state) => state.community.leaveCommunityStatus;
export const selectLeaveCommunityError = (state) => state.community.leaveCommunityError;
export const selectMembershipCheckStatus = (state) => state.community.membershipCheckStatus;
export const selectMembershipCheckError = (state) => state.community.membershipCheckError;
export const selectCurrentCommunityMembership = (state) => state.community.currentCommunityMembership;
export const selectIsCurrentUserMemberOfSelectedCommunity = (state) => {
    return state.community.currentCommunityMembership !== null;
};

// *** THÊM: Selector để check membership cho một community cụ thể ***
// Cache for memoized selectors per communityId
const membershipSelectorCache = new Map();

export const selectIsCurrentUserMemberOfCommunity = (communityId) => {
    if (!communityId) {
        // Return a static selector that always returns false for no community
        return () => false;
    }
    
    // Check if we already have a memoized selector for this communityId
    if (!membershipSelectorCache.has(communityId)) {
        // Create a new memoized selector for this specific communityId
        const selector = createSelector(
            [
                (state) => state.community.selectedCommunityId,
                (state) => state.community.currentCommunityMembership,
                (state) => state.community.myJoinedCommunities
            ],
            (selectedCommunityId, currentMembership, joinedCommunities) => {
                // Check in currentCommunityMembership first
                if (selectedCommunityId === communityId) {
                    const result = currentMembership !== null;
                    console.log(`[selectIsCurrentUserMemberOfCommunity] Using currentCommunityMembership: communityId=${communityId}, selectedCommunityId=${selectedCommunityId}, currentMembership=${!!currentMembership}, result=${result}`);
                    return result;
                }
                
                // Fallback: check in myJoinedCommunities
                const result = joinedCommunities.some(membership => membership.communityId === communityId);
                console.log(`[selectIsCurrentUserMemberOfCommunity] Using myJoinedCommunities: communityId=${communityId}, joinedCommunitiesCount=${joinedCommunities.length}, joinedCommunityIds=[${joinedCommunities.map(m => m.communityId).join(', ')}], result=${result}`);
                return result;
            }
        );
        
        membershipSelectorCache.set(communityId, selector);
    }
    
    return membershipSelectorCache.get(communityId);
};

// Clear community state when user logs out
const clearCommunityStateOnLogout = (state) => {
    // Clear selector cache to prevent memory leaks
    membershipSelectorCache.clear();
    
    Object.assign(state, {
        myJoinedCommunities: [],
        myJoinedCommunitiesStatus: 'idle',
        myJoinedCommunitiesError: null,
        searchedCommunities: [],
        searchFilters: { ...initialSearchFilters },
        searchPagination: { PageNumber: 1, PageSize: 10, totalCount: 0, totalPages: 0 },
        searchStatus: 'idle',
        searchError: null,
        selectedCommunityId: null,
        selectedCommunityName: null,
        communityPosts: [],
        communityPostsStatus: 'idle',
        communityPostsError: null,
        communityPostsPagination: { ...initialCommunityPostsPagination },
        communityDetail: null,
        communityDetailStatus: 'idle',
        communityDetailError: null,
        activeCommentPostId: null,
        // Clear membership state
        joinCommunityStatus: 'idle',
        joinCommunityError: null,
        leaveCommunityStatus: 'idle',
        leaveCommunityError: null,
        membershipCheckStatus: 'idle',
        membershipCheckError: null,
        currentCommunityMembership: null,
    });
};

export default communitySlice.reducer;