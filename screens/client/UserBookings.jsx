import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import UserBookingsStyle from '../../styles/clientstyles/UserBookingsStyle'
import ModalStyle from '../../styles/componentstyles/ModalStyle'
import { api, withUserHeader } from '../../utils/api'
import { useUser } from '../../context/UserContext'



export default function UserBookings() {

    const cs = useNavigation()
    const { user } = useUser()
    const [isSidebarVisible, setSidebarVisible] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [modalOkVisible, setModalOkVisible] = useState(false)
    const [selectedBookingId, setSelectedBookingId] = useState(null)
    const [searchText, setSearchText] = useState('')

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })

    const [getBookings, setBookings] = useState([])

    const fetchBookings = async () => {
        if (!user?._id) {
            setBookings([])
            return
        }

        try {
            const response = await api.get('/booking/my-bookings', withUserHeader(user._id))
            setBookings(response.data || [])
        } catch (_error) {
            setBookings([])
        }
    }

    useEffect(() => {
        fetchBookings()
    }, [user?._id])

    const filteredBookings = useMemo(() => {
        if (!searchText.trim()) return getBookings

        const needle = searchText.trim().toLowerCase()
        return getBookings.filter((item) => {
            const reference = item.reference?.toLowerCase() || ''
            const packageName = item.bookingDetails?.packageName?.toLowerCase() || ''
            const status = item.status?.toLowerCase() || ''
            return reference.includes(needle) || packageName.includes(needle) || status.includes(needle)
        })
    }, [getBookings, searchText])

    const modalOK = () => {
        setModalOkVisible(false)
        fetchBookings()
    }

    const handleCancelBooking = async () => {
        if (!selectedBookingId || !user?._id) return

        try {
            await api.post(`/booking/cancel/${selectedBookingId}`, { reason: 'User requested cancellation' }, withUserHeader(user._id))
            setModalVisible(false)
            setModalOkVisible(true)
        } catch (_error) {
            setModalVisible(false)
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => { setSidebarVisible(true) }} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <View style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={UserBookingsStyle.container}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={UserBookingsStyle.title}>My Bookings</Text>

                    <View style={UserBookingsStyle.searchRow}>
                        <View style={UserBookingsStyle.searchBar}>
                            <Ionicons name="search" size={16} />
                            <TextInput
                                style={UserBookingsStyle.searchInput}
                                placeholder='Search booking reference'
                                placeholderTextColor="#777"
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>

                        <View style={UserBookingsStyle.dropdownGroup}>
                            <View style={UserBookingsStyle.dropdownButton}>
                                <Text style={UserBookingsStyle.dropdownText}>Status</Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={12}
                                    color="#305797"
                                />
                            </View>

                            <View style={UserBookingsStyle.dropdownButton}>
                                <Text style={UserBookingsStyle.dropdownText}>Date</Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={12}
                                    color="#305797"
                                />
                            </View>
                        </View>
                    </View>

                    {filteredBookings.map((item) => (
                        <View key={item._id} style={UserBookingsStyle.bookingCard}>

                            <View style={UserBookingsStyle.cardHeader}>
                                <Text style={UserBookingsStyle.bookingRef}>{item.reference}</Text>
                                <Text style={UserBookingsStyle.bookingStatus}>{item.status || 'Successful'}</Text>
                            </View>

                            <View style={UserBookingsStyle.cardBody}>
                                <Text style={UserBookingsStyle.packageName}>{item.bookingDetails?.packageName || 'Package'}</Text>

                                <View style={UserBookingsStyle.detailRow}>
                                    <Text style={UserBookingsStyle.detailLabel}>Travelers:</Text>
                                    <Text style={UserBookingsStyle.detailValue}>{item.bookingDetails?.travelers || 0}</Text>
                                </View>

                                <View style={UserBookingsStyle.detailRow}>
                                    <Text style={UserBookingsStyle.detailLabel}>Travel Date:</Text>
                                    <Text style={UserBookingsStyle.detailValue}>{item.bookingDetails?.travelDate || '--'}</Text>
                                </View>

                                <View style={UserBookingsStyle.detailRow}>
                                    <Text style={UserBookingsStyle.detailLabel}>Total Amount:</Text>
                                    <Text style={UserBookingsStyle.price}>₱{item.bookingDetails?.totalPrice || 0}</Text>
                                </View>
                            </View>

                            <View style={UserBookingsStyle.cardActions}>
                                <TouchableOpacity
                                    style={UserBookingsStyle.viewButton}
                                    onPress={() => cs.navigate('bookinginvoice', { booking: item })}
                                >
                                    <Text style={UserBookingsStyle.buttonText}>View Details</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={UserBookingsStyle.cancelButton}
                                    onPress={() => {
                                        setSelectedBookingId(item._id)
                                        setModalVisible(true)
                                    }}
                                >
                                    <Text style={UserBookingsStyle.buttonText}>Cancel Booking</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    ))}

                </ScrollView>
            </View>

            <Modal
                transparent
                animationType='fade'
                visible={modalVisible}
                onRequestClose={() => { setModalVisible }}
            >

                <View style={ModalStyle.modalOverlay}>
                    <View style={ModalStyle.modalBox}>
                        <Text style={ModalStyle.modalTitle}>Cancel Booking</Text>
                        <Text style={ModalStyle.modalText}>Are you sure you want to cancel this booking?</Text>

                        <View style={ModalStyle.modalButtonContainer}>
                            <TouchableOpacity
                                style={ModalStyle.modalButton}
                                onPress={handleCancelBooking}
                            >
                                <Text style={ModalStyle.modalButtonText}>Yes</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={ModalStyle.modalCancelButton}
                                onPress={() => {
                                    setModalVisible(false)
                                }}
                            >
                                <Text style={ModalStyle.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                transparent
                animationType='fade'
                visible={modalOkVisible}
                onRequestClose={() => { setModalOkVisible }}
            >

                <View style={ModalStyle.modalOverlay}>
                    <View style={ModalStyle.modalBox}>
                        <Text style={ModalStyle.modalTitle}>Cancel Request</Text>
                        <Text style={ModalStyle.modalText}>A cancellation request for the booking has been sent!</Text>


                        <TouchableOpacity
                            style={ModalStyle.modalButton}
                            onPress={() => {
                                modalOK()
                            }}
                        >
                            <Text style={ModalStyle.modalButtonText}>OK</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>
        </View>

    )
}
