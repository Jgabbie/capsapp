import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const AboutUsStyle = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 140,
        backgroundColor: '#f5f7fa',
    },
    section: {
        marginBottom: 25,
    },
    mainTitle: {
        fontSize: 25,
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
    brandCard: {
        backgroundColor: '#305797',
    },
    /* Make certain cards full-bleed (edge-to-edge) while keeping inner padding */
    fullBleedCard: {
        marginHorizontal: -20,
        borderRadius: 0,
        overflow: 'hidden',
        paddingHorizontal: 20,
        backgroundColor: '#305797',
    },

    /* Full-bleed images used inside fullBleedCard (no rounded corners) */
    fullBleedImage: {
        width: '100%',
        height: 210,
        borderRadius: 0,
        marginTop: 0,
        resizeMode: 'cover',
        alignSelf: 'stretch',
    },
    fullBleedImageLarge: {
        width: '100%',
        height: 200,
        borderRadius: 0,
        marginTop: 0,
        resizeMode: 'cover',
        alignSelf: 'stretch',
    },
    mainTitleWhite: {
        fontSize: 25,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
        marginBottom: 15,
    },
    paragraphWhite: {
        fontSize: 14,
        fontFamily: 'Roboto_400Regular',
        color: '#fff',
        lineHeight: 22,
        marginBottom: 12,
        textAlign: 'justify'
    },
    subTitleWhite: {
        fontSize: 20,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
        marginBottom: 10,
    },
    whiteSeparator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.8)',
        marginVertical: 18,
    },
    // --- SHOWCASE IMAGE STYLES ---
    showcaseImage: {
        width: '100%',
        height: 230, 
        borderRadius: 10,
        marginTop: 15,
        resizeMode: 'cover', // Ensures the image fills the space nicely
        alignSelf: 'stretch',
    },
    showcaseImageInside: {
        width: '100%',
        height: 210,
        borderRadius: 10,
        marginTop: 16,
        resizeMode: 'cover',
        alignSelf: 'stretch',
    },
    showcaseImageInsideLarge: {
        width: '100%',
        height: 240,
        borderRadius: 10,
        marginTop: 16,
        resizeMode: 'cover',
        alignSelf: 'stretch',
    },
    // --- REDUNDANT DIVIDER STYLE REMOVED ---
    // divider: {
    //     height: 1,
    //     backgroundColor: '#ddd',
    //     marginVertical: 10,
    // },
    // --- REDUNDANT INFOSECTION STYLE REMOVED ---
    // infoSection: {
    //     paddingVertical: 15,
    // },
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