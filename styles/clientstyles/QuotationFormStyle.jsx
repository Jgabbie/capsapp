import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get('window');

const QuotationFormStyle = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 100,
        backgroundColor: "#f5f7fa",
        flexGrow: 1
    },

    // --- SECTIONS & CARDS ---
    section: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#e0e7ff",
        shadowColor: "#1f2a44",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 18,
        elevation: 2,
    },
    sectionGradient: {
        backgroundColor: "#f7faff", 
    },
    sectionTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 22,
        color: "#1f2a44",
        marginBottom: 6
    },
    sectionSubtitle: {
        fontFamily: "Roboto_400Regular",
        fontSize: 13,
        color: "#4e5b72",
        lineHeight: 18
    },

    // --- PACKAGE INFO DISPLAY ---
    infoCard: {
        backgroundColor: "#ffffff",
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: "#ffffff",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
    },
    coverImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 16,
        backgroundColor: '#f2f5fb'
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8
    },
    infoTag: {
        backgroundColor: "#305797",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    infoTagText: {
        color: "white",
        fontSize: 10,
        fontFamily: "Montserrat_700Bold",
    },
    packageTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 18,
        color: "#1a1a1a",
        flex: 1
    },
    packageDesc: {
        fontFamily: "Roboto_400Regular",
        fontSize: 13,
        color: "#555",
        lineHeight: 20,
        marginBottom: 15
    },

    // --- LISTS (Inclusions/Exclusions) ---
    listContainer: {
        backgroundColor: "#f7f9ff",
        borderWidth: 1,
        borderColor: "#e7ecf7",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10
    },
    listTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 12,
        color: "#305797",
        textTransform: "uppercase",
        marginBottom: 8
    },
    listItemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 4
    },
    listBullet: {
        fontSize: 14,
        color: "#1f2a44",
        marginRight: 6,
        lineHeight: 18
    },
    listItemText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 12,
        color: "#1f2a44",
        flex: 1,
        lineHeight: 18
    },

    // --- ARRANGEMENT SELECTION ---
    selectionLabel: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 13,
        color: "#305797",
        marginBottom: 12
    },
    selectionCard: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e7ecf7",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2
    },
    selectionCardActive: {
        borderColor: "#305797",
        backgroundColor: "#f0f5ff",
    },
    selectionTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 15,
        color: "#333",
        marginBottom: 4
    },
    selectionDesc: {
        fontFamily: "Roboto_400Regular",
        fontSize: 12,
        color: "#666",
        lineHeight: 16
    },

    // --- 🔥 NEW: TRAVELER COUNTERS 🔥 ---
    travelerCounterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    travelerCounterLabel: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 14,
        color: '#333',
    },
    travelerCounterControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    travelerCounterBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f5ff',
        borderWidth: 1,
        borderColor: '#d6e4ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    travelerCounterBtnText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#305797',
    },
    travelerCounterValue: {
        fontFamily: 'Montserrat_700Bold',
        fontSize: 15,
        color: '#333',
        width: 20,
        textAlign: 'center',
    },

    // --- FORM INPUTS ---
    inputGroup: {
        marginBottom: 16
    },
    inputLabel: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 11,
        color: "#5b677a",
        textTransform: "uppercase",
        marginBottom: 8
    },
    textInput: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#d9d9d9",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontFamily: "Roboto_400Regular",
        fontSize: 14,
        color: "#333"
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top'
    },
    inputErrorBorder: {
        borderColor: "#e74c3c"
    },
    errorText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 11,
        color: "#e74c3c",
        marginTop: 4
    },
    helperNote: {
        fontFamily: "Roboto_400Regular",
        fontSize: 11,
        color: "#5b677a",
        marginTop: 4,
        fontStyle: 'italic'
    },

    // --- DROPDOWNS (Mimicking Ant Design) ---
    dropdownButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#d9d9d9",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    dropdownText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 14,
        color: "#333"
    },
    dropdownPlaceholder: {
        color: "#bfbfbf"
    },

    // --- BUDGET SLIDER ---
    budgetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    budgetValue: {
        fontFamily: "Roboto_500Medium",
        fontSize: 13,
        color: "#305797"
    },

    // --- FLIGHT NOTE ---
    flightNoteBox: {
        backgroundColor: "#e6f0ff",
        borderLeftWidth: 4,
        borderLeftColor: "#305797",
        padding: 12,
        borderRadius: 6,
        marginTop: 10
    },
    flightNoteText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 12,
        color: "#333",
        lineHeight: 18
    },

    // --- FIXED ITINERARY ---
    itineraryDayBox: {
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#e7ecf7"
    },
    itineraryDayTitle: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 14,
        color: "#305797",
        marginBottom: 8
    },

    // --- SUBMIT BUTTON ---
    submitButton: {
        backgroundColor: "#305797",
        borderRadius: 10,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#305797",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4
    },
    submitButtonText: {
        fontFamily: "Montserrat_700Bold",
        color: "#fff",
        fontSize: 15
    }
});

export default QuotationFormStyle;