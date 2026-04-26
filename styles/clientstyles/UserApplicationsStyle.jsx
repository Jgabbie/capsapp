import { StyleSheet, Platform } from "react-native";

const UserApplicationsStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fa"
    },
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
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
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
    // 🔥 FIXED: This forces the text to take up remaining space, pushing the badge to the edge without overflowing it
    headerLeft: {
        flex: 1,
        marginRight: 12,
    },
    typeLabel: {
        fontSize: 12,
        fontFamily: "Roboto_500Medium",
        color: "#6b7280",
        marginBottom: 4,
    },
    applicationName: {
        fontSize: 16,
        fontFamily: "Montserrat_700Bold",
        color: "#1f2937",
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 120, // 🔥 FIXED: Prevents the badge from stretching off the screen
    },
    statusText: {
        fontSize: 10, // 🔥 FIXED: Dropped size slightly so long words fit perfectly
        fontFamily: "Roboto_700Bold",
        textTransform: 'uppercase',
        textAlign: 'center',
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
        paddingHorizontal: 20, 
        paddingVertical: 10,   
        borderRadius: 6,
        minWidth: 80, 
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewButtonText: {
        color: "#fff",
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 13
    }
});

export default UserApplicationsStyle;