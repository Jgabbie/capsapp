import { StyleSheet } from "react-native";

const UserBookingsStyle = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 20,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginBottom: 5,
        paddingLeft: 5,
    },
    subtitle: {
        fontSize: 13,
        fontFamily: "Roboto_400Regular",
        color: "#777",
        marginBottom: 20,
        paddingLeft: 5,
    },

    // --- SEARCH & FILTERS ---
    searchRow: {
        marginBottom: 24,
        gap: 12,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#d9d9d9",
        height: 42,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontFamily: "Roboto_400Regular",
        fontSize: 13,
        color: "#333",
    },
    filterRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    dropdownButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#d9d9d9",
        height: 40,
        paddingHorizontal: 12,
    },
    dropdownText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 10,
        color: "#333",
    },

    // --- MODAL STYLES ---
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
        alignItems: 'center',
        width: '100%'
    },
    modalOptionText: {
        fontSize: 16,
        color: '#305797',
        fontFamily: 'Roboto_500Medium'
    },

    // --- BOOKING CARDS ---
    bookingCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1, borderColor: "#eee",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        paddingBottom: 10,
        marginBottom: 12,
    },
    bookingRef: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 12,
        color: "#777",
        textTransform: 'uppercase',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    bookingStatus: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 11,
    },
    packageName: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 16,
        color: "#305797",
        marginBottom: 8,
    },
    detailText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 13,
        color: "#555",
        marginBottom: 4,
    },
    cardActions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 10,
    },
    viewButton: {
        flex: 1,
        backgroundColor: "#305797",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    // 🔥 FIXED: Bloody red background
    cancelButton: {
        flex: 1,
        backgroundColor: "#8B0000",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#8B0000",
    },
    viewButtonText: {
        color: "#fff",
        fontFamily: "Montserrat_700Bold",
        fontSize: 12,
    },
    cancelButtonText: {
        color: "#fff",
        fontFamily: "Montserrat_700Bold",
        fontSize: 12,
    },

    // --- EMPTY STATE STYLES ---
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyImage: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
        opacity: 0.8,
    },
    emptyText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 16,
        color: '#999',
        marginTop: 15,
    }
});

export default UserBookingsStyle;