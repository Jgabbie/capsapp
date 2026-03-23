import { StyleSheet } from "react-native";

const WishlistStyle = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 120,
        backgroundColor: "#f5f7fa",
        flexGrow: 1
    },
    title: {
        fontSize: 24,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginBottom: 15
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#eee",
        marginBottom: 20,
        overflow: "hidden",
        elevation: 3
    },
    cardImage: {
        width: "100%",
        height: 180,
        resizeMode: "cover"
    },
    cardContent: {
        padding: 16
    },
    packageName: {
        fontSize: 18,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginBottom: 5
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "baseline",
        marginBottom: 15
    },
    newPrice: {
        fontSize: 20,
        fontFamily: "Montserrat_700Bold",
        color: "#222",
        marginRight: 5
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    viewButton: {
        backgroundColor: "#305797",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        alignItems: "center",
        marginRight: 10
    },
    removeButton: {
        backgroundColor: "#992A46",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        alignItems: "center"
    },
    viewButtonText: {
        color: "#fff",
        fontSize: 14,
        fontFamily: "Montserrat_700Bold"
    },
    
    // --- PERFECTLY MATCHED HOME SCREEN SEARCH & FILTERS ---
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 20,
        width: '100%',
        zIndex: 10, 
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
        marginRight: 4
    },
    dropdownMenu: {
        position: 'absolute',
        top: 130, 
        right: 20, 
        backgroundColor: '#fff',
        borderRadius: 12, 
        padding: 5,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        zIndex: 20,
        minWidth: 120
    },
    dropdownMenuItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    dropdownMenuItemText: {
        fontSize: 13,
        color: '#333'
    },

    // --- EMPTY STATE ---
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyStateImage: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
        opacity: 0.5,
        marginBottom: 20
    },
    emptyStateText: {
        fontSize: 16,
        color: '#777',
        fontFamily: 'Montserrat_500Medium'
    }
});

export default WishlistStyle;