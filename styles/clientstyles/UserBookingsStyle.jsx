import { StyleSheet } from "react-native";

const UserBookingsStyle = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f7fa", // Light background to make white cards pop
    },
    title: {
        fontSize: 24,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: "Roboto_400Regular",
        color: "#777",
        marginBottom: 20,
    },

    // --- SEARCH & FILTERS (CLONED FROM HOME/WISHLIST) ---
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
        height: 40,
        borderWidth: 1,
        borderColor: "#dbe3ef",
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        fontFamily: "Roboto_400Regular",
        color: "#333",
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
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#dbe3ef",
        minWidth: 100,
        justifyContent: 'space-between'
    },
    modalOption: {
        paddingVertical: 12,
        width: '100%',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    dropdownText: {
        fontSize: 11, 
        color: "#305797",
        fontFamily: "Montserrat_700Bold",
        marginRight: 4
    },

    // --- BOOKING CARDS ---
    bookingCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 3, // Android shadow
        shadowColor: "#000", // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: "#eee",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        paddingBottom: 8,
    },
    bookingRef: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 13,
        color: "#777",
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: "#ecfdf5", // Default light green bg
    },
    bookingStatus: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 11,
        color: "#10b981", // Default green
        textTransform: "uppercase",
    },
    cardBody: {
        marginBottom: 15,
    },
    packageName: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 18,
        color: "#305797",
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 6,
    },
    detailText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 13,
        color: "#555",
    },
    priceLabel: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 14,
        color: "#333",
        marginTop: 5,
    },

    // --- ACTIONS ---
    cardActions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 5,
    },
    viewButton: {
        flex: 1,
        backgroundColor: "#305797",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#fff",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ff4d4f",
    },
    viewButtonText: {
        color: "#fff",
        fontFamily: "Montserrat_700Bold",
        fontSize: 13,
    },
    cancelButtonText: {
        color: "#ff4d4f",
        fontFamily: "Montserrat_700Bold",
        fontSize: 13,
    },

    // --- EMPTY STATE ---
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontFamily: "Montserrat_500Medium",
        fontSize: 16,
        color: '#999',
        marginTop: 10,
    }
});

export default UserBookingsStyle;