// src/features/comments/services/commentApi.js
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
 * API 3: Fetches comments for a parent entity (e.g., Post).
 * @param {string} parentEntityType - "Post", "Space", "Review", "Comment"
 * @param {string} parentId - GUID of the parent entity.
 * @param {object} params - Query parameters { PageNumber, PageSize, IncludeReplies, UserId }
 * @returns {Promise<object>} PagedResultDto<CommentDto>
 */
export const fetchCommentsAPI = async (parentEntityType, parentId, params = {}) => {
    if (!parentEntityType || !parentId) {
        throw new Error("Parent entity type and ID are required to fetch comments.");
    }
    const apiQueryParams = {
        PageNumber: params.PageNumber || 1,
        PageSize: params.PageSize || 5, // Default to fewer comments initially
        IncludeReplies: params.IncludeReplies || false, // Default to not including replies for main list
        // UserId: params.UserId, // If filtering by user
    };
    const endpoint = `/api/entities/${parentEntityType}/${parentId}/comments`;
    console.log(`[CommentApiService] Calling GET ${endpoint} with params:`, apiQueryParams);
    try {
        const response = await apiClient.get(endpoint, { params: apiQueryParams });
        if (response.data && Array.isArray(response.data.items)) {
            return response.data;
        }
        console.error('[CommentApiService] fetchCommentsAPI: Unexpected response structure. Data:', response.data);
        return { items: [], pageNumber: 1, pageSize: apiQueryParams.PageSize, totalCount: 0, totalPages: 0 };
    } catch (error) {
        throw new Error(extractErrorMessage(error, `Failed to fetch comments for ${parentEntityType} ${parentId}.`));
    }
};

/**
 * API 1: Creates a new comment.
 * @param {object} commentData - { parentEntityType, parentEntityId, parentCommentId, content }
 * @returns {Promise<object>} CommentDto of the newly created comment.
 */
export const createCommentAPI = async (commentData) => {
    const { parentEntityType, parentEntityId, content } = commentData;
    if (!parentEntityType || !parentEntityId || !content) {
        throw new Error("Parent entity, ID, and content are required to create a comment.");
    }
    const payload = {
        parentEntityType,
        parentEntityId,
        parentCommentId: commentData.parentCommentId || null, // Optional for replies
        content,
    };
    const endpoint = '/api/comments';
    console.log(`[CommentApiService] Calling POST ${endpoint} with payload:`, payload);
    try {
        const response = await apiClient.post(endpoint, payload);
        return response.data; // Expected: CommentDto
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to create comment.'));
    }
};


// *** NEW API FUNCTION ***
/**
 * API 2: Fetches a single comment by its ID, optionally including its replies.
 * @param {string} commentId - GUID of the comment.
 * @param {boolean} includeReplies - Whether to include first-level replies.
 * @returns {Promise<object>} CommentDto.
 */
export const fetchCommentWithRepliesAPI = async (commentId, includeReplies = true) => {
    if (!commentId) {
        throw new Error("Comment ID is required.");
    }
    const endpoint = `/api/comments/${commentId}`;
    const apiQueryParams = { includeReplies };
    console.log(`[CommentApiService] Calling GET ${endpoint} with params:`, apiQueryParams);
    try {
        const response = await apiClient.get(endpoint, { params: apiQueryParams });
        return response.data; // Expected: CommentDto (with .replies populated if includeReplies=true)
    } catch (error) {
        throw new Error(extractErrorMessage(error, `Failed to fetch comment ${commentId}.`));
    }
};