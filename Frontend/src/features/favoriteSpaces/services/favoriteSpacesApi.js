// Frontend/src/features/favoriteSpaces/services/favoriteSpacesApi.js
import apiClient from '../../../services/api';

/**
 * API service for managing favorite spaces
 */

/**
 * Get all favorite spaces for the current user
 * @returns {Promise<Array>} List of favorite spaces
 */
export const getFavoriteSpacesAPI = async () => {
    try {
        const response = await apiClient.get('/api/favorite-spaces');
        return response.data;
    } catch (error) {
        console.error('[FavoriteSpacesAPI] Failed to get favorite spaces:', error);
        throw new Error(error.response?.data?.message || 'Không thể tải danh sách không gian yêu thích.');
    }
};

/**
 * Add a space to favorites
 * @param {string} spaceId - ID of the space to add to favorites
 * @returns {Promise<Object>} Added favorite space data
 */
export const addToFavoritesAPI = async (spaceId) => {
    try {
        const response = await apiClient.post('/api/favorite-spaces', { spaceId });
        return response.data;
    } catch (error) {
        console.error('[FavoriteSpacesAPI] Failed to add to favorites:', error);
        throw new Error(error.response?.data?.message || 'Không thể thêm vào danh sách yêu thích.');
    }
};

/**
 * Remove a space from favorites
 * @param {string} spaceId - ID of the space to remove from favorites
 * @returns {Promise<boolean>} Success status
 */
export const removeFromFavoritesAPI = async (spaceId) => {
    try {
        await apiClient.delete(`/api/favorite-spaces/${spaceId}`);
        return true;
    } catch (error) {
        console.error('[FavoriteSpacesAPI] Failed to remove from favorites:', error);
        throw new Error(error.response?.data?.message || 'Không thể xóa khỏi danh sách yêu thích.');
    }
};

/**
 * Get favorite status for a specific space
 * @param {string} spaceId - ID of the space
 * @returns {Promise<Object>} Favorite status data
 */
export const getFavoriteStatusAPI = async (spaceId) => {
    try {
        const response = await apiClient.get(`/api/favorite-spaces/status/${spaceId}`);
        return response.data;
    } catch (error) {
        console.error('[FavoriteSpacesAPI] Failed to get favorite status:', error);
        throw new Error(error.response?.data?.message || 'Không thể kiểm tra trạng thái yêu thích.');
    }
};

/**
 * Get favorite statuses for multiple spaces
 * @param {Array<string>} spaceIds - Array of space IDs
 * @returns {Promise<Array>} Array of favorite status data
 */
export const getFavoriteStatusesAPI = async (spaceIds) => {
    try {
        const response = await apiClient.post('/api/favorite-spaces/statuses', spaceIds);
        return response.data;
    } catch (error) {
        console.error('[FavoriteSpacesAPI] Failed to get favorite statuses:', error);
        throw new Error(error.response?.data?.message || 'Không thể kiểm tra trạng thái yêu thích.');
    }
};
