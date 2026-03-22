import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal, Platform } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native'
import DateTimePicker from '@react-native-community/datetimepicker'

import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import UserTransactionStyle from '../../styles/clientstyles/UserTransactionStyle'
import { api, withUserHeader } from '../../utils/api'
import { useUser } from '../../context/UserContext'

export default function UserTransactions() {
    const cs = useNavigation()
    const { user } = useUser()
    const [isSidebarVisible, setSidebarVisible] = useState(false)
    const [loading, setLoading] = useState(true)
    const [getTransac, setTransac] = useState([])

    // --- Filter States ---
    const [searchText, setSearchText] = useState('')
    const [statusFilter, setStatusFilter] = useState('Status')
    const [dateFilter, setDateFilter] = useState(null)
    
    // --- UI States ---
    const [isStatusModalVisible, setStatusModalVisible] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false)

    const statusOptions = ['All Status', 'Successful', 'Pending', 'Cancelled']

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!user?._id) return;
            try {
                setLoading(true);
                const response = await api.get('/transaction/my-transactions', withUserHeader(user._id))
                setTransac(response.data || [])
            } catch (error) {
                console.log("Fetch Error:", error.message);
            } finally {
                setLoading(false)
            }
        }
        fetchTransactions()
    }, [user?._id])

    // --- LOGIC: Combined Filtering ---
    const filteredTransactions = useMemo(() => {
        return getTransac.filter((item) => {
            const text = searchText.toLowerCase();
            const matchesSearch = !text || 
                item.packageName?.toLowerCase().includes(text) || 
                item.reference?.toLowerCase().includes(text);

            const matchesStatus = statusFilter === 'Status' || statusFilter === 'All Status' || 
                item.status === statusFilter;

            const matchesDate = !dateFilter || 
                new Date(item.createdAt).toDateString() === dateFilter.toDateString();

            return matchesSearch && matchesStatus && matchesDate;
        })
    }, [getTransac, searchText, statusFilter, dateFilter])

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) setDateFilter(selectedDate);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />
            <Header openSidebar={() => setSidebarVisible(true)} />

            <ScrollView contentContainerStyle={UserTransactionStyle.container} showsVerticalScrollIndicator={false}>
                
                {/* --- M&RC Branding Header (As requested!) --- */}
                <View style={UserTransactionStyle.brandingContainer}>
                    <Text style={UserTransactionStyle.mainTitle}>M&RC Travel and Tours</Text>
                    <Text style={UserTransactionStyle.byTravex}>by travex</Text>
                </View>

                <Text style={UserTransactionStyle.pageTitle}>My Transactions</Text>

                {/* --- Search & Filters Row --- */}
                <View style={UserTransactionStyle.searchRow}>
                    <View style={UserTransactionStyle.searchBar}>
                        <Ionicons name="search" size={16} color="#777" />
                        <TextInput
                            style={UserTransactionStyle.searchInput}
                            placeholder='Search reference...'
                            placeholderTextColor="#777"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>

                    <View style={UserTransactionStyle.dropdownGroup}>
                        {/* Status Filter Button */}
                        <TouchableOpacity 
                            style={UserTransactionStyle.dropdownButton} 
                            onPress={() => setStatusModalVisible(true)}
                        >
                            <Text style={UserTransactionStyle.dropdownText}>{statusFilter}</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" />
                        </TouchableOpacity>

                        {/* Date Filter Button */}
                        <TouchableOpacity 
                            style={UserTransactionStyle.dropdownButton} 
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={UserTransactionStyle.dropdownText}>
                                {dateFilter ? dateFilter.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Date'}
                            </Text>
                            <Ionicons name="calendar-outline" size={12} color="#305797" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* --- Clear Filters Button --- */}
                {(statusFilter !== 'Status' || dateFilter) && (
                    <TouchableOpacity onPress={() => { setStatusFilter('Status'); setDateFilter(null); }} style={{marginBottom: 10}}>
                        <Text style={{color: '#305797', fontSize: 12, textAlign: 'right'}}>Clear Filters</Text>
                    </TouchableOpacity>
                )}

                {loading ? (
                    <ActivityIndicator size="large" color="#305797" style={{ marginTop: 50 }} />
                ) : (
                    filteredTransactions.map((item) => (
                        <View key={item._id} style={UserTransactionStyle.transactionCard}>
                            <View style={UserTransactionStyle.cardHeader}>
                                <Text style={UserTransactionStyle.transactionRef}>{item.reference}</Text>
                                <Text style={[
                                    UserTransactionStyle.transactionStatus,
                                    { color: item.status === "Successful" ? "#2ecc71" : "#f1c40f" }
                                ]}>
                                    {item.status}
                                </Text>
                            </View>

                            <View style={UserTransactionStyle.cardBody}>
                                <Text style={UserTransactionStyle.packageName}>{item.packageName}</Text>
                                <View style={UserTransactionStyle.detailRow}>
                                    <Text style={UserTransactionStyle.detailLabel}>Date:</Text>
                                    <Text style={UserTransactionStyle.detailValue}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                                </View>
                                <View style={UserTransactionStyle.detailRow}>
                                    <Text style={UserTransactionStyle.detailLabel}>Amount:</Text>
                                    <Text style={UserTransactionStyle.amount}>₱{item.amount.toLocaleString()}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={UserTransactionStyle.viewButton}
                                onPress={() => cs.navigate("bookinginvoice", { booking: item.bookingId })}
                            >
                                <Text style={UserTransactionStyle.buttonText}>View Receipt</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* --- Status Selection Modal --- */}
            <Modal transparent visible={isStatusModalVisible} animationType="fade">
                <TouchableOpacity style={UserTransactionStyle.modalOverlay} onPress={() => setStatusModalVisible(false)}>
                    <View style={UserTransactionStyle.modalContent}>
                        {statusOptions.map((opt) => (
                            <TouchableOpacity 
                                key={opt} 
                                style={UserTransactionStyle.modalOption}
                                onPress={() => { setStatusFilter(opt); setStatusModalVisible(false); }}
                            >
                                <Text style={UserTransactionStyle.modalOptionText}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* --- Date Picker --- */}
            {showDatePicker && (
                <DateTimePicker
                    value={dateFilter || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}
        </View>
    )
}