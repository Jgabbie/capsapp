import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, StatusBar, Alert, ActivityIndicator, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking'; // 🔥 Used for opening browser AND creating return deep links

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
    
    // Custom Modal State
    const [isProceedModalOpen, setIsProceedModalOpen] = useState(false);
    
    const { setupData, amountToPay, paymentType, travelerUploads, passengers, leadGuestInfo, medicalData, emergency } = route.params || {};

    const [method, setMethod] = useState('paymongo'); 
    const [proofImage, setProofImage] = useState(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            base64: true,
            quality: 0.5,
        });

        if (!result.canceled) {
            setProofImage(result.assets[0]);
        }
    };

    // Triggered when "Confirm & Proceed" is clicked at the bottom
    const handleProceedClick = () => {
        if (method === 'manual' && !proofImage) {
            Alert.alert("Missing Proof", "Please upload a photo of your deposit slip.");
            return;
        }
        // Open the custom modal
        setIsProceedModalOpen(true);
    };

    // Triggered when "Proceed" is clicked INSIDE the modal
    const executePaymentFlow = async () => {
        setIsProceedModalOpen(false); // Close the modal
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
                // ONLINE FLOW
                // 1. Create booking FIRST as PENDING (Not paid)
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

                // 🔥 2. Dynamically create Deep Links for the Return to Merchant button
                // This ensures it works flawlessly on both Expo Go and Standalone Apps
                const successDeepLink = Linking.createURL('paymentsuccess', { 
                    queryParams: { reference: bookingRef, mode: 'online' } 
                });
                const cancelDeepLink = Linking.createURL('paymentmethod');

                // 3. Send payload to PayMongo
                const paymentPayload = {
                    bookingId: newBookingId,
                    bookingReference: bookingRef,
                    packageId: setupData.pkg._id || setupData.pkg.id,
                    totalPrice: amountToPay,
                    travelDate: setupData.selectedDate,
                    travelers: calculatedTravelers, 
                    leadEmail: user.email,
                    leadContact: leadGuestInfo?.contact || '', 
                    successUrl: successDeepLink, // Sent to PayMongo!
                    cancelUrl: cancelDeepLink,
                };

                const response = await api.post('/payment/create-checkout-session', { paymentPayload }, withUserHeader(user?._id));
                const checkoutUrl = response.data?.data?.attributes?.checkout_url;

                setLoading(false); // Stop loading, we are done saving!

                if (checkoutUrl) {
                    // 4. Open Real Browser. 
                    // NOTICE: There is NO navigation.navigate here. The app stays on this screen!
                    // If they close the browser, they stay right here. The booking is safely in DB as Pending.
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

                        <View style={PaymentStyle.uploadSection}>
                            <Text style={PaymentStyle.uploadTitle}>Upload Proof of Payment</Text>
                            <Text style={PaymentStyle.uploadSubtitle}>Please upload a clear screenshot or photo of your deposit slip or transfer confirmation.</Text>
                            <Text style={PaymentStyle.uploadConstraints}>Accepted formats: JPG or PNG. Max size: 2MB.</Text>
                            <Text style={PaymentStyle.verificationNote}>Note: Our team will manually verify your payment, which may take 1-2 business days. You will receive a confirmation email once your payment is verified.</Text>

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
                                            <TouchableOpacity style={PaymentStyle.removeImageBtn} onPress={() => setProofImage(null)}>
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
                    onPress={handleProceedClick}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={QuotationAllInStyle.proceedButtonText}>Confirm & Proceed</Text>}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={{ width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 40, paddingVertical: 10 }} 
                    onPress={() => navigation.goBack()}
                >
                    <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#64748b', fontSize: 14, textAlign: 'center' }}>Back to Mode</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* 🔥 CUSTOM PROCEED MODAL FROM SCREENSHOT 🔥 */}
            <Modal visible={isProceedModalOpen} transparent animationType="fade">
                <View style={localStyles.modalOverlay}>
                    <View style={localStyles.modalBox}>
                        <TouchableOpacity style={localStyles.closeIcon} onPress={() => setIsProceedModalOpen(false)}>
                            <Ionicons name="close" size={24} color="#9ca3af" />
                        </TouchableOpacity>
                        
                        <Text style={localStyles.modalTitle}>Proceed to Payment</Text>
                        <Text style={localStyles.modalSubtitle}>Are you sure you want to proceed with the payment?</Text>
                        
                        <View style={localStyles.modalButtonRow}>
                            <TouchableOpacity style={localStyles.proceedBtn} onPress={executePaymentFlow}>
                                <Text style={localStyles.proceedBtnText}>Proceed</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={localStyles.cancelBtn} onPress={() => setIsProceedModalOpen(false)}>
                                <Text style={localStyles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// Custom styles for the Modal
const localStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalBox: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        paddingTop: 35,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    closeIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
    },
    modalTitle: {
        fontFamily: 'Montserrat_700Bold',
        fontSize: 22,
        color: '#305797',
        marginBottom: 12,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 20,
    },
    modalButtonRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        gap: 12,
    },
    proceedBtn: {
        flex: 1,
        backgroundColor: '#305797',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    proceedBtnText: {
        fontFamily: 'Montserrat_600SemiBold',
        color: '#fff',
        fontSize: 14,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#9f2b46', // Matching the deep red from your screenshot
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelBtnText: {
        fontFamily: 'Montserrat_600SemiBold',
        color: '#fff',
        fontSize: 14,
    }
});