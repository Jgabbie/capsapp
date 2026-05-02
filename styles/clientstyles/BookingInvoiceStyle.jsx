import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f4f6f8',
    },
    container: {
        padding: 20,
        paddingBottom: 40,
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
        marginLeft: 6,
        fontSize: 14,
    },
    pageTitle: {
        fontSize: 24,
        fontFamily: 'Montserrat_700Bold',
        color: '#333',
        marginBottom: 4,
    },
    pageSubtitle: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Roboto_400Regular',
        marginBottom: 24,
    },
    
    // --- SUMMARY CARDS ---
    metaContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
            android: { elevation: 3 },
        }),
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    metaItem: {
        width: '48%',
        marginBottom: 12,
    },
    metaLabel: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'Montserrat_600SemiBold',
        marginBottom: 4,
    },
    metaValue: {
        fontSize: 14,
        color: '#333',
        fontFamily: 'Roboto_500Medium',
    },
    
    // --- STAT CARDS (Prices) ---
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    statCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        padding: 12,
        width: '31%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statHighlight: {
        backgroundColor: '#f0f5ff',
        borderColor: '#adc6ff',
        borderWidth: 1,
    },
    statLabel: {
        fontSize: 11,
        color: '#64748b',
        fontFamily: 'Montserrat_600SemiBold',
        marginBottom: 6,
        textAlign: 'center',
    },
    statAmount: {
        fontSize: 15,
        color: '#333',
        fontFamily: 'Montserrat_700Bold',
        textAlign: 'center',
    },
    statAmountRed: {
        color: '#b91c1c',
    },
    statusTag: {
        marginTop: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
        fontSize: 10,
        fontFamily: 'Montserrat_600SemiBold',
    },

    // --- STANDARD CARDS ---
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
            android: { elevation: 3 },
        }),
    },
    cardTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat_700Bold',
        color: '#000000',
        marginBottom: 16,
    },

    // --- TRANSACTIONS ---
    noticeBox: {
        backgroundColor: '#f0f5ff',
        borderColor: '#adc6ff',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    noticeText: {
        color: '#000',
        fontSize: 13,
        fontFamily: 'Roboto_400Regular',
    },
    txnCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    txnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    txnLabel: {
        fontSize: 12,
        color: '#000',
        fontFamily: 'Montserrat_600SemiBold',
    },
    txnValue: {
        fontSize: 14,
        color: '#000',
        fontFamily: 'Roboto_400Regular',
    },

    // --- DOCUMENTS ---
    travelerDocSection: {
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 16,
    },
    travelerName: {
        fontSize: 16,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#333',
        marginBottom: 12,
    },
    travelerDetailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    travelerDetailText: {
        width: '50%',
        fontSize: 13,
        color: '#555',
        fontFamily: 'Roboto_400Regular',
        marginBottom: 6,
    },
    docGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    docCol: {
        width: '48%',
    },
    docLabel: {
        fontSize: 13,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#333',
        marginBottom: 8,
    },
    docImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
    },

    // --- INLINE PAYMENT METHODS (NEW) ---
    methodGridContainer: {
        flexDirection: 'column',
        gap: 12,
        marginBottom: 20,
    },
    methodGridCard: {
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 16,
    },
    methodGridCardSelected: {
        borderColor: '#305797',
        backgroundColor: '#f8faff',
    },
    methodRadioHeader: {
        marginBottom: 12,
    },
    radioCircle: {
        height: 24,
        width: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#cbd5e1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircleSelected: {
        borderColor: '#305797',
    },
    radioInner: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: '#305797',
    },
    modeTitle: {
        fontFamily: 'Montserrat_700Bold',
        fontSize: 16,
        color: '#1e293b',
        marginBottom: 6,
    },
    modeDesc: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 13,
        color: '#64748b',
        lineHeight: 18,
    },
    modeNote: {
        fontSize: 12,
    },
    
    // --- MANUAL BANK & UPLOAD SECTION (NEW) ---
    manualBankSection: {
        marginTop: 5,
    },
    bankGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    bankGridCard: {
        width: '48%',
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 10,
    },
    bankName: {
        fontFamily: 'Montserrat_700Bold',
        color: '#305797',
        fontSize: 13,
        marginBottom: 4,
    },
    bankAccount: {
        fontFamily: 'Roboto_500Medium',
        fontSize: 12,
        color: '#333',
        marginBottom: 2,
    },
    bankHolder: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 9,
        color: '#64748b',
        textTransform: 'uppercase',
    },
    uploadSection: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 16,
    },
    uploadTitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 15,
        color: '#333',
        marginBottom: 6,
    },
    uploadSubtitle: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 12,
        color: '#64748b',
        marginBottom: 16,
    },
    selectImageBtn: {
        backgroundColor: '#305797',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
        marginBottom: 20,
    },
    selectImageBtnText: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 14,
    },
    imagePreviewContainer: {
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 16,
    },
    previewImageLabel: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 13,
        color: '#333',
        marginBottom: 10,
    },
    previewImageBox: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        borderRadius: 8,
        minHeight: 150,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    imageWrapper: {
        position: 'relative',
        width: '100%',
        alignItems: 'center',
    },
    previewSelectedImage: {
        width: '100%',
        height: 250,
        borderRadius: 6,
    },
    removeImageBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#fee2e2',
        padding: 8,
        borderRadius: 20,
        elevation: 2,
    },
    noImageText: {
        color: '#9ca3af',
        fontFamily: 'Roboto_400Regular',
        fontSize: 13,
    },

    // --- PROCEED BUTTON ---
    checkoutSection: {
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        padding: 20,
        alignItems: 'center',
        marginTop: 10,
    },
    checkoutTitle: {
        fontSize: 14,
        color: '#64748b',
        fontFamily: 'Montserrat_600SemiBold',
        marginBottom: 4,
    },
    checkoutAmount: {
        fontSize: 24,
        color: '#b91c1c',
        fontFamily: 'Montserrat_700Bold',
        marginBottom: 16,
    },
    checkoutButton: {
        backgroundColor: '#305797',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
    },

    // --- PDF SECTION ---
    pdfButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderColor: '#305797',
        borderWidth: 1,
        paddingVertical: 14,
        borderRadius: 8,
        width: '100%',
    },
    pdfButtonText: {
        color: '#305797',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 15,
        marginLeft: 8,
    },

    // --- MODAL CONFIRMATION STYLES ---
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalBox: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 24, paddingTop: 35, alignItems: 'center', elevation: 5 },
    closeIcon: { position: 'absolute', top: 10, right: 10, padding: 5 },
    modalTitle: { fontFamily: 'Montserrat_700Bold', fontSize: 22, color: '#305797', marginBottom: 12 },
    modalSubtitle: { fontFamily: 'Roboto_400Regular', fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 25 },
    modalButtonRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 12 },
    proceedBtn: { flex: 1, backgroundColor: '#305797', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    proceedBtnText: { fontFamily: 'Montserrat_600SemiBold', color: '#fff', fontSize: 14 },
    cancelBtn: { flex: 1, backgroundColor: '#9f2b46', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    cancelBtnText: { fontFamily: 'Montserrat_600SemiBold', color: '#fff', fontSize: 14 }
});