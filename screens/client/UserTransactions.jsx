import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal, Platform, Image } from 'react-native'
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

    const statusOptions = ['All Status', 'Successful', 'Pending', 'Failed', 'Cancelled']

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!user?._id) return;
            try {
                setLoading(true);
                const response = await api.get('/transaction/my-transactions', withUserHeader(user._id))
                // Handle different response structures gracefully
                const transactions = response.data.transactions || response.data || [];
                setTransac(Array.isArray(transactions) ? transactions : []);
            } catch (error) {
                // 🔥 THIS WILL REVEAL THE HIDDEN BACKEND ERROR! 🔥
                console.log("TRANSACTION CRASH REASON:", error.response?.data || error.message);
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
            
            // Safely check for packageName depending on how deep the data is nested
            const pName = item.packageName || item.bookingId?.packageId?.packageName || item.bookingId?.packageName || "";
            
            const matchesSearch = !text || 
                pName.toLowerCase().includes(text) || 
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

    // --- HELPER FUNCTION: Get Status Colors ---
    const getStatusStyle = (status) => {
        const normalized = String(status || 'Successful').trim();
        switch (normalized) {
            case 'Failed':
            case 'Cancelled':
                return { bg: '#fff1f0', text: '#cf1322' }; // Red
            case 'Pending':
                return { bg: '#fffbe6', text: '#d48806' }; // Yellow/Orange
            case 'Successful':
            default:
                return { bg: '#f6ffed', text: '#389e0d' }; // Green
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={UserTransactionStyle.container} showsVerticalScrollIndicator={false}>
                
                {/* --- Redesigned Header to match Bookings --- */}
                <Text style={UserTransactionStyle.title}>My Transactions</Text>
                <Text style={UserTransactionStyle.subtitle}>View your payment history and receipts.</Text>

                {/* --- Search & Filters Row --- */}
                <View style={UserTransactionStyle.searchRow}>
                    <View style={UserTransactionStyle.searchBar}>
                        <Ionicons name="search" size={16} color="#777" />
                        <TextInput
                            style={UserTransactionStyle.searchInput}
                            placeholder='Search reference or package...'
                            placeholderTextColor="#999"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>

                    <View style={UserTransactionStyle.dropdownGroup}>
                        <TouchableOpacity 
                            style={UserTransactionStyle.dropdownButton} 
                            onPress={() => setStatusModalVisible(true)}
                        >
                            <Text style={UserTransactionStyle.dropdownText}>{statusFilter}</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={UserTransactionStyle.dropdownButton} 
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={UserTransactionStyle.dropdownText}>
                                {dateFilter ? dateFilter.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Date'}
                            </Text>
                            <Ionicons name="calendar-outline" size={12} color="#305797" />
                        </TouchableOpacity>

                        {/* --- Clear Filters Button Icon --- */}
                        {(statusFilter !== 'Status' || dateFilter) && (
                            <TouchableOpacity onPress={() => { setStatusFilter('Status'); setDateFilter(null); }} style={{ justifyContent: 'center', paddingHorizontal: 5 }}>
                                <Ionicons name="refresh-circle" size={32} color="#ff4d4f" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* --- LIST / EMPTY STATE RENDERING --- */}
                {loading ? (
                    <ActivityIndicator size="large" color="#305797" style={{ marginTop: 50 }} />
                ) : filteredTransactions.length === 0 ? (
                    <View style={UserTransactionStyle.emptyContainer}>
                        <Image 
                            source={require('../../assets/images/empty_logo.png')} 
                            style={UserTransactionStyle.emptyImage}
                        />
                        <Text style={UserTransactionStyle.emptyText}>No Data yet</Text>
                    </View>
                ) : (
                    filteredTransactions.map((item) => {
                        const statusStyle = getStatusStyle(item.status);
                        
                        return (
                            <View key={item._id} style={UserTransactionStyle.transactionCard}>
                                <View style={UserTransactionStyle.cardHeader}>
                                    <Text style={UserTransactionStyle.transactionRef}>{item.reference}</Text>
                                    
                                    {/* Redesigned Status Badge to match Bookings */}
                                    <View style={[UserTransactionStyle.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                        <Text style={[UserTransactionStyle.transactionStatus, { color: statusStyle.text }]}>
                                            {item.status || 'Successful'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={UserTransactionStyle.cardBody}>
                                    <Text style={UserTransactionStyle.packageName}>
                                        {item.packageName || item.bookingId?.packageId?.packageName || item.bookingId?.packageName || "Tour Package"}
                                    </Text>
                                    <View style={UserTransactionStyle.detailRow}>
                                        <Text style={UserTransactionStyle.detailLabel}>Date:</Text>
                                        <Text style={UserTransactionStyle.detailValue}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                    <View style={UserTransactionStyle.detailRow}>
                                        <Text style={UserTransactionStyle.detailLabel}>Amount:</Text>
                                        <Text style={UserTransactionStyle.amount}>₱{Number(item.amount || 0).toLocaleString()}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={UserTransactionStyle.viewButton}
                                    // Make sure you pass the correct booking object if your invoice screen expects it!
                                    onPress={() => cs.navigate("bookinginvoice", { booking: item.bookingId || item })}
                                >
                                    <Text style={UserTransactionStyle.buttonText}>View Receipt</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    })
                )}
            </ScrollView>

            {/* --- Status Selection Modal --- */}
            <Modal transparent visible={isStatusModalVisible} animationType="fade">
                <TouchableOpacity style={UserTransactionStyle.modalOverlay} onPress={() => setStatusModalVisible(false)} activeOpacity={1}>
                    <View style={UserTransactionStyle.modalContent}>
                        <Text style={{ textAlign: 'center', fontSize: 18, fontFamily: 'Montserrat_700Bold', color: '#305797', marginVertical: 15 }}>
                            Select Status
                        </Text>
                        {statusOptions.map((opt, index) => (
                            <TouchableOpacity 
                                key={opt} 
                                style={[
                                    UserTransactionStyle.modalOption,
                                    { borderTopWidth: index === 0 ? 0 : 1, borderTopColor: '#f0f0f0' }
                                ]}
                                onPress={() => { setStatusFilter(opt); setStatusModalVisible(false); }}
                            >
                                <Text style={[
                                    UserTransactionStyle.modalOptionText,
                                    { fontFamily: statusFilter === opt ? 'Montserrat_700Bold' : 'Roboto_500Medium'}
                                ]}>
                                    {opt}
                                </Text>
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