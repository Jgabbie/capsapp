import { StyleSheet } from "react-native";

const PassportGuidanceNewStyle = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#f9f9f9"
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#305797",
        marginBottom: 20
    },
    card: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 20,
        elevation: 4
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 8
    },
    description: {
        fontSize: 14,
        color: "#66666",
        marginBottom: 12
    },
    listItem: {
        fontSize: 14,
        marginBottom: 6
    },
    uploadRow: {
        flexDirection: "row",
        gap: 10
    },
    uploadButton: {
        backgroundColor: "#305797",
        borderRadius: 10,
        height: 20,
        width: 60,
        alignItems: "center",
        justifyContent: "center"
    },
    uploadButtonText: {
        color: "#fff",
        fontSize: 9
    },
    stepTitle: {
        fontSize: 15,
        fontWeight: "600",
        marginTop: 10
    },
    stepText: {
        fontSize: 14,
        color: "#555",
        marginBottom: 8
    },
    backButton: {
        backgroundColor: "#305797",
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 10,
        alignItems: "center"
    },
    backText: {
        color: "#fff",
        fontWeight: "600"
    }

})

export default PassportGuidanceNewStyle