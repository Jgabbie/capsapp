import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, Modal, ActivityIndicator, Linking } from 'react-native'
import React, { useState, useEffect, useMemo } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'

import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import VisaDetailsGuidanceStyle from '../../styles/clientstyles/VisaDetailsGuidanceStyle'
import { api, withUserHeader } from '../../utils/api'
import { useUser } from '../../context/UserContext'

const timeSlots = [
    "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
];

const JAPAN_FALLBACK_STEPS = [
    {
        title: 'Application Submitted',
        description: 'The applicant has successfully submitted the visa application for JAPAN SINGLE ENTRY.'
    },
    {
        title: 'Application Approved',
        description: "The applicant's application has been approved. The date and time of the appointment has been finalized."
    },
    {
        title: 'Payment Completed',
        description: 'The applicant has successfully paid the service fee for the visa application.'
    },
    {
        title: 'Documents Uploaded',
        description: 'The required documents has been uploaded by the applicant online for verification and approval.'
    },
    {
        title: 'Documents Approved',
        description: 'The uploaded documents has been approved and is ready to submit to the embassy. The user may now deliver the documents to the Travel Agency.'
    },
    {
        title: 'Documents Received',
        description: 'The documents has been received by the Travel Agency.'
    },
    {
        title: 'Documents Submitted',
        description: 'The documents has been submitted by the Travel Agency to the Embassy of Japan.'
    },
    {
        title: 'Processing by Embassy',
        description: 'The documents are currently being processed by the Embassy of Japan.'
    },
    {
        title: 'Embassy Approved',
        description: 'The visa application has been approved by the Embassy of Japan.'
    },
    {
        title: 'Passport Released',
        description: "The applicant's passport has been released, it is now ready for pickup from the Travel Agency Office or deliver it to your home address."
    }
]

