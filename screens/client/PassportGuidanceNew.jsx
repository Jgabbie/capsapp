import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import * as DocumentPicker from 'expo-document-picker'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import PassportGuidanceNewStyle from '../../styles/clientstyles/PassportGuidanceNewStyle'
import { api, withUserHeader } from '../../utils/api'
import { useUser } from '../../context/UserContext'

export default function PassportGuidanceNew() {

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
      uploadedFiles.validGovernmentId

    if (!hasAllDocuments) {
      Alert.alert('Missing files', 'Please upload all required passport documents before submitting.')
      return
    }

    const formData = new FormData()
    formData.append('dfaLocation', dfaLocation)
    formData.append('preferredDate', preferredDate)
    formData.append('preferredTime', preferredTime)
    formData.append('applicationType', 'New Passport')

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

    try {
      setIsSubmitting(true)
      await api.post(
        '/passport/apply',
        formData,
        withUserHeader(user._id)
      )

      Alert.alert('Submitted', 'Your passport application request has been submitted.')
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
        <View style={PassportGuidanceNewStyle.container}>
          <Text style={PassportGuidanceNewStyle.title}>New Passport</Text>

          <View style={PassportGuidanceNewStyle.card}>
            <Text style={PassportGuidanceNewStyle.sectionTitle}>Requirements</Text>
            <Text style={PassportGuidanceNewStyle.description}>These are the following requirements that are needed to apply for a passport</Text>

            <View style={PassportGuidanceNewStyle.uploadRow}>
              <Text style={PassportGuidanceNewStyle.listItem}>2x2 Photo</Text>
              <TouchableOpacity
                style={PassportGuidanceNewStyle.uploadButton}
                onPress={() => handlePickDocument('passportPhoto')}
              >
                <Text style={PassportGuidanceNewStyle.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>
            {!!uploadedFiles.passportPhoto?.name && (
              <Text style={{ fontSize: 12, color: '#2d5fb8', marginBottom: 8 }}>
                Uploaded: {uploadedFiles.passportPhoto.name}
              </Text>
            )}

            <View style={PassportGuidanceNewStyle.uploadRow}>
              <Text style={PassportGuidanceNewStyle.listItem}>Applicaton Form</Text>
              <TouchableOpacity
                style={PassportGuidanceNewStyle.uploadButton}
                onPress={() => handlePickDocument('applicationForm')}
              >
                <Text style={PassportGuidanceNewStyle.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>
            {!!uploadedFiles.applicationForm?.name && (
              <Text style={{ fontSize: 12, color: '#2d5fb8', marginBottom: 8 }}>
                Uploaded: {uploadedFiles.applicationForm.name}
              </Text>
            )}

            <View style={PassportGuidanceNewStyle.uploadRow}>
              <Text style={PassportGuidanceNewStyle.listItem}>PSA Birth Certificate</Text>
              <TouchableOpacity
                style={PassportGuidanceNewStyle.uploadButton}
                onPress={() => handlePickDocument('psaBirthCertificate')}
              >
                <Text style={PassportGuidanceNewStyle.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>
            {!!uploadedFiles.psaBirthCertificate?.name && (
              <Text style={{ fontSize: 12, color: '#2d5fb8', marginBottom: 8 }}>
                Uploaded: {uploadedFiles.psaBirthCertificate.name}
              </Text>
            )}

            <View style={PassportGuidanceNewStyle.uploadRow}>
              <Text style={PassportGuidanceNewStyle.listItem}>Valid Government Issued ID</Text>
              <TouchableOpacity
                style={PassportGuidanceNewStyle.uploadButton}
                onPress={() => handlePickDocument('validGovernmentId')}
              >
                <Text style={PassportGuidanceNewStyle.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>
            {!!uploadedFiles.validGovernmentId?.name && (
              <Text style={{ fontSize: 12, color: '#2d5fb8' }}>
                Uploaded: {uploadedFiles.validGovernmentId.name}
              </Text>
            )}

          </View>

          <View style={PassportGuidanceNewStyle.card}>
            <Text style={PassportGuidanceNewStyle.sectionTitle}>Process</Text>
            <View >
              <Text style={PassportGuidanceNewStyle.stepTitle}>Step 1</Text>
              <Text style={PassportGuidanceNewStyle.stepText}>Set an Online Appointment: Schedule a visit at a consular office</Text>
            </View>

            <View >
              <Text style={PassportGuidanceNewStyle.stepTitle}>Step 2</Text>
              <Text style={PassportGuidanceNewStyle.stepText}>Fill out the application form: Complete the application form</Text>
            </View>

            <View>
              <Text style={PassportGuidanceNewStyle.stepTitle}>Step 3</Text>
              <Text style={PassportGuidanceNewStyle.stepText}>Pay the Processing Fee: Pay the fee online via GCash or other uathorized payment channels</Text>
            </View>

            <View >
              <Text style={PassportGuidanceNewStyle.stepTitle}>Step 4</Text>
              <Text style={PassportGuidanceNewStyle.stepText}>Gather Required Documents: Prepare original and photocopies of documents</Text>
            </View>

            <View >
              <Text style={PassportGuidanceNewStyle.stepTitle}>Step 5</Text>
              <Text style={PassportGuidanceNewStyle.stepText}>Appear at the DFA Office: Arrive at your chosen DFA office on your scheduled date and time</Text>
            </View>

            <View >
              <Text style={PassportGuidanceNewStyle.stepTitle}>Step 6</Text>
              <Text style={PassportGuidanceNewStyle.stepText}>Claim Your Passport</Text>
            </View>



          </View>

          <View style={PassportGuidanceNewStyle.card}>
            <Text style={PassportGuidanceNewStyle.sectionTitle}>Submit request</Text>
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
            style={PassportGuidanceNewStyle.backButton}
            onPress={submitApplication}
            disabled={isSubmitting}
          >
            <Text style={PassportGuidanceNewStyle.backText}>{isSubmitting ? 'Submitting...' : 'Submit Application'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={PassportGuidanceNewStyle.backButton}
            onPress={() => {
              cs.navigate("passportguidance")
            }}
          >
            <Text style={PassportGuidanceNewStyle.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

    </View>
  )
}