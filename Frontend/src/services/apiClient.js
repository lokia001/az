// src/services/apiClient.js
import axios from 'axios';
// REMOVE: import { store } from '../store';
// REMOVE: import { logoutUser } from '../features/auth/slices/authSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5035';

// Debug configuration 
console.log('[Debug] API Base URL:', API_BASE_URL);

// Thêm URL dự phòng cho môi trường không có backend
const fallbackUrls = {
    chatbot: 'https://dialogflow.googleapis.com/v2/projects/bookingbotvi-apjh/agent/sessions/_:detectIntent',
    api: API_BASE_URL
};

// Flag to track API availability
let isApiAvailable = true;
let lastCheckTime = 0;
const CHECK_INTERVAL = 30000; // 30 seconds

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 20000, // Tăng timeout để xử lý kết nối chậm với Dialogflow

    // Retry logic for failed requests
    retry: 2, // Number of retries
    retryDelay: 1000, // 1 second delay between retries
});

// --- Request Interceptor ---
apiClient.interceptors.request.use(
    (config) => {
        // Get token from localStorage directly.
        // The Redux state should be the source of truth for the app,
        // but for the interceptor, localStorage is reliable if set correctly on login/logout.
        const token = localStorage.getItem('accessToken');

        // The backend has app.UsePathBase("/api") but the controllers already have [Route("api/xxx")]
        // We'll handle this by using direct URLs without path manipulation
        if (config.url) {
            console.log(`[URL Fix] Original URL: ${config.url}`);
            // Don't add any prefixes - let the controller routes handle it
            // The baseURL in axios config is already set to http://localhost:5035
        }

        if (token) {
            // Log for debugging token-related issues
            console.log(`API Request to ${config.url} - Auth token exists`);
            config.headers['Authorization'] = `Bearer ${token}`;
        } else {
            console.warn(`API Request to ${config.url} - No auth token available`);
            // For endpoints that require authorization but no token exists
            if (config.url && (config.url.includes('/chatbot/') || config.url.includes('/api/chatbot/'))) {
                console.warn('Attempting to access chatbot API without authentication token');
            }
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Utility function to check API availability
const checkApiAvailability = async () => {
    const now = Date.now();
    // Only check every CHECK_INTERVAL ms to avoid excessive requests
    if (now - lastCheckTime < CHECK_INTERVAL) {
        return isApiAvailable;
    }

    try {
        await axios.get(`${API_BASE_URL}/api/health`, { timeout: 3000 });
        isApiAvailable = true;
    } catch (error) {
        console.warn('API health check failed, marking API as unavailable');
        isApiAvailable = false;
    }

    lastCheckTime = now;
    return isApiAvailable;
};

// --- Response Interceptor ---
apiClient.interceptors.response.use(
    (response) => {
        // Mark API as available on successful response
        isApiAvailable = true;
        return response;
    },
    async (error) => {
        // Get the original request config
        const originalRequest = error.config;
        const isChatbotRequest = originalRequest?.url?.includes('/chatbot/');

        // Handle retry logic for network errors and 5xx errors
        if ((error.code === 'ECONNABORTED' || !error.response || (error.response && error.response.status >= 500))
            && originalRequest && originalRequest._retry !== true) {

            // Check if we should retry based on the 'retry' count in config
            if (typeof originalRequest.retry === 'undefined') {
                originalRequest.retry = 2;
            }

            if (originalRequest.retry > 0) {
                console.log(`Retrying request to ${originalRequest.url}, ${originalRequest.retry} attempts left`);
                originalRequest._retry = true;
                originalRequest.retry--;

                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, originalRequest.retryDelay || 1000));

                try {
                    return await apiClient(originalRequest);
                } catch (retryError) {
                    console.error('Retry failed:', retryError.message);
                }
            }
        }

        // Log detailed error information
        if (error.response) {
            console.error('API Error Response:', error.response.data);
            console.error('Status:', error.response.status);
            console.error('Request URL:', error.config?.url);

            // Log cụ thể hơn cho lỗi 400 Bad Request
            if (error.response.status === 400) {
                console.error('Bad Request (400) details:', error.response.data);
                // Đảm bảo rằng error response data được duy trì trong error object để xử lý ở phía gọi API
                error.responseData = error.response.data;
            }

            if (error.response.status === 401) {
                console.warn('apiClient: Unauthorized access (401) to', error.config?.url);

                // Special handling for chatbot requests
                if (isChatbotRequest) {
                    const token = localStorage.getItem('accessToken');
                    console.warn('Chatbot API 401 error - Token exists:', !!token);

                    if (!token) {
                        console.warn('No token found for chatbot API request');
                        // Could handle fallback to public endpoint here
                    }
                }
            }
        } else if (error.request) {
            console.error('API No Response:', error.request);
            // Check API availability since we got no response
            await checkApiAvailability();
        } else {
            console.error('API Request Setup Error:', error.message);
        }

        return Promise.reject(error); // Propagate the error for component-level handling
    }
);

// Thêm hàm static để kiểm tra trạng thái API
apiClient.checkApiStatus = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/health`, {
            timeout: 5000,
            validateStatus: status => status < 500 // Chấp nhận status codes < 500
        });

        return {
            available: response.status < 400,
            status: response.status,
            message: response.data?.message || 'API is responding'
        };
    } catch (error) {
        console.error('API Health Check Error:', error.message);

        return {
            available: false,
            status: error.response?.status || 0,
            message: error.message || 'API is not responding'
        };
    }
};

// Thêm phương thức để kiểm tra trạng thái chatbot API
apiClient.checkChatbotStatus = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/chatbot/status`, {
            timeout: 5000,
            validateStatus: status => true // Chấp nhận mọi status code để có thông tin
        });

        return {
            available: response.status === 200,
            status: response.status,
            message: response.data?.status || 'Unknown'
        };
    } catch (error) {
        // Kiểm tra xem API chính có hoạt động không
        const apiStatus = await apiClient.checkApiStatus();

        return {
            available: false,
            apiAvailable: apiStatus.available,
            status: error.response?.status || 0,
            message: error.message || 'Chatbot service is not responding'
        };
    }
};

export default apiClient;