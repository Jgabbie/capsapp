import { View, Text, Image, TouchableOpacity, Modal, Pressable } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import AdminSidebarStyle from '../styles/componentstyles/AdminSidebarStyle'
import ModalStyle from '../styles/componentstyles/ModalStyle'

const AdminSidebar = ({ visible, onClose }) => {

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold,
        Roboto_400Regular, Roboto_500Medium, Roboto_700Bold
    })

    const cs = useNavigation();
    const [modalVisible, setModalVisible] = useState(false)

    const MenuItem = ({ title, onPress }) => (
        <TouchableOpacity style={AdminSidebarStyle.navItem} onPress={onPress}>
            <Text style={[AdminSidebarStyle.navText]}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <Modal transparent={true} visible={visible} animationType="none">
            <View style={{ flex: 1 }}>
                <Pressable style={AdminSidebarStyle.overlay} onPress={onClose}>
                    <View style={AdminSidebarStyle.sidebarContainer}>

                        <View style={AdminSidebarStyle.profileSection}>
                            <Image source={require('../assets/images/profile_icon60.png')} style={AdminSidebarStyle.profileImg} />
                            <View style={AdminSidebarStyle.nameContainer}>
                                <Text style={AdminSidebarStyle.userName}>Juan Gabriel A. Lanuza</Text>
                                <Text style={AdminSidebarStyle.userHandle}>jgablanuza@gmail.com</Text>
                            </View>
                        </View>

                        <View style={AdminSidebarStyle.divider} />

                        <MenuItem title="Dashboard" onPress={() => {
                            onClose()
                            cs.navigate("admindashboard")
                        }}
                        />
                        <MenuItem title="User Management" onPress={() => {
                            onClose()
                            cs.navigate("usermanagement")
                        }}

                        />
                        <MenuItem title="Booking Management" onPress={() => {
                            onClose()
                            cs.navigate("bookingmanagement")
                        }}
                        />
                        <MenuItem title="Transaction Management" onPress={() => {
                            onClose()
                            cs.navigate("transactionmanagement")
                        }}
                        />
                        <MenuItem title="Package Management" onPress={() => {
                            onClose()
                            cs.navigate("packagemanagement")
                        }}
                        />
                        <MenuItem title="Cancellation Requests" onPress={() => {
                            onClose()
                            cs.navigate("cancellationrequests")
                        }}
                        />
                        <MenuItem title="Review and Ratings" onPress={() => {
                            onClose()
                            cs.navigate("reviewmanagement")
                        }}
                        />
                        <MenuItem title="Passport Applications" onPress={() => {
                            onClose()
                            cs.navigate("passportapplications")
                        }}
                        />
                        <MenuItem title="VISA Applications" onPress={() => {
                            onClose()
                            cs.navigate("visaapplications")
                        }}
                        />
                        <MenuItem title="Logging" onPress={() => {
                            onClose()
                            cs.navigate("logging")
                        }}
                        />
                        <MenuItem title="Auditing" onPress={() => {
                            onClose()
                            cs.navigate("auditing")
                        }}
                        />

                        <View style={AdminSidebarStyle.divider} />

                        <MenuItem title="Logout"
                            onPress={() => {
                                setModalVisible(true)
                            }}
                        />
                    </View>

                    <Modal
                        transparent
                        animationType='fade'
                        visible={modalVisible}
                        onRequestClose={() => { setModalVisible }}
                    >

                        <View style={ModalStyle.modalOverlay}>
                            <View style={ModalStyle.modalBox}>
                                <Text style={ModalStyle.modalTitle}>Confirm Logout</Text>
                                <Text style={ModalStyle.modalText}>Are you sure you want to Logout?</Text>

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
                                            onClose()
                                            cs.navigate("login")
                                        }}
                                    >
                                        <Text style={ModalStyle.modalButtonText}>Logout</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </Pressable>
            </View>
        </Modal>
    );
};

export default AdminSidebar;