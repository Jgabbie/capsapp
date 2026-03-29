import { StyleSheet } from "react-native";

const PaymentStyle = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    container: {
        padding: 20,
    },
    // Progress bar style similar to your web breadcrumbs
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        justifyContent: 'center',
    },
    progressStep: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressStepActive: {
        backgroundColor: '#305797',
    },
    progressLine: {
        width: 40,
        height: 2,
        backgroundColor: '#e2e8f0',
        marginHorizontal: 8,
    },
    progressText: {
        fontSize: 10,
        fontFamily: "Montserrat_700Bold",
        color: '#fff',
    },
    // Section Headers
    sectionTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 18,
        color: "#1f2a44",
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontFamily: "Roboto_400Regular",
        fontSize: 12,
        color: "#6b7486",
        marginBottom: 20,
    },
    // Mode Selection Cards
    modeCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    modeCardSelected: {
        borderColor: '#305797',
        borderWidth: 2,
        backgroundColor: '#f7f9ff',
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#cbd5e1',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
        marginTop: 2,
    },
    radioCircleSelected: {
        borderColor: '#305797',
    },
    radioInner: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: '#305797',
    },
    modeContent: {
        flex: 1,
    },
    modeTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 15,
        color: '#1f2a44',
        marginBottom: 4,
    },
    modeDesc: {
        fontFamily: "Roboto_400Regular",
        fontSize: 12,
        color: '#64748b',
        lineHeight: 18,
    },
    // Frequency Picker (Dropdown replacement)
    pickerContainer: {
        marginTop: 15,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerLabel: {
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 11,
        color: '#1f2a44',
        marginBottom: 5,
    },
    // Schedule Box
    scheduleBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 15,
        marginTop: 5,
        marginBottom: 20,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#305797',
    },
    scheduleTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 14,
        color: '#1f2a44',
        marginBottom: 10,
    },
    scheduleItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    scheduleLabel: {
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 12,
        color: '#1f2a44',
    },
    scheduleDate: {
        fontFamily: "Roboto_400Regular",
        fontSize: 11,
        color: '#64748b',
    },
    scheduleAmount: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 12,
        color: '#305797',
    },
    scheduleNote: {
        fontSize: 10,
        color: '#b54747',
        fontStyle: 'italic',
        marginTop: 10,
        textAlign: 'center',
    },
    // Invoice Summary Card
    invoiceCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    invoiceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    invoiceLabel: {
        fontFamily: "Roboto_400Regular",
        fontSize: 12,
        color: '#64748b',
    },
    invoiceValue: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 12,
        color: '#1f2a44',
        flex: 1,
        textAlign: 'right',
    },
    invoiceTotal: {
        fontSize: 16,
        color: '#305797',
        marginTop: 5,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    // Bank Grid
    bankGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    bankItem: {
        width: '48%',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    bankName: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 11,
        color: '#305797',
        marginBottom: 4,
    },
    bankAccount: {
        fontFamily: "Roboto_500Medium",
        fontSize: 11,
        color: '#1f2a44',
    },
    bankHolder: {
        fontSize: 9,
        color: '#64748b',
        marginTop: 2,
    },
    // Success View
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#fff',
    },
    successTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 22,
        color: '#1f2a44',
        marginTop: 20,
        marginBottom: 10,
    },
    successDesc: {
        fontFamily: "Roboto_400Regular",
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    refBox: {
        backgroundColor: '#f1f5f9',
        padding: 15,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        marginBottom: 40,
    },
    refLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 5,
    },
    refText: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 18,
        color: '#305797',
        letterSpacing: 1,
    }
});

export default PaymentStyle;