import { StyleSheet } from "react-native";

const ChatbotStyle = StyleSheet.create({

    chatbotContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    chatbotButton: {
        position: "absolute",
        bottom: 25,
        right: 20,
        width: 70,
        height: 70,
        borderRadius: 60,
        backgroundColor: "#305797",
        justifyContent: "center",
        alignItems: "center",
        elevation: 6
    },
    chatbotIcon: {
        width: 30,
        height: 30
    },
    chatbotOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end'
    },
    chatbotBox: {
        height: "60%",
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 15
    },
    chatbotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    chatbotTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat_500Medium',
        color: "#305797"
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        paddingVertical: 8,
        paddingHorizontal: 5,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff"
    },
    chatInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 8,
        fontSize: 14
    },
    sendButton: {
        backgroundColor: "#305797",
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20
    },
    sendButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14
    }
})

export default ChatbotStyle