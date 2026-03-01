import { StyleSheet } from "react-native";

const PackageManagementStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    header: {
        fontSize: 22,
        color: "#305797",
        fontWeight: '700',
        marginBottom: 16,
    },
    statsContainer: {
        marginBottom: 15,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: '#fff',
        width: '48%',
        padding: 16,
        borderRadius: 10,
        elevation: 3,
        alignItems: 'center',
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statsIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    cardValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
    },
    cardLabel: {
        marginTop: 4,
        color: '#777',
        fontSize: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    searchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f6f8fc",
        borderRadius: 22,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "#dbe3ef"
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 13,
        color: "#333",
    },
    addPackageBtn: {
        flexDirection: 'row',
        backgroundColor: '#305797',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        width: '35%',
        justifyContent: 'center'
    },
    plusIcon: {
        width: 15,
        height: 15,
        marginRight: 5,
    },
    addBtnText: {
        color: '#fff',
        fontFamily: 'Roboto_500Medium',
        fontSize: 12
    },
    packageCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        flexDirection: 'row',
        padding: 10,
        marginBottom: 12,
        elevation: 2,
    },
    cardImage: {
        width: 90,
        height: 90,
        borderRadius: 8,
    },
    cardContent: {
        flex: 1,
        marginLeft: 10,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    packageName: {
        fontSize: 14,
        fontFamily: 'Roboto_700Bold',
        color: '#000',
    },
    slotsText: {
        fontSize: 10,
        color: '#777',
    },
    packageDesc: {
        fontSize: 11,
        color: '#333',
        marginVertical: 5,
        fontFamily: 'Roboto_400Regular',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5
    },
    priceText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000'
    },
    actionButtons: {
        flexDirection: 'row',
    },
    editBtn: {
        backgroundColor: '#305797',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginRight: 5
    },
    removeBtn: {
        backgroundColor: '#992A46',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 5
    },
    btnText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: 'Roboto_500Medium'
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 30,
        alignItems: 'center',
        elevation: 10,
    },
    modalText: {
        fontSize: 18,
        fontFamily: 'Roboto_700Bold',
        color: '#305797',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalCancelBtn: {
        flex: 1,
        backgroundColor: '#305797',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginRight: 10,
    },
    modalRemoveBtn: {
        flex: 1,
        backgroundColor: '#992A46',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalOkBtn: {
        backgroundColor: '#305797',
        paddingVertical: 12,
        width: '100%',
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontFamily: 'Roboto_700Bold',
        fontSize: 16,
    },
});

export default PackageManagementStyles;