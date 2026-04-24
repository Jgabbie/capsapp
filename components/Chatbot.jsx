import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Modal } from 'react-native'
import React, { useState, useRef } from 'react'
import { Ionicons } from "@expo/vector-icons"
import ChatbotStyle from '../styles/componentstyles/ChatbotStyle'
import { api } from '../utils/api'

const initialMessages = [
    { role: 'assistant', content: 'Hi! How can I help you today?', id: Date.now().toString() }
];

export default function Chatbot() {
    const [chatbotOpen, setChatbotOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState(initialMessages);
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef(null);

    // 🔥 Added Time Formatter matching the Web
    const formatTimestamp = (timestamp) => {
        const date = new Date(parseInt(timestamp));
        return date.toLocaleString('en-US', {
            month: 'numeric', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true
        });
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const userMessage = { role: 'user', content: message.trim(), id: Date.now().toString() };
        const newMessages = [...messages, userMessage];
        
        setMessages(newMessages);
        setMessage("");
        setLoading(true);

        try {
            const recentMessages = newMessages.slice(-3).map(m => ({ role: m.role, content: m.content }));
            const response = await api.post('/chatbot/chat', { messages: recentMessages });
            const botReply = response.data?.reply || "I received an empty response. Please try again.";

            setMessages(prev => [...prev, { role: 'assistant', content: botReply, id: Date.now().toString() }]);
        } catch (error) {
            console.log("Chatbot Error:", error.response?.data || error.message);
            const errorMsg = error.response?.data?.error || "Connection error. Please try again.";
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errorMsg}`, id: Date.now().toString() }]);
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = () => {
        setMessages([{ role: 'assistant', content: 'Hi! How can I help you today?', id: Date.now().toString() }]);
        setMessage('');
        setLoading(false);
    };

    return (
        <>
            <TouchableOpacity
                style={ChatbotStyle.chatbotButton}
                onPress={() => setChatbotOpen(true)}
            >
                <Image
                    style={ChatbotStyle.chatbotIcon}
                    source={require('../assets/images/chatbot_icon.png')}
                />
            </TouchableOpacity>

            <Modal visible={chatbotOpen} transparent animationType="slide">
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                    style={{ flex: 1 }}
                >
                    <View style={ChatbotStyle.chatbotOverlay}>
                        <View style={ChatbotStyle.chatbotBox}>
                            
                            <View style={ChatbotStyle.chatbotHeader}>
                                <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                                    <Image source={require('../assets/images/chatbot_icon.png')} style={{width: 24, height: 24, tintColor: '#305797'}} />
                                    <Text style={ChatbotStyle.chatbotTitle}>TRAVEX Assistant</Text>
                                </View>
                                <TouchableOpacity onPress={() => setChatbotOpen(false)} style={{padding: 5}}>
                                    <Text style={{ fontSize: 18, color: "#666", fontWeight: 'bold' }}>X</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView 
                                ref={scrollViewRef}
                                style={ChatbotStyle.chatWindow}
                                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                                showsVerticalScrollIndicator={false}
                            >
                                {messages.map((msg) => {
                                    const isUser = msg.role === 'user';
                                    return (
                                        <View key={msg.id} style={[ChatbotStyle.messageWrapper, isUser ? ChatbotStyle.messageWrapperUser : ChatbotStyle.messageWrapperBot]}>
                                            
                                            {/* 🔥 ADDED: Sender Info & Timestamp */}
                                            <View style={[ChatbotStyle.messageHeader, isUser ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
                                                <Ionicons name={isUser ? "person-outline" : "hardware-chip-outline"} size={12} color="#6b7280" />
                                                <Text style={ChatbotStyle.messageHeaderText}>{isUser ? 'You' : 'TRAVEX Assistant'}</Text>
                                                <Text style={ChatbotStyle.messageHeaderDot}>•</Text>
                                                <Text style={ChatbotStyle.messageHeaderText}>{formatTimestamp(msg.id)}</Text>
                                            </View>

                                            <View style={[ChatbotStyle.messageBubble, isUser ? ChatbotStyle.messageBubbleUser : ChatbotStyle.messageBubbleBot]}>
                                                <Text style={[ChatbotStyle.messageText, isUser ? ChatbotStyle.messageTextUser : ChatbotStyle.messageTextBot]}>
                                                    {msg.content}
                                                </Text>
                                            </View>
                                        </View>
                                    )
                                })}
                                {loading && (
                                    <View style={ChatbotStyle.loadingWrapper}>
                                        <ActivityIndicator size="small" color="#305797" />
                                        <Text style={ChatbotStyle.loadingText}>TRAVEX is thinking...</Text>
                                    </View>
                                )}
                            </ScrollView>

                            <View style={ChatbotStyle.inputContainer}>
                                <TouchableOpacity style={ChatbotStyle.newChatBtn} onPress={handleNewChat}>
                                    <Ionicons name="refresh" size={18} color="#666" />
                                </TouchableOpacity>
                                
                                <TextInput
                                    style={ChatbotStyle.chatInput}
                                    placeholder='Type your message...'
                                    placeholderTextColor="#999"
                                    value={message}
                                    onChangeText={setMessage}
                                    multiline
                                    maxLength={200}
                                />

                                <TouchableOpacity
                                    style={[ChatbotStyle.sendButton, !message.trim() && { backgroundColor: '#a0b4d4' }]}
                                    onPress={handleSendMessage}
                                    disabled={!message.trim() || loading}
                                >
                                    <Ionicons name="send" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    )
}