import { StyleSheet } from "react-native";

const AdminDashboardStyles = StyleSheet.create({
    container: {
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#305797",
        marginTop: 12,
        marginBottom: 8
    },
    bookingCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10
    },
    bookingRef: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 16,
        color: "#305797"
    },
    bookingStatus: {
        fontFamily: "Montserrat_500Medium",
        fontSize: 13,
        color: "#2ecc71"
    },
    cardBody: {
        marginBottom: 15
    },
    packageName: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 18,
        marginBottom: 10
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6
    },
    detailLabel: {
        fontFamily: "Montserrat_400Regular",
        color: "#555"
    },
    detailValue: {
        fontFamily: "Montserrat_500Medium",
        color: "#000"
    },
    price: {
        fontFamily: "Montserrat_700Bold",
        color: "#305797"
    },
    cardActions: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    viewButton: {
        flex: 1,
        backgroundColor: "#305797",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        marginRight: 8
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#e74c3c",
        padding: 10,
        borderRadius: 8,
        alignItems: "center"
    },
    buttonText: {
        color: "#fff",
        fontFamily: "Roboto_500Medium"
    },
    cardChart: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 5,
        paddingTop: 30,
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3
    }
})

export default AdminDashboardStyles