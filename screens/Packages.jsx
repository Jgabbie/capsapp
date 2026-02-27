import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DestinationStyles from "../styles/DestinationStyles";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Chatbot from "../components/Chatbot";

const packages = [
    {
        id: "1",
        title: "Baguio City Tour",
        description: "Explore the city of pines with scenic viewpoints, heritage stops, and cool mountain air.",
        image: "https://res.klook.com/image/upload/fl_lossy.progressive,q_60/Mobile/City/dqm8q1e6jyqaxapkgqy3.jpg",
        price: "₱67,000",
        duration: "3 Days",
        isInternational: false,
    },
    {
        id: "2",
        title: "Seoul City Escape",
        description: "Experience vibrant markets, modern culture, and historic palaces in South Korea.",
        image: "https://ik.imgkit.net/3vlqs5axxjf/external/http://images.ntmllc.com/v4/destination/South-Korea/Seoul/219740_SCN_Seoul_iStock521707831_ZC35CD.jpg?tr=w-1200%2Cfo-auto",
        price: "₱95,000",
        duration: "5 Days",
        isInternational: true,
    },
    {
        id: "3",
        title: "Palawan Island Adventure",
        description: "Crystal-clear lagoons, island hopping, and beachside relaxation.",
        image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/e7/b0/ea/photo0jpg.jpg?w=1400&h=1400&s=1",
        price: "₱82,000",
        duration: "4 Days",
        isInternational: false,
    },
]

export default function Packages({ navigation }) {

    const [isSidebarVisible, setSidebarVisible] = useState(false)

    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => { setSidebarVisible(true) }} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView
                style={DestinationStyles.container}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <Text style={DestinationStyles.heroTitle}>Featured packages</Text>
                <Text style={DestinationStyles.heroSubtitle}>
                    Everyone loves to tour with friends, family, or teammates. We can
                    organize your tour to anywhere in the world.
                </Text>

                <View style={DestinationStyles.searchRow}>
                    <View style={DestinationStyles.searchBar}>
                        <Ionicons name="search" size={16} color="#777" />
                        <TextInput
                            style={DestinationStyles.searchInput}
                            placeholder="Search packages"
                            placeholderTextColor="#777"
                        />
                    </View>
                    <View style={DestinationStyles.dropdownGroup}>
                        <View style={DestinationStyles.dropdownButton}>
                            <Text style={DestinationStyles.dropdownText}>Activities</Text>
                            <Ionicons name="chevron-down" size={14} color="#305797" style={DestinationStyles.dropdownIcon} />
                        </View>
                        <View style={DestinationStyles.dropdownButton}>
                            <Text style={DestinationStyles.dropdownText}>Duration</Text>
                            <Ionicons name="chevron-down" size={14} color="#305797" style={DestinationStyles.dropdownIcon} />
                        </View>
                    </View>
                </View>

                {packages.map((item) => (
                    <View key={item.id} style={DestinationStyles.packageCard}>
                        <Image source={{ uri: item.image }} style={DestinationStyles.packageImage} />
                        <View style={DestinationStyles.packageContent}>
                            <Text style={DestinationStyles.packageTitle}>{item.title}</Text>
                            <Text style={DestinationStyles.packageDescription}>{item.description}</Text>
                            <TouchableOpacity
                                style={DestinationStyles.viewDetailsButton}
                                onPress={() => navigation.navigate("package-details", { pkg: item })}
                            >
                                <Text style={DestinationStyles.viewDetailsText}>View Details</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={DestinationStyles.packageMetaRow}>
                            <View style={DestinationStyles.metaItem}>
                                <Ionicons name="location" size={14} color="#2d5fb8" />
                                <Text style={DestinationStyles.metaText}>Destination</Text>
                            </View>
                            <View style={DestinationStyles.metaItem}>
                                <Ionicons name="time" size={14} color="#2d5fb8" />
                                <Text style={DestinationStyles.metaText}>{item.duration}</Text>
                            </View>
                        </View>
                    </View>
                ))}

            </ScrollView>
            <Chatbot />
        </View >

    );
}