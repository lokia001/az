// src/features/adminUserManagement/services/adminUserApi.js
import apiClient from '../../../services/apiClient'; // Adjust path if needed

const extractErrorMessage = (error, defaultMessage) => {
    // ... (same error extraction helper as in authApi.js or a shared util)
    let message = defaultMessage;
    if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (typeof errorData.message === 'string') message = errorData.message;
        else if (typeof errorData.title === 'string') message = errorData.title;
        else if (typeof errorData.error === 'string') message = errorData.error;
        else if (typeof errorData === 'string') message = errorData;
        else { message = JSON.stringify(errorData); }
    } else if (error.message) {
        message = error.message;
    }
    console.error('[AdminUserApiService] Extracted error message:', message, 'Original error status:', error.response?.status);
    return message;
};

/**
 * API 1: Fetches a paginated list of all users with optional filters.
 * @param {object} params - Filter and pagination parameters.
 * @param {string} [params.Username]
 * @param {string} [params.Email]
 * @param {string} [params.Role] - "User", "Owner", "SysAdmin"
 * @param {boolean} [params.IsActive]
 * @param {number} [params.PageNumber]
 * @param {number} [params.PageSize]
 * @returns {Promise<object>} PagedResultDto<UserDto>
 */
export const fetchAdminUsersAPI = async (params = {}) => {
    const apiQueryParams = { ...params }; // Directly use param names from API spec

    // Ensure boolean IsActive is sent correctly if present
    if (apiQueryParams.IsActive === true || apiQueryParams.IsActive === 'true') {
        apiQueryParams.IsActive = true;
    } else if (apiQueryParams.IsActive === false || apiQueryParams.IsActive === 'false') {
        apiQueryParams.IsActive = false;
    } else {
        delete apiQueryParams.IsActive; // Remove if not a valid boolean or empty string
    }
    if (apiQueryParams.Role === '') delete apiQueryParams.Role; // Remove if empty string

    const endpoint = '/api/admin/users';
    console.log(`[AdminUserApiService] Calling GET ${endpoint} with query params:`, apiQueryParams);
    try {
        const response = await apiClient.get(endpoint, { params: apiQueryParams });
        if (response.data && Array.isArray(response.data.items)) {
            return response.data;
        }
        console.error('[AdminUserApiService] fetchAdminUsersAPI: Unexpected API response structure:', response.data);
        return { items: [], pageNumber: 1, pageSize: params.PageSize || 10, totalCount: 0, totalPages: 0 };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to fetch users list.'));
    }
};

// API 2: Get User Detail by ID (Placeholder - will be used later)
export const fetchAdminUserByIdAPI = async (userId) => {
    const endpoint = `/api/admin/users/${userId}`;
    console.log(`[AdminUserApiService] Calling GET ${endpoint}`);
    try {
        const response = await apiClient.get(endpoint);
        return response.data; // UserDto
    } catch (error) {
        throw new Error(extractErrorMessage(error, `Failed to fetch user ${userId}.`));
    }
};

// API 3: Set User Active Status (Placeholder)
export const setAdminUserActiveStatusAPI = async (userId, isActive) => {
    const endpoint = `/api/admin/users/${userId}/set-active`;
    console.log(`[AdminUserApiService] Calling PUT ${endpoint} with isActive: ${isActive}`);
    try {
        const response = await apiClient.put(endpoint, { isActive });
        return response.data; // { message: "..." }
    } catch (error) {
        throw new Error(extractErrorMessage(error, `Failed to update active status for user ${userId}.`));
    }
};

// API 4: Change User Role (Placeholder)
export const changeAdminUserRoleAPI = async (userId, newRole) => {
    const endpoint = `/api/admin/users/${userId}/change-role`;
    const payload = { newRole };
    console.log(`[AdminUserApiService] Calling PUT ${endpoint} with payload:`, payload);
    try {
        const response = await apiClient.put(endpoint, payload);
        // Expects { message: "User {id} role changed to {NewRole}." }
        return response.data;
    } catch (error) {
        // error.message will be from apiClient's interceptor or a network error
        throw new Error(extractErrorMessage(error, `Failed to change role for user ${userId}.`));
    }
};