import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import * as DocumentPicker from 'expo-document-picker'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import PassportGuidanceReNewStyle from '../../styles/clientstyles/PassportGuidanceReNewStyle'
import { api, withUserHeader } from '../../utils/api'
import { useUser } from '../../context/UserContext'


export default function PassportGuidanceReNew() {

    const cs = useNavigation()
    const { user } = useUser()
    const [dfaLocation, setDfaLocation] = useState('')
    const [preferredDate, setPreferredDate] = useState('')
    const [preferredTime, setPreferredTime] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState({
        passportPhoto: null,
        applicationForm: null,
        psaBirthCertificate: null,
        validGovernmentId: null,
        oldPassport: null,
    })

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })

    const submitApplication = async () => {
        if (!user?._id) {
            Alert.alert('Login required', 'Please login again and try submitting your request.')
            return
        }

        if (!dfaLocation || !preferredDate || !preferredTime) {
            Alert.alert('Missing fields', 'Please fill in DFA location, preferred date, and preferred time.')
            return
        }

        const hasAllDocuments =
            uploadedFiles.passportPhoto &&
            uploadedFiles.applicationForm &&
            uploadedFiles.psaBirthCertificate &&
            uploadedFiles.validGovernmentId &&
            uploadedFiles.oldPassport

        if (!hasAllDocuments) {
            Alert.alert('Missing files', 'Please upload all required renewal passport documents before submitting.')
            return
        }

        const formData = new FormData()
        formData.append('dfaLocation', dfaLocation)
        formData.append('preferredDate', preferredDate)
        formData.append('preferredTime', preferredTime)
        formData.append('applicationType', 'Renew Passport')

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

        appendFile('passportPhoto', uploadedFiles.passportPhoto)
        appendFile('applicationForm', uploadedFiles.applicationForm)
        appendFile('psaBirthCertificate', uploadedFiles.psaBirthCertificate)
        appendFile('validGovernmentId', uploadedFiles.validGovernmentId)
        appendFile('oldPassport', uploadedFiles.oldPassport)

        try {
            setIsSubmitting(true)
            await api.post(
                '/passport/apply',
                formData,
                withUserHeader(user._id)
            )

            Alert.alert('Submitted', 'Your passport renewal request has been submitted.')
            cs.navigate('passportprogress')
        } catch (error) {
            const message = error?.response?.data?.message || 'Unable to submit passport application right now.'
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
        <View style={{ flex: 1 }}>
            <ScrollView>
                <View style={PassportGuidanceReNewStyle.container}>
                    <Text style={PassportGuidanceReNewStyle.title}>Re-new Passport</Text>

                    <View style={PassportGuidanceReNewStyle.card}>
                        <Text style={PassportGuidanceReNewStyle.sectionTitle}>Requirements</Text>
                        <Text style={PassportGuidanceReNewStyle.description}>These are the following requirements that are needed to apply for a passport</Text>
                        <View style={PassportGuidanceReNewStyle.uploadRow}>
                            <Text style={PassportGuidanceReNewStyle.listItem}>2x2 Photo</Text>
                            <TouchableOpacity
                                style={PassportGuidanceReNewStyle.uploadButton}
                                onPress={() => handlePickDocument('passportPhoto')}
                            >
                                <Text style={PassportGuidanceReNewStyle.uploadButtonText}>Upload</Text>
                            </TouchableOpacity>
                        </View>
                        {!!uploadedFiles.passportPhoto?.name && (
                            <Text style={{ fontSize: 12, color: '#2d5fb8', marginBottom: 8 }}>
                                Uploaded: {uploadedFiles.passportPhoto.name}
                            </Text>
                        )}

                        <View style={PassportGuidanceReNewStyle.uploadRow}>
                            <Text style={PassportGuidanceReNewStyle.listItem}>Applicaton Form</Text>
                            <TouchableOpacity
                                style={PassportGuidanceReNewStyle.uploadButton}
                                onPress={() => handlePickDocument('applicationForm')}
                            >
                                <Text style={PassportGuidanceReNewStyle.uploadButtonText}>Upload</Text>
                            </TouchableOpacity>
                        </View>
                        {!!uploadedFiles.applicationForm?.name && (
                            <Text style={{ fontSize: 12, color: '#2d5fb8', marginBottom: 8 }}>
                                Uploaded: {uploadedFiles.applicationForm.name}
                            </Text>
                        )}

                        <View style={PassportGuidanceReNewStyle.uploadRow}>
                            <Text style={PassportGuidanceReNewStyle.listItem}>PSA Birth Certificate</Text>
                            <TouchableOpacity
                                style={PassportGuidanceReNewStyle.uploadButton}
                                onPress={() => handlePickDocument('psaBirthCertificate')}
                            >
                                <Text style={PassportGuidanceReNewStyle.uploadButtonText}>Upload</Text>
                            </TouchableOpacity>
                        </View>
                        {!!uploadedFiles.psaBirthCertificate?.name && (
                            <Text style={{ fontSize: 12, color: '#2d5fb8', marginBottom: 8 }}>
                                Uploaded: {uploadedFiles.psaBirthCertificate.name}
                            </Text>
                        )}

                        <View style={PassportGuidanceReNewStyle.uploadRow}>
                            <Text style={PassportGuidanceReNewStyle.listItem}>Valid Government Issued ID</Text>
                            <TouchableOpacity
                                style={PassportGuidanceReNewStyle.uploadButton}
                                onPress={() => handlePickDocument('validGovernmentId')}
                            >
                                <Text style={PassportGuidanceReNewStyle.uploadButtonText}>Upload</Text>
                            </TouchableOpacity>
                        </View>
                        {!!uploadedFiles.validGovernmentId?.name && (
                            <Text style={{ fontSize: 12, color: '#2d5fb8', marginBottom: 8 }}>
                                Uploaded: {uploadedFiles.validGovernmentId.name}
                            </Text>
                        )}

                        <View style={PassportGuidanceReNewStyle.uploadRow}>
                            <Text style={PassportGuidanceReNewStyle.listItem}>Old Passport</Text>
                            <TouchableOpacity
                                style={PassportGuidanceReNewStyle.uploadButton}
                                onPress={() => handlePickDocument('oldPassport')}
                            >
                                <Text style={PassportGuidanceReNewStyle.uploadButtonText}>Upload</Text>
                            </TouchableOpacity>
                        </View>
                        {!!uploadedFiles.oldPassport?.name && (
                            <Text style={{ fontSize: 12, color: '#2d5fb8' }}>
                                Uploaded: {uploadedFiles.oldPassport.name}
                            </Text>
                        )}

                    </View>

                    <View style={PassportGuidanceReNewStyle.card}>
                        <Text style={PassportGuidanceReNewStyle.sectionTitle}>Process</Text>
                        <View >
                            <Text style={PassportGuidanceReNewStyle.stepTitle}>Step 1</Text>
                            <Text style={PassportGuidanceReNewStyle.stepText}>Set an Online Appointment: Schedule a visit at a consular office</Text>
                        </View>

                        <View >
                            <Text style={PassportGuidanceReNewStyle.stepTitle}>Step 2</Text>
                            <Text style={PassportGuidanceReNewStyle.stepText}>Fill out the application form: Complete the application form</Text>
                        </View>

                        <View>
                            <Text style={PassportGuidanceReNewStyle.stepTitle}>Step 3</Text>
                            <Text style={PassportGuidanceReNewStyle.stepText}>Pay the Processing Fee: Pay the fee online via GCash or other uathorized payment channels</Text>
                        </View>

                        <View >
                            <Text style={PassportGuidanceReNewStyle.stepTitle}>Step 4</Text>
                            <Text style={PassportGuidanceReNewStyle.stepText}>Appear at the DFA Office: Arrive at your chosen DFA office on your scheduled date and time</Text>
                        </View>

                        <View >
                            <Text style={PassportGuidanceReNewStyle.stepTitle}>Step 5</Text>
                            <Text style={PassportGuidanceReNewStyle.stepText}>Submit Documents: Prepare original and photocopies of documents including your old passport</Text>
                        </View>

                        <View >
                            <Text style={PassportGuidanceReNewStyle.stepTitle}>Step 6</Text>
                            <Text style={PassportGuidanceReNewStyle.stepText}>Claim Your New Passport</Text>
                        </View>



                    </View>

                    <View style={PassportGuidanceReNewStyle.card}>
                        <Text style={PassportGuidanceReNewStyle.sectionTitle}>Submit request</Text>
                        <TextInput
                            value={dfaLocation}
                            onChangeText={setDfaLocation}
                            placeholder="DFA location"
                            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 10 }}
                        />
                        <TextInput
                            value={preferredDate}
                            onChangeText={setPreferredDate}
                            placeholder="Preferred date (YYYY-MM-DD)"
                            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 10 }}
                        />
                        <TextInput
                            value={preferredTime}
                            onChangeText={setPreferredTime}
                            placeholder="Preferred time (HH:MM)"
                            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10 }}
                        />
                    </View>

                    <TouchableOpacity
                        style={PassportGuidanceReNewStyle.backButton}
                        onPress={submitApplication}
                        disabled={isSubmitting}
                    >
                        <Text style={PassportGuidanceReNewStyle.backText}>{isSubmitting ? 'Submitting...' : 'Submit Application'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={PassportGuidanceReNewStyle.backButton}
                        onPress={() => {
                            cs.navigate("passportguidance")
                        }}
                    >
                        <Text style={PassportGuidanceReNewStyle.backText}>Back</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>

    )
}