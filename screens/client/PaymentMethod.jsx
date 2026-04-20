import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, StatusBar, Alert, ActivityIndicator, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking'; 
import dayjs from "dayjs";

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
    const [isProceedModalOpen, setIsProceedModalOpen] = useState(false);
    
    const { setupData, amountToPay, paymentType, frequency, passengers, travelerUploads, leadGuestInfo, medicalData, emergency } = route.params || {};

    const [method, setMethod] = useState('paymongo'); 
    const [proofImage, setProofImage] = useState(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], 
            allowsEditing: true,
            base64: true,
            quality: 0.5,
        });

        if (!result.canceled) {
            setProofImage(result.assets[0]);
        }
    };

    const handleProceedClick = () => {
        if (method === 'manual' && !proofImage) {
            Alert.alert("Missing Proof", "Please upload a photo of your deposit slip.");
            return;
        }
        setIsProceedModalOpen(true);
    };

    const getFileUri = (fileObj) => {
        if (!fileObj) return null;
        if (typeof fileObj === 'string') return fileObj;
        if (fileObj.uri) return fileObj.uri;
        return null;
    };

    // 🔥 STABLE UPLOADER USING AXIOS 🔥
    const uploadFilesToBackend = async (endpoint, formData) => {
        try {
            const response = await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...withUserHeader(user?._id).headers
                }
            });
            return response.data;
        } catch (error) {
            console.error("Upload Error inside Axios:", error.response?.data || error.message);
            throw error;
        }
    };

    const executePaymentFlow = async () => {
        setIsProceedModalOpen(false); 
        setLoading(true);

        try {
            const isExistingBooking = !!route.params.existingBookingId;
            const targetPackageId = route.params.existingPackageId || setupData?.pkg?._id || setupData?.pkg?.id;

            // ==========================================================
            // SCENARIO A: PAYING FOR AN EXISTING BOOKING
            // ==========================================================
            if (isExistingBooking) {
                if (method === 'manual') {
                    const receiptFormData = new FormData();
                    const filename = proofImage.uri.split('/').pop() || 'deposit.jpg';
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : `image/jpeg`;
                    
                    receiptFormData.append('file', { uri: proofImage.uri, name: filename, type });

                    try {
                        const receiptUpload = await uploadFilesToBackend('/upload/upload-receipt', receiptFormData);
                        const proofUrl = receiptUpload?.url || receiptUpload?.data?.url;

                        if (!proofUrl) {
                            throw new Error("No URL returned from server.");
                        }
                        
                        const manualPayload = {
                            bookingId: route.params.existingBookingId,
                            packageId: targetPackageId,
                            amount: amountToPay,
                            paymentType: paymentType || 'Full Payment',
                            proofImage: proofUrl,
                            proofImageType: proofImage.mimeType || 'image/jpeg',
                            proofFileName: proofImage.fileName || 'deposit_slip.jpg',
                            status: 'Pending' 
                        };

                        const response = await api.post('/payment/manual', manualPayload, withUserHeader(user?._id));
                        setLoading(false);
                        navigation.navigate("paymentsuccess", { reference: route.params.existingReference || response.data.reference, mode: 'manual' });
                        return; 
                    } catch (err) {
                        console.error("Receipt Upload Error:", err);
                        Alert.alert("Upload Error", "Failed to upload deposit slip. Please try again.");
                        setLoading(false);
                        return;
                    }
                } else {
                    // Existing Booking -> PayMongo
                    const successDeepLink = Linking.createURL('paymentsuccess', { queryParams: { reference: route.params.existingReference, mode: 'online' } });
                    const cancelDeepLink = Linking.createURL('paymentmethod');

                    const paymentPayload = {
                        bookingId: route.params.existingBookingId,
                        bookingReference: route.params.existingReference,
                        packageId: targetPackageId,
                        totalPrice: amountToPay,
                        leadEmail: user.email,
                        leadContact: leadGuestInfo?.contact || '', 
                        successUrl: successDeepLink,
                        cancelUrl: cancelDeepLink,
                    };

                    const response = await api.post('/payment/create-checkout-session', { paymentPayload }, withUserHeader(user?._id));
                    const checkoutUrl = response.data?.data?.attributes?.checkout_url;
                    setLoading(false); 
                    if (checkoutUrl) Linking.openURL(checkoutUrl);
                    return; 
                }
            }

            // ==========================================================
            // SCENARIO B: CREATING A BRAND NEW BOOKING
            // ==========================================================
            const adultCount = Number(setupData?.travelerCounts?.adult) || 0;
            const childCount = Number(setupData?.travelerCounts?.child) || 0;
            const infantCount = Number(setupData?.travelerCounts?.infant) || 0;
            const calculatedTravelers = (adultCount + childCount + infantCount) || (passengers?.length) || 1;

            const travelDateString = setupData?.selectedDate || setupData?.travelDate || "TBD";
            const [startDateStr, endDateStr] = travelDateString.split(" - ");
            const travelDateObj = {
                startDate: startDateStr?.trim() || travelDateString,
                endDate: endDateStr?.trim() || startDateStr?.trim() || travelDateString
            };

            const depositAmount = (setupData?.pkg?.packageDeposit || 0) * calculatedTravelers;

            // 1. EXTRACT & UPLOAD DOCUMENTS TO CLOUDINARY
            const safePassengers = Array.isArray(passengers) ? passengers : [];
            const formData = new FormData();
            const passportIndices = [];
            const photoIndices = [];
            let hasFilesToUpload = false;

            safePassengers.forEach((p, i) => {
                const tUpload = travelerUploads?.[i] || travelerUploads || {};
                const passUri = getFileUri(tUpload.passport || p.passportFile || p.passport);
                const photoUri = getFileUri(tUpload.photo || p.photoFile || p.photo);

                if (passUri && !passUri.startsWith('http')) {
                    const filename = passUri.split('/').pop() || `passport_${i}.jpg`;
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : `image/jpeg`;
                    formData.append('files', { uri: passUri, name: filename, type });
                    passportIndices.push(i);
                    hasFilesToUpload = true;
                }
                if (photoUri && !photoUri.startsWith('http')) {
                    const filename = photoUri.split('/').pop() || `photo_${i}.jpg`;
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : `image/jpeg`;
                    formData.append('files', { uri: photoUri, name: filename, type });
                    photoIndices.push(i);
                    hasFilesToUpload = true;
                }
            });

            let uploadedUrls = [];
            if (hasFilesToUpload) {
                try {
                    const uploadResult = await uploadFilesToBackend('/upload/upload-booking-documents', formData);
                    uploadedUrls = uploadResult?.urls || uploadResult?.url || [];
                } catch (err) {
                    console.error("Doc Upload Error:", err);
                    Alert.alert("Upload Error", "Failed to upload traveler documents. Please try again.");
                    setLoading(false);
                    return; 
                }
            }

            // 2. UNIVERSAL TRANSLATOR
            let urlIndex = 0;
            const mappedTravelers = safePassengers.map((p, i) => {
                const tUpload = travelerUploads?.[i] || travelerUploads || {};
                let finalPassportUrl = getFileUri(tUpload.passport || p.passportFile || p.passport);
                let finalPhotoUrl = getFileUri(tUpload.photo || p.photoFile || p.photo);

                if (passportIndices.includes(i)) finalPassportUrl = uploadedUrls[urlIndex++];
                if (photoIndices.includes(i)) finalPhotoUrl = uploadedUrls[urlIndex++];

                return {
                    title: p.title || 'MR',
                    firstName: p.firstName || '',
                    lastName: p.lastName || '',
                    roomType: p.room || p.roomType || 'N/A', 
                    age: p.age?.toString() || '0',
                    birthday: p.bday || p.birthday || p.birthdate || null, 
                    passportNo: p.passport || p.passportNo || 'N/A', 
                    passportExpiry: p.expiry || p.passportExpiry || null, 
                    passportFile: finalPassportUrl,
                    photoFile: finalPhotoUrl
                };
            });

            const rootPassportFiles = mappedTravelers.map(t => t.passportFile).filter(Boolean);
            const rootPhotoFiles = mappedTravelers.map(t => t.photoFile).filter(Boolean);

            // 3. FORMAT EXACT WEB JSON STRUCTURE
            const mappedBookingDetails = {
                dateOfRegistration: dayjs().format("MM/DD/YYYY"),
                travelDate: travelDateString, 
                tourPackageTitle: setupData?.pkg?.title || setupData?.pkg?.packageName || "Tour Package",
                tourPackageVia: setupData?.pkg?.via || setupData?.airline || "N/A",
                leadTitle: leadGuestInfo?.title || "MR",
                leadFullName: leadGuestInfo?.fullName || `${user?.firstname || ''} ${user?.lastname || ''}`.trim(),
                leadEmail: user?.email,
                leadContact: leadGuestInfo?.contact || user?.phonenum || "",
                leadAddress: leadGuestInfo?.address || "",
                travelers: mappedTravelers, 
                passportFiles: rootPassportFiles, 
                photoFiles: rootPhotoFiles,
                dietaryDetails: medicalData?.dietaryDetails || "",
                dietaryRequest: medicalData?.dietary === 'Yes' ? "Y" : "N",
                medicalDetails: medicalData?.medicalDetails || "",
                medicalRequest: medicalData?.medical === 'Yes' ? "Y" : "N",
                purchaseInsurance: medicalData?.insurance === 'Yes' ? "Y" : "N",
                ownInsurance: "N",
                totalPrice: setupData?.totalPrice || amountToPay || 0, 
                emergencyContact: emergency?.contact || "",
                emergencyEmail: emergency?.email || "",
                emergencyName: emergency?.fullName || "",
                emergencyRelation: emergency?.relation || "",
                emergencyTitle: emergency?.title || "MR",
                paymentDetails: {
                    paymentType: paymentType || 'deposit',
                    frequency: frequency || 'Every 2 weeks',
                    depositAmount: depositAmount
                }
            };

            const initialBookingStatus = method === 'manual' ? 'Pending' : 'Not Paid';

            const finalBookingPayload = {
                packageId: targetPackageId, 
                checkoutToken: `mobile-tok-${Date.now()}`,
                travelDate: travelDateObj, 
                travelers: calculatedTravelers, 
                passportFiles: rootPassportFiles,
                photoFiles: rootPhotoFiles,
                bookingDetails: mappedBookingDetails,
                status: initialBookingStatus 
            };

            // Create the booking!
            const bookingSaved = await api.post('/booking/create-booking', finalBookingPayload, withUserHeader(user?._id));
            const newBookingId = bookingSaved.data?.booking?._id || bookingSaved.data?.bookingId || bookingSaved.data?._id; 
            const bookingRef = bookingSaved.data?.booking?.reference || bookingSaved.data?.reference || 'PENDING';

            // ==========================================================
            // SCENARIO B.1: MANUAL PAYMENT PROCESSING
            // ==========================================================
            if (method === 'manual') {
                const receiptFormData = new FormData();
                const filename = proofImage.uri.split('/').pop() || 'deposit.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                
                receiptFormData.append('file', { uri: proofImage.uri, name: filename, type });

                try {
                    const receiptUpload = await uploadFilesToBackend('/upload/upload-receipt', receiptFormData);
                    const proofUrl = receiptUpload?.url || receiptUpload?.data?.url;

                    if (!proofUrl) {
                        throw new Error("No URL returned from server.");
                    }

                    const manualPayload = {
                        bookingId: newBookingId,
                        packageId: targetPackageId,
                        amount: amountToPay,
                        paymentType: paymentType || 'Full Payment',
                        proofImage: proofUrl,
                        proofImageType: proofImage.mimeType || 'image/jpeg',
                        proofFileName: proofImage.fileName || 'deposit_slip.jpg',
                        status: 'Pending' // Explicitly Pending for manual review
                    };

                    await api.post('/payment/manual', manualPayload, withUserHeader(user?._id));
                    setLoading(false);
                    navigation.navigate("paymentsuccess", { reference: bookingRef, mode: 'manual' });
                } catch (err) {
                    Alert.alert("Upload Error", "Failed to upload deposit slip.");
                    setLoading(false);
                    return;
                }

            } 
            // ==========================================================
            // SCENARIO B.2: PAYMONGO PROCESSING
            // ==========================================================
            else {
                const successDeepLink = Linking.createURL('paymentsuccess', { queryParams: { reference: bookingRef, mode: 'online' } });
                const cancelDeepLink = Linking.createURL('paymentmethod');

                const paymentPayload = {
                    bookingId: newBookingId,
                    bookingReference: bookingRef,
                    packageId: targetPackageId,
                    totalPrice: amountToPay,
                    travelDate: travelDateObj, 
                    travelers: calculatedTravelers, 
                    leadEmail: user.email,
                    leadContact: leadGuestInfo?.contact || '', 
                    successUrl: successDeepLink,
                    cancelUrl: cancelDeepLink,
                };

                const response = await api.post('/payment/create-checkout-session', { paymentPayload }, withUserHeader(user?._id));
                const checkoutUrl = response.data?.data?.attributes?.checkout_url;

                setLoading(false); 

                if (checkoutUrl) {
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
                
                <TouchableOpacity 
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#305797', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 16 }} 
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={16} color="#fff" />
                    <Text style={{ color: '#fff', fontFamily: 'Montserrat_600SemiBold', marginLeft: 6, fontSize: 14 }}>Back</Text>
                </TouchableOpacity>

                <Text style={PaymentStyle.sectionTitle}>Payment Methods</Text>
                <Text style={PaymentStyle.sectionSubtitle}>Select a payment method to complete your booking.</Text>

                <View style={PaymentStyle.progressContainer}>
                    <View style={[PaymentStyle.progressStep, {backgroundColor: '#305797'}]}><Ionicons name="checkmark" size={14} color="#fff" /></View>
                    <View style={[PaymentStyle.progressLine, {backgroundColor: '#305797'}]} />
                    <View style={[PaymentStyle.progressStep, PaymentStyle.progressStepActive]}><Text style={PaymentStyle.progressText}>2</Text></View>
                </View>

                {/* --- HORIZONTAL CARDS --- */}
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
                            <Text style={PaymentStyle.uploadSubtitle}>Please upload a clear screenshot or photo of your deposit slip.</Text>
                            
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
            </ScrollView>

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

const localStyles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalBox: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 24, paddingTop: 35, alignItems: 'center', elevation: 5 },
    closeIcon: { position: 'absolute', top: 10, right: 10, padding: 5 },
    modalTitle: { fontFamily: 'Montserrat_700Bold', fontSize: 22, color: '#305797', marginBottom: 12 },
    modalSubtitle: { fontFamily: 'Roboto_400Regular', fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 25 },
    modalButtonRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 12 },
    proceedBtn: { flex: 1, backgroundColor: '#305797', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    proceedBtnText: { fontFamily: 'Montserrat_600SemiBold', color: '#fff', fontSize: 14 },
    cancelBtn: { flex: 1, backgroundColor: '#9f2b46', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    cancelBtnText: { fontFamily: 'Montserrat_600SemiBold', color: '#fff', fontSize: 14 }
});