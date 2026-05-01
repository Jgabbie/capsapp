import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SuccessfulPaymentVisaStyle from '../../styles/clientstyles/SuccessfulPaymentVisaStyle';

export default function SuccessfulManualPaymentVisa({ navigation }) {
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
        <SafeAreaView style={SuccessfulPaymentVisaStyle.container}>
            <StatusBar barStyle="dark-content" />
            <View style={SuccessfulPaymentVisaStyle.content}>
                <View style={SuccessfulPaymentVisaStyle.iconWrapper}>
                    <Ionicons name="checkmark-sharp" size={50} color="#fff" />
                </View>

                <Text style={SuccessfulPaymentVisaStyle.title}>Payment Successful</Text>
                <Text style={SuccessfulPaymentVisaStyle.desc}>
                    Your manual visa payment was submitted successfully. Our team will review your proof of payment.
                </Text>

                <Text style={SuccessfulPaymentVisaStyle.countdown}>
                    Redirecting to applications in <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#374151' }}>{countdown}</Text> seconds...
                </Text>

                <View style={SuccessfulPaymentVisaStyle.buttonRow}>
                    <TouchableOpacity
                        style={SuccessfulPaymentVisaStyle.buttonSecondary}
                        onPress={() => { setIsActive(false); navigation.navigate('userapplications'); }}
                    >
                        <Text style={SuccessfulPaymentVisaStyle.buttonTextSecondary}>View Applications</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}