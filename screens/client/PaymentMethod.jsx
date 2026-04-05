import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';

import PaymentStyle from '../../styles/clientstyles/PaymentStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";

export default function PaymentMethod({ route, navigation }) {
    const { user } = useUser();
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Data passed from PaymentMode
    const { setupData, amountToPay, paymentType, travelerUploads, passengers, leadGuestInfo, medicalData, emergency } = route.params || {};

    const [method, setMethod] = useState('paymongo'); // 'paymongo' or 'manual'
    const [proofImage, setProofImage] = useState(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            base64: true, // Needed for backend
            quality: 0.5,
        });

        if (!result.canceled) {
            setProofImage(result.assets[0]);
        }
    };

    const handleProceed = async () => {
        if (method === 'manual' && !proofImage) {
            Alert.alert("Missing Proof", "Please upload a photo of your deposit slip.");
            return;
        }

        setLoading(true);

        try {
            // Safely parse the traveler counts to guarantee a Number
            const adultCount = Number(setupData?.travelerCounts?.adult) || 0;
            const childCount = Number(setupData?.travelerCounts?.child) || 0;
            const infantCount = Number(setupData?.travelerCounts?.infant) || 0;
            
            // If the math equals 0, fallback to the length of the passengers array
            const calculatedTravelers = (adultCount + childCount + infantCount) || (passengers?.length) || 1;

            if (method === 'manual') {
                // Prepare Payload for Manual Payment
                const payload = {
                    packageId: setupData.pkg._id || setupData.pkg.id,
                    travelDate: setupData.selectedDate,
                    travelerTotal: calculatedTravelers, 
                    amount: amountToPay,
                    paymentType,
                    bookingDetails: { ...setupData, travelerUploads, passengers, leadGuestInfo, medicalData, emergency },
                    proofImage: `data:${proofImage.mimeType || 'image/jpeg'};base64,${proofImage.base64}`,
                    proofImageType: proofImage.mimeType || 'image/jpeg',
                    proofFileName: 'deposit_slip.jpg'
                };

                const response = await api.post('/payment/manual', payload, withUserHeader(user?._id));
                setLoading(false);
                navigation.navigate("paymentsuccess", { reference: response.data.bookingId, mode: 'manual' });

            } else {
                // Paymongo Flow
                const paymentPayload = {
                    packageId: setupData.pkg._id || setupData.pkg.id,
                    totalPrice: amountToPay,
                    travelDate: setupData.selectedDate,
                    travelers: calculatedTravelers, 
                    leadEmail: user.email,
                    leadContact: leadGuestInfo?.contact || '', 
                    successUrl: 'https://mrctravels.com/success', // Placeholder for mobile
                    cancelUrl: 'https://mrctravels.com/cancel',
                };

                // 1. Create the session in Paymongo
                const response = await api.post('/payment/create-checkout-session', { paymentPayload }, withUserHeader(user?._id));
                const checkoutUrl = response.data?.data?.attributes?.checkout_url;

                if (checkoutUrl) {
                    // 2. Open the browser for the user to pay
                    const browserResult = await WebBrowser.openBrowserAsync(checkoutUrl);
                    
                    // 3. When the browser closes, FORCE CREATE the booking!
                    const checkoutTokenTemp = `mobile-tok-${Date.now()}`;
                    
                    const finalBookingPayload = {
                        packageId: setupData.pkg._id || setupData.pkg.id,
                        checkoutToken: checkoutTokenTemp,
                        bookingDetails: {
                            bookingDate: new Date().toISOString(),
                            travelDate: setupData.selectedDate,
                            travelers: calculatedTravelers,
                            ...setupData, travelerUploads, passengers, leadGuestInfo, medicalData, emergency
                        }
                    };

                    try {
                        // 🔥 THE FIX: Changed from '/booking/apply' to exactly match your bookingRoutes.js ('/booking/create-booking')
                        const bookingSaved = await api.post('/booking/create-booking', finalBookingPayload, withUserHeader(user?._id));
                        
                        setLoading(false);
                        navigation.navigate("paymentsuccess", { reference: bookingSaved.data.reference || 'PENDING', mode: 'online' });
                    } catch (bookingError) {
                        setLoading(false);
                        console.error("Failed to save booking to DB after PayMongo:", bookingError.message);
                        Alert.alert("Notice", "Payment completed, but syncing with database took too long. It will appear in your bookings shortly.");
                        navigation.navigate("paymentsuccess", { reference: 'PENDING', mode: 'online' });
                    }
                }
            }
        } catch (error) {
            setLoading(false);
            console.error("Payment Error:", error.response?.data || error.message);
            Alert.alert("Error", "Failed to process booking. Please try again.");
        }
    };

    return (
        <SafeAreaView style={PaymentStyle.safeArea}>
            <StatusBar barStyle="dark-content" />
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={PaymentStyle.container} showsVerticalScrollIndicator={false}>
                <Text style={PaymentStyle.sectionTitle}>Payment Method</Text>
                <Text style={PaymentStyle.sectionSubtitle}>Select your preferred way to pay.</Text>

                {/* --- PROGRESS STEPS --- */}
                <View style={PaymentStyle.progressContainer}>
                    <View style={[PaymentStyle.progressStep, {backgroundColor: '#305797'}]}><Ionicons name="checkmark" size={14} color="#fff" /></View>
                    <View style={[PaymentStyle.progressLine, {backgroundColor: '#305797'}]} />
                    <View style={[PaymentStyle.progressStep, PaymentStyle.progressStepActive]}><Text style={PaymentStyle.progressText}>2</Text></View>
                </View>

                {/* --- PAYMONGO CARD --- */}
                <TouchableOpacity 
                    style={[PaymentStyle.modeCard, method === 'paymongo' && PaymentStyle.modeCardSelected]}
                    onPress={() => setMethod('paymongo')}
                >
                    <View style={[PaymentStyle.radioCircle, method === 'paymongo' && PaymentStyle.radioCircleSelected]}>
                        {method === 'paymongo' && <View style={PaymentStyle.radioInner} />}
                    </View>
                    <View style={PaymentStyle.modeContent}>
                        <Text style={PaymentStyle.modeTitle}>Online Payment (Paymongo)</Text>
                        <Text style={PaymentStyle.modeDesc}>Securely pay via GCash, Maya, or Credit Card.</Text>
                        <Text style={[PaymentStyle.scheduleNote, {textAlign: 'left', marginTop: 5}]}>* 3.5% convenience fee applies.</Text>
                    </View>
                </TouchableOpacity>

                {/* --- MANUAL CARD --- */}
                <TouchableOpacity 
                    style={[PaymentStyle.modeCard, method === 'manual' && PaymentStyle.modeCardSelected]}
                    onPress={() => setMethod('manual')}
                >
                    <View style={[PaymentStyle.radioCircle, method === 'manual' && PaymentStyle.radioCircleSelected]}>
                        {method === 'manual' && <View style={PaymentStyle.radioInner} />}
                    </View>
                    <View style={PaymentStyle.modeContent}>
                        <Text style={PaymentStyle.modeTitle}>Manual Bank Transfer</Text>
                        <Text style={PaymentStyle.modeDesc}>Deposit directly to our accounts and upload the receipt.</Text>
                    </View>
                </TouchableOpacity>

                {/* --- BANK DETAILS & UPLOAD (Only if Manual) --- */}
                {method === 'manual' && (
                    <View>
                        <Text style={[PaymentStyle.sectionTitle, {fontSize: 14, marginBottom: 10}]}>Our Bank Accounts</Text>
                        <View style={PaymentStyle.bankGrid}>
                            <View style={PaymentStyle.bankItem}>
                                <Text style={PaymentStyle.bankName}>BDO UNIBANK</Text>
                                <Text style={PaymentStyle.bankAccount}>0012-3456-7890</Text>
                                <Text style={PaymentStyle.bankHolder}>M&RC Travel and Tours</Text>
                            </View>
                            <View style={PaymentStyle.bankItem}>
                                <Text style={PaymentStyle.bankName}>BPI</Text>
                                <Text style={PaymentStyle.bankAccount}>9876-5432-10</Text>
                                <Text style={PaymentStyle.bankHolder}>M&RC Travel and Tours</Text>
                            </View>
                            <View style={PaymentStyle.bankItem}>
                                <Text style={PaymentStyle.bankName}>METRO BANK</Text>
                                <Text style={PaymentStyle.bankAccount}>0012-3456-7890</Text>
                                <Text style={PaymentStyle.bankHolder}>M&RC Travel and Tours</Text>
                            </View>
                            <View style={PaymentStyle.bankItem}>
                                <Text style={PaymentStyle.bankName}>LAND BANK</Text>
                                <Text style={PaymentStyle.bankAccount}>9876-5432-10</Text>
                                <Text style={PaymentStyle.bankHolder}>M&RC Travel and Tours</Text>
                            </View>
                        </View>

                        <Text style={[PaymentStyle.sectionTitle, {fontSize: 14, marginBottom: 5}]}>Upload Receipt</Text>
                        <TouchableOpacity style={[QuotationAllInStyle.dashedBox, {height: 150, justifyContent: 'center'}]} onPress={pickImage}>
                            {proofImage ? (
                                <Image source={{ uri: proofImage.uri }} style={{width: '100%', height: '100%', borderRadius: 8}} resizeMode="cover" />
                            ) : (
                                <View style={{alignItems: 'center'}}>
                                    <Ionicons name="camera-outline" size={32} color="#305797" />
                                    <Text style={{color: '#305797', fontFamily: 'Montserrat_600SemiBold', marginTop: 5}}>Select Receipt Image</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <Text style={PaymentStyle.scheduleNote}>Max size: 2MB. Verification takes 1-2 business days.</Text>
                    </View>
                )}

                <TouchableOpacity 
                    style={[QuotationAllInStyle.proceedButton, {marginTop: 20}]} 
                    onPress={handleProceed}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={QuotationAllInStyle.proceedButtonText}>Confirm & Proceed</Text>}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={{ alignItems: 'center', marginTop: 15, marginBottom: 40, paddingVertical: 10 }} 
                    onPress={() => navigation.goBack()}
                >
                    <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#64748b', fontSize: 14 }}>
                        Back to Mode
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}