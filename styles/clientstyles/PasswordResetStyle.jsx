import { StyleSheet } from "react-native";

const PasswordResetStyle = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 200 
    },
    heading: {
        fontSize: 28,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginTop: 50,
        marginBottom: 5,
        marginHorizontal: 20,
        textAlign: "center"
    },
    subHeading: {
        fontSize: 14,
        fontFamily: "Roboto_400Regular",
        color: "#333",
        marginBottom: 25,
        marginHorizontal: 40,
        textAlign: "center"
    },
    label: {
        fontSize: 14,
        fontFamily: "Roboto_500Medium",
        color: "#305797",
        marginLeft: 20,
        marginBottom: 4
    },
    input: {
        fontSize: 16,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: "#6d6d6d",
        paddingHorizontal: 15,
        marginLeft: 20,
        marginBottom: 8,
        width: 350,
        height: 45,
        backgroundColor: "rgba(255,255,255,0.8)",
        color: "#000"
    },
    inputErrorBorder: {
        borderColor: "#ff1616",
        borderWidth: 1.5,
    },
    fieldError: {
        color: "#ff1616",
        fontSize: 12,
        marginLeft: 25,
        marginBottom: 15,
        marginTop: -5,
    },
    button: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#305797",
        width: 350,
        height: 45,
        marginLeft: 20,
        borderRadius: 8,
        elevation: 2
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "Roboto_500Medium"
    },
    linksContainer: {
        alignItems: "center",
        marginTop: 15,
        marginBottom: 20
    },
    linkText: {
        fontSize: 14,
        color: "#305797",
        fontFamily: "Roboto_400Regular"
    },
    // --- OTP Specific Styles ---
    otpInput: {
        fontSize: 24,
        letterSpacing: 8, // Spreads the numbers out to look like separate boxes
        textAlign: "center",
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#305797",
        width: 200,
        height: 50,
        marginBottom: 10,
        backgroundColor: "#f9f9f9",
        color: "#000"
    },
    timerText: {
        fontSize: 14,
        fontFamily: "Roboto_400Regular",
        color: "#333",
        marginTop: 15
    },
    timerHighlight: {
        color: "#992A46",
        fontFamily: "Roboto_700Bold"
    }
});

export default PasswordResetStyle;