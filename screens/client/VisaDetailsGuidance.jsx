import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native'
import React, { useMemo, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
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
    const [purposeOfTravel, setPurposeOfTravel] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

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

        if (!preferredDate || !purposeOfTravel.trim()) {
            Alert.alert('Missing details', 'Please provide your preferred date and purpose of travel.')
            return
        }

        try {
            setIsSubmitting(true)
            await api.post(
                '/visa/apply',
                {
                    serviceId: selectedService._id,
                    preferredDate,
                    purposeOfTravel: purposeOfTravel.trim(),
                },
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