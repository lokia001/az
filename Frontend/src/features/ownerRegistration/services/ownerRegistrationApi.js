// Frontend/src/features/ownerRegistration/services/ownerRegistrationApi.js
import apiClient from '../../../services/apiClient';

/**
 * API service for owner registration requests
 */

// Helper function to extract error message
const extractErrorMessage = (error, defaultMessage) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        const firstErrorKey = Object.keys(validationErrors)[0];
        if (firstErrorKey && validationErrors[firstErrorKey][0]) {
            return validationErrors[firstErrorKey][0];
        }
    }
    return error.message || defaultMessage;
};

/**
 * Submit a new owner registration request
 * @param {Object} requestData - Registration request data
 * @returns {Promise} - Registration request response
 */
export const submitOwnerRegistrationAPI = async (requestData) => {
    const endpoint = '/api/owner-registration';
    console.log(`[OwnerRegistrationApi] Calling POST ${endpoint} with data:`, requestData);
    try {
        const response = await apiClient.post(endpoint, requestData);
        return response.data; // OwnerRegistrationRequestDto
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to submit owner registration request.'));
    }
};

/**
 * Get current user's registration request
 * @returns {Promise} - Registration request response
 */
export const getMyOwnerRegistrationAPI = async () => {
    const endpoint = '/api/owner-registration/me';
    console.log(`[OwnerRegistrationApi] Calling GET ${endpoint}`);
    try {
        const response = await apiClient.get(endpoint);
        return response.data; // OwnerRegistrationRequestDto
    } catch (error) {
        if (error.response?.status === 404) {
            return null; // No registration request found
        }
        throw new Error(extractErrorMessage(error, 'Failed to get registration request.'));
    }
};

/**
 * Cancel user's pending registration request
 * @param {string} requestId - Request ID to cancel
 * @returns {Promise} - Success response
 */
export const cancelOwnerRegistrationAPI = async (requestId) => {
    const endpoint = `/api/owner-registration/${requestId}`;
    console.log(`[OwnerRegistrationApi] Calling DELETE ${endpoint}`);
    try {
        const response = await apiClient.delete(endpoint);
        return response.data; // { message: "..." }
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to cancel registration request.'));
    }
};

// Admin APIs

/**
 * Get paginated list of owner registration requests (Admin only)
 * @param {Object} params - Query parameters
 * @returns {Promise} - Paginated registration requests
 */
export const getOwnerRegistrationRequestsAPI = async (params = {}) => {
    const endpoint = '/api/admin/owner-registration';
    const queryParams = new URLSearchParams();
    
    if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber);
    if (params.pageSize) queryParams.append('pageSize', params.pageSize);
    if (params.status) queryParams.append('status', params.status);
    if (params.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params.toDate) queryParams.append('toDate', params.toDate);
    if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);

    const fullEndpoint = queryParams.toString() ? `${endpoint}?${queryParams}` : endpoint;
    console.log(`[OwnerRegistrationApi] Calling GET ${fullEndpoint}`);
    
    try {
        const response = await apiClient.get(fullEndpoint);
        return response.data; // PagedOwnerRegistrationRequestDto
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to get registration requests.'));
    }
};

/**
 * Get registration request by ID (Admin only)
 * @param {string} requestId - Request ID
 * @returns {Promise} - Registration request details
 */
export const getOwnerRegistrationRequestByIdAPI = async (requestId) => {
    const endpoint = `/api/admin/owner-registration/${requestId}`;
    console.log(`[OwnerRegistrationApi] Calling GET ${endpoint}`);
    try {
        const response = await apiClient.get(endpoint);
        return response.data; // OwnerRegistrationRequestDto
    } catch (error) {
        throw new Error(extractErrorMessage(error, `Failed to get registration request ${requestId}.`));
    }
};

/**
 * Get count of pending registration requests (Admin only)
 * @returns {Promise} - Pending requests count
 */
export const getPendingOwnerRegistrationCountAPI = async () => {
    const endpoint = '/api/admin/owner-registration/pending/count';
    console.log(`[OwnerRegistrationApi] Calling GET ${endpoint}`);
    try {
        const response = await apiClient.get(endpoint);
        return response.data; // { pendingCount: number }
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to get pending requests count.'));
    }
};

/**
 * Process owner registration request (Admin only)
 * @param {string} requestId - Request ID to process
 * @param {Object} processData - Processing data (isApproved, adminNotes, rejectionReason)
 * @returns {Promise} - Success response
 */
export const processOwnerRegistrationAPI = async (requestId, processData) => {
    const endpoint = `/api/admin/owner-registration/${requestId}/process`;
    console.log(`[OwnerRegistrationApi] Calling PUT ${endpoint} with data:`, processData);
    try {
        const response = await apiClient.put(endpoint, processData);
        return response.data; // { message: "...", isApproved: boolean }
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to process registration request.'));
    }
};
