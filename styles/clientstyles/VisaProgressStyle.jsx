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
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#305797',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    backButtonText: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 15,
        marginLeft: 8,
    },
    title: {
        fontSize: 22,
        fontFamily: "Montserrat_700Bold",
        color: "#1f2937",
        marginBottom: 10
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
    //  NEW STYLES FOR SUBMITTED DOCUMENTS 
    docRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6'
    },
    docLabel: {
        fontFamily: 'Roboto_500Medium',
        fontSize: 14,
        color: '#374151',
    },
    docLink: {
        fontFamily: 'Roboto_500Medium',
        fontSize: 14,
        color: '#305797',
        textDecorationLine: 'underline'
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
    },
    //  NEW STYLES FOR APPOINTMENT OPTIONS 
    optionCard: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    optionCardSelected: {
        borderColor: '#305797',
        backgroundColor: '#f0f5ff',
    },
    optionTag: {
        backgroundColor: '#e0e7ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    optionTagText: {
        color: '#305797',
        fontSize: 12,
        fontFamily: 'Montserrat_600SemiBold',
    },
    optionDate: {
        fontSize: 16,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#1f2937',
    },
    optionTime: {
        fontSize: 14,
        fontFamily: 'Roboto_400Regular',
        color: '#6b7280',
        marginTop: 4,
    },
    submitBtn: {
        backgroundColor: '#305797',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    submitBtnText: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 15,
    },

    // payment loading Modal

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },

    modalBox: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        paddingTop: 35,
        alignItems: 'center',
        elevation: 5
    },

    closeIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5
    },

    modalTitle: {
        fontFamily: 'Montserrat_700Bold',
        fontSize: 22,
        color: '#305797',
        marginBottom: 12
    },

    modalSubtitle: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 25
    },

    modalButtonRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        gap: 12
    },

    proceedBtn: {
        flex: 1,
        backgroundColor: '#305797',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center'
    },

    proceedBtnText: {
        fontFamily: 'Montserrat_600SemiBold',
        color: '#fff',
        fontSize: 14
    },

    cancelBtn: {
        flex: 1,
        backgroundColor: '#9f2b46',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center'
    },

    cancelBtnText: {
        fontFamily: 'Montserrat_600SemiBold',
        color: '#fff',
        fontSize: 14
    },

    loadingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },

    loadingCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 28,
        paddingHorizontal: 22,
        alignItems: 'center',
        elevation: 6
    },

    loadingText: {
        marginTop: 14,
        fontFamily: 'Montserrat_700Bold',
        fontSize: 18,
        color: '#305797',
        textAlign: 'center'
    },

    loadingSubtext: {
        marginTop: 6,
        fontFamily: 'Roboto_400Regular',
        fontSize: 13,
        color: '#64748b',
        textAlign: 'center'
    }
});

export default VisaProgressStyle;