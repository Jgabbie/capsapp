import { StyleSheet, Platform } from "react-native";

const VisaGuidanceStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fa" 
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40
    },
    headerContainer: {
        marginBottom: 16,
        marginTop: 10,
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
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: 24,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontFamily: "Roboto_400Regular",
        fontSize: 15,
        color: '#1f2937',
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 2 }
        })
    },
    cardContent: {
        flex: 1,
        paddingRight: 16,
    },
    visaTitle: {
        fontSize: 18,
        fontFamily: "Montserrat_600SemiBold",
        color: "#1f2937",
        marginBottom: 4
    },
    description: {
        fontSize: 14,
        color: "#6b7280",
        fontFamily: "Roboto_400Regular",
        marginBottom: 8,
    },
    price: {
        fontSize: 14,
        fontFamily: "Montserrat_700Bold",
        color: "#4b5563",
    },
    applyButton: {
        backgroundColor: "#305797",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyText: {
        color: "#fff",
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 14
    },
    emptyText: {
        textAlign: 'center',
        color: '#6b7280',
        fontFamily: "Roboto_400Regular",
        marginTop: 40,
        fontSize: 16
    }
});

export default VisaGuidanceStyle;