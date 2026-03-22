import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#fff"
    },
    // Branding Section
    brandingContainer: {
        marginBottom: 20,
    },
    mainTitle: {
        fontSize: 22,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
    },
    byTravex: {
        fontSize: 12,
        fontFamily: "Montserrat_500Medium",
        color: "#305797",
        marginTop: -4,
    },
    pageTitle: {
        fontSize: 18,
        fontFamily: "Montserrat_700Bold",
        marginBottom: 15,
        color: "#333"
    },
    searchRow: {
        marginBottom: 16
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f6f8fc",
        borderRadius: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "#dbe3ef",
        height: 45,
        marginBottom: 10
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 13,
        color: "#333",
    },
    dropdownGroup: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10
    },
    dropdownButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#eef3fb",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#d6e0f0"
    },
    dropdownText: {
        fontSize: 12,
        color: "#305797",
        fontFamily: "Roboto_500Medium"
    },
    // Cards
    transactionCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12
    },
    transactionRef: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 14,
        color: "#305797"
    },
    transactionStatus: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 12
    },
    packageName: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 16,
        marginBottom: 8,
        color: "#333"
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4
    },
    detailLabel: {
        fontFamily: "Roboto_400Regular",
        color: "#777",
        fontSize: 13
    },
    detailValue: {
        fontFamily: "Roboto_500Medium",
        color: "#333",
        fontSize: 13
    },
    amount: {
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        fontSize: 15
    },
    viewButton: {
        backgroundColor: "#305797",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10
    },
    buttonText: {
        color: "#fff",
        fontFamily: "Montserrat_700Bold",
        fontSize: 13
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '80%',
        borderRadius: 15,
        padding: 10
    },
    modalOption: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center'
    },
    modalOptionText: {
        fontFamily: "Roboto_500Medium",
        color: "#305797"
    }
});