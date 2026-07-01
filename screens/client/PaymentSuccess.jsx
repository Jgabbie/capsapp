import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PaymentSuccessStyle from '../../styles/clientstyles/PaymentSuccessStyle';

import {
    useFonts,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

import {
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
} from "@expo-google-fonts/roboto";

export default function PaymentSuccess({ route, navigation }) {
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold,
    });


    //timer state starting at 10 seconds
    const [countdown, setCountdown] = useState(10);
    const [isActive, setIsActive] = useState(true);


    //auto navigation effect that counts down from 10 seconds and navigates to the home screen when it reaches 0
    useEffect(() => {
        if (!isActive) return;

        // If countdown hits 0, auto-navigate to Home
        if (countdown === 0) {
            setIsActive(false); // Flip the switch so it doesn't run again
            navigation.navigate('home');
            return;
        }

        // Set an interval to decrease the countdown every 1 second (1000ms)
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        // Cleanup interval on unmount or re-render
        return () => clearInterval(timer);
    }, [countdown, isActive, navigation]);




    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
            <StatusBar barStyle="dark-content" />
            <View style={PaymentSuccessStyle.container}>

                <View style={PaymentSuccessStyle.iconWrapper}>
                    <Ionicons name="checkmark" size={50} color="#fff" />
                </View>

                <Text style={PaymentSuccessStyle.title}>Payment Successful</Text>

                <Text style={PaymentSuccessStyle.desc}>
                    Your booking has been confirmed. Your booking will appear in your account shortly once payment is verified.
                </Text>

                <Text style={PaymentSuccessStyle.countdown}>
                    Redirecting to home in <Text style={{ fontWeight: 'bold', color: '#6b7280' }}>{countdown}</Text> seconds...
                </Text>

                <View style={PaymentSuccessStyle.buttonRow}>
                    <TouchableOpacity
                        style={PaymentSuccessStyle.button}
                        onPress={() => {
                            setIsActive(false); //  Kill the timer!
                            navigation.navigate("userbookings");
                        }}
                    >
                        <Text style={PaymentSuccessStyle.buttonText}>View Bookings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={PaymentSuccessStyle.button}
                        onPress={() => {
                            setIsActive(false); //  Kill the timer!
                            navigation.navigate("home");
                        }}
                    >
                        <Text style={PaymentSuccessStyle.buttonText}>Go to Home</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
}