export default function VisaDetailsGuidance() {
    const cs = useNavigation()
    const route = useRoute()
    const { user } = useUser()
    const [isSidebarVisible, setSidebarVisible] = useState(false)

    const selectedService = route.params?.service || {}
    const [serviceDetails, setServiceDetails] = useState(selectedService)

    const [preferredDate, setPreferredDate] = useState(null)
    const [preferredTime, setPreferredTime] = useState(null)
    const [purpose, setPurpose] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showTimePickerModal, setShowTimePickerModal] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold,
        Roboto_400Regular, Roboto_500Medium, Roboto_700Bold
    })

    useEffect(() => {
        setServiceDetails(selectedService)
    }, [selectedService])

    useEffect(() => {
        const loadServiceDetails = async () => {
            try {
                const serviceId = selectedService?.visaItem || selectedService?._id
                if (!serviceId || !user?._id) return

                const { data } = await api.get(`/visa-services/get-service/${serviceId}`, withUserHeader(user._id))
                if (data && typeof data === 'object') {
                    setServiceDetails((prev) => ({ ...(prev || {}), ...data }))
                }
            } catch (error) {
                console.log('Failed to load full visa service details:', error?.message)
            }
        }

        loadServiceDetails()
    }, [selectedService?.visaItem, selectedService?._id, user?._id])

    const serviceData = useMemo(() => {
        if (serviceDetails && Object.keys(serviceDetails).length > 0) return serviceDetails
        return selectedService
    }, [serviceDetails, selectedService])

    const getMinDate = () => {
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 14);
        return minDate;
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const dayOfWeek = selectedDate.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                Alert.alert("Invalid Date", "Appointments are only available from Monday to Friday.");
                return;
            }
            setPreferredDate(selectedDate);
        }
    };

    const formatDate = (date) => date ? date.toISOString().split('T')[0] : 'Select date';
    const formatPeso = (value) => `${(Number(value) || 0).toLocaleString("en-PH")}`;

    const submitApplication = async () => {
        if (!user?._id) {
            Alert.alert('Login required', 'Please login to submit your request.')
            return
        }

        if (!preferredDate || !preferredTime || !purpose.trim()) {
            Alert.alert('Missing fields', 'Please fill in preferred date, preferred time, and purpose of travel.')
            return
        }

        try {
            setIsSubmitting(true)

            const payload = {
                serviceId: selectedService.visaItem || selectedService._id,
                preferredDate: formatDate(preferredDate),
                preferredTime,
                purposeOfTravel: purpose
            };

            await api.post('/visa/apply', payload, withUserHeader(user._id))
            setShowSuccessModal(true)
        } catch (error) {
            const message = error?.response?.data?.message || 'Unable to submit visa application right now.'
            Alert.alert('Submission failed', message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleContinue = () => {
        setShowSuccessModal(false);
        cs.navigate('userapplications');
    }

    // Filter required and optional requirements
    const requiredRequirements = useMemo(() => {
        return (serviceData.visaRequirements || []).filter(item => {
            if (typeof item === 'object') {
                return item.isReq === true || String(item.isReq)?.toLowerCase() === 'required';
            }
            return true;
        });
    }, [serviceData.visaRequirements]);

    const optionalRequirements = useMemo(() => {
        return (serviceData.visaRequirements || []).filter(item => {
            if (typeof item === 'object') {
                return item.isReq === false || String(item.isReq)?.toLowerCase() === 'optional';
            }
            return false;
        });
    }, [serviceData.visaRequirements]);

    const processSteps = useMemo(() => {
        const raw = serviceData?.visaProcessSteps
            || serviceData?.processSteps
            || serviceData?.steps
            || serviceData?.visaSteps

        if (Array.isArray(raw) && raw.length > 0) return raw

        if (typeof raw === 'string' && raw.trim()) {
            try {
                const parsed = JSON.parse(raw)
                if (Array.isArray(parsed)) return parsed
            } catch (_e) {
                return raw
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
            }
        }

        const maybeStatusFlow = serviceData?.status
        if (Array.isArray(maybeStatusFlow) && maybeStatusFlow.length > 1) {
            return maybeStatusFlow
        }

        const visaName = String(serviceData?.visaName || '').toLowerCase()
        if (visaName.includes('japan')) {
            return JAPAN_FALLBACK_STEPS
        }

        return []
    }, [serviceData])

    const handleOpenLink = (url) => {
        if (!url) return;
        Linking.openURL(url);
    };

    if (!fontsLoaded) return null;

    return (
        <View style={VisaDetailsGuidanceStyle.container}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={VisaDetailsGuidanceStyle.headerContainer}>
                    <TouchableOpacity onPress={() => cs.goBack()} style={{ marginBottom: 10 }}>
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text style={VisaDetailsGuidanceStyle.title}>Visa Application Assistance</Text>
                    <Text style={VisaDetailsGuidanceStyle.subtitle}>Choose a visa service, review the requirements, and submit your preferred schedule.</Text>
                </View>

                {/* --- REQUIREMENTS --- */}
                <View style={VisaDetailsGuidanceStyle.columnCard}>
                    <Text style={VisaDetailsGuidanceStyle.sectionTitle}>Requirements</Text>

                    {requiredRequirements.length > 0 ? (
                        <>
                            <Text style={VisaDetailsGuidanceStyle.requiredSubheading}>Required</Text>
                            {requiredRequirements.map((item, index) => {
                                const reqText = typeof item === 'object' ? item.req : item;
                                return (
                                    <View key={index} style={VisaDetailsGuidanceStyle.requirementItem}>
                                        <Text style={VisaDetailsGuidanceStyle.requirementText}>
                                            {reqText}
                                        </Text>

                                        {typeof item === 'object' && item.desc ? (
                                            <Text style={VisaDetailsGuidanceStyle.requirementSubText}>{item.desc}</Text>
                                        ) : null}

                                        {typeof item === 'object' && item.applicationLink && (
                                            <TouchableOpacity onPress={() => handleOpenLink(item.applicationLink)} style={{ marginTop: 8 }}>
                                                <Text style={VisaDetailsGuidanceStyle.openApplicationLinkText}>
                                                    Open Application Link
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })}
                        </>
                    ) : (
                        <Text style={VisaDetailsGuidanceStyle.emptyText}>No required items.</Text>
                    )}
                </View>

                {/* --- OPTIONAL REQUIREMENTS --- */}
                {optionalRequirements.length > 0 && (
                    <View style={VisaDetailsGuidanceStyle.columnCard}>
                        <Text style={VisaDetailsGuidanceStyle.sectionTitle}>Optional Requirements</Text>
                        {optionalRequirements.map((item, index) => {
                            const reqText = typeof item === 'object' ? item.req : item;
                            return (
                                <View key={index} style={VisaDetailsGuidanceStyle.requirementItem}>
                                    <Text style={VisaDetailsGuidanceStyle.requirementText}>
                                        {reqText}
                                    </Text>

                                    {typeof item === 'object' && item.desc ? (
                                        <Text style={VisaDetailsGuidanceStyle.requirementSubText}>{item.desc}</Text>
                                    ) : null}

                                    {typeof item === 'object' && item.applicationLink && (
                                        <TouchableOpacity onPress={() => handleOpenLink(item.applicationLink)} style={{ marginTop: 8 }}>
                                            <Text style={VisaDetailsGuidanceStyle.openApplicationLinkText}>
                                                Open Application Link
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* --- ADDITIONAL REQUIREMENTS --- */}
                {serviceData.visaAdditionalRequirements?.length > 0 && (
                    <View style={VisaDetailsGuidanceStyle.columnCard}>
                        <Text style={VisaDetailsGuidanceStyle.sectionTitle}>Additional Requirements</Text>
                        {serviceData.visaAdditionalRequirements.map((item, index) => (
                            <View key={index} style={VisaDetailsGuidanceStyle.requirementItem}>
                                <Text style={VisaDetailsGuidanceStyle.requirementText}>
                                    {typeof item === 'object' ? item.req : item}
                                </Text>
                                {typeof item === 'object' && item.desc ? (
                                    <Text style={VisaDetailsGuidanceStyle.requirementSubText}>{item.desc}</Text>
                                ) : null}
                            </View>
                        ))}
                    </View>
                )}

                {/* --- REMINDERS --- */}
                <View style={VisaDetailsGuidanceStyle.columnCard}>
                    <Text style={VisaDetailsGuidanceStyle.sectionTitle}>Reminders</Text>
                    {serviceData.visaReminders?.length > 0 ? (
                        serviceData.visaReminders.map((rem, index) => (
                            <View key={index} style={VisaDetailsGuidanceStyle.requirementItem}>
                                <Text style={VisaDetailsGuidanceStyle.requirementText}>
                                    {typeof rem === 'object' ? rem.req : rem}
                                </Text>
                                {typeof rem === 'object' && rem.desc ? (
                                    <Text style={VisaDetailsGuidanceStyle.requirementSubText}>{rem.desc}</Text>
                                ) : null}
                            </View>
                        ))
                    ) : (
                        <Text style={VisaDetailsGuidanceStyle.emptyText}>No reminders available.</Text>
                    )}
                </View>

                {/* --- STEP-BY-STEP PROCESS (UNDER REMINDERS) --- */}
                <View style={VisaDetailsGuidanceStyle.columnCard}>
                    <Text style={VisaDetailsGuidanceStyle.sectionTitle}>Step-by-step process</Text>
                    {processSteps.length > 0 ? (
                        processSteps.map((step, index) => {
                            const stepTitle = typeof step === 'object' && step?.title
                                ? step.title
                                : `Step ${index + 1}`;
                            const stepDescription = typeof step === 'object'
                                ? (step?.description || '')
                                : String(step || '');

                            return (
                                <View key={index} style={VisaDetailsGuidanceStyle.stepItemCard}>
                                    <View style={VisaDetailsGuidanceStyle.stepRow}>
                                        <View style={VisaDetailsGuidanceStyle.stepNumberContainer}>
                                            <Text style={VisaDetailsGuidanceStyle.stepNumber}>{index + 1}</Text>
                                        </View>
                                        <View style={VisaDetailsGuidanceStyle.stepContent}>
                                            <Text style={VisaDetailsGuidanceStyle.stepLabel}>{`Step ${index + 1}`}</Text>
                                            <Text style={VisaDetailsGuidanceStyle.stepTitle}>{stepTitle}</Text>
                                            {!!stepDescription && (
                                                <Text style={VisaDetailsGuidanceStyle.stepDesc}>{stepDescription}</Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <Text style={VisaDetailsGuidanceStyle.emptyText}>No step-by-step process available yet.</Text>
                    )}
                </View>

                {/* --- APPLICATION FORM --- */}
                <View style={VisaDetailsGuidanceStyle.columnCard}>
                    <Text style={VisaDetailsGuidanceStyle.sectionTitle}>Application Details</Text>

                    <View style={VisaDetailsGuidanceStyle.feeBadge}>
                        <Text style={VisaDetailsGuidanceStyle.feeBadgeText}>
                            Visa Fee PHP {formatPeso(selectedService.visaPrice)}
                        </Text>
                    </View>

                    <Text style={VisaDetailsGuidanceStyle.formLabel}>Preferred date</Text>
                    <TouchableOpacity style={VisaDetailsGuidanceStyle.inputContainer} onPress={() => setShowDatePicker(true)}>
                        <Text style={[VisaDetailsGuidanceStyle.inputText, !preferredDate && VisaDetailsGuidanceStyle.inputTextPlaceholder]}>
                            {formatDate(preferredDate)}
                        </Text>
                        {preferredDate ? (
                            <TouchableOpacity onPress={() => setPreferredDate(null)}>
                                <Ionicons name="close-circle" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        ) : (
                            <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
                        )}
                    </TouchableOpacity>

                    <Text style={VisaDetailsGuidanceStyle.formLabel}>Preferred time</Text>
                    <TouchableOpacity style={VisaDetailsGuidanceStyle.inputContainer} onPress={() => setShowTimePickerModal(true)}>
                        <Text style={[VisaDetailsGuidanceStyle.inputText, !preferredTime && VisaDetailsGuidanceStyle.inputTextPlaceholder]}>
                            {preferredTime || 'Select time'}
                        </Text>
                        {preferredTime ? (
                            <TouchableOpacity onPress={() => setPreferredTime(null)}>
                                <Ionicons name="close-circle" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        ) : (
                            <Ionicons name="time-outline" size={20} color="#9ca3af" />
                        )}
                    </TouchableOpacity>

                    <Text style={VisaDetailsGuidanceStyle.formLabel}>Purpose of travel</Text>
                    <TextInput
                        style={[VisaDetailsGuidanceStyle.inputContainer, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
                        placeholder="Share your purpose of travel"
                        placeholderTextColor="#9ca3af"
                        multiline
                        numberOfLines={3}
                        value={purpose}
                        onChangeText={setPurpose}
                    />

                    <TouchableOpacity style={VisaDetailsGuidanceStyle.submitButton} onPress={submitApplication} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={VisaDetailsGuidanceStyle.submitText}>Submit request</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* --- MODALS --- */}
            {showDatePicker && (
                <DateTimePicker value={preferredDate || getMinDate()} mode="date" minimumDate={getMinDate()} onChange={onDateChange} />
            )}

            <Modal visible={showTimePickerModal} transparent animationType="fade">
                <TouchableOpacity style={VisaDetailsGuidanceStyle.modalOverlay} activeOpacity={1} onPress={() => setShowTimePickerModal(false)}>
                    <View style={[VisaDetailsGuidanceStyle.modalCard, { padding: 0, maxHeight: '60%' }]}>
                        <View style={{ padding: 20, borderBottomWidth: 1, borderColor: '#e5e7eb', width: '100%', backgroundColor: '#f9fafb' }}>
                            <Text style={[VisaDetailsGuidanceStyle.sectionTitle, { marginBottom: 0, textAlign: 'center' }]}>Select Time</Text>
                        </View>
                        <ScrollView style={{ width: '100%' }}>
                            {timeSlots.map((slot, i) => (
                                <TouchableOpacity key={i} style={{ paddingVertical: 16, borderBottomWidth: 1, borderColor: '#f3f4f6', alignItems: 'center' }}
                                    onPress={() => { setPreferredTime(slot); setShowTimePickerModal(false); }}>
                                    <Text style={{ fontSize: 16, fontFamily: preferredTime === slot ? "Montserrat_700Bold" : "Roboto_500Medium", color: preferredTime === slot ? '#305797' : '#374151' }}>{slot}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={showSuccessModal} transparent animationType="fade">
                <View style={VisaDetailsGuidanceStyle.modalOverlay}>
                    <View style={[VisaDetailsGuidanceStyle.modalCard, { padding: 0 }]}>
                        <TouchableOpacity style={{ alignSelf: 'flex-end', padding: 16 }} onPress={handleContinue}>
                            <Ionicons name="close" size={24} color="#9ca3af" />
                        </TouchableOpacity>

                        <View style={VisaDetailsGuidanceStyle.modalIconContainer}>
                            <Ionicons name="checkmark" size={32} color="#0ea5e9" />
                        </View>

                        <Text style={VisaDetailsGuidanceStyle.modalTitle}>Application submitted</Text>
                        <Text style={VisaDetailsGuidanceStyle.modalDesc}>
                            Your visa application has been submitted successfully. Kindly wait for your application to be approved.
                        </Text>

                        <TouchableOpacity style={VisaDetailsGuidanceStyle.modalButton} onPress={handleContinue}>
                            <Text style={VisaDetailsGuidanceStyle.modalButtonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    )
}