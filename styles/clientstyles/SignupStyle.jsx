import { StyleSheet } from "react-native";

const SignupStyle = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 180
    },
    signupHeading: {
        fontSize: 45,
        fontWeight: 600,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginBottom: 0,
        margin: 20,
        height: 55,
        textAlign: "center"
    },
    signupSecondHeading: {
        fontSize: 30,
        fontWeight: 600,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginTop: 0,
        marginBottom: 0,
        margin: 20,
        textAlign: "center"
    },
    signupLabel: {
        fontSize: 16,
        color: "#305797",
        marginLeft: 20
    },
    signupInputs: {
        fontSize: 20,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#6d6d6d",
        padding: 10,
        marginLeft: 20,
        marginBottom: 10,
        width: 360,
        height: 45
    },
    fullNameContainer: {
        display: "flex",
        flexDirection: "row"
    },
    nameInputs: {
        fontSize: 20,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#6d6d6d",
        padding: 10,
        marginLeft: 20,
        marginBottom: 10,
        width: 170,
        height: 45
    },
    signupLinks: {
        fontSize: 16,
        color: "#305797"
    },
    signupLinksContainer: {
        marginLeft: 20,
        marginBottom: 10
    },
    signupButton: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#305797",
        width: 360,
        height: 45,
        marginLeft: 20,
        borderRadius: 10
    },
    signupButtonText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "Roboto_500Medium"
    },
    errorMessage: {
        color: "#ff1616",
        marginLeft: 20
    }
})

export default SignupStyle