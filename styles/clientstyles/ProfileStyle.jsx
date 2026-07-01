import { StyleSheet } from "react-native";

const ProfileStyle = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 40,
        backgroundColor: "#f5f7fa"
    },
    profileHeading: {
        fontSize: 24,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginBottom: 10,
        marginTop: 10,
    },
    profileImageContainer: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 20,
    },
    profileAvatarWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#eef2f7",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderWidth: 3,
        borderColor: "#fff",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    profileImage: {
        width: "100%",
        height: "100%",
    },
    profileAvatarPlaceholder: {
        fontSize: 36,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
    },
    changePhotoButton: {
        backgroundColor: "#305797",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 12,
    },
    changePhotoText: {
        color: "#fff",
        fontFamily: "Roboto_500Medium",
        fontSize: 14,
    },
    photoHelpText: {
        fontSize: 12,
        color: "#6b7280",
        fontFamily: "Roboto_400Regular",
        marginTop: 6,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 20,
    },
    profileLabel: {
        fontSize: 13,
        fontFamily: "Montserrat_500Medium",
        color: "#305797",
        marginBottom: 6,
        marginTop: 12,
    },
    personalInfoTitle: {
        fontSize: 18,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginBottom: 8,
        marginTop: 30,
    },
    profileInputs: {
        fontSize: 15,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: "#dbe3ef",
        paddingHorizontal: 12,
        height: 45,
        width: "100%",
        backgroundColor: "#fff",
        color: "#333",
        fontFamily: "Roboto_400Regular"
    },
    profileInputsDisabled: {
        backgroundColor: "#f3f4f6",
        color: "#6b7280",
    },
    profileInputsError: {
        borderColor: "#d9534f",
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        borderColor: "#dbe3ef",
        height: 45,
        width: "100%",
        backgroundColor: "#fff",
        overflow: 'hidden'
    },
    phonePrefix: {
        paddingHorizontal: 12,
        backgroundColor: '#f3f4f6',
        height: '100%',
        textAlignVertical: 'center',
        color: '#6b7280',
        fontFamily: "Roboto_400Regular",
        borderRightWidth: 1,
        borderRightColor: '#dbe3ef'
    },
    phoneInput: {
        flex: 1,
        paddingHorizontal: 12,
        paddingLeft: 12,
        fontSize: 15,
        fontFamily: "Roboto_400Regular",
        color: "#333",
    },
    fullNameContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    errorMessage: {
        color: "#d9534f",
        fontSize: 11,
        fontFamily: "Roboto_400Regular",
        marginTop: 4,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f6ffed',
        borderWidth: 1,
        borderColor: '#b7eb8f',
        padding: 12,
        borderRadius: 8,
        marginTop: 20,
    },
    verifiedText: {
        color: '#52c41a',
        fontFamily: "Montserrat_500Medium",
        fontSize: 14,
    },
    actionContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 25,
    },
    editButton: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#305797",
        height: 45,
        borderRadius: 8,
        width: "100%",
    },
    saveButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#305797",
        height: 45,
        borderRadius: 8,
    },
    saveButtonDisabled: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#94a3b8",
        height: 45,
        borderRadius: 8,
        opacity: 0.9,
    },
    cancelButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#992A46",
        height: 45,
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 15,
        fontFamily: "Montserrat_600SemiBold",
    },
    dropdownButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: "Montserrat_700Bold",
        color: "#333",
        marginTop: 10,
        marginBottom: 15,
        marginLeft: 5,
    },
    emptyStateCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 30,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        marginBottom: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyStateText: {
        color: "#6b7280",
        fontFamily: "Roboto_400Regular",
        fontSize: 15,
    },
    datePickerText: {
        flex: 1,
        fontFamily: "Roboto_400Regular",
        fontSize: 15,
    },
    // --- NEW PREFERENCES STYLES ---
    preferencesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    editPrefButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#305797',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        gap: 6,
    },
    editPrefButtonText: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 12,
    },
    prefSectionTitle: {
        fontFamily: 'Montserrat_700Bold',
        fontSize: 14,
        color: '#1f2937',
        marginBottom: 4,
    },
    prefSubText: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 14,
        color: '#6b7280',
        marginTop: 0,
        marginBottom: 20,
        lineHeight: 20,
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20, // Full rounded pill
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#fff',
    },
    chipSelected: {
        backgroundColor: '#305797', // Dark Blue from Web
        borderColor: '#305797',
    },
    chipText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 13,
        color: '#4b5563',
    },
    chipTextSelected: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
    },
    removedNote: {
        color: '#dc2626',
        fontSize: 12,
        marginTop: 6,
        fontFamily: 'Montserrat_400Regular',
    },
    roleSubtitle: {
        fontSize: 13,
        fontFamily: "Montserrat_600SemiBold",
        color: "#305797",
        textAlign: "center",
        marginTop: -10,  // This pulls it up closer to the name
        marginBottom: 20 // Pushes the Personal Info card down a bit
    },

    datePickerModal: {
        width: '92%',
        maxWidth: 430,
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 18,
        elevation: 12,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 8
        },
        shadowOpacity: 0.18,
        shadowRadius: 16
    },

    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
    },

    datePickerHeaderContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12
    },

    datePickerIconContainer: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: '#edf3fc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },

    datePickerModalTitle: {
        fontFamily: 'Montserrat_700Bold',
        fontSize: 17,
        color: '#1e293b'
    },

    datePickerModalSubtitle: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 12,
        color: '#64748b',
        marginTop: 3
    },

    datePickerCloseButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center'
    },

    calendarContainer: {
        borderWidth: 1,
        borderColor: '#e8edf4',
        borderRadius: 18,
        paddingBottom: 6,
        overflow: 'hidden'
    },

    calendarArrow: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#edf3fc',
        justifyContent: 'center',
        alignItems: 'center'
    },

    selectedDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f5fc',
        borderWidth: 1,
        borderColor: '#dce7f7',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 11,
        marginTop: 14
    },

    selectedDateIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },

    selectedDateLabel: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 11,
        color: '#64748b'
    },

    selectedDateValue: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 14,
        color: '#305797',
        marginTop: 1
    },

    datePickerActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16
    },

    datePickerCancelButton: {
        flex: 1,
        minHeight: 48,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: '#d8dee8',
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center'
    },

    datePickerCancelText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 13,
        color: '#64748b'
    },

    datePickerConfirmButton: {
        flex: 1.4,
        minHeight: 48,
        borderRadius: 13,
        backgroundColor: '#305797',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 7,
        elevation: 2
    },

    datePickerConfirmText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 13,
        color: '#ffffff'
    }
});

export default ProfileStyle;