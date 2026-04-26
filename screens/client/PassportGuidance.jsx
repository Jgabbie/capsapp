import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'

import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import Chatbot from '../../components/Chatbot'
import PassportGuidanceStyle from '../../styles/clientstyles/PassportGuidanceStyle'

export default function PassportGuidance() {
    const cs = useNavigation()
    const [isSidebarVisible, setSidebarVisible] = useState(false)

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold,
        Roboto_400Regular, Roboto_500Medium, Roboto_700Bold
    })

    if (!fontsLoaded) return null;

    return (
        <View style={PassportGuidanceStyle.container}>
            <Header openSidebar={() => { setSidebarVisible(true) }} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />
            
            <ScrollView contentContainerStyle={PassportGuidanceStyle.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={PassportGuidanceStyle.headerContainer}>
                    <Text style={PassportGuidanceStyle.title}>Passport Assistance</Text>
                    <Text style={PassportGuidanceStyle.subtitle}>Select the passport service you need.</Text>
                </View>

                <TouchableOpacity 
                    style={PassportGuidanceStyle.selectionCard} 
                    onPress={() => cs.navigate("passportguidancenew")}
                    activeOpacity={0.7}
                >
                    <Text style={PassportGuidanceStyle.selectionTitle}>New Passport</Text>
                    <Text style={PassportGuidanceStyle.selectionDesc}>Apply for a passport for first-time applicants.</Text>
                    {/* 🔥 ADDED: Price exactly like the web */}
                    <Text style={PassportGuidanceStyle.selectionPrice}>₱ 2000</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={PassportGuidanceStyle.selectionCard} 
                    onPress={() => cs.navigate("passportguidancerenew")}
                    activeOpacity={0.7}
                >
                    <Text style={PassportGuidanceStyle.selectionTitle}>Renew Passport</Text>
                    <Text style={PassportGuidanceStyle.selectionDesc}>Renew your existing passport quickly.</Text>
                    {/* 🔥 ADDED: Price exactly like the web */}
                    <Text style={PassportGuidanceStyle.selectionPrice}>₱ 2000</Text>
                </TouchableOpacity>

            </ScrollView>
            <Chatbot />
        </View >
    )
}