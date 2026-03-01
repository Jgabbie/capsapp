import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import UserBookingsStyle from '../../styles/clientstyles/UserBookingsStyle'
import ModalStyle from '../../styles/componentstyles/ModalStyle'



export default function UserBookings() {

    const cs = useNavigation()
    const [isSidebarVisible, setSidebarVisible] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [modalOkVisible, setModalOkVisible] = useState(false)

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })

    const [getBookings, setBookings] = useState([
        { id: "1", ref: "BR-0001", package: "Boracay Tour", pax: "4", date: "09-14-2026", price: 70000 },
    ])

    const modalOK = () => {
        setModalOkVisible(false)
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

                    {getBookings.map((item) => (
                        <View key={item.id} style={UserBookingsStyle.bookingCard}>

                            <View style={UserBookingsStyle.cardHeader}>
                                <Text style={UserBookingsStyle.bookingRef}>{item.ref}</Text>
                                <Text style={UserBookingsStyle.bookingStatus}>Confirmed</Text>
                            </View>

                            <View style={UserBookingsStyle.cardBody}>
                                <Text style={UserBookingsStyle.packageName}>{item.package}</Text>

                                <View style={UserBookingsStyle.detailRow}>
                                    <Text style={UserBookingsStyle.detailLabel}>Travelers:</Text>
                                    <Text style={UserBookingsStyle.detailValue}>{item.pax}</Text>
                                </View>

                                <View style={UserBookingsStyle.detailRow}>
                                    <Text style={UserBookingsStyle.detailLabel}>Travel Date:</Text>
                                    <Text style={UserBookingsStyle.detailValue}>{item.date}</Text>
                                </View>

                                <View style={UserBookingsStyle.detailRow}>
                                    <Text style={UserBookingsStyle.detailLabel}>Total Amount:</Text>
                                    <Text style={UserBookingsStyle.price}>₱{item.price}</Text>
                                </View>
                            </View>

                            <View style={UserBookingsStyle.cardActions}>
                                <TouchableOpacity
                                    style={UserBookingsStyle.viewButton}
                                    onPress={() => cs.navigate("bookinginvoice")}
                                >
                                    <Text style={UserBookingsStyle.buttonText}>View Details</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={UserBookingsStyle.cancelButton}
                                    onPress={() => setModalVisible(true)}
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
                                onPress={() => {
                                    setModalVisible(false)
                                    setModalOkVisible(true)
                                }}
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
