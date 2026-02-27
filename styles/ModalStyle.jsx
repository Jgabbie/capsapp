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
        alignItems: "center"
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
        marginBottom: 20
    },
    modalButtonContainer: {
        flexDirection: "row",
        marginTop: 10,
        gap: 20
    },
    modalButton: {
        backgroundColor: "#305797",
        width: 100,
        height: 40,
        paddingVertical: 10,
        paddingVertical: 20,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center"
    },
    modalEditButton: {
        backgroundColor: "#305797",
        width: 120,
        height: 40,
        paddingVertical: 10,
        paddingVertical: 20,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center"
    },
    modalCancelButton: {
        backgroundColor: "#9E2847",
        width: 100,
        height: 40,
        paddingVertical: 10,
        paddingVertical: 20,
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
        ffontSize: 20,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#6d6d6d",
        padding: 10,
        marginBottom: 20,
        width: 150,
        textAlign: "center"
    },
    userLabel: {
        fontSize: 12,
        color: "#305797",
        textAlign: "left"
    },
    userInputs: {
        fontSize: 16,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#6d6d6d",
        padding: 10,
        marginBottom: 10,
        width: 240,
        height: 30
    },
    fullNameContainer: {
        display: "flex",
        flexDirection: "row",
        gap: 10
    },
    nameInputs: {
        fontSize: 16,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#6d6d6d",
        padding: 10,
        marginBottom: 10,
        width: 115,
        height: 30
    },

})

export default ModalStyle