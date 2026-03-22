import { View, Text, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
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

// --- Tactical Helper: Prefixes the local server IP to your database image paths ---
const getImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1526481280695-3c4699d38b51?auto=format&fit=crop&w=1000&q=80';
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    // Ensure this IP matches the "AXIOS TARGET URL" in your terminal!
    return `http://10.20.66.178:5000/${img.replace(/^\/+/, "")}`;
};

export default function VisaGuidance() {
    const cs = useNavigation()
    const [isSidebarVisible, setSidebarVisible] = useState(false)
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold,
        Roboto_400Regular, Roboto_500Medium, Roboto_700Bold
    })

    useEffect(() => {
        const loadServices = async () => {
            try {
                setLoading(true)
                const { data } = await api.get('/visa-services/services')
                setServices(Array.isArray(data) ? data : [])
            } catch (error) {
                console.log("Visa Fetch Error:", error.message)
                Alert.alert('Unable to load visa services', 'Please check your connection.')
            } finally {
                setLoading(false)
            }
        }
        loadServices()
    }, [])

    if (!fontsLoaded) return null;

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            {/* Changed to ScrollView to match the working Passport Guidance structure */}
            <ScrollView 
                style={VisaGuidanceStyle.container}
                contentContainerStyle={{ paddingBottom: 30 }}
                showsVerticalScrollIndicator={false}
            >
                <Text style={VisaGuidanceStyle.title}>Visa Guidance</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#305797" style={{ marginTop: 50 }} />
                ) : services.length === 0 ? (
                    <Text style={VisaGuidanceStyle.description}>No visa services available right now.</Text>
                ) : (
                    services.map((item) => (
                        <View key={item._id} style={VisaGuidanceStyle.card}>
                            {/* FIXED: Using the getImageUrl helper for dynamic rendering */}
                            <Image 
                                source={{ uri: getImageUrl(item.visaImage) }} 
                                style={VisaGuidanceStyle.cardImage} 
                                resizeMode="cover"
                            />
                            <View style={VisaGuidanceStyle.cardContent}>
                                <Text style={VisaGuidanceStyle.visaTitle}>{item.visaName}</Text>
                                <Text style={VisaGuidanceStyle.description} numberOfLines={3}>
                                    {item.visaDescription}
                                </Text>

                                <TouchableOpacity 
                                    style={VisaGuidanceStyle.applyButton}
                                    onPress={() => cs.navigate("visadetailsguidance", { service: item })}
                                >
                                    <Text style={VisaGuidanceStyle.applyText}>Apply Now</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
            <Chatbot />
        </View>
    )
}