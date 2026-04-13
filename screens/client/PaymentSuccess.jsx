import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import PaymentStyle from '../../styles/clientstyles/PaymentStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';

export default function PaymentSuccess({ route, navigation }) {
    const { reference, mode } = route.params || { reference: 'BK-000000', mode: 'manual' };

    return (
        <SafeAreaView style={PaymentStyle.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={PaymentStyle.successContainer}>
                
                <View style={PaymentStyle.successIconWrapper}>
                    <Ionicons name="checkmark-circle" size={80} color="#0ca678" />
                </View>

                <Text style={PaymentStyle.successTitle}>Booking Secured!</Text>
                
                <Text style={PaymentStyle.successDesc}>
                    {mode === 'manual' 
                        ? "Your booking request and proof of payment have been submitted. Our team will verify it within 1-2 business days."
                        // 🔥 UPDATED ONLINE TEXT 🔥
                        : "Your booking is saved! Please complete your payment in the browser. Once paid, your itinerary will be fully confirmed in your bookings."
                    }
                </Text>

                <View style={PaymentStyle.refBox}>
                    <Text style={PaymentStyle.refLabel}>BOOKING REFERENCE</Text>
                    <Text style={PaymentStyle.refText}>{reference}</Text>
                </View>

                <TouchableOpacity 
                    style={[QuotationAllInStyle.proceedButton, {width: '100%'}]}
                    onPress={() => navigation.navigate("userbookings")}
                >
                    <Text style={QuotationAllInStyle.proceedButtonText}>View My Bookings</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={PaymentStyle.backTextButton}
                    onPress={() => navigation.navigate("home")}
                >
                    <Text style={PaymentStyle.backText}>Return to Home</Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}