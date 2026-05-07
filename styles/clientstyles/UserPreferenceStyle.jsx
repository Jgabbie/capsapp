import { StyleSheet, Platform } from 'react-native';

const UserPreferenceStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    heroSection: {
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 60,
        paddingBottom: 30,
    },
    eyebrow: {
        color: '#bb2424',
        fontSize: 14,
        fontFamily: 'Montserrat_700Bold',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1,
    },
    title: {
        color: '#305797',
        fontSize: 28,
        fontFamily: 'Montserrat_700Bold',
        marginBottom: 10,
        lineHeight: 34,
    },
    subtitle: {
        color: '#4b5563',
        fontSize: 15,
        fontFamily: 'Roboto_400Regular',
        marginBottom: 20,
        lineHeight: 22,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eef2f7',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    progressText: {
        color: '#305797',
        fontSize: 12,
        fontFamily: 'Roboto_500Medium',
    },
    progressDivider: {
        width: 1,
        height: 12,
        backgroundColor: '#cbd5e1',
        marginHorizontal: 10,
    },
    progressTarget: {
        color: '#6b7280',
        fontSize: 12,
        fontFamily: 'Roboto_400Regular',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    questionTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#305797',
        marginBottom: 20,
    },
    questionSubtitle: {
        fontSize: 13,
        fontFamily: 'Roboto_400Regular',
        color: '#6b7280',
        marginBottom: 20,
        marginTop: -15,
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#fff',
    },
    chipSelected: {
        backgroundColor: '#305797',
        borderColor: '#305797',
    },
    chipText: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 14,
        color: '#4b5563',
    },
    chipTextSelected: {
        color: '#fff',
        fontFamily: 'Roboto_500Medium',
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 60 : 60,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        alignItems: 'center',
    },
    footerNote: {
        fontSize: 13,
        fontFamily: 'Roboto_400Regular',
        color: '#6b7280',
        marginBottom: 15,
    },
    ctaButton: {
        backgroundColor: '#305797',
        paddingVertical: 14,
        width: '100%',
        borderRadius: 8,
        alignItems: 'center',
    },
    ctaButtonDisabled: {
        backgroundColor: '#cbd5e1',
    },
    ctaText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Montserrat_600SemiBold',
    }
});

export default UserPreferenceStyle;