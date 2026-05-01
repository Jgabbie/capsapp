import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Linking, Modal, Platform, TouchableWithoutFeedback, TextInput, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import dayjs from "dayjs";
import DateTimePicker from '@react-native-community/datetimepicker';

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import PaymentStyle from "../../styles/clientstyles/PaymentStyle";
import PassportProgressStyle from "../../styles/clientstyles/PassportProgressStyle";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";

export default function PassportProgress() {
    const cs = useNavigation()
    const route = useRoute()
    const { user } = useUser()
    const [isSidebarVisible, setSidebarVisible] = useState(false)

    const applicationId = route.params?.applicationId;

    const [application, setApplication] = useState(null)
    const [loading, setLoading] = useState(true)

    const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(null);
    const [customPreferredDate, setCustomPreferredDate] = useState(null);
    const [customPreferredTime, setCustomPreferredTime] = useState(null);
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);
    const [confirmingSchedule, setConfirmingSchedule] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('paymongo');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [proofImage, setProofImage] = useState(null);
    const [creatingPayment, setCreatingPayment] = useState(false);
    const [uploadingDocumentKey, setUploadingDocumentKey] = useState(null);
    const [uploadedDocuments, setUploadedDocuments] = useState({});

    const normalizeScheduleSlot = (slot) => {
        if (!slot || typeof slot !== 'object') {
            return { date: '', time: '' };
        }

        const rawDate = slot.date || slot.preferredDate || slot.appointmentDate || slot.scheduleDate || '';
        const rawTime = slot.time || slot.preferredTime || slot.appointmentTime || slot.scheduleTime || '';

        const parsedDate = rawDate ? dayjs(rawDate) : null;
        const date = parsedDate?.isValid() ? parsedDate.format('YYYY-MM-DD') : String(rawDate || '');

        let time = '';
        if (rawTime) {
            const parsedTime = dayjs(String(rawTime), ['HH:mm', 'H:mm', 'hh:mm A', 'h:mm A', 'HH:mm:ss'], true);
            time = parsedTime.isValid() ? parsedTime.format('HH:mm') : String(rawTime);
        } else if (parsedDate?.isValid()) {
            time = parsedDate.format('HH:mm');
        }

        return { date, time };
    };

    const fetchApplicationDetails = async () => {
        if (!user?._id || !applicationId) return;

        try {
            setLoading(true);
            const appRes = await api.get('/passport/applications', withUserHeader(user._id));
            const appData = appRes.data.find(app => app._id === applicationId);

            if (!appData) throw new Error("Application not found in your list.");

            setApplication(appData);
            setUploadedDocuments(appData.submittedDocuments || {});
        } catch (error) {
            console.log("Error fetching details:", error.message);
            Alert.alert('Error', 'Unable to load application details.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchApplicationDetails();
    }, [user?._id, applicationId]);

    const handleConfirmSchedule = async () => {
        if (selectedScheduleIndex === null) {
            Alert.alert("Notice", "Please select an appointment option first.");
            return;
        }

        const isOthersOption = selectedScheduleIndex === 'others';
        const selected = isOthersOption
            ? {
                date: customPreferredDate ? dayjs(customPreferredDate).format('YYYY-MM-DD') : '',
                time: customPreferredTime ? dayjs(customPreferredTime).format('HH:mm') : ''
            }
            : normalizeScheduleSlot(appointmentOptions[selectedScheduleIndex]);

        if (!selected?.date || !selected?.time) {
            Alert.alert("Error", "Please provide both date and time.");
            return;
        }

        try {
            setConfirmingSchedule(true);
            await api.put(`/passport/applications/${application._id}/choose-appointment`, {
                date: selected.date,
                time: selected.time
            }, withUserHeader(user._id));

            Alert.alert("Success", "Appointment schedule confirmed!");
            setSelectedScheduleIndex(null);
            setCustomPreferredDate(null);
            setCustomPreferredTime(null);
            setShowCustomDatePicker(false);
            setShowCustomTimePicker(false);

            await fetchApplicationDetails();
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to confirm appointment schedule.');
        } finally {
            setConfirmingSchedule(false);
        }
    };

    const openDocument = (url) => {
        if (url) Linking.openURL(url).catch(err => console.error("Couldn't open document", err));
    };

    const pickProofImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            base64: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setProofImage(result.assets[0]);
        }
    };

    const uploadFilesToBackend = async (endpoint, formData) => {
        const response = await api.post(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...withUserHeader(user?._id).headers,
            },
        });

        return response.data;
    };

    const pickAndUploadPassportDocument = async (documentKey) => {
        if (!application?._id) return;

        const picked = await DocumentPicker.getDocumentAsync({
            type: ['image/*', 'application/pdf'],
            copyToCacheDirectory: true,
            multiple: false,
        });

        if (picked.canceled) return;

        const file = picked.assets?.[0];
        if (!file?.uri) {
            Alert.alert('Error', 'No file selected.');
            return;
        }

        const formData = new FormData();
        if (Platform.OS === 'web' && file.file) {
            formData.append('files', file.file, file.name || `${documentKey}-${Date.now()}`);
        } else {
            formData.append('files', {
                uri: file.uri,
                name: file.name || `${documentKey}-${Date.now()}`,
                type: file.mimeType || 'application/octet-stream',
            });
        }

        try {
            setUploadingDocumentKey(documentKey);

            const uploadRes = await uploadFilesToBackend('/upload/upload-booking-documents', formData);
            const uploadedUrl = uploadRes?.urls?.[0];

            if (!uploadedUrl) {
                throw new Error('Failed to upload document');
            }

            const nextDocuments = {
                ...uploadedDocuments,
                [documentKey]: uploadedUrl,
            };

            await api.put(`/passport/applications/${application._id}/documents`, {
                submittedDocuments: nextDocuments,
            }, withUserHeader(user._id));

            setUploadedDocuments(nextDocuments);
            Alert.alert('Success', 'Document uploaded successfully.');
            await fetchApplicationDetails();
        } catch (error) {
            Alert.alert('Error', error?.response?.data?.message || error.message || 'Unable to upload document.');
        } finally {
            setUploadingDocumentKey(null);
        }
    };

    const handleStartPayment = async () => {
        if (!paymentAmount || Number.isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
            Alert.alert('Error', 'Please enter a valid payment amount.');
            return;
        }

        if (paymentMethod === 'manual' && !proofImage) {
            Alert.alert('Missing Proof', 'Please upload a photo of your deposit slip.');
            return;
        }

        try {
            setCreatingPayment(true);

            if (paymentMethod === 'manual') {
                const receiptFormData = new FormData();
                const filename = proofImage?.fileName || proofImage?.uri?.split('/').pop() || 'deposit_slip.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = proofImage?.mimeType || (match ? `image/${match[1]}` : 'image/jpeg');

                receiptFormData.append('file', {
                    uri: proofImage.uri,
                    name: filename,
                    type,
                });

                const receiptUpload = await uploadFilesToBackend('/upload/upload-receipt', receiptFormData);
                const proofUrl = receiptUpload?.url || receiptUpload?.data?.url;

                if (!proofUrl) {
                    throw new Error('Failed to upload proof of payment');
                }

                const manualPayload = {
                    packageId: application.packageId || null,
                    travelDate: {
                        startDate: application.preferredDate,
                        endDate: application.preferredDate,
                    },
                    travelerTotal: 1,
                    amount: Number(paymentAmount),
                    paymentType: 'Full Payment',
                    proofImage: proofUrl,
                    proofImageType: type,
                    proofFileName: filename,
                    bookingDetails: {
                        applicationId: application._id,
                        applicationNumber: application.applicationNumber,
                        applicantName: application.username,
                        applicationType: application.applicationType,
                        preferredDate: application.preferredDate,
                        preferredTime: application.preferredTime,
                    },
                };

                await api.post('/pay/manual-passport', manualPayload, withUserHeader(user._id));
                cs.navigate('successfulmanualpaymentpassport');
                return;
            }

            // 1) create a short-lived checkout token
            const tokenRes = await api.post('/pay/create-checkout-token', {
                totalPrice: Number(paymentAmount),
                bookingId: application._id
            }, withUserHeader(user._id));

            const token = tokenRes.data?.token;
            if (!token) throw new Error('Failed to create checkout token');

            // 2) create checkout session using the token
            const sessionRes = await api.post('/pay/create-checkout-session-passport', {
                checkoutToken: token,
                totalPrice: Number(paymentAmount),
                packageName: 'Passport Application',
                applicationId: application._id,
                applicationNumber: application.applicationNumber,
                successUrl: '',
                cancelUrl: ''
            }, withUserHeader(user._id));

            const hostedUrl = sessionRes.data?.data?.attributes?.hosted_url || sessionRes.data?.data?.attributes?.url || sessionRes.data?.redirectUrl || sessionRes.data?.url;
            if (hostedUrl) {
                Linking.openURL(hostedUrl).catch(() => {
                    Alert.alert('Payment', 'Unable to open payment URL.');
                });
            } else {
                Alert.alert('Payment', 'Checkout session created. Complete payment on the next screen.');
            }

        } catch (error) {
            console.error('Payment start error:', error?.response?.data || error.message || error);
            Alert.alert('Error', 'Failed to initiate payment.');
        } finally {
            setCreatingPayment(false);
        }
    };

    const appStatus = useMemo(() => {
        if (!application?.status) return "Application submitted";
        return Array.isArray(application.status) ? application.status[0] : application.status;
    }, [application]);

    const steps = [
        "Application Submitted",
        "Application Approved",
        "Payment Complete",
        "Documents Uploaded",
        "Documents Approved",
        "Documents Received",
        "Documents Submitted",
        "Processing by DFA",
        "DFA Approved",
        "Passport Released"
    ];

    const currentStepIndex = useMemo(() => {
        const index = steps.findIndex(s => s.toLowerCase() === appStatus.toLowerCase());
        return Math.max(0, index);
    }, [steps, appStatus]);

    const appointmentOptions = useMemo(() => {
        if (Array.isArray(application?.suggestedAppointmentSchedules) && application.suggestedAppointmentSchedules.length > 0) {
            return application.suggestedAppointmentSchedules;
        }

        if (application?.preferredDate && application?.preferredTime) {
            return [{ date: application.preferredDate, time: application.preferredTime }];
        }

        return [];
    }, [application]);

    const passportRequirements = useMemo(() => ([
        { key: 'passportPhoto', label: 'Passport Photo' },
        { key: 'birthCertificate', label: 'Birth Certificate' },
        { key: 'applicationForm', label: 'Application Form' },
        { key: 'govId', label: 'Government ID' },
        { key: 'oldPassport', label: 'Old Passport' },
    ]), []);

    const isOthersSelected = selectedScheduleIndex === 'others';
    const canConfirmSchedule = selectedScheduleIndex !== null && !confirmingSchedule && (
        !isOthersSelected || (customPreferredDate && customPreferredTime)
    );

    const handleCustomDateChange = (_event, selectedDate) => {
        if (selectedDate) {
            setCustomPreferredDate(selectedDate);
        }
        if (Platform.OS !== 'ios') {
            setShowCustomDatePicker(false);
        }
    };

    const handleCustomTimeChange = (_event, selectedTime) => {
        if (selectedTime) {
            setCustomPreferredTime(selectedTime);
        }
        if (Platform.OS !== 'ios') {
            setShowCustomTimePicker(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f5f7fa', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#305797" />
                <Text style={{ marginTop: 10, color: '#6b7280' }}>Loading details...</Text>
            </View>
        );
    }

    if (!application) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f5f7fa', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#6b7280' }}>Application not found.</Text>
                <TouchableOpacity onPress={() => cs.goBack()} style={{ marginTop: 20, padding: 10, backgroundColor: '#305797', borderRadius: 8 }}>
                    <Text style={{ color: '#fff' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={PassportProgressStyle.container}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={PassportProgressStyle.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={PassportProgressStyle.headerContainer}>
                    <TouchableOpacity onPress={() => cs.goBack()} style={PassportProgressStyle.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text style={PassportProgressStyle.title}>Passport Details</Text>
                </View>

                {/* Application Info Card */}
                <View style={PassportProgressStyle.card}>
                    <Text style={PassportProgressStyle.cardTitle}>Application Info</Text>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Reference</Text>
                        <Text style={PassportProgressStyle.infoValue}>{application.applicationNumber || application.applicationId || application._id}</Text>
                    </View>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Status</Text>
                        <View style={PassportProgressStyle.statusTag}>
                            <Text style={PassportProgressStyle.statusText}>{appStatus}</Text>
                        </View>
                    </View>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Date Submitted</Text>
                        <Text style={PassportProgressStyle.infoValue}>{dayjs(application.createdAt).format('MMM D, YYYY')}</Text>
                    </View>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Applicant Name</Text>
                        <Text style={PassportProgressStyle.infoValue}>{application.username || 'N/A'}</Text>
                    </View>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>DFA Location</Text>
                        <Text style={PassportProgressStyle.infoValue}>{application.dfaLocation}</Text>
                    </View>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Preferred Date</Text>
                        <Text style={PassportProgressStyle.infoValue}>{dayjs(application.preferredDate).format('MMM D, YYYY')}</Text>
                    </View>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Preferred Time</Text>
                        <Text style={PassportProgressStyle.infoValue}>{application.preferredTime}</Text>
                    </View>

                    <View style={[PassportProgressStyle.infoRow, { borderBottomWidth: 0 }]}>
                        <Text style={PassportProgressStyle.infoLabel}>Application Type</Text>
                        <Text style={[PassportProgressStyle.infoValue, { fontFamily: 'Montserrat_700Bold', color: '#305797' }]}>
                            {application.applicationType}
                        </Text>
                    </View>
                </View>

                {/* Payment Card: show when application is approved */}
                {appStatus.toLowerCase() === 'application approved' && (
                    <View style={PassportProgressStyle.card}>
                        <Text style={PassportProgressStyle.cardTitle}>Application Payment</Text>
                        <Text style={{ color: '#6b7280', marginBottom: 12, fontSize: 13 }}>Complete payment for your passport application to proceed.</Text>

                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                            <TouchableOpacity
                                onPress={() => setPaymentMethod('paymongo')}
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: paymentMethod === 'paymongo' ? '#305797' : '#d1d5db',
                                    backgroundColor: paymentMethod === 'paymongo' ? '#eaf1ff' : '#fff',
                                    borderRadius: 12,
                                    padding: 14,
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1f2937' }}>Paymongo</Text>
                                    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: paymentMethod === 'paymongo' ? '#305797' : '#9ca3af', alignItems: 'center', justifyContent: 'center' }}>
                                        {paymentMethod === 'paymongo' && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#305797' }} />}
                                    </View>
                                </View>
                                <Text style={{ fontSize: 12, color: '#6b7280' }}>Pay securely through card, GCash, GrabPay, Maya, or QRPH.</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setPaymentMethod('manual')}
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: paymentMethod === 'manual' ? '#305797' : '#d1d5db',
                                    backgroundColor: paymentMethod === 'manual' ? '#eaf1ff' : '#fff',
                                    borderRadius: 12,
                                    padding: 14,
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1f2937' }}>Manual</Text>
                                    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: paymentMethod === 'manual' ? '#305797' : '#9ca3af', alignItems: 'center', justifyContent: 'center' }}>
                                        {paymentMethod === 'manual' && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#305797' }} />}
                                    </View>
                                </View>
                                <Text style={{ fontSize: 12, color: '#6b7280' }}>Upload your proof of payment for manual verification.</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            value={paymentAmount}
                            onChangeText={setPaymentAmount}
                            placeholder="Amount (e.g. 500)"
                            keyboardType="numeric"
                            style={{ borderWidth: 1, borderColor: '#e5e7eb', padding: 12, borderRadius: 8, marginBottom: 12, backgroundColor: '#fff' }}
                        />

                        {paymentMethod === 'manual' && (
                            <View style={{ marginBottom: 14 }}>
                                <View style={PaymentStyle.manualBankSection}>
                                    <Text style={[PaymentStyle.sectionTitle, { fontSize: 16, marginBottom: 12 }]}>Available Bank Accounts</Text>
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
                                        <Text style={PaymentStyle.uploadSubtitle}>Accepted formats: JPG or PNG. Max size: 2MB.</Text>
                                        <Text style={[PaymentStyle.uploadSubtitle, { color: '#ef4444', fontStyle: 'italic', marginTop: 4 }]}>Our team will manually verify your payment within 1-2 business days.</Text>

                                        <TouchableOpacity style={PaymentStyle.selectImageBtn} onPress={pickProofImage}>
                                            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                                            <Text style={PaymentStyle.selectImageBtnText}>{proofImage ? 'Change Proof Image' : 'Select Receipt Image'}</Text>
                                        </TouchableOpacity>

                                        {proofImage && (
                                            <View style={PaymentStyle.imagePreviewContainer}>
                                                <Text style={PaymentStyle.previewImageLabel}>Preview</Text>
                                                <View style={PaymentStyle.previewImageBox}>
                                                    <View style={PaymentStyle.imageWrapper}>
                                                        <Image source={{ uri: proofImage.uri }} style={PaymentStyle.previewSelectedImage} resizeMode="contain" />
                                                        <TouchableOpacity style={PaymentStyle.removeImageBtn} onPress={() => setProofImage(null)}>
                                                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[PassportProgressStyle.submitBtn, creatingPayment && { opacity: 0.7 }]}
                            disabled={creatingPayment || (paymentMethod === 'manual' && !proofImage)}
                            onPress={handleStartPayment}
                        >
                            {creatingPayment ? <ActivityIndicator color="#fff" /> : <Text style={PassportProgressStyle.submitBtnText}>{paymentMethod === 'manual' ? 'Submit Manual Payment' : 'Pay with Paymongo'}</Text>}
                        </TouchableOpacity>
                    </View>
                )}

                {appStatus.toLowerCase() === 'payment complete' && (
                    <View style={PassportProgressStyle.card}>
                        <Text style={PassportProgressStyle.cardTitle}>Upload Files</Text>
                        <Text style={{ color: '#6b7280', marginBottom: 12, fontSize: 13 }}>Upload the required passport documents below.</Text>

                        <View style={{ gap: 12 }}>
                            {passportRequirements.map((doc) => {
                                const uploadedUrl = uploadedDocuments[doc.key] || application?.submittedDocuments?.[doc.key];

                                return (
                                    <View key={doc.key} style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, backgroundColor: '#fff' }}>
                                        <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1f2937', marginBottom: 6 }}>{doc.label}</Text>
                                        <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 10 }}>PDF, JPG, or PNG</Text>

                                        <TouchableOpacity
                                            onPress={() => pickAndUploadPassportDocument(doc.key)}
                                            style={{
                                                backgroundColor: '#305797',
                                                borderRadius: 10,
                                                paddingVertical: 12,
                                                alignItems: 'center',
                                                opacity: uploadingDocumentKey === doc.key ? 0.7 : 1,
                                            }}
                                            disabled={uploadingDocumentKey === doc.key}
                                        >
                                            {uploadingDocumentKey === doc.key ? (
                                                <ActivityIndicator color="#fff" />
                                            ) : (
                                                <Text style={{ color: '#fff', fontFamily: 'Montserrat_600SemiBold' }}>
                                                    {uploadedUrl ? 'Replace File' : 'Upload File'}
                                                </Text>
                                            )}
                                        </TouchableOpacity>

                                        {uploadedUrl ? (
                                            <Text style={{ color: '#16a34a', fontSize: 12, marginTop: 8 }}>File uploaded</Text>
                                        ) : null}
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}


                {appStatus.toLowerCase() === 'application submitted' && (
                    <View style={PassportProgressStyle.card}>
                        <Text style={PassportProgressStyle.cardTitle}>Suggested Appointment Options</Text>

                        {appointmentOptions.length > 0 ? (
                            <>
                                <Text style={{ color: '#6b7280', marginBottom: 15, fontSize: 13 }}>Please select a date and time for your DFA appointment.</Text>

                                {appointmentOptions.map((slot, index) => (
                                    (() => {
                                        const normalizedSlot = normalizeScheduleSlot(slot);
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    PassportProgressStyle.optionCard,
                                                    selectedScheduleIndex === index && PassportProgressStyle.optionCardSelected
                                                ]}
                                                onPress={() => setSelectedScheduleIndex(index)}
                                            >
                                                <View style={PassportProgressStyle.optionTag}>
                                                    <Text style={PassportProgressStyle.optionTagText}>Option {index + 1}</Text>
                                                </View>
                                                <Text style={PassportProgressStyle.optionDate}>
                                                    {normalizedSlot.date ? dayjs(normalizedSlot.date).format("MMM DD, YYYY") : 'No date provided'}
                                                </Text>
                                                <Text style={PassportProgressStyle.optionTime}>{normalizedSlot.time || 'No time provided'}</Text>
                                            </TouchableOpacity>
                                        );
                                    })()
                                ))}

                                <TouchableOpacity
                                    style={[
                                        PassportProgressStyle.optionCard,
                                        isOthersSelected && PassportProgressStyle.optionCardSelected
                                    ]}
                                    onPress={() => setSelectedScheduleIndex('others')}
                                >
                                    <View style={PassportProgressStyle.optionTag}>
                                        <Text style={PassportProgressStyle.optionTagText}>Others</Text>
                                    </View>
                                    <Text style={PassportProgressStyle.optionDate}>Enter your preferred date and time</Text>
                                    <Text style={PassportProgressStyle.optionTime}>Pick both values from the native date and time pickers.</Text>

                                    {isOthersSelected && (
                                        <View style={{ marginTop: 14 }}>
                                            <TouchableOpacity
                                                onPress={() => setShowCustomDatePicker(true)}
                                                style={{
                                                    borderWidth: 1,
                                                    borderColor: '#d1d5db',
                                                    borderRadius: 8,
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 12,
                                                    marginBottom: 10,
                                                    backgroundColor: '#fff',
                                                }}
                                            >
                                                <Text style={{ color: customPreferredDate ? '#1f2937' : '#9ca3af', fontFamily: 'Roboto_400Regular' }}>
                                                    {customPreferredDate ? dayjs(customPreferredDate).format('MMM D, YYYY') : 'Select Preferred Date'}
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => setShowCustomTimePicker(true)}
                                                style={{
                                                    borderWidth: 1,
                                                    borderColor: '#d1d5db',
                                                    borderRadius: 8,
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 12,
                                                    backgroundColor: '#fff',
                                                }}
                                            >
                                                <Text style={{ color: customPreferredTime ? '#1f2937' : '#9ca3af', fontFamily: 'Roboto_400Regular' }}>
                                                    {customPreferredTime ? dayjs(customPreferredTime).format('hh:mm A') : 'Select Preferred Time'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[PassportProgressStyle.submitBtn, !canConfirmSchedule && { opacity: 0.5 }]}
                                    disabled={!canConfirmSchedule}
                                    onPress={handleConfirmSchedule}
                                >
                                    {confirmingSchedule ? <ActivityIndicator color="#fff" /> : <Text style={PassportProgressStyle.submitBtnText}>Confirm Selected Date</Text>}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <Text style={{ color: '#6b7280', fontSize: 14 }}>No suggested dates yet. Please check back later.</Text>
                        )}
                    </View>
                )}

                <Modal visible={showCustomDatePicker} transparent animationType="fade" onRequestClose={() => setShowCustomDatePicker(false)}>
                    <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 }} activeOpacity={1} onPress={() => setShowCustomDatePicker(false)}>
                        <TouchableWithoutFeedback>
                            <View style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' }}>
                                <DateTimePicker
                                    value={customPreferredDate || new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleCustomDateChange}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </TouchableOpacity>
                </Modal>

                <Modal visible={showCustomTimePicker} transparent animationType="fade" onRequestClose={() => setShowCustomTimePicker(false)}>
                    <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 }} activeOpacity={1} onPress={() => setShowCustomTimePicker(false)}>
                        <TouchableWithoutFeedback>
                            <View style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' }}>
                                <DateTimePicker
                                    value={customPreferredTime || new Date()}
                                    mode="time"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleCustomTimeChange}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </TouchableOpacity>
                </Modal>

                {/* Submitted Documents Display */}
                {application.submittedDocuments && Object.keys(application.submittedDocuments).length > 0 && (
                    <View style={PassportProgressStyle.card}>
                        <Text style={PassportProgressStyle.cardTitle}>Submitted Documents</Text>

                        {application.submittedDocuments.passportPhoto && (
                            <View style={PassportProgressStyle.docRow}>
                                <Text style={PassportProgressStyle.docLabel}>Passport Photo</Text>
                                <TouchableOpacity onPress={() => openDocument(application.submittedDocuments.passportPhoto)}>
                                    <Text style={PassportProgressStyle.docLink}>View Document</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {application.submittedDocuments.birthCertificate && (
                            <View style={PassportProgressStyle.docRow}>
                                <Text style={PassportProgressStyle.docLabel}>Birth Certificate</Text>
                                <TouchableOpacity onPress={() => openDocument(application.submittedDocuments.birthCertificate)}>
                                    <Text style={PassportProgressStyle.docLink}>View Document</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {application.submittedDocuments.applicationForm && (
                            <View style={PassportProgressStyle.docRow}>
                                <Text style={PassportProgressStyle.docLabel}>Application Form</Text>
                                <TouchableOpacity onPress={() => openDocument(application.submittedDocuments.applicationForm)}>
                                    <Text style={PassportProgressStyle.docLink}>View Document</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {application.submittedDocuments.govId && (
                            <View style={PassportProgressStyle.docRow}>
                                <Text style={PassportProgressStyle.docLabel}>Government ID</Text>
                                <TouchableOpacity onPress={() => openDocument(application.submittedDocuments.govId)}>
                                    <Text style={PassportProgressStyle.docLink}>View Document</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {application.submittedDocuments.oldPassport && (
                            <View style={PassportProgressStyle.docRow}>
                                <Text style={PassportProgressStyle.docLabel}>Old Passport</Text>
                                <TouchableOpacity onPress={() => openDocument(application.submittedDocuments.oldPassport)}>
                                    <Text style={PassportProgressStyle.docLink}>View Document</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* Progress Tracker Card */}
                <View style={PassportProgressStyle.card}>
                    <Text style={PassportProgressStyle.cardTitle}>Progress Tracker</Text>

                    <View style={{ marginTop: 10 }}>
                        {steps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isActive = index === currentStepIndex;
                            const isLast = index === steps.length - 1;

                            return (
                                <View key={index} style={PassportProgressStyle.stepItem}>
                                    <View style={PassportProgressStyle.stepIndicator}>
                                        <View style={[PassportProgressStyle.stepCircle, isCompleted ? PassportProgressStyle.stepCircleActive : PassportProgressStyle.stepCircleInactive]}>
                                            <Text style={isCompleted ? PassportProgressStyle.stepNumberActive : PassportProgressStyle.stepNumberInactive}>
                                                {index + 1}
                                            </Text>
                                        </View>
                                        {!isLast && (
                                            <View style={[PassportProgressStyle.stepLine, isCompleted && !isActive ? PassportProgressStyle.stepLineActive : {}]} />
                                        )}
                                    </View>

                                    <View style={PassportProgressStyle.stepContent}>
                                        <Text style={isCompleted ? PassportProgressStyle.stepTitleActive : PassportProgressStyle.stepTitleInactive}>
                                            {step}
                                        </Text>
                                        {isActive && (
                                            <Text style={PassportProgressStyle.stepDesc}>Current Stage</Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}