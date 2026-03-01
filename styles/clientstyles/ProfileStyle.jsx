import { StyleSheet, Dimensions } from "react-native";

const ProfileStyle = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },

    profileHeading: {
        fontSize: 26,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginBottom: 25,
        textAlign: "center",
    },

    profileSecondHeading: {
        fontSize: 24,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginVertical: 20,
        textAlign: "center",
    },

    profileLabel: {
        fontSize: 14,
        color: "#305797",
        marginBottom: 6,
        marginTop: 10,
    },

    profileInputs: {
        fontSize: 16,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#d0d0d0",
        paddingHorizontal: 12,
        height: 45,
        width: "100%",
        backgroundColor: "#fff",
    },

    fullNameContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },

    nameInputs: {
        fontSize: 16,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#d0d0d0",
        paddingHorizontal: 12,
        width: 180,
        height: 45,
        backgroundColor: "#fff",
        flex: 1,
    },

    profileLinksContainer: {
        marginTop: 20,
    },

    profileLinks: {
        fontSize: 14,
        color: "#305797",
    },

    profileButton: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#305797",
        height: 48,
        marginTop: 25,
        borderRadius: 10,
        width: "100%",
    },

    profileButtonText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "Roboto_500Medium",
    },

    profileImageContainer: {
        alignItems: "center",
        marginTop: 40,
        marginBottom: 20,
    },

    profileImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
    },
});

export default ProfileStyle;