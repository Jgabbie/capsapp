import { StyleSheet } from "react-native";

const LoginStyle = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 200
    },
    loginHeading: {
        fontSize: 60,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        margin: 5,
        marginTop: 30,
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
    loginLabel: {
        fontSize: 16,
        color: "#305797",
        marginLeft: 20,
        marginBottom: 2
    },
    loginInputs: {
        fontSize: 18,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#6d6d6d",
        paddingHorizontal: 15,
        marginLeft: 20,
        marginBottom: 10,
        width: 360,
        height: 45,
        backgroundColor: "rgba(255,255,255,0.8)",
        color: "#000"
    },
    // --- Password Styles with Eye Icon ---
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#6d6d6d",
        marginLeft: 20,
        marginBottom: 10,
        width: 360,
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
    loginLinks: {
        fontSize: 16,
        color: "#305797"
    },
    loginLinksContainer: {
        marginLeft: 20,
        marginBottom: 20
    },
    loginButton: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#305797",
        width: 360,
        height: 45,
        marginLeft: 20,
        borderRadius: 10
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 18,
        fontFamily: "Roboto_500Medium"
    },
    errorMessage: {
        color: "#ff1616",
        marginLeft: 20,
        marginBottom: 10
    }
})

export default LoginStyle