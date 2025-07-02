// src/features/systemItems/services/systemSpaceServicesApi.js
import apiClient from '../../../services/apiClient';

/**
 * Fetch all system space services
 * @returns {Promise} API response with space services data
 */
export const fetchSystemSpaceServicesAPI = async () => {
    try {
        const response = await apiClient.get('/api/admin/system/space-services');
        console.log('[SystemSpaceServicesAPI] Fetched services:', response.data);
        return response.data;
    } catch (error) {
        console.error('[SystemSpaceServicesAPI] Error fetching services:', error);
        throw error.response?.data || error.message;
    }
};

/**
 * Create a new system space service
 * @param {Object} serviceData - Space service data
 * @returns {Promise} API response with created service data
 */
export const createSystemSpaceServiceAPI = async (serviceData) => {
    try {
        const response = await apiClient.post('/api/admin/system/space-services', serviceData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Update an existing system space service
 * @param {string|number} serviceId - Service ID
 * @param {Object} serviceData - Updated service data
 * @returns {Promise} API response with updated service data
 */
export const updateSystemSpaceServiceAPI = async (serviceId, serviceData) => {
    try {
        const response = await apiClient.put(`/api/admin/system/space-services/${serviceId}`, serviceData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Delete a system space service
 * @param {string|number} serviceId - Service ID
 * @returns {Promise} API response
 */
export const deleteSystemSpaceServiceAPI = async (serviceId) => {
    try {
        const response = await apiClient.delete(`/api/admin/system/space-services/${serviceId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Fetch space services by category
 * @param {string} category - Service category
 * @returns {Promise} API response with filtered services
 */
export const fetchSpaceServicesByCategoryAPI = async (category) => {
    try {
        const response = await apiClient.get(`/api/admin/system/space-services/category/${category}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Toggle space service status (active/inactive)
 * @param {string|number} serviceId - Service ID
 * @returns {Promise} API response
 */
export const toggleSpaceServiceStatusAPI = async (serviceId) => {
    try {
        const response = await apiClient.put(`/api/admin/system/space-services/${serviceId}/toggle-status`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Bulk update space services
 * @param {Array} services - Array of service objects with IDs and data
 * @returns {Promise} API response
 */
export const bulkUpdateSpaceServicesAPI = async (services) => {
    try {
        const response = await apiClient.put('/api/admin/system/space-services/bulk-update', { services });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Bulk delete space services
 * @param {Array} serviceIds - Array of service IDs
 * @returns {Promise} API response
 */
export const bulkDeleteSpaceServicesAPI = async (serviceIds) => {
    try {
        const response = await apiClient.delete('/api/admin/system/space-services/bulk-delete', {
            data: { serviceIds }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
