import { StyleSheet, Platform } from "react-native";

const VisaProgressStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fa"
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40
    },
    headerContainer: {
        marginBottom: 20,
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    title: {
        fontSize: 22,
        fontFamily: "Montserrat_700Bold",
        color: "#1f2937",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 2 }
        })
    },
    cardTitle: {
        fontSize: 18,
        fontFamily: "Montserrat_600SemiBold",
        color: "#305797",
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        paddingBottom: 12
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    infoLabel: {
        fontSize: 14,
        fontFamily: "Roboto_500Medium",
        color: "#6b7280",
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        fontFamily: "Roboto_500Medium",
        color: "#1f2937",
        flex: 1,
        textAlign: 'right',
    },
    statusTag: {
        backgroundColor: '#fef9c3',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-end',
    },
    statusText: {
        fontSize: 12,
        fontFamily: "Roboto_700Bold",
        color: '#b45309',
        textTransform: 'uppercase'
    },
    // Custom Vertical Stepper Styles
    stepItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    stepIndicator: {
        alignItems: 'center',
        marginRight: 16,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    stepCircleActive: {
        backgroundColor: '#305797',
    },
    stepCircleInactive: {
        backgroundColor: '#e5e7eb',
    },
    stepNumberActive: {
        color: '#fff',
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 14,
    },
    stepNumberInactive: {
        color: '#9ca3af',
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 14,
    },
    stepLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#e5e7eb',
        position: 'absolute',
        top: 32,
        bottom: -20,
        zIndex: 1,
    },
    stepLineActive: {
        backgroundColor: '#305797',
    },
    stepContent: {
        flex: 1,
        paddingTop: 6,
    },
    stepTitleActive: {
        fontSize: 15,
        fontFamily: "Montserrat_600SemiBold",
        color: "#305797",
        marginBottom: 4,
    },
    stepTitleInactive: {
        fontSize: 15,
        fontFamily: "Montserrat_600SemiBold",
        color: "#9ca3af",
        marginBottom: 4,
    },
    stepDesc: {
        fontSize: 13,
        fontFamily: "Roboto_400Regular",
        color: "#6b7280",
    }
});

export default VisaProgressStyle;