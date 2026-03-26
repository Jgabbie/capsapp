import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: "#f5f7fa", // Matched Bookings background
        flexGrow: 1, 
        paddingBottom: 40,
    },
    // --- REDESIGNED HEADER TO MATCH BOOKINGS ---
    title: {
        fontSize: 20, 
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginBottom: 5,
        paddingLeft: 5,
    },
    subtitle: {
        fontSize: 13,
        fontFamily: "Roboto_400Regular",
        color: "#777",
        marginBottom: 20,
        paddingLeft: 5,
    },

    // --- SEARCH & FILTERS ---
    searchRow: {
        flexDirection: "column", 
        gap: 12,
        marginBottom: 20,
        width: '100%',
    },
    searchBar: {
        width: '100%',
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f6f8fc", 
        borderRadius: 20, 
        paddingHorizontal: 12,
        height: 40, 
        borderWidth: 1,
        borderColor: "#dbe3ef",
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        fontFamily: "Roboto_400Regular",
        color: "#333",
        paddingVertical: 0,
    },
    dropdownGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8, 
    },
    dropdownButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eef3fb", 
        borderRadius: 15, 
        paddingHorizontal: 10,
        height: 40, 
        borderWidth: 1,
        borderColor: "#d6e0f0", 
        justifyContent: 'space-between',
        minWidth: 90,
    },
    dropdownText: {
        fontSize: 11, 
        color: "#305797",
        fontFamily: "Roboto_400Regular", 
        marginRight: 8,
    },

    // --- CARDS ---
    transactionCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: "#eee",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        paddingBottom: 10,
        marginBottom: 12,
    },
    transactionRef: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 12,
        color: "#777",
        textTransform: 'uppercase',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    transactionStatus: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 11,
    },
    packageName: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 16,
        color: "#305797",
        marginBottom: 8,
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

    // --- MODAL STYLES ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '80%',
        borderRadius: 15,
        paddingVertical: 10,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalOption: {
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        alignItems: 'center',
        width: '100%'
    },
    modalOptionText: {
        fontSize: 16,
        color: '#305797',
        fontFamily: 'Roboto_500Medium'
    },

    // --- EMPTY STATE STYLES ---
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyImage: {
        width: 150, 
        height: 150,
        resizeMode: 'contain',
        opacity: 0.8,
    },
    emptyText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 16,
        color: '#999',
        marginTop: 15,
    }
});