import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './ChatBot.css';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [config, setConfig] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    useEffect(() => {
        if (isOpen && messages.length === 0 && config) {
            // Add welcome message when opened first time
            setMessages([{
                id: 1,
                text: config.welcome_message || "Hello! How can I assist you?",
                sender: 'bot'
            }]);
        }
    }, [isOpen, config]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConfig = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/content/chatbot/`);
            setConfig(res.data);
        } catch (error) {
            console.error("Error loading chatbot config", error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSend = (text) => {
        const userMsg = text || input;
        if (!userMsg.trim()) return;

        // Add User Message
        const newMsg = { id: Date.now(), text: userMsg, sender: 'user' };
        setMessages(prev => [...prev, newMsg]);
        setInput('');

        // Simulate Bot Response (Simple Logic)
        setTimeout(() => {
            let botResponse = "Thanks for your message! Our support team will get back to you shortly.";

            // Simple keyword matching
            const lowerMsg = userMsg.toLowerCase();
            if (lowerMsg.includes('track') || lowerMsg.includes('order')) {
                botResponse = "You can track your order in the 'My Orders' section after logging in.";
            } else if (lowerMsg.includes('return') || lowerMsg.includes('refund')) {
                botResponse = "We have a 7-day return policy for damaged items. Please check our footer for details.";
            } else if (lowerMsg.includes('bulk')) {
                botResponse = "For bulk orders, please email us directly at sales@sjgstationery.com for a quote.";
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
        }, 1000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>

            {/* Toggle Button */}
            <button className="chatbot-toggle" onClick={toggleChat}>
                {isOpen ? <i className="fas fa-times"></i> : <i className="fas fa-comment-dots"></i>}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="header-info">
                            <span className="bot-avatar"><i className="fas fa-robot"></i></span>
                            <div>
                                <h4>SJG Assistant</h4>
                                <span className="status-dot"></span> Online
                            </div>
                        </div>
                        <button className="chat-close-btn" onClick={toggleChat}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message ${msg.sender}`}>
                                <div className="message-bubble">
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Replies */}
                    {config?.quick_replies?.length > 0 && (
                        <div className="quick-replies">
                            {config.quick_replies.map((reply, index) => (
                                <button key={index} onClick={() => handleSend(reply)}>
                                    {reply}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="chatbot-input">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button onClick={() => handleSend()} disabled={!input.trim()}>
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
