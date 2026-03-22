import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { Calendar } from 'react-native-calendars' // Same one you used before!
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

    // ADVANCED FILTERING LOGIC (Matching Web)
    const filteredBookings = useMemo(() => {
        return bookings.filter((item) => {
            const needle = searchText.trim().toLowerCase()
            const matchesSearch = !needle || 
                item.reference?.toLowerCase().includes(needle) || 
                (item.packageId?.packageName || '').toLowerCase().includes(needle);
            
            const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

            const matchesBookingDate = !bookingDateFilter || 
                dayjs(item.createdAt).format('YYYY-MM-DD') === bookingDateFilter;

            const matchesTravelDate = !travelDateFilter || 
                item.travelDate === travelDateFilter;

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
            {/* HEADER FIXED AT TOP */}
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={UserBookingsStyle.container} showsVerticalScrollIndicator={false}>
                <Text style={UserBookingsStyle.title}>My Bookings</Text>
                <Text style={UserBookingsStyle.subtitle}>Track your latest reservations and status.</Text>

                {/* SEARCH BAR */}
                <View style={UserBookingsStyle.searchRow}>
                    <View style={UserBookingsStyle.searchBar}>
                        <Ionicons name="search" size={16} color="#777" />
                        <TextInput
                            style={UserBookingsStyle.searchInput}
                            placeholder='Search reference...'
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>
                </View>

                {/* FILTER ROW (Dropdowns) */}
                <View style={[UserBookingsStyle.searchRow, { marginTop: -10 }]}>
                    <TouchableOpacity style={UserBookingsStyle.dropdownButton} onPress={() => setStatusModalOpen(true)}>
                        <Text style={UserBookingsStyle.dropdownText}>{statusFilter === 'All' ? 'Status' : statusFilter}</Text>
                        <Ionicons name="chevron-down" size={12} color="#305797" />
                    </TouchableOpacity>

                    <TouchableOpacity style={UserBookingsStyle.dropdownButton} onPress={() => setBookingDateOpen(true)}>
                        <Text style={UserBookingsStyle.dropdownText}>
                            {bookingDateFilter ? dayjs(bookingDateFilter).format('MMM D') : 'Booking Date'}
                        </Text>
                        <Ionicons name="calendar-outline" size={12} color="#305797" />
                    </TouchableOpacity>

                    <TouchableOpacity style={UserBookingsStyle.dropdownButton} onPress={() => setTravelDateOpen(true)}>
                        <Text style={UserBookingsStyle.dropdownText}>
                            {travelDateFilter ? dayjs(travelDateFilter).format('MMM D') : 'Travel Date'}
                        </Text>
                        <Ionicons name="airplane-outline" size={12} color="#305797" />
                    </TouchableOpacity>

                    {/* CLEAR FILTERS ICON */}
                    {(statusFilter !== 'All' || bookingDateFilter || travelDateFilter) && (
                        <TouchableOpacity onPress={() => { setStatusFilter('All'); setBookingDateFilter(null); setTravelDateFilter(null); }}>
                            <Ionicons name="refresh-circle" size={28} color="#ff4d4f" />
                        </TouchableOpacity>
                    )}
                </View>

                {loading ? <ActivityIndicator size="large" color="#305797" style={{ marginTop: 50 }} /> : (
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
                                    <Text style={UserBookingsStyle.buttonText}>View Invoice</Text>
                                </TouchableOpacity>
                                {item.status !== 'Cancelled' && (
                                    <TouchableOpacity style={UserBookingsStyle.cancelButton} onPress={() => { setSelectedBookingId(item._id); setCancelModalOpen(true); }}>
                                        <Text style={UserBookingsStyle.buttonText}>Cancel</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* --- STATUS SELECTION MODAL --- */}
            <Modal transparent visible={isStatusModalOpen} animationType="fade">
                <View style={ModalStyle.modalOverlay}>
                    <View style={ModalStyle.modalBox}>
                        <Text style={ModalStyle.modalTitle}>Select Status</Text>
                        {['All', 'Successful', 'Pending', 'Cancelled'].map((status) => (
                            <TouchableOpacity key={status} style={ModalStyle.modalOption} onPress={() => { setStatusFilter(status); setStatusModalOpen(false); }}>
                                <Text style={statusFilter === status ? { color: '#305797', fontWeight: 'bold' } : {}}>{status}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity onPress={() => setStatusModalOpen(false)} style={{ marginTop: 15 }}><Text style={{ color: 'red' }}>Close</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* --- BOOKING DATE CALENDAR MODAL --- */}
            <Modal transparent visible={isBookingDateOpen} animationType="slide">
                <View style={ModalStyle.modalOverlay}>
                    <View style={ModalStyle.modalBox}>
                        <Text style={ModalStyle.modalTitle}>Booking Date</Text>
                        <Calendar onDayPress={(day) => { setBookingDateFilter(day.dateString); setBookingDateOpen(false); }} />
                        <TouchableOpacity onPress={() => setBookingDateOpen(false)} style={{ marginTop: 15 }}><Text style={{ color: 'red' }}>Cancel</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* --- TRAVEL DATE CALENDAR MODAL --- */}
            <Modal transparent visible={isTravelDateOpen} animationType="slide">
                <View style={ModalStyle.modalOverlay}>
                    <View style={ModalStyle.modalBox}>
                        <Text style={ModalStyle.modalTitle}>Travel Date</Text>
                        <Calendar onDayPress={(day) => { setTravelDateFilter(day.dateString); setTravelDateOpen(false); }} />
                        <TouchableOpacity onPress={() => setTravelDateOpen(false)} style={{ marginTop: 15 }}><Text style={{ color: 'red' }}>Cancel</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* --- CANCELLATION MODAL --- */}
            <Modal transparent visible={isCancelModalOpen} animationType="fade">
                <View style={ModalStyle.modalOverlay}>
                    <View style={ModalStyle.modalBox}>
                        <Text style={ModalStyle.modalTitle}>Cancel Booking</Text>
                        <Text style={ModalStyle.modalText}>Are you sure you want to cancel this booking?</Text>
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