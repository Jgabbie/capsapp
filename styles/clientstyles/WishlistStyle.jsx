import { StyleSheet } from "react-native";

const WishlistStyle = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 120,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginBottom: 10
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
        overflow: "hidden",
        elevation: 4
    },
    cardImage: {
        width: "100%",
        height: 248,
        resizeMode: "cover"
    },
    cardContent: {
        padding: 15
    },
    packageName: {
        fontSize: 18,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginBottom: 10
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15
    },
    oldPrice: {
        fontSize: 14,
        textDecorationLine: "line-through",
        color: "#888",
        marginRight: 10
    },
    newPrice: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#305797",
        marginRight: 10
    },
    discount: {
        fontSize: 14,
        color: "#2e7d32",
        fontWeight: "bold"
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    viewButton: {
        backgroundColor: "#305797",
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 6
    },
    removeButton: {
        backgroundColor: "#992A46",
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 6
    },
    viewButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold"
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 16
    },
    searchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f6f8fc",
        borderRadius: 22,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "#dbe3ef"
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 13,
        color: "#333",
    },
    dropdownGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    dropdownButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eef3fb",
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#d6e0f0"
    },
    dropdownIcon: {
        marginLeft: 6
    },
})

export default WishlistStyle