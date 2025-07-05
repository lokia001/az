import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { sendChatMessage, getPersonalizedSuggestions } from '../services/chatbotApi';
import '../styles/ChatbotWidget.css';

const CustomChatWidget = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const { token } = useSelector((state) => state.auth);
    const { userId } = useSelector((state) => state.auth.user) || {};

    useEffect(() => {
        setMessages([{
            text: 'Xin chào! Tôi có thể giúp gì cho bạn?',
            sender: 'bot'
        }]);
        
        // Test chatbot connection on mount
        testConnection();
    }, []);

    const testConnection = async () => {
        try {
            const testResponse = await sendChatMessage('test connection', userId);
            console.log('Chatbot connection test:', testResponse);
        } catch (error) {
            console.warn('Chatbot connection test failed:', error);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        // Add user message
        const userMessage = {
            text: inputMessage,
            sender: 'user'
        };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');

        try {
            // Use the enhanced chatbotApi service
            const response = await sendChatMessage(inputMessage, userId);

            if (response.fulfillmentText) {
                setMessages(prev => [...prev, {
                    text: response.fulfillmentText,
                    sender: 'bot'
                }]);
            }

            // Get personalized suggestions for specific intents
            if (response.intent === 'search_workspace' ||
                response.intent === 'booking_workspace') {

                const suggestions = await getPersonalizedSuggestions(userId);

                if (suggestions && suggestions.length > 0) {
                    setMessages(prev => [
                        ...prev,
                        {
                            text: 'Dựa trên lịch sử của bạn, tôi đề xuất:',
                            sender: 'bot'
                        },
                        ...suggestions.map(suggestion => ({
                            text: suggestion.suggestion || suggestion,
                            sender: 'bot'
                        }))
                    ]);
                }
            }
        } catch (error) {
            console.error('Error communicating with chatbot:', error);
            setMessages(prev => [...prev, {
                text: 'Xin lỗi, tôi đang gặp một chút vấn đề kỹ thuật. Bạn vui lòng thử lại sau.',
                sender: 'bot'
            }]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`chat-widget ${!isOpen ? 'minimized' : ''}`}>
            <div className="chat-header" onClick={toggleChat}>
                <h3>ABC Workspace Assistant</h3>
                <button className="toggle-button">
                    {isOpen ? '−' : '+'}
                </button>
            </div>
            {isOpen && (
                <>
                    <div className="chat-messages">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
                            >
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập tin nhắn của bạn..."
                        />
                        <button onClick={handleSendMessage}>Gửi</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CustomChatWidget;
