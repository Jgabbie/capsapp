import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import { ScrollView } from 'react-native-web'
import PassportGuidanceNewStyle from '../../styles/clientstyles/PassportGuidanceNewStyle'

export default function PassportGuidanceNew() {

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
        <View style={PassportGuidanceNewStyle.container}>
          <Text style={PassportGuidanceNewStyle.title}>New Passport</Text>

          <View style={PassportGuidanceNewStyle.card}>
            <Text style={PassportGuidanceNewStyle.sectionTitle}>Requirements</Text>
            <Text style={PassportGuidanceNewStyle.description}>These are the following requirements that are needed to apply for a passport</Text>

            <View style={PassportGuidanceNewStyle.uploadRow}>
              <Text style={PassportGuidanceNewStyle.listItem}>2x2 Photo</Text>
              <TouchableOpacity style={PassportGuidanceNewStyle.uploadButton}>
                <Text style={PassportGuidanceNewStyle.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>

            <View style={PassportGuidanceNewStyle.uploadRow}>
              <Text style={PassportGuidanceNewStyle.listItem}>Applicaton Form</Text>
              <TouchableOpacity style={PassportGuidanceNewStyle.uploadButton}>
                <Text style={PassportGuidanceNewStyle.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>

            <View style={PassportGuidanceNewStyle.uploadRow}>
              <Text style={PassportGuidanceNewStyle.listItem}>PSA Birth Certificate</Text>
              <TouchableOpacity style={PassportGuidanceNewStyle.uploadButton}>
                <Text style={PassportGuidanceNewStyle.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>

            <View style={PassportGuidanceNewStyle.uploadRow}>
              <Text style={PassportGuidanceNewStyle.listItem}>Valid Government Issued ID</Text>
              <TouchableOpacity style={PassportGuidanceNewStyle.uploadButton}>
                <Text style={PassportGuidanceNewStyle.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>

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

          <TouchableOpacity
            style={PassportGuidanceNewStyle.backButton}
            onPress={() => {
              cs.navigate("passportprogress")
            }}
          >
            <Text style={PassportGuidanceNewStyle.backText}>Proceed</Text>
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