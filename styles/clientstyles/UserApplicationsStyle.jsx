import { StyleSheet, Platform } from "react-native";

const UserApplicationsStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fa"
    },
    // 🔥 FIXED: Header now matches the clean, blue TRAVEX style
    headerContainer: {
        marginBottom: 16,
        marginTop: 10,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 22,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginBottom: 6
    },
    subtitle: {
        fontSize: 14,
        fontFamily: "Roboto_400Regular",
        color: "#6b7280",
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontFamily: "Roboto_400Regular",
        fontSize: 14,
        color: '#1f2937',
    },
    filterScroll: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    filterPillActive: {
        backgroundColor: '#305797',
        borderColor: '#305797',
    },
    filterPillText: {
        fontSize: 13,
        fontFamily: "Montserrat_600SemiBold",
        color: "#4b5563",
    },
    filterPillTextActive: {
        color: "#fff",
    },
    listContainer: {
        padding: 20,
        paddingTop: 0,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 2 }
        })
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    refText: {
        fontSize: 13,
        fontFamily: "Roboto_500Medium",
        color: "#6b7280",
        marginBottom: 4,
    },
    nameText: {
        fontSize: 16,
        fontFamily: "Montserrat_600SemiBold",
        color: "#1f2937",
    },
    statusTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 11,
        fontFamily: "Roboto_700Bold",
        textTransform: 'uppercase',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    dateLabel: {
        fontSize: 12,
        fontFamily: "Roboto_400Regular",
        color: "#9ca3af",
    },
    dateText: {
        fontSize: 13,
        fontFamily: "Roboto_500Medium",
        color: "#4b5563",
        marginTop: 2,
    },
    viewButton: {
        backgroundColor: "#305797",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    viewButtonText: {
        color: "#fff",
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 13,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 15,
        color: "#6b7280",
        marginTop: 12,
    }
});

export default UserApplicationsStyle;