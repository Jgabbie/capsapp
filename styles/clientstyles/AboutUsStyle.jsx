import { StyleSheet } from 'react-native';

const AboutUsStyle = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
        backgroundColor: '#f5f7fa',
    },
    section: {
        marginBottom: 25,
    },
    mainTitle: {
        fontSize: 28,
        fontFamily: 'Montserrat_700Bold',
        color: '#305797',
        marginBottom: 15,
    },
    subTitle: {
        fontSize: 20,
        fontFamily: 'Montserrat_700Bold',
        color: '#305797',
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 14,
        fontFamily: 'Roboto_400Regular',
        color: '#555',
        lineHeight: 22,
        marginBottom: 12,
        textAlign: 'justify'
    },
    paragraphSmall: {
        fontSize: 13,
        fontFamily: 'Roboto_400Regular',
        color: '#555',
        lineHeight: 20,
        textAlign: 'justify'
    },
    rowSection: {
        flexDirection: 'column', // Stacked for mobile readability
        justifyContent: 'space-between',
        marginBottom: 25,
        gap: 15,
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        elevation: 2, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    divider: {
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 10,
    },
    infoSection: {
        paddingVertical: 15,
    },
    socialBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
    },
    socialText: {
        fontSize: 15,
        fontFamily: 'Roboto_500Medium',
        color: '#333',
        marginLeft: 10,
    },
    footer: {
        marginTop: 30,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        fontFamily: 'Roboto_400Regular',
        color: '#999',
    }
});

export default AboutUsStyle;