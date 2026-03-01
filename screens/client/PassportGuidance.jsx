import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import Chatbot from '../../components/Chatbot'
import PassportGuidanceStyle from '../../styles/clientstyles/PassportGuidanceStyle'



export default function PassportGuidance() {

    const cs = useNavigation()
    const [isSidebarVisible, setSidebarVisible] = useState(false)

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
            <Header openSidebar={() => { setSidebarVisible(true) }} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />
            <ScrollView style={PassportGuidanceStyle.container}>
                <Text style={PassportGuidanceStyle.title}>Passport Guidance</Text>

                <View style={PassportGuidanceStyle.card}>
                    <Image style={PassportGuidanceStyle.cardImage} source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVTvZoj5yCan1iuNFZkIiiLQQLn7UoihXfFg&s" }} />
                    <View style={PassportGuidanceStyle.cardContent}>
                        <Text style={PassportGuidanceStyle.passportTitle}>New Passport</Text>
                        <Text style={PassportGuidanceStyle.description}>Don't have a passport for travelling overseas?
                            Check the requirements here and the processes on how to acquire a passport
                            With this you can travel around the world!
                        </Text>
                        <TouchableOpacity style={PassportGuidanceStyle.applyButton}
                            onPress={() => {
                                cs.navigate("passportnewguidance")
                            }}
                        >
                            <Text style={PassportGuidanceStyle.applyText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={PassportGuidanceStyle.card}>
                    <Image style={PassportGuidanceStyle.cardImage} source={{ uri: "https://ik.imagekit.io/tvlk/blog/2022/05/philippine-passport.jpg" }} />
                    <View style={PassportGuidanceStyle.cardContent}>
                        <Text style={PassportGuidanceStyle.passportTitle}>Re-New Passport</Text>
                        <Text style={PassportGuidanceStyle.description}>Is your passport about to expire and you have an upcoming international trip?
                            Apply here and check the requirements and the processes on how to re-new your passport
                            With this you can continue on your international trip and the upcoming ones!
                        </Text>
                        <TouchableOpacity style={PassportGuidanceStyle.applyButton}
                            onPress={() => {
                                cs.navigate("passportrenewguidance")
                            }}
                        >
                            <Text style={PassportGuidanceStyle.applyText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <Chatbot />
        </View >
    )
}