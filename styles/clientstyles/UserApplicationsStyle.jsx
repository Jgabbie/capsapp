import { StyleSheet, Platform } from "react-native";

const UserApplicationsStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fa"
    },
    title: {
        fontSize: 22,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginBottom: 6
    },
    subtitle: {
        fontSize: 13,
        color: "#6b7280",
        fontFamily: "Roboto_400Regular",
        marginBottom: 20,
    },


    // --- Search & Filter ---
    filterSection: {
        marginBottom: 24,
        gap: 12,
    },
    filterLabel: {
        fontSize: 12,
        fontFamily: "Montserrat_600SemiBold",
        color: "#1e293b",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#d9d9d9",
        height: 42,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontFamily: "Roboto_400Regular",
        fontSize: 10,
        color: "#333",
    },
    dropdownGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    dropdownButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#d9d9d9",
        height: 40,
        paddingHorizontal: 12,
    },
    dropdownText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 10,
        color: "#333",
    },
    clearFilterBtn: {
        justifyContent: 'center',
        alignItems: 'center',
    },


    // --- Application Cards ---
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
            android: { elevation: 2 },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    // FIXED: This forces the text to take up remaining space, pushing the badge to the edge without overflowing it
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
        maxWidth: 120, //  FIXED: Prevents the badge from stretching off the screen
    },
    statusText: {
        fontSize: 10, //  FIXED: Dropped size slightly so long words fit perfectly
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
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    modalTitleText: {
        fontSize: 16,
        color: '#111827',
        fontFamily: 'Montserrat_700Bold',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    modalStatusTag: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 7,
        backgroundColor: '#fff',
    },
    modalStatusTagSelected: {
        backgroundColor: '#eaf2ff',
        borderColor: '#305797',
    },
    modalStatusText: {
        fontSize: 13,
        color: '#4b5563',
        fontFamily: 'Roboto_500Medium',
    },
    modalStatusTextSelected: {
        color: '#305797',
        fontFamily: 'Roboto_700Bold',
    },



    dateModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    dateModalCard: {
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

    dateModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
    },

    dateModalHeaderContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12
    },

    dateModalHeaderIcon: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: '#edf3fc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },

    dateModalTitle: {
        fontFamily: 'Montserrat_700Bold',
        fontSize: 17,
        color: '#1e293b'
    },

    dateModalSubtitle: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 12,
        color: '#64748b',
        marginTop: 3
    },

    dateModalCloseButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center'
    },

    dateCalendar: {
        borderWidth: 1,
        borderColor: '#e8edf4',
        borderRadius: 18,
        paddingBottom: 6,
        overflow: 'hidden'
    },

    dateCalendarArrow: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#edf3fc',
        justifyContent: 'center',
        alignItems: 'center'
    },

    dateSelectedContainer: {
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

    dateSelectedIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },

    dateSelectedLabel: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 11,
        color: '#64748b'
    },

    dateSelectedValue: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 14,
        color: '#305797',
        marginTop: 1
    },

    dateModalActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16
    },

    dateModalCancelButton: {
        flex: 1,
        minHeight: 48,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: '#d8dee8',
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center'
    },

    dateModalCancelText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 13,
        color: '#64748b'
    },

    dateModalConfirmButton: {
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

    dateModalConfirmText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 13,
        color: '#ffffff'
    }

});

export default UserApplicationsStyle;