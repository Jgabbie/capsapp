import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import Chatbot from '../../components/Chatbot'
import VisaGuidanceStyle from '../../styles/clientstyles/VisaGuidanceStyle'

export default function VisaGuidance() {

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

    const [packages, setBookings] = useState([
        { id: "1", image: require('../../assets/images/kyotojapan.jpg'), visaName: "Japan VISA", description: "Acquiring this VISA will allow you to travel and visit Japan" },
    ])

    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => { setSidebarVisible(true) }} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />
            <View style={VisaGuidanceStyle.container}>
                <Text style={VisaGuidanceStyle.title}>Visa Guidance</Text>

                <FlatList
                    data={packages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={VisaGuidanceStyle.card}>
                            <Image source={item.image} style={VisaGuidanceStyle.cardImage} />
                            <View style={VisaGuidanceStyle.cardContent}>
                                <Text style={VisaGuidanceStyle.visaTitle}>{item.visaName}</Text>
                                <Text style={VisaGuidanceStyle.description}>{item.description}</Text>

                                <TouchableOpacity style={VisaGuidanceStyle.applyButton}
                                    onPress={() => {
                                        cs.navigate("visadetailsguidance")
                                    }}
                                >
                                    <Text style={VisaGuidanceStyle.applyText}>Apply</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </View>
            <Chatbot />
        </View>
    )
}