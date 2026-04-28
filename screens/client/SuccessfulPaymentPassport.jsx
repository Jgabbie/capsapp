import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, withUserHeader } from '../../utils/api';
import { useUser } from '../../context/UserContext';
import SuccessfulPaymentPassportStyle from '../../styles/clientstyles/SuccessfulPaymentPassportStyle';

export default function SuccessfulPaymentPassport({ route, navigation }) {
    const { user } = useUser();
    const [countdown, setCountdown] = useState(10);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        // Extract token from deep link or navigation params
        const token = route.params?.token;

        if (token && user?._id) {
            api.post('/passport/verify-payment', { token }, withUserHeader(user._id))
                .then(res => console.log("Passport payment verified successfully."))
                .catch(err => console.error("Passport payment verification failed:", err.message));
        }
    }, [route.params?.token, user?._id]);

    useEffect(() => {
        if (!isActive) return;

        if (countdown === 0) {
            setIsActive(false);
            navigation.navigate('home');
            return;
        }

        const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown, isActive, navigation]);

    return (
        <SafeAreaView style={SuccessfulPaymentPassportStyle.container}>
            <StatusBar barStyle="dark-content" />
            <View style={SuccessfulPaymentPassportStyle.content}>
                
                <View style={SuccessfulPaymentPassportStyle.iconWrapper}>
                    <Ionicons name="checkmark-sharp" size={50} color="#fff" />
                </View>

                <Text style={SuccessfulPaymentPassportStyle.title}>Payment Successful</Text>
                <Text style={SuccessfulPaymentPassportStyle.desc}>
                    Your passport assistance payment has been verified successfully.
                </Text>

                <Text style={SuccessfulPaymentPassportStyle.countdown}>
                    Redirecting to home in <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#374151' }}>{countdown}</Text> seconds...
                </Text>

                <View style={SuccessfulPaymentPassportStyle.buttonRow}>
                    <TouchableOpacity 
                        style={SuccessfulPaymentPassportStyle.buttonSecondary} 
                        onPress={() => { setIsActive(false); navigation.navigate('userapplications'); }}
                    >
                        <Text style={SuccessfulPaymentPassportStyle.buttonTextSecondary}>View Applications</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={SuccessfulPaymentPassportStyle.buttonPrimary} 
                        onPress={() => { setIsActive(false); navigation.navigate('home'); }}
                    >
                        <Text style={SuccessfulPaymentPassportStyle.buttonTextPrimary}>Go to Home</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
}