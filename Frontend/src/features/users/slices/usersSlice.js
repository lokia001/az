// src/features/users/slices/usersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUsersAPI, updateUserAPI, deleteUserAPI } from '../services/userApi';

const initialFilters = {
    Username: '',
    Email: '',
    Role: '',
    IsActive: '',
};

const initialState = {
    users: [],
    filters: { ...initialFilters },
    pagination: {
        PageNumber: 1,
        PageSize: 10,
        totalCount: 0,
        totalPages: 0,
    },
    status: 'idle',
    error: null,
    updateStatus: 'idle',
    updateError: null,
};

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (params = {}, { getState, rejectWithValue }) => {
        const state = getState().users;
        const apiParams = {
            ...state.filters,
            PageNumber: state.pagination.PageNumber,
            PageSize: state.pagination.PageSize,
            ...params,
        };

        try {
            const response = await fetchUsersAPI(apiParams);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch users.');
        }
    }
);

export const updateUser = createAsyncThunk(
    'users/updateUser',
    async ({ userId, userData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await updateUserAPI(userId, userData);
            dispatch(fetchUsers()); // Refresh the list
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update user.');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (userId, { dispatch, rejectWithValue }) => {
        try {
            await deleteUserAPI(userId);
            dispatch(fetchUsers()); // Refresh the list
            return userId;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete user.');
        }
    }
);

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setUserFilter: (state, action) => {
            const { filterName, value } = action.payload;
            state.filters[filterName] = value;
            state.pagination.PageNumber = 1;
            state.status = 'idle';
        },
        setUserPage: (state, action) => {
            state.pagination.PageNumber = action.payload;
            state.status = 'idle';
        },
        resetUserFilters: (state) => {
            state.filters = { ...initialFilters };
            state.pagination.PageNumber = 1;
            state.status = 'idle';
        },
        clearUserError: (state) => {
            state.error = null;
        },
        clearUpdateStatus: (state) => {
            state.updateStatus = 'idle';
            state.updateError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.users = action.payload.items;
                state.pagination = {
                    PageNumber: action.payload.pageNumber,
                    PageSize: action.payload.pageSize,
                    totalCount: action.payload.totalCount,
                    totalPages: action.payload.totalPages,
                };
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.users = [];
            })
            .addCase(updateUser.pending, (state) => {
                state.updateStatus = 'loading';
                state.updateError = null;
            })
            .addCase(updateUser.fulfilled, (state) => {
                state.updateStatus = 'succeeded';
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.updateStatus = 'failed';
                state.updateError = action.payload;
            })
            .addCase(deleteUser.pending, (state) => {
                state.updateStatus = 'loading';
                state.updateError = null;
            })
            .addCase(deleteUser.fulfilled, (state) => {
                state.updateStatus = 'succeeded';
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.updateStatus = 'failed';
                state.updateError = action.payload;
            });
    },
});

export const {
    setUserFilter,
    setUserPage,
    resetUserFilters,
    clearUserError,
    clearUpdateStatus,
} = usersSlice.actions;

// Selectors
export const selectAllUsers = (state) => state.users.users;
export const selectUserFilters = (state) => state.users.filters;
export const selectUserPagination = (state) => state.users.pagination;
export const selectUserStatus = (state) => state.users.status;
export const selectUserError = (state) => state.users.error;
export const selectUpdateStatus = (state) => state.users.updateStatus;
export const selectUpdateError = (state) => state.users.updateError;

export default usersSlice.reducer;