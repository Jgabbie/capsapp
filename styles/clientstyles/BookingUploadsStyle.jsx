import { StyleSheet } from "react-native";

const BookingUploadsStyle = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    container: {
        padding: 20,
    },
    // The yellow warning box from your web CSS
    notesBox: {
        backgroundColor: '#fffbe6',
        borderWidth: 1,
        borderColor: '#ffe58f',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
    },
    notesTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 14,
        color: "#000000",
        marginBottom: 8,
    },
    bulletRow: {
        flexDirection: 'row',
        marginBottom: 4,
        paddingRight: 10,
    },
    bullet: {
        fontSize: 12,
        color: "#000000",
        marginRight: 6,
        lineHeight: 18,
    },
    notesText: {
        flex: 1,
        fontFamily: "Roboto_400Regular",
        fontSize: 12,
        color: "#000000",
        lineHeight: 18,
    },
    // The Traveler Card
    uploadCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e7ecf7',
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    travelerHeader: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 16,
        color: "#305797",
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 10,
    },
    uploadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    uploadSlot: {
        flex: 1,
        alignItems: 'center',
    },
    slotLabel: {
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 11,
        color: "#4e5b72",
        marginBottom: 8,
        textAlign: 'center',
    },
    // The Dashed Box (.upload-passport-dragger)
    dragger: {
        width: '100%',
        aspectRatio: 1,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#305797',
        borderRadius: 12,
        backgroundColor: '#f9faff',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    draggerActive: {
        backgroundColor: '#eef3ff',
        borderStyle: 'solid',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(255, 77, 79, 0.9)',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
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
        fontSize: 15, 
        color: "#ffffff",
    },
    backTextButton: {
        alignItems: 'center',
        paddingVertical: 12, // Bigger invisible box for easier tapping
    },
    backText: {
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 15,
        color: "#6b7486",
    }
});

export default BookingUploadsStyle;