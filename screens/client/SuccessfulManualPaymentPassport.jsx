import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SuccessfulPaymentPassportStyle from '../../styles/clientstyles/SuccessfulPaymentPassportStyle';

export default function SuccessfulManualPaymentPassport({ navigation }) {
    const [countdown, setCountdown] = useState(10);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (!isActive) return;

        if (countdown === 0) {
            setIsActive(false);
            navigation.navigate('userapplications');
            return;
        }

        const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
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
                    Your manual passport payment was submitted successfully. Our team will review your proof of payment.
                </Text>

                <Text style={SuccessfulPaymentPassportStyle.countdown}>
                    Redirecting to applications in <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#374151' }}>{countdown}</Text> seconds...
                </Text>

                <View style={SuccessfulPaymentPassportStyle.buttonRow}>
                    <TouchableOpacity
                        style={SuccessfulPaymentPassportStyle.buttonSecondary}
                        onPress={() => { setIsActive(false); navigation.navigate('userapplications'); }}
                    >
                        <Text style={SuccessfulPaymentPassportStyle.buttonTextSecondary}>View Applications</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}