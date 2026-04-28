import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
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
        fontSize: 24,
        fontFamily: 'Montserrat_700Bold',
        color: '#1f2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    desc: {
        fontSize: 14,
        fontFamily: 'Roboto_400Regular',
        color: '#4b5563',
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
        gap: 12,
        width: '100%',
        justifyContent: 'center'
    },
    buttonPrimary: {
        backgroundColor: '#305797', 
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        flex: 1,
        shadowColor: '#305797',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    buttonTextPrimary: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Montserrat_600SemiBold',
    },
    buttonSecondary: {
        backgroundColor: '#fff', 
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        flex: 1,
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    buttonTextSecondary: {
        color: '#374151',
        fontSize: 14,
        fontFamily: 'Montserrat_600SemiBold',
    }
});

export default styles;