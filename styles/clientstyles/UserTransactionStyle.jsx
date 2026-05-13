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
        marginBottom: 24,
        gap: 12,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#d9d9d9",
        height: 42,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontFamily: "Roboto_400Regular",
        fontSize: 13,
        color: "#333",
    },
    dropdownGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    dropdownButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#d9d9d9",
        height: 40,
        paddingHorizontal: 12,
    },
    dropdownText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 10,
        color: "#333",
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

    // --- RECEIPT MODAL (Web Mirror Design) ---
    receiptModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    receiptPaper: {
        backgroundColor: '#fff',
        width: '95%',
        maxHeight: '70%',
        borderRadius: 8,
        padding: 20,
        paddingLeft: 30,
        paddingRight: 30,
        paddingTop: 40,
        elevation: 10,
        overflow: 'hidden',
    },
    receiptCloseBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        padding: 5,
    },
    // Header - Logo + Company on left, INVOICE on right
    receiptWideCanvas: {
        width: 600,
        height: 700,
        paddingBottom: 10,
    },
    receiptHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: '#1f2a44',
    },
    receiptHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1.2,
        paddingRight: 12,
    },
    receiptLogo: {
        width: 70,
        height: 70,
        marginRight: 12,
        marginTop: 2,
    },
    receiptCompanyDetails: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    receiptCompanyName: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 12,
        color: '#000000',
        marginBottom: 0,
    },
    receiptMutedText: {
        fontFamily: "Montserrat_400Regular",
        fontSize: 8,
        color: '#555',
        lineHeight: 11,
    },
    receiptInvoiceBlock: {
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        minWidth: 220,
        paddingRight: 0,
        paddingTop: 8,
    },
    receiptInvoiceText: {
        fontFamily: "Montserrat_semiBold",
        fontSize: 18,
        color: '#000000',
        textAlign: 'right',
        lineHeight: 22,
    },
    receiptInvoiceNumber: {
        fontFamily: "Montserrat_semiBold",
        fontSize: 18,
        color: '#000000',
        textAlign: 'right',
        lineHeight: 22,
    },
    // BILLED TO section
    receiptMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
        gap: 0,
    },
    receiptBilledTo: {
        flex: 1,
        minWidth: 220,
    },
    receiptTinyLabel: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 8,
        color: '#6b7280',
        marginBottom: 3,
        textTransform: 'uppercase',
    },
    receiptCustomerName: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 11,
        color: '#000000',
        marginBottom: 2,
    },
    // Meta boxes (DATE, AMOUNT TO PAY, REFERENCE)
    receiptMetaGrid: {
        flexDirection: 'row',
        gap: 0,
        flex: 0,
        minWidth: 330,
    },
    receiptMetaBox: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#d1d5db',
        paddingVertical: 10,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    receiptMetaBoxPrimary: {
        backgroundColor: '#1f2a44',
        borderColor: '#1f2a44',
    },
    receiptMetaLabel: {
        fontFamily: 'Montserrat_700Bold',
        fontSize: 7,
        color: '#6b7280',
        textTransform: 'uppercase',
        marginBottom: 10,
        textAlign: 'center',
    },
    receiptMetaLabelLight: {
        color: '#fff',
    },
    receiptMetaValue: {
        fontFamily: "Roboto_500Medium",
        fontSize: 10,
        color: '#1f2a44',
        textAlign: 'center',
    },
    receiptMetaValueLight: {
        color: '#fff',
        fontFamily: 'Montserrat_700Bold',
        fontSize: 11,
    },
    // Table
    receiptTable: { 
        marginBottom: 15,
        // Removed the outer border so it flows naturally on the white paper
    },
    receiptTableHeader: { 
        flexDirection: 'row', 
        paddingVertical: 6, 
        paddingHorizontal: 4,
        borderBottomWidth: 1,  // 🔥 Line directly UNDER the QTY/Description
        borderColor: '#000',   
        // (Removed borderTopWidth so there is nothing above it)
    },
    receiptTh: { 
        fontFamily: "Montserrat_700Bold", 
        fontSize: 7, 
        color: '#000',         
        paddingHorizontal: 0 
    },
    receiptTableRow: { 
        flexDirection: 'row', 
        paddingVertical: 8, 
        paddingHorizontal: 4,
        borderBottomWidth: 1,  // 🔥 Line directly UNDER the "1" and the package data
        borderColor: '#000',   // Keeps the line pure black
    },
    receiptTd: { 
        fontFamily: "Roboto_400Regular", 
        fontSize: 8, 
        color: '#6b7280',      // 🔥 Slightly grey text underneath
        paddingHorizontal: 2 
    },
    // Footer & Totals
    receiptBottomGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 225,
    },
    receiptBankInfo: {
        flex: 0,
        paddingRight: 15,
    },
    receiptBankSection: {
        marginBottom: 15,
    },
    receiptBankTitle: {
        fontFamily: 'Montserrat_700Bold',
        fontSize: 8,
        color: '#1f2a44',
        marginBottom: 3,
        textTransform: 'uppercase',
    },
    receiptBankText: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 8,
        color: '#555',
        lineHeight: 12,
    },
    receiptDivider: {
        height: 1,
        backgroundColor: '#000000',
        marginVertical: 0,
        marginTop: 0,
        marginBottom: 10,
    },
    receiptSummaryBlock: {
        flex: 1,
        minWidth: 220,
    },
    receiptSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        marginTop: 10,
    },
    receiptSummaryLabel: {
        fontFamily: "Roboto_400Regular",
        fontSize: 10,
        color: '#6b7280',
    },
    receiptSummaryValue: {
        fontFamily: "Roboto_400Regular",
        fontSize: 12,
        color: '#6b7280',
    },
    receiptTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#000000',
        marginBottom: 10,
    },
    receiptTotalLabel: {
        fontFamily: "Roboto_400Regular",
        fontSize: 12,
        color: '#6b7280',
    },
    receiptTotalValue: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 12,
        color: '#000000',
    },
    receiptDownloadButton: {
        backgroundColor: '#305797',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 15,
        alignSelf: 'flex-end',
    }
});