import { StyleSheet } from "react-native";

const ChatbotStyle = StyleSheet.create({
    chatbotButton: {
        position: "absolute",
        bottom: 120, // 🔥 Moved up to sit next to "Local Packages"
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#305797",
        justifyContent: "center",
        alignItems: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        zIndex: 999 // Ensures nothing blocks it
    },
    chatbotIcon: {
        width: 32,
        height: 32,
        tintColor: "#fff"
    },
    chatbotOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    chatbotBox: {
        height: "70%",
        backgroundColor: '#f5f7fa',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 15,
        overflow: 'hidden'
    },
    chatbotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#f5f7fa'
    },
    chatbotTitle: {
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
        color: "#305797"
    },
    chatWindow: {
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    messageWrapper: {
        marginBottom: 15,
        width: '100%',
        // 🔥 REMOVED flexDirection: 'row' so it defaults to a vertical column
    },
    messageWrapperUser: {
        alignItems: 'flex-end', // 🔥 CHANGED from justifyContent to alignItems
    },
    messageWrapperBot: {
        alignItems: 'flex-start', // 🔥 CHANGED from justifyContent to alignItems
    },
    messageBubble: {
        maxWidth: '80%',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 15,
    },
    messageBubbleUser: {
        backgroundColor: '#305797',
        borderBottomRightRadius: 2,
    },
    messageBubbleBot: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 2,
        borderWidth: 1,
        borderColor: '#e5e7eb'
    },
    messageText: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 14,
        lineHeight: 20,
    },
    messageTextUser: {
        color: '#fff',
    },
    messageTextBot: {
        color: '#333',
    },
    loadingWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        marginLeft: 10,
        gap: 8
    },
    loadingText: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 12,
        color: '#8c8c8c'
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: "#fff",
        gap: 10
    },
    newChatBtn: {
        width: 35,
        height: 35,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5
    },
    chatInput: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 14,
        minHeight: 40,
        maxHeight: 100,
        fontFamily: 'Roboto_400Regular'
    },
    sendButton: {
        backgroundColor: "#305797",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2
    },
    // Add these to ChatbotStyle.jsx
    messageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 6,
    },
    messageHeaderText: {
        fontSize: 11,
        color: '#6b7280',
        fontFamily: 'Roboto_400Regular',
    },
    messageHeaderDot: {
        fontSize: 10,
        color: '#6b7280',
    }
});

export default ChatbotStyle;