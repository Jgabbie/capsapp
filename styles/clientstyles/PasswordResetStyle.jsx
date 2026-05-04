import { StyleSheet } from "react-native";

const PasswordResetStyle = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 92 
    },
    heading: {
        fontSize: 28,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginTop: 0,
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
    // 🔥 ADD THIS: Fixed height container to stop jumping
    errorContainer: {
        height: 25,
    },
    fieldError: {
        color: "#ff1616",
        fontSize: 14,
        marginLeft: 25,
        marginBottom: 0,
        marginTop: 3,
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
        fontSize: 18,
        fontFamily: "Roboto_500Medium"
    },
    linksContainer: {
        alignItems: "flex-start", // 🔥 Changed from "center" to "flex-start"
        marginLeft: 20,           // 🔥 Added left margin to match the input and button
        marginTop: 15,
        marginBottom: 20
    },
    linkText: {
        fontSize: 16,
        color: "#305797",
        fontFamily: "Roboto_400Regular"
    },
    // --- OTP Specific Styles ---
    otpInput: {
        fontSize: 24,
        letterSpacing: 8, 
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
    },
    // 🔥 NEW LOGO AND TRAVEX TEXT STYLES 🔥
    topLogo: {
        width: 120, 
        height: 60,
        marginBottom: 0,
        alignSelf: 'center',
    },
    byTravexText: {
        color: '#305797',
        fontFamily: 'Montserrat_500Medium',
        fontSize: 12,
        marginTop: 280,
        marginBottom: 20,
        textAlign: 'center',
        letterSpacing: 2,
    },
});

export default PasswordResetStyle;