import { StyleSheet } from "react-native";

const BookingReviewStyle = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    container: {
        padding: 20,
    },
    headerGroup: {
        marginBottom: 20,
    },
    // The "Modern Travex" section look (24px rounded)
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e0e7ff',
        elevation: 4,
        shadowColor: "#1f2a44",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    pill: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: 'rgba(48, 87, 151, 0.12)',
    },
    pillText: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 10,
        color: "#305797",
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    sectionTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 18,
        color: "#1f2a44",
        marginTop: 5,
    },
    sectionSubtitle: {
        fontFamily: "Roboto_400Regular",
        fontSize: 12,
        color: "#6b7486",
        marginTop: 2,
    },
    // Itinerary Days
    itineraryDayBox: {
        padding: 15,
        borderRadius: 16,
        backgroundColor: '#f7f9ff',
        borderWidth: 1,
        borderColor: '#e4e9f8',
        marginBottom: 12,
    },
    dayLabel: {
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 14,
        color: "#1f2a44",
        marginBottom: 8,
    },
    activityRow: {
        flexDirection: 'row',
        marginBottom: 6,
        paddingLeft: 4,
    },
    activityBullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#305797',
        marginTop: 6,
        marginRight: 10,
    },
    activityText: {
        flex: 1,
        fontFamily: "Roboto_400Regular",
        fontSize: 13,
        color: "#3c465a",
        lineHeight: 18,
    },
    // Inclusions/Exclusions Grid
    gridRow: {
        flexDirection: 'row',
        gap: 12,
    },
    gridCol: {
        flex: 1,
        padding: 14,
        borderRadius: 16,
        backgroundColor: '#f9fafc',
        borderWidth: 1,
        borderColor: '#edf0f7',
    },
    gridTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 14,
        color: "#1f2a44",
        marginBottom: 10,
    },
    itemText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 12,
        color: "#3c465a",
        marginBottom: 5,
    },
    // --- NEW FOOTER BUTTON STYLES ---
    footerContainer: {
        marginTop: 10,
        paddingBottom: 50, // Extra space at the bottom to avoid phone buttons
        paddingHorizontal: 10,
    },
    smallProceedButton: {
        backgroundColor: '#305797',
        paddingVertical: 14, // Slimmer than the old bulky button but tall enough for a thumb
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    smallProceedButtonText: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 15, // Slightly bigger text
        color: "#ffffff",
    },
    backTextButton: {
        alignItems: 'center',
        paddingVertical: 12, // Bigger invisible box for easier tapping
    },
    backText: {
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 15, // Match the size
        color: "#6b7486",
    }
});

export default BookingReviewStyle;