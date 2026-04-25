import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentSuccess({ route, navigation }) {
    // Timer state starting at 8 seconds
    const [countdown, setCountdown] = useState(8);
    // 🔥 NEW: Kill switch to stop the timer if the user navigates manually
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        // 🔥 If the kill switch is flipped (user clicked a button), stop running this effect!
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
            <View style={localStyles.container}>
                
                <View style={localStyles.iconWrapper}>
                    <Ionicons name="checkmark" size={50} color="#fff" />
                </View>

                <Text style={localStyles.title}>Payment Successful</Text>
                
                <Text style={localStyles.desc}>
                    Your booking has been confirmed. Your booking will appear in your account shortly once payment is verified.
                </Text>

                <Text style={localStyles.countdown}>
                    Redirecting to home in <Text style={{fontWeight: 'bold', color: '#6b7280'}}>{countdown}</Text> seconds...
                </Text>

                <View style={localStyles.buttonRow}>
                    <TouchableOpacity 
                        style={localStyles.button}
                        onPress={() => {
                            setIsActive(false); // 🔥 Kill the timer!
                            navigation.navigate("userbookings");
                        }}
                    >
                        <Text style={localStyles.buttonText}>View Bookings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={localStyles.button}
                        onPress={() => {
                            setIsActive(false); // 🔥 Kill the timer!
                            navigation.navigate("home");
                        }}
                    >
                        <Text style={localStyles.buttonText}>Go to Home</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
}

// 🔥 Local styles to match the Web Screenshot exactly! 🔥
const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    iconWrapper: {
        width: 86,
        height: 86,
        borderRadius: 43,
        backgroundColor: '#52c41a', // Bright Web Success Green
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
        fontSize: 26,
        fontFamily: 'Montserrat_700Bold',
        color: '#1f2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    desc: {
        fontSize: 14,
        fontFamily: 'Roboto_400Regular',
        color: '#374151',
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
        gap: 15,
    },
    button: {
        backgroundColor: '#305797', // Brand Blue
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 135,
        alignItems: 'center',
        shadowColor: '#305797',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: '#ffffff',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 13,
    }
});