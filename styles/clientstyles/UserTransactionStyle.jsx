import { StyleSheet, Dimensions } from "react-native";

const { height } = Dimensions.get("window");

export default StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: "#f5f7fa", 
        flexGrow: 1, 
        paddingBottom: 40,
    },
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
    cardBody: {
        marginBottom: 10,
    },
    packageName: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 14,
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
        fontSize: 12
    },
    detailValue: {
        fontFamily: "Roboto_500Medium",
        color: "#333",
        fontSize: 12
    },
    amount: {
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        fontSize: 14
    },
    
    // --- CARD BUTTONS ---
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 5,
    },
    viewButton: {
        backgroundColor: "#305797",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: 'center',
        gap: 6,
        flex: 1,
    },
    viewProofButton: {
        backgroundColor: "#305797",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: 'center',
        gap: 6,
        flex: 1,
    },
    buttonText: {
        color: "#fff",
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 12
    },

    // --- UTILITY MODAL STYLES ---
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

    // --- EMPTY STATE ---
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
    },

    // --- PROOF IMAGE MODAL ---
    proofImageContainer: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
    },
    proofHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    proofTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 16,
        color: "#305797",
    },
    proofImage: {
        width: '100%',
        height: 400,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },

    // --- RECEIPT MODAL (Matches Web Layout) ---
    receiptPaper: {
        backgroundColor: '#fff',
        width: '95%',
        height: height * 0.8,
        borderRadius: 8,
        padding: 20,
        elevation: 10,
    },
    receiptCloseBtn: {
        position: 'absolute',
        top: -10,
        right: -10,
        zIndex: 10,
        backgroundColor: '#fff',
        borderRadius: 15,
    },
    receiptHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 15,
        marginBottom: 15,
    },
    receiptCompanyBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    receiptLogo: {
        width: 50,
        height: 40,
        marginRight: 10,
    },
    receiptCompanyDetails: {
        justifyContent: 'center',
    },
    receiptCompanyName: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 10,
        color: '#305797',
        marginBottom: 2
    },
    receiptMutedText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 7.5,
        color: '#555',
        marginTop: 1,
    },
    receiptTitleText: {
        fontFamily: "Montserrat_400Regular",
        fontSize: 18,
        color: '#333',
    },
    receiptMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    receiptBilledTo: {
        flex: 1,
    },
    receiptMetaRight: {
        alignItems: 'flex-end',
    },
    receiptTinyLabel: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 7,
        color: '#305797', // Using blue to match web label-blue
        marginBottom: 4,
        textTransform: 'uppercase'
    },
    receiptCustomerName: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 11,
        color: '#333',
    },
    receiptMetaValue: {
        fontFamily: "Roboto_400Regular",
        fontSize: 10,
        color: '#333',
    },
    receiptTable: {
        width: '100%',
        marginBottom: 20,
    },
    receiptTableHeader: {
        flexDirection: 'row',
        backgroundColor: '#374151',
        paddingVertical: 8,
        paddingHorizontal: 5,
    },
    receiptTh: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 8,
        color: '#fff',
    },
    receiptTableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    receiptTd: {
        fontFamily: "Roboto_400Regular",
        fontSize: 9,
        color: '#333',
    },
    receiptSummaryBlock: {
        alignItems: 'flex-end',
        marginTop: 10,
        paddingRight: 5,
    },
    receiptSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
        marginBottom: 10,
    },
    receiptSummaryLabel: {
        fontFamily: "Roboto_400Regular",
        fontSize: 10,
        color: '#555',
    },
    receiptSummaryValue: {
        fontFamily: "Roboto_500Medium",
        fontSize: 10,
        color: '#333',
    },
    receiptTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
        borderTopWidth: 1,
        borderTopColor: '#333',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingVertical: 8,
        marginBottom: 20,
    },
    receiptTotalLabel: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 11,
        color: '#305797',
    },
    receiptTotalValue: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 11,
        color: '#333',
    },
    receiptFooterText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 8,
        color: '#777',
        marginTop: 5,
    }
});