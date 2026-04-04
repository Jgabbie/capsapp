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
        width: '100%',         // Fixes the wrapping issue
        textAlign: 'center',   // Centers it perfectly
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular',
        color: '#305797',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});