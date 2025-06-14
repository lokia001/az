// src/features/spaceDetail/services/spaceDetailApi.js
import apiClient from '../../../services/apiClient'; // Adjust path if needed
import * as api from '../../../services/api';

// Get API base URL for logging purposes
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5035';

const extractErrorMessage = (error, defaultMessage) => {
    let message = defaultMessage;
    if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (typeof errorData.message === 'string') message = errorData.message;
        else if (typeof errorData.title === 'string') message = errorData.title;
        else if (typeof errorData.error === 'string') message = errorData.error;
        else if (typeof errorData === 'string') message = errorData; // If data is just a string
        else { message = JSON.stringify(errorData); } // Fallback
    } else if (error.message) {
        message = error.message;
    }
    console.error('[SpaceDetailApiService] Extracted error message:', message, 'Original error status:', error.response?.status);
    return message;
};

/**
 * Fetches detailed information for a single space by its ID or slug.
 * @param {string} identifier - The ID (GUID) or slug of the space.
 * @param {boolean} isSlug - True if the identifier is a slug, false if it's an ID.
 * @returns {Promise<object>} The detailed space object (SpaceDto).
 */
export const fetchSpaceByIdentifierAPI = async (identifier, isSlug = false) => {
    if (!identifier) {
        const errorMsg = 'Identifier (ID or slug) is required to fetch space details.';
        console.error('[SpaceDetailApiService]', errorMsg);
        throw new Error(errorMsg);
    }

    // Ensure API endpoint correctly formatted and GUID case is consistent
    // CẢNH BÁO: Tất cả các URL phải có tiền tố '/api/' để kết nối đến backend
    // Dựa theo định dạng API endpoints hiện tại từ swagger:
    // - GET /api/spaces/{id} - Lấy chi tiết không gian theo ID (public API)
    // - GET /api/spaces/slug/{slug} - Lấy chi tiết không gian theo slug (public API)
    // - GET /api/owner/spaces/{id} - Lấy chi tiết không gian theo ID (cho owner)
    // - GET /api/owner/spaces/slug/{slug} - Lấy không gian theo slug (cho owner)
    
    let endpoint;
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isOwner = currentUser?.roles?.includes('Owner') || currentUser?.roles?.includes('SysAdmin');
    
    // Kiểm tra xem người dùng hiện tại có phải là owner không để sử dụng API endpoint phù hợp
    if (isOwner) {
        console.log('[SpaceDetailApiService] Using owner-specific API endpoint');
        if (isSlug) {
            endpoint = `/api/owner/spaces/slug/${encodeURIComponent(identifier)}`;
        } else {
            // For GUIDs, ensure consistent case (lowercase) and proper URL formatting
            const formattedId = identifier.toLowerCase();
            endpoint = `/api/owner/spaces/${formattedId}`;
        }
    } else {
        console.log('[SpaceDetailApiService] Using public API endpoint');
        if (isSlug) {
            endpoint = `/api/owner/spaces/slug/${encodeURIComponent(identifier)}`;
        } else {
            // For GUIDs, ensure consistent case (lowercase) and proper URL formatting
            const formattedId = identifier.toLowerCase();
            endpoint = `/api/owner/spaces/${formattedId}`;
        }
    }

    console.log(`[SpaceDetailApiService] Calling GET ${endpoint}`);
    try {
        // Enhanced logging for debugging
        console.log(`[SpaceDetailApiService] Making API GET request to endpoint: ${endpoint}`);
        console.log(`[SpaceDetailApiService] Full API URL: ${API_BASE_URL}${endpoint}`);
        
        const response = await apiClient.get(endpoint);
        
        // Extended validation and logging of API response
        console.log(`[SpaceDetailApiService] API response status: ${response.status}`);
        
        if (!response.data) {
            console.error('[SpaceDetailApiService] API returned empty response data');
            throw new Error('Server returned empty response when fetching space details.');
        }
        
        // Assuming response.data is the SpaceDto object
        if (response.data && response.data.id) {
            console.log('[SpaceDetailApiService] API success, data:', response.data);
            return response.data;
        }
        
        // This case should ideally be caught by a 404 from the API if identifier is not found
        console.error('[SpaceDetailApiService] Unexpected API response structure or no ID in data:', response.data);
        throw new Error('Failed to fetch space details: Invalid response structure from server.');
    } catch (error) {
        // error.message here will be from apiClient's interceptor or the throw above
        const defaultMsg = isSlug
            ? `Failed to fetch details for space with slug "${identifier}".`
            : `Failed to fetch details for space with ID "${identifier}".`;
        // The extractErrorMessage from apiClient's interceptor should already provide a good message.
        // If not, or if you want to customize further based on status:
        let finalErrorMessage = error.message || defaultMsg;
        
        // Kiểm tra lỗi 404 từ response.status - axios đặt error.response.status
        if (error.response && error.response.status === 404) {
            console.log('[SpaceDetailApiService] 404 Not Found error detected correctly');
            finalErrorMessage = isSlug
                ? `Không gian với slug '${identifier}' không tìm thấy.`
                : `Không gian với ID '${identifier}' không tìm thấy.`;
            
            // Trả về một đối tượng giả lập không gian trống để frontend không bị crash
            // khi ID được cung cấp trong URL nhưng không tồn tại trong database
            console.log('[SpaceDetailApiService] Returning a mock space object for UI rendering');
            
            // Tạo một đối tượng không gian tạm thời với thông báo lỗi
            return {
                id: identifier,
                name: 'Không tìm thấy không gian',
                description: `Không tìm thấy thông tin không gian với ID ${identifier}. ID này có thể không tồn tại hoặc đã bị xóa.`,
                isNotFound: true, // Đánh dấu đây là đối tượng không tìm thấy để UI xử lý đặc biệt
                address: 'N/A',
                city: 'N/A',
                type: 'N/A',
                capacity: 0,
                spaceImages: []
            };
        }
        console.error(`[SpaceDetailApiService] Error fetching space by ${isSlug ? 'slug' : 'ID'}. Message:`, finalErrorMessage, 'Original error:', error);
        throw new Error(finalErrorMessage);
    }
};

