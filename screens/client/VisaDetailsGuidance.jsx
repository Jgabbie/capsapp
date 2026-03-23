import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native'
import React, { useMemo, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import * as DocumentPicker from 'expo-document-picker'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import VisaDetailsGuidanceStyle from '../../styles/clientstyles/VisaDetailsGuidanceStyle'
import { useRoute } from '@react-navigation/native'
import { api, withUserHeader } from '../../utils/api'
import { useUser } from '../../context/UserContext'


export default function VisaDetailsGuidance() {
    const cs = useNavigation()
    const route = useRoute()
    const { user } = useUser()
    const selectedService = route.params?.service
    const [preferredDate, setPreferredDate] = useState('')
    const [preferredTime, setPreferredTime] = useState('')
    const [purposeOfTravel, setPurposeOfTravel] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState({
        validPassport: null,
        completedVisaApplicationForm: null,
        passportSizePhoto: null,
        bankCertificateAndStatement: null,
    })

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })
    const requirements = useMemo(
        () =>
            selectedService?.visaRequirements?.length
                ? selectedService.visaRequirements
                : [
                    'Valid passport (at least 6 months validity)',
                    'Completed visa application form',
                    'Recent passport-size photo',
                    'Proof of financial capacity',
                ],
        [selectedService]
    )

    const requiredVisaDocuments = useMemo(
        () => [
            { key: 'validPassport', label: 'Valid passport' },
            { key: 'completedVisaApplicationForm', label: 'Completed visa application form' },
            { key: 'passportSizePhoto', label: 'Recent passport-size photo' },
            { key: 'bankCertificateAndStatement', label: 'Bank certificate and statement' },
        ],
        []
    )

    const steps = useMemo(
        () =>
            selectedService?.visaProcessSteps?.length
                ? selectedService.visaProcessSteps
                : [
                    'Prepare the required documents.',
                    'Complete and review the application form.',
                    'Submit your documents and pay the processing fee.',
                    'Wait for processing updates from the agency.',
                ],
        [selectedService]
    )

    const submitVisaApplication = async () => {
        if (!user?._id) {
            Alert.alert('Login required', 'Please login again and try submitting your request.')
            return
        }

        if (!selectedService?._id) {
            Alert.alert('Service unavailable', 'Please return to Visa Guidance and select a service.')
            return
        }

        if (!preferredDate || !preferredTime || !purposeOfTravel.trim()) {
            Alert.alert('Missing details', 'Please provide your preferred date, preferred time, and purpose of travel.')
            return
        }

        const hasAllDocuments =
            uploadedFiles.validPassport &&
            uploadedFiles.completedVisaApplicationForm &&
            uploadedFiles.passportSizePhoto &&
            uploadedFiles.bankCertificateAndStatement

        if (!hasAllDocuments) {
            Alert.alert('Missing files', 'Please upload all required visa documents before submitting.')
            return
        }

        const formData = new FormData()
        formData.append('serviceId', selectedService._id)
        formData.append('preferredDate', preferredDate)
        formData.append('preferredTime', preferredTime)
        formData.append('purposeOfTravel', purposeOfTravel.trim())

        const appendFile = (fieldName, file) => {
            if (!file?.uri) return

            if (Platform.OS === 'web' && file.file) {
                formData.append(fieldName, file.file, file.name || `${fieldName}-${Date.now()}.pdf`)
                return
            }

            formData.append(fieldName, {
                uri: file.uri,
                name: file.name || `${fieldName}-${Date.now()}.pdf`,
                type: file.mimeType || 'application/octet-stream',
            })
        }

        appendFile('validPassport', uploadedFiles.validPassport)
        appendFile('completedVisaApplicationForm', uploadedFiles.completedVisaApplicationForm)
        appendFile('passportSizePhoto', uploadedFiles.passportSizePhoto)
        appendFile('bankCertificateAndStatement', uploadedFiles.bankCertificateAndStatement)

        try {
            setIsSubmitting(true)
            await api.post(
                '/visa/apply',
                formData,
                withUserHeader(user._id)
            )

            Alert.alert('Submitted', 'Your visa application request has been submitted.')
            cs.navigate('visaprogress')
        } catch (error) {
            const message = error?.response?.data?.message || 'Unable to submit your visa application right now.'
            Alert.alert('Submission failed', message)
        } finally {
            setIsSubmitting(false)
        }
    }

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



    return (
        <ScrollView>
            <View style={VisaDetailsGuidanceStyle.container}>
            <Text style={VisaDetailsGuidanceStyle.title}>{selectedService?.visaName || 'Visa Assistance'}</Text>

            <View style={VisaDetailsGuidanceStyle.card}>
                <Text style={VisaDetailsGuidanceStyle.sectionTitle}>Requirements</Text>
                <Text style={VisaDetailsGuidanceStyle.description}>These are the required documents for this visa service.</Text>

                {requirements.map((item, index) => (
                    <View key={`${item}-${index}`} style={VisaDetailsGuidanceStyle.uploadRow}>
                        <Text style={VisaDetailsGuidanceStyle.listItem}>{index + 1}. {item}</Text>
                    </View>
                ))}

                <Text style={[VisaDetailsGuidanceStyle.sectionTitle, { fontSize: 16, marginTop: 12 }]}>Upload Files</Text>

                {requiredVisaDocuments.map((doc) => (
                    <View key={doc.key} style={{ marginBottom: 10 }}>
                        <View style={VisaDetailsGuidanceStyle.uploadRow}>
                            <Text style={VisaDetailsGuidanceStyle.listItem}>{doc.label}</Text>
                            <TouchableOpacity
                                style={VisaDetailsGuidanceStyle.uploadButton}
                                onPress={() => handlePickDocument(doc.key)}
                            >
                                <Text style={VisaDetailsGuidanceStyle.uploadButtonText}>Upload</Text>
                            </TouchableOpacity>
                        </View>

                        {!!uploadedFiles[doc.key]?.name && (
                            <Text style={{ fontSize: 12, color: '#2d5fb8', marginTop: 4 }}>
                                Uploaded: {uploadedFiles[doc.key].name}
                            </Text>
                        )}
                    </View>
                ))}

            </View>

            <View style={VisaDetailsGuidanceStyle.card}>
                <Text style={VisaDetailsGuidanceStyle.sectionTitle}>Process</Text>
                {steps.map((step, index) => (
                    <View key={`step-${index}`}>
                        <Text style={VisaDetailsGuidanceStyle.stepTitle}>Step {index + 1}</Text>
                        <Text style={VisaDetailsGuidanceStyle.stepText}>{step}</Text>
                    </View>
                ))}



            </View>

            <View style={VisaDetailsGuidanceStyle.card}>
                <Text style={VisaDetailsGuidanceStyle.sectionTitle}>Submit request</Text>
                <TextInput
                    value={preferredDate}
                    onChangeText={setPreferredDate}
                    placeholder="Preferred submission date (YYYY-MM-DD)"
                    style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 10 }}
                />
                <TextInput
                    value={preferredTime}
                    onChangeText={setPreferredTime}
                    placeholder="Preferred time (HH:MM)"
                    style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 10 }}
                />
                <TextInput
                    value={purposeOfTravel}
                    onChangeText={setPurposeOfTravel}
                    placeholder="Purpose of travel"
                    multiline
                    style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, minHeight: 90, textAlignVertical: 'top' }}
                />
            </View>

            <TouchableOpacity
                style={VisaDetailsGuidanceStyle.backButton}
                onPress={submitVisaApplication}
                disabled={isSubmitting}
            >
                <Text style={VisaDetailsGuidanceStyle.backText}>{isSubmitting ? 'Submitting...' : 'Submit Application'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={VisaDetailsGuidanceStyle.backButton}
                onPress={() => {
                    cs.navigate("visaguidance")
                }}
            >
                <Text style={VisaDetailsGuidanceStyle.backText}>Back</Text>
            </TouchableOpacity>
        </View>
        </ScrollView>
    )
}