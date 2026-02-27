import { View, Text, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native'
import React, { useState } from 'react' // Removed useContext
import { Ionicons } from "@expo/vector-icons"
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import Chatbot from '../components/Chatbot'
// Removed UserContext import
import HomeStyle from '../styles/HomeStyle'

export default function Home() {

    const cs = useNavigation()
    const [isSidebarVisible, setSidebarVisible] = useState(false)

    // Removed getData and currentUser variables that were causing the crash

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })

    const TravelCard = ({ image, location, price, packageName, days }) => (
        <View style={HomeStyle.card}>
            <Image source={image} style={HomeStyle.cardImage} />
            <Text style={HomeStyle.cardTitle}>{packageName}</Text>
            <View style={HomeStyle.infoRow}>
                <Image source={require('../assets/images/date_iconsmall.png')} />
                <Text style={HomeStyle.infoText}>{days}</Text>
            </View>
            <View style={HomeStyle.infoRow}>
                <Image source={require('../assets/images/location_iconsmall.png')} />
                <Text style={HomeStyle.infoText}>{location}</Text>
            </View>
            <Text style={HomeStyle.priceText}>₱{price}</Text>
        </View>
    )

    const BannerCard = ({ image, packageName, subText }) => (
        <View style={HomeStyle.bannerCard}>
            <Image source={image} style={HomeStyle.bannerImage} />
            <View style={HomeStyle.bannerFooter}>
                <Text style={HomeStyle.bannerTitle}>{packageName}</Text>
                <Text style={HomeStyle.bannerSub}>{subText}</Text>
            </View>
            <TouchableOpacity
                style={HomeStyle.viewAllButton}
                onPress={() => {
                    cs.navigate("packages")
                }}
            >
                <Text style={HomeStyle.viewAllText}>View Packages</Text>
                <Image source={require('../assets/images/arrow_righticon.png')} style={HomeStyle.arrowIcon} tintColor={"#fff"} />
            </TouchableOpacity>
        </View>
    )

    if (!fontsLoaded) {
        return null; // Added a check to prevent layout jumps before fonts load
    }

    return (
        <View style={{ flex: 1 }} >
            <Header openSidebar={() => { setSidebarVisible(true) }} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView style={HomeStyle.container}>
                <Text style={HomeStyle.title}>M&RC Travel and Tours</Text>

                <View style={HomeStyle.searchRow}>
                    <View style={HomeStyle.searchBar} >
                        <Ionicons name="search" size={16} />
                        <TextInput
                            style={HomeStyle.searchInput}
                            placeholder='Search packages'
                            placeholderTextColor="#777"
                        />
                    </View>
                    <View style={HomeStyle.dropdownGroup}>
                        <View style={HomeStyle.dropdownButton} >
                            <Text style={HomeStyle.dropdownText} >Activities</Text>
                            <Ionicons
                                name="chevron-down"
                                size={12}
                                color="#305797"
                                style={HomeStyle.dropdownIcon}
                            />
                        </View>
                        <View style={HomeStyle.dropdownButton} >
                            <Text style={HomeStyle.dropdownText} >Duration</Text>
                            <Ionicons
                                name="chevron-down"
                                size={12}
                                color="#305797"
                                style={HomeStyle.dropdownIcon}
                            />
                        </View>
                    </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                    <TravelCard
                        image={require('../assets/images/japan_imagesmall.png')}
                        packageName="Japan Tour Package"
                        location="Japan"
                        price="20000"
                        days=" 3 DAYS"
                    />
                    <TravelCard
                        image={require('../assets/images/boracay_imagesmall.png')}
                        packageName="Boracay Tour Package"
                        location="Boracay"
                        price="12000"
                        days=" 3 DAYS"
                    />
                    <TravelCard
                        image={require('../assets/images/palawan_imagesmall.png')}
                        packageName="Palawan Tour Package"
                        location="Palawan"
                        price="15000"
                        days=" 3 DAYS"
                    />
                </ScrollView>

                <Text style={HomeStyle.title}>Packages For You</Text>
                <BannerCard subText="Enjoy Beach related Activities" packageName="Summer Packages 2026" image={require('../assets/images/southkorea_image.png')} />

                <Text style={HomeStyle.title}>Local Packages</Text>
                <BannerCard subText="Explore the Philippines" packageName="Explore Local Places" image={require('../assets/images/baguio_imagemedium.png')} />
            </ScrollView>

            <Chatbot />
        </View>
    )
}