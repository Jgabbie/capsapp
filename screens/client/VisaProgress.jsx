import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Linking, Modal, Platform, TouchableWithoutFeedback, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import dayjs from "dayjs";
import DateTimePicker from '@react-native-community/datetimepicker';

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import VisaProgressStyle from "../../styles/clientstyles/VisaProgressStyle";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";

export default function VisaProgress() {
    const cs = useNavigation()
    const route = useRoute()
    const { user } = useUser()
    const [isSidebarVisible, setSidebarVisible] = useState(false)

    const applicationId = route.params?.applicationId;

    const [application, setApplication] = useState(null)
    const [servicePrice, setServicePrice] = useState(0)
    const [dynamicSteps, setDynamicSteps] = useState([])
    const [loading, setLoading] = useState(true)

    const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(null);
    const [customPreferredDate, setCustomPreferredDate] = useState(null);
    const [customPreferredTime, setCustomPreferredTime] = useState(null);
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);
    const [confirmingSchedule, setConfirmingSchedule] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('paymongo');
    const [creatingPayment, setCreatingPayment] = useState(false);
    const [proofImage, setProofImage] = useState(null);

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

            const appRes = await api.get('/visa/applications', withUserHeader(user._id));
            const appData = appRes.data.find(app => app._id === applicationId);

            if (!appData) throw new Error("Application not found in your list.");

            setApplication(appData);

            if (appData?.serviceId) {
                const serviceId = appData.serviceId._id || appData.serviceId;
                const servRes = await api.get(`/visa-services/get-service/${serviceId}`, withUserHeader(user._id));

                setServicePrice(servRes.data?.visaPrice || 0);

                if (servRes.data?.visaProcessSteps && servRes.data.visaProcessSteps.length > 0) {
                    setDynamicSteps(servRes.data.visaProcessSteps);
                }
            }
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
            : normalizeScheduleSlot(application.suggestedAppointmentSchedules[selectedScheduleIndex]);

        if (!selected?.date || !selected?.time) {
            Alert.alert("Error", "Please provide both date and time.");
            return;
        }

        try {
            setConfirmingSchedule(true);
            await api.put(`/visa/applications/${application._id}/choose-appointment`, {
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

    const appStatus = useMemo(() => {
        if (!application?.status) return "Pending";
        return Array.isArray(application.status) ? application.status[0] : application.status;
    }, [application]);

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

    const handleStartPayment = async () => {
        if (!servicePrice || Number.isNaN(Number(servicePrice)) || Number(servicePrice) <= 0) {
            Alert.alert('Error', 'Payment amount is not available yet.');
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
                    packageId: application.serviceId?._id || application.serviceId,
                    travelDate: {
                        startDate: application.preferredDate,
                        endDate: application.preferredDate,
                    },
                    travelerTotal: 1,
                    amount: Number(servicePrice),
                    paymentType: 'Full Payment',
                    proofImage: proofUrl,
                    proofImageType: type,
                    proofFileName: filename,
                    bookingDetails: {
                        applicationId: application._id,
                        applicationNumber: application.applicationNumber,
                        applicantName: application.applicantName,
                        serviceName: application.serviceName,
                        preferredDate: application.preferredDate,
                        preferredTime: application.preferredTime,
                    },
                };

                await api.post('/pay/manual-visa', manualPayload, withUserHeader(user._id));
                Alert.alert('Success', 'Manual payment submitted successfully.');
                return;
            }

            const tokenRes = await api.post('/pay/create-checkout-token', {
                totalPrice: Number(servicePrice),
                bookingId: application._id
            }, withUserHeader(user._id));

            const token = tokenRes.data?.token;
            if (!token) throw new Error('Failed to create checkout token');

            const sessionRes = await api.post('/pay/create-checkout-session-visa', {
                checkoutToken: token,
                totalPrice: Number(servicePrice),
                packageName: application.serviceName || 'Visa Application',
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

    const steps = useMemo(() => {
        if (dynamicSteps.length > 0) return dynamicSteps;
        if (application?.serviceName?.includes('Canada')) return ["aaa", "aaa", "aaa"];

        return [
            "Application Submitted",
            "Application Approved",
            "Payment Complete",
            "Documents Uploaded",
            "Documents Approved",
            "Documents Received",
            "Documents Submitted",
            "Processing by Embassy",
            "Embassy Approved",
            "Passport Released"
        ];
    }, [dynamicSteps, application]);

    const currentStepIndex = useMemo(() => {
        const index = steps.findIndex(s => s.toLowerCase() === appStatus.toLowerCase());
        return Math.max(0, index);
    }, [steps, appStatus]);

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
        <View style={VisaProgressStyle.container}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={VisaProgressStyle.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={VisaProgressStyle.headerContainer}>
                    <TouchableOpacity onPress={() => cs.goBack()} style={VisaProgressStyle.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text style={VisaProgressStyle.title}>Visa Application Details</Text>
                </View>

                {/* Application Info Card */}
                <View style={VisaProgressStyle.card}>
                    <Text style={VisaProgressStyle.cardTitle}>Application Info</Text>

                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Reference</Text>
                        <Text style={VisaProgressStyle.infoValue}>{application.applicationNumber || application._id}</Text>
                    </View>

                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Status</Text>
                        <View style={VisaProgressStyle.statusTag}>
                            <Text style={VisaProgressStyle.statusText}>{appStatus}</Text>
                        </View>
                    </View>

                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Date Submitted</Text>
                        <Text style={VisaProgressStyle.infoValue}>{dayjs(application.createdAt).format('MMM D, YYYY')}</Text>
                    </View>

                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Applicant Name</Text>
                        <Text style={VisaProgressStyle.infoValue}>{application.applicantName || 'N/A'}</Text>
                    </View>

                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Preferred Date</Text>
                        <Text style={VisaProgressStyle.infoValue}>{dayjs(application.preferredDate).format('MMM D, YYYY')}</Text>
                    </View>

                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Preferred Time</Text>
                        <Text style={VisaProgressStyle.infoValue}>{application.preferredTime}</Text>
                    </View>

                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Application Type</Text>
                        <Text style={VisaProgressStyle.infoValue}>{application.serviceName}</Text>
                    </View>

                    <View style={[VisaProgressStyle.infoRow, { borderBottomWidth: 0 }]}>
                        <Text style={VisaProgressStyle.infoLabel}>Total Price</Text>
                        <Text style={[VisaProgressStyle.infoValue, { fontFamily: 'Montserrat_700Bold', color: '#305797' }]}>
                            ₱{servicePrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                    </View>
                </View>

                {appStatus.toLowerCase() === 'application approved' && (
                    <View style={VisaProgressStyle.card}>
                        <Text style={VisaProgressStyle.cardTitle}>Application Payment</Text>
                        <Text style={{ color: '#6b7280', marginBottom: 12, fontSize: 13 }}>Complete payment for your visa application to proceed.</Text>

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

                        {paymentMethod === 'manual' && (
                            <View style={{ marginBottom: 14 }}>
                                <TouchableOpacity
                                    onPress={pickProofImage}
                                    style={{
                                        borderWidth: 1,
                                        borderColor: '#d1d5db',
                                        borderRadius: 10,
                                        paddingVertical: 12,
                                        paddingHorizontal: 14,
                                        backgroundColor: '#fff',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                    }}
                                >
                                    <Ionicons name="cloud-upload-outline" size={20} color="#305797" />
                                    <Text style={{ color: '#305797', fontFamily: 'Montserrat_600SemiBold' }}>
                                        {proofImage ? 'Change Proof Image' : 'Upload Proof of Payment'}
                                    </Text>
                                </TouchableOpacity>

                                {proofImage && (
                                    <View style={{ marginTop: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 10, backgroundColor: '#fff' }}>
                                        <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Preview</Text>
                                        <View style={{ borderRadius: 10, overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                                            <Image source={{ uri: proofImage.uri }} style={{ width: '100%', height: 180 }} resizeMode="contain" />
                                        </View>
                                        <TouchableOpacity onPress={() => setProofImage(null)} style={{ marginTop: 10, alignSelf: 'flex-end' }}>
                                            <Text style={{ color: '#ef4444', fontFamily: 'Montserrat_600SemiBold', fontSize: 12 }}>Remove Image</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}

                        <TouchableOpacity
                            style={[VisaProgressStyle.submitBtn, creatingPayment && { opacity: 0.7 }]}
                            disabled={creatingPayment || !servicePrice || (paymentMethod === 'manual' && !proofImage)}
                            onPress={handleStartPayment}
                        >
                            {creatingPayment ? <ActivityIndicator color="#fff" /> : <Text style={VisaProgressStyle.submitBtnText}>{paymentMethod === 'manual' ? 'Submit Manual Payment' : 'Pay with Paymongo'}</Text>}
                        </TouchableOpacity>
                    </View>
                )}


                {appStatus.toLowerCase() === 'application submitted' && (
                    <View style={VisaProgressStyle.card}>
                        <Text style={VisaProgressStyle.cardTitle}>Suggested Appointment Options</Text>

                        {application.suggestedAppointmentSchedules?.length > 0 ? (
                            <>
                                <Text style={{ color: '#6b7280', marginBottom: 15, fontSize: 13 }}>Please select a date and time for your Embassy appointment.</Text>

                                {application.suggestedAppointmentSchedules.map((slot, index) => (
                                    (() => {
                                        const normalizedSlot = normalizeScheduleSlot(slot);
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    VisaProgressStyle.optionCard,
                                                    selectedScheduleIndex === index && VisaProgressStyle.optionCardSelected
                                                ]}
                                                onPress={() => setSelectedScheduleIndex(index)}
                                            >
                                                <View style={VisaProgressStyle.optionTag}>
                                                    <Text style={VisaProgressStyle.optionTagText}>Option {index + 1}</Text>
                                                </View>
                                                <Text style={VisaProgressStyle.optionDate}>
                                                    {normalizedSlot.date ? dayjs(normalizedSlot.date).format("MMM DD, YYYY") : 'No date provided'}
                                                </Text>
                                                <Text style={VisaProgressStyle.optionTime}>{normalizedSlot.time || 'No time provided'}</Text>
                                            </TouchableOpacity>
                                        );
                                    })()
                                ))}

                                <TouchableOpacity
                                    style={[
                                        VisaProgressStyle.optionCard,
                                        isOthersSelected && VisaProgressStyle.optionCardSelected
                                    ]}
                                    onPress={() => setSelectedScheduleIndex('others')}
                                >
                                    <View style={VisaProgressStyle.optionTag}>
                                        <Text style={VisaProgressStyle.optionTagText}>Others</Text>
                                    </View>
                                    <Text style={VisaProgressStyle.optionDate}>Enter your preferred date and time</Text>
                                    <Text style={VisaProgressStyle.optionTime}>Pick both values from the native date and time pickers.</Text>

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
                                    style={[VisaProgressStyle.submitBtn, !canConfirmSchedule && { opacity: 0.5 }]}
                                    disabled={!canConfirmSchedule}
                                    onPress={handleConfirmSchedule}
                                >
                                    {confirmingSchedule ? <ActivityIndicator color="#fff" /> : <Text style={VisaProgressStyle.submitBtnText}>Confirm Selected Date</Text>}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <Text style={{ color: '#6b7280', fontSize: 14 }}>No suggested dates yet. Please check back later.</Text>
                        )}
                    </View>
                )}

                {/* Submitted Documents Display */}
                {application.submittedDocuments && Object.keys(application.submittedDocuments).length > 0 && (
                    <View style={VisaProgressStyle.card}>
                        <Text style={VisaProgressStyle.cardTitle}>Submitted Documents</Text>

                        {application.submittedDocuments.validPassport && (
                            <View style={VisaProgressStyle.docRow}>
                                <Text style={VisaProgressStyle.docLabel}>Valid Passport</Text>
                                <TouchableOpacity onPress={() => openDocument(application.submittedDocuments.validPassport)}>
                                    <Text style={VisaProgressStyle.docLink}>View Document</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {application.submittedDocuments.completedVisaApplicationForm && (
                            <View style={VisaProgressStyle.docRow}>
                                <Text style={VisaProgressStyle.docLabel}>Application Form</Text>
                                <TouchableOpacity onPress={() => openDocument(application.submittedDocuments.completedVisaApplicationForm)}>
                                    <Text style={VisaProgressStyle.docLink}>View Document</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {application.submittedDocuments.passportSizePhoto && (
                            <View style={VisaProgressStyle.docRow}>
                                <Text style={VisaProgressStyle.docLabel}>Passport Photo</Text>
                                <TouchableOpacity onPress={() => openDocument(application.submittedDocuments.passportSizePhoto)}>
                                    <Text style={VisaProgressStyle.docLink}>View Document</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {application.submittedDocuments.bankCertificateAndStatement && (
                            <View style={VisaProgressStyle.docRow}>
                                <Text style={VisaProgressStyle.docLabel}>Bank Cert / Statement</Text>
                                <TouchableOpacity onPress={() => openDocument(application.submittedDocuments.bankCertificateAndStatement)}>
                                    <Text style={VisaProgressStyle.docLink}>View Document</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* Progress Tracker Card */}
                <View style={VisaProgressStyle.card}>
                    <Text style={VisaProgressStyle.cardTitle}>Progress Tracker</Text>

                    <View style={{ marginTop: 10 }}>
                        {steps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isActive = index === currentStepIndex;
                            const isLast = index === steps.length - 1;

                            return (
                                <View key={index} style={VisaProgressStyle.stepItem}>
                                    <View style={VisaProgressStyle.stepIndicator}>
                                        <View style={[VisaProgressStyle.stepCircle, isCompleted ? VisaProgressStyle.stepCircleActive : VisaProgressStyle.stepCircleInactive]}>
                                            <Text style={isCompleted ? VisaProgressStyle.stepNumberActive : VisaProgressStyle.stepNumberInactive}>
                                                {index + 1}
                                            </Text>
                                        </View>
                                        {!isLast && (
                                            <View style={[VisaProgressStyle.stepLine, isCompleted && !isActive ? VisaProgressStyle.stepLineActive : {}]} />
                                        )}
                                    </View>

                                    <View style={VisaProgressStyle.stepContent}>
                                        <Text style={isCompleted ? VisaProgressStyle.stepTitleActive : VisaProgressStyle.stepTitleInactive}>
                                            {step.charAt(0).toUpperCase() + step.slice(1)}
                                        </Text>
                                        {isActive && (
                                            <Text style={VisaProgressStyle.stepDesc}>Current Stage</Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

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

            </ScrollView>
        </View>
    );
}