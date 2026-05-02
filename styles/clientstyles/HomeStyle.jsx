import { StyleSheet, Platform, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const HomeStyle = StyleSheet.create({
    container: {
        padding: 15, 
    },
    mainTitleContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        paddingLeft: 5
    },
    mainTitle: {
        fontSize: 20, 
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
    },
    byTravex: {
        fontSize: 11,
        fontFamily: "Montserrat_500Medium",
        color: "#777",
        marginLeft: 5,
        fontStyle: "italic"
    },
    heroSubtitle: {
        fontSize: 12,
        fontFamily: "Roboto_400Regular",
        color: "#777",
        paddingLeft: 5,
        marginTop: 4,
        marginBottom: 15,
        paddingRight: 10
    },
    title: {
        fontSize: 20, 
        fontFamily: "Montserrat_700Bold",
        marginBottom: 12,
        color: "#305797",
        paddingLeft: 5 
    },
    secondMainTitle: {
        fontSize: 20, 
        fontFamily: "Montserrat_700Bold",
        color: "#000000",
        paddingLeft: 5,
        marginBottom: 20,
    },
    // --- HERO BANNER ---
    heroContainer: {
        width: width,
        marginLeft: -15,
        minHeight: 480,
        marginTop: 20,
        marginBottom: 20,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000'
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)'
    },
    heroContentWrapper: {
        zIndex: 1,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 30,
    },
    heroTitle: {
        fontFamily: 'Montserrat_700Bold',
        fontSize: 32,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8
    },
    heroSubtitleWhite: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 13,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 18
    },
    heroFilterCard: {
        width: '100%',
        paddingTop: 10,
        marginTop: 5,
    },
    heroSearchRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 15
    },
    heroSearchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#dbe3ef',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        backgroundColor: '#f8fafc'
    },
    heroSearchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 13,
        color: '#333',
        paddingVertical: 0
    },
    heroSearchBtn: {
        width: 50,
        height: 50,
        backgroundColor: '#305797',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    // 🔥 NEW FILTER BUTTON & MODAL STYLES 🔥
    heroFilterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#305797', 
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        justifyContent: 'center',
        gap: 6
    },
    heroFilterBtnText: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 13
    },
    filterModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    filterModalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 45,
        maxHeight: '90%'
    },
    filterModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    filterModalTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat_700Bold',
        color: '#1f2a44'
    },
    filterSectionLabel: {
        fontSize: 14,
        fontFamily: 'Montserrat_700Bold',
        color: '#333',
        marginBottom: 10,
        marginTop: 15
    },
    filterPillContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    filterPill: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    filterPillSelected: {
        backgroundColor: '#e0e7ff',
        borderColor: '#305797'
    },
    filterPillText: {
        fontSize: 13,
        color: '#64748b',
        fontFamily: 'Roboto_500Medium'
    },
    filterPillTextSelected: {
        color: '#305797'
    },
    filterModalTextInput: {
        borderWidth: 1,
        borderColor: '#dbe3ef',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 48,
        backgroundColor: '#f8fafc',
        fontSize: 14,
        color: '#333',
        fontFamily: 'Roboto_400Regular'
    },
    filterModalApplyBtn: {
        backgroundColor: '#305797',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 25
    },
    filterModalApplyText: {
        color: '#fff',
        fontFamily: 'Montserrat_700Bold',
        fontSize: 15
    },
    heroGridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 15
    },
    heroGridItem: {
        flex: 1,
    },
    heroInputLabel: {
        fontSize: 10,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
        marginBottom: 6,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    heroSelectBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#dbe3ef",
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 42,
        backgroundColor: '#fff'
    },
    heroSelectText: {
        fontSize: 12,
        color: '#333',
        fontFamily: 'Roboto_400Regular',
        flex: 1
    },
    heroTextInput: {
        borderWidth: 1,
        borderColor: '#dbe3ef',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 42,
        backgroundColor: '#fff',
        fontSize: 12,
        color: '#333',
        fontFamily: 'Roboto_400Regular',
        textAlign: 'center'
    },
    heroBudgetRow: {
        alignItems: 'center',
        marginTop: 5,
    },
    heroBudgetLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: -5,
        paddingHorizontal: 5
    },
    heroBudgetText: {
        fontSize: 12,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff'
    },
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    dropdownCenteredContent: {
        backgroundColor: '#fff',
        width: '80%',
        borderRadius: 12,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        overflow: 'hidden'
    },
    modalOption: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalOptionText: {
        fontSize: 14,
        color: '#305797',
        fontFamily: 'Roboto_500Medium',
        textAlign: 'center'
    },

    // --- BANNER CARDS ---
    bannerCard: {
        width: '95%', 
        alignSelf: 'center',
        backgroundColor: "#fff",
        borderRadius: 15,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 25,
        overflow: 'hidden' 
    },
    bannerImage: {
        width: "100%",
        height: 180,
        backgroundColor: '#e0e0e0'
    },
    bannerFooter: {
        padding: 15,
        backgroundColor: "#fff"
    },
    bannerTitle: {
        fontFamily: 'Montserrat_700Bold',
        fontSize: 16,
        color: "#305797"
    },
    bannerSub: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 13,
        color: '#777',
        marginTop: 2
    },
    viewAllButton: {
        backgroundColor: "#305797",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'center',
        paddingVertical: 10,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        gap: 8
    },
    viewAllText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold'
    },
    arrowIcon: {
        width: 14,
        height: 14,
    },

    // --- BACKGROUND IMAGES ---
    bgSectionContainer: {
        marginHorizontal: -15,
        paddingVertical: 40,
        paddingHorizontal: 30,
        marginTop: 10,
        marginBottom: 25,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        minHeight: 230,
    },
    bgOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    bgTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 22,
        color: "#fff",
        textAlign: "center",
        marginBottom: 15,
        zIndex: 1, 
    },
    bgDesc: {
        fontFamily: "Roboto_400Regular",
        fontSize: 13,
        color: "#fff",
        textAlign: "center",
        lineHeight: 20,
        zIndex: 1,
    },
    bgButton: {
        backgroundColor: "#fff",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        zIndex: 1,
    },
    bgButtonText: {
        color: "#305797",
        fontFamily: "Montserrat_700Bold",
        fontSize: 12,
    },

    // --- SERVICES GRID ---
    servicesContainer: {
        paddingHorizontal: 5,
        marginTop: 10,
        marginBottom: 25,
    },
    servicesHeader: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 22,
        color: "#333",
        textAlign: "center",
        marginBottom: 25,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    serviceItem: {
        width: '45%', 
        alignItems: 'center',
        marginBottom: 25,
    },
    serviceIcon: {
        width: 50,
        height: 50,
        marginBottom: 10,
    },
    serviceTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 13,
        color: "#333",
        textAlign: "center",
    },

    // --- CONTACT US STYLES ---
    contactContainer: {
        marginTop: 10,
        marginBottom: 20,
        paddingHorizontal: 5
    },
    contactTitle: {
        fontSize: 22,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginBottom: 10
    },
    contactDesc: {
        fontFamily: "Roboto_400Regular",
        fontSize: 13,
        color: "#555",
        lineHeight: 20,
        marginBottom: 20,
        textAlign: "justify"
    },
    contactInfoCard: {
        backgroundColor: "#305797",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    contactInfoTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 18,
        color: "#fff",
        marginBottom: 5,
    },
    contactInfoSubtitle: {
        fontFamily: "Roboto_400Regular",
        fontSize: 13,
        color: "#e0eaff",
        marginBottom: 20,
    },
    contactInfoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    contactInfoIcon: {
        marginRight: 10,
        marginTop: 2,
    },
    contactInfoTextContainer: {
        flex: 1,
    },
    contactInfoLabel: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 12,
        color: "#fff",
        marginBottom: 3,
    },
    contactInfoText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 13,
        color: "#e0eaff",
        lineHeight: 20,
    },
    contactCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        borderWidth: 1,
        borderColor: "#eaeaea"
    },
    contactCardTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 16,
        color: "#333",
        marginBottom: 15,
    },
    inputWrapper: {
        marginBottom: 15,
    },
    contactInput: {
        backgroundColor: "#f9f9f9",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 45,
        fontFamily: "Roboto_400Regular",
        fontSize: 14,
        color: "#333",
        marginBottom: 15 
    },
    inputErrorBorder: {
        borderColor: "#ff4d4f",
    },
    errorText: {
        color: "#ff4d4f",
        fontSize: 11,
        fontFamily: "Roboto_400Regular",
        marginTop: 4,
        marginLeft: 4,
    },
    contactTextArea: {
        backgroundColor: "#f9f9f9",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingTop: 12,
        minHeight: 100,
        marginBottom: 20,
        fontFamily: "Roboto_400Regular",
        fontSize: 14,
        color: "#333"
    },
    contactSubmitBtn: {
        backgroundColor: "#305797",
        borderRadius: 8,
        height: 45,
        justifyContent: "center",
        alignItems: "center"
    },
    contactSubmitBtnDisabled: {
        backgroundColor: "#a0b4d4" 
    },
    contactSubmitText: {
        color: "#fff",
        fontFamily: "Montserrat_700Bold",
        fontSize: 15
    },

    // --- SUBJECT MODAL STYLES ---
    subjectModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    subjectModalBox: {
        backgroundColor: '#fff',
        width: '85%',
        borderRadius: 12,
        paddingVertical: 10,
        elevation: 5,
    },
    subjectOption: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    subjectOptionText: {
        fontSize: 15,
        fontFamily: 'Roboto_400Regular',
        color: '#333',
    },

    // --- SUCCESS MODAL STYLES ---
    successModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successModalBox: {
        backgroundColor: '#fff',
        width: '85%',
        borderRadius: 16,
        padding: 25,
        alignItems: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    successModalTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 18,
        color: "#305797",
        textAlign: "center",
        marginBottom: 10,
    },
    successModalSub: {
        fontFamily: "Roboto_400Regular",
        fontSize: 13,
        color: "#555",
        textAlign: "center",
        marginBottom: 20,
    },
    successModalButton: {
        backgroundColor: "#305797",
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 8,
    },
    successModalButtonText: {
        color: "#fff",
        fontFamily: "Montserrat_700Bold",
        fontSize: 14,
    }
});

export default HomeStyle;