import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native'
import Header from '../../components/Header'
import AdminSidebar from '../../components/AdminSidebar'
import QuotationManagementStyle from '../../styles/adminstyles/QuotationManagementStyle'

export default function QuotationManagement() {

    const cs = useNavigation()
    const [isSidebarVisible, setSidebarVisible] = useState(false)

    const [getQuotes] = useState([
        {
            id: "1",
            quoteNo: "QT-0001",
            username: "Juan Dela Cruz",
            package: "Boracay Tour",
            travelers: 4,
            date: "09-20-2026",
            status: "Pending"
        }
    ])

    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <AdminSidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView
                contentContainerStyle={QuotationManagementStyle.container}
                showsVerticalScrollIndicator={false}
            >
                <Text style={QuotationManagementStyle.title}>Quotation Management</Text>

                <View style={QuotationManagementStyle.statsContainer}>
                    <View style={QuotationManagementStyle.statsRow}>
                        <View style={QuotationManagementStyle.card}>
                            <View style={QuotationManagementStyle.valueRow}>
                                <Text style={QuotationManagementStyle.cardValue}>18</Text>
                            </View>
                            <Text style={QuotationManagementStyle.cardLabel}>Total Quotations</Text>
                        </View>
                        <View style={QuotationManagementStyle.card}>
                            <View style={QuotationManagementStyle.valueRow}>
                                <Text style={QuotationManagementStyle.cardValue}>6</Text>
                            </View>
                            <Text style={QuotationManagementStyle.cardLabel}>Pending Requests</Text>
                        </View>
                    </View>
                </View>

                <View style={QuotationManagementStyle.searchRow}>
                    <View style={QuotationManagementStyle.searchBar}>
                        <Ionicons name="search" size={16} />
                        <TextInput
                            style={QuotationManagementStyle.searchInput}
                            placeholder='Search quotation'
                            placeholderTextColor="#777"
                        />
                    </View>

                    <View style={QuotationManagementStyle.dropdownGroup}>
                        <View style={QuotationManagementStyle.dropdownButton}>
                            <Text style={QuotationManagementStyle.dropdownText}>Status</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" />
                        </View>
                        <View style={QuotationManagementStyle.dropdownButton}>
                            <Text style={QuotationManagementStyle.dropdownText}>Date</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" />
                        </View>
                    </View>
                </View>

                {getQuotes.map((item) => (
                    <View key={item.id} style={QuotationManagementStyle.quoteCard}>
                        <View style={QuotationManagementStyle.cardHeader}>
                            <Text style={QuotationManagementStyle.quoteRef}>{item.quoteNo}</Text>
                            <Text
                                style={[
                                    QuotationManagementStyle.quoteStatus,
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

                        <View style={QuotationManagementStyle.cardBody}>
                            <Text style={QuotationManagementStyle.packageName}>{item.package}</Text>

                            <View style={QuotationManagementStyle.detailRow}>
                                <Text style={QuotationManagementStyle.detailLabel}>User:</Text>
                                <Text style={QuotationManagementStyle.detailValue}>{item.username}</Text>
                            </View>

                            <View style={QuotationManagementStyle.detailRow}>
                                <Text style={QuotationManagementStyle.detailLabel}>Travelers:</Text>
                                <Text style={QuotationManagementStyle.detailValue}>{item.travelers}</Text>
                            </View>

                            <View style={QuotationManagementStyle.detailRow}>
                                <Text style={QuotationManagementStyle.detailLabel}>Travel Date:</Text>
                                <Text style={QuotationManagementStyle.detailValue}>{item.date}</Text>
                            </View>
                        </View>

                        <View style={QuotationManagementStyle.actionRow}>
                            <TouchableOpacity
                                style={QuotationManagementStyle.viewButton}
                                onPress={() => cs.navigate("quotationdetails")}
                            >
                                <Text style={QuotationManagementStyle.buttonText}>View</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={QuotationManagementStyle.approveButton}
                                onPress={() => { }}
                            >
                                <Text style={QuotationManagementStyle.buttonText}>Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={QuotationManagementStyle.rejectButton}
                                onPress={() => { }}
                            >
                                <Text style={QuotationManagementStyle.buttonText}>Reject</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    )
}
