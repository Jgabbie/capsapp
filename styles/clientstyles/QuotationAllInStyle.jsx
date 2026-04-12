import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const QuotationAllInStyle = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    titleGroup: {
        flex: 1,
        marginRight: 10,
    },
    mainTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 22,
        color: "#1f2a44",
    },
    subtitle: {
        fontFamily: "Roboto_400Regular",
        fontSize: 13,
        color: "#4e5b72",
        marginTop: 4,
    },
    backButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        backgroundColor: '#fff',
    },
    backButtonText: {
        fontFamily: "Roboto_500Medium",
        color: "#64748b",
        fontSize: 12,
    },
    
    // --- NEW: Scrollable Images ---
    imageScrollContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    summaryScrollImage: {
        width: 140,
        height: 100,
        borderRadius: 12,
        marginRight: 12,
    },

    // --- SUMMARY STYLES ---
    bookingDetailsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e0e7ff',
        marginBottom: 15,
    },
    bookingDetailsTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 18, 
        color: "#1f2a44",
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 10
    },
    detailRowBreakdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    breakdownLabel: {
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 12,
        color: '#1f2a44',
        flex: 1,
    },
    breakdownValue: {
        fontFamily: "Roboto_400Regular",
        fontSize: 12,
        color: '#4e5b72',
        flex: 2,
        textAlign: 'right',
    },
    totalAmountCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e0e7ff',
        marginBottom: 25,
        elevation: 2,
        shadowColor: "#1f2a44",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    totalLabel: {
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 12,
        color: "#666",
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    totalValue: {
        fontFamily: "Roboto_700Bold",
        fontSize: 32,
        color: "#305797",
        marginVertical: 8,
    },
    pricingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    pricingText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 13,
        color: '#4e5b72',
    },
    summaryNote: {
        fontFamily: "Roboto_400Regular",
        fontStyle: 'italic',
        fontSize: 10,
        color: '#888',
        marginVertical: 12,
        lineHeight: 14,
    },
    dashedBox: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#cbd5e1',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f8fafc',
    },
    dashedBoxLabel: {
        fontFamily: "Roboto_400Regular",
        fontSize: 11,
        color: '#1f2a44',
    },
    dashedBoxValue: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 14,
        color: '#305797',
        textTransform: 'uppercase',
        marginTop: 2,
    },

    // --- PACKAGE ARRANGEMENT ---
    sectionHeader: {
        marginBottom: 16,
        marginTop: 10
    },
    sectionTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 22,
        color: "#1f2a44",
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e7ecf7',
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: "#1f2a44",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
    },
    cardSelected: {
        borderColor: '#305797',
        borderWidth: 2,
    },
    cardImage: {
        width: '100%',
        height: 160,
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 16,
        color: "#1f2a44",
        marginBottom: 6,
    },
    cardDesc: {
        fontFamily: "Roboto_400Regular",
        fontSize: 13,
        color: "#4b5563",
        lineHeight: 18,
    },
    cardNoteRed: {
        fontFamily: "Roboto_500Medium",
        fontSize: 11,
        color: "#dc2626", 
        marginTop: 10,
        lineHeight: 16
    },

    // --- 🔥 UPDATED COUNTERS TO MATCH CARDS 🔥 ---
    counterSection: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e7ecf7',
        marginBottom: 25,
    },
    counterSectionTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 18,
        color: "#1f2a44",
        marginBottom: 5,
    },
    travelerCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 12,
    },
    counterLabel: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 15,
        color: "#1f2a44",
        marginBottom: 4
    },
    travelerDetailText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 12,
        color: "#64748b",
        marginTop: 4,
    },
    counterControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    counterBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    counterValue: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 16,
        color: "#1f2a44",
        marginHorizontal: 15,
        minWidth: 20,
        textAlign: 'center',
    },

    proceedButton: {
        backgroundColor: "#305797",
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    proceedButtonText: {
        fontFamily: "Montserrat_700Bold",
        color: "#fff",
        fontSize: 16,
    },
});

export default QuotationAllInStyle;