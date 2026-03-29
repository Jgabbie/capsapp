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
                
                <View style={{backgroundColor: '#e6fcf5', padding: 20, borderRadius: 50}}>
                    <Ionicons name="checkmark-circle" size={80} color="#0ca678" />
                </View>

                <Text style={PaymentStyle.successTitle}>Booking Successful!</Text>
                
                <Text style={PaymentStyle.successDesc}>
                    {mode === 'manual' 
                        ? "Your booking request and proof of payment have been submitted. Our team will verify it within 1-2 business days."
                        : "Your payment has been processed successfully. You can now view your itinerary in your bookings."
                    }
                </Text>

                <View style={PaymentStyle.refBox}>
                    <Text style={PaymentStyle.refLabel}>BOOKING REFERENCE</Text>
                    <Text style={PaymentStyle.refText}>{reference}</Text>
                </View>

                <TouchableOpacity 
                    style={[QuotationAllInStyle.proceedButton, {width: '100%'}]}
                    // 🔥 Fixed: Direct navigation to the "userbookings" screen defined in App.jsx
                    onPress={() => navigation.navigate("userbookings")}
                >
                    <Text style={QuotationAllInStyle.proceedButtonText}>View My Bookings</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[PaymentStyle.backTextButton, {marginTop: 10}]}
                    // 🔥 Fixed: Direct navigation to the "home" screen defined in App.jsx
                    onPress={() => navigation.navigate("home")}
                >
                    <Text style={[PaymentStyle.backText, {color: '#305797'}]}>Return to Home</Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}