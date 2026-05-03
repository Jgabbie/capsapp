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

    // 🔥 UPDATED: Map Search Query vs Display Text 🔥
    const openMaps = () => {
        // This is the exact string Google Maps needs to find the pin
        const mapQuery = "Valley 1, M&RC TRAVEL AND TOURS, Finasia Homes, 1 Cor Fatima Street, San Antonio Ave, Parañaque, Metro Manila";
        // Formatted the URL correctly to trigger a map search
        const url = `https://maps.google.com/?q=${encodeURIComponent(mapQuery)}`;
        Linking.openURL(url).catch(err => console.error("Couldn't open Google Maps", err));
    };

    if (!fontsLoaded) return null;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={AboutUsStyle.container}>

                <View style={AboutUsStyle.section}>
                    <View style={[AboutUsStyle.card, AboutUsStyle.fullBleedCard]}>
                        <Text style={AboutUsStyle.mainTitleWhite}>About Us</Text>
                        
                        <Text style={AboutUsStyle.paragraphWhite}>
                            M&RC Travel and Tours humbly started travel business in July 2018 when two vibrant entrepreneur, traveler, Maricar Carle and Rhon Carle decided to turn their passion into business. Office is located at #1 Cor Fatima Street San antonio Avenue Valley 1, Brgy. San Antonio Paranaque City with over thousand of agents worldwide and travel partners.
                        </Text>
                        <Text style={AboutUsStyle.paragraphWhite}>
                            We commit to adapt the changing needs of business sectors and become a major player through satisfying specialized requirements of the small, medium and large organizations.
                        </Text>
                        <Text style={AboutUsStyle.paragraphWhite}>
                            We value honesty and integrity. M&RC Travel and Tours continuously develop other line of services with the primary objective of extending wide range of quality and excellent service.
                        </Text>

                        <Image 
                            source={require('../../assets/images/Homepage1.png')} 
                            style={AboutUsStyle.fullBleedImage} 
                        />
                    </View>
                </View>

                    <View style={AboutUsStyle.rowSection}>
                    <View style={[AboutUsStyle.card, AboutUsStyle.fullBleedCard]}>
                        <Text style={AboutUsStyle.subTitleWhite}>Our Vision</Text>
                        <Text style={AboutUsStyle.paragraphWhite}>
                            Our Vision is to be the preferred travel and tours agency in the country offering specialized, high quality and cost- efficient travel solutions at all times, anywhere, everywhere.
                        </Text>

                        <View style={AboutUsStyle.whiteSeparator} />

                        <Text style={AboutUsStyle.subTitleWhite}>Our Mission</Text>
                        <Text style={AboutUsStyle.paragraphWhite}>
                            We are committed to provide value-added travel solutions to our Customers by offering good service and meaningful experience through the help of our reliable and service- oriented travel partners. We aim to grow and profit with the knowledge that each customer we served is fully satisfied. We adhere to the notion of reliability, competence, competitiveness and integrity. We are committed to be updated with the latest technology to keep up with the demands of the global market. We care for the well-being of our employees, our community and our environment.
                        </Text>

                        <Image 
                            source={require('../../assets/images/Homepage2.png')} 
                            style={AboutUsStyle.fullBleedImageLarge} 
                        />
                    </View>
                </View>

                <View style={[AboutUsStyle.card, AboutUsStyle.section]}>
                    <Text style={[AboutUsStyle.mainTitle, { textAlign: 'center', marginBottom: 20 }]}> 
                        <Text style={[AboutUsStyle.mainTitle, { color: '#000' }]}>WHY </Text>
                        <Text style={[AboutUsStyle.mainTitle, { color: '#305797' }]}>BOOK </Text>
                        <Text style={[AboutUsStyle.mainTitle, { color: '#000' }]}>WITH US?</Text>
                    </Text>

                    <View style={{ alignItems: 'center', marginBottom: 30 }}>
                        <Image
                            source={require('../../assets/images/philgeps.png')}
                            style={{ width: 120, height: 120, resizeMode: 'contain' }}
                        />
                        <Text style={[AboutUsStyle.paragraph, { textAlign: 'center', marginTop: 15 }]}>
                            M&RC Travel and Tours is accredited by the Philippine Government Electronic Procurement System (PhilGEPS), ensuring that we meet the highest standards of quality, reliability, and professionalism in providing travel services. Our accreditation reflects our commitment to excellence and our dedication to delivering exceptional travel experiences to our customers.
                        </Text>
                    </View>

                    <View style={{ alignItems: 'center', marginBottom: 20 }}>
                        <Image
                            source={require('../../assets/images/dot.png')}
                            style={{ width: 120, height: 120, resizeMode: 'contain' }}
                        />
                        <Text style={[AboutUsStyle.paragraph, { textAlign: 'center', marginTop: 15 }]}>
                            M&RC Travel and Tours is accredited by the Department of Tourism (DOT) of the Philippines, ensuring that we meet the highest standards of quality, safety, and customer service in the travel industry. Our accreditation reflects our commitment to providing exceptional travel experiences and our dedication to upholding the integrity and professionalism of our services.
                        </Text>
                    </View>
                </View>

                {/* 🔥 CLICKABLE ADDRESS CARD 🔥 */}
                <TouchableOpacity style={AboutUsStyle.card} onPress={openMaps} activeOpacity={0.7}>
                    <Text style={AboutUsStyle.subTitle}>Our Address</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 5 }}>
                        <Ionicons name="location-outline" size={22} color="#305797" style={{ marginRight: 8, marginTop: -2 }} />
                        {/* Notice how the text displayed to the user remains exactly the same! */}
                        <Text style={[AboutUsStyle.paragraph, { flex: 1, color: '#305797', textDecorationLine: 'underline' }]}>
                            2nd Floor #1 Cor Fatima street, San Antonio Avenue Valley 1 , Brgy. San Antonio, Parañaque, Philippines, 1715
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={[AboutUsStyle.card, AboutUsStyle.section, { marginTop: 15 }]}>
                    <Text style={AboutUsStyle.subTitle}>Our Hours</Text>
                    <Text style={AboutUsStyle.paragraph}>
                        Monday - Saturday: 9:00 AM - 6:00 PM
                    </Text>
                </View>

                <View style={[AboutUsStyle.card, AboutUsStyle.section, { marginTop: 15 }]}>
                    <Text style={AboutUsStyle.subTitle}>Our Socials</Text>

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