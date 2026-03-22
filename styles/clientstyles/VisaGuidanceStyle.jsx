import { StyleSheet, Platform } from "react-native";

const VisaGuidanceStyle = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: "#fff"
    },
    title: {
        fontSize: 24,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginTop: 10,
        marginBottom: 20
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: '#eee',
        // Shadowing for premium look
        ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
            android: { elevation: 5 }
        })
    },
    cardImage: {
        width: "100%",
        height: 200, // Fixed height ensures the image is visible
        backgroundColor: '#f0f4f8'
    },
    cardContent: {
        padding: 18
    },
    visaTitle: {
        fontSize: 18,
        fontFamily: "Montserrat_700Bold",
        color: "#333",
        marginBottom: 8
    },
    description: {
        fontSize: 14,
        color: "#666666", // FIXED: Added 6th digit to hex code
        fontFamily: "Roboto_400Regular",
        marginBottom: 16,
        lineHeight: 20
    },
    applyButton: {
        backgroundColor: "#305797",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center"
    },
    applyText: {
        color: "#fff",
        fontFamily: "Montserrat_700Bold",
        fontSize: 14
    }
})

export default VisaGuidanceStyle;