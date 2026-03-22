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
        gap: 8,
    },
    statsCard: {
        backgroundColor: '#fff',
        flex: 1,
        paddingVertical: 15,
        borderRadius: 10,
        elevation: 3,
        alignItems: 'center',
    },
    cardValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
    },
    cardLabel: {
        marginTop: 4,
        color: '#777',
        fontSize: 10,
        textAlign: 'center',
    },
    filterWrapper: {
        marginBottom: 15,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 14,
        height: 45,
        borderWidth: 1,
        borderColor: "#dbe3ef",
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: "#333",
    },
    dropdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 5,
    },
    dropdownButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#dbe3ef',
        paddingHorizontal: 8,
        height: 40,
        borderRadius: 8,
    },
    dropdownText: {
        fontSize: 11,
        color: '#777',
    },
    addPackageBtn: {
        flexDirection: 'row',
        backgroundColor: '#305797',
        paddingHorizontal: 10,
        height: 40,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtnText: {
        color: '#fff',
        fontFamily: 'Roboto_500Medium',
        fontSize: 11,
        marginLeft: 2,
    },
    
    emptyContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 40,
    },
    emptyLogo: {
        width: 140,
        height: 140,
        resizeMode: 'contain',
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 5,
        fontSize: 16,
        color: '#999',
        fontFamily: 'Roboto_500Medium',
    },
    
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownMenu: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingVertical: 10,
        elevation: 5,
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuText: {
        fontSize: 14,
        color: '#333',
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
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    },
});

export default PackageManagementStyles;