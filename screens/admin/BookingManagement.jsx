import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native'
import Header from '../../components/Header'
import AdminSidebar from '../../components/AdminSidebar'
import BookingManagementStyle from '../../styles/adminstyles/BookingManagementStyle'
import ModalStyle from '../../styles/componentstyles/ModalStyle'
import { api, withUserHeader } from '../../utils/api'
import { useUser } from '../../context/UserContext'


export default function BookingManagement() {
    const navigation = useNavigation()
    const { user } = useUser()
    const [isSidebarVisible, setSidebarVisible] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [searchText, setSearchText] = useState('')

    const [getBookings, setBookings] = useState([])

    const fetchBookings = async () => {
        if (!user?._id) {
            setBookings([])
            return
        }

        try {
            const response = await api.get('/booking/all-bookings', withUserHeader(user._id))
            setBookings(response.data || [])
        } catch (error) {
            setBookings([])
            Alert.alert('Error', error.response?.data?.message || 'Unable to load bookings')
        }
    }

    useEffect(() => {
        fetchBookings()
    }, [user?._id])

    const filteredBookings = useMemo(() => {
        const needle = searchText.trim().toLowerCase()
        const successfulOnly = getBookings.filter((item) => String(item.status || '').toLowerCase() === 'successful')
        if (!needle) return successfulOnly

        return successfulOnly.filter((item) => {
            const reference = item.reference?.toLowerCase() || ''
            const packageName = item.bookingDetails?.packageName?.toLowerCase() || ''
            const status = item.status?.toLowerCase() || ''
            return reference.includes(needle) || packageName.includes(needle) || status.includes(needle)
        })
    }, [getBookings, searchText])

    const totalBookings = getBookings.length
    const successfulBookings = getBookings.filter((item) => String(item.status || '').toLowerCase() === 'successful').length

    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => { setSidebarVisible(true) }} />
            <AdminSidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <View style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={BookingManagementStyle.container}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={BookingManagementStyle.title}>User Bookings</Text>

                    <View style={BookingManagementStyle.statsContainer}>
                        <View style={BookingManagementStyle.statsRow}>
                            <View style={BookingManagementStyle.card}>
                                <View style={BookingManagementStyle.valueRow}>
                                    <Text style={BookingManagementStyle.cardValue}>{totalBookings}</Text>
                                </View>
                                <Text style={BookingManagementStyle.cardLabel}>Total Bookings</Text>
                            </View>
                            <View style={BookingManagementStyle.card}>
                                <View style={BookingManagementStyle.valueRow}>
                                    <Text style={BookingManagementStyle.cardValue}>{successfulBookings}</Text>
                                </View>
                                <Text style={BookingManagementStyle.cardLabel}>Successful Bookings</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ color: '#305797', fontWeight: '700' }}>{totalBookings} bookings found</Text>
                    </View>

                    <View style={BookingManagementStyle.searchRow}>
                        <View style={BookingManagementStyle.searchBar}>
                            <Ionicons name="search" size={16} />
                            <TextInput
                                style={BookingManagementStyle.searchInput}
                                placeholder='Search booking reference'
                                placeholderTextColor="#777"
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>

                        <View style={BookingManagementStyle.dropdownGroup}>
                            <View style={BookingManagementStyle.dropdownButton}>
                                <Text style={BookingManagementStyle.dropdownText}>Status</Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={12}
                                    color="#305797"
                                />
                            </View>

                            <View style={BookingManagementStyle.dropdownButton}>
                                <Text style={BookingManagementStyle.dropdownText}>Date</Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={12}
                                    color="#305797"
                                />
                            </View>
                        </View>
                    </View>

                    {filteredBookings.map((item) => (
                        <View key={item._id} style={BookingManagementStyle.bookingCard}>

                            <View style={BookingManagementStyle.cardHeader}>
                                <Text style={BookingManagementStyle.bookingRef}>{item.reference}</Text>
                                <Text style={BookingManagementStyle.bookingStatus}>{item.status || 'Successful'}</Text>
                            </View>

                            <View style={BookingManagementStyle.cardBody}>
                                <Text style={BookingManagementStyle.packageName}>{item.bookingDetails?.packageName || 'Package'}</Text>

                                <View style={BookingManagementStyle.detailRow}>
                                    <Text style={BookingManagementStyle.detailLabel}>Travelers:</Text>
                                    <Text style={BookingManagementStyle.detailValue}>{item.bookingDetails?.travelers || 0}</Text>
                                </View>

                                <View style={BookingManagementStyle.detailRow}>
                                    <Text style={BookingManagementStyle.detailLabel}>Travel Date:</Text>
                                    <Text style={BookingManagementStyle.detailValue}>{item.bookingDetails?.travelDate || '--'}</Text>
                                </View>

                                <View style={BookingManagementStyle.detailRow}>
                                    <Text style={BookingManagementStyle.detailLabel}>Total Amount:</Text>
                                    <Text style={BookingManagementStyle.price}>₱{item.bookingDetails?.totalPrice || 0}</Text>
                                </View>
                            </View>

                            <View style={BookingManagementStyle.cardActions}>
                                <TouchableOpacity
                                    style={BookingManagementStyle.viewButton}
                                    onPress={() => navigation.navigate("bookinginvoice", { booking: item, source: "admin" })}
                                >
                                    <Text style={BookingManagementStyle.buttonText}>View Details</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={BookingManagementStyle.cancelButton}
                                    onPress={() => setModalVisible(true)}
                                >
                                    <Text style={BookingManagementStyle.buttonText}>Close</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    ))}

                    {filteredBookings.length === 0 && (
                        <Text style={{ color: '#666', marginTop: 8 }}>No bookings found.</Text>
                    )}

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
                        <Text style={ModalStyle.modalTitle}>Booking Management</Text>
                        <Text style={ModalStyle.modalText}>Use View Details to see booking summary and invoice.</Text>

                        <View style={ModalStyle.modalButtonContainer}>
                            <TouchableOpacity
                                style={ModalStyle.modalButton}
                                onPress={() => {
                                    setModalVisible(false)
                                }}
                            >
                                <Text style={ModalStyle.modalButtonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}