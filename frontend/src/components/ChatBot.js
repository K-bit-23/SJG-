import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Hello! 👋 Welcome to SJG Stationery. How can I help you today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Simple bot responses
    const getBotResponse = (userMessage) => {
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return "Hello! How can I assist you today? 😊";
        }
        if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
            return "Our prices range from ₹50 to ₹5000 depending on the product. You can check our Shop page for detailed pricing!";
        }
        if (lowerMessage.includes('delivery') || lowerMessage.includes('shipping')) {
            return "We offer free delivery on orders above ₹500! Standard delivery takes 3-5 business days.";
        }
        if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
            return "We have a 7-day return policy. If you're not satisfied, you can return the product for a full refund.";
        }
        if (lowerMessage.includes('order') || lowerMessage.includes('track')) {
            return "You can track your order from your Profile page. Go to 'My Orders' to see the status.";
        }
        if (lowerMessage.includes('payment')) {
            return "We accept UPI, Credit/Debit cards, Net Banking, and Cash on Delivery (COD).";
        }
        if (lowerMessage.includes('contact') || lowerMessage.includes('support')) {
            return "You can reach us at +91 93600 24821 or click the WhatsApp button below!";
        }
        if (lowerMessage.includes('product') || lowerMessage.includes('stationery')) {
            return "We have notebooks, pens, art supplies, office materials, and more! Check our Shop page.";
        }
        if (lowerMessage.includes('discount') || lowerMessage.includes('offer')) {
            return "Use code WELCOME10 for 10% off on your first order! 🎉";
        }
        if (lowerMessage.includes('thank')) {
            return "You're welcome! Is there anything else I can help you with? 😊";
        }
        if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
            return "Goodbye! Thank you for visiting SJG Stationery. Have a great day! 👋";
        }

        return "I'm here to help! You can ask me about products, pricing, delivery, returns, or payments. For complex queries, please contact our support team.";
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;

        // Add user message
        const userMessage = inputValue;
        setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
        setInputValue('');
        setIsTyping(true);

        // Simulate bot thinking
        setTimeout(() => {
            const botResponse = getBotResponse(userMessage);
            setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
            setIsTyping(false);
        }, 800);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    const quickQuestions = [
        "Delivery time?",
        "Payment methods",
        "Return policy",
        "Contact support"
    ];

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-4 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100 animate-slide-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Bot size={22} />
                            </div>
                            <div>
                                <h3 className="font-bold">SJG Assistant</h3>
                                <p className="text-xs text-white/70">Usually replies instantly</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-end gap-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'user' ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {msg.type === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${msg.type === 'user'
                                            ? 'bg-secondary text-white rounded-br-md'
                                            : 'bg-white text-gray-700 shadow-sm rounded-bl-md'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                                    <Bot size={14} className="text-gray-600" />
                                </div>
                                <div className="bg-white px-4 py-3 rounded-2xl shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    <div className="px-4 py-2 border-t border-gray-100 bg-white">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {quickQuestions.map((q, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setInputValue(q); }}
                                    className="flex-shrink-0 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-100 bg-white">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent outline-none text-sm"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className="p-2 bg-secondary text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-4 right-4 z-50 p-3.5 rounded-full shadow-lg transition-all duration-300 ${isOpen
                        ? 'bg-gray-600 hover:bg-gray-700 rotate-0'
                        : 'bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:scale-110'
                    }`}
            >
                {isOpen ? (
                    <X size={22} className="text-white" />
                ) : (
                    <MessageCircle size={22} className="text-white" />
                )}
            </button>

            <style jsx>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default ChatBot;
