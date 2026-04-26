import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import { Ionicons } from '@expo/vector-icons'

import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import Chatbot from '../../components/Chatbot'
import VisaGuidanceStyle from '../../styles/clientstyles/VisaGuidanceStyle'
import { api } from '../../utils/api'

export default function VisaGuidance() {
    const cs = useNavigation()
    const [isSidebarVisible, setSidebarVisible] = useState(false)
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold,
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
                Alert.alert('Error', 'Unable to load visa services. Please check your connection.')
            } finally {
                setLoading(false)
            }
        }
        loadServices()
    }, [])

    const filteredServices = useMemo(() => {
        if (!searchQuery) return services;
        return services.filter(service => 
            service.visaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.visaDescription.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [services, searchQuery]);

    if (!fontsLoaded) return null;

    return (
        <View style={VisaGuidanceStyle.container}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView 
                contentContainerStyle={VisaGuidanceStyle.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={VisaGuidanceStyle.headerContainer}>
                    <Text style={VisaGuidanceStyle.title}>Visa Services</Text>
                    <Text style={VisaGuidanceStyle.subtitle}>Search and filter the visa you need to apply.</Text>
                </View>

                <View style={VisaGuidanceStyle.searchContainer}>
                    <Ionicons name="search" size={20} color="#9ca3af" />
                    <TextInput
                        style={VisaGuidanceStyle.searchInput}
                        placeholder="Search visa"
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color="#9ca3af" />
                        </TouchableOpacity>
                    )}
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#305797" style={{ marginTop: 50 }} />
                ) : filteredServices.length === 0 ? (
                    <Text style={VisaGuidanceStyle.emptyText}>No visa services found.</Text>
                ) : (
                    filteredServices.map((item, index) => (
                        <View key={item.visaItem || item._id || index} style={VisaGuidanceStyle.card}>
                            <View style={VisaGuidanceStyle.cardContent}>
                                <Text style={VisaGuidanceStyle.visaTitle}>{item.visaName}</Text>
                                <Text style={VisaGuidanceStyle.description} numberOfLines={2}>
                                    {item.visaDescription}
                                </Text>
                                <Text style={VisaGuidanceStyle.price}>₱ {item.visaPrice}</Text>
                            </View>

                            <TouchableOpacity 
                                style={VisaGuidanceStyle.applyButton}
                                onPress={() => cs.navigate("visadetailsguidance", { service: item })}
                            >
                                <Text style={VisaGuidanceStyle.applyText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>
            <Chatbot />
        </View>
    )
}