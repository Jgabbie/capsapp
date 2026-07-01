import { StyleSheet } from "react-native";

const UserBookingsStyle = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: "#f5f7fa",
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
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        alignItems: "center",
        gap: 10,
    },
    filterLabel: {
        fontSize: 12,
        fontFamily: "Montserrat_600SemiBold",
        color: "#1e293b",
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
        gap: 5,
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
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#305797",
        borderRadius: 8,
        alignItems: "center",
        paddingVertical: 10,
    },

    cancelButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#8B0000",
        borderRadius: 8,
        alignItems: "center",
        paddingVertical: 10,
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
    },





    modalCard: {
        width: '92%',
        maxWidth: 430,
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 18,
        elevation: 12,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 8
        },
        shadowOpacity: 0.18,
        shadowRadius: 16
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
    },

    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12
    },

    headerIcon: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: '#edf3fc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },

    titleModal: {
        fontFamily: 'Montserrat_700Bold',
        fontSize: 17,
        color: '#1e293b'
    },

    subtitleModal: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 12,
        color: '#64748b',
        marginTop: 3
    },

    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center'
    },

    calendar: {
        borderWidth: 1,
        borderColor: '#e8edf4',
        borderRadius: 18,
        paddingBottom: 6,
        overflow: 'hidden'
    },

    arrow: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#edf3fc',
        justifyContent: 'center',
        alignItems: 'center'
    },

    selectedDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f5fc',
        borderWidth: 1,
        borderColor: '#dce7f7',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 11,
        marginTop: 14
    },

    selectedDateIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },

    selectedDateLabel: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 11,
        color: '#64748b'
    },

    selectedDateValue: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 14,
        color: '#305797',
        marginTop: 1
    },

    actions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16
    },

    cancelButtonModal: {
        flex: 1,
        minHeight: 48,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: '#d8dee8',
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center'
    },

    cancelTextModal: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 13,
        color: '#64748b'
    },

    confirmButton: {
        flex: 1.4,
        minHeight: 48,
        borderRadius: 13,
        backgroundColor: '#305797',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 7,
        elevation: 2
    },

    confirmText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 13,
        color: '#ffffff'
    }
});

export default UserBookingsStyle;