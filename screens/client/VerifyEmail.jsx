import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { API_BASE_URL } from '../../utils/api';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function VerifyEmail() {
    const navigation = useNavigation();
    const route = useRoute();

    const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'failed'
    const [message, setMessage] = useState('Verifying your account...');

    useEffect(() => {
        let isMounted = true;
        const doVerify = async () => {
            try {
                let token = route.params?.token;
                let email = route.params?.email;

                if (!token || !email) {
                    const url = await Linking.getInitialURL();
                    if (url) {
                        const parsed = Linking.parse(url);
                        token = token || parsed.queryParams?.token;
                        email = email || parsed.queryParams?.email;
                    }
                }

                if (!token || !email) {
                    if (!isMounted) return;
                    setStatus('failed');
                    setMessage('Invalid verification link.');
                    return;
                }

                const verifyUrl = `${API_BASE_URL}/users/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
                const resp = await fetch(verifyUrl, { method: 'GET' });

                if (!isMounted) return;
                if (resp.ok) {
                    setStatus('success');
                    setMessage('Your account has been successfully verified. Redirecting to login...');
                    setTimeout(() => navigation.navigate('login'), 3000);
                } else {
                    const text = await resp.text();
                    setStatus('failed');
                    setMessage('Verification failed.');
                    console.warn('verifyEmail response:', resp.status, text);
                }
            } catch (err) {
                if (!isMounted) return;
                setStatus('failed');
                setMessage(err.message || 'Verification error');
            }
        };

        doVerify();
        return () => { isMounted = false; };
    }, [navigation, route]);

    return (
        <View style={styles.container}>
            {status === 'verifying' && (
                <>
                    <ActivityIndicator size="large" color="#305797" />
                    <Text style={styles.title}>Verifying account...</Text>
                    <Text style={styles.message}>{message}</Text>
                </>
            )}

            {status === 'success' && (
                <>
                    <Text style={styles.success}>Your account is successfully verified</Text>
                    <Text style={styles.message}>{message}</Text>
                </>
            )}

            {status === 'failed' && (
                <>
                    <Text style={styles.failed}>Verification failed</Text>
                    <Text style={styles.message}>{message}</Text>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 22,
        backgroundColor: '#fff'
    },
    title: {
        marginTop: 14,
        fontSize: 18,
        color: '#305797',
        fontWeight: '700'
    },
    message: {
        marginTop: 8,
        color: '#64748b',
        textAlign: 'center'
    },
    success: {
        fontSize: 20,
        color: '#059669',
        fontWeight: '800'
    },
    failed: {
        fontSize: 20,
        color: '#b91c1c',
        fontWeight: '800'
    }
});