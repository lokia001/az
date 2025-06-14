import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { sendChatMessage } from './services/chatbotApi';

export const sendMessage = createAsyncThunk(
    'chatbot/sendMessage',
    async ({ message, userId }, { rejectWithValue }) => {
        try {
            // Use the enhanced chatbotApi service which handles both anonymous and authenticated users
            const result = await sendChatMessage(message, userId);
            return result;
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message });
        }
    }
);

export const getPersonalizedSuggestions = createAsyncThunk(
    'chatbot/getPersonalizedSuggestions',
    async ({ userId }, { rejectWithValue }) => {
        try {
            // Use URL patterns to find the working endpoint
            const token = localStorage.getItem('accessToken');
            const baseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:5035';

            // Try different URL patterns in sequence
            const urlPatterns = [
                '/api/api/chatbot/personalized-suggestions',
                '/api/chatbot/personalized-suggestions',
                '/chatbot/personalized-suggestions'
            ];

            let lastError = null;
            for (const pattern of urlPatterns) {
                try {
                    const url = new URL(pattern, baseUrl).toString();
                    const config = token ? {
                        headers: { Authorization: `Bearer ${token}` }
                    } : {};

                    const response = await axios.post(url, { userId: userId || 'anonymous-user' }, config);
                    return response.data;
                } catch (error) {
                    console.warn(`Error with URL pattern ${pattern}:`, error.message);
                    lastError = error;
                }
            }

            // If all patterns failed, reject with the last error
            return rejectWithValue(lastError?.response?.data || { error: lastError?.message || 'Unknown error' });
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: error.message });
        }
    }
);

const initialState = {
    messages: [],
    suggestions: [],
    loading: false,
    error: null
};

const chatbotSlice = createSlice({
    name: 'chatbot',
    initialState,
    reducers: {
        clearMessages: (state) => {
            state.messages = [];
        },
        clearSuggestions: (state) => {
            state.suggestions = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendMessage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.loading = false;

                // Handle the case where authentication is required
                if (action.payload?.intent === 'require_auth') {
                    state.messages.push({
                        type: 'bot',
                        content: action.payload.fulfillmentText,
                        requiresAuth: true,
                        suggestions: action.payload.suggestions
                    });
                } else {
                    state.messages.push({
                        type: 'bot',
                        content: action.payload.fulfillmentText
                    });
                }
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getPersonalizedSuggestions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPersonalizedSuggestions.fulfilled, (state, action) => {
                state.loading = false;
                state.suggestions = action.payload;
            })
            .addCase(getPersonalizedSuggestions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearMessages, clearSuggestions } = chatbotSlice.actions;
export default chatbotSlice.reducer;
