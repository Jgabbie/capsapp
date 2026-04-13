import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, StatusBar, Alert, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

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
            const adultCount = Number(setupData?.travelerCounts?.adult) || 0;
            const childCount = Number(setupData?.travelerCounts?.child) || 0;
            const infantCount = Number(setupData?.travelerCounts?.infant) || 0;
            const calculatedTravelers = (adultCount + childCount + infantCount) || (passengers?.length) || 1;

            if (method === 'manual') {
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
                navigation.navigate("paymentsuccess", { reference: response.data.bookingId || response.data.reference, mode: 'manual' });

            } else {
                // 1. CREATE BOOKING FIRST AS "PENDING"
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

                const bookingSaved = await api.post('/booking/create-booking', finalBookingPayload, withUserHeader(user?._id));
                const newBookingId = bookingSaved.data?.booking?._id || bookingSaved.data?.bookingId || bookingSaved.data?._id; 
                const bookingRef = bookingSaved.data?.booking?.reference || bookingSaved.data?.reference || 'PENDING';

                // 2. GET PAYMONGO URL
                const paymentPayload = {
                    bookingId: newBookingId,
                    bookingReference: bookingRef,
                    packageId: setupData.pkg._id || setupData.pkg.id,
                    totalPrice: amountToPay,
                    travelDate: setupData.selectedDate,
                    travelers: calculatedTravelers, 
                    leadEmail: user.email,
                    leadContact: leadGuestInfo?.contact || '', 
                    // 🔥 CRITICAL FIX: The deep link brings the user back directly to the Success screen when they click "Return to Merchant" in Chrome
                    successUrl: `exp://192.168.254.103:8081/--/paymentsuccess?reference=${bookingRef}&mode=online`,
                    cancelUrl: `exp://192.168.254.103:8081/--/paymentmethod`,
                };

                const response = await api.post('/payment/create-checkout-session', { paymentPayload }, withUserHeader(user?._id));
                const checkoutUrl = response.data?.data?.attributes?.checkout_url;

                setLoading(false); 

                if (checkoutUrl) {
                    // 3. OPEN REAL BROWSER
                    // The app stays exactly where it is. It does NOT navigate.
                    // If they close the browser without paying, nothing happens, they stay on Payment Method.
                    Linking.openURL(checkoutUrl);
                }
            }
        } catch (error) {
            setLoading(false);
            Alert.alert("Error", "Failed to process booking. Please try again.");
            console.error(error);
        }
    };

    return (
        <SafeAreaView style={PaymentStyle.safeArea}>
            <StatusBar barStyle="dark-content" />
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={PaymentStyle.container} showsVerticalScrollIndicator={false}>
                <Text style={PaymentStyle.sectionTitle}>Payment Methods</Text>
                <Text style={PaymentStyle.sectionSubtitle}>Select a payment method to complete your booking.</Text>

                <View style={PaymentStyle.progressContainer}>
                    <View style={[PaymentStyle.progressStep, {backgroundColor: '#305797'}]}><Ionicons name="checkmark" size={14} color="#fff" /></View>
                    <View style={[PaymentStyle.progressLine, {backgroundColor: '#305797'}]} />
                    <View style={[PaymentStyle.progressStep, PaymentStyle.progressStepActive]}><Text style={PaymentStyle.progressText}>2</Text></View>
                </View>

                {/* --- HORIZONTAL CARDS (WEB-STYLE) --- */}
                <View style={PaymentStyle.methodGridContainer}>
                    {/* PAYMONGO CARD */}
                    <TouchableOpacity 
                        style={[PaymentStyle.methodGridCard, method === 'paymongo' && PaymentStyle.methodGridCardSelected]}
                        onPress={() => setMethod('paymongo')}
                        activeOpacity={0.9}
                    >
                        <View style={PaymentStyle.methodRadioHeader}>
                            <View style={[PaymentStyle.radioCircle, method === 'paymongo' && PaymentStyle.radioCircleSelected]}>
                                {method === 'paymongo' && <View style={PaymentStyle.radioInner} />}
                            </View>
                        </View>
                        <Text style={PaymentStyle.modeTitle}>Paymongo</Text>
                        <Text style={PaymentStyle.modeDesc}>Pay securely via Credit Card, GCash, or Maya. Rates depend on the transaction method.</Text>
                        <Text style={[PaymentStyle.modeNote, { color: '#ef4444', fontStyle: 'italic', marginTop: 8 }]}>
                            Note: The rate for using this payment method is 3.5%.
                        </Text>
                    </TouchableOpacity>

                    {/* MANUAL CARD */}
                    <TouchableOpacity 
                        style={[PaymentStyle.methodGridCard, method === 'manual' && PaymentStyle.methodGridCardSelected]}
                        onPress={() => setMethod('manual')}
                        activeOpacity={0.9}
                    >
                        <View style={PaymentStyle.methodRadioHeader}>
                            <View style={[PaymentStyle.radioCircle, method === 'manual' && PaymentStyle.radioCircleSelected]}>
                                {method === 'manual' && <View style={PaymentStyle.radioInner} />}
                            </View>
                        </View>
                        <Text style={PaymentStyle.modeTitle}>Manual Payment</Text>
                        <Text style={PaymentStyle.modeDesc}>Direct deposit. You will need to upload proof of payment for manual verification by our team.</Text>
                        <Text style={[PaymentStyle.modeNote, { color: '#ef4444', fontStyle: 'italic', marginTop: 8 }]}>
                            Note: The verification of your payment may take up to 1-2 business days.
                        </Text>
                    </TouchableOpacity>
                </View>

                {method === 'manual' && (
                    <View style={PaymentStyle.manualBankSection}>
                        <Text style={[PaymentStyle.sectionTitle, {fontSize: 16, marginBottom: 12}]}>Available Bank Accounts</Text>
                        
                        {/* --- BANK ACCOUNTS GRID --- */}
                        <View style={PaymentStyle.bankGrid}>
                            {[
                                { name: 'BDO Unibank', acc: '0012-3456-7890' },
                                { name: 'BPI', acc: '9876-5432-10' },
                                { name: 'Metro Bank', acc: '0012-3456-7890' },
                                { name: 'Land Bank', acc: '9876-5432-10' },
                            ].map((bank, index) => (
                                <View key={index} style={PaymentStyle.bankGridCard}>
                                    <Text style={PaymentStyle.bankName}>{bank.name}</Text>
                                    <Text style={PaymentStyle.bankAccount}>{bank.acc}</Text>
                                    <Text style={PaymentStyle.bankHolder}>M&RC TRAVEL AND TOURS</Text>
                                </View>
                            ))}
                        </View>

                        {/* --- UPLOAD SECTION --- */}
                        <View style={PaymentStyle.uploadSection}>
                            <Text style={PaymentStyle.uploadTitle}>Upload Proof of Payment</Text>
                            <Text style={PaymentStyle.uploadSubtitle}>
                                Please upload a clear screenshot or photo of your deposit slip or transfer confirmation.
                            </Text>
                            <Text style={PaymentStyle.uploadConstraints}>
                                Accepted formats: JPG or PNG. Max size: 2MB.
                            </Text>
                            
                            <Text style={PaymentStyle.verificationNote}>
                                Note: Our team will manually verify your payment, which may take 1-2 business days. You will receive a confirmation email once your payment is verified.
                            </Text>

                            <TouchableOpacity style={PaymentStyle.selectImageBtn} onPress={pickImage}>
                                <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                                <Text style={PaymentStyle.selectImageBtnText}>Select Receipt Image</Text>
                            </TouchableOpacity>

                            <View style={PaymentStyle.imagePreviewContainer}>
                                <Text style={PaymentStyle.previewImageLabel}>Preview</Text>
                                <View style={PaymentStyle.previewImageBox}>
                                    {proofImage ? (
                                        <View style={PaymentStyle.imageWrapper}>
                                            <Image source={{ uri: proofImage.uri }} style={PaymentStyle.previewSelectedImage} resizeMode="contain" />
                                            <TouchableOpacity 
                                                style={PaymentStyle.removeImageBtn} 
                                                onPress={() => setProofImage(null)}
                                            >
                                                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <Text style={PaymentStyle.noImageText}>No image selected</Text>
                                    )}
                                </View>
                            </View>
                        </View>
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
                    style={{ width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 40, paddingVertical: 10 }} 
                    onPress={() => navigation.goBack()}
                >
                    <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#64748b', fontSize: 14, textAlign: 'center' }}>
                        Back to Mode
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}