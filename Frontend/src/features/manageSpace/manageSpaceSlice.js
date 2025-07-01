import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/api';

export const fetchSpaces = createAsyncThunk(
    'manageSpace/fetchSpaces',
    async (_, { getState }) => {
        try {
            // Get current user from auth state - NOTE: it's stored as "user" not "currentUser"
            const currentUser = getState().auth.user;
            
            console.log("Current auth state:", getState().auth);
            
            if (!currentUser || !currentUser.id) {
                console.error("No authenticated user found or user ID is missing");
                console.log("Current auth state user:", currentUser);
                // Instead of throwing an error, return empty array to prevent crashes
                return { items: [] };
            }
            
            const ownerId = currentUser.id;
            console.log("Fetching spaces for owner ID:", ownerId);
            
            // Use owner/{ownerId} endpoint pattern from the controller
            const response = await api.getOwnerSpaces(ownerId);
            console.log("=> fetch thunk raw response:", response);
            
            // Debug the structure of the returned data
            if (response && typeof response === 'object') {
                if (Array.isArray(response)) {
                    console.log("Response is an array with length:", response.length);
                    if (response.length > 0) {
                        console.log("First item example:", response[0]);
                    }
                    // Convert array response to paginated format for consistency
                    return {
                        items: response,
                        pageNumber: 1,
                        pageSize: response.length,
                        totalCount: response.length,
                        totalPages: 1
                    };
                } else {
                    console.log("Response is an object with keys:", Object.keys(response));
                    if (response.items && Array.isArray(response.items)) {
                        console.log("Items array length:", response.items.length);
                        if (response.items.length > 0) {
                            console.log("First item example:", response.items[0]);
                        }
                        // Return the paginated response as is
                        return response;
                    } else {
                        // If response is an object but doesn't have items array, wrap it
                        return {
                            items: [response],
                            pageNumber: 1,
                            pageSize: 1,
                            totalCount: 1,
                            totalPages: 1
                        };
                    }
                }
            }
            
            // Default return if response is not in expected format
            return { items: [] };
        } catch (error) {
            console.error("Error in fetchSpaces thunk:", error);
            if (error.response && error.response.status === 404) {
                // Nếu lỗi 404, trả về một array rỗng
                return { items: [] };
            } else if (error.response && error.response.status === 405) {
                // Method not allowed - may be trying the wrong endpoint
                console.error("Method not allowed error - check API endpoint configuration");
                return { items: [] };
            }
            // Các lỗi khác vẫn throw để component có thể hiển thị thông báo lỗi
            throw error;
        }
    }
);


export const createSpaceAsync = createAsyncThunk(
    'manageSpace/createSpace',
    async (space, { rejectWithValue }) => {
        try {
            console.log("Creating space with data:", space);
            const response = await api.createSpace(space);
            console.log("Space created successfully:", response);
            return response;
        } catch (error) {
            console.error("Error creating space:", error);
            // Better error handling to prevent navigation
            return rejectWithValue(
                error.response?.data?.message || 
                error.message || 
                'Có lỗi xảy ra khi tạo không gian'
            );
        }
    }
);

export const updateSpaceAsync = createAsyncThunk(
    'manageSpace/updateSpace',
    async ({ id, updatedSpace }) => {
        try {
            console.log("Updating space with ID:", id, "and data:", updatedSpace);
            const response = await api.updateSpace(id, updatedSpace);
            console.log("Space updated successfully:", response);
            return response;
        } catch (error) {
            console.error("Error updating space:", error);
            throw error;
        }
    }
);

export const deleteSpaceAsync = createAsyncThunk(
    'manageSpace/deleteSpace',
    async (id) => {
        await api.deleteSpace(id);
        return id; // Return the ID for local state update
    }
);

const manageSlice = createSlice({
    name: 'manageSpace',
    initialState: {
        spaces: [],
        loading: 'idle',
        error: null,
        pagination: {
            pageNumber: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 1
        },
        createStatus: 'idle',
        createError: null,
        updateStatus: 'idle',
        updateError: null,
        deleteStatus: 'idle',
        deleteError: null
    },
    reducers: {
        resetStatus: (state) => {
            state.createStatus = 'idle';
            state.updateStatus = 'idle';
            state.deleteStatus = 'idle';
            state.createError = null;
            state.updateError = null;
            state.deleteError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSpaces.pending, (state) => {
                state.loading = 'pending';
            })
            .addCase(fetchSpaces.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                console.log("=> check fulfilled:", action.payload);
                
                // Handle paginated response structure
                if (action.payload && action.payload.items && Array.isArray(action.payload.items)) {
                    state.spaces = action.payload.items;
                    // Store pagination info
                    state.pagination = {
                        pageNumber: action.payload.pageNumber,
                        pageSize: action.payload.pageSize,
                        totalCount: action.payload.totalCount,
                        totalPages: action.payload.totalPages
                    };
                } else {
                    // Handle non-paginated response or empty response
                    state.spaces = Array.isArray(action.payload) ? action.payload : [];
                    state.pagination = {
                        pageNumber: 1,
                        pageSize: 10,
                        totalCount: Array.isArray(action.payload) ? action.payload.length : 0,
                        totalPages: 1
                    };
                }
            })
            .addCase(fetchSpaces.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.error.message;
            })
            .addCase(createSpaceAsync.pending, (state) => {
                state.createStatus = 'loading';
                state.createError = null;
            })
            .addCase(createSpaceAsync.fulfilled, (state, action) => {
                state.createStatus = 'succeeded';
                state.createError = null;
            })
            .addCase(createSpaceAsync.rejected, (state, action) => {
                state.createStatus = 'failed';
                state.createError = action.error.message;
            })
            .addCase(updateSpaceAsync.pending, (state) => {
                state.updateStatus = 'loading';
                state.updateError = null;
            })
            .addCase(updateSpaceAsync.fulfilled, (state, action) => {
                state.updateStatus = 'succeeded';
                state.updateError = null;
                // Update the space in the spaces array if it exists
                const index = state.spaces.findIndex(space => space.id === action.payload.id);
                if (index !== -1) {
                    state.spaces[index] = action.payload;
                }
            })
            .addCase(updateSpaceAsync.rejected, (state, action) => {
                state.updateStatus = 'failed';
                state.updateError = action.error.message;
            })
            .addCase(deleteSpaceAsync.pending, (state) => {
                state.deleteStatus = 'loading';
                state.deleteError = null;
            })
            .addCase(deleteSpaceAsync.fulfilled, (state, action) => {
                state.deleteStatus = 'succeeded';
                state.deleteError = null;
                // Remove the deleted space from the spaces array
                state.spaces = state.spaces.filter(space => space.id !== action.payload);
            })
            .addCase(deleteSpaceAsync.rejected, (state, action) => {
                state.deleteStatus = 'failed';
                state.deleteError = action.error.message;
            })
    },
});

export const { resetStatus } = manageSlice.actions;
export const selectManageSpaces = (state) => state?.manageSpace?.spaces || []; // Ensure we always return an array
export const selectManageSpaceLoading = (state) => state?.manageSpace?.loading || 'idle'; 
export const selectManageSpaceError = (state) => state?.manageSpace?.error;
export const selectManageSpacePagination = (state) => state?.manageSpace?.pagination || {
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1
};

export default manageSlice.reducer;