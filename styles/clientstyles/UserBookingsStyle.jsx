import { StyleSheet } from "react-native";

const UserBookingsStyle = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#fff"
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#305797",
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 16
    },
    searchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f6f8fc",
        borderRadius: 22,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "#dbe3ef"
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 13,
        color: "#333",
    },
    dropdownGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    dropdownButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eef3fb",
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#d6e0f0"
    },
    dropdownIcon: {
        marginLeft: 6
    },
    bookingCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10
    },

    bookingRef: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 16,
        color: "#305797"
    },

    bookingStatus: {
        fontFamily: "Montserrat_500Medium",
        fontSize: 13,
        color: "#2ecc71"
    },

    cardBody: {
        marginBottom: 15
    },

    packageName: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 18,
        marginBottom: 10
    },

    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6
    },

    detailLabel: {
        fontFamily: "Montserrat_400Regular",
        color: "#555"
    },

    detailValue: {
        fontFamily: "Montserrat_500Medium",
        color: "#000"
    },

    price: {
        fontFamily: "Montserrat_700Bold",
        color: "#305797"
    },

    cardActions: {
        flexDirection: "row",
        justifyContent: "space-between"
    },

    viewButton: {
        flex: 1,
        backgroundColor: "#305797",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        marginRight: 8
    },

    cancelButton: {
        flex: 1,
        backgroundColor: "#e74c3c",
        padding: 10,
        borderRadius: 8,
        alignItems: "center"
    },

    buttonText: {
        color: "#fff",
        fontFamily: "Roboto_500Medium"
    }

})

export default UserBookingsStyle