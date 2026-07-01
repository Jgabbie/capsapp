import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView, ActivityIndicator, Alert, TouchableWithoutFeedback, Image, Pressable } from 'react-native'
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

import {
    useFonts,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

import {
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
} from "@expo-google-fonts/roboto";

export default function UserBookings() {
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold,
    });

    const navigation = useNavigation()
    const { user } = useUser()
    const [isSidebarVisible, setSidebarVisible] = useState(false)
    const [loading, setLoading] = useState(true)
    const [loadingCancel, setLoadingCancel] = useState(false)
    const [bookings, setBookings] = useState([])



    //filter States
    const [searchText, setSearchText] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [bookingDateFilter, setBookingDateFilter] = useState(null)
    const [travelDateFilter, setTravelDateFilter] = useState(null)

    const [pendingBookingDate, setPendingBookingDate] = useState(null)
    const [pendingTravelDate, setPendingTravelDate] = useState(null)

    //modal Visibility States
    const [isStatusModalOpen, setStatusModalOpen] = useState(false)
    const [isBookingDateOpen, setBookingDateOpen] = useState(false)
    const [isTravelDateOpen, setTravelDateOpen] = useState(false)

    // Cancellation Modal States
    const [isCancelPolicyModalOpen, setCancelPolicyModalOpen] = useState(false)
    const [isCancelModalOpen, setCancelModalOpen] = useState(false)
    const [selectedBookingId, setSelectedBookingId] = useState(null)
    const [cancelReason, setCancelReason] = useState('')
    const [cancelOtherReason, setCancelOtherReason] = useState('')
    const [cancelComments, setCancelComments] = useState('')
    const [cancelImage, setCancelImage] = useState(null)
    const [showCancelReasonDropdown, setShowCancelReasonDropdown] = useState(false)


    //open and close booking date picker modals with pending date state management
    const openBookingDatePicker = () => {
        setPendingBookingDate(
            bookingDateFilter || dayjs().format('YYYY-MM-DD')
        )

        setBookingDateOpen(true)
    }

    const closeBookingDatePicker = () => {
        setPendingBookingDate(bookingDateFilter)
        setBookingDateOpen(false)
    }

    const applyBookingDateFilter = () => {
        if (pendingBookingDate) {
            setBookingDateFilter(pendingBookingDate)
        }

        setBookingDateOpen(false)
    }

    const openTravelDatePicker = () => {
        setPendingTravelDate(
            travelDateFilter || dayjs().format('YYYY-MM-DD')
        )

        setTravelDateOpen(true)
    }

    const closeTravelDatePicker = () => {
        setPendingTravelDate(travelDateFilter)
        setTravelDateOpen(false)
    }

    const applyTravelDateFilter = () => {
        if (pendingTravelDate) {
            setTravelDateFilter(pendingTravelDate)
        }

        setTravelDateOpen(false)
    }


    //format status label to capitalize each word and remove extra spaces
    const formatStatusLabel = (value) => {
        return String(value || '')
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
    }


    //compute booking status based on backend status and paid amount
    const getComputedStatus = (booking) => {
        const rawStatus = booking.status || '';
        const formatted = formatStatusLabel(rawStatus);
        const normalized = formatted.toLowerCase();

        // Check booking status first (most authoritative from backend)
        if (normalized === 'cancelled' || normalized === 'cancellation requested') {
            return formatted || 'Cancelled';
        }
        if (normalized === 'successful' || normalized === 'fully paid') {
            return 'Fully Paid';
        }
        if (normalized === 'pending') {
            return 'Pending';
        }

        // Fall back to paidAmount logic
        if (Number(booking.paidAmount || 0) <= 0) {
            return 'Not Paid';
        }

        return formatted || 'No Status';
    };


    //get status style based on computed status for consistent UI
    const getStatusStyle = (status) => {
        const normalized = String(status || '').trim().toLowerCase();
        if (normalized === 'not paid') return { bg: '#fff1f0', text: '#cf1322' };
        if (normalized === 'pending') return { bg: '#fffbe6', text: '#d48806' };
        if (normalized === 'fully paid' || normalized === 'successful') return { bg: '#f6ffed', text: '#389e0d' };
        if (normalized === 'cancellation requested') return { bg: '#fffbe6', text: '#d48806' };
        if (normalized === 'cancelled') return { bg: '#fee2e2', text: '#b91c1c' };
        return { bg: '#f0f5ff', text: '#2f54eb' };
    };


    //fetch bookings from backend and map them to include computed status, formatted dates, and traveler count
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

            const mappedBookings = fetchedBookings.map(b => {

                let formattedTravelDate = '--';
                if (b.travelDate) {
                    if (typeof b.travelDate === 'string') {
                        formattedTravelDate = b.travelDate;
                    } else if (b.travelDate.startDate) {
                        const sDate = b.travelDate.startDate;
                        const eDate = b.travelDate.endDate || sDate;

                        if (sDate.includes(',') && !sDate.includes('T')) {
                            formattedTravelDate = sDate === eDate ? sDate : `${sDate} - ${eDate}`;
                        } else {
                            const parsedStart = new Date(sDate);
                            const parsedEnd = new Date(eDate);

                            if (!isNaN(parsedStart.getTime())) {
                                const fStart = dayjs(parsedStart).format('MMM D, YYYY');
                                const fEnd = isNaN(parsedEnd.getTime()) ? fStart : dayjs(parsedEnd).format('MMM D, YYYY');
                                formattedTravelDate = fStart === fEnd ? fStart : `${fStart} - ${fEnd}`;
                            } else {
                                formattedTravelDate = sDate;
                            }
                        }
                    }
                }

                let computedTravelers = 1;
                if (Array.isArray(b.travelers)) {
                    if (b.travelers.length > 0 && b.travelers[0].adult !== undefined) {
                        computedTravelers = (b.travelers[0].adult || 0) + (b.travelers[0].child || 0) + (b.travelers[0].infant || 0);
                    } else {
                        computedTravelers = b.travelers.length || 1;
                    }
                } else if (typeof b.travelers === 'object' && b.travelers !== null) {
                    computedTravelers = (b.travelers.adult || 0) + (b.travelers.child || 0) + (b.travelers.infant || 0);
                } else if (typeof b.travelers === 'number') {
                    computedTravelers = b.travelers;
                }

                return {
                    ...b,
                    computedStatus: getComputedStatus(b),
                    formattedBookingDate: dayjs(b.createdAt).format('MMM D, YYYY'),
                    formattedTravelDate: formattedTravelDate,
                    travelersCountDisplay: computedTravelers
                }
            });

            setBookings(mappedBookings);

        } catch (error) {
            console.error("Booking Error:", error.response?.data || error.message);
            setBookings([])
        } finally {
            setLoading(false)
        }
    }

    useFocusEffect(useCallback(() => { fetchBookings() }, [user?._id]))


    //filter bookings based on search text, status filter, booking date filter, and travel date filter
    const filteredBookings = useMemo(() => {
        return bookings.filter((item) => {
            const needle = searchText.trim().toLowerCase();
            const matchesSearch = !needle ||
                item.reference?.toLowerCase().includes(needle) ||
                (item.packageId?.packageName || '').toLowerCase().includes(needle) ||
                item.computedStatus.toLowerCase().includes(needle);

            const matchesStatus = statusFilter === 'All' || item.computedStatus === statusFilter;
            const matchesBookingDate = !bookingDateFilter || dayjs(item.createdAt).format('YYYY-MM-DD') === bookingDateFilter;

            let matchesTravelDate = true;
            if (travelDateFilter) {
                const formattedFilter = dayjs(travelDateFilter).format('MMM D, YYYY');
                matchesTravelDate = item.formattedTravelDate.includes(formattedFilter);
            }

            return matchesSearch && matchesStatus && matchesBookingDate && matchesTravelDate;
        })
    }, [bookings, searchText, statusFilter, bookingDateFilter, travelDateFilter])


    //image picker for cancellation proof
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


    //handle booking cancellation with validation for reason and image proof
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

            const finalReason = cancelReason === 'Other' ? cancelOtherReason : cancelReason;
            const payload = {
                reason: finalReason,
                comments: cancelComments || '',
                imageProof: `data:${cancelImage.mimeType || 'image/jpeg'};base64,${cancelImage.base64}`
            };

            await api.post(`/booking/cancel/${selectedBookingId}`, payload, withUserHeader(user._id));

            setLoadingCancel(false);
            setCancelModalOpen(false);

            setCancelReason(''); setCancelOtherReason(''); setCancelComments(''); setCancelImage(null);

            Alert.alert("Success", "Cancellation request sent successfully.");
            fetchBookings();
        } catch (error) {
            setLoadingCancel(false);
            Alert.alert("Error", "Unable to cancel booking. Please try again.");
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

                <View style={UserBookingsStyle.searchRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={UserBookingsStyle.filterLabel}>Search</Text>
                        <View style={UserBookingsStyle.searchBar}>
                            <Ionicons name="search" size={16} color="#777" />
                            <TextInput
                                style={UserBookingsStyle.searchInput}
                                placeholder='Search reference, package or status...'
                                placeholderTextColor="#777"
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>
                    </View>


                    <View style={UserBookingsStyle.filterRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={UserBookingsStyle.filterLabel}>Status</Text>
                            <TouchableOpacity style={UserBookingsStyle.dropdownButton} onPress={() => setStatusModalOpen(true)}>
                                <Text style={UserBookingsStyle.dropdownText}>{statusFilter === 'All' ? 'Status' : statusFilter}</Text>
                                <Ionicons name="chevron-down" size={12} color="#305797" />
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={UserBookingsStyle.filterLabel}>Booking Date</Text>
                            <TouchableOpacity
                                style={UserBookingsStyle.dropdownButton}
                                onPress={openBookingDatePicker}
                            >
                                <Text style={UserBookingsStyle.dropdownText}>
                                    {bookingDateFilter
                                        ? dayjs(bookingDateFilter).format('MMM D')
                                        : 'Booking Date'}
                                </Text>

                                <Ionicons
                                    name="calendar-outline"
                                    size={12}
                                    color="#305797"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={UserBookingsStyle.filterLabel}>Travel Date</Text>
                            <TouchableOpacity
                                style={UserBookingsStyle.dropdownButton}
                                onPress={openTravelDatePicker}
                            >
                                <Text style={UserBookingsStyle.dropdownText}>
                                    {travelDateFilter
                                        ? dayjs(travelDateFilter).format('MMM D')
                                        : 'Travel Date'}
                                </Text>

                                <Ionicons
                                    name="airplane-outline"
                                    size={12}
                                    color="#305797"
                                />
                            </TouchableOpacity>
                        </View>


                        {(statusFilter !== 'All' || bookingDateFilter || travelDateFilter) && (
                            <TouchableOpacity onPress={() => { setStatusFilter('All'); setBookingDateFilter(null); setTravelDateFilter(null); }}>
                                <Ionicons name="refresh-circle" size={32} color="#ff4d4f" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

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

                                    <View style={[UserBookingsStyle.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                        <Text style={[UserBookingsStyle.bookingStatus, { color: statusStyle.text, fontWeight: 'bold' }]}>
                                            {item.computedStatus}
                                        </Text>
                                    </View>
                                </View>
                                <View style={UserBookingsStyle.cardBody}>
                                    <Text style={UserBookingsStyle.packageName}>{item.packageId?.packageName || 'Tour Package'}</Text>
                                    <Text style={UserBookingsStyle.detailText}> Travel Date: {item.formattedTravelDate}</Text>
                                    <Text style={UserBookingsStyle.detailText}> Booking Date: {item.formattedBookingDate}</Text>
                                    <Text style={UserBookingsStyle.detailText}> Travelers: {item.travelersCountDisplay}</Text>
                                    <Text style={UserBookingsStyle.detailText}> Package Type: {(item.packageId?.packageType || 'Fixed').toUpperCase()}</Text>
                                </View>
                                <View style={UserBookingsStyle.cardActions}>
                                    <TouchableOpacity style={UserBookingsStyle.viewButton} onPress={() => navigation.navigate('bookinginvoice', { booking: item })}>
                                        <Ionicons name="eye-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                                        <Text style={UserBookingsStyle.viewButtonText}>View</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={UserBookingsStyle.cancelButton} onPress={() => { setSelectedBookingId(item._id); setCancelPolicyModalOpen(true); }}>
                                        <Ionicons name="close-circle-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                                        <Text style={UserBookingsStyle.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            <Modal visible={isStatusModalOpen} transparent animationType="fade">
                <TouchableOpacity style={ModalStyle.modalOverlay} activeOpacity={1} onPress={() => setStatusModalOpen(false)}>
                    <TouchableWithoutFeedback>
                        <View style={[ModalStyle.modalBox, { width: '85%', paddingVertical: 10 }]}>
                            <Text style={{ textAlign: 'center', fontSize: 18, fontFamily: 'Montserrat_700Bold', color: '#305797', marginVertical: 15 }}>
                                Select Status
                            </Text>
                            {['All', 'Not Paid', 'Pending', 'Fully Paid', 'Cancelled'].map((status, index) => (
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

            <Modal
                visible={isBookingDateOpen}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={closeBookingDatePicker}
            >
                <Pressable
                    style={ModalStyle.modalOverlay}
                    onPress={closeBookingDatePicker}
                >
                    <Pressable
                        style={UserBookingsStyle.modalCard}
                        onPress={(event) => event.stopPropagation()}
                    >
                        <View style={UserBookingsStyle.header}>
                            <View style={UserBookingsStyle.headerContent}>
                                <View style={UserBookingsStyle.headerIcon}>
                                    <Ionicons
                                        name="calendar"
                                        size={21}
                                        color="#305797"
                                    />
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={UserBookingsStyle.titleModal}>
                                        Booking Date
                                    </Text>

                                    <Text style={UserBookingsStyle.subtitleModal}>
                                        Choose the date the booking was created
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={UserBookingsStyle.closeButton}
                                onPress={closeBookingDatePicker}
                            >
                                <Ionicons
                                    name="close"
                                    size={21}
                                    color="#64748b"
                                />
                            </TouchableOpacity>
                        </View>

                        <Calendar
                            initialDate={
                                pendingBookingDate ||
                                bookingDateFilter ||
                                dayjs().format('YYYY-MM-DD')
                            }
                            onDayPress={({ dateString }) => {
                                setPendingBookingDate(dateString)
                            }}
                            markedDates={{
                                [pendingBookingDate ||
                                    bookingDateFilter ||
                                    dayjs().format('YYYY-MM-DD')]: {
                                    selected: true,
                                    selectedColor: '#305797',
                                    selectedTextColor: '#ffffff'
                                }
                            }}
                            enableSwipeMonths
                            hideExtraDays
                            renderArrow={(direction) => (
                                <View style={UserBookingsStyle.arrow}>
                                    <Ionicons
                                        name={
                                            direction === 'left'
                                                ? 'chevron-back'
                                                : 'chevron-forward'
                                        }
                                        size={18}
                                        color="#305797"
                                    />
                                </View>
                            )}
                            style={UserBookingsStyle.calendar}
                            theme={{
                                backgroundColor: '#ffffff',
                                calendarBackground: '#ffffff',
                                textSectionTitleColor: '#94a3b8',
                                textDisabledColor: '#d1d5db',
                                dayTextColor: '#334155',
                                monthTextColor: '#1e293b',
                                selectedDayBackgroundColor: '#305797',
                                selectedDayTextColor: '#ffffff',
                                todayTextColor: '#305797',
                                arrowColor: '#305797',
                                textDayFontFamily: 'Roboto_400Regular',
                                textMonthFontFamily: 'Montserrat_700Bold',
                                textDayHeaderFontFamily: 'Roboto_500Medium',
                                textDayFontSize: 14,
                                textMonthFontSize: 16,
                                textDayHeaderFontSize: 12
                            }}
                        />

                        <View style={UserBookingsStyle.selectedDateContainer}>
                            <View style={UserBookingsStyle.selectedDateIcon}>
                                <Ionicons
                                    name="checkmark"
                                    size={17}
                                    color="#305797"
                                />
                            </View>

                            <View>
                                <Text style={UserBookingsStyle.selectedDateLabel}>
                                    Selected date
                                </Text>

                                <Text style={UserBookingsStyle.selectedDateValue}>
                                    {dayjs(
                                        pendingBookingDate ||
                                        bookingDateFilter ||
                                        dayjs().format('YYYY-MM-DD')
                                    ).format('MMMM D, YYYY')}
                                </Text>
                            </View>
                        </View>

                        <View style={UserBookingsStyle.actions}>
                            <TouchableOpacity
                                style={UserBookingsStyle.cancelButtonModal}
                                onPress={closeBookingDatePicker}
                                activeOpacity={0.75}
                            >
                                <Text style={UserBookingsStyle.cancelTextModal}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={UserBookingsStyle.confirmButton}
                                onPress={applyBookingDateFilter}
                                activeOpacity={0.75}
                            >
                                <Ionicons
                                    name="checkmark"
                                    size={18}
                                    color="#ffffff"
                                />

                                <Text style={UserBookingsStyle.confirmText}>
                                    Apply Filter
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal
                visible={isTravelDateOpen}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={closeTravelDatePicker}
            >
                <Pressable
                    style={ModalStyle.modalOverlay}
                    onPress={closeTravelDatePicker}
                >
                    <Pressable
                        style={UserBookingsStyle.modalCard}
                        onPress={(event) => event.stopPropagation()}
                    >
                        <View style={UserBookingsStyle.header}>
                            <View style={UserBookingsStyle.headerContent}>
                                <View style={UserBookingsStyle.headerIcon}>
                                    <Ionicons
                                        name="airplane"
                                        size={21}
                                        color="#305797"
                                    />
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={UserBookingsStyle.titleModal}>
                                        Travel Date
                                    </Text>

                                    <Text style={UserBookingsStyle.subtitleModal}>
                                        Choose a date included in the travel schedule.
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={UserBookingsStyle.closeButton}
                                onPress={closeTravelDatePicker}
                            >
                                <Ionicons
                                    name="close"
                                    size={21}
                                    color="#64748b"
                                />
                            </TouchableOpacity>
                        </View>

                        <Calendar
                            initialDate={
                                pendingTravelDate ||
                                travelDateFilter ||
                                dayjs().format('YYYY-MM-DD')
                            }
                            onDayPress={({ dateString }) => {
                                setPendingTravelDate(dateString)
                            }}
                            markedDates={{
                                [pendingTravelDate ||
                                    travelDateFilter ||
                                    dayjs().format('YYYY-MM-DD')]: {
                                    selected: true,
                                    selectedColor: '#305797',
                                    selectedTextColor: '#ffffff'
                                }
                            }}
                            enableSwipeMonths
                            hideExtraDays
                            renderArrow={(direction) => (
                                <View style={UserBookingsStyle.arrow}>
                                    <Ionicons
                                        name={
                                            direction === 'left'
                                                ? 'chevron-back'
                                                : 'chevron-forward'
                                        }
                                        size={18}
                                        color="#305797"
                                    />
                                </View>
                            )}
                            style={UserBookingsStyle.calendar}
                            theme={{
                                backgroundColor: '#ffffff',
                                calendarBackground: '#ffffff',
                                textSectionTitleColor: '#94a3b8',
                                textDisabledColor: '#d1d5db',
                                dayTextColor: '#334155',
                                monthTextColor: '#1e293b',
                                selectedDayBackgroundColor: '#305797',
                                selectedDayTextColor: '#ffffff',
                                todayTextColor: '#305797',
                                arrowColor: '#305797',
                                textDayFontFamily: 'Roboto_400Regular',
                                textMonthFontFamily: 'Montserrat_700Bold',
                                textDayHeaderFontFamily: 'Roboto_500Medium',
                                textDayFontSize: 14,
                                textMonthFontSize: 16,
                                textDayHeaderFontSize: 12
                            }}
                        />

                        <View style={UserBookingsStyle.selectedDateContainer}>
                            <View style={UserBookingsStyle.selectedDateIcon}>
                                <Ionicons
                                    name="checkmark"
                                    size={17}
                                    color="#305797"
                                />
                            </View>

                            <View>
                                <Text style={UserBookingsStyle.selectedDateLabel}>
                                    Selected date
                                </Text>

                                <Text style={UserBookingsStyle.selectedDateValue}>
                                    {dayjs(
                                        pendingTravelDate ||
                                        travelDateFilter ||
                                        dayjs().format('YYYY-MM-DD')
                                    ).format('MMMM D, YYYY')}
                                </Text>
                            </View>
                        </View>

                        <View style={UserBookingsStyle.actions}>
                            <TouchableOpacity
                                style={UserBookingsStyle.cancelButtonModal}
                                onPress={closeTravelDatePicker}
                                activeOpacity={0.75}
                            >
                                <Text style={UserBookingsStyle.cancelTextModal}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={UserBookingsStyle.confirmButton}
                                onPress={applyTravelDateFilter}
                                activeOpacity={0.75}
                            >
                                <Ionicons
                                    name="checkmark"
                                    size={18}
                                    color="#ffffff"
                                />

                                <Text style={UserBookingsStyle.confirmText}>
                                    Apply Filter
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal transparent visible={isCancelPolicyModalOpen} animationType="fade">
                <TouchableOpacity style={ModalStyle.modalOverlay} activeOpacity={1} onPress={() => setCancelPolicyModalOpen(false)}>
                    <TouchableWithoutFeedback>
                        <View style={[ModalStyle.modalBox, { width: '90%', padding: 24, position: 'relative' }]}>
                            <TouchableOpacity
                                onPress={() => setCancelPolicyModalOpen(false)}
                                style={{ position: 'absolute', top: 14, right: 14, padding: 4 }}
                            >
                                <Ionicons name="close" size={22} color="#b3b3b3" />
                            </TouchableOpacity>

                            <Text style={[ModalStyle.modalTitle, { color: '#305797', fontSize: 20, textAlign: 'center', marginBottom: 10 }]}>Continue Cancellation?</Text>
                            <Text style={[ModalStyle.modalText, { marginBottom: 14, textAlign: 'center', color: '#555', lineHeight: 22 }]}>Please review our cancellation policy before proceeding.</Text>
                            <Text style={[ModalStyle.modalText, { marginBottom: 12, textAlign: 'center', color: '#555', lineHeight: 22 }]}>All tour packages will not be converted to any travel funds in case the tour will not push through whether it be government mandated, due to natural calamities, etc. Tour package purchase is non-refundable, non-reroutable, non-rebookable, and non-transferable unless otherwise stated and is due to natural calamities and force majeure that is beyond our control otherwise NON-REFUNDABLE.</Text>
                            <Text style={{ fontSize: 13, fontStyle: 'italic', color: '#ff4d4f', textAlign: 'center', marginBottom: 18, lineHeight: 20 }}>Note: Cancellation of bookings is allowed but will be subject for reviewing and approval.</Text>

                            <View style={ModalStyle.modalButtonContainer}>
                                <TouchableOpacity style={[ModalStyle.modalButton, { backgroundColor: '#305797', flex: 1, marginRight: 5 }]} onPress={() => { setCancelPolicyModalOpen(false); setCancelModalOpen(true); }}>
                                    <Text style={ModalStyle.modalButtonText}>Continue</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[ModalStyle.modalButton, { backgroundColor: '#9E2847', flex: 1, marginLeft: 5 }]} onPress={() => setCancelPolicyModalOpen(false)}>
                                    <Text style={ModalStyle.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            <Modal transparent visible={isCancelModalOpen} animationType="fade">
                <TouchableOpacity style={ModalStyle.modalOverlay} activeOpacity={1} onPress={() => { if (!loadingCancel) setCancelModalOpen(false) }}>
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

                                    {cancelReason === 'Other' && (
                                        <TextInput
                                            style={{ width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10, fontFamily: 'Roboto_400Regular' }}
                                            placeholder="Please specify"
                                            value={cancelOtherReason}
                                            onChangeText={setCancelOtherReason}
                                        />
                                    )}

                                    <TextInput
                                        style={{ width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15, fontFamily: 'Roboto_400Regular', height: 80, textAlignVertical: 'top' }}
                                        placeholder="Additional comments (optional)"
                                        multiline
                                        value={cancelComments}
                                        onChangeText={setCancelComments}
                                    />

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

                                    <View style={ModalStyle.modalButtonContainer}>
                                        <TouchableOpacity style={[ModalStyle.modalButton, { backgroundColor: '#305797', flex: 1, marginRight: 5 }]} onPress={() => { setCancelModalOpen(false); setCancelImage(null); setCancelReason(''); setCancelOtherReason(''); setCancelComments(''); }}>
                                            <Text style={ModalStyle.modalButtonText}>Keep Booking</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[ModalStyle.modalButton, { backgroundColor: '#8B0000', flex: 1, marginLeft: 5 }]} onPress={handleCancelBooking}>
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