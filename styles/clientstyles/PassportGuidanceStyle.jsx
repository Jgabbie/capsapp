import { StyleSheet } from "react-native";

const PassportGuidanceStyle = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#fff"
    },
    title: {
        fontSize: 24,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginBottom: 10
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 20,
        overflow: "hidden",
        elevation: 5
    },
    cardImage: {
        width: "100%",
        height: 220
    },
    cardContent: {
        padding: 15
    },
    passportTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 6
    },
    description: {
        fontSize: 14,
        color: "#66666",
        marginBottom: 12
    },
    applyButton: {
        backgroundColor: "#305797",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center"
    },
    applyText: {
        color: "#fff",
        fontWeight: "600"
    }
})

export default PassportGuidanceStyle