import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, Modal, Platform, ActivityIndicator } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'

import * as DocumentPicker from 'expo-document-picker' 

import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import VisaDetailsGuidanceStyle from '../../styles/clientstyles/VisaDetailsGuidanceStyle'
import { api, withUserHeader } from '../../utils/api'
import { useUser } from '../../context/UserContext'

export default function VisaDetailsGuidance() {
    const cs = useNavigation()
    const route = useRoute()
    const { user } = useUser()
    const [isSidebarVisible, setSidebarVisible] = useState(false)
    
    const selectedService = route.params?.service
    
    const [preferredDate, setPreferredDate] = useState(null)
    const [preferredTime, setPreferredTime] = useState(null) 
    const [purposeOfTravel, setPurposeOfTravel] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 🔥 NEW: States for checking duplicate active applications
    const [activeApp, setActiveApp] = useState(null)
    const [checkingActive, setCheckingActive] = useState(true)

    const [uploadedFiles, setUploadedFiles] = useState({
        validPassport: null,
        completedVisaApplicationForm: null,
        passportSizePhoto: null,
        bankCertificateAndStatement: null,
    })

    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showTimePickerModal, setShowTimePickerModal] = useState(false) 
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold,
        Roboto_400Regular, Roboto_500Medium, Roboto_700Bold
    })

    const timeSlots = [
        "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
        "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
        "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
    ];

    const requiredVisaDocuments = [
        { key: 'validPassport', label: 'Valid passport' },
        { key: 'completedVisaApplicationForm', label: 'Completed visa application form' },
        { key: 'passportSizePhoto', label: 'Recent passport-size photo' },
        { key: 'bankCertificateAndStatement', label: 'Bank certificate and statement' },
    ]

    const requirements = useMemo(() => {
        if (selectedService?.visaRequirements && selectedService.visaRequirements.length > 0) {
            return selectedService.visaRequirements;
        }
        if (selectedService?.visaName?.includes('Canada')) {
            return ['aaa', 'aaa'];
        }
        return [
            'Valid passport (at least 6 months validity)',
            'Completed visa application form',
            'Recent passport-size photo',
            'Bank certificate and statement',
        ];
    }, [selectedService])

    const steps = useMemo(() => {
        if (selectedService?.visaProcessSteps && selectedService.visaProcessSteps.length > 0) {
            return selectedService.visaProcessSteps.map((stepText, index) => ({
                title: `Step ${index + 1}`,
                desc: stepText
            }));
        }
        if (selectedService?.visaName?.includes('Canada')) {
            return [
                { title: "Step 1", desc: "aaa" },
                { title: "Step 2", desc: "aaa" },
                { title: "Step 3", desc: "aaa" },
            ];
        }
        if (selectedService?.visaName?.includes('Japan')) {
            return [
                { title: "Step 1", desc: "Application Submitted" },
                { title: "Step 2", desc: "Application Approved" },
                { title: "Step 3", desc: "Payment Complete" },
                { title: "Step 4", desc: "Documents Uploaded" },
                { title: "Step 5", desc: "Documents Approved" },
                { title: "Step 6", desc: "Documents Received" },
                { title: "Step 7", desc: "Documents Submitted" },
                { title: "Step 8", desc: "Processing by Embassy" },
                { title: "Step 9", desc: "Embassy Approved" },
                { title: "Step 10", desc: "Passport Released" },
            ];
        }
        return [
            { title: "Step 1", desc: "Application Submitted" },
            { title: "Step 2", desc: "Application Approved" },
            { title: "Step 3", desc: "Payment Complete" },
            { title: "Step 4", desc: "Documents Uploaded" },
            { title: "Step 5", desc: "Documents Approved" },
            { title: "Step 6", desc: "Documents Received" },
            { title: "Step 7", desc: "Documents Submitted" },
            { title: "Step 8", desc: "Processing DFA" },
        ];
    }, [selectedService])

    // 🔥 NEW: Check for existing active applications on load
    useEffect(() => {
        const checkActiveApplications = async () => {
            if (!user?._id || !selectedService?._id) {
                setCheckingActive(false);
                return;
            }
            
            try {
                const { data } = await api.get('/visa/applications', withUserHeader(user._id));
                
                // Define statuses that mean the application is 100% finished
                const terminalStatuses = ['passport released', 'completed', 'rejected', 'cancelled'];
                
                const ongoingApp = data.find(app => {
                    const sId = app.serviceId?._id || app.serviceId;
                    const appStatus = Array.isArray(app.status) ? app.status[0] : app.status;
                    const isTerminal = terminalStatuses.includes(String(appStatus).toLowerCase());
                    
                    return sId === selectedService._id && !isTerminal;
                });
                
                setActiveApp(ongoingApp || null);
            } catch (err) {
                console.log("Error checking applications:", err.message);
            } finally {
                setCheckingActive(false);
            }
        };

        checkActiveApplications();
    }, [user?._id, selectedService?._id]);

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const dayOfWeek = selectedDate.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                Alert.alert("Invalid Date", "Appointments are only available from Monday to Friday. Please select a weekday.");
                return;
            }
            setPreferredDate(selectedDate);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Select date';
        return date.toISOString().split('T')[0]; 
    };

    const handlePickDocument = async (fieldName) => {
        try {
            const picked = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                copyToCacheDirectory: true,
                multiple: false,
            })

            if (picked.canceled) return

            const selected = picked.assets?.[0]
            if (!selected?.uri) {
                Alert.alert('Upload failed', 'No file selected.')
                return
            }

            setUploadedFiles((prev) => ({ ...prev, [fieldName]: selected }))
        } catch (_error) {
            Alert.alert('Upload failed', 'Unable to select file right now.')
        }
    }

    const submitVisaApplication = async () => {
        if (!user?._id) {
            Alert.alert('Login required', 'Please login to submit your request.')
            return
        }

        if (!preferredDate || !preferredTime || !purposeOfTravel.trim()) {
            Alert.alert('Missing details', 'Please provide your preferred date, time, and purpose of travel.')
            return
        }

        const hasAllDocuments =
            uploadedFiles.validPassport &&
            uploadedFiles.completedVisaApplicationForm &&
            uploadedFiles.passportSizePhoto &&
            uploadedFiles.bankCertificateAndStatement

        if (!hasAllDocuments) {
            Alert.alert('Missing files', 'Please upload all 4 required visa documents before submitting.')
            return
        }

        try {
            setIsSubmitting(true)
            
            const formData = new FormData()
            formData.append('serviceId', selectedService._id)
            formData.append('preferredDate', formatDate(preferredDate))
            formData.append('preferredTime', preferredTime)
            formData.append('purposeOfTravel', purposeOfTravel.trim())

            const appendFile = (fieldName, file) => {
                if (!file?.uri) return
                if (Platform.OS === 'web' && file.file) {
                    formData.append(fieldName, file.file, file.name || `${fieldName}-${Date.now()}.pdf`)
                    return
                }
                formData.append(fieldName, {
                    uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
                    name: file.name || `${fieldName}-${Date.now()}.pdf`,
                    type: file.mimeType || 'application/pdf', 
                })
            }

            appendFile('validPassport', uploadedFiles.validPassport)
            appendFile('completedVisaApplicationForm', uploadedFiles.completedVisaApplicationForm)
            appendFile('passportSizePhoto', uploadedFiles.passportSizePhoto)
            appendFile('bankCertificateAndStatement', uploadedFiles.bankCertificateAndStatement)

            const authConfig = withUserHeader(user._id);

            await api.post('/visa/apply', formData, {
                headers: {
                    ...authConfig.headers,
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                }
            })
            
            setShowSuccessModal(true)
        } catch (error) {
            console.log("Upload Error Details:", error?.response?.data || error.message);
            const message = error?.response?.data?.message || 'Unable to submit your visa application right now.'
            Alert.alert('Submission failed', message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleContinue = () => {
        setShowSuccessModal(false);
        cs.navigate('userapplications'); 
    }

    if (!fontsLoaded) return null;

    return (
        <View style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={VisaDetailsGuidanceStyle.container} showsVerticalScrollIndicator={false}>
                
                <View style={VisaDetailsGuidanceStyle.headerContainer}>
                    <Text style={VisaDetailsGuidanceStyle.title}>Visa Application Assistance</Text>
                    <Text style={VisaDetailsGuidanceStyle.subtitle}>Choose a visa service, review the requirements, and submit your preferred schedule.</Text>
                </View>

                {/* Requirements Card */}
                <View style={VisaDetailsGuidanceStyle.columnCard}>
                    <Text style={VisaDetailsGuidanceStyle.sectionTitle}>Requirements</Text>
                    {requirements.length > 0 ? (
                        requirements.map((item, index) => (
                            <View key={index} style={VisaDetailsGuidanceStyle.requirementItem}>
                                <Text style={VisaDetailsGuidanceStyle.requirementText}>{item}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={VisaDetailsGuidanceStyle.subtitle}>No requirements specified for this visa.</Text>
                    )}
                </View>

                {/* Step by Step Card */}
                <View style={VisaDetailsGuidanceStyle.columnCard}>
                    <Text style={VisaDetailsGuidanceStyle.sectionTitle}>Step-by-step process</Text>
                    {steps.length > 0 ? (
                        steps.map((step, index) => (
                            <View key={index} style={VisaDetailsGuidanceStyle.stepRow}>
                                <View style={VisaDetailsGuidanceStyle.stepNumberContainer}>
                                    <Text style={VisaDetailsGuidanceStyle.stepNumber}>{index + 1}</Text>
                                </View>
                                <View style={VisaDetailsGuidanceStyle.stepContent}>
                                    <Text style={VisaDetailsGuidanceStyle.stepTitle}>{step.title}</Text>
                                    <Text style={VisaDetailsGuidanceStyle.stepDesc}>{step.desc}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={VisaDetailsGuidanceStyle.subtitle}>No process steps specified for this visa.</Text>
                    )}
                </View>

                {/* 🔥 DYNAMIC FORM SECTION */}
                {checkingActive ? (
                    <ActivityIndicator size="large" color="#305797" style={{ marginTop: 20, marginBottom: 40 }} />
                ) : activeApp ? (
                    // BLOCKER: Show Warning Card if an active application exists
                    <View style={[VisaDetailsGuidanceStyle.columnCard, { alignItems: 'center', paddingVertical: 40 }]}>
                        <Ionicons name="information-circle" size={56} color="#f5a623" style={{ marginBottom: 16 }} />
                        <Text style={[VisaDetailsGuidanceStyle.sectionTitle, { textAlign: 'center', marginBottom: 8 }]}>Active Application Found</Text>
                        <Text style={[VisaDetailsGuidanceStyle.subtitle, { textAlign: 'center', marginBottom: 24 }]}>
                            You already have an ongoing application for {selectedService?.visaName}. You must wait until it is finished before applying for this exact visa again.
                        </Text>
                        <TouchableOpacity 
                            style={[VisaDetailsGuidanceStyle.submitButton, { alignSelf: 'center' }]}
                            onPress={() => cs.navigate('visaprogress', { applicationId: activeApp._id })}
                        >
                            <Text style={VisaDetailsGuidanceStyle.submitText}>Track Current Application</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // NORMAL: Show the form if NO active application exists
                    <View style={VisaDetailsGuidanceStyle.columnCard}>
                        <Text style={VisaDetailsGuidanceStyle.sectionTitle}>Application Details</Text>
                        
                        <Text style={VisaDetailsGuidanceStyle.formLabel}>Preferred appointment date</Text>
                        <TouchableOpacity style={VisaDetailsGuidanceStyle.inputContainer} onPress={() => setShowDatePicker(true)}>
                            <Text style={[VisaDetailsGuidanceStyle.inputText, !preferredDate && VisaDetailsGuidanceStyle.inputTextPlaceholder]}>
                                {formatDate(preferredDate)}
                            </Text>
                            {preferredDate ? (
                                <TouchableOpacity onPress={() => setPreferredDate(null)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                                    <Ionicons name="close-circle" size={20} color="#9ca3af" />
                                </TouchableOpacity>
                            ) : (
                                <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
                            )}
                        </TouchableOpacity>

                        <Text style={VisaDetailsGuidanceStyle.formLabel}>Preferred appointment time</Text>
                        <TouchableOpacity style={VisaDetailsGuidanceStyle.inputContainer} onPress={() => setShowTimePickerModal(true)}>
                            <Text style={[VisaDetailsGuidanceStyle.inputText, !preferredTime && VisaDetailsGuidanceStyle.inputTextPlaceholder]}>
                                {preferredTime ? preferredTime : 'Select time'}
                            </Text>
                            {preferredTime ? (
                                <TouchableOpacity onPress={() => setPreferredTime(null)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                                    <Ionicons name="close-circle" size={20} color="#9ca3af" />
                                </TouchableOpacity>
                            ) : (
                                <Ionicons name="time-outline" size={20} color="#9ca3af" />
                            )}
                        </TouchableOpacity>

                        <Text style={VisaDetailsGuidanceStyle.formLabel}>Purpose of travel</Text>
                        <TextInput
                            style={VisaDetailsGuidanceStyle.textArea}
                            placeholder="Share your purpose of travel"
                            placeholderTextColor="#9ca3af"
                            multiline
                            value={purposeOfTravel}
                            onChangeText={setPurposeOfTravel}
                        />

                        <Text style={[VisaDetailsGuidanceStyle.sectionTitle, { marginTop: 10 }]}>Upload Documents</Text>
                        <Text style={[VisaDetailsGuidanceStyle.subtitle, { marginBottom: 16 }]}>Please upload all 4 required documents to proceed.</Text>

                        {requiredVisaDocuments.map((doc) => (
                            <View key={doc.key}>
                                <View style={VisaDetailsGuidanceStyle.uploadRow}>
                                    <Text style={VisaDetailsGuidanceStyle.uploadLabel} numberOfLines={2}>{doc.label}</Text>
                                    <TouchableOpacity
                                        style={VisaDetailsGuidanceStyle.uploadButton}
                                        onPress={() => handlePickDocument(doc.key)}
                                    >
                                        <Text style={VisaDetailsGuidanceStyle.uploadButtonText}>Choose File</Text>
                                    </TouchableOpacity>
                                </View>

                                {!!uploadedFiles[doc.key]?.name && (
                                    <Text style={VisaDetailsGuidanceStyle.fileNameText} numberOfLines={1}>
                                        <Ionicons name="document-attach-outline" size={12} color="#0284c7" /> {uploadedFiles[doc.key].name}
                                    </Text>
                                )}
                            </View>
                        ))}

                        <TouchableOpacity 
                            style={VisaDetailsGuidanceStyle.submitButton}
                            onPress={submitVisaApplication}
                            disabled={isSubmitting}
                        >
                            <Text style={VisaDetailsGuidanceStyle.submitText}>
                                {isSubmitting ? 'Submitting...' : 'Submit request'}
                            </Text>
                        </TouchableOpacity>

                        <View style={{ marginTop: 40 }}>
                            <Text style={[VisaDetailsGuidanceStyle.sectionTitle, { color: '#1f2937'}]}>FAQs</Text>
                            <Text style={VisaDetailsGuidanceStyle.subtitle}>Find answers to common questions about the visa application process.</Text>
                            
                            <View style={{ marginTop: 20 }}>
                                <Text style={VisaDetailsGuidanceStyle.faqTitle}>What documents do I need to prepare?</Text>
                                <Text style={VisaDetailsGuidanceStyle.faqDesc}>Refer to the requirements section above for a general list. Specific services may have additional requirements.</Text>
                                
                                <Text style={VisaDetailsGuidanceStyle.faqTitle}>How long does the process take?</Text>
                                <Text style={VisaDetailsGuidanceStyle.faqDesc}>Processing times vary by embassy and service. After submission, you will receive updates on your application's status.</Text>
                                
                                <Text style={VisaDetailsGuidanceStyle.faqTitle}>Can I reschedule my appointment?</Text>
                                <Text style={VisaDetailsGuidanceStyle.faqDesc}>Rescheduling policies depend on the embassy. If you need to change your appointment, please contact the embassy directly.</Text>
                            </View>
                        </View>
                    </View>
                )}

            </ScrollView>

            {showDatePicker && (
                <DateTimePicker
                    value={preferredDate || new Date()}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={onDateChange}
                />
            )}

            <Modal visible={showTimePickerModal} transparent animationType="fade">
                <TouchableOpacity style={VisaDetailsGuidanceStyle.modalOverlay} activeOpacity={1} onPress={() => setShowTimePickerModal(false)}>
                    <View style={[VisaDetailsGuidanceStyle.modalCard, { padding: 0, maxHeight: '60%' }]}>
                        <View style={{ padding: 20, borderBottomWidth: 1, borderColor: '#e5e7eb', width: '100%', backgroundColor: '#f9fafb' }}>
                            <Text style={[VisaDetailsGuidanceStyle.sectionTitle, { marginBottom: 0, textAlign: 'center' }]}>Select Time</Text>
                        </View>
                        <ScrollView style={{ width: '100%' }}>
                            {timeSlots.map((slot, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{ paddingVertical: 16, borderBottomWidth: 1, borderColor: '#f3f4f6', alignItems: 'center' }}
                                    onPress={() => {
                                        setPreferredTime(slot);
                                        setShowTimePickerModal(false);
                                    }}
                                >
                                    <Text style={{ 
                                        fontSize: 16, 
                                        fontFamily: preferredTime === slot ? "Montserrat_700Bold" : "Roboto_500Medium", 
                                        color: preferredTime === slot ? '#305797' : '#374151' 
                                    }}>
                                        {slot}
                                    </Text>
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