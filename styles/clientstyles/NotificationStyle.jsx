import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 20 },
    title: { fontSize: 24, fontFamily: "Montserrat_700Bold", color: "#305797", marginBottom: 15 },
    searchBar: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#f6f8fc", borderRadius: 25,
        paddingHorizontal: 15, height: 48,
        borderWidth: 1, borderColor: "#dbe3ef", marginBottom: 20
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: "#333", fontFamily: "Roboto_400Regular" },
    notifCard: {
        padding: 16, borderRadius: 15, backgroundColor: "#fff",
        marginBottom: 12, borderWidth: 1, borderColor: "#eee",
        flexDirection: 'row', alignItems: 'center',
        ...Platform.select({ android: { elevation: 2 }, ios: { shadowOpacity: 0.1, shadowRadius: 5 } })
    },
    unreadCard: { backgroundColor: "#f0f4ff", borderColor: "#305797" },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#305797", marginRight: 12 },
    content: { flex: 1 },
    notifTitle: { fontFamily: "Montserrat_700Bold", fontSize: 15, color: "#333" },
    notifMessage: { fontFamily: "Roboto_400Regular", fontSize: 13, color: "#666", marginTop: 4 },
    time: { fontSize: 10, color: "#999", marginTop: 6, fontFamily: "Roboto_400Regular" },
    emptyContainer: { alignItems: "center", marginTop: 100 },
    emptyText: { fontFamily: "Roboto_400Regular", color: "#999", marginTop: 15 }
});