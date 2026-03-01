import { View, Text, TextInput, TouchableOpacity, Image, Modal, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useFonts } from 'expo-font'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from "@expo-google-fonts/montserrat"
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from "@expo-google-fonts/roboto"
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import ModalStyle from '../../styles/componentstyles/ModalStyle'
import ProfileStyle from '../../styles/clientstyles/ProfileStyle'
import axios from 'axios'


export default function Profile() {
    const [editing, setEditing] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [saveModalVisible, setSaveModalVisible] = useState(false)
    const [isSidebarVisible, setSidebarVisible] = useState(false);

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })

    const [userData, setUserData] = useState({
        _id: "",
        username: "",
        firstname: "",
        lastname: "",
        email: "",
        phonenum: "",
        address: "",
        gender: ""
    })

    const updateUserProfile = async () => {
        try {
            const response = await axios.put(
                `http://10.0.2.2:5000/api/users/${userData._id}`,
                {
                    username: userData.username,
                    email: userData.email,
                    firstname: userData.firstname,
                    lastname: userData.lastname,
                    phonenum: userData.phonenum,
                }
            )

            if (response.data.success) {
                setUserData(response.data.user)
                setEditing(false)
                setModalVisible(false)
                setSaveModalVisible(true)
            }

        } catch (error) {
            console.log("Update Error:", error.response?.data || error.message)
        }
    }

    const handleSavePress = () => {
        if (editing) {
            setModalVisible(true)
        } else {
            setEditing(true)
        }
    }

    const confirmSave = () => {
        updateUserProfile()
    }

    const cancelSave = () => {
        setModalVisible(false)
    }

    const modalOK = () => {
        setEditing(false)
        setSaveModalVisible(false)
    }

    return (
        <ScrollView style={{ flex: 1 }}>
            <Header openSidebar={() => { setSidebarVisible(true) }} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <View style={ProfileStyle.container}>

                <View style={ProfileStyle.profileImageContainer}>
                    <Image
                        source={require("../../assets/images/profile_picture.png")}
                        style={ProfileStyle.profileImage}
                    />
                </View>

                <Text style={ProfileStyle.profileHeading}>Personal Information</Text>
                <Text style={ProfileStyle.profileLabel}>Username</Text>
                <TextInput value={userData.username} editable={editing} onChangeText={(e) => setUserData({ ...userData, username: e })} style={ProfileStyle.profileInputs}></TextInput>

                <View style={ProfileStyle.fullNameContainer}>
                    <View>
                        <Text style={ProfileStyle.profileLabel} >First Name</Text>
                        <TextInput value={userData.firstname} editable={editing} onChangeText={(e) => setUserData({ ...userData, firstname: e })} style={ProfileStyle.nameInputs}></TextInput>
                    </View>

                    <View>
                        <Text style={ProfileStyle.profileLabel}>Last Name</Text>
                        <TextInput value={userData.lastname} editable={editing} onChangeText={(e) => setUserData({ ...userData, lastname: e })} style={ProfileStyle.nameInputs}></TextInput>
                    </View>
                </View>

                <Text style={ProfileStyle.profileLabel}>Email</Text>
                <TextInput value={userData.email} editable={editing} onChangeText={(e) => setUserData({ ...userData, email: e })} style={ProfileStyle.profileInputs}></TextInput>

                <Text style={ProfileStyle.profileLabel}>Phone Number</Text>
                <TextInput value={userData.phonenum} editable={editing} onChangeText={(e) => setUserData({ ...userData, phonenum: e })} style={ProfileStyle.profileInputs}></TextInput>

                <Text style={ProfileStyle.profileLabel}>Address</Text>
                <TextInput value={userData.address || ""} editable={editing} onChangeText={(e) => setUserData({ ...userData, address: e })} style={ProfileStyle.profileInputs}></TextInput>

                <Text style={ProfileStyle.profileLabel}>Gender</Text>
                <TextInput value={userData.gender || ""} editable={editing} onChangeText={(e) => setUserData({ ...userData, gender: e })} style={ProfileStyle.profileInputs}></TextInput>

                <TouchableOpacity style={ProfileStyle.profileButton} >
                    <Text style={ProfileStyle.profileButtonText} onPress={() => { handleSavePress() }}>
                        {editing ? "Save Profile" : "Edit Profile"}
                    </Text>
                </TouchableOpacity>

                <Modal
                    transparent
                    animationType='fade'
                    visible={modalVisible}
                    onRequestClose={() => { setModalVisible(false) }}
                >

                    <View style={ModalStyle.modalOverlay}>
                        <View style={ModalStyle.modalBox}>
                            <Text style={ModalStyle.modalTitle}>Confirm Changes</Text>
                            <Text style={ModalStyle.modalText}>Are you sure you want to save these changes?</Text>

                            <View style={ModalStyle.modalButtonContainer}>
                                <TouchableOpacity
                                    style={ModalStyle.modalButton}
                                    onPress={() => {
                                        confirmSave()
                                    }}
                                >
                                    <Text style={ModalStyle.modalButtonText}>Save</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={ModalStyle.modalCancelButton}
                                    onPress={() => {
                                        cancelSave()
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
                    visible={saveModalVisible}
                    onRequestClose={() => { setSaveModalVisible(false) }}
                >

                    <View style={ModalStyle.modalOverlay}>
                        <View style={ModalStyle.modalBox}>
                            <Text style={ModalStyle.modalTitle}>Change Successful</Text>
                            <Text style={ModalStyle.modalText}>Your profile changes has been changed and saved successfully!</Text>


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
        </ScrollView>
    )
}