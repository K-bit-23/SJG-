import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react-native';

const { height } = Dimensions.get('window');

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! 👋 Welcome to SJG Stationery. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simple bot responses
  const getBotResponse = (userMessage: string) => {
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

  const quickQuestions = [
    "Delivery time?",
    "Payment methods",
    "Return policy",
    "Contact support"
  ];

  return (
    <>
      {/* Chat Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.chatContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.botIcon}>
                  <Bot size={22} color="#fff" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>SJG Assistant</Text>
                  <Text style={styles.headerSubtitle}>Usually replies instantly</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeButton}>
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg, idx) => (
                <View key={idx} style={[styles.messageRow, msg.type === 'user' && styles.userMessageRow]}>
                  <View style={[styles.messageWrapper, msg.type === 'user' && styles.userMessageWrapper]}>
                    <View style={[styles.avatar, msg.type === 'user' && styles.userAvatar]}>
                      {msg.type === 'user' ? <User size={14} color="#fff" /> : <Bot size={14} color="#666" />}
                    </View>
                    <View style={[styles.messageBubble, msg.type === 'user' && styles.userMessageBubble]}>
                      <Text style={[styles.messageText, msg.type === 'user' && styles.userMessageText]}>
                        {msg.text}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
              {isTyping && (
                <View style={styles.messageRow}>
                  <View style={styles.messageWrapper}>
                    <View style={styles.avatar}>
                      <Bot size={14} color="#666" />
                    </View>
                    <View style={styles.messageBubble}>
                      <View style={styles.typingIndicator}>
                        <View style={styles.typingDot} />
                        <View style={[styles.typingDot, { animationDelay: '0.1s' }]} />
                        <View style={[styles.typingDot, { animationDelay: '0.2s' }]} />
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Quick Questions */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.quickQuestionsContainer}
            >
              {quickQuestions.map((q, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quickQuestion}
                  onPress={() => setInputValue(q)}
                >
                  <Text style={styles.quickQuestionText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder="Type a message..."
                  placeholderTextColor="#999"
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                />
                <TouchableOpacity
                  style={[styles.sendButton, !inputValue.trim() && styles.disabledSendButton]}
                  onPress={handleSend}
                  disabled={!inputValue.trim()}
                >
                  <Send size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Toggle Button */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setIsOpen(true)}
      >
        <MessageCircle size={22} color="#fff" />
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  chatContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.7,
    maxHeight: 500,
  },
  header: {
    backgroundColor: '#d4af37',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  botIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  closeButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  messageRow: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessageRow: {
    alignItems: 'flex-end',
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '85%',
  },
  userMessageWrapper: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    backgroundColor: '#d4af37',
  },
  messageBubble: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userMessageBubble: {
    backgroundColor: '#d4af37',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ca3af',
    opacity: 0.7,
  },
  quickQuestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  quickQuestion: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  quickQuestionText: {
    fontSize: 12,
    color: '#6b7280',
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    color: '#374151',
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d4af37',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledSendButton: {
    opacity: 0.5,
  },
  toggleButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#d4af37',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default ChatBot;