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
    mainTitleAccent: {
        color: "#305797",
    },
    byTravex: {
        fontSize: 12,
        fontFamily: "Montserrat_500Medium",
        color: "#777",
        marginLeft: 5,
    },
    forYouTitleBar: {
        backgroundColor: '#305797',
        marginHorizontal: -15,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginTop: 22,
        marginBottom: 16,
        width: width,
    },
    forYouTitleText: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Montserrat_700Bold',
        textAlign: 'left',
        letterSpacing: 0.2,
        paddingLeft: 5
    },
    forYouNote: {
        fontSize: 14,
        fontFamily: "Roboto_400Regular",
        color: "#000000",
        paddingLeft: 5,
        marginTop: 0,
        marginBottom: 16,
        lineHeight: 20,
    },
    popularPackagesTitleBar: {
        backgroundColor: '#305797',
        marginHorizontal: -15,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginTop: 10,
        marginBottom: 20,
        width: width,
    },
    popularPackagesTitleText: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Montserrat_700Bold',
        textAlign: 'left',
        letterSpacing: 0.2,
        paddingLeft: 5
    },
    // --- HERO BANNER ---
    heroContainer: {
        width: width,
        marginLeft: -15,
        minHeight: 255,
        marginTop: 10,
        marginBottom: 10,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000'
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.25)'
    },
    heroContentWrapper: {
        zIndex: 1,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 22,
        paddingBottom: 22,
    },
    heroTitle: {
        fontFamily: 'Montserrat_700Bold',
        fontSize: 28,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
        marginTop: -15,
    },
    heroSubtitleWhite: {
        fontFamily: 'Roboto_500Medium',
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20
    },
    heroFilterCard: {
        width: '100%',
        paddingTop: 0,
        marginTop: 0,
    },
    heroSearchRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 0
    },
    heroSearchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#305797',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 50,
        backgroundColor: '#ffffff'
    },
    heroSearchInput: {
        flex: 1,
        marginLeft: 5,
        fontSize: 14,
        color: '#000000',
        paddingVertical: 0
    },
    heroSearchBtn: {
        width: 50,
        height: 50,
        backgroundColor: '#305797',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },

    // --- BANNER CARDS (NEW CANVA DESIGN) ---
    bannerCard: {
        width: width - 65, // Keeps it nicely sized within the horizontal scroll
        alignSelf: 'center',
        backgroundColor: "#fff",
        borderRadius: 0, //  NO corner radius as requested
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        marginBottom: 15,
        marginTop: 0,
    },
    bannerImage: {
        width: "100%",
        height: 200,
        borderRadius: 0, //  NO corner radius
        backgroundColor: '#e0e0e0',
    },
    bannerTagContainer: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 8,
        zIndex: 3,
    },
    discountBannerTag: {
        backgroundColor: '#2db55d',
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 7,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.16,
        shadowRadius: 2,
    },
    discountBannerTagText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: 'Montserrat_700Bold',
        letterSpacing: 0.2,
    },
    typeBannerTag: {
        backgroundColor: 'rgba(255,255,255,0.96)',
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 7,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 2,
    },
    typeBannerTagText: {
        color: '#305797',
        fontSize: 10,
        fontFamily: 'Montserrat_700Bold',
        letterSpacing: 0.2,
    },
    wishlistButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#fff',
        width: 35,
        height: 35,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        zIndex: 2,
    },
    bannerFooter: {
        backgroundColor: "#fff",
        paddingHorizontal: 0,
        paddingBottom: 20,
    },
    titleBanner: {
        backgroundColor: '#305797',
        borderRadius: 30, //  This is the ONLY thing with rounded corners!
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginTop: -25, //  This pulls the blue box up so it overlaps the image perfectly
        marginBottom: 15,
        minHeight: 65,
    },
    locationIcon: {
        width: 18,
        height: 18,
        marginRight: 10,
        tintColor: '#fff', // Ensures the icon is pure white against the blue
    },
    bannerTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 14,
        color: "#ffffff",
        flex: 1,
        textTransform: 'uppercase',
    },
    bannerDesc: {
        fontFamily: "Roboto_400Regular",
        fontSize: 14,
        color: "#305797", // Matches the dark blue-ish text in your design
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
        minHeight: 80,
    },
    viewPackageBtn: {
        alignItems: 'center',
        paddingBottom: 0,
    },
    viewPackageText: {
        fontFamily: "Roboto_500Medium",
        fontSize: 16,
        color: "#b22820", //  The exact red color requested!
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
        fontSize: 24,
        color: "#fff",
        textAlign: "center",
        marginBottom: 10,
        zIndex: 1,
    },
    bgDesc: {
        fontFamily: "Roboto_400Regular",
        fontSize: 14,
        color: "#fff",
        textAlign: "center",
        lineHeight: 20,
        paddingBottom: 5,
        zIndex: 1,
    },
    bgButton: {
        backgroundColor: "#fff",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        zIndex: 1,
    },
    bgButtonText: {
        color: "#305797",
        fontFamily: "Montserrat_700Bold",
        fontSize: 12,
    },

    // ---  NEW CAROUSEL & DOTS STYLES  ---
    carouselContainer: {
        height: 240,
        marginBottom: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    carouselSlide: {
        height: '100%',
        paddingHorizontal: 0,
        marginRight: 0,
        alignSelf: 'center'
    },
    carouselInner: {
        flex: 1, //  FIX: Flex 1 lets it fill the space safely without math errors
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        padding: 25,
    },
    carouselOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 20, //  Ensures the dim effect respects the corners
    },
    carouselTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 24,
        color: "#ffffff",
        textAlign: "left",
        marginBottom: 8,
        zIndex: 1,
        flexShrink: 1,
        maxWidth: '85%',
    },
    carouselSubtitle: {
        fontFamily: "Roboto_400Regular",
        fontSize: 14,
        color: "#ffffff",
        textAlign: "left",
        lineHeight: 20,
        zIndex: 1,
        flexShrink: 1,
        maxWidth: '85%',
    },
    //  IMPROVED CAROUSEL DOT STYLES - Matching PackageDetails 
    carouselDots: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 12,
        alignSelf: 'center',
        gap: 6,
        zIndex: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    activeDot: {
        backgroundColor: '#fff',
        width: 10,
        height: 10,
        borderRadius: 5,
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
        fontSize: 24,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginBottom: 10,
        marginLeft: 5,
    },
    contactDesc: {
        fontFamily: "Roboto_400Regular",
        fontSize: 14,
        color: "#555",
        lineHeight: 20,
        marginBottom: 20,
        textAlign: "justify",
        marginLeft: 5,
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
        color: "#305797",
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
        width: '80%',
        borderRadius: 16,
        padding: 25,
        alignItems: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    successModalCheck: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#d1fae5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    successModalTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 18,
        color: "#1f2937",
        textAlign: "center",
        marginBottom: 10,
    },
    successModalSub: {
        fontFamily: "Roboto_400Regular",
        fontSize: 13,
        color: "#6b7280",
        textAlign: "center",
        marginBottom: 20,
    },
    successModalButton: {
        backgroundColor: "#305797",
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 10,
    },
    successModalButtonText: {
        color: "#fff",
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 14,
    },

    // --- FEATURED PACKAGE MODAL STYLES ---
    featuredModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    featuredModalBox: {
        width: '90%',
        maxWidth: 420,
        backgroundColor: '#f5fdff',
        borderRadius: 20,
        position: 'relative',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        overflow: 'hidden',
    },
    featuredModalCloseBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    featuredModalImageContainer: {
        position: 'relative',
        width: '100%',
        height: 300,
        backgroundColor: '#e0e0e0',
    },
    featuredModalImage: {
        width: '100%',
        height: '100%',
    },
    featuredModalImageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        alignItems: 'center',
    },
    topRatedPng: {
        width: '100%',
        height: 135,
        marginTop: -35,
    },
    packagePngRow: {
        position: 'absolute',
        bottom: -15,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    packagePng: {
        width: '100%',
        height: 95,
    },
    badgePng: {
        position: 'absolute',
        bottom: 5,
        right: -5,
        width: 45,
        height: 20,
    },
    featuredModalContent: {
        padding: 20,
    },
    featuredModalTitle: {
        fontSize: 20,
        fontFamily: 'Montserrat_700Bold',
        color: '#305896',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    featuredModalPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 0,
    },
    featuredModalOriginalPrice: {
        color: '#737373',
        fontSize: 14,
        textDecorationLine: 'line-through',
        marginRight: 15,
        fontFamily: 'Roboto_400Regular',
    },
    featuredModalPrice: {
        color: '#00bf63',
        fontSize: 22,
        fontFamily: 'Roboto_700Bold',
        marginRight: 15,
    },
    featuredModalDiscountText: {
        color: '#00bf63',
        fontSize: 22,
        fontFamily: 'Roboto_700Bold',
        marginLeft: 'auto',
    },
    featuredModalPriceLabel: {
        color: '#737373',
        fontSize: 14,
        marginBottom: 15,
        marginTop: 10,
        fontFamily: 'Roboto_400Regular',
        marginLeft: 0,
    },
    featuredModalStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
        marginTop: 5,
    },
    featuredModalStatColLeft: {
        flex: 1,
        alignItems: 'flex-start',
    },
    featuredModalStatColCenter: {
        flex: 1,
        alignItems: 'center',
    },
    featuredModalStatColRight: {
        flex: 1.2,
        alignItems: 'center',
    },
    featuredModalDetailLabel: {
        color: '#737373',
        fontSize: 12,
        fontFamily: 'Roboto_400Regular',
        marginBottom: 4,
    },
    featuredModalDetailValue: {
        color: '#305896',
        fontSize: 14,
        fontFamily: 'Roboto_400Regular',
    },
    featuredModalStars: {
        color: '#fadb14',
        fontSize: 20,
        marginBottom: 2,
        marginTop: -6,
    },
    featuredModalRatingCount: {
        color: '#737373',
        fontSize: 12,
        fontFamily: 'Roboto_400Regular',
    },
    featuredModalTagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    featuredModalTag: {
        backgroundColor: '#cedcea',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginRight: 8,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: '#cedcea',
    },
    featuredModalTagText: {
        color: '#305896',
        fontSize: 12,
        fontFamily: 'Roboto_400Regular',
    },
    featuredModalTypeAndWish: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 20,
    },
    featuredModalType: {
        backgroundColor: '#305896',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    featuredModalTypeText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Montserrat_600SemiBold',
        textTransform: 'uppercase',
    },
    featuredModalButtonsContainer: {
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#b4b4b4',
    },
    featuredModalViewBtn: {
        backgroundColor: '#00bf63',
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
        width: '70%',
        alignSelf: 'center',
    },
    featuredModalViewBtnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
    },
});

export default HomeStyle;