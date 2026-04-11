import { StyleSheet } from "react-native";

const HomeStyle = StyleSheet.create({
    container: {
        padding: 15, 
    },
    mainTitleContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
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
    title: {
        fontSize: 20, 
        fontFamily: "Montserrat_700Bold",
        marginBottom: 12,
        color: "#305797",
        paddingLeft: 5 
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 20,
        width: '100%',
    },
    searchBar: {
        flex: 2, 
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff", // 🔥 CHANGED to white background
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
        fontSize: 14,
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
        backgroundColor: "#eef3fb",
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 6, 
        borderWidth: 1,
        borderColor: "#d6e0f0",
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '80%',
        borderRadius: 15,
        paddingVertical: 10,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalOption: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'center'
    },
    modalOptionText: {
        fontSize: 16,
        color: '#305797',
        fontFamily: 'Roboto_500Medium'
    },
    
    // 🔥 UPDATED CARD STYLES 🔥
    card: {
        marginRight: 15, 
        width: 150,
        backgroundColor: '#fff', // Added white box background
        borderRadius: 12,        // Rounded corners for the box
        overflow: 'hidden',      // Keeps the top of the image neat
        elevation: 1,            // Subtle shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardImage: {
        width: 150,
        height: 100,
        backgroundColor: '#e0e0e0' // Removed bottom margin, padding handles it now
    },
    cardContent: {
        padding: 10,  // Adds neat space around the text inside the white box
        paddingTop: 8,
    },
    cardTitle: {
        fontFamily: "Montserrat_500Medium",
        color: "#305797",
        fontSize: 13,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginTop: 2
    },
    infoText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 11,
        color: '#555'
    },
    priceText: {
        fontFamily: "Roboto_700Bold",
        fontSize: 13,
        color: "#333",
        marginTop: 3
    },
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
    noResultsText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 14,
        color: "#777",
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20
    },
    
    // --- CONTACT US STYLES ---
    contactContainer: {
        marginTop: 30,
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
        textAlign: "center"
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