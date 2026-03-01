import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import Header from '../../components/Header'
import BookingManagementStyle from '../../styles/adminstyles/BookingManagementStyle'
import ModalStyle from '../../styles/componentstyles/ModalStyle'


export default function BookingManagement() {

    const [isSidebarVisible, setSidebarVisible] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [modalOkVisible, setModalOkVisible] = useState(false)

    const [getBookings, setBookings] = useState([
        { id: "1", ref: "BR-0001", package: "Boracay Tour", pax: "4", date: "09-14-2026", amount: 70000 },
    ])

    const modalOK = () => {
        setModalOkVisible(false)
    }

    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => { setSidebarVisible(true) }} />

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
                                    <Text style={BookingManagementStyle.cardValue}>25</Text>
                                </View>
                                <Text style={BookingManagementStyle.cardLabel}>Total Packages</Text>
                            </View>
                            <View style={BookingManagementStyle.card}>
                                <View style={BookingManagementStyle.valueRow}>
                                    <Text style={BookingManagementStyle.cardValue}>12</Text>
                                </View>
                                <Text style={BookingManagementStyle.cardLabel}>Available Packages</Text>
                            </View>
                        </View>
                    </View>

                    <View style={BookingManagementStyle.searchRow}>
                        <View style={BookingManagementStyle.searchBar}>
                            <Ionicons name="search" size={16} />
                            <TextInput
                                style={BookingManagementStyle.searchInput}
                                placeholder='Search booking reference'
                                placeholderTextColor="#777"
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

                    {getBookings.map((item) => (
                        <View key={item.id} style={BookingManagementStyle.bookingCard}>

                            <View style={BookingManagementStyle.cardHeader}>
                                <Text style={BookingManagementStyle.bookingRef}>{item.ref}</Text>
                                <Text style={BookingManagementStyle.bookingStatus}>Confirmed</Text>
                            </View>

                            <View style={BookingManagementStyle.cardBody}>
                                <Text style={BookingManagementStyle.packageName}>{item.package}</Text>

                                <View style={BookingManagementStyle.detailRow}>
                                    <Text style={BookingManagementStyle.detailLabel}>Travelers:</Text>
                                    <Text style={BookingManagementStyle.detailValue}>{item.pax}</Text>
                                </View>

                                <View style={BookingManagementStyle.detailRow}>
                                    <Text style={BookingManagementStyle.detailLabel}>Travel Date:</Text>
                                    <Text style={BookingManagementStyle.detailValue}>{item.date}</Text>
                                </View>

                                <View style={BookingManagementStyle.detailRow}>
                                    <Text style={BookingManagementStyle.detailLabel}>Total Amount:</Text>
                                    <Text style={BookingManagementStyle.price}>₱{item.price}</Text>
                                </View>
                            </View>

                            <View style={BookingManagementStyle.cardActions}>
                                <TouchableOpacity
                                    style={BookingManagementStyle.viewButton}
                                    onPress={() => cs.navigate("bookinginvoice")}
                                >
                                    <Text style={BookingManagementStyle.buttonText}>View Details</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={BookingManagementStyle.cancelButton}
                                    onPress={() => setModalVisible(true)}
                                >
                                    <Text style={BookingManagementStyle.buttonText}>Cancel Booking</Text>
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
                        <Text style={ModalStyle.modalTitle}>Remove Booking</Text>
                        <Text style={ModalStyle.modalText}>Are you sure you want to remove this Booking?</Text>

                        <View style={ModalStyle.modalButtonContainer}>
                            <TouchableOpacity
                                style={ModalStyle.modalButton}
                                onPress={() => {
                                    setModalVisible(false)
                                }}
                            >
                                <Text style={ModalStyle.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={ModalStyle.modalCancelButton}
                                onPress={() => {
                                    setModalVisible(false)
                                    setModalOkVisible(true)
                                }}
                            >
                                <Text style={ModalStyle.modalButtonText}>Remove</Text>
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
                        <Text style={ModalStyle.modalTitle}>Remove Successful</Text>
                        <Text style={ModalStyle.modalText}>You have removed the booking successfully!</Text>


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