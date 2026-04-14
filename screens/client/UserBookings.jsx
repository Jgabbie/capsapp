import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView, ActivityIndicator, Alert, TouchableWithoutFeedback, Image } from 'react-native'
import React, { useMemo, useState, useCallback } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { Calendar } from 'react-native-calendars'
import * as ImagePicker from 'expo-image-picker'

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
    const [loadingCancel, setLoadingCancel] = useState(false)
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
    
    // Cancellation Modal States (Synced with Web)
    const [isCancelModalOpen, setCancelModalOpen] = useState(false)
    const [selectedBookingId, setSelectedBookingId] = useState(null)
    const [cancelReason, setCancelReason] = useState('')
    const [cancelOtherReason, setCancelOtherReason] = useState('')
    const [cancelComments, setCancelComments] = useState('')
    const [cancelImage, setCancelImage] = useState(null)
    const [showCancelReasonDropdown, setShowCancelReasonDropdown] = useState(false)

    // --- HELPER FUNCTION: Status Normalization ---
    const getComputedStatus = (booking) => {
        const rawStatus = booking.status || '';
        const formatted = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
        const normalized = formatted.toLowerCase();

        if (normalized === 'cancelled' || normalized === 'cancellation requested') {
            return formatted || 'Cancelled';
        }
        if (Number(booking.paidAmount || 0) <= 0) {
            if (normalized === 'pending') return 'Pending';
            return 'Not Paid';
        }
        if (normalized === 'successful' || normalized === 'fully paid') {
            return 'Fully Paid';
        }
        return formatted || 'No Status';
    };

    // --- HELPER FUNCTION: Status Colors ---
    const getStatusStyle = (status) => {
        const normalized = String(status || '').trim().toLowerCase();
        if (normalized === 'not paid') return { bg: '#fff1f0', text: '#cf1322' }; // Red
        if (normalized === 'pending') return { bg: '#fffbe6', text: '#d48806' }; // Yellow/Orange
        if (normalized === 'fully paid' || normalized === 'successful') return { bg: '#f6ffed', text: '#389e0d' }; // Green
        if (normalized === 'cancelled' || normalized === 'cancellation requested') return { bg: '#f5f5f5', text: '#555555' }; // Grey
        return { bg: '#f0f5ff', text: '#2f54eb' }; // Blue Fallback
    };

    const fetchBookings = async () => {
        if (!user?._id) return;
        try {
            setLoading(true)
            const response = await api.get('/booking/my-bookings', withUserHeader(user._id))
            
            let fetchedBookings = [];
            if (Array.isArray(response.data)) {
                fetchedBookings = response.data;
            } else if (response.data && Array.isArray(response.data.bookings)) {
                fetchedBookings = response.data.bookings;
            } else if (response.data && typeof response.data === 'object') {
                 fetchedBookings = [response.data];
            }

            // Format dates and compute status instantly
            const mappedBookings = fetchedBookings.map(b => {
                // 🔥 FIXED: Check if travelDate is a string (Mobile) or an object (Web)
                let formattedTravelDate = '--';
                if (b.travelDate && typeof b.travelDate === 'string') {
                    formattedTravelDate = b.travelDate;
                } else if (b.travelDate?.startDate) {
                    formattedTravelDate = `${dayjs(b.travelDate.startDate).format('MMM D, YYYY')} - ${dayjs(b.travelDate.endDate).format('MMM D, YYYY')}`;
                }

                return {
                    ...b,
                    computedStatus: getComputedStatus(b),
                    formattedBookingDate: dayjs(b.createdAt).format('MMM D, YYYY'),
                    formattedTravelDate: formattedTravelDate
                }
            });

            setBookings(mappedBookings);
            
        } catch (error) {
            console.log("BOOKING CRASH REASON:", error.response?.data || error.message);
            setBookings([])
        } finally {
            setLoading(false)
        }
    }

    useFocusEffect(useCallback(() => { fetchBookings() }, [user?._id]))

    // --- FILTER LOGIC ---
    const filteredBookings = useMemo(() => {
        return bookings.filter((item) => {
            const needle = searchText.trim().toLowerCase();
            const matchesSearch = !needle || 
                item.reference?.toLowerCase().includes(needle) || 
                (item.packageId?.packageName || '').toLowerCase().includes(needle) ||
                item.computedStatus.toLowerCase().includes(needle);
            
            const matchesStatus = statusFilter === 'All' || item.computedStatus === statusFilter;
            
            const matchesBookingDate = !bookingDateFilter || dayjs(item.createdAt).format('YYYY-MM-DD') === bookingDateFilter;
            
            // Travel date matching logic
            let matchesTravelDate = true;
            if (travelDateFilter) {
                // We just check if the formatted string contains the chosen date
                const formattedFilter = dayjs(travelDateFilter).format('MMM D, YYYY');
                matchesTravelDate = item.formattedTravelDate.includes(formattedFilter);
            }

            return matchesSearch && matchesStatus && matchesBookingDate && matchesTravelDate;
        })
    }, [bookings, searchText, statusFilter, bookingDateFilter, travelDateFilter])


    // --- CANCELLATION LOGIC (Synced with Web) ---
    const pickCancelImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            base64: true, 
            quality: 0.7,
        });

        if (!result.canceled) {
            setCancelImage(result.assets[0]);
        }
    };

    const handleCancelBooking = async () => {
        if (!cancelReason) {
            Alert.alert("Required", "Please select a cancellation reason.");
            return;
        }
        if (cancelReason === 'Other' && !cancelOtherReason.trim()) {
            Alert.alert("Required", "Please specify your cancellation reason.");
            return;
        }
        if (!cancelImage) {
            Alert.alert("Required", "Uploading at least one file is required.");
            return;
        }

        try {
            setLoadingCancel(true);

            // 🔥 FIX: Send the image directly as a base64 string, bypassing the missing /upload route!
            const finalReason = cancelReason === 'Other' ? cancelOtherReason : cancelReason;
            const payload = {
                reason: finalReason,
                comments: cancelComments || '',
                imageProof: `data:${cancelImage.mimeType || 'image/jpeg'};base64,${cancelImage.base64}`
            };

            await api.post(`/booking/cancel/${selectedBookingId}`, payload, withUserHeader(user._id));
            
            setLoadingCancel(false);
            setCancelModalOpen(false);
            
            // Reset fields
            setCancelReason(''); setCancelOtherReason(''); setCancelComments(''); setCancelImage(null);
            
            Alert.alert("Success", "Cancellation request sent successfully.");
            fetchBookings(); // Refresh the list
        } catch (error) {
            setLoadingCancel(false);
            Alert.alert("Error", "Unable to cancel booking. Please try again.");
            console.error("Cancel Error:", error.response?.data || error.message);
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView 
                style={UserBookingsStyle.container} 
                contentContainerStyle={{ paddingBottom: 40 }} 
                showsVerticalScrollIndicator={false}
            >
                <Text style={UserBookingsStyle.title}>My Bookings</Text>
                <Text style={UserBookingsStyle.subtitle}>Track your latest reservations and payment status.</Text>

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
                    filteredBookings.map((item) => {
                        const statusStyle = getStatusStyle(item.computedStatus);
                        return (
                            <View key={item._id} style={UserBookingsStyle.bookingCard}>
                                <View style={UserBookingsStyle.cardHeader}>
                                    <Text style={UserBookingsStyle.bookingRef}>{item.reference}</Text>
                                    
                                    {/* DYNAMIC STATUS COLORS */}
                                    <View style={[UserBookingsStyle.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                        <Text style={[UserBookingsStyle.bookingStatus, { color: statusStyle.text, fontWeight: 'bold' }]}>
                                            {item.computedStatus}
                                        </Text>
                                    </View>
                                </View>
                                <View style={UserBookingsStyle.cardBody}>
                                    <Text style={UserBookingsStyle.packageName}>{item.packageId?.packageName || 'Tour Package'}</Text>
                                    <Text style={UserBookingsStyle.detailText}>📅 Travel Date: {item.formattedTravelDate}</Text>
                                    <Text style={UserBookingsStyle.detailText}>📝 Booking Date: {item.formattedBookingDate}</Text>
                                    <Text style={UserBookingsStyle.detailText}>👥 Travelers: {item.travelers || 1}</Text>
                                    <Text style={UserBookingsStyle.detailText}>🏷️ Package Type: {(item.packageId?.packageType || 'Fixed').toUpperCase()}</Text>
                                </View>
                                <View style={UserBookingsStyle.cardActions}>
                                    <TouchableOpacity style={UserBookingsStyle.viewButton} onPress={() => navigation.navigate('bookinginvoice', { booking: item })}>
                                        <Text style={UserBookingsStyle.viewButtonText}>View Invoice</Text>
                                    </TouchableOpacity>
                                    {/* Hide Cancel button if it's already cancelled */}
                                    {(item.computedStatus !== 'Cancelled' && item.computedStatus !== 'Cancellation Requested') && (
                                        <TouchableOpacity style={UserBookingsStyle.cancelButton} onPress={() => { setSelectedBookingId(item._id); setCancelModalOpen(true); }}>
                                            <Text style={UserBookingsStyle.cancelButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    })
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
                            {['All', 'Not Paid', 'Pending', 'Fully Paid', 'Cancellation Requested', 'Cancelled'].map((status, index) => (
                                <TouchableOpacity 
                                    key={status} 
                                    style={[
                                        UserBookingsStyle.modalOption,
                                        { borderTopWidth: index === 0 ? 0 : 1, borderTopColor: '#f0f0f0' }
                                    ]} 
                                    onPress={() => { setStatusFilter(status); setStatusModalOpen(false); }}
                                >
                                    <Text style={{ 
                                        fontSize: 15, 
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

            {/* --- WEB-SYNCED CANCELLATION MODAL --- */}
            <Modal transparent visible={isCancelModalOpen} animationType="fade">
                <TouchableOpacity style={ModalStyle.modalOverlay} activeOpacity={1} onPress={() => {if (!loadingCancel) setCancelModalOpen(false)}}>
                    <TouchableWithoutFeedback>
                        <View style={[ModalStyle.modalBox, { width: '90%', padding: 24 }]}>
                            {loadingCancel ? (
                                <View style={{ padding: 40, alignItems: 'center' }}>
                                    <ActivityIndicator size="large" color="#305797" />
                                    <Text style={{ marginTop: 15, fontFamily: 'Montserrat_600SemiBold', color: '#555' }}>Submitting cancellation...</Text>
                                </View>
                            ) : (
                                <>
                                    <Text style={[ModalStyle.modalTitle, { color: '#305797', fontSize: 20, textAlign: 'center', marginBottom: 10 }]}>Confirm Cancellation</Text>
                                    <Text style={[ModalStyle.modalText, { marginBottom: 20, textAlign: 'center', color: '#555' }]}>Are you sure you want to cancel this booking?</Text>
                                    
                                    {/* Reason Dropdown */}
                                    <TouchableOpacity 
                                        style={{ width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                                        onPress={() => setShowCancelReasonDropdown(!showCancelReasonDropdown)}
                                    >
                                        <Text style={{ color: cancelReason ? '#333' : '#888', fontFamily: 'Roboto_400Regular' }}>{cancelReason || 'Select a reason'}</Text>
                                        <Ionicons name="chevron-down" size={16} color="#888" />
                                    </TouchableOpacity>
                                    
                                    {showCancelReasonDropdown && (
                                        <View style={{ width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 10, backgroundColor: '#fff' }}>
                                            {['Medical Concern', 'Schedule Conflict', 'Other'].map((reason, idx) => (
                                                <TouchableOpacity 
                                                    key={reason} 
                                                    style={{ padding: 12, borderBottomWidth: idx === 2 ? 0 : 1, borderBottomColor: '#eee' }}
                                                    onPress={() => { setCancelReason(reason); setShowCancelReasonDropdown(false); }}
                                                >
                                                    <Text style={{ color: '#333', fontFamily: 'Roboto_400Regular' }}>{reason}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}

                                    {/* Other Reason Input */}
                                    {cancelReason === 'Other' && (
                                        <TextInput
                                            style={{ width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10, fontFamily: 'Roboto_400Regular' }}
                                            placeholder="Please specify"
                                            value={cancelOtherReason}
                                            onChangeText={setCancelOtherReason}
                                        />
                                    )}

                                    {/* Comments Input (FIXED: width 100%) */}
                                    <TextInput
                                        style={{ width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15, fontFamily: 'Roboto_400Regular', height: 80, textAlignVertical: 'top' }}
                                        placeholder="Additional comments (optional)"
                                        multiline
                                        value={cancelComments}
                                        onChangeText={setCancelComments}
                                    />

                                    {/* Image Proof Upload (FIXED: Centered and Full Width) */}
                                    <View style={{ width: '100%', alignItems: 'center', marginBottom: 20 }}>
                                        <TouchableOpacity 
                                            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#305797', borderRadius: 6, paddingVertical: 10, width: '100%' }} 
                                            onPress={pickCancelImage}
                                        >
                                            <Ionicons name="push-outline" size={18} color="#305797" style={{ marginRight: 8 }} />
                                            <Text style={{ color: '#305797', fontFamily: 'Montserrat_600SemiBold', fontSize: 14 }}>
                                                Upload file
                                            </Text>
                                        </TouchableOpacity>

                                        {cancelImage && (
                                            <View style={{ alignItems: 'center', marginTop: 15 }}>
                                                <Image 
                                                    source={{ uri: cancelImage.uri }} 
                                                    style={{ width: 120, height: 120, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' }} 
                                                />
                                                <Text style={{ fontSize: 11, color: '#555', marginTop: 8 }}>{cancelImage.fileName || 'image.jpg'}</Text>
                                            </View>
                                        )}

                                        <Text style={{ fontSize: 11, color: '#777', marginTop: 10 }}>Uploading at least one file is required.</Text>
                                    </View>

                                    {/* Web-Synced Buttons */}
                                    <View style={ModalStyle.modalButtonContainer}>
                                        <TouchableOpacity style={[ModalStyle.modalButton, { backgroundColor: '#9f2b46', flex: 1, marginRight: 5 }]} onPress={() => { setCancelModalOpen(false); setCancelImage(null); setCancelReason(''); setCancelOtherReason(''); setCancelComments(''); }}>
                                            <Text style={ModalStyle.modalButtonText}>Keep Booking</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[ModalStyle.modalButton, { backgroundColor: '#305797', flex: 1, marginLeft: 5 }]} onPress={handleCancelBooking}>
                                            <Text style={ModalStyle.modalButtonText}>Cancel Booking</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

        </View>
    )
}