import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native'
import Header from '../../components/Header'
import PassportApplicationsStyle from '../../styles/adminstyles/PassportApplicationStyle'

export default function PassportApplications() {
    const cs = useNavigation()
    const [isSidebarVisible, setSidebarVisible] = useState(false)

    const [getApplications, setApplications] = useState([
        { id: "1", ref: "PA-0001", username: "jlanuza", service: "Re-new Passport", status: "Pending", date: "09-14-2026", },
        { id: "2", ref: "PA-0002", username: "jnssnba", service: "Passport", status: "Pending", date: "09-18-2026", },
        { id: "3", ref: "PA-0003", username: "marionbt", service: "Passport", status: "Pending", date: "09-17-2026", },
        { id: "4", ref: "PA-0004", username: "tayshns", service: "Re-new Passport", status: "Pending", date: "10-20-2026", },
        { id: "5", ref: "PA-0005", username: "jlanuza", service: "Re-new Passport", status: "Pending", date: "10-21-2026", },
    ])

    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => setSidebarVisible(true)} />

            <ScrollView contentContainerStyle={PassportApplicationsStyle.container} showsVerticalScrollIndicator={false}>
                <Text style={PassportApplicationsStyle.header}>Passport Applications</Text>

                {/* Stats Cards */}
                <View style={PassportApplicationsStyle.statsContainer}>
                    <View style={PassportApplicationsStyle.statsRow}>
                        <View style={PassportApplicationsStyle.card}>
                            <Text style={PassportApplicationsStyle.cardValue}>24</Text>
                            <Text style={PassportApplicationsStyle.cardLabel}>Applications</Text>
                        </View>

                        <View style={PassportApplicationsStyle.card}>
                            <Text style={PassportApplicationsStyle.cardValue}>3</Text>
                            <Text style={PassportApplicationsStyle.cardLabel}>Pending</Text>
                        </View>
                    </View>
                    <View style={PassportApplicationsStyle.statsRow}>
                        <View style={PassportApplicationsStyle.card}>
                            <Text style={PassportApplicationsStyle.cardValue}>19</Text>
                            <Text style={PassportApplicationsStyle.cardLabel}>Completed</Text>
                        </View>
                        <View style={PassportApplicationsStyle.card}>
                            <Text style={PassportApplicationsStyle.cardValue}>2</Text>
                            <Text style={PassportApplicationsStyle.cardLabel}>Processing</Text>
                        </View>
                    </View>
                </View>

                {/* Search & Filters */}
                <View style={PassportApplicationsStyle.searchRow}>
                    <View style={PassportApplicationsStyle.searchBar}>
                        <Ionicons name="search" size={16} />
                        <TextInput
                            style={PassportApplicationsStyle.searchInput}
                            placeholder='Search application reference'
                            placeholderTextColor="#777"
                        />
                    </View>

                    <View style={PassportApplicationsStyle.dropdownGroup}>
                        <View style={PassportApplicationsStyle.dropdownButton}>
                            <Text style={PassportApplicationsStyle.dropdownText}>Status</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" style={PassportApplicationsStyle.dropdownIcon} />
                        </View>
                        <View style={PassportApplicationsStyle.dropdownButton}>
                            <Text style={PassportApplicationsStyle.dropdownText}>Date</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" style={PassportApplicationsStyle.dropdownIcon} />
                        </View>
                    </View>
                </View>

                {/* Application Cards */}
                {getApplications.map((item) => (
                    <View key={item.id} style={PassportApplicationsStyle.userCard}>
                        <View style={PassportApplicationsStyle.cardHeader}>
                            <Text style={PassportApplicationsStyle.userName}>{item.username}</Text>
                            <Text style={{ color: item.status === 'Pending' ? '#E74C3C' : '#1F4E95' }}>{item.status}</Text>
                        </View>

                        <View style={PassportApplicationsStyle.cardBody}>
                            <Text style={PassportApplicationsStyle.userDetail}>Ref: {item.ref}</Text>
                            <Text style={PassportApplicationsStyle.userDetail}>Service: {item.service}</Text>
                            <Text style={PassportApplicationsStyle.userDetail}>Date: {item.date}</Text>
                        </View>

                        <View style={PassportApplicationsStyle.cardActions}>
                            <TouchableOpacity style={PassportApplicationsStyle.editButton} onPress={() => cs.navigate("passportapplicationview")}>
                                <Text style={PassportApplicationsStyle.editText}>View</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    )
}