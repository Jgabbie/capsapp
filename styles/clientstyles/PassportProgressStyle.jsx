import { StyleSheet, Platform } from "react-native";

const PassportProgressStyle = StyleSheet.create({
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
    // NEW STYLES FOR SUBMITTED DOCUMENTS 
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
    // --- Progress Tracker Styles ---
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

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
        overflow: 'hidden',
        paddingTop: 10,
    },
    modalIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#d1fae5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 10
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: "Montserrat_700Bold",
        color: "#1f2937",
        marginBottom: 12,
        textAlign: 'center',
    },
    modalDesc: {
        fontSize: 15,
        fontFamily: "Roboto_400Regular",
        color: "#4b5563",
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
        paddingHorizontal: 20
    },
    modalButton: {
        backgroundColor: "#305797",
        paddingVertical: 12,
        borderRadius: 12,
        width: '40%',
        alignItems: 'center',
        marginBottom: 20
    },
    modalButtonText: {
        color: "#fff",
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 14
    },





    // payment loading Modal
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
    },


    dateModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    dateModalCard: {
        width: '92%',
        maxWidth: 430,
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 18,
        elevation: 12,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 8
        },
        shadowOpacity: 0.18,
        shadowRadius: 16
    },

    dateModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
    },

    dateModalHeaderContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12
    },

    dateModalHeaderIcon: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: '#edf3fc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },

    dateModalTitle: {
        fontFamily: 'Montserrat_700Bold',
        fontSize: 17,
        color: '#1e293b'
    },

    dateModalSubtitle: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 12,
        color: '#64748b',
        marginTop: 3
    },

    dateModalCloseButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center'
    },

    dateCalendar: {
        borderWidth: 1,
        borderColor: '#e8edf4',
        borderRadius: 18,
        paddingBottom: 6,
        overflow: 'hidden'
    },

    dateCalendarArrow: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#edf3fc',
        justifyContent: 'center',
        alignItems: 'center'
    },

    dateSelectedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f5fc',
        borderWidth: 1,
        borderColor: '#dce7f7',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 11,
        marginTop: 14
    },

    dateSelectedIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },

    dateSelectedLabel: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 11,
        color: '#64748b'
    },

    dateSelectedValue: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 14,
        color: '#305797',
        marginTop: 1
    },

    dateAvailabilityNote: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 11,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 10
    },

    dateModalActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16
    },

    dateModalCancelButton: {
        flex: 1,
        minHeight: 48,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: '#d8dee8',
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center'
    },

    dateModalCancelText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 13,
        color: '#64748b'
    },

    dateModalConfirmButton: {
        flex: 1.4,
        minHeight: 48,
        borderRadius: 13,
        backgroundColor: '#305797',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 7,
        elevation: 2
    },

    dateModalConfirmText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 13,
        color: '#ffffff'
    }


});

export default PassportProgressStyle;