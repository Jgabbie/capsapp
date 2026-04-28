import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, withUserHeader } from '../../utils/api';
import { useUser } from '../../context/UserContext';
import SuccessfulPaymentVisaStyle from '../../styles/clientstyles/SuccessfulPaymentVisaStyle';

export default function SuccessfulPaymentVisa({ route, navigation }) {
    const { user } = useUser();
    const [countdown, setCountdown] = useState(10);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        const token = route.params?.token;

        if (token && user?._id) {
            api.post('/visa/verify-payment', { token }, withUserHeader(user._id))
                .then(res => console.log("Visa payment verified successfully."))
                .catch(err => console.error("Visa payment verification failed:", err.message));
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
        <SafeAreaView style={SuccessfulPaymentVisaStyle.container}>
            <StatusBar barStyle="dark-content" />
            <View style={SuccessfulPaymentVisaStyle.content}>
                
                <View style={SuccessfulPaymentVisaStyle.iconWrapper}>
                    <Ionicons name="checkmark-sharp" size={50} color="#fff" />
                </View>

                <Text style={SuccessfulPaymentVisaStyle.title}>Payment Successful</Text>
                <Text style={SuccessfulPaymentVisaStyle.desc}>
                    Your visa assistance payment has been verified successfully.
                </Text>

                <Text style={SuccessfulPaymentVisaStyle.countdown}>
                    Redirecting to home in <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#374151' }}>{countdown}</Text> seconds...
                </Text>

                <View style={SuccessfulPaymentVisaStyle.buttonRow}>
                    <TouchableOpacity 
                        style={SuccessfulPaymentVisaStyle.buttonSecondary} 
                        onPress={() => { setIsActive(false); navigation.navigate('userapplications'); }}
                    >
                        <Text style={SuccessfulPaymentVisaStyle.buttonTextSecondary}>View Applications</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={SuccessfulPaymentVisaStyle.buttonPrimary} 
                        onPress={() => { setIsActive(false); navigation.navigate('home'); }}
                    >
                        <Text style={SuccessfulPaymentVisaStyle.buttonTextPrimary}>Go to Home</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
}