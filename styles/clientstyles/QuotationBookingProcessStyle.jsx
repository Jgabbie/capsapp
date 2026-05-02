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
