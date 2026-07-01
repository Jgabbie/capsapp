import { StyleSheet } from "react-native";

const BookingUploadsStyle = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    container: {
        padding: 20,
    },
    notesBox: {
        backgroundColor: '#fffbe6',
        borderWidth: 1,
        borderColor: '#ffe58f',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
    },
    notesTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 14,
        color: "#000000",
        marginBottom: 8,
    },
    bulletRow: {
        flexDirection: 'row',
        marginBottom: 4,
        paddingRight: 10,
    },
    bullet: {
        fontSize: 12,
        color: "#000000",
        marginRight: 6,
        lineHeight: 18,
    },
    notesText: {
        flex: 1,
        fontFamily: "Roboto_400Regular",
        fontSize: 12,
        color: "#000000",
        lineHeight: 18,
    },
    uploadCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e7ecf7',
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    travelerHeader: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 16,
        color: "#1f2a44",
        marginBottom: 4,
    },
    cardSubtitle: {
        fontFamily: "Roboto_400Regular",
        fontSize: 12,
        color: "#64748b",
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 10,
    },

    // --- FORM STYLES ---
    formSection: {
        marginBottom: 16,
    },
    formRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginBottom: 8,
    },
    formCol: {
        flex: 1,
    },
    formColSmall: {
        width: 85,
    },
    input: {
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 13,
        fontFamily: "Roboto_400Regular",
        color: "#1f2a44",
        backgroundColor: '#fff',
    },
    selectInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleSelect: {
        flex: 0,
        width: 96,
        minHeight: 52,
    },
    inputText: {
        fontSize: 13,
        fontFamily: "Roboto_400Regular",
        color: "#1f2a44",
        flex: 1,
        textAlignVertical: 'center',
    },
    placeholderText: {
        color: '#9ca3af',
    },

    // --- UPLOAD BOXES ---
    uploadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    uploadSlot: {
        flex: 1,
        alignItems: 'center',
    },
    slotLabel: {
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 11,
        color: "#4e5b72",
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: 0.5
    },
    dragger: {
        width: '100%',
        aspectRatio: 1,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#305797',
        borderRadius: 12,
        backgroundColor: '#f9faff',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    draggerActive: {
        backgroundColor: '#eef3ff',
        borderStyle: 'solid',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    // --- CUSTOM DROPDOWN MODAL ---
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownMenu: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    dropdownItem: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    dropdownItemText: {
        fontFamily: "Roboto_500Medium",
        fontSize: 15,
        color: '#1f2a44',
    },

    // --- IOS DATE PICKER ---
    iosPickerContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    iosPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },

    // --- FOOTER BUTTONS ---
    footerContainer: {
        marginTop: 10,
        paddingBottom: 50,
        paddingHorizontal: 10,
    },
    smallProceedButton: {
        backgroundColor: '#305797',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    smallProceedButtonText: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 15,
        color: "#ffffff",
    },
    backTextButton: {
        backgroundColor: '#305797',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backText: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 15,
        color: "#ffffff",
    },
    //  NEW: Black, uppercase labels for the input boxes
    inputLabel: {
        fontSize: 12,
        fontFamily: "Montserrat_700Bold",
        color: "#000",
        marginBottom: 4,
        marginTop: 15,
        textTransform: 'uppercase'
    }
    ,
    //  NEW: greyed disabled input style
    disabledInput: {
        backgroundColor: '#e2e8f0',
        color: '#94a3b8',
    }
    ,
    //  NEW: Remove Image Text Button Style
    removeImageText: {
        color: '#dc2626',
        fontSize: 12,
        fontFamily: 'Montserrat_600SemiBold',
        textAlign: 'center',
        marginTop: 8,
        textDecorationLine: 'underline',
    },
    //  PDF Preview Container
    pdfPreviewContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    pdfFileName: {
        fontSize: 10,
        fontFamily: 'Roboto_400Regular',
        color: '#dc2626',
        marginTop: 6,
        textAlign: 'center',
    },
    //  View PDF Button
    viewPdfText: {
        color: '#305797',
        fontSize: 12,
        fontFamily: 'Montserrat_600SemiBold',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    //  File Action Buttons Container
    fileActionButtons: {
        marginTop: 8,
        gap: 8,
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

    dateSelectedExtra: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 11,
        color: '#64748b',
        marginTop: 2
    },

    dateLimitNote: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 11,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 8
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

export default BookingUploadsStyle;