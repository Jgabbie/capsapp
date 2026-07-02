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
        fontSize: 10,
        marginLeft: 25,
        marginBottom: 8,
        marginTop: -5,
    },
    generalError: {
        color: "#ff1616",
        fontSize: 10,
        fontFamily: "Roboto_500Medium",
        marginLeft: 20,
        marginBottom: 10,
        marginTop: 5,
    },
    signupLinks: {
        fontFamily: "Roboto_500Medium",
        fontSize: 13,
        color: "#305797",
        marginRight: 4,
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
    // NEW LOGO STYLE AT BOTTOM 
    bottomLogo: {
        width: 140,
        height: 80,
        marginTop: 10,
        marginBottom: 20,
        alignSelf: 'center',
    },

    termsContainer: {
        width: "100%",
        marginTop: 12,
    },

    termsRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        paddingHorizontal: 20,
    },

    termsCheckboxTouch: {
        paddingVertical: 4,
        paddingRight: 6,
    },

    termsCheckbox: {
        width: 18,
        height: 18,
        borderWidth: 1.5,
        borderColor: "#305797",
        borderRadius: 3,
        justifyContent: "center",
        alignItems: "center",
    },

    termsCheckboxChecked: {
        backgroundColor: "#305797",
        borderColor: "#305797",
    },

    termsCheckboxError: {
        borderColor: "#ff0000",
    },

    termsText: {
        fontFamily: "Roboto_500Medium",
        fontSize: 13,
        color: "#305797",
        marginRight: 4,
    },

    termsLink: {
        fontFamily: "Roboto_700Bold",
        fontSize: 13,
        color: "#305797",
        textDecorationLine: "underline",
    },

    termsErrorContainer: {
        height: 16,
        paddingHorizontal: 20,
        justifyContent: "center",
    },

    termsError: {
        fontFamily: "Roboto_400Regular",
        fontSize: 10,
        color: "#ff0000",
    },

    termsModalBox: {
        width: "90%",
        maxHeight: "82%",
        backgroundColor: "#ffffff",
        borderRadius: 12,
        paddingTop: 20,
        paddingHorizontal: 18,
        paddingBottom: 14,
    },

    termsModalTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 20,
        color: "#305797",
        textAlign: "center",
        marginBottom: 12,
    },

    termsModalScroll: {
        flexGrow: 0,
    },

    termsModalContent: {
        paddingBottom: 10,
    },

    termsSectionTitle: {
        fontFamily: "Roboto_700Bold",
        fontSize: 14,
        color: "#305797",
        marginTop: 14,
        marginBottom: 5,
    },

    termsParagraph: {
        fontFamily: "Roboto_400Regular",
        fontSize: 12,
        lineHeight: 18,
        color: "#4b5563",
    },

    termsModalFooter: {
        flexDirection: "column",
        gap: 6,
        paddingTop: 12,
    },

    termsCloseButton: {
        width: "100%",
        height: 40,
        borderRadius: 7,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#992A46",
    },

    termsAgreeButton: {
        width: "100%",
        height: 40,
        borderRadius: 7,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#305797",
    },

    termsButtonText: {
        fontFamily: "Roboto_700Bold",
        fontSize: 13,
        color: "#ffffff",
    },
})

export default SignupStyle