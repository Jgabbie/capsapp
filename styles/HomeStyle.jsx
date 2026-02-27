import { StyleSheet } from "react-native";

const HomeStyle = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#305797",
        paddingLeft: 20
    },
    SearchBar: {
        borderWidth: 1,
        backgroundColor: "#fff",
        fontFamily: "Montserrat_400Regular",
        borderColor: "#6d6d6d",
        borderRadius: 10,
        margin: 10,
        padding: 10
    },
    card: {
        marginLeft: 30,
        width: 150
    },
    cardImage: {
        width: 150,
        height: 100,
        borderRadius: 10,
        marginBottom: 5
    },
    cardTitle: {
        fontFamily: "Montserrat_500Medium",
        color: "#305797",
        fontSize: 13,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginTop: 2
    },
    infoIcon: {
        width: 12,
        height: 12
    },
    infoText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 12,
        color: '#555'
    },
    priceText: {
        fontFamily: "Roboto_400Regular",
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 5
    },
    bannerCard: {
        marginLeft: 30,
        marginRight: 30,
        width: 320,
        backgroundColor: "#fff",
        borderRadius: 15,
        elevation: 5,
        boxShadow: "2px 0px 8px rgba(0,0,0,0.3)",
        marginBottom: 30
    },
    bannerImage: {
        width: "100%",
        height: 200,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15
    },
    bannerFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15
    },
    bannerTitle: {
        fontFamily: 'Montserrat_500Medium',
        fontSize: 18,
        fontWeight: "bold",
        color: "#305797"
    },
    bannerSub: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 14,
        color: '#555'
    },
    viewAllButton: {
        backgroundColor: "#305797",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 5
    },
    viewAllText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500'
    },
    arrowIcon: {
        width: 12,
        height: 12,
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
        paddingVertical: 10,
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
})

export default HomeStyle