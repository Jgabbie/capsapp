import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const QuotationBookingProcessStyle = StyleSheet.create({
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

    imageScrollContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    summaryScrollImage: {
        width: 180,
        height: 120,
        borderRadius: 12,
        marginRight: 12,
    },

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

    sectionNote: {
        fontFamily: "Roboto_400Regular",
        fontSize: 11,
        color: '#64748b',
        lineHeight: 16,
        marginTop: 10,
        fontStyle: 'italic',
    },

    totalAmountCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e0e7ff',
        marginBottom: 25,
        elevation: 2,
        shadowColor: '#1f2a44',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    totalLabel: {
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 12,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    totalValue: {
        fontFamily: "Roboto_700Bold",
        fontSize: 30,
        color: '#305797',
        marginVertical: 8,
    },
    totalFinePrint: {
        fontFamily: "Roboto_400Regular",
        fontStyle: 'italic',
        fontSize: 10,
        color: '#7c8798',
        lineHeight: 14,
        marginBottom: 12,
    },
    packageTypeCard: {
        marginTop: 6,
        borderWidth: 1,
        borderColor: '#dbe4f3',
        backgroundColor: '#f8fbff',
        borderRadius: 12,
        padding: 14,
    },
    packageTypeLabel: {
        fontFamily: "Roboto_400Regular",
        fontSize: 12,
        color: '#64748b',
    },
    packageTypeValue: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 15,
        color: '#305797',
        marginTop: 2,
        textTransform: 'uppercase',
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

export default QuotationBookingProcessStyle;
