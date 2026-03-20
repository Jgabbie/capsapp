import { StyleSheet } from "react-native";

const HomeStyle = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15, 
        backgroundColor: "#fff",
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
        backgroundColor: "#f6f8fc",
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
    // --- NEW MODAL DROPDOWN STYLES ---
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
    // ---------------------------------
    card: {
        marginRight: 15, 
        width: 150
    },
    cardImage: {
        width: 150,
        height: 100,
        borderRadius: 10,
        marginBottom: 5,
        backgroundColor: '#e0e0e0'
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
    }
});

export default HomeStyle;