import { StyleSheet } from "react-native";

const UserTransactionStyle = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff"
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#305797"
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
    transactionCard: {
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

    transactionRef: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 16,
        color: "#305797"
    },

    transactionStatus: {
        fontFamily: "Montserrat_500Medium",
        fontSize: 13
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

    amount: {
        fontFamily: "Montserrat_700Bold",
        color: "#305797"
    },

    viewButton: {
        backgroundColor: "#305797",
        padding: 12,
        borderRadius: 8,
        alignItems: "center"
    },

    buttonText: {
        color: "#fff",
        fontFamily: "Roboto_500Medium"
    }

})

export default UserTransactionStyle