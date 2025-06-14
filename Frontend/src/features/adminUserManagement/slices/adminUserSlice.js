// src/features/adminUserManagement/slices/adminUserSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchAdminUsersAPI,
    // fetchAdminUserByIdAPI, // For later
    // setAdminUserActiveStatusAPI, // For later
    changeAdminUserRoleAPI,
} from '../services/adminUserApi';

const initialFilters = {
    Username: '',
    Email: '',
    Role: '', // Empty string for "Any" role
    IsActive: '', // Empty string for "Any" status (true/false for specific)
};

const initialState = {
    users: [], // Array of UserDto
    filters: { ...initialFilters },
    pagination: {
        PageNumber: 1,
        PageSize: 10,
        totalCount: 0,
        totalPages: 0,
    },
    currentUserDetail: null, // For viewing/editing a specific user later
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    listError: null,
    actionStatus: 'idle', // For PUT operations
    actionError: null,    // For PUT operations
};

export const fetchAdminUsers = createAsyncThunk(
    'adminUsers/fetchAdminUsers',
    async (argFilters, { getState, rejectWithValue }) => {
        // argFilters can override current filters for a specific fetch, or use state
        const state = getState().adminUsers;
        const params = {
            ...state.filters,
            PageNumber: state.pagination.PageNumber,
            PageSize: state.pagination.PageSize,
            ...(argFilters || {}), // Override with any passed filters/pagination
        };
        console.log('[AdminUserSlice] fetchAdminUsers thunk with params:', params);
        try {
            const response = await fetchAdminUsersAPI(params); // Expects PagedResultDto<UserDto>
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch users.');
        }
    }
);

// *** NEW THUNK for Changing User Role ***
export const changeUserRole = createAsyncThunk(
    'adminUsers/changeUserRole',
    async ({ userId, newRole }, { rejectWithValue, dispatch }) => {
        console.log(`[AdminUserSlice] changeUserRole thunk: userId=${userId}, newRole=${newRole}`);
        try {
            const response = await changeAdminUserRoleAPI(userId, newRole); // API call
            // After successful role change, refresh the user list to show updated role
            // Or, update the specific user in the list locally if API returns updated user
            // For simplicity and consistency, let's re-fetch the current page of users.
            dispatch(fetchAdminUsers()); // This will use current filters and pagination
            return { userId, newRole, message: response.message }; // Pass success message and identifiers
        } catch (error) {
            // error.message is from changeAdminUserRoleAPI
            return rejectWithValue(error.message || 'Failed to change user role.');
        }
    }
);

// Add thunk for setUserActiveStatus later

const adminUserSlice = createSlice({
    name: 'adminUsers',
    initialState,
    reducers: {
        setAdminUserFilter: (state, action) => {
            const { filterName, value } = action.payload;
            state.filters[filterName] = value;
            state.pagination.PageNumber = 1; // Reset to page 1 on filter change
            state.status = 'idle'; // Allow re-fetch
        },
        setAdminUserPage: (state, action) => {
            state.pagination.PageNumber = action.payload;
            state.status = 'idle'; // Allow re-fetch for new page
        },
        resetAdminUserFilters: (state) => {
            state.filters = { ...initialFilters };
            state.pagination.PageNumber = 1;
            state.status = 'idle';
        },
        clearAdminUserListError: (state) => {
            state.listError = null;
        }
        ,
        prepareUserForAction: (state, action) => { // Call this when opening a modal
            state.userForAction = action.payload; // payload is the user object from the list
            state.actionStatus = 'idle';
            state.actionError = null;
        },
        clearUserForAction: (state) => { // Call this when closing a modal
            state.userForAction = null;
            state.actionStatus = 'idle';
            state.actionError = null;
        },
        clearActionError: (state) => {
            state.actionError = null;
            if (state.actionStatus === 'failed') state.actionStatus = 'idle';
        }
    },
    // Add reducers for handling results of PUT operations later

    extraReducers: (builder) => {
        // Fetch Users List
        builder
            .addCase(fetchAdminUsers.pending, (state) => {
                state.status = 'loading';
                state.listError = null;
            })
            .addCase(fetchAdminUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.users = action.payload.items;
                state.pagination = {
                    PageNumber: action.payload.pageNumber,
                    PageSize: action.payload.pageSize,
                    totalCount: action.payload.totalCount,
                    totalPages: action.payload.totalPages,
                };
            })
            .addCase(fetchAdminUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.listError = action.payload;
                state.users = []; // Clear users on error
            });

        builder
            .addCase(changeUserRole.pending, (state) => {
                state.actionStatus = 'loading';
                state.actionError = null;
            })
            .addCase(changeUserRole.fulfilled, (state, action) => {
                state.actionStatus = 'succeeded';
                // The list is re-fetched by the thunk, so no need to manually update state.users here.
                // Optionally, you could update the specific user if the API returned the updated user object:
                // const index = state.users.findIndex(user => user.id === action.payload.userId);
                // if (index !== -1) state.users[index].role = action.payload.newRole;
                console.log('Role change success message from API:', action.payload.message);
                // userForAction is cleared by the modal closing
            })
            .addCase(changeUserRole.rejected, (state, action) => {
                state.actionStatus = 'failed';
                state.actionError = action.payload; // Error message string
            });
        // Add extraReducers for other thunks (setUserActive, changeRole) later
    },
});

export const {
    setAdminUserFilter,
    setAdminUserPage,
    resetAdminUserFilters,
    clearAdminUserListError,
    prepareUserForAction, clearUserForAction, clearActionError,
} = adminUserSlice.actions;

// Selectors
export const selectAdminAllUsers = (state) => state.adminUsers.users;
export const selectAdminUserFilters = (state) => state.adminUsers.filters;
export const selectAdminUserPagination = (state) => state.adminUsers.pagination;
export const selectAdminUserListStatus = (state) => state.adminUsers.status;
export const selectAdminUserListError = (state) => state.adminUsers.listError;
export const selectAdminUserForAction = (state) => state.adminUsers.userForAction; // <-- NEW
export const selectAdminActionStatus = (state) => state.adminUsers.actionStatus;   // <-- NEW
export const selectAdminActionError = (state) => state.adminUsers.actionError;     // <-- NEW
// Add selectors for actionStatus, actionError, currentUserDetail later

export default adminUserSlice.reducer;