import { StyleSheet } from "react-native";

const ModalStyle = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center"
    },
    modalBox: {
        width: 300,
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalBoxEdit: {
        width: 350,
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        alignItems: "center"
    },
    modalTitle: {
        fontSize: 22,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginBottom: 10
    },
    modalText: {
        fontSize: 16,
        fontFamily: "Roboto_400Regular",
        textAlign: "center",
        color: "#333",
        marginBottom: 20
    },
    modalButtonContainer: {
        flexDirection: "row",
        marginTop: 10,
        gap: 20
    },
    modalButton: {
        backgroundColor: "#305797",
        width: 110,
        height: 45,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center"
    },
    modalEditButton: {
        backgroundColor: "#305797",
        width: 120,
        height: 45,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center"
    },
    modalCancelButton: {
        backgroundColor: "#9E2847",
        width: 110,
        height: 45,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center"
    },
    modalButtonText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "Roboto_500Medium"
    },
    otpInput: {
        fontSize: 20,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#6d6d6d",
        padding: 10,
        marginBottom: 20,
        width: 150,
        textAlign: "center",
        color: "#000"
    },
    userLabel: {
        fontSize: 12,
        color: "#305797",
        textAlign: "left",
        alignSelf: 'flex-start',
        marginBottom: 4,
        marginLeft: 5
    },
    userInputs: {
        fontSize: 16,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#ccc",
        paddingHorizontal: 10,
        marginBottom: 10,
        width: 280,
        height: 45,
        color: "#000"
    },
    fullNameContainer: {
        flexDirection: "row",
        gap: 10,
        width: '100%',
        justifyContent: 'center'
    },
    nameInputs: {
        fontSize: 16,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#ccc",
        paddingHorizontal: 10,
        marginBottom: 10,
        width: 135,
        height: 45,
        color: "#000"
    },
});

export default ModalStyle;