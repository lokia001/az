// src/features/systemItems/services/systemAmenitiesApi.js
import apiClient from '../../../services/apiClient';

/**
 * API service for system amenities management
 */

/**
 * Fetches all system amenities
 * @param {Object} params - Query parameters for pagination
 * @returns {Promise<Object>} List of system amenities
 */
export const fetchSystemAmenitiesAPI = async (params = {}) => {
    try {
        console.log('[SystemAmenitiesAPI] Fetching system amenities with params:', params);
        const response = await apiClient.get('/api/admin/system/amenities', { params });
        console.log('[SystemAmenitiesAPI] Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[SystemAmenitiesAPI] Error:', error);
        throw error.response?.data || error.message;
    }
};

/**
 * Creates a new system amenity
 * @param {Object} amenityData - System amenity data to create
 * @returns {Promise<Object>} Created system amenity data
 */
export const createSystemAmenityAPI = async (amenityData) => {
    try {
        console.log('[SystemAmenitiesAPI] Creating system amenity with data:', amenityData);
        const response = await apiClient.post('/api/admin/system/amenities', amenityData);
        console.log('[SystemAmenitiesAPI] System amenity created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('[SystemAmenitiesAPI] Error creating system amenity:', error);
        throw error.response?.data || error.message;
    }
};

/**
 * Updates an existing system amenity
 * @param {string} amenityId - ID of the system amenity to update
 * @param {Object} amenityData - Updated system amenity data
 * @returns {Promise<Object>} Updated system amenity data
 */
export const updateSystemAmenityAPI = async (amenityId, amenityData) => {
    try {
        console.log('[SystemAmenitiesAPI] Updating system amenity with ID:', amenityId, 'and data:', amenityData);

        if (!amenityId) {
            throw new Error('System amenity ID is required for update operation');
        }

        const response = await apiClient.put(`/api/system-amenities/${amenityId}`, amenityData);

        console.log('[SystemAmenitiesAPI] System amenity updated successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('[SystemAmenitiesAPI] Error updating system amenity:', error);

        let errorMessage = 'Failed to update system amenity';
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
 * Deletes a system amenity
 * @param {string} amenityId - ID of the system amenity to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteSystemAmenityAPI = async (amenityId) => {
    try {
        console.log('[SystemAmenitiesAPI] Deleting system amenity with ID:', amenityId);

        if (!amenityId) {
            throw new Error('System amenity ID is required for delete operation');
        }

        await apiClient.delete(`/api/system-amenities/${amenityId}`);

        console.log('[SystemAmenitiesAPI] System amenity deleted successfully');
        return true;
    } catch (error) {
        console.error('[SystemAmenitiesAPI] Error deleting system amenity:', error);

        let errorMessage = 'Failed to delete system amenity';
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
 * Fetches details of a specific system amenity
 * @param {string} amenityId - ID of the system amenity to fetch
 * @returns {Promise<Object>} System amenity details
 */
export const getSystemAmenityDetailsAPI = async (amenityId) => {
    try {
        console.log('[SystemAmenitiesAPI] Fetching system amenity details for ID:', amenityId);

        if (!amenityId) {
            throw new Error('System amenity ID is required');
        }

        const response = await apiClient.get(`/api/system-amenities/${amenityId}`);

        console.log('[SystemAmenitiesAPI] System amenity details fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('[SystemAmenitiesAPI] Error fetching system amenity details:', error);

        let errorMessage = 'Failed to fetch system amenity details';
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
