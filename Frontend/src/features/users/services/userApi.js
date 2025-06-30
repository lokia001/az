// src/features/users/services/userApi.js
import apiClient from '../../../services/apiClient';

/**
 * API service for user management operations
 */

/**
 * Fetches users with optional filtering and pagination
 * @param {Object} params - Query parameters for filtering and pagination
 * @returns {Promise<Object>} Paginated list of users
 */
export const fetchUsersAPI = async (params = {}) => {
    try {
        console.log('[UserAPI] Fetching users with params:', params);

        const queryParams = {};

        // Add filtering parameters if provided
        if (params.Username && params.Username.trim() !== '') {
            queryParams.Username = params.Username.trim();
        }
        if (params.Email && params.Email.trim() !== '') {
            queryParams.Email = params.Email.trim();
        }
        if (params.Role && params.Role !== '') {
            queryParams.Role = params.Role;
        }
        if (params.IsActive !== '') {
            queryParams.IsActive = params.IsActive;
        }

        // Add pagination parameters
        if (params.PageNumber) {
            queryParams.PageNumber = params.PageNumber;
        }
        if (params.PageSize) {
            queryParams.PageSize = params.PageSize;
        }

        const response = await apiClient.get('/api/users', { params: queryParams });

        console.log('[UserAPI] Users fetched successfully:', response.data);

        // Return paginated result structure
        if (response.data && Array.isArray(response.data.items)) {
            return response.data;
        }

        // If response doesn't match expected structure, adapt it
        return {
            items: Array.isArray(response.data) ? response.data : [],
            pageNumber: params.PageNumber || 1,
            pageSize: params.PageSize || 10,
            totalCount: Array.isArray(response.data) ? response.data.length : 0,
            totalPages: 1
        };
    } catch (error) {
        console.error('[UserAPI] Error fetching users:', error);

        let errorMessage = 'Failed to fetch users';
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            if (typeof errorData.message === 'string') {
                errorMessage = errorData.message;
            } else if (typeof errorData.title === 'string') {
                errorMessage = errorData.title;
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

/**
 * Creates a new user
 * @param {Object} userData - User data to create
 * @returns {Promise<Object>} Created user data
 */
export const createUserAPI = async (userData) => {
    try {
        console.log('[UserAPI] Creating user with data:', userData);

        const response = await apiClient.post('/api/users', userData);

        console.log('[UserAPI] User created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('[UserAPI] Error creating user:', error);

        let errorMessage = 'Failed to create user';
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            if (typeof errorData.message === 'string') {
                errorMessage = errorData.message;
            } else if (typeof errorData.title === 'string') {
                errorMessage = errorData.title;
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

/**
 * Updates an existing user
 * @param {string} userId - ID of the user to update
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user data
 */
export const updateUserAPI = async (userId, userData) => {
    try {
        console.log('[UserAPI] Updating user with ID:', userId, 'and data:', userData);

        if (!userId) {
            throw new Error('User ID is required for update operation');
        }

        const response = await apiClient.put(`/api/users/${userId}`, userData);

        console.log('[UserAPI] User updated successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('[UserAPI] Error updating user:', error);

        let errorMessage = 'Failed to update user';
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            if (typeof errorData.message === 'string') {
                errorMessage = errorData.message;
            } else if (typeof errorData.title === 'string') {
                errorMessage = errorData.title;
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

/**
 * Deletes a user
 * @param {string} userId - ID of the user to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteUserAPI = async (userId) => {
    try {
        console.log('[UserAPI] Deleting user with ID:', userId);

        if (!userId) {
            throw new Error('User ID is required for delete operation');
        }

        await apiClient.delete(`/api/users/${userId}`);

        console.log('[UserAPI] User deleted successfully');
        return true;
    } catch (error) {
        console.error('[UserAPI] Error deleting user:', error);

        let errorMessage = 'Failed to delete user';
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            if (typeof errorData.message === 'string') {
                errorMessage = errorData.message;
            } else if (typeof errorData.title === 'string') {
                errorMessage = errorData.title;
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

/**
 * Fetches details of a specific user
 * @param {string} userId - ID of the user to fetch
 * @returns {Promise<Object>} User details
 */
export const getUserDetailsAPI = async (userId) => {
    try {
        console.log('[UserAPI] Fetching user details for ID:', userId);

        if (!userId) {
            throw new Error('User ID is required');
        }

        const response = await apiClient.get(`/api/users/${userId}`);

        console.log('[UserAPI] User details fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('[UserAPI] Error fetching user details:', error);

        let errorMessage = 'Failed to fetch user details';
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            if (typeof errorData.message === 'string') {
                errorMessage = errorData.message;
            } else if (typeof errorData.title === 'string') {
                errorMessage = errorData.title;
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

/**
 * Updates user status (activate/deactivate)
 * @param {string} userId - ID of the user
 * @param {boolean} isActive - New status
 * @returns {Promise<Object>} Updated user data
 */
export const updateUserStatusAPI = async (userId, isActive) => {
    try {
        console.log('[UserAPI] Updating user status for ID:', userId, 'to:', isActive);

        if (!userId) {
            throw new Error('User ID is required');
        }

        const response = await apiClient.patch(`/api/users/${userId}/status`, {
            isActive: isActive
        });

        console.log('[UserAPI] User status updated successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('[UserAPI] Error updating user status:', error);

        let errorMessage = 'Failed to update user status';
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            if (typeof errorData.message === 'string') {
                errorMessage = errorData.message;
            } else if (typeof errorData.title === 'string') {
                errorMessage = errorData.title;
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};
