import { StyleSheet } from "react-native";

const HomeStyle = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15, // Reduced slightly for better mobile fit
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 20, // Slightly smaller for better scaling
        fontWeight: "bold",
        marginBottom: 12,
        color: "#305797",
        paddingLeft: 5 // Reduced to align better with the search row
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 20,
        width: '100%',
    },
    searchBar: {
        flex: 2, // Gives the search bar more priority
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f6f8fc",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6, // CHANGED: Reduced from 10 to make it thinner
        borderWidth: 1,
        borderColor: "#dbe3ef",
        height: 40, // FIXED HEIGHT: Keeps it consistent
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: "#333",
        paddingVertical: 0, // CRITICAL: Stops text from shifting vertically
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
        paddingHorizontal: 8,
        paddingVertical: 6, // Match search bar height
        borderWidth: 1,
        borderColor: "#d6e0f0",
        height: 40, // Match search bar height
    },
    dropdownText: {
        fontSize: 11, // Smaller text to prevent "lumalagpas" inside buttons
        color: "#305797",
        fontFamily: "Roboto_400Regular",
    },
    dropdownIcon: {
        marginLeft: 4
    },
    card: {
        marginRight: 15, // Changed from marginLeft to handle horizontal scroll better
        width: 150
    },
    cardImage: {
        width: 150,
        height: 100,
        borderRadius: 10,
        marginBottom: 5
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
        width: '95%', // Scale relative to screen instead of fixed 320
        alignSelf: 'center',
        backgroundColor: "#fff",
        borderRadius: 15,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 25,
        overflow: 'hidden' // Keeps image corners rounded
    },
    bannerImage: {
        width: "100%",
        height: 180,
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
    }
});

export default HomeStyle;