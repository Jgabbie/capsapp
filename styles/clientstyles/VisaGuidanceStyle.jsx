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
    // 🔥 NEW HERO BANNER STYLES (Added without changing anything else)
    heroSection: {
        height: 200,
        marginHorizontal: -20, // Stretches it to the edges ignoring the 20px padding
        marginTop: -20,        // Pushes it to the very top
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    heroTitleText: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 24,
        color: "#fff",
        marginBottom: 8,
        textAlign: 'center',
        zIndex: 1,
    },
    heroSubText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 13,
        color: "#fff",
        textAlign: 'center',
        lineHeight: 20,
        zIndex: 1,
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
        padding: 16,
        ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 2 }
        })
    },
    cardContent: {
        flex: 1,
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
        lineHeight: 20,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    price: {
        fontSize: 15,
        fontFamily: "Montserrat_700Bold",
        color: "#1f2937",
    },
    applyText: {
        color: "#305797",
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 14,
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