import { StyleSheet } from "react-native";

const HeaderStyle = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 30,
        paddingTop: 60,
        paddingBottom: 20
    },
    sideBarButton: {
        backgroundColor: "#E0E0E0",
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: "center",
        alignItems: "center"
    },
    sideBarImage: {
        width: 45,
        height: 45,
    },
    logo: {
        width: 70,
        height: 70,
    },
    rightIconsContainer: {
        flexDirection: "row",
        alignItems: "center",
        position: "relative"
    },
    profileIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 22.5,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: "#F2F2F2"
    },

    profileIcon: {
        width: "100%",
        height: "100%",
        borderRadius: 22.5
    },
    bellButton: {
        position: "absolute",
        top: -5,
        left: -10,
        zIndex: 1
    },
    bellIcon: {
        width: 25,
        height: 25
    },
})

export default HeaderStyle