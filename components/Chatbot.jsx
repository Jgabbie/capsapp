import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native'
import React, { useState } from 'react'
import ChatbotStyle from '../styles/componentstyles/ChatbotStyle'


export default function Chatbot() {
    const [chatbotOpen, setChatbotOpen] = useState(false)
    const [message, setMessage] = useState("")

    return (
        <>
            <TouchableOpacity
                style={ChatbotStyle.chatbotButton}
                onPress={() => { setChatbotOpen(true) }}
            >
                <Image
                    style={ChatbotStyle.chatbotIcon}
                    source={require('../assets/images/chatbot_icon.png')}
                />
            </TouchableOpacity>

            {chatbotOpen && (
                <View style={ChatbotStyle.chatbotOverlay}>
                    <View style={ChatbotStyle.chatbotBox}>
                        <View style={ChatbotStyle.chatbotHeader}>
                            <Text style={ChatbotStyle.chatbotTitle}>Chat With Us</Text>
                            <TouchableOpacity
                                onPress={() => { setChatbotOpen(false) }}
                            >
                                <Text style={{ color: "#00000" }}>X</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={ChatbotStyle.inputContainer}>
                            <TextInput
                                style={ChatbotStyle.chatInput}
                                placeholder='Type a message...'
                                value={message}
                                onChangeText={setMessage}
                            />

                            <TouchableOpacity
                                style={ChatbotStyle.sendButton}
                                onPress={() => {
                                    setMessage("")
                                }}
                            >
                                <Text style={ChatbotStyle.sendButtonText}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </>
    )
}