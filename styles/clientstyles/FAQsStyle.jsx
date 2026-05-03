import { StyleSheet, Platform } from "react-native";

const FAQsStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fa"
    },
    scrollContent: {
        paddingBottom: 120
    },
    heroSection: {
        paddingVertical: 50,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginBottom: 20,
        overflow: 'hidden'
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)', 
    },
    heroTitle: {
        fontSize: 26,
        fontFamily: "Montserrat_700Bold",
        color: "#ffffff",
        marginBottom: 8,
        textAlign: "center",
        zIndex: 1
    },
    heroSubtitle: {
        fontSize: 14,
        fontFamily: "Roboto_400Regular",
        color: "#ffffff",
        textAlign: "center",
        paddingHorizontal: 10,
        zIndex: 1
    },
    introSection: {
        paddingHorizontal: 20,
        marginBottom: 18,
    },
    introTitle: {
        fontSize: 22,
        fontFamily: "Montserrat_700Bold",
        color: "#1f3b66",
        marginBottom: 6,
    },
    introSubtitle: {
        fontSize: 13,
        fontFamily: "Roboto_400Regular",
        color: "#6b7280",
        lineHeight: 19,
    },
    filterScroll: {
        paddingHorizontal: 20,
        paddingBottom: 15,
        gap: 10
    },
    filterPill: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#d8e1f0",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
    },
    filterPillActive: {
        backgroundColor: "#305797",
        borderColor: "#305797",
    },
    filterPillText: {
        fontSize: 13,
        fontFamily: "Montserrat_600SemiBold",
        color: "#1f3b66"
    },
    filterPillTextActive: {
        color: "#fff"
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 14,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginHorizontal: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: "#edf1f7",
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        fontFamily: "Roboto_400Regular",
        color: "#333",
        padding: 0,
    },
    faqListContainer: {
        paddingHorizontal: 20,
    },
    accordionWrapper: {
        backgroundColor: "#fff",
        borderRadius: 14,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: "#edf1f7",
        overflow: "hidden"
    },
    accordionItem: {
        borderBottomWidth: 1,
        borderBottomColor: "#edf1f7",
    },
    accordionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 18,
    },
    questionText: {
        fontSize: 15,
        fontFamily: "Montserrat_600SemiBold",
        color: "#1f3b66",
        flex: 1,
        paddingRight: 10
    },
    accordionBody: {
        paddingHorizontal: 18,
        paddingBottom: 18,
        paddingTop: 0
    },
    answerText: {
        fontSize: 14,
        fontFamily: "Roboto_400Regular",
        color: "#4b5563",
        lineHeight: 22
    },
    emptyState: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 30,
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: "#edf1f7",
    },
    emptyTitle: {
        fontSize: 16,
        fontFamily: "Montserrat_600SemiBold",
        color: "#1f3b66",
        marginBottom: 8
    },
    emptySub: {
        fontSize: 13,
        fontFamily: "Roboto_400Regular",
        color: "#6b7280",
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 20
    },
    contactBtn: {
        backgroundColor: "#305797",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8
    },
    contactBtnText: {
        color: "#fff",
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 14
    }
});

export default FAQsStyle;