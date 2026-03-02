import { StyleSheet } from "react-native";

const CancellationRequestStyle = StyleSheet.create({

    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f6f6ff",
    },
    header: {
        fontSize: 22,
        color: "#305797",
        fontWeight: "bold",
        marginBottom: 16
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
    requestCard: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 14,
        marginBottom: 15,
        elevation: 3,
    },
    cardTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    cardRef: {
        fontWeight: "bold",
        color: "#305797",
    },
    cardDate: {
        fontSize: 12,
        color: "#777",
    },
    cardLabel: {
        fontSize: 13,
        color: "#555",
        marginBottom: 4,
    },
    cardValue: {
        fontWeight: "600",
        color: "#222",
    },
    cardButtonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
    },
    approveButton: {
        backgroundColor: "#2ecc71",
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    denyButton: {
        backgroundColor: "#e74c3c",
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
    }

})

export default CancellationRequestStyle