/**
 * Lấy danh sách không gian của chủ sở hữu hiện tại
 * @returns {Promise<Array>} Danh sách không gian của owner hiện tại
 */
export const fetchOwnerSpacesAPI = async () => {
    const endpoint = `/api/owner/spaces`;
    console.log(`[SpaceDetailApiService] Fetching owner spaces from ${endpoint}`);
    
    try {
        const response = await apiClient.get(endpoint);
        console.log('[SpaceDetailApiService] Owner spaces fetch success:', response.data);
        return response.data;
    } catch (error) {
        console.error('[SpaceDetailApiService] Failed to fetch owner spaces:', error);
        throw new Error(error.response?.data?.message || 'Không thể tải danh sách không gian.');
    }
};

/**
 * Tạo không gian mới
 * @param {object} spaceData - Thông tin không gian mới
 * @returns {Promise<object>} Thông tin không gian sau khi tạo
 */
export const createSpaceAPI = async (spaceData) => {
    if (!spaceData) throw new Error('Space data is required');
    
    const endpoint = `/api/owner/spaces`;
    console.log(`[SpaceDetailApiService] Creating new space with data:`, spaceData);
    
    try {
        const response = await apiClient.post(endpoint, spaceData);
        console.log('[SpaceDetailApiService] Space created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('[SpaceDetailApiService] Failed to create space:', error);
        const errorMessage = error.response?.data?.message || 'Không thể tạo không gian mới.';
        throw new Error(errorMessage);
    }
};

/**
 * Lấy không gian theo owner ID
 * @param {string} ownerId - ID của chủ sở hữu
 * @returns {Promise<Array>} Danh sách không gian của owner cụ thể
 */
export const fetchSpacesByOwnerAPI = async (ownerId) => {
    if (!ownerId) throw new Error('Owner ID is required');
    
    const endpoint = `/api/owner/spaces/owner/${ownerId}`;
    console.log(`[SpaceDetailApiService] Fetching spaces for owner ID ${ownerId}`);
    
    try {
        const response = await apiClient.get(endpoint);
        console.log(`[SpaceDetailApiService] Spaces for owner ${ownerId} fetch success:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`[SpaceDetailApiService] Failed to fetch spaces for owner ${ownerId}:`, error);
        throw new Error(error.response?.data?.message || `Không thể tải danh sách không gian cho chủ sở hữu.`);
    }
};

/**
 * Cập nhật thông tin không gian
 * @param {string} spaceId - ID của không gian
 * @param {object} spaceData - Thông tin cập nhật
 * @returns {Promise<object>} Thông tin không gian sau khi cập nhật
 */
export const updateSpaceAPI = async (spaceId, spaceData) => {
    if (!spaceId) throw new Error('Space ID is required');
    if (!spaceData) throw new Error('Space data is required');
    
    const endpoint = `/api/owner/spaces/${spaceId}`;
    console.log(`[SpaceDetailApiService] Updating space ${spaceId} with data:`, spaceData);
    
    try {
        const response = await apiClient.put(endpoint, spaceData);
        console.log(`[SpaceDetailApiService] Space ${spaceId} updated successfully:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`[SpaceDetailApiService] Failed to update space ${spaceId}:`, error);
        throw new Error(error.response?.data?.message || 'Không thể cập nhật thông tin không gian.');
    }
};

/**
 * Xóa không gian
 * @param {string} spaceId - ID của không gian cần xóa
 * @returns {Promise<void>}
 */
export const deleteSpaceAPI = async (spaceId) => {
    if (!spaceId) throw new Error('Space ID is required');
    
    const endpoint = `/api/owner/spaces/${spaceId}`;
    console.log(`[SpaceDetailApiService] Deleting space with ID ${spaceId}`);
    
    try {
        const response = await apiClient.delete(endpoint);
        console.log(`[SpaceDetailApiService] Space ${spaceId} deleted successfully`);
        return response.data;
    } catch (error) {
        console.error(`[SpaceDetailApiService] Failed to delete space ${spaceId}:`, error);
        throw new Error(error.response?.data?.message || 'Không thể xóa không gian.');
    }
};

/**
 * Lấy danh sách hình ảnh của một không gian
 * @param {string} spaceId - ID của không gian
 * @returns {Promise<Array>} Danh sách hình ảnh
 */
export const fetchSpaceImagesAPI = async (spaceId) => {
    if (!spaceId) throw new Error('Space ID is required');
    
    const endpoint = `/api/owner/spaces/${spaceId}/images`;
    console.log(`[SpaceDetailApiService] Fetching images for space ID ${spaceId}`);
    
    try {
        const response = await apiClient.get(endpoint);
        console.log(`[SpaceDetailApiService] Images for space ${spaceId} fetch success:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`[SpaceDetailApiService] Failed to fetch images for space ${spaceId}:`, error);
        throw new Error(error.response?.data?.message || 'Không thể tải hình ảnh cho không gian.');
    }
};

/**
 * Thêm hình ảnh cho không gian
 * @param {string} spaceId - ID của không gian
 * @param {FormData} imageData - Form data chứa hình ảnh
 * @returns {Promise<object>} Thông tin về hình ảnh đã thêm
 */
export const addSpaceImageAPI = async (spaceId, imageData) => {
    if (!spaceId) throw new Error('Space ID is required');
    if (!imageData) throw new Error('Image data is required');
    
    const endpoint = `/api/owner/spaces/${spaceId}/images`;
    console.log(`[SpaceDetailApiService] Adding image for space ID ${spaceId}`);
    
    try {
        const response = await apiClient.post(endpoint, imageData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log(`[SpaceDetailApiService] Image added successfully for space ${spaceId}:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`[SpaceDetailApiService] Failed to add image for space ${spaceId}:`, error);
        throw new Error(error.response?.data?.message || 'Không thể thêm hình ảnh cho không gian.');
    }
};

/**
 * Xóa hình ảnh của không gian
 * @param {string} spaceId - ID của không gian
 * @param {string} imageId - ID của hình ảnh
 * @returns {Promise<void>}
 */
export const deleteSpaceImageAPI = async (spaceId, imageId) => {
    if (!spaceId) throw new Error('Space ID is required');
    if (!imageId) throw new Error('Image ID is required');
    
    const endpoint = `/api/owner/spaces/${spaceId}/images/${imageId}`;
    console.log(`[SpaceDetailApiService] Deleting image ${imageId} for space ID ${spaceId}`);
    
    try {
        const response = await apiClient.delete(endpoint);
        console.log(`[SpaceDetailApiService] Image ${imageId} deleted successfully for space ${spaceId}`);
        return response.data;
    } catch (error) {
        console.error(`[SpaceDetailApiService] Failed to delete image ${imageId} for space ${spaceId}:`, error);
        throw new Error(error.response?.data?.message || 'Không thể xóa hình ảnh.');
    }
};

/**
 * Cập nhật thông tin chi tiết của hình ảnh
 * @param {string} spaceId - ID của không gian
 * @param {string} imageId - ID của hình ảnh
 * @param {object} imageDetails - Chi tiết hình ảnh cần cập nhật
 * @returns {Promise<object>} Thông tin hình ảnh sau khi cập nhật
 */
export const updateSpaceImageDetailsAPI = async (spaceId, imageId, imageDetails) => {
    if (!spaceId) throw new Error('Space ID is required');
    if (!imageId) throw new Error('Image ID is required');
    if (!imageDetails) throw new Error('Image details are required');
    
    const endpoint = `/api/owner/spaces/${spaceId}/images/${imageId}/details`;
    console.log(`[SpaceDetailApiService] Updating details for image ${imageId} of space ${spaceId}`);
    
    try {
        const response = await apiClient.put(endpoint, imageDetails);
        console.log(`[SpaceDetailApiService] Details for image ${imageId} updated successfully`);
        return response.data;
    } catch (error) {
        console.error(`[SpaceDetailApiService] Failed to update details for image ${imageId}:`, error);
        throw new Error(error.response?.data?.message || 'Không thể cập nhật chi tiết hình ảnh.');
    }
};

/**
 * Đặt hình ảnh làm ảnh bìa
 * @param {string} spaceId - ID của không gian
 * @param {string} imageId - ID của hình ảnh
 * @returns {Promise<void>}
 */
export const setSpaceCoverImageAPI = async (spaceId, imageId) => {
    if (!spaceId) throw new Error('Space ID is required');
    if (!imageId) throw new Error('Image ID is required');
    
    const endpoint = `/api/owner/spaces/${spaceId}/images/${imageId}/set-cover`;
    console.log(`[SpaceDetailApiService] Setting image ${imageId} as cover for space ${spaceId}`);
    
    try {
        const response = await apiClient.post(endpoint);
        console.log(`[SpaceDetailApiService] Image ${imageId} set as cover successfully`);
        return response.data;
    } catch (error) {
        console.error(`[SpaceDetailApiService] Failed to set image ${imageId} as cover:`, error);
        throw new Error(error.response?.data?.message || 'Không thể đặt ảnh bìa.');
    }
};

/**
 * Tìm kiếm không gian theo tiêu chí
 * @param {object} searchParams - Các tham số tìm kiếm
 * @returns {Promise<Array>} Danh sách không gian phù hợp
 */
export const searchSpacesAPI = async (searchParams) => {
    const endpoint = `/api/owner/spaces/search`;
    console.log(`[SpaceDetailApiService] Searching spaces with params:`, searchParams);
    
    try {
        const response = await apiClient.get(endpoint, { params: searchParams });
        console.log(`[SpaceDetailApiService] Space search successful:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`[SpaceDetailApiService] Space search failed:`, error);
        throw new Error(error.response?.data?.message || 'Không thể tìm kiếm không gian.');
    }
};