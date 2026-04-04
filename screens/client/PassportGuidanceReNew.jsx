import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, Modal, Platform, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import * as DocumentPicker from 'expo-document-picker'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'

import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import PassportGuidanceStyle from '../../styles/clientstyles/PassportGuidanceStyle'
import { api, withUserHeader } from '../../utils/api'
import { useUser } from '../../context/UserContext'

const dfaLocations = [
    'DFA Aseana (Paranaque)',
    'DFA Manila (Robinsons Place)',
    'DFA Cebu (Pacific Mall)',
    'DFA Davao (SM City)',
    'DFA Iloilo (Robinsons Jaro)',
    'DFA Baguio (SM City)',
    'DFA Pampanga (SM City Clark)',
    'DFA Cagayan de Oro (SM Downtown Premier)',
    'DFA Laguna (SM City Santa Rosa)',
    'DFA Bacolod (SM City Bacolod)'
];

const timeSlots = [
    "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
];

const requirements = [
    "Confirmed DFA appointment",
    "Accomplished application form",
    "Old passport (original and photocopy)",
    "Valid government-issued ID",
    "Supporting documents for changes (if any)"
];

const steps = [
    { title: "Choose a DFA site", desc: "Select your preferred location and appointment date." },
    { title: "Prepare renewal documents", desc: "Bring your old passport and updated IDs." },
    { title: "Visit DFA on schedule", desc: "Submit requirements and complete biometrics." },
    { title: "Receive your new passport", desc: "Track release updates after processing." },
];

