// src/services/api.js
import axios from 'axios';

// Create an axios instance with base configuration
const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5035'}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("Auth token added to request", config.url);
        } else {
            console.warn("No access token found for request", config.url);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error("401 Unauthorized error for request:", error.config?.url);
            console.error("Auth headers:", error.config?.headers?.Authorization ? "Present" : "Missing");
            
            // Log token information for debugging
            const accessToken = localStorage.getItem('accessToken');
            console.log("Current accessToken exists:", !!accessToken);
            
            // Don't remove token or navigate automatically to avoid disrupting form submissions
            // The auth slice should handle token management
        } else if (error.response) {
            console.error(`API Error: ${error.response.status} for ${error.config?.url}`, error.response.data);
        }
        return Promise.reject(error);
    }
);

// Spaces API functions
export const getSpaces = async (params = {}) => {
    try {
        const response = await api.get('/owner/spaces', { params });
        console.log("getSpaces response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching spaces:", error);
        throw error;
    }
};

export const getOwnerSpaces = async (ownerId, params = {}) => {
    try {
        if (!ownerId) {
            console.error("Owner ID is required but was not provided");
            throw new Error("Owner ID is required");
        }

        // Use the correct API endpoint for owner spaces
        const response = await api.get(`/owner/spaces/owner/${ownerId}`, { 
            params: { 
                ...params,
                onlyOwned: true
            } 
        });
        
        console.log("getOwnerSpaces response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching owner spaces:", error);
        
        // For debugging purposes, log more details
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
            console.error("Response headers:", error.response.headers);
        }
        
        // Return empty array instead of throwing to avoid breaking the UI
        return [];
    }
};

export const findSpace = async (id) => {
    try {
        console.log("findSpace called with ID:", id);
        
        // Try different API patterns without /api prefix (since it's already in baseURL)
        let response;
        try {
            console.log("Trying GET /owner/spaces/{id}");
            response = await api.get(`/owner/spaces/${id}`);
        } catch (err1) {
            console.log("First pattern failed:", err1.message);
            try {
                console.log("Trying GET /spaces/{id}");
                response = await api.get(`/spaces/${id}`);
            } catch (err2) {
                console.log("Second pattern failed:", err2.message);
                throw err2;
            }
        }
        
        console.log("findSpace response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching space details:", error);
        
        // For debugging
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
        }
        
        // Return a placeholder space object with the ID to avoid UI errors
        return {
            id: id,
            name: 'Space data unavailable',
            description: 'Could not load space details. Please try again later.',
            status: 'unknown'
        };
    }
};

export const createSpace = async (space) => {
    try {
        console.log("createSpace called with data:", space);
        // Log auth status before making the request
        const token = localStorage.getItem('accessToken');
        console.log("Creating space with auth token:", !!token);
        
        // Detailed logging for debugging time fields
        if (space.openTime) console.log("OpenTime format:", space.openTime);
        if (space.closeTime) console.log("CloseTime format:", space.closeTime);
        
        // The backend expects the data directly, not wrapped in a request object
        const response = await api.post('/owner/spaces', space);
        console.log("createSpace response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating space:", error);
        
        // Log the specific error details for debugging
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
            
            // Check for validation errors
            if (error.response.data && error.response.data.errors) {
                console.error("Validation errors:", error.response.data.errors);
            }
        }
        
        // Handle error but don't cause navigation
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.title ||
                            (error.response?.data?.errors ? "Validation errors in form" : null) ||
                            error.message || 
                            'Có lỗi xảy ra khi tạo không gian';
        throw new Error(errorMessage);
    }
};

export const updateSpace = async (spaceId, space) => {
    try {
        console.log("updateSpace called with ID:", spaceId, "and data:", space);
        
        // Detailed logging for debugging time fields
        if (space.openTime) console.log("OpenTime format:", space.openTime);
        if (space.closeTime) console.log("CloseTime format:", space.closeTime);
        
        // Send the space data directly (not wrapped in request object)
        // Backend controller uses [FromBody] which should bind directly to the model
        const response = await api.put(`/owner/spaces/${spaceId}`, space);
        console.log("updateSpace response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating space:", error);
        
        // Log the specific error details for debugging
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
            
            // Check for validation errors
            if (error.response.data && error.response.data.errors) {
                console.error("Validation errors:", error.response.data.errors);
            }
        }
        
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.title ||
                            (error.response?.data?.errors ? "Validation errors in form" : null) ||
                            error.message || 
                            'Có lỗi xảy ra khi cập nhật không gian';
        throw new Error(errorMessage);
    }
};

