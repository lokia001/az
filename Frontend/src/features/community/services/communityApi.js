// src/features/community/services/communityApi.js
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
    console.error('[CommunityApiService] Extracted error message:', message, 'Original error status:', error.response?.status);
    return message;
};

// API 1: Create Community
export const createCommunityAPI = async (communityData) => {
    // communityData: { name, description, coverImageUrl, isPublic }
    const endpoint = '/api/communities';
    console.log(`[CommunityApiService] Calling POST ${endpoint} with data:`, communityData);
    try {
        const response = await apiClient.post(endpoint, communityData);
        return response.data; // Expected: CommunityDto
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to create community.'));
    }
};

// API 2: Update Community (chủ community hoặc admin/mod)
export const updateCommunityAPI = async (communityId, updateData) => {
    // updateData: { name, description, coverImageUrl, isPublic }
    if (!communityId) {
        throw new Error("Community ID is required to update community.");
    }
    const endpoint = `/api/communities/${communityId}`;
    console.log(`[CommunityApiService] Calling PUT ${endpoint} with data:`, updateData);
    try {
        const response = await apiClient.put(endpoint, updateData);
        return response.data; // Expected: CommunityDto
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to update community.'));
    }
};

// API 3: Delete Community (chủ community hoặc admin)
export const deleteCommunityAPI = async (communityId) => {
    if (!communityId) {
        throw new Error("Community ID is required to delete community.");
    }
    const endpoint = `/api/communities/${communityId}`;
    console.log(`[CommunityApiService] Calling DELETE ${endpoint}`);
    try {
        const response = await apiClient.delete(endpoint);
        return response.status === 204; // NoContent = success
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to delete community.'));
    }
};

// API 5: Get Community Details
export const fetchCommunityDetailAPI = async (communityId) => {
    if (!communityId) {
        throw new Error("Community ID is required to fetch community details.");
    }
    const endpoint = `/api/communities/${communityId}`;
    console.log(`[CommunityApiService] Calling GET ${endpoint}`);
    try {
        const response = await apiClient.get(endpoint);
        return response.data; // Expected: CommunityDto
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to fetch community details.'));
    }
};

// API 4: Search/List Communities
export const searchCommunitiesAPI = async (params = {}) => {
    // params: { NameKeyword, IsPublic, PageNumber, PageSize }
    const apiQueryParams = { ...params };
    if (apiQueryParams.IsPublic === '') delete apiQueryParams.IsPublic; // Allow 'any' if empty string

    const endpoint = '/api/communities/search';
    console.log(`[CommunityApiService] Calling GET ${endpoint} with params:`, apiQueryParams);
    try {
        const response = await apiClient.get(endpoint, { params: apiQueryParams });
        // Expected: PagedResultDto<CommunitySummaryDto>
        if (response.data && Array.isArray(response.data.items)) {
            return response.data;
        }
        console.error('[CommunityApiService] searchCommunitiesAPI: Unexpected response structure.');
        return { items: [], pageNumber: 1, pageSize: params.PageSize || 10, totalCount: 0, totalPages: 0 };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to search communities.'));
    }
};

// API 12: Get My Joined Communities
export const fetchMyJoinedCommunitiesAPI = async () => {
    const endpoint = '/api/communities/my-memberships';
    console.log(`[CommunityApiService] Calling GET ${endpoint}`);
    try {
        const response = await apiClient.get(endpoint);
        // Expected: Array of UserCommunityMembershipDto
        if (Array.isArray(response.data)) {
            return response.data;
        }
        console.error('[CommunityApiService] fetchMyJoinedCommunitiesAPI: Unexpected response structure.');
        return [];
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to fetch user's communities."));
    }
};

// API 2: Get Community Detail by ID (placeholder for later use)
export const fetchCommunityDetailByIdAPI = async (communityId) => {
    const endpoint = `/api/communities/${communityId}`;
    try {
        const response = await apiClient.get(endpoint);
        return response.data; // CommunityDto
    } catch (error) {
        throw new Error(extractErrorMessage(error, `Failed to fetch community ${communityId}.`));
    }
};


// --- Post Management APIs (NEW and relevant for this task) ---

