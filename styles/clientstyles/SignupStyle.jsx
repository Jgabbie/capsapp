import { StyleSheet } from "react-native";

const SignupStyle = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 200 
    },
    signupHeading: {
        display: "none" 
    },
    signupSecondHeading: {
        fontSize: 26, 
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginTop: 0,
        marginBottom: 0, 
        marginHorizontal: 20,
        textAlign: "center"
    },
    signupLabel: {
        fontSize: 14, 
        fontFamily: "Roboto_500Medium",
        color: "#305797",
        marginLeft: 20,
        marginBottom: 2 
    },
    signupInputs: {
        fontSize: 14, 
        borderWidth: 1,
        borderRadius: 8, 
        borderColor: "#6d6d6d",
        paddingHorizontal: 15,
        marginLeft: 20,
        marginBottom: 8, 
        width: 350,
        height: 40, 
        backgroundColor: "rgba(255,255,255,0.8)",
        color: "#000"
    },
    fullNameContainer: {
        flexDirection: "row",
        width: 350,
        marginLeft: 20,
        justifyContent: "space-between" 
    },
    nameInputs: {
        fontSize: 14,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: "#6d6d6d",
        paddingHorizontal: 15,
        marginBottom: 8,
        width: 170, 
        height: 40, 
        backgroundColor: "rgba(255,255,255,0.8)",
        color: "#000"
    },
    // --- Phone Number Styles ---
    phoneContainer: {
        flexDirection: "row",
        borderWidth: 1,
        borderRadius: 8,
        borderColor: "#6d6d6d",
        marginLeft: 20,
        marginBottom: 8,
        width: 350,
        height: 40, 
        backgroundColor: "rgba(255,255,255,0.8)",
        overflow: "hidden"
    },
    phonePrefixBox: {
        backgroundColor: "#e0e0e0",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 12,
        borderRightWidth: 1,
        borderColor: "#6d6d6d"
    },
    phonePrefixText: {
        fontSize: 14,
        color: "#333",
        fontFamily: "Roboto_500Medium"
    },
    phoneInput: {
        flex: 1,
        fontSize: 14,
        paddingHorizontal: 10,
        color: "#000"
    },
    // --- Password Styles with Eye Icon ---
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        borderColor: "#6d6d6d",
        marginLeft: 20,
        marginBottom: 8,
        width: 350,
        height: 40,
        backgroundColor: "rgba(255,255,255,0.8)",
    },
    passwordInput: {
        flex: 1,
        fontSize: 14,
        paddingHorizontal: 15,
        color: "#000",
        height: '100%',
    },
    eyeIcon: {
        paddingRight: 15,
        justifyContent: 'center',
        height: '100%'
    },
    // --- Error Styles ---
    inputErrorBorder: {
        borderColor: "#ff1616",
        borderWidth: 1.5,
    },
    fieldError: {
        color: "#ff1616",
        fontSize: 11, 
        marginLeft: 25,
        marginBottom: 8,
        marginTop: -5, 
    },
    generalError: {
        color: "#ff1616",
        fontSize: 13,
        fontFamily: "Roboto_500Medium",
        marginLeft: 20,
        marginBottom: 10,
        marginTop: 5,
    },
    signupLinks: {
        fontSize: 16,
        color: "#305797",
        fontFamily: "Roboto_400Regular"
    },
    signupLinksContainer: {
        marginLeft: 20,
        marginTop: 5,
        marginBottom: 15
    },
    signupButton: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#305797",
        width: 350,
        height: 40, 
        marginLeft: 20,
        borderRadius: 8,
        elevation: 2
    },
    signupButtonText: {
        color: "#fff",
        fontSize: 18,
        fontFamily: "Roboto_500Medium"
    },
    // 🔥 NEW LOGO STYLE AT BOTTOM 🔥
    bottomLogo: {
        width: 140, 
        height: 80,
        marginTop: 10,
        marginBottom: 20,
        alignSelf: 'center',
    },
})

export default SignupStyle