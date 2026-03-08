import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import VisaDetailsGuidanceStyle from '../../styles/clientstyles/VisaDetailsGuidanceStyle'


export default function VisaDetailsGuidance() {
    const cs = useNavigation()

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })
    return (
        <View style={VisaDetailsGuidanceStyle.container}>
            <Text style={VisaDetailsGuidanceStyle.title}>Japan Visa</Text>

            <View style={VisaDetailsGuidanceStyle.card}>
                <Text style={VisaDetailsGuidanceStyle.sectionTitle}>Requirements</Text>
                <Text style={VisaDetailsGuidanceStyle.description}>These are the following requirements that are needed to apply for a passport</Text>

                <View style={VisaDetailsGuidanceStyle.uploadRow}>
                    <Text style={VisaDetailsGuidanceStyle.listItem}>Passport</Text>
                    <TouchableOpacity style={VisaDetailsGuidanceStyle.uploadButton}>
                        <Text style={VisaDetailsGuidanceStyle.uploadButtonText}>Upload</Text>
                    </TouchableOpacity>
                </View>

                <View style={VisaDetailsGuidanceStyle.uploadRow}>
                    <Text style={VisaDetailsGuidanceStyle.listItem}>Visa Applicaton Form</Text>
                    <TouchableOpacity style={VisaDetailsGuidanceStyle.uploadButton}>
                        <Text style={VisaDetailsGuidanceStyle.uploadButtonText}>Upload</Text>
                    </TouchableOpacity>
                </View>

                <View style={VisaDetailsGuidanceStyle.uploadRow}>
                    <Text style={VisaDetailsGuidanceStyle.listItem}>PSA Birth Certificate</Text>
                    <TouchableOpacity style={VisaDetailsGuidanceStyle.uploadButton}>
                        <Text style={VisaDetailsGuidanceStyle.uploadButtonText}>Upload</Text>
                    </TouchableOpacity>
                </View>

                <View style={VisaDetailsGuidanceStyle.uploadRow}>
                    <Text style={VisaDetailsGuidanceStyle.listItem}>Valid Government Issued ID</Text>
                    <TouchableOpacity style={VisaDetailsGuidanceStyle.uploadButton}>
                        <Text style={VisaDetailsGuidanceStyle.uploadButtonText}>Upload</Text>
                    </TouchableOpacity>
                </View>

            </View>

            <View style={VisaDetailsGuidanceStyle.card}>
                <Text style={VisaDetailsGuidanceStyle.sectionTitle}>Process</Text>
                <View >
                    <Text style={VisaDetailsGuidanceStyle.stepTitle}>Step 1</Text>
                    <Text style={VisaDetailsGuidanceStyle.stepText}>Prepare the Documents: Ready the necessary documents for application</Text>
                </View>

                <View >
                    <Text style={VisaDetailsGuidanceStyle.stepTitle}>Step 2</Text>
                    <Text style={VisaDetailsGuidanceStyle.stepText}>Fill out the application form: Complete the application form</Text>
                </View>

                <View>
                    <Text style={VisaDetailsGuidanceStyle.stepTitle}>Step 3</Text>
                    <Text style={VisaDetailsGuidanceStyle.stepText}>Application Process: Submit your application form with the required documents</Text>
                </View>

                <View >
                    <Text style={VisaDetailsGuidanceStyle.stepTitle}>Step 4</Text>
                    <Text style={VisaDetailsGuidanceStyle.stepText}>Visa Handling fee: You must pay the fee after you submit your documents</Text>
                </View>

                <View >
                    <Text style={VisaDetailsGuidanceStyle.stepTitle}>Step 5</Text>
                    <Text style={VisaDetailsGuidanceStyle.stepText}>Wait for result: The travel agency will contact if the process is complete</Text>
                </View>



            </View>

            <TouchableOpacity
                style={VisaDetailsGuidanceStyle.backButton}
                onPress={() => {
                    cs.navigate("visaprogress")
                }}
            >
                <Text style={VisaDetailsGuidanceStyle.backText}>Proceed</Text>
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
    )
}