import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import * as Linking from 'expo-linking';
import { API_BASE_URL } from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
    useFonts,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

export default function VerifyEmail() {
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_600SemiBold,
        Montserrat_700Bold,
    });

    const navigation = useNavigation();
    const route = useRoute();

    const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'failed'
    const [message, setMessage] = useState('Verifying your account...');
    const [debugInfo, setDebugInfo] = useState('');

    useEffect(() => {
        let isMounted = true;

        const parseUrlParams = (url) => {
            if (!url) return { token: null, email: null };
            const parsed = Linking.parse(url);
            return {
                token: parsed.queryParams?.token || null,
                email: parsed.queryParams?.email || null,
            };
        };

        const doVerify = async (token, email) => {
            try {
                if (!token || !email) {
                    if (!isMounted) return;

                    setStatus('failed');
                    setMessage('Invalid verification link or missing credentials.');
                    setDebugInfo(`API_BASE_URL: ${API_BASE_URL}`);
                    return;
                }

                const verifyUrl =
                    `${API_BASE_URL}/users/auth/verify-email` +
                    `?token=${encodeURIComponent(token)}` +
                    `&email=${encodeURIComponent(email)}` +
                    `&response=json`;

                const resp = await fetch(verifyUrl, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                    },
                });

                const data = await resp.json().catch(() => ({
                    success: false,
                    message: 'Invalid response from server.',
                }));

                if (!isMounted) return;

                if (resp.ok && data.success === true) {
                    setStatus('success');

                    setMessage(
                        data.message ||
                        'Your account has been successfully verified! You can now log in.'
                    );

                    setTimeout(() => {
                        if (isMounted) {
                            navigation.navigate('login');
                        }
                    }, 3500);

                } else {
                    setStatus('failed');

                    setMessage(
                        data.message ||
                        `Verification failed (Status Code: ${resp.status}).`
                    );

                    setDebugInfo(
                        `API_BASE_URL: ${API_BASE_URL}\n` +
                        `Status: ${resp.status}`
                    );
                }

            } catch (err) {
                if (!isMounted) return;

                setStatus('failed');

                setMessage(
                    err.message ||
                    'An unexpected verification error occurred.'
                );

                setDebugInfo(`API_BASE_URL: ${API_BASE_URL}`);
            }
        };

        const run = async () => {
            let token = route.params?.token;
            let email = route.params?.email;

            if (!token || !email) {
                const initialUrl = await Linking.getInitialURL();
                const parsed = parseUrlParams(initialUrl);
                token = token || parsed.token;
                email = email || parsed.email;
            }

            await doVerify(token, email);
        };

        const handleUrl = (event) => {
            const parsed = parseUrlParams(event.url);
            if (parsed.token && parsed.email) {
                doVerify(parsed.token, parsed.email);
            }
        };

        const subscription = Linking.addEventListener('url', handleUrl);
        run();

        return () => {
            isMounted = false;
            subscription.remove();
        };
    }, [navigation, route]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.card}>
                    {/* Verifying State */}
                    {status === 'verifying' && (
                        <View style={styles.stateWrapper}>
                            <View style={[ModalStyle.modalIconContainer, styles.blueBadge]}>
                                <ActivityIndicator size="large" color="#305797" />
                            </View>
                            <Text style={styles.title}>Verifying Account</Text>
                            <Text style={styles.message}>{message}</Text>
                        </View>
                    )}

                    {/* Success State */}
                    {status === 'success' && (
                        <View style={styles.stateWrapper}>
                            <View style={ModalStyle.modalIconContainer}>
                                <Ionicons
                                    name="checkmark"
                                    size={32}
                                    color="#059669"
                                />
                            </View>
                            <Text style={styles.title}>Email Verified!</Text>
                            <Text style={styles.message}>{message}</Text>

                            <TouchableOpacity
                                style={styles.primaryButton}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('login')}
                            >
                                <Text style={styles.primaryButtonText}>Continue to Login</Text>
                                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Failed State */}
                    {status === 'failed' && (
                        <View style={styles.stateWrapper}>
                            <View style={[ModalStyle.modalIconContainer, styles.failedBadge]}>
                                <Ionicons name="close" size={32} color="#DC2626" />
                            </View>
                            <Text style={styles.title}>Verification Failed</Text>
                            <Text style={styles.message}>{message}</Text>

                            <TouchableOpacity
                                style={styles.primaryButton}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('login')}
                            >
                                <Text style={styles.primaryButtonText}>Back to Login</Text>
                            </TouchableOpacity>

                            {debugInfo ? (
                                <View style={styles.debugBox}>
                                    <Text style={styles.debugTitle}>Debug Details</Text>
                                    <Text style={styles.debugText}>{debugInfo}</Text>
                                </View>
                            ) : null}
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    safeArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingVertical: 36,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 4,
    },
    stateWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    blueBadge: {
        backgroundColor: '#EFF6FF',
    },
    failedBadge: {
        backgroundColor: '#FEF2F2',
    },
    title: {
        fontSize: 22,
        fontFamily: 'Montserrat_700Bold',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 10,
    },
    message: {
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular',
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    primaryButton: {
        width: '100%',
        height: 52,
        backgroundColor: '#305797',
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Montserrat_600SemiBold',
    },
    buttonIcon: {
        marginLeft: 8,
    },
    debugBox: {
        marginTop: 24,
        width: '100%',
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    debugTitle: {
        fontSize: 11,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    debugText: {
        color: '#64748B',
        fontSize: 11,
        fontFamily: 'Montserrat_400Regular',
    },
});

const ModalStyle = StyleSheet.create({
    modalIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
});