import { StyleSheet } from 'react-native'

const SidebarStyle = StyleSheet.create({
    overlay: {
        position: 'absolute',
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: 'flex-start',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    sidebarContainer: {
        width: '72%',
        height: '100%',
        backgroundColor: '#4076A0',
        paddingTop: 55,
        paddingBottom: 73,
        paddingHorizontal: 30,
        elevation: 5,
        boxShadow: "2px 0px 8px rgba(0,0,0,0.3)"
    },
    profileSection: {
        flexDirection: "row",
        alignItems: 'center',
        marginBottom: 10,
    },
    profileImg: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    nameContainer: {
        marginLeft: 15,
    },
    userName: {
        color: '#fff',
        fontFamily: 'Roboto_400Regular',
        fontWeight: 'bold',
        fontSize: 16,
    },
    userHandle: {
        color: '#fff',
        fontFamily: 'Roboto_400Regular',
        fontWeight: 'normal',
        fontSize: 14
    },
    divider: {
        height: 2,
        backgroundColor: "#fff",
        marginVertical: 15,
        opacity: 0.8
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginLeft: -12,
        borderRadius: 8,
        marginBottom: 2,
    },
    navItemActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    navIcon: {
        width: 15,
        height: 15,
        marginBottom: 3,
    },
    navText: {
        color: "#fff",
        fontFamily: 'Montserrat_500Medium',
        fontWeight: '500',
        fontSize: 16,
        marginLeft: 12,
        width: '100%',
    },
})

export default SidebarStyle;