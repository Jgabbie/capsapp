import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 250,
        height: 250,
        resizeMode: 'contain',
    },
    footerText: {
        position: 'absolute',
        bottom: 50,
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular',
        color: '#305797',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});