// src/features/community/slices/communitySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createCommunityAPI,
    searchCommunitiesAPI,
    fetchMyJoinedCommunitiesAPI,
    fetchPostsForCommunityAPI,
    createPostAPI,
} from '../services/communityApi'; // Ensure this path is correct

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
        }
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
    },
});

export const {
    setSelectedCommunity, clearSelectedCommunity, setCommunityPostsPage, clearCommunityPostsError,
    clearCreatePostStatus,
    setCommunitySearchFilter, setCommunitySearchPage, resetCommunitySearchFilters, clearCreateCommunityStatus,
    updatePostCommentCount // *** EXPORTED NEW ACTION ***
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


export default communitySlice.reducer;