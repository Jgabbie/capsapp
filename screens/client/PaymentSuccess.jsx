import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PaymentSuccessStyle from '../../styles/clientstyles/PaymentSuccessStyle';

export default function PaymentSuccess({ route, navigation }) {
    // Timer state starting at 8 seconds
    const [countdown, setCountdown] = useState(8);
    //  NEW: Kill switch to stop the timer if the user navigates manually
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        //  If the kill switch is flipped (user clicked a button), stop running this effect!
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

