import { StyleSheet, Platform } from "react-native";

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
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 15,
        width: '100%',
    },
    searchBar: {
        flex: 2, 
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6, 
        borderWidth: 1,
        borderColor: "#dbe3ef",
        height: 40, 
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 13,
        color: "#333",
        paddingVertical: 0, 
    },
    dropdownGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5
    },
    dropdownButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff", 
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 6, 
        borderWidth: 1,
        borderColor: "#dbe3ef",
        height: 40, 
    },
    dropdownText: {
        fontSize: 11, 
        color: "#305797",
        fontFamily: "Roboto_400Regular",
    },
    dropdownIcon: {
        marginLeft: 4
    },
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)', 
        justifyContent: 'flex-start', 
        alignItems: 'flex-end', 
        paddingTop: 140, 
        paddingRight: 15,
    },
    dropdownListContent: {
        backgroundColor: '#fff',
        width: 180, 
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
    },
    modalOptionText: {
        fontSize: 14,
        color: '#305797',
        fontFamily: 'Roboto_500Medium'
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
        marginHorizontal: -15, // 🔥 Makes it full width (sagad sa gilid)
        paddingVertical: 40,   // 🔥 Increased padding to show more of the image
        paddingHorizontal: 30,
        marginTop: 10,
        marginBottom: 25,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        minHeight: 230, // 🔥 Increased height so it isn't cut off
    },
    bgOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        // 🔥 Removed borderRadius so it flushes with the screen edges perfectly
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