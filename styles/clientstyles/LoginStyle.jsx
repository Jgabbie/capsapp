import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get('window');

const LoginStyle = StyleSheet.create({
    container: {
        flex: 1,
        // Adjusted paddingTop since logo moved to bottom
        paddingTop: 200,
        // Centers all children horizontally
        alignItems: 'center', 
    },
    loginHeading: {
        fontSize: 60,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        margin: 5,
        marginTop: 0,
        height: 65,
        textAlign: "center"
    },
    loginSecondHeading: {
        fontSize: 30,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginTop: 0,
        margin: 20,
        textAlign: "center"
    },
    inputWrapper: {
        width: width * 0.85, 
        maxWidth: 400, 
        marginBottom: 10,
    },
    loginLabel: {
        fontSize: 16,
        color: "#305797",
        marginBottom: 4,
        alignSelf: 'flex-start', 
    },
    loginInputs: {
        fontSize: 18,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#6d6d6d",
        paddingHorizontal: 15,
        width: '100%',
        height: 45,
        backgroundColor: "rgba(255,255,255,0.8)",
        color: "#000"
    },
    // 🔥 ADD THIS: The red border style for errors
    inputErrorBorder: {
        borderColor: "#ef4444", // Using the same red as your error text!
        borderWidth: 1.5,
    },
    // --- Password Styles with Eye Icon ---
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#6d6d6d",
        width: '100%',
        height: 45,
        backgroundColor: "rgba(255,255,255,0.8)",
    },
    passwordInput: {
        flex: 1,
        fontSize: 18,
        paddingHorizontal: 15,
        color: "#000",
        height: '100%',
    },
    eyeIcon: {
        paddingRight: 15,
        justifyContent: 'center',
        height: '100%'
    },
    // --- Error Message ---
    errorMessage: {
        color: "#ff1616",
        alignSelf: 'flex-start',
        marginBottom: 10
    },
    // --- Links Container (Signup & Forgot Pass) ---
    loginLinksContainer: {
        flexDirection: 'row', 
        alignItems: 'center',
        width: width * 0.85,
        maxWidth: 400,
        marginBottom: 20,
    },
    loginLinks: {
        fontSize: 16,
        color: "#305797",
        textDecorationLine: 'underline', 
    },
    loginLinksDivider: {
        color: "#305797",
        marginHorizontal: 10, 
    },
    // --- Login Button ---
    loginButton: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#305797",
        width: width * 0.85,
        maxWidth: 400,
        height: 45,
        borderRadius: 10
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 18,
        fontFamily: "Roboto_500Medium"
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
    // 🔥 NEW STYLES ADDED 🔥
    errorContainer: {
        height: 20, 
        width: width * 0.85,
        maxWidth: 400,
        marginBottom: 10,
        justifyContent: 'center',
    },
    errorText: {
        color: '#ef4444', 
        fontSize: 14,
        textAlign: 'left',
        fontFamily: 'Roboto_500Medium',
    },
    // 🔥 RENAMED AND ADJUSTED FOR THE BOTTOM
    bottomLogo: {
        width: 140, 
        height: 80,
        marginTop: 135,
        marginBottom: 20,
        alignSelf: 'center',
    },
});

export default LoginStyle;