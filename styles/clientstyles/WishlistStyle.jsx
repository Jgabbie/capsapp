import { StyleSheet } from "react-native";

const WishlistStyle = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 120,
        backgroundColor: "#f9fafb",
        flexGrow: 1
    },
    title: {
        fontSize: 24,
        fontFamily: "Montserrat_700Bold",
        color: "#1e293b",
        marginBottom: 5
    },
    subtitle: {
        fontSize: 13,
        color: "#64748b",
        fontFamily: "Roboto_400Regular",
        marginBottom: 20
    },

    // --- FILTER BOX (Matches Web) ---
    filterBox: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        marginBottom: 25,
        zIndex: 10
    },
    filterLabel: {
        fontSize: 12,
        fontFamily: "Montserrat_600SemiBold",
        color: "#1e293b",
        marginBottom: 5
    },
    searchBar: {
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#cbd5e1",
        height: 42,
        justifyContent: 'center',
        marginBottom: 15
    },
    searchInput: {
        fontSize: 14,
        color: "#333",
        fontFamily: "Roboto_400Regular"
    },
    dropdownRow: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    dropdownButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#cbd5e1",
        height: 40,
    },
    dropdownText: {
        fontSize: 12,
        color: "#475569",
        fontFamily: "Roboto_400Regular",
    },
    dropdownMenu: {
        position: 'absolute',
        top: 245, 
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 5,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        zIndex: 20,
        width: 130
    },
    dropdownMenuItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },
    dropdownMenuItemText: {
        fontSize: 13,
        color: '#334155',
        fontFamily: 'Roboto_400Regular'
    },

    // --- PACKAGES HEADER ---
    packagesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 15
    },
    packagesTitle: {
        fontSize: 18,
        fontFamily: "Montserrat_700Bold",
        color: "#1e293b",
    },
    foundText: {
        fontSize: 12,
        color: "#94a3b8",
        fontFamily: "Roboto_400Regular"
    },

    // --- CARD (Matches Web) ---
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        marginBottom: 20,
        overflow: "hidden",
        elevation: 1 // slight shadow
    },
    cardImage: {
        width: "100%",
        height: 200,
        resizeMode: "cover"
    },
    cardContent: {
        padding: 16
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    packageName: {
        fontSize: 16,
        fontFamily: "Montserrat_700Bold",
        color: "#1e293b",
        flex: 1,
        marginRight: 10
    },
    refText: {
        fontSize: 12,
        color: "#94a3b8",
        fontFamily: "Roboto_400Regular",
        marginTop: 2
    },
    durationText: {
        fontSize: 13,
        color: "#64748b",
        fontFamily: "Roboto_400Regular",
    },
    priceText: {
        fontSize: 18,
        fontFamily: "Montserrat_700Bold",
        color: "#1e293b",
    },
    
    // --- TAGS ---
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 10,
        fontFamily: "Montserrat_700Bold",
    },

    // --- BUTTONS ---
    actionButtons: {
        flexDirection: 'row',
        gap: 8
    },
    btnView: {
        backgroundColor: "#305797",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    btnViewText: {
        color: "#fff",
        fontSize: 12,
        fontFamily: "Montserrat_600SemiBold"
    },
    btnRemove: {
        backgroundColor: "#fff",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#cbd5e1"
    },
    btnRemoveText: {
        color: "#475569",
        fontSize: 12,
        fontFamily: "Montserrat_600SemiBold"
    },

    // --- EMPTY STATE ---
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    emptyStateImage: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
        opacity: 0.5,
        marginBottom: 15
    },
    emptyStateText: {
        fontSize: 15,
        color: '#94a3b8',
        fontFamily: 'Montserrat_500Medium'
    }
});

export default WishlistStyle;