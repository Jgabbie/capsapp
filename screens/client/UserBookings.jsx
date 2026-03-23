import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView, ActivityIndicator, Alert, Pressable, TouchableWithoutFeedback, Image } from 'react-native'
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { Calendar } from 'react-native-calendars'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import UserBookingsStyle from '../../styles/clientstyles/UserBookingsStyle'
import ModalStyle from '../../styles/componentstyles/ModalStyle'
import { api, withUserHeader } from '../../utils/api'
import { useUser } from '../../context/UserContext'
import dayjs from 'dayjs'

export default function UserBookings() {
    const navigation = useNavigation()
    const { user } = useUser()
    const [isSidebarVisible, setSidebarVisible] = useState(false)
    const [loading, setLoading] = useState(true)
    const [bookings, setBookings] = useState([])

    // Filter States
    const [searchText, setSearchText] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [bookingDateFilter, setBookingDateFilter] = useState(null)
    const [travelDateFilter, setTravelDateFilter] = useState(null)

    // Modal Visibility States
    const [isStatusModalOpen, setStatusModalOpen] = useState(false)
    const [isBookingDateOpen, setBookingDateOpen] = useState(false)
    const [isTravelDateOpen, setTravelDateOpen] = useState(false)
    const [isCancelModalOpen, setCancelModalOpen] = useState(false)
    const [selectedBookingId, setSelectedBookingId] = useState(null)

    const fetchBookings = async () => {
        if (!user?._id) return;
        try {
            setLoading(true)
            const response = await api.get('/booking/my-bookings', withUserHeader(user._id))
            setBookings(response.data || [])
        } catch (error) {
            setBookings([])
        } finally {
            setLoading(false)
        }
    }

    useFocusEffect(useCallback(() => { fetchBookings() }, [user?._id]))

    const filteredBookings = useMemo(() => {
        return bookings.filter((item) => {
            const needle = searchText.trim().toLowerCase()
            const matchesSearch = !needle || 
                item.reference?.toLowerCase().includes(needle) || 
                (item.packageId?.packageName || '').toLowerCase().includes(needle);
            
            const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
            const matchesBookingDate = !bookingDateFilter || dayjs(item.createdAt).format('YYYY-MM-DD') === bookingDateFilter;
            const matchesTravelDate = !travelDateFilter || item.travelDate === travelDateFilter;

            return matchesSearch && matchesStatus && matchesBookingDate && matchesTravelDate;
        })
    }, [bookings, searchText, statusFilter, bookingDateFilter, travelDateFilter])

    const handleCancelBooking = async () => {
        try {
            await api.post(`/booking/cancel/${selectedBookingId}`, { reason: 'User requested cancellation' }, withUserHeader(user._id))
            setCancelModalOpen(false)
            fetchBookings()
            Alert.alert("Success", "Cancellation request sent!")
        } catch (error) {
            setCancelModalOpen(false)
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={UserBookingsStyle.container} showsVerticalScrollIndicator={false}>
                <Text style={UserBookingsStyle.title}>My Bookings</Text>
                <Text style={UserBookingsStyle.subtitle}>Track your latest reservations and status.</Text>

                {/* --- CONSOLIDATED SEARCH & FILTER AREA --- */}
                <View style={UserBookingsStyle.searchRow}>
                    <View style={UserBookingsStyle.searchBar}>
                        <Ionicons name="search" size={16} color="#777" />
                        <TextInput
                            style={UserBookingsStyle.searchInput}
                            placeholder='Search reference or package...'
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>

                    <View style={UserBookingsStyle.filterRow}>
                        <TouchableOpacity style={UserBookingsStyle.dropdownButton} onPress={() => setStatusModalOpen(true)}>
                            <Text style={UserBookingsStyle.dropdownText}>{statusFilter === 'All' ? 'Status' : statusFilter}</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" />
                        </TouchableOpacity>

                        <TouchableOpacity style={UserBookingsStyle.dropdownButton} onPress={() => setBookingDateOpen(true)}>
                            <Text style={UserBookingsStyle.dropdownText}>
                                {bookingDateFilter ? dayjs(bookingDateFilter).format('MMM D') : 'Booking'}
                            </Text>
                            <Ionicons name="calendar-outline" size={12} color="#305797" />
                        </TouchableOpacity>

                        <TouchableOpacity style={UserBookingsStyle.dropdownButton} onPress={() => setTravelDateOpen(true)}>
                            <Text style={UserBookingsStyle.dropdownText}>
                                {travelDateFilter ? dayjs(travelDateFilter).format('MMM D') : 'Travel'}
                            </Text>
                            <Ionicons name="airplane-outline" size={12} color="#305797" />
                        </TouchableOpacity>

                        {(statusFilter !== 'All' || bookingDateFilter || travelDateFilter) && (
                            <TouchableOpacity onPress={() => { setStatusFilter('All'); setBookingDateFilter(null); setTravelDateFilter(null); }}>
                                <Ionicons name="refresh-circle" size={32} color="#ff4d4f" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* --- LIST / EMPTY STATE RENDERING --- */}
                {loading ? (
                    <ActivityIndicator size="large" color="#305797" style={{ marginTop: 50 }} />
                ) : filteredBookings.length === 0 ? (
                    <View style={UserBookingsStyle.emptyContainer}>
                        <Image 
                            source={require('../../assets/images/empty_logo.png')} 
                            style={UserBookingsStyle.emptyImage}
                        />
                        <Text style={UserBookingsStyle.emptyText}>No Data yet</Text>
                    </View>
                ) : (
                    filteredBookings.map((item) => (
                        <View key={item._id} style={UserBookingsStyle.bookingCard}>
                            <View style={UserBookingsStyle.cardHeader}>
                                <Text style={UserBookingsStyle.bookingRef}>{item.reference}</Text>
                                <View style={[UserBookingsStyle.statusBadge, { backgroundColor: item.status === 'Cancelled' ? '#fff1f0' : '#f6ffed' }]}>
                                    <Text style={[UserBookingsStyle.bookingStatus, { color: item.status === 'Cancelled' ? '#cf1322' : '#389e0d' }]}>
                                        {item.status || 'Successful'}
                                    </Text>
                                </View>
                            </View>
                            <View style={UserBookingsStyle.cardBody}>
                                <Text style={UserBookingsStyle.packageName}>{item.packageId?.packageName || 'Tour Package'}</Text>
                                <Text style={UserBookingsStyle.detailText}>📅 Travel: {item.travelDate || '--'}</Text>
                                <Text style={UserBookingsStyle.detailText}>👥 Travelers: {item.travelers || 0}</Text>
                            </View>
                            <View style={UserBookingsStyle.cardActions}>
                                <TouchableOpacity style={UserBookingsStyle.viewButton} onPress={() => navigation.navigate('bookinginvoice', { booking: item })}>
                                    <Text style={UserBookingsStyle.viewButtonText}>View Invoice</Text>
                                </TouchableOpacity>
                                {item.status !== 'Cancelled' && (
                                    <TouchableOpacity style={UserBookingsStyle.cancelButton} onPress={() => { setSelectedBookingId(item._id); setCancelModalOpen(true); }}>
                                        <Text style={UserBookingsStyle.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* --- MODALS --- */}
            <Modal visible={isStatusModalOpen} transparent animationType="fade">
                <TouchableOpacity style={ModalStyle.modalOverlay} activeOpacity={1} onPress={() => setStatusModalOpen(false)}>
                    <TouchableWithoutFeedback>
                        <View style={[ModalStyle.modalBox, { width: '85%', paddingVertical: 10 }]}>
                            <Text style={{ textAlign: 'center', fontSize: 18, fontFamily: 'Montserrat_700Bold', color: '#305797', marginVertical: 15 }}>
                                Select Status
                            </Text>
                            {['All', 'Successful', 'Pending', 'Cancelled'].map((status, index) => (
                                <TouchableOpacity 
                                    key={status} 
                                    style={[
                                        UserBookingsStyle.modalOption,
                                        { borderTopWidth: index === 0 ? 0 : 1, borderTopColor: '#f0f0f0' } // Adding dividers
                                    ]} 
                                    onPress={() => { setStatusFilter(status); setStatusModalOpen(false); }}
                                >
                                    <Text style={{ 
                                        fontSize: 16, 
                                        color: statusFilter === status ? '#305797' : '#555',
                                        fontFamily: statusFilter === status ? 'Montserrat_700Bold' : 'Roboto_400Regular'
                                    }}>
                                        {status}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            <Modal visible={isBookingDateOpen} transparent animationType="fade">
                <TouchableOpacity style={ModalStyle.modalOverlay} activeOpacity={1} onPress={() => setBookingDateOpen(false)}>
                    <TouchableWithoutFeedback>
                        <View style={[ModalStyle.modalBox, { width: '90%', padding: 15 }]}>
                            <Text style={[ModalStyle.modalTitle, { marginBottom: 15 }]}>Booking Date</Text>
                            <Calendar 
                                onDayPress={(day) => { setBookingDateFilter(day.dateString); setBookingDateOpen(false); }} 
                                theme={{ selectedDayBackgroundColor: '#305797', todayTextColor: '#305797', arrowColor: '#305797' }}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            <Modal visible={isTravelDateOpen} transparent animationType="fade">
                <TouchableOpacity style={ModalStyle.modalOverlay} activeOpacity={1} onPress={() => setTravelDateOpen(false)}>
                    <TouchableWithoutFeedback>
                        <View style={[ModalStyle.modalBox, { width: '90%', padding: 15 }]}>
                            <Text style={[ModalStyle.modalTitle, { marginBottom: 15 }]}>Travel Date</Text>
                            <Calendar 
                                onDayPress={(day) => { setTravelDateFilter(day.dateString); setTravelDateOpen(false); }} 
                                theme={{ selectedDayBackgroundColor: '#305797', todayTextColor: '#305797', arrowColor: '#305797' }}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            <Modal transparent visible={isCancelModalOpen} animationType="fade">
                <View style={ModalStyle.modalOverlay}>
                    <View style={ModalStyle.modalBox}>
                        <Text style={ModalStyle.modalTitle}>Cancel Booking</Text>
                        <Text style={ModalStyle.modalText}>Are you sure you want to cancel this booking? This action cannot be undone.</Text>
                        <View style={ModalStyle.modalButtonContainer}>
                            <TouchableOpacity style={ModalStyle.modalButton} onPress={handleCancelBooking}><Text style={ModalStyle.modalButtonText}>Yes</Text></TouchableOpacity>
                            <TouchableOpacity style={ModalStyle.modalCancelButton} onPress={() => setCancelModalOpen(false)}><Text style={ModalStyle.modalButtonText}>No</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}