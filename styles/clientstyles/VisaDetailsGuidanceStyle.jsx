import { StyleSheet, Platform } from "react-native";

const VisaDetailsGuidanceStyle = StyleSheet.create({
    container: {
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
    stepRow: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    stepNumberContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#305797',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepNumber: {
        color: '#fff',
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 14,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 14,
        fontFamily: "Montserrat_600SemiBold",
        color: "#1f2937",
        marginBottom: 4,
    },
    stepDesc: {
        fontSize: 13,
        fontFamily: "Roboto_400Regular",
        color: "#6b7280",
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
    textArea: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontFamily: "Roboto_400Regular",
        fontSize: 15,
        color: '#1f2937',
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 24,
    },
    // 🔥 NEW: Styles for the Upload section
    uploadRow: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    uploadLabel: {
        flex: 1,
        fontSize: 13,
        fontFamily: "Roboto_500Medium",
        color: "#1f2937",
        marginRight: 10
    },
    uploadButton: {
        backgroundColor: "#305797",
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        justifyContent: "center",
        alignItems: "center"
    },
    uploadButtonText: {
        color: "#fff",
        fontSize: 12,
        fontFamily: "Montserrat_600SemiBold"
    },
    fileNameText: {
        fontSize: 12,
        color: '#0284c7', // light blue
        marginBottom: 12,
        fontFamily: "Roboto_400Regular",
        paddingHorizontal: 4
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
    faqTitle: {
        fontSize: 15,
        fontFamily: "Montserrat_600SemiBold",
        color: "#1f2937",
        marginBottom: 6,
    },
    faqDesc: {
        fontSize: 14,
        fontFamily: "Roboto_400Regular",
        color: "#4b5563",
        marginBottom: 16,
        lineHeight: 20,
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