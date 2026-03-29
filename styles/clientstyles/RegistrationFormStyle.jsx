import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const RegistrationFormStyle = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#525659', 
    },
    scrollViewContent: {
        paddingVertical: 20,
        paddingBottom: 100, // 🔥 This fixes the unclickable button issue
    },
    paperPage: {
        backgroundColor: '#fff',
        width: width * 0.95,
        alignSelf: 'center',
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        minHeight: 800,
    },
    logo: {
        width: 120,
        height: 60,
        resizeMode: 'contain',
        alignSelf: 'center',
        marginBottom: 10,
    },
    headerGold: {
        backgroundColor: '#FFD700',
        borderWidth: 1,
        borderColor: '#000',
        paddingVertical: 5,
        alignItems: 'center',
        marginVertical: 10,
    },
    headerGoldText: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 14,
        color: '#000',
    },
    headerBlue: {
        backgroundColor: '#ADD8E6',
        borderWidth: 1,
        borderColor: '#000',
        paddingVertical: 4,
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 10,
    },
    headerBlueText: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 12,
        color: '#000',
    },
    inputContainer: {
        marginBottom: 10,
    },
    label: {
        fontSize: 9,
        fontFamily: "Montserrat_700Bold",
        color: '#000',
        marginBottom: 2,
    },
    paperInput: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        height: 25,
        fontSize: 11,
        padding: 0,
        color: '#000',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    // Table Styling
    tableWrapper: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#000',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#e6f7ff',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    tableDataRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    columnHeader: {
        fontSize: 8,
        fontFamily: "Montserrat_700Bold",
        padding: 4,
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    cellInput: {
        fontSize: 9,
        padding: 2,
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#ddd',
        height: 30,
    },
    // Info Blocks at the bottom
    infoBlocksRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 15,
    },
    infoBlockLeft: {
        flex: 1,
    },
    infoBlockRight: {
        flex: 1,
    },
    guideTitle: {
        fontSize: 9,
        fontFamily: "Montserrat_700Bold",
        color: '#d32f2f', // Red title
        marginBottom: 4,
    },
    guideNote: {
        fontSize: 7.5,
        fontStyle: 'italic',
        color: '#000',
        marginBottom: 4,
    },
    guideRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    guideLabel: {
        fontSize: 8,
        fontFamily: "Montserrat_700Bold",
        width: 70,
    },
    guideDesc: {
        fontSize: 8,
        flex: 1,
    },
    legalText: {
        fontSize: 8,
        lineHeight: 12,
        marginBottom: 8,
        textAlign: 'justify',
    },
    // Signature
    signatureBlock: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 20,
    },
    sigLine: {
        flex: 1,
        alignItems: 'center',
    },
    sigText: {
        fontSize: 9,
        fontFamily: "Montserrat_700Bold",
        marginTop: 5,
    },
    // --- Custom Dropdown Modal Styles ---
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    dropdownBox: {
        backgroundColor: '#fff',
        width: 250,
        borderRadius: 12,
        padding: 10,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    dropdownItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        alignItems: 'center',
    },
    dropdownText: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 16,
        color: '#305797',
    },
    // --- Validation & Footer Styles ---
    errorText: {
        color: '#d32f2f',
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 10,
        marginTop: 5,
        marginLeft: 5,
    },
    footerContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    backTextButton: {
        alignItems: 'center',
        paddingVertical: 15,
    },
    backText: {
        fontFamily: "Montserrat_600SemiBold",
        fontSize: 15,
        color: "#ccc", // Light grey since the background is dark grey
    }
});

export default RegistrationFormStyle;