import { StyleSheet } from 'react-native';

const PaymentSuccessStyle = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    iconWrapper: {
        width: 86,
        height: 86,
        borderRadius: 43,
        backgroundColor: '#52c41a',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#52c41a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    title: {
        fontSize: 26,
        fontFamily: 'Montserrat_700Bold',
        color: '#1f2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    desc: {
        fontSize: 14,
        fontFamily: 'Roboto_400Regular',
        color: '#374151',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    countdown: {
        fontSize: 13,
        fontFamily: 'Roboto_400Regular',
        color: '#9ca3af',
        marginBottom: 35,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 15,
    },
    button: {
        backgroundColor: '#305797', // Brand Blue
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 135,
        alignItems: 'center',
        shadowColor: '#305797',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: '#ffffff',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 13,
    }
});

export default PaymentSuccessStyle;