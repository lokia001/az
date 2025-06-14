// src/features/posts/services/postApi.js
import apiClient from '../../../services/apiClient'; // Adjust path

const extractErrorMessage = (error, defaultMessage) => {
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
    console.error('[PostApiService] Extracted error message:', message, 'Original error status:', error.response?.status);
    return message;
};

/**
 * API: Xem Chi Tiết Bài đăng
 * @param {string} postId - GUID of the post.
 * @returns {Promise<object>} PostDto (chi tiết bài đăng).
 */
export const fetchPostDetailAPI = async (postId) => {
    if (!postId) {
        throw new Error("Post ID is required to fetch post details.");
    }
    const endpoint = `/api/posts/${postId}`; // Now explicitly adding /api prefix
    console.log(`[PostApiService] Calling GET ${endpoint}`);
    try {
        const response = await apiClient.get(endpoint);
        // Assuming response.data is the full PostDto
        if (response.data && response.data.id) {
            return response.data;
        }
        console.error('[PostApiService] fetchPostDetailAPI: Unexpected API response structure:', response.data);
        throw new Error('Failed to fetch post details: Invalid response structure from server.');
    } catch (error) {
        const defaultMsg = `Failed to fetch details for post ID ${postId}.`;
        let finalErrorMessage = error.message && error.message !== defaultMsg ? error.message : defaultMsg; // Use custom error from interceptor if available
        if (error.status === 404) { // error.status from customError object from apiClient
            finalErrorMessage = `Bài đăng với ID '${postId}' không tìm thấy.`;
        }
        console.error(`[PostApiService] Error fetching post. Message:`, finalErrorMessage, 'Original error:', error);
        throw new Error(finalErrorMessage);
    }
};

// Note: createPostAPI was previously in communityApi.js.
// It's better to consolidate all post-related APIs here.
// If you move it, update imports in communitySlice.js.
export const createPostAPI = async (postData) => {
    const { communityId, title, content } = postData;
    if (!communityId || !title || !content) {
        throw new Error("Community ID, title, and content are required to create a post.");
    }
    const payload = { communityId, title, content };
    const endpoint = '/api/posts';
    console.log(`[PostApiService] Calling POST ${endpoint} with payload:`, payload);
    try {
        const response = await apiClient.post(endpoint, payload);
        return response.data; // Expected: PostDto
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to create post.'));
    }
};