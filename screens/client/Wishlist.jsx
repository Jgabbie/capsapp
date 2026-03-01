import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, Modal } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import Chatbot from '../../components/Chatbot'
import WishlistStyle from '../../styles/clientstyles/WishlistStyle'
import ModalStyle from '../../styles/componentstyles/ModalStyle'

export default function Wishlist() {

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

    const [packages, setBookings] = useState([
        { id: "1", image: require('../../assets/images/kyotojapan.jpg'), packageName: "Japan Tour Package", oldprice: "₱70000", newprice: "₱49000", discount: "30%" },
        { id: "2", image: require('../../assets/images/southkorea_image.png'), packageName: "Korea Tour Package", oldprice: "₱92000", newprice: "₱64400", discount: "30%" },
    ])

    const modalOK = () => {
        setModalOkVisible(false)
    }

    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <View>
                <ScrollView
                    contentContainerStyle={WishlistStyle.container}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={WishlistStyle.title}>My Wishlist</Text>

                    <View style={WishlistStyle.searchRow}>
                        <View style={WishlistStyle.searchBar}>
                            <Ionicons name="search" size={16} />
                            <TextInput
                                style={WishlistStyle.searchInput}
                                placeholder="Search packages"
                                placeholderTextColor="#777"
                            />
                        </View>

                        <View style={WishlistStyle.dropdownGroup}>
                            <View style={WishlistStyle.dropdownButton}>
                                <Text style={WishlistStyle.dropdownText}>Activities</Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={12}
                                    color="#305797"
                                />
                            </View>

                            <View style={WishlistStyle.dropdownButton}>
                                <Text style={WishlistStyle.dropdownText}>Duration</Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={12}
                                    color="#305797"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Package Cards */}
                    {packages.map((item) => (
                        <View key={item.id} style={WishlistStyle.card}>
                            <Image
                                style={WishlistStyle.cardImage}
                                source={item.image}
                                resizeMode="contain"
                            />

                            <View style={WishlistStyle.cardContent}>
                                <Text style={WishlistStyle.packageName}>
                                    {item.packageName}
                                </Text>

                                <View style={WishlistStyle.priceRow}>
                                    <Text style={WishlistStyle.oldPrice}>{item.oldprice}</Text>
                                    <Text style={WishlistStyle.newPrice}>{item.newprice}</Text>
                                    <Text style={WishlistStyle.discount}>
                                        {item.discount} OFF
                                    </Text>
                                </View>

                                <View style={WishlistStyle.buttonRow}>
                                    <TouchableOpacity
                                        style={WishlistStyle.viewButton}
                                        onPress={() => cs.navigate("packages")}
                                    >
                                        <Text style={WishlistStyle.viewButtonText}>View</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={WishlistStyle.removeButton}
                                        onPress={() => setModalVisible(true)}
                                    >
                                        <Text style={WishlistStyle.viewButtonText}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>


            <Chatbot />

            <Modal
                transparent
                animationType='fade'
                visible={modalVisible}
                onRequestClose={() => { setModalVisible }}
            >

                <View style={ModalStyle.modalOverlay}>
                    <View style={ModalStyle.modalBox}>
                        <Text style={ModalStyle.modalTitle}>Remove Package</Text>
                        <Text style={ModalStyle.modalText}>Are you sure you want to remove this package from you Wishlist?</Text>

                        <View style={ModalStyle.modalButtonContainer}>
                            <TouchableOpacity
                                style={ModalStyle.modalButton}
                                onPress={() => {
                                    setModalVisible(false)
                                    setModalOkVisible(true)
                                }}
                            >
                                <Text style={ModalStyle.modalButtonText}>Remove</Text>
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
                        <Text style={ModalStyle.modalTitle}>Package Removed</Text>
                        <Text style={ModalStyle.modalText}>Package has been successfully removed from your Wishlist!</Text>


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
        </View >
    )
}