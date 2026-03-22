import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import UserQuotationStyle from '../../styles/clientstyles/UserQuotationStyle'

export default function UserQuotations() {

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

    const [getQuotes] = useState([
        {
            id: "1",
            quoteNo: "QT-0001",
            package: "Boracay Tour",
            travelers: 4,
            date: "09-20-2026",
            status: "Pending"
        }
    ])

    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => setSidebarVisible(true)} />

            <ScrollView
                contentContainerStyle={UserQuotationStyle.container}
                showsVerticalScrollIndicator={false}
            >
                <Text style={UserQuotationStyle.title}>My Quotations</Text>

                <View style={UserQuotationStyle.searchRow}>
                    <View style={UserQuotationStyle.searchBar}>
                        <Ionicons name="search" size={16} />
                        <TextInput
                            style={UserQuotationStyle.searchInput}
                            placeholder='Search quotation'
                            placeholderTextColor="#777"
                        />
                    </View>

                    <View style={UserQuotationStyle.dropdownGroup}>
                        <View style={UserQuotationStyle.dropdownButton}>
                            <Text style={UserQuotationStyle.dropdownText}>Status</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" />
                        </View>
                        <View style={UserQuotationStyle.dropdownButton}>
                            <Text style={UserQuotationStyle.dropdownText}>Date</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" />
                        </View>
                    </View>
                </View>

                {getQuotes.map((item) => (
                    <View key={item.id} style={UserQuotationStyle.quoteCard}>
                        <View style={UserQuotationStyle.cardHeader}>
                            <Text style={UserQuotationStyle.quoteRef}>{item.quoteNo}</Text>
                            <Text
                                style={[
                                    UserQuotationStyle.quoteStatus,
                                    item.status === "Approved"
                                        ? { color: "#2ecc71" }
                                        : item.status === "Rejected"
                                            ? { color: "#e74c3c" }
                                            : { color: "#f1c40f" }
                                ]}
                            >
                                {item.status}
                            </Text>
                        </View>

                        <View style={UserQuotationStyle.cardBody}>
                            <Text style={UserQuotationStyle.packageName}>{item.package}</Text>

                            <View style={UserQuotationStyle.detailRow}>
                                <Text style={UserQuotationStyle.detailLabel}>Travelers:</Text>
                                <Text style={UserQuotationStyle.detailValue}>{item.travelers}</Text>
                            </View>

                            <View style={UserQuotationStyle.detailRow}>
                                <Text style={UserQuotationStyle.detailLabel}>Travel Date:</Text>
                                <Text style={UserQuotationStyle.detailValue}>{item.date}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={UserQuotationStyle.viewButton}
                            onPress={() => cs.navigate("quotationdetails")}
                        >
                            <Text style={UserQuotationStyle.buttonText}>View Details</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>

    )
}
