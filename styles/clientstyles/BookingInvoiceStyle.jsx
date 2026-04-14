import { StyleSheet, Platform } from 'react-native';

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
        color: '#305797',
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
        color: '#2f54eb',
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
        color: '#64748b',
        fontFamily: 'Roboto_500Medium',
    },
    txnValue: {
        fontSize: 14,
        color: '#333',
        fontFamily: 'Montserrat_600SemiBold',
    },
    txnStatus: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        overflow: 'hidden',
        fontSize: 12,
        fontFamily: 'Montserrat_600SemiBold',
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

    // --- PROCEED TO CHECKOUT ---
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
});