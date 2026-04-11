import { StyleSheet } from 'react-native'

const SidebarStyle = StyleSheet.create({
    overlay: {
        position: 'absolute',
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: 'flex-start',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    sidebarContainer: {
        width: '75%',
        height: '100%',
        backgroundColor: '#4076A0',
        paddingTop: 40,
        paddingBottom: 40, // 🔥 FIXED: Pushes the content up from the phone's bottom nav buttons
        paddingHorizontal: 30,
        elevation: 5,
        boxShadow: "2px 0px 8px rgba(0,0,0,0.3)"
    },
    profileSection: {
        flexDirection: "row",
        alignItems: 'center',
        marginBottom: 20,
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
    },
    navIcon: {
        width: 30,
        height: 30,
    },
    navText: {
        color: "#fff",
        fontFamily: 'Montserrat_500Medium',
        fontWeight: '500',
        fontSize: 18,
        marginLeft: 12,
        width: '100%',
    },
})

export default SidebarStyle;