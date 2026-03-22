import { View, Text, FlatList, Image, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import Chatbot from '../../components/Chatbot'
import VisaGuidanceStyle from '../../styles/clientstyles/VisaGuidanceStyle'
import { api } from '../../utils/api'

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

    const [services, setServices] = useState([])

    useEffect(() => {
        let mounted = true

        const loadServices = async () => {
            try {
                const { data } = await api.get('/visa-services/services')
                if (mounted) {
                    setServices(Array.isArray(data) ? data : [])
                }
            } catch (error) {
                if (mounted) {
                    Alert.alert('Unable to load visa services', 'Please try again in a moment.')
                }
            }
        }

        loadServices()

        return () => {
            mounted = false
        }
    }, [])

    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => { setSidebarVisible(true) }} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />
            <View style={VisaGuidanceStyle.container}>
                <Text style={VisaGuidanceStyle.title}>Visa Guidance</Text>

                {!services.length && (
                    <Text style={VisaGuidanceStyle.description}>No visa services available right now.</Text>
                )}

                <FlatList
                    data={services}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={VisaGuidanceStyle.card}>
                            <Image source={{ uri: 'https://images.unsplash.com/photo-1526481280695-3c4699d38b51?auto=format&fit=crop&w=1000&q=80' }} style={VisaGuidanceStyle.cardImage} />
                            <View style={VisaGuidanceStyle.cardContent}>
                                <Text style={VisaGuidanceStyle.visaTitle}>{item.visaName}</Text>
                                <Text style={VisaGuidanceStyle.description}>{item.visaDescription}</Text>

                                <TouchableOpacity style={VisaGuidanceStyle.applyButton}
                                    onPress={() => {
                                        cs.navigate("visadetailsguidance", { service: item })
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