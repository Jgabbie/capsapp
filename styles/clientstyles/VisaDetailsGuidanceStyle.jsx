import { StyleSheet, Platform } from "react-native";

const VisaDetailsGuidanceStyle = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f7fa"
    },
    headerContainer: {
        marginBottom: 24,
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
    contentRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    columnCard: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        width: '100%',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: "Montserrat_600SemiBold",
        color: "#305797",
        marginBottom: 16
    },

    // Badges for (Required) and (Optional)
    badgeText: {
        fontSize: 13,
        fontFamily: "Roboto_500Medium",
        marginLeft: 8,
    },
    reqBadge: {
        color: '#dc2626', // Red color for Required
    },
    optBadge: {
        color: '#6b7280', // Gray color for Optional
    },

    // Visa Fee Badge Styling
    feeBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginTop: 6,
        marginBottom: 14,
        borderRadius: 999,
        backgroundColor: 'rgba(48, 87, 151, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(48, 87, 151, 0.25)',
    },
    feeBadgeText: {
        color: '#305797',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 13,
    },

    // Link styling for Korea Visa Application form
    linkText: {
        fontSize: 13,
        fontFamily: "Roboto_500Medium",
        color: "#305797",
        textDecorationLine: 'underline',
        marginBottom: 4
    },

    emptyText: {
        fontSize: 14,
        fontFamily: "Roboto_400Regular",
        color: "#6b7280",
        fontStyle: 'italic'
    },

    requirementItem: {
        backgroundColor: '#f8fafc',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    requirementText: {
        fontSize: 14,
        fontFamily: "Roboto_500Medium",
        color: "#1f2937"
    },
    requirementSubText: {
        fontSize: 13,
        fontFamily: "Roboto_400Regular",
        color: "#6b7280",
        marginTop: 4,
    },

    // Required Subheading (like h4 in web)
    requiredSubheading: {
        fontSize: 16,
        fontFamily: "Montserrat_700Bold",
        color: "#1f2937",
        marginBottom: 12,
        marginTop: 0,
    },

    // Open Application Link button
    openApplicationLinkText: {
        fontSize: 14,
        fontFamily: "Roboto_500Medium",
        color: "#305797",
        textDecorationLine: 'underline',
    },

    // Process Steps Styling
    stepItemCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eef2f7',
        padding: 12,
        marginBottom: 10,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    stepNumberContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#305797',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        marginTop: 2,
    },
    stepNumber: {
        color: '#fff',
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 12,
    },
    stepContent: {
        flex: 1,
        justifyContent: 'center'
    },
    stepLabel: {
        fontSize: 12,
        fontFamily: "Montserrat_600SemiBold",
        color: "#305797",
        marginBottom: 2,
    },
    stepTitle: {
        fontSize: 15,
        fontFamily: "Montserrat_600SemiBold",
        color: "#1f2937",
    },
    stepDesc: {
        fontSize: 12,
        fontFamily: "Roboto_400Regular",
        color: "#6b7280",
        marginTop: 4,
        lineHeight: 17,
    },

    formLabel: {
        fontSize: 14,
        fontFamily: "Roboto_500Medium",
        color: "#374151",
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: 20,
    },
    inputText: {
        flex: 1,
        fontFamily: "Roboto_400Regular",
        fontSize: 15,
        color: '#1f2937',
    },
    inputTextPlaceholder: {
        color: '#9ca3af',
    },
    submitButton: {
        backgroundColor: "#305797",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        alignSelf: 'flex-start',
        paddingHorizontal: 24,
        marginTop: 10
    },
    submitText: {
        color: "#fff",
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 15
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
        overflow: 'hidden'
    },
    modalIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#e0f2fe',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 10
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: "Montserrat_700Bold",
        color: "#1f2937",
        marginBottom: 12,
        textAlign: 'center',
    },
    modalDesc: {
        fontSize: 15,
        fontFamily: "Roboto_400Regular",
        color: "#4b5563",
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
        paddingHorizontal: 20
    },
    modalButton: {
        backgroundColor: "#305797",
        paddingVertical: 14,
        borderRadius: 8,
        width: '80%',
        alignItems: 'center',
        marginBottom: 20
    },
    modalButtonText: {
        color: "#fff",
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 16
    }
});

export default VisaDetailsGuidanceStyle;