import { StyleSheet } from "react-native";

const ResetPassConfirmStyle = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 105 
    },
    heading: {
        fontSize: 28,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginTop: 0,
        marginBottom: 20,
        marginHorizontal: 20,
        textAlign: "center"
    },
    label: {
        fontSize: 14,
        fontFamily: "Roboto_500Medium",
        color: "#305797",
        marginLeft: 20,
        marginBottom: 4
    },
    // 🔥 NEW: Wrapper for the input to hold the absolute positioned eye icon
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20,
        marginBottom: 8,
        width: 350,
        height: 45,
    },
    // Updated input style: removed margin/width since the container handles it now
    input: {
        flex: 1, // Take up full space of the container
        fontSize: 16,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: "#6d6d6d",
        paddingHorizontal: 15,
        paddingRight: 45, // Make room for the eye icon
        height: '100%',
        backgroundColor: "rgba(255,255,255,0.8)",
        color: "#000"
    },
    inputErrorBorder: {
        borderColor: "#ff1616",
        borderWidth: 1.5,
    },
    // 🔥 NEW: Positioning for the eye icon
    eyeIcon: {
        position: 'absolute',
        right: 15,
        height: '100%',
        justifyContent: 'center',
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
        marginTop: 10,
        elevation: 2
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontFamily: "Roboto_500Medium"
    },
    // 🔥 NEW STYLES ADDED 🔥
    errorContainer: {
        height: 25, // Keeps the layout fixed so the button never jumps
    },
    linkContainer: {
        alignItems: 'flex-start', // 🔥 Changed from 'center' to 'flex-start'
        marginLeft: 20,           // 🔥 Added margin to align with your inputs
        marginBottom: 15,
        marginTop: 5,
    },
    linkText: {
        fontSize: 16,             // 🔥 Increased size from 14 to 16 to match
        color: '#305797',
        fontFamily: 'Roboto_400Regular',
        // 🔥 Removed the underline to mirror the other screen exactly
    },
    // 🔥 LOGO AT BOTTOM 🔥
    bottomLogo: {
        width: 140, 
        height: 80,
        marginTop: 165,
        marginBottom: 20,
        alignSelf: 'center',
    },
});

export default ResetPassConfirmStyle;