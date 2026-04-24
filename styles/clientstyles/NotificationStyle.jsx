import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#f5f7fa", 
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40
    },
    headerContainer: {
        marginBottom: 20,
        marginTop: 10,
    },
    title: { 
        fontSize: 24, 
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
        flexDirection: "row", 
        alignItems: "center",
        backgroundColor: "#fff", 
        borderRadius: 8,
        paddingHorizontal: 12, 
        height: 48,
        borderWidth: 1, 
        borderColor: "#e5e7eb", 
        marginBottom: 20
    },
    searchInput: { 
        flex: 1, 
        marginLeft: 10, 
        fontSize: 14, 
        color: "#1f2937", 
        fontFamily: "Roboto_400Regular" 
    },
    notifCard: {
        padding: 16, 
        borderRadius: 10, 
        backgroundColor: "#fff",
        marginBottom: 12, 
        borderWidth: 1, 
        borderColor: "#e5e7eb",
        flexDirection: 'row', 
        alignItems: 'flex-start',
    },
    unreadCard: { 
        backgroundColor: "#f0f9ff", // Very subtle blue tint for unread
        borderColor: "#bae6fd" 
    },
    dotContainer: {
        marginRight: 12,
        marginTop: 6, // Aligns the dot with the first line of text
    },
    dotUnread: { 
        width: 10, 
        height: 10, 
        borderRadius: 5, 
        backgroundColor: "#305797" // Blue for unread
    },
    dotRead: { 
        width: 10, 
        height: 10, 
        borderRadius: 5, 
        backgroundColor: "#cbd5e1" // Grey for read
    },
    content: { 
        flex: 1 
    },
    notifTitle: { 
        fontFamily: "Montserrat_600SemiBold", 
        fontSize: 15, 
        color: "#1f2937",
        marginBottom: 4
    },
    notifMessage: { 
        fontFamily: "Roboto_400Regular", 
        fontSize: 14, 
        color: "#4b5563", 
        marginBottom: 8,
        lineHeight: 20
    },
    time: { 
        fontSize: 12, 
        color: "#9ca3af", 
        fontFamily: "Roboto_400Regular" 
    },
    emptyContainer: { 
        alignItems: "center", 
        justifyContent: "center",
        paddingVertical: 60 
    },
    emptyText: { 
        fontFamily: "Roboto_400Regular", 
        color: "#6b7280", 
        marginTop: 12,
        fontSize: 15
    },
    markAllText: {
        fontSize: 13,
        fontFamily: "Roboto_500Medium",
        color: "#305797",
        textDecorationLine: 'underline'
    },
});