export default function PassportGuidanceReNew() {
    const cs = useNavigation()
    const { user } = useUser()
    const [isSidebarVisible, setSidebarVisible] = useState(false)

    const [dfaLocation, setDfaLocation] = useState('')
    const [preferredDate, setPreferredDate] = useState(null)
    const [preferredTime, setPreferredTime] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const [activeApp, setActiveApp] = useState(null)
    const [checkingActive, setCheckingActive] = useState(true)

    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showTimePickerModal, setShowTimePickerModal] = useState(false) 
    const [showDfaModal, setShowDfaModal] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    // 🔥 Added oldPassport
    const [uploadedFiles, setUploadedFiles] = useState({
        passportPhoto: null,
        applicationForm: null,
        psaBirthCertificate: null,
        validGovernmentId: null,
        oldPassport: null, 
    })

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold,
        Roboto_400Regular, Roboto_500Medium, Roboto_700Bold
    })

    useEffect(() => {
        const checkActiveApplications = async () => {
            if (!user?._id) {
                setCheckingActive(false);
                return;
            }
            try {
                const { data } = await api.get('/passport/applications', withUserHeader(user._id));
                const terminalStatuses = ['passport released', 'rejected', 'cancelled'];
                const ongoingApp = data.find(app => {
                    const appStatus = Array.isArray(app.status) ? app.status[0] : app.status;
                    // 🔥 Check for Renew Passport
                    return app.applicationType === 'Renew Passport' && !terminalStatuses.includes(String(appStatus).toLowerCase());
                });
                setActiveApp(ongoingApp || null);
            } catch (err) {
                console.log("Error checking applications:", err.message);
            } finally {
                setCheckingActive(false);
            }
        };
        checkActiveApplications();
    }, [user?._id]);

    const handlePickDocument = async (fieldName) => {
        try {
            const picked = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*', 'application/msword'],
                copyToCacheDirectory: true,
                multiple: false,
            })
            if (picked.canceled) return
            const selected = picked.assets?.[0]
            if (!selected?.uri) return
            setUploadedFiles((prev) => ({ ...prev, [fieldName]: selected }))
        } catch (_error) {
            Alert.alert('Upload failed', 'Unable to select file right now.')
        }
    }

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

    const submitApplication = async () => {
        if (!user?._id) {
            Alert.alert('Login required', 'Please login to submit your request.')
            return
        }

        if (!dfaLocation || !preferredDate || !preferredTime) {
            Alert.alert('Missing fields', 'Please fill in DFA location, preferred date, and preferred time.')
            return
        }

        // 🔥 Added oldPassport to validation
        const hasAllDocuments = uploadedFiles.passportPhoto && uploadedFiles.applicationForm && 
                                uploadedFiles.psaBirthCertificate && uploadedFiles.validGovernmentId && uploadedFiles.oldPassport

        if (!hasAllDocuments) {
            Alert.alert('Missing files', 'Please upload all required renewal documents before submitting.')
            return
        }

        try {
            setIsSubmitting(true)
            const formData = new FormData()
            formData.append('dfaLocation', dfaLocation)
            formData.append('preferredDate', formatDate(preferredDate))
            formData.append('preferredTime', preferredTime)
            formData.append('applicationType', 'Renew Passport')

            const appendFile = (fieldName, file) => {
                if (!file?.uri) return
                formData.append(fieldName, {
                    uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
                    name: file.name || `${fieldName}-${Date.now()}.pdf`,
                    type: file.mimeType || 'application/pdf',
                })
            }

            appendFile('passportPhoto', uploadedFiles.passportPhoto)
            appendFile('applicationForm', uploadedFiles.applicationForm)
            appendFile('psaBirthCertificate', uploadedFiles.psaBirthCertificate)
            appendFile('validGovernmentId', uploadedFiles.validGovernmentId)
            appendFile('oldPassport', uploadedFiles.oldPassport) // 🔥 Appended oldPassport

            const authConfig = withUserHeader(user._id);
            await api.post('/passport/apply', formData, {
                headers: { ...authConfig.headers, 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' }
            })

            setShowSuccessModal(true)
        } catch (error) {
            const message = error?.response?.data?.message || 'Unable to submit passport application right now.'
            Alert.alert('Submission failed', message)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!fontsLoaded) return null;

    return (
        <View style={PassportGuidanceStyle.container}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={PassportGuidanceStyle.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={PassportGuidanceStyle.headerContainer}>
                    <TouchableOpacity onPress={() => cs.goBack()} style={{ marginBottom: 10 }}>
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text style={PassportGuidanceStyle.title}>Passport Renewal Assistance</Text>
                    <Text style={PassportGuidanceStyle.subtitle}>Keep your documents ready and reserve your renewal schedule.</Text>
                </View>

                <View style={PassportGuidanceStyle.columnCard}>
                    <Text style={PassportGuidanceStyle.sectionTitle}>Requirements</Text>
                    {requirements.map((item, index) => (
                        <View key={index} style={PassportGuidanceStyle.requirementItem}>
                            <Text style={PassportGuidanceStyle.requirementText}>{item}</Text>
                        </View>
                    ))}
                </View>

                <View style={PassportGuidanceStyle.columnCard}>
                    <Text style={PassportGuidanceStyle.sectionTitle}>Step-by-step process</Text>
                    {steps.map((step, index) => (
                        <View key={index} style={PassportGuidanceStyle.stepRow}>
                            <View style={PassportGuidanceStyle.stepNumberContainer}>
                                <Text style={PassportGuidanceStyle.stepNumber}>{index + 1}</Text>
                            </View>
                            <View style={PassportGuidanceStyle.stepContent}>
                                <Text style={PassportGuidanceStyle.stepTitle}>{step.title}</Text>
                                <Text style={PassportGuidanceStyle.stepDesc}>{step.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {checkingActive ? (
                    <ActivityIndicator size="large" color="#305797" style={{ marginTop: 20 }} />
                ) : activeApp ? (
                    <View style={[PassportGuidanceStyle.columnCard, { alignItems: 'center', paddingVertical: 40 }]}>
                        <Ionicons name="information-circle" size={56} color="#f5a623" style={{ marginBottom: 16 }} />
                        <Text style={[PassportGuidanceStyle.sectionTitle, { textAlign: 'center', marginBottom: 8 }]}>Active Application Found</Text>
                        <Text style={[PassportGuidanceStyle.subtitle, { textAlign: 'center', marginBottom: 24 }]}>
                            You currently have an ongoing Passport Renewal application.
                        </Text>
                        <TouchableOpacity 
                            style={[PassportGuidanceStyle.submitButton, { alignSelf: 'center' }]}
                            onPress={() => cs.navigate('passportprogress', { applicationId: activeApp._id })}
                        >
                            <Text style={PassportGuidanceStyle.submitText}>Track Current Application</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={PassportGuidanceStyle.columnCard}>
                        <Text style={PassportGuidanceStyle.sectionTitle}>Application Details</Text>

                        <Text style={PassportGuidanceStyle.formLabel}>Select DFA location</Text>
                        <TouchableOpacity style={PassportGuidanceStyle.inputContainer} onPress={() => setShowDfaModal(true)}>
                            <Text style={[PassportGuidanceStyle.inputText, !dfaLocation && PassportGuidanceStyle.inputTextPlaceholder]}>
                                {dfaLocation || 'Choose a DFA site'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <Text style={PassportGuidanceStyle.formLabel}>Preferred date</Text>
                        <TouchableOpacity style={PassportGuidanceStyle.inputContainer} onPress={() => setShowDatePicker(true)}>
                            <Text style={[PassportGuidanceStyle.inputText, !preferredDate && PassportGuidanceStyle.inputTextPlaceholder]}>
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

                        <Text style={PassportGuidanceStyle.formLabel}>Preferred time</Text>
                        <TouchableOpacity style={PassportGuidanceStyle.inputContainer} onPress={() => setShowTimePickerModal(true)}>
                            <Text style={[PassportGuidanceStyle.inputText, !preferredTime && PassportGuidanceStyle.inputTextPlaceholder]}>
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

                        <Text style={[PassportGuidanceStyle.sectionTitle, { marginTop: 10 }]}>Upload Documents</Text>

                        {[
                            { key: 'passportPhoto', label: '2x2 Photo' },
                            { key: 'applicationForm', label: 'Application Form' },
                            { key: 'psaBirthCertificate', label: 'PSA Birth Certificate' },
                            { key: 'validGovernmentId', label: 'Valid Government Issued ID' },
                            // 🔥 Added oldPassport input
                            { key: 'oldPassport', label: 'Old Passport' }
                        ].map((doc) => (
                            <View key={doc.key}>
                                <View style={PassportGuidanceStyle.uploadRow}>
                                    <Text style={PassportGuidanceStyle.uploadLabel}>{doc.label}</Text>
                                    <TouchableOpacity style={PassportGuidanceStyle.uploadButton} onPress={() => handlePickDocument(doc.key)}>
                                        <Text style={PassportGuidanceStyle.uploadButtonText}>Choose File</Text>
                                    </TouchableOpacity>
                                </View>
                                {!!uploadedFiles[doc.key]?.name && (
                                    <Text style={PassportGuidanceStyle.fileNameText}><Ionicons name="document-attach-outline" size={12} /> {uploadedFiles[doc.key].name}</Text>
                                )}
                            </View>
                        ))}

                        <TouchableOpacity style={PassportGuidanceStyle.submitButton} onPress={submitApplication} disabled={isSubmitting}>
                            <Text style={PassportGuidanceStyle.submitText}>{isSubmitting ? 'Submitting...' : 'Submit request'}</Text>
                        </TouchableOpacity>

                        <View style={{ marginTop: 40 }}>
                            <Text style={[PassportGuidanceStyle.sectionTitle, { color: '#1f2937'}]}>FAQs</Text>
                            <Text style={PassportGuidanceStyle.subtitle}>Find answers to common questions about the renewal passport application process.</Text>
                            <View style={{ marginTop: 20 }}>
                                <Text style={PassportGuidanceStyle.faqTitle}>What documents do I need to prepare?</Text>
                                <Text style={PassportGuidanceStyle.faqDesc}>Refer to the requirements section above for a general list.</Text>
                                <Text style={PassportGuidanceStyle.faqTitle}>How long does the process take?</Text>
                                <Text style={PassportGuidanceStyle.faqDesc}>Processing times vary by the DFA office and the type of service.</Text>
                                <Text style={PassportGuidanceStyle.faqTitle}>Can I reschedule my appointment?</Text>
                                <Text style={PassportGuidanceStyle.faqDesc}>Rescheduling policies depend on the DFA office directly.</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Modals */}
            {showDatePicker && (
                <DateTimePicker value={preferredDate || new Date()} mode="date" minimumDate={new Date()} onChange={onDateChange} />
            )}

            <Modal visible={showTimePickerModal} transparent animationType="fade">
                <TouchableOpacity style={PassportGuidanceStyle.modalOverlay} activeOpacity={1} onPress={() => setShowTimePickerModal(false)}>
                    <View style={[PassportGuidanceStyle.modalCard, { padding: 0, maxHeight: '60%' }]}>
                        <View style={{ padding: 20, borderBottomWidth: 1, borderColor: '#e5e7eb', width: '100%', backgroundColor: '#f9fafb' }}>
                            <Text style={[PassportGuidanceStyle.sectionTitle, { marginBottom: 0, textAlign: 'center' }]}>Select Time</Text>
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

            <Modal visible={showDfaModal} transparent animationType="fade">
                <TouchableOpacity style={PassportGuidanceStyle.modalOverlay} activeOpacity={1} onPress={() => setShowDfaModal(false)}>
                    <View style={[PassportGuidanceStyle.modalCard, { padding: 0, maxHeight: '70%' }]}>
                        <View style={{ padding: 20, borderBottomWidth: 1, borderColor: '#e5e7eb', width: '100%', backgroundColor: '#f9fafb' }}>
                            <Text style={[PassportGuidanceStyle.sectionTitle, { marginBottom: 0, textAlign: 'center' }]}>Select DFA Site</Text>
                        </View>
                        <ScrollView style={{ width: '100%' }}>
                            {dfaLocations.map((loc, i) => (
                                <TouchableOpacity key={i} style={{ paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#f3f4f6' }}
                                    onPress={() => { setDfaLocation(loc); setShowDfaModal(false); }}>
                                    <Text style={{ fontSize: 15, fontFamily: dfaLocation === loc ? "Montserrat_600SemiBold" : "Roboto_400Regular", color: dfaLocation === loc ? '#305797' : '#374151' }}>{loc}</Text>
                                </TouchableOpacity>
                            ))}
                            <Text style={{ textAlign: 'center', padding: 20, color: '#9ca3af', fontStyle: 'italic', fontSize: 12 }}>More locations available on the official DFA website</Text>
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={showSuccessModal} transparent animationType="fade">
                <View style={PassportGuidanceStyle.modalOverlay}>
                    <View style={[PassportGuidanceStyle.modalCard, { padding: 0 }]}>
                        <TouchableOpacity style={{ alignSelf: 'flex-end', padding: 16 }} onPress={() => { setShowSuccessModal(false); cs.navigate('userapplications'); }}>
                            <Ionicons name="close" size={24} color="#9ca3af" />
                        </TouchableOpacity>
                        <View style={PassportGuidanceStyle.modalIconContainer}><Ionicons name="checkmark" size={32} color="#0ea5e9" /></View>
                        <Text style={PassportGuidanceStyle.modalTitle}>Application submitted</Text>
                        <Text style={PassportGuidanceStyle.modalDesc}>Your passport application has been submitted successfully.</Text>
                        <TouchableOpacity style={PassportGuidanceStyle.modalButton} onPress={() => { setShowSuccessModal(false); cs.navigate('userapplications'); }}>
                            <Text style={PassportGuidanceStyle.modalButtonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}