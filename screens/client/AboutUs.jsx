import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';

import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import AboutUsStyle from '../../styles/clientstyles/AboutUsStyle';

export default function AboutUs() {
    const [isSidebarVisible, setSidebarVisible] = useState(false);

    //fonts
    const [fontsLoaded] = useFonts({
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium
    });


    //links
    const facebookLink = 'https://www.facebook.com/mrctravelandtour';
    const instagramLink = 'https://www.instagram.com/mrc_travelandtours?fbclid=IwY2xjawQVIU5leHRuA2FlbQIxMABicmlkETE1M0YwaFZ6SW1EQ0xTZnNrc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHgrnAZz5frwKYlnHCi-Txow7AV3kwbYXwWp0W7XV-_BZcoANgGr7hUQA3Eq6_aem_VyUBdOcsD0LsgGhYaEtNog';

    const openLink = (url) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    if (!fontsLoaded) return null;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={AboutUsStyle.container}>

                <View style={AboutUsStyle.section}>
                    <Text style={AboutUsStyle.mainTitle}>About Us</Text>
                    <Text style={AboutUsStyle.paragraph}>
                        M&RC Travel and Tours is a dedicated travel company committed to turning your dream vacations into unforgettable experiences. We specialize in carefully curated travel packages that combine convenience, value, and adventure—whether you’re planning a relaxing getaway, a family holiday, a romantic escape, or a group tour. Our team is passionate about travel and focused on delivering personalized service from start to finish. From flights and accommodations to guided tours and activities, we handle every detail so you can travel with confidence and peace of mind. We partner with trusted airlines, hotels, and local operators to ensure quality, safety, and memorable journeys for every client.
                    </Text>
                    <Text style={AboutUsStyle.paragraph}>
                        At M&RC Travel and Tours, we believe that travel should be easy, enjoyable, and accessible to everyone. Our mission is to help you explore new destinations, create lasting memories, and experience the world without the stress of planning.
                    </Text>
                    <Text style={AboutUsStyle.paragraph}>
                        Let us take you there — your journey begins with M&RC Travel and Tours.
                    </Text>
                </View>

                <View style={AboutUsStyle.rowSection}>
                    <View style={AboutUsStyle.card}>
                        <Text style={AboutUsStyle.subTitle}>Our Vision</Text>
                        <Text style={AboutUsStyle.paragraphSmall}>
                            To be the leading travel company that inspires and enables people to explore the world with confidence, comfort, and joy.
                        </Text>
                    </View>
                    <View style={AboutUsStyle.card}>
                        <Text style={AboutUsStyle.subTitle}>Our Mission</Text>
                        <Text style={AboutUsStyle.paragraphSmall}>
                            To provide exceptional travel experiences through personalized service, quality partnerships, and a commitment to making travel easy and enjoyable for everyone.
                        </Text>
                    </View>
                </View>

                <View style={AboutUsStyle.divider} />

                {/* 🔥 NEW ACCREDITATIONS SECTION 🔥 */}
                <View style={AboutUsStyle.infoSection}>
                    <Text style={[AboutUsStyle.mainTitle, { textAlign: 'center', marginBottom: 20 }]}>Accreditations</Text>

                    <View style={{ alignItems: 'center', marginBottom: 30 }}>
                        {/* PhilGEPS Logo */}
                        <Image
                            source={require('../../assets/images/philgeps.png')}
                            style={{ width: 120, height: 120, resizeMode: 'contain' }}
                        />

                        <Text style={[AboutUsStyle.paragraph, { textAlign: 'center', marginTop: 15 }]}>
                            M&RC Travel and Tours is accredited by the Philippine Government Electronic Procurement System (PhilGEPS), ensuring that we meet the highest standards of quality, reliability, and professionalism in providing travel services. Our accreditation reflects our commitment to excellence and our dedication to delivering exceptional travel experiences to our customers.
                        </Text>
                    </View>

                    <View style={{ alignItems: 'center', marginBottom: 20 }}>
                        {/* DOT Logo */}
                        <Image
                            source={require('../../assets/images/dot.png')}
                            style={{ width: 120, height: 120, resizeMode: 'contain' }}
                        />

                        <Text style={[AboutUsStyle.paragraph, { textAlign: 'center', marginTop: 15 }]}>
                            M&RC Travel and Tours is accredited by the Department of Tourism (DOT) of the Philippines, ensuring that we meet the highest standards of quality, safety, and customer service in the travel industry. Our accreditation reflects our commitment to providing exceptional travel experiences and our dedication to upholding the integrity and professionalism of our services.
                        </Text>
                    </View>
                </View>

                <View style={AboutUsStyle.divider} />

                <View style={AboutUsStyle.infoSection}>
                    <Text style={AboutUsStyle.subTitle}>Our Address</Text>
                    <Text style={AboutUsStyle.paragraph}>
                        2nd Floor #1 Cor Fatima street, San Antonio Avenue Valley 1 , Brgy. San Antonio, Parañaque, Philippines, 1715
                    </Text>

                    <Text style={[AboutUsStyle.subTitle, { marginTop: 20 }]}>Our Hours</Text>
                    <Text style={AboutUsStyle.paragraph}>
                        Monday - Saturday: 9:00 AM - 6:00 PM
                    </Text>

                    <Text style={[AboutUsStyle.subTitle, { marginTop: 20 }]}>Our Socials</Text>

                    <TouchableOpacity style={AboutUsStyle.socialBtn} onPress={() => openLink(facebookLink)}>
                        <Ionicons name="logo-facebook" size={24} color="#305797" />
                        <Text style={AboutUsStyle.socialText}>M&RC Travel and Tours</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={AboutUsStyle.socialBtn} onPress={() => openLink(instagramLink)}>
                        <Ionicons name="logo-instagram" size={24} color="#305797" />
                        <Text style={AboutUsStyle.socialText}>@mrc_travel_tours</Text>
                    </TouchableOpacity>
                </View>

                <View style={AboutUsStyle.footer}>
                    <Text style={AboutUsStyle.footerText}>© 2026 M&RC Travel and Tours. All rights reserved.</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}