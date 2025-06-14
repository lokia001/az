// src/features/chatbot/services/chatbotApi.js
import api from '../../../services/api';

const CHATBOT_API_BASE = '/api/chatbot';

/**
 * Enhanced chatbot API service that handles both authenticated and anonymous users
 */
export const sendChatMessage = async (message, userId = null) => {
  try {
    const token = localStorage.getItem('accessToken');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5035';

    // Prepare request data
    const requestData = {
      message,
      userId: userId || 'anonymous-user',
      lastMessage: message
    };

    // Try different endpoint patterns
    const endpoints = [
      `${CHATBOT_API_BASE}/dialogflow-webhook`,
      '/chatbot/dialogflow-webhook',
      `${CHATBOT_API_BASE}/webhook`
    ];

    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const config = token ? {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        } : {
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const response = await apiClient.post(endpoint, requestData, config);

        if (response.data) {
          return response.data;
        }
      } catch (error) {
        console.warn(`Failed to connect to chatbot endpoint ${endpoint}:`, error.message);
        lastError = error;
        continue;
      }
    }

    // If all endpoints fail, throw the last error
    throw lastError || new Error('All chatbot endpoints failed');

  } catch (error) {
    console.error('Chatbot API Error:', error);

    // Fallback response for better user experience
    return {
      fulfillmentText: 'Xin lỗi, tôi đang gặp một chút vấn đề kỹ thuật. Bạn vui lòng thử lại sau.',
      intent: 'fallback',
      error: true
    };
  }
};

/**
 * Get personalized suggestions based on user history
 */
export const getPersonalizedSuggestions = async (userId = null) => {
  try {
    const token = localStorage.getItem('accessToken');
    const requestData = {
      userId: userId || 'anonymous-user'
    };

    const endpoints = [
      `${CHATBOT_API_BASE}/personalized-suggestions`,
      '/chatbot/personalized-suggestions'
    ];

    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const config = token ? {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        } : {
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const response = await apiClient.post(endpoint, requestData, config);

        if (response.data) {
          return response.data;
        }
      } catch (error) {
        console.warn(`Failed to get suggestions from ${endpoint}:`, error.message);
        lastError = error;
        continue;
      }
    }

    // Return empty suggestions if all endpoints fail
    return [];

  } catch (error) {
    console.error('Personalized Suggestions API Error:', error);
    return [];
  }
};

/**
 * Test chatbot connectivity
 */
export const testChatbotConnection = async () => {
  try {
    const response = await sendChatMessage('Hello', 'test-user');
    return {
      connected: true,
      response: response
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
};

export default {
  sendChatMessage,
  getPersonalizedSuggestions,
  testChatbotConnection
};