export const deleteSpace = async (spaceId) => {
    try {
        console.log("deleteSpace called with ID:", spaceId);
        await api.delete(`/owner/spaces/${spaceId}`);
        console.log("Space deleted successfully");
        return spaceId;
    } catch (error) {
        console.error("Error deleting space:", error);
        throw error;
    }
};

// Amenities API functions
export const getAllAmenities = async () => {
    try {
        const response = await api.get('/amenities');
        console.log("getAllAmenities response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching amenities:", error);
        throw error;
    }
};

// Add alias for compatibility with amenitySlice.js
export const getAmenities = getAllAmenities;

export const createAmenity = async (amenityData) => {
    try {
        const response = await api.post('/amenities', amenityData);
        console.log("createAmenity response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating amenity:", error);
        throw error;
    }
};

// Users API functions
export const getUsers = async (params = {}) => {
    try {
        const response = await api.get('/users', { params });
        console.log("getUsers response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const response = await api.post('/users', userData);
        console.log("createUser response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

export const updateUser = async (userId, userData) => {
    try {
        const response = await api.put(`/users/${userId}`, userData);
        console.log("updateUser response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        await api.delete(`/users/${userId}`);
        console.log("User deleted successfully");
        return true;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
};

// Booking API functions
export const createBooking = async (bookingData) => {
    try {
        const response = await api.post('/bookings', bookingData);
        console.log("createBooking response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating booking:", error);
        throw error;
    }
};

export const getBookings = async (params = {}) => {
    try {
        const response = await api.get('/bookings', { params });
        console.log("getBookings response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching bookings:", error);
        throw error;
    }
};

export const getUserBookings = async (userId) => {
    try {
        const response = await api.get(`/users/${userId}/bookings`);
        console.log("getUserBookings response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        throw error;
    }
};

export const getOwnerBookings = async () => {
    try {
        const response = await api.get('/bookings/owner-bookings'); // Corrected API endpoint
        console.log("getOwnerBookings response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching owner bookings:", error);
        throw error;
    }
};

export const updateBooking = async (bookingId, bookingData) => {
    try {
        const response = await api.put(`/bookings/${bookingId}`, bookingData);
        console.log("updateBooking response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating booking:", error);
        throw error;
    }
};

export const cancelBooking = async (bookingId) => {
    try {
        const response = await api.put(`/bookings/${bookingId}/cancel`);
        console.log("cancelBooking response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error cancelling booking:", error);
        throw error;
    }
};

// System Items API functions
export const getSystemSpaceServices = async () => {
    try {
        const response = await api.get('/system/space-services');
        console.log("getSystemSpaceServices response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching system space services:", error);
        throw error;
    }
};

export const createSystemSpaceService = async (serviceData) => {
    try {
        const response = await api.post('/system/space-services', serviceData);
        console.log("createSystemSpaceService response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating system space service:", error);
        throw error;
    }
};

export const updateSystemSpaceService = async (serviceId, serviceData) => {
    try {
        const response = await api.put(`/system/space-services/${serviceId}`, serviceData);
        console.log("updateSystemSpaceService response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating system space service:", error);
        throw error;
    }
};

export const deleteSystemSpaceService = async (serviceId) => {
    try {
        await api.delete(`/system/space-services/${serviceId}`);
        console.log("System space service deleted successfully");
        return true;
    } catch (error) {
        console.error("Error deleting system space service:", error);
        throw error;
    }
};

export const getSystemAmenities = async () => {
    try {
        const response = await api.get('/system/amenities');
        console.log("getSystemAmenities response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching system amenities:", error);
        throw error;
    }
};

export const createSystemAmenity = async (amenityData) => {
    try {
        const response = await api.post('/system/amenities', amenityData);
        console.log("createSystemAmenity response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating system amenity:", error);
        throw error;
    }
};

export const updateSystemAmenity = async (amenityId, amenityData) => {
    try {
        const response = await api.put(`/system/amenities/${amenityId}`, amenityData);
        console.log("updateSystemAmenity response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating system amenity:", error);
        throw error;
    }
};

export const deleteSystemAmenity = async (amenityId) => {
    try {
        await api.delete(`/system/amenities/${amenityId}`);
        console.log("System amenity deleted successfully");
        return true;
    } catch (error) {
        console.error("Error deleting system amenity:", error);
        throw error;
    }
};

// Profile API functions
export const getProfile = async () => {
    try {
        const response = await api.get('/profile');
        console.log("getProfile response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
    }
};

export const updateProfile = async (profileData) => {
    try {
        const response = await api.put('/profile', profileData);
        console.log("updateProfile response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

// Export the axios instance for use in other services
export default api;
