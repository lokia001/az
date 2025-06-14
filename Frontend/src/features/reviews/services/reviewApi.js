// src/features/reviews/services/reviewApi.js
import apiClient from '../../../services/apiClient'; // Adjust path

const extractErrorMessage = (error, defaultMessage) => { /* ... (same error helper as before) ... */
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
    return message;
};

/**
 * API 3: Fetches reviews for a specific space.
 * @param {string} spaceId - GUID of the space.
 * @param {object} params - Query parameters { UserId, MinRating, PageNumber, PageSize }
 * @returns {Promise<object>} PagedResultDto<ReviewDto>
 */
export const fetchReviewsForSpaceAPI = async (spaceId, params = {}) => {
    if (!spaceId) {
        console.error('[ReviewApiService] Missing spaceId in fetchReviewsForSpaceAPI call');
        throw new Error("Space ID is required to fetch reviews.");
    }
    
    const apiQueryParams = {
        PageNumber: params.PageNumber || 1,
        PageSize: params.PageSize || 5, // Default to 5 reviews per page for display
        // UserId: params.UserId, // For filtering by user later
        // MinRating: params.MinRating, // For filtering by rating later
    };
    
    // Ensure we're using the correct endpoint for reviews
    const endpoint = `/api/spaces/${spaceId}/reviews`;
    console.log(`[ReviewApiService] Calling GET ${endpoint} with params:`, apiQueryParams);
    
    try {
        const response = await apiClient.get(endpoint, { params: apiQueryParams });
        
        // Validate the response structure
        if (response.data && Array.isArray(response.data.items)) {
            console.log(`[ReviewApiService] Received ${response.data.items.length} reviews for space ${spaceId}`);
            return response.data; // PagedResultDto<ReviewDto>
        }
        
        // Handle unexpected response structure
        console.error('[ReviewApiService] fetchReviewsForSpaceAPI: Unexpected response structure. Data:', response.data);
        
        // Return a valid response structure even if the API returned something unexpected
        return { 
            items: [], 
            pageNumber: apiQueryParams.PageNumber, 
            pageSize: apiQueryParams.PageSize, 
            totalCount: 0, 
            totalPages: 0 
        };
    } catch (error) {
        console.error(`[ReviewApiService] Error fetching reviews for space ${spaceId}:`, error);
        console.error(`[ReviewApiService] Status: ${error.response?.status}, Message: ${error.message}`);
        
        // Re-throw with a clearer error message
        throw new Error(extractErrorMessage(error, `Failed to fetch reviews for space ${spaceId}. Please try again later.`));
    }
};

/**
 * API 1: Creates a new review for a space.
 * @param {object} reviewData - { spaceId, bookingId (optional), rating, commentText (optional) }
 * @returns {Promise<object>} ReviewDto of the newly created review.
 */
export const createReviewAPI = async (reviewData) => {
    const { spaceId, rating, commentText, bookingId } = reviewData;
    
    // Input validation
    if (!spaceId || rating == null) { // rating can be 0, but not null/undefined
        console.error('[ReviewApiService] Missing required fields in createReviewAPI:', reviewData);
        throw new Error("Space ID and rating are required to create a review.");
    }
    if (rating < 1 || rating > 5) {
        console.error('[ReviewApiService] Invalid rating in createReviewAPI:', rating);
        throw new Error("Rating must be between 1 and 5.");
    }

    const payload = {
        spaceId,
        rating: parseInt(rating, 10),
        commentText: commentText || null, // Send null if empty
        bookingId: bookingId || null,     // Send null if empty
    };
    
    // Use consistent API endpoint pattern
    const endpoint = '/api/reviews';
    console.log(`[ReviewApiService] Calling POST ${endpoint} with payload:`, payload);
    
    try {
        const response = await apiClient.post(endpoint, payload);
        console.log('[ReviewApiService] Review created successfully:', response.data);
        return response.data; // Expected: ReviewDto
    } catch (error) {
        console.error('[ReviewApiService] Error creating review:', error);
        throw new Error(extractErrorMessage(error, 'Failed to create review. Please try again later.'));
    }
};