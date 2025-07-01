// src/features/auth/services/authApi.js
import apiClient from '../../../services/apiClient';
import i18n from '../../../i18n'; // Import i18n

// Function to map backend error codes to translation keys
const getErrorTranslation = (errorMessage) => {
    // Common error mappings
    const errorMappings = {
        'User already exists': 'error.userExists',
        'Email already exists': 'error.emailExists',
        'Username already exists': 'error.usernameExists',
        'is already registered': 'error.emailAlreadyRegistered',
        'Email \'': 'error.emailAlreadyRegistered',
        'Invalid credentials': 'error.invalidCredentials',
        'Invalid username or password': 'error.invalidCredentials',
        'User not found': 'error.userNotFound'
        // Add more mappings as needed
    };

    // Log the error message for debugging
    console.log('Error message from backend:', errorMessage);

    // Check if we have a translation for this error
    for (const [errorText, translationKey] of Object.entries(errorMappings)) {
        if (errorMessage && typeof errorMessage === 'string' && errorMessage.includes(errorText)) {
            return i18n.t(translationKey);
        }
    }

    // If no specific mapping or errorMessage is not a string, return the original message
    return errorMessage;
};

// LOGIN API
export const loginAPI = async (credentials) => {
    // Credentials will be { usernameOrEmail: '...', password: '...' }
    try {
        console.log('[AuthAPI] Attempting login with credentials:', { ...credentials, password: '***' });
        // Use the exact full path that matches the backend configuration
        const response = await apiClient.post('/api/auth/login', credentials);
        console.log('[AuthAPI] Login successful, received data:', response.data);
        // Response is { accessToken, accessTokenExpiration, refreshToken }
        return response.data;
    } catch (error) {
        // Re-throw a structured error or the error data from backend
        const errorMessage = error.response?.data?.message || // Backend specific
            error.response?.data?.title ||   // ASP.NET Core ProblemDetails
            error.response?.data?.error?.message || // Another common pattern
            (typeof error.response?.data === 'string' ? error.response.data : null) || // If data is just a string
            error.message || // Fallback to generic error message
            'Login request failed';
            
        // Use the translated error if available
        const translatedError = getErrorTranslation(errorMessage);
        throw new Error(translatedError);
    }
};

// REGISTER API
export const registerAPI = async (userData) => {
    try {
        const response = await apiClient.post('/api/auth/register', userData);
        // Assuming it might also return tokens and potentially trigger a /me call
        return response.data;
    } catch (error) {
        // Log the complete error for debugging
        console.log('Register API Error:', error);
        console.log('Register API Status:', error.response?.status);
        console.log('Register API Error Response:', error.response?.data);
        
        // Check if the response contains a detailed error structure that might have the email error
        let errorMessage;
        
        if (error.response?.status === 400) {
            // Xử lý đặc biệt cho lỗi Bad Request (400)
            const data = error.response.data;
            console.log('Processing 400 error data:', data);
            
            // Nếu là object, trích xuất thông điệp lỗi
            if (data && typeof data === 'object') {
                // Đối với DotNet API thường có cấu trúc lỗi 400 như sau
                if (data.errors) {
                    // Lỗi validation - lấy lỗi đầu tiên
                    const firstErrorField = Object.keys(data.errors)[0];
                    if (firstErrorField) {
                        errorMessage = data.errors[firstErrorField][0];
                    }
                } else if (data.message) {
                    // Lỗi có message field 
                    errorMessage = data.message;
                } else if (data.title) {
                    // Format ASP.NET Core ProblemDetails
                    errorMessage = data.title;
                } else if (data.error) {
                    // Format lỗi tập trung vào trường error
                    errorMessage = data.error.message || data.error;
                } else {
                    // Thử lấy bất kỳ trường nào có thể là thông báo lỗi
                    errorMessage = data.detail || data.Message || data.description;
                }
            } else if (typeof data === 'string') {
                // Nếu response data là string (một số API trả về string trực tiếp)
                errorMessage = data;
            }
        } else if (error.response?.data) {
            const data = error.response.data;
            
            // Try to extract message from various formats the backend might return
            errorMessage = data.message || 
                           data.title || 
                           data.error?.message ||
                           (typeof data === 'string' ? data : null);
                           
            // If we have a data object with errors property (common ASP.NET format)
            if (data.errors) {
                // Check for email-related errors specifically
                if (data.errors.Email) {
                    errorMessage = data.errors.Email[0];  // Use first email error
                } else if (data.errors.email) {
                    errorMessage = data.errors.email[0];
                } else {
                    // Take the first error from any field
                    const firstErrorField = Object.keys(data.errors)[0];
                    if (firstErrorField) {
                        errorMessage = data.errors[firstErrorField][0];
                    }
                }
            }
        }
        
        // Fallback if we couldn't find a specific error message
        if (!errorMessage) {
            errorMessage = error.message || 'Registration request failed';
        }
        
        // Đảm bảo ghi log rõ ràng cho mục đích debug
        console.log('Final error message extracted:', errorMessage);
            
        // Use the translated error if available
        const translatedError = getErrorTranslation(errorMessage);
        console.log('Translated error message:', translatedError);
        throw new Error(translatedError);
    }
};

export const fetchUserProfileAPI = async () => {
    try {
        // This endpoint is protected and uses the accessToken from the Authorization header
        const response = await apiClient.get('/api/users/me'); // Updated with correct api prefix
        // EXPECTED RESPONSE is exactly what you provided.
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 
            error.response?.data?.title || 
            error.message || 
            'Fetching user profile failed';
            
        // Use the translated error if available
        const translatedError = getErrorTranslation(errorMessage);
        throw new Error(translatedError);
    }
};

// REFRESH TOKEN API
export const refreshTokenAPI = async (accessToken, refreshToken) => {
    try {
        console.log('[AuthAPI] Attempting to refresh token');
        const response = await apiClient.post('/api/auth/refresh-token', {
            expiredAccessToken: accessToken,
            refreshToken: refreshToken
        });
        console.log('[AuthAPI] Token refresh successful');
        // Response is { accessToken, accessTokenExpiration, refreshToken }
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 
            error.response?.data?.title || 
            error.message || 
            'Token refresh failed';
            
        // Use the translated error if available
        const translatedError = getErrorTranslation(errorMessage);
        throw new Error(translatedError);
    }
};

// Helper to set tokens in localStorage and apiClient
export const setAuthTokens = (data) => {
    // data should be { accessToken, refreshToken, (accessTokenExpiration) }
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
    }
    // accessTokenExpiration can also be stored if needed for client-side expiry checks
    if (data.accessTokenExpiration) {
        localStorage.setItem('accessTokenExpiration', data.accessTokenExpiration);
    }
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
};

// Helper to clear tokens
export const clearAuthTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authUser'); // User object
    localStorage.removeItem('accessTokenExpiration');
    delete apiClient.defaults.headers.common['Authorization'];
};