/**
 * API: Lấy Danh sách Bài đăng của một Cộng đồng Cụ thể
 * @param {string} communityId - ID of the community.
 * @param {object} params - Query parameters (PostSearchCriteriaDto)
 * @param {string} [params.AuthorUserId]
 * @param {string} [params.TitleKeyword]
 * @param {string} [params.ContentKeyword]
 * @param {boolean} [params.IsPinned]
 * @param {boolean} [params.IsLocked]
 * @param {number} [params.PageNumber]
 * @param {number} [params.PageSize]
 * @returns {Promise<object>} PagedResultDto<PostSummaryDto>
 */
export const fetchPostsForCommunityAPI = async (communityId, params = {}) => {
    if (!communityId) {
        throw new Error("Community ID is required to fetch posts.");
    }
    // API currently supports PageNumber, PageSize. Other filters are for future.
    const apiQueryParams = {
        PageNumber: params.PageNumber || 1,
        PageSize: params.PageSize || 10,
        // Add other PostSearchCriteriaDto params here when UI supports them:
        // AuthorUserId: params.AuthorUserId,
        // TitleKeyword: params.TitleKeyword,
        // ContentKeyword: params.ContentKeyword,
        // IsPinned: params.IsPinned,
        // IsLocked: params.IsLocked,
    };

    // *** UPDATED ENDPOINT ***
    const endpoint = `/api/communities/${communityId}/posts`;
    // *** END UPDATED ENDPOINT ***

    console.log(`[CommunityApiService] Calling GET ${endpoint} with params:`, apiQueryParams);
    try {
        const response = await apiClient.get(endpoint, { params: apiQueryParams });
        if (response.data && Array.isArray(response.data.items)) {
            return response.data; // PagedResultDto<PostSummaryDto>
        }
        console.error('[CommunityApiService] fetchPostsForCommunityAPI: Unexpected response structure. Data:', response.data);
        return { items: [], pageNumber: 1, pageSize: params.PageSize || 10, totalCount: 0, totalPages: 0 };
    } catch (error) {
        throw new Error(extractErrorMessage(error, `Failed to fetch posts for community ${communityId}.`));
    }
};

// API: Get Posts by Author (NEW - for future use)
export const fetchPostsByAuthorAPI = async (authorUserId, params = {}) => {
    if (!authorUserId) {
        throw new Error("Author User ID is required to fetch posts.");
    }
    const apiQueryParams = {
        PageNumber: params.PageNumber || 1,
        PageSize: params.PageSize || 10,
        // CommunityId: params.CommunityId, // Optional: to filter within a specific community for this author
        // ... other PostSearchCriteriaDto params ...
    };
    const endpoint = `/api/${authorUserId}/posts`;
    console.log(`[CommunityApiService] Calling GET ${endpoint} with params:`, apiQueryParams);
    try {
        const response = await apiClient.get(endpoint, { params: apiQueryParams });
        if (response.data && Array.isArray(response.data.items)) {
            return response.data; // PagedResultDto<PostSummaryDto>
        }
        console.error('[CommunityApiService] fetchPostsByAuthorAPI: Unexpected response structure. Data:', response.data);
        return { items: [], pageNumber: 1, pageSize: params.PageSize || 10, totalCount: 0, totalPages: 0 };
    } catch (error) {
        throw new Error(extractErrorMessage(error, `Failed to fetch posts for author ${authorUserId}.`));
    }
};

/**
 * API: Tạo Bài đăng Mới
 * @param {object} postData - { communityId, title, content }
 * @returns {Promise<object>} PostDto (chi tiết bài đăng vừa tạo)
 */
export const createPostAPI = async (postData) => {
    const { communityId, title, content } = postData;
    if (!communityId || !title || !content) {
        throw new Error("Community ID, title, and content are required to create a post.");
    }
    const payload = { communityId, title, content };
    const endpoint = '/api/posts';
    console.log(`[CommunityApiService] Calling POST ${endpoint} with payload:`, payload);
    try {
        const response = await apiClient.post(endpoint, payload);
        return response.data; // Expected: PostDto
    } catch (error) {
        // error.message will be from apiClient's interceptor or a network error
        // The extractErrorMessage helper will try to get a more specific message from error.response.data
        throw new Error(extractErrorMessage(error, 'Failed to create post.'));
    }
};
// Other Post APIs (using /api/posts/ prefix - placeholders for now)
// export const createPostAPI = async (postData) => {
//   const endpoint = '/api/posts';
//   // ... apiClient.post(endpoint, postData) ...
// };
// export const fetchPostDetailAPI = async (postId) => {
//   const endpoint = `/api/posts/${postId}`;
//   // ... apiClient.get(endpoint) ...
// };
// ... etc. for update, delete, pin, lock ...