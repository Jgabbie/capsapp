import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native'
import Header from '../../components/Header'
import VisaApplicationsStyle from '../../styles/adminstyles/VisaApplicationsStyle'


export default function VisaApplications() {

    const [isSidebarVisible, setSidebarVisible] = useState(false)
    const cs = useNavigation()

    const [getApplications, setApplications] = useState([
        { id: "1", ref: "VA-0001", username: "jlanuza", service: "Japan Visa", status: "Pending", date: "09-14-2026", },
        { id: "2", ref: "VA-0002", username: "jnssnba", service: "Korea Visa", status: "Pending", date: "09-20-2026", },
        { id: "3", ref: "VA-0003", username: "marionbt", service: "Japan Visa", status: "Pending", date: "10-17-2026", },
        { id: "4", ref: "VA-0004", username: "tayshns", service: "Japan Visa", status: "Pending", date: "10-18-2026", },
        { id: "5", ref: "VA-0005", username: "jlanuza", service: "Korea Visa", status: "Pending", date: "10-19-2026", },
    ])
    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => setSidebarVisible(true)} />

            <ScrollView contentContainerStyle={VisaApplicationsStyle.container} showsVerticalScrollIndicator={false}>
                <Text style={VisaApplicationsStyle.header}>Visa Applications</Text>

                <View style={VisaApplicationsStyle.statsContainer}>
                    <View style={VisaApplicationsStyle.statsRow}>
                        <View style={VisaApplicationsStyle.card}>
                            <Text style={VisaApplicationsStyle.cardValue}>24</Text>
                            <Text style={VisaApplicationsStyle.cardLabel}>Applications</Text>
                        </View>

                        <View style={VisaApplicationsStyle.card}>
                            <Text style={VisaApplicationsStyle.cardValue}>3</Text>
                            <Text style={VisaApplicationsStyle.cardLabel}>Pending</Text>
                        </View>
                    </View>
                    <View style={VisaApplicationsStyle.statsRow}>
                        <View style={VisaApplicationsStyle.card}>
                            <Text style={VisaApplicationsStyle.cardValue}>19</Text>
                            <Text style={VisaApplicationsStyle.cardLabel}>Completed</Text>
                        </View>
                        <View style={VisaApplicationsStyle.card}>
                            <Text style={VisaApplicationsStyle.cardValue}>2</Text>
                            <Text style={VisaApplicationsStyle.cardLabel}>Processing</Text>
                        </View>
                    </View>
                </View>

                <View style={VisaApplicationsStyle.searchRow}>
                    <View style={VisaApplicationsStyle.searchBar}>
                        <Ionicons name="search" size={16} />
                        <TextInput
                            style={VisaApplicationsStyle.searchInput}
                            placeholder='Search application reference'
                            placeholderTextColor="#777"
                        />
                    </View>

                    <View style={VisaApplicationsStyle.dropdownGroup}>
                        <View style={VisaApplicationsStyle.dropdownButton}>
                            <Text style={VisaApplicationsStyle.dropdownText}>Status</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" style={VisaApplicationsStyle.dropdownIcon} />
                        </View>
                        <View style={VisaApplicationsStyle.dropdownButton}>
                            <Text style={VisaApplicationsStyle.dropdownText}>Date</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" style={VisaApplicationsStyle.dropdownIcon} />
                        </View>
                    </View>
                </View>

                {getApplications.map((item) => (
                    <View key={item.id} style={VisaApplicationsStyle.userCard}>
                        <View style={VisaApplicationsStyle.cardHeader}>
                            <Text style={VisaApplicationsStyle.userName}>{item.username}</Text>
                            <Text style={{ color: item.status === 'Pending' ? '#E74C3C' : '#1F4E95' }}>{item.status}</Text>
                        </View>

                        <View style={VisaApplicationsStyle.cardBody}>
                            <Text style={VisaApplicationsStyle.userDetail}>Ref: {item.ref}</Text>
                            <Text style={VisaApplicationsStyle.userDetail}>Service: {item.service}</Text>
                            <Text style={VisaApplicationsStyle.userDetail}>Date: {item.date}</Text>
                        </View>

                        <View style={VisaApplicationsStyle.cardActions}>
                            <TouchableOpacity style={VisaApplicationsStyle.editButton} onPress={() => cs.navigate("passportapplicationview")}>
                                <Text style={VisaApplicationsStyle.editText}>View</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    )
}