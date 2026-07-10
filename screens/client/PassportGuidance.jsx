import { View, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native'
import React, { useState } from 'react'
import { Image } from 'expo-image'
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Ionicons } from '@expo/vector-icons'

import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import Chatbot from '../../components/Chatbot'
import PassportGuidanceStyle from '../../styles/clientstyles/PassportGuidanceStyle'

import {
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold
} from '@expo-google-fonts/montserrat'

import {
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold
} from '@expo-google-fonts/roboto'

export default function PassportGuidance() {
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })

    const cs = useNavigation()
    const [isSidebarVisible, setSidebarVisible] = useState(false)

    if (!fontsLoaded) return null;

    return (
        <View style={PassportGuidanceStyle.container}>
            <Header openSidebar={() => { setSidebarVisible(true) }} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={PassportGuidanceStyle.scrollContent} showsVerticalScrollIndicator={false}>

                {/*  NEW BANNER ADDED ON TOP */}
                <ImageBackground
                    source={require('../../assets/images/PassportAndVisa_BackgroundImage.png')}
                    style={PassportGuidanceStyle.heroSection}
                    resizeMode="cover"
                >
                    <View style={PassportGuidanceStyle.heroOverlay} />
                    <Text style={PassportGuidanceStyle.heroTitleText}>Need some Assistance?</Text>
                    <Text style={PassportGuidanceStyle.heroSubText}>M&RC Travel and Tours is here to guide you in getting your passport or visa for your upcoming trip!</Text>
                </ImageBackground>

                <View style={PassportGuidanceStyle.headerContainer}>
                    <Text style={PassportGuidanceStyle.title}>Passport Assistance</Text>
                    <Text style={PassportGuidanceStyle.subtitle}>Select the passport service you need.</Text>
                </View>

                <View style={PassportGuidanceStyle.selectionCard}>
                    <View style={PassportGuidanceStyle.selectionIconBox}>
                        <Image
                            source={require('../../assets/images/plus-circle-svgrepo-com.svg')}
                            style={PassportGuidanceStyle.selectionIcon}
                            contentFit="contain"
                        />
                    </View>

                    <View style={PassportGuidanceStyle.selectionBadge}>
                        <Text style={PassportGuidanceStyle.selectionBadgeText}>
                            FIRST-TIME APPLICANT
                        </Text>
                    </View>

                    <Text style={PassportGuidanceStyle.selectionTitle}>
                        New Passport
                    </Text>

                    <Text style={PassportGuidanceStyle.selectionDesc}>
                        Apply for a new passport with complete assistance throughout the
                        application process.
                    </Text>

                    <View style={PassportGuidanceStyle.selectionDivider} />

                    <View style={PassportGuidanceStyle.selectionFooter}>
                        <View style={PassportGuidanceStyle.selectionPriceContainer}>
                            <Text style={PassportGuidanceStyle.selectionPrice}>
                                ₱2,000
                            </Text>

                            <Text style={PassportGuidanceStyle.selectionPriceLabel}>
                                Service fee
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={PassportGuidanceStyle.selectionApplyButton}
                            onPress={() => cs.navigate("passportguidancenew")}
                            activeOpacity={0.85}
                        >
                            <Ionicons
                                name="document-text-outline"
                                size={16}
                                color="#ffffff"
                            />

                            <Text style={PassportGuidanceStyle.selectionApplyButtonText}>
                                APPLY NOW
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* RENEW PASSPORT */}
                <View style={PassportGuidanceStyle.selectionCard}>
                    <View style={PassportGuidanceStyle.selectionIconBox}>
                        <Image
                            source={require('../../assets/images/refresh-f-svgrepo-com.svg')}
                            style={PassportGuidanceStyle.selectionIcon}
                            contentFit="contain"
                        />
                    </View>

                    <View style={PassportGuidanceStyle.selectionBadge}>
                        <Text style={PassportGuidanceStyle.selectionBadgeText}>
                            EXISTING PASSPORT HOLDER
                        </Text>
                    </View>

                    <Text style={PassportGuidanceStyle.selectionTitle}>
                        Renew Passport
                    </Text>

                    <Text style={PassportGuidanceStyle.selectionDesc}>
                        Renew your existing passport with complete assistance throughout
                        the renewal process.
                    </Text>

                    <View style={PassportGuidanceStyle.selectionDivider} />

                    <View style={PassportGuidanceStyle.selectionFooter}>
                        <View style={PassportGuidanceStyle.selectionPriceContainer}>
                            <Text style={PassportGuidanceStyle.selectionPrice}>
                                ₱2,000
                            </Text>

                            <Text style={PassportGuidanceStyle.selectionPriceLabel}>
                                Service fee
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={PassportGuidanceStyle.selectionApplyButton}
                            onPress={() => cs.navigate("passportguidancerenew")}
                            activeOpacity={0.85}
                        >
                            <Ionicons
                                name="document-text-outline"
                                size={16}
                                color="#ffffff"
                            />

                            <Text style={PassportGuidanceStyle.selectionApplyButtonText}>
                                APPLY NOW
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
            <Chatbot />
        </View >
    )
}