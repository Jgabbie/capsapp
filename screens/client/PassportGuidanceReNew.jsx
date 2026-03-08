import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import PassportGuidanceReNewStyle from '../../styles/clientstyles/PassportGuidanceReNewStyle'


export default function PassportGuidanceReNew() {

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
        <View style={{ flex: 1 }}>
            <ScrollView>
                <View style={PassportGuidanceReNewStyle.container}>
                    <Text style={PassportGuidanceReNewStyle.title}>Re-new Passport</Text>

                    <View style={PassportGuidanceReNewStyle.card}>
                        <Text style={PassportGuidanceReNewStyle.sectionTitle}>Requirements</Text>
                        <Text style={PassportGuidanceReNewStyle.description}>These are the following requirements that are needed to apply for a passport</Text>
                        <View style={PassportGuidanceReNewStyle.uploadRow}>
                            <Text style={PassportGuidanceReNewStyle.listItem}>2x2 Photo</Text>
                            <TouchableOpacity style={PassportGuidanceReNewStyle.uploadButton}>
                                <Text style={PassportGuidanceReNewStyle.uploadButtonText}>Upload</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={PassportGuidanceReNewStyle.uploadRow}>
                            <Text style={PassportGuidanceReNewStyle.listItem}>Applicaton Form</Text>
                            <TouchableOpacity style={PassportGuidanceReNewStyle.uploadButton}>
                                <Text style={PassportGuidanceReNewStyle.uploadButtonText}>Upload</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={PassportGuidanceReNewStyle.uploadRow}>
                            <Text style={PassportGuidanceReNewStyle.listItem}>PSA Birth Certificate</Text>
                            <TouchableOpacity style={PassportGuidanceReNewStyle.uploadButton}>
                                <Text style={PassportGuidanceReNewStyle.uploadButtonText}>Upload</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={PassportGuidanceReNewStyle.uploadRow}>
                            <Text style={PassportGuidanceReNewStyle.listItem}>Valid Government Issued ID</Text>
                            <TouchableOpacity style={PassportGuidanceReNewStyle.uploadButton}>
                                <Text style={PassportGuidanceReNewStyle.uploadButtonText}>Upload</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={PassportGuidanceReNewStyle.uploadRow}>
                            <Text style={PassportGuidanceReNewStyle.listItem}>Old Passport</Text>
                            <TouchableOpacity style={PassportGuidanceReNewStyle.uploadButton}>
                                <Text style={PassportGuidanceReNewStyle.uploadButtonText}>Upload</Text>
                            </TouchableOpacity>
                        </View>

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

                    <TouchableOpacity
                        style={PassportGuidanceReNewStyle.backButton}
                        onPress={() => {
                            cs.navigate("passportprogress")
                        }}
                    >
                        <Text style={PassportGuidanceReNewStyle.backText}>Proceed</Text>
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