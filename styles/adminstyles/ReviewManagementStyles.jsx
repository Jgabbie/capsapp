import { StyleSheet } from "react-native";


const ReviewManagementStyles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f5f5",
        paddingHorizontal: 16,
        paddingTop: 16
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
        marginBottom: 10,
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
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 16
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
    dropdownGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    dropdownButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eef3fb",
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#d6e0f0"
    },
    dropdownIcon: {
        marginLeft: 6
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#305797',
        marginBottom: 12
    },
    reviewCard: {
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
        elevation: 2
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6
    },
    username: {
        fontWeight: '700',
        color: '#305797'
    },
    package: {
        fontSize: 12,
        color: '#555',
        marginBottom: 6
    },
    comment: {
        fontSize: 13,
        color: '#333'
    },
    removeButton: {
        marginTop: 10,
        alignSelf: 'flex-end',
        backgroundColor: '#9E2847',
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 8
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600'
    },
})

export default ReviewManagementStyles