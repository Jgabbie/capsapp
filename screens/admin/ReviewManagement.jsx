import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, Modal } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import Header from '../../components/Header'
import AdminSidebar from '../../components/AdminSidebar'
import ReviewManagementStyles from '../../styles/adminstyles/ReviewManagementStyles'
import ModalStyle from '../../styles/componentstyles/ModalStyle'

export default function ReviewManagement() {

    const [isSidebarVisible, setSidebarVisible] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [starFilter, setStarFilter] = useState('All')
    const [modalRemoveVisible, setModalRemoveVisible] = useState(false)
    const [modalRemoveOkVisible, setModalRemoveOkVisible] = useState(false)

    const removeOk = () => {
        setModalRemoveVisible(false)
        setModalRemoveOkVisible(true)
    }

    const removeCancel = () => {
        setModalRemoveVisible(false)
    }

    const removeModalOK = () => {
        setModalRemoveOkVisible(false)
    }

    const [reviews, setReviews] = useState([
        {
            id: '1',
            username: 'jglanuza',
            package: 'Boracay Tour',
            stars: 5,
            comment: 'Amazing experience! Highly recommended.'
        },
        {
            id: '2',
            username: 'tayshaun',
            package: 'Japan Tour',
            stars: 4,
            comment: 'Great Tour!'
        },
        {
            id: '3',
            username: 'marionblmt',
            package: 'Korea Tour',
            stars: 3,
            comment: 'Hotel is kinda okay.'
        },
        {
            id: '4',
            username: 'jsnnsbauca',
            package: 'El Nido Tour',
            stars: 1,
            comment: 'The itinerary was not followed.'
        },
    ])


    const renderStars = (count) => {
        const stars = []

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= count ? 'star' : 'star-outline'}
                    size={16}
                    color="#FFD700"
                />
            )
        }

        return <View style={{ flexDirection: 'row' }}>
            {stars}
        </View>
    }

    const renderItem = ({ item }) => (
        <View style={ReviewManagementStyles.reviewCard}>
            <View style={ReviewManagementStyles.reviewHeader}>
                <Text style={ReviewManagementStyles.username}>{item.username}</Text>
                {renderStars(item.stars)}
            </View>

            <Text style={ReviewManagementStyles.package}>
                Package: {item.package}
            </Text>

            <Text style={ReviewManagementStyles.comment}>
                {item.comment}
            </Text>

            <TouchableOpacity
                style={ReviewManagementStyles.removeButton}
                onPress={() => { setModalRemoveVisible(true) }}
            >
                <Text style={ReviewManagementStyles.removeButtonText}>
                    Remove
                </Text>
            </TouchableOpacity>
        </View>
    )
    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => { setSidebarVisible(true) }} />
            <AdminSidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <View style={ReviewManagementStyles.container}>
                <Text style={ReviewManagementStyles.header}>Ratings Management</Text>
                <View style={ReviewManagementStyles.statsContainer}>
                    <View style={ReviewManagementStyles.statsRow}>
                        <View style={ReviewManagementStyles.card}>
                            <Text style={ReviewManagementStyles.cardValue}>40</Text>
                            <Text style={ReviewManagementStyles.cardLabel}>Ratings</Text>
                        </View>

                        <View style={ReviewManagementStyles.card}>
                            <Text style={ReviewManagementStyles.cardValue}>36</Text>
                            <Text style={ReviewManagementStyles.cardLabel}>5 Stars</Text>
                        </View>
                    </View>

                    <View style={ReviewManagementStyles.statsRow}>
                        <View style={ReviewManagementStyles.card}>
                            <Text style={ReviewManagementStyles.cardValue}>4</Text>
                            <Text style={ReviewManagementStyles.cardLabel}>1 Star</Text>
                        </View>

                        <View style={ReviewManagementStyles.card}>
                            <Text style={ReviewManagementStyles.cardValue}>4.7</Text>
                            <Text style={ReviewManagementStyles.cardLabel}>Average Rating</Text>
                        </View>
                    </View>
                </View>

                <View style={ReviewManagementStyles.searchRow}>
                    <View style={ReviewManagementStyles.searchBar} >
                        <Ionicons name="search" size={16} />
                        <TextInput
                            style={ReviewManagementStyles.searchInput}
                            placeholder='Search username'
                            placeholderTextColor="#777"
                        />
                    </View>
                    <View style={ReviewManagementStyles.dropdownGroup}>
                        <View style={ReviewManagementStyles.dropdownButton} >
                            <Text style={ReviewManagementStyles.dropdownText} >Stars</Text>
                            <Ionicons
                                name="chevron-down"
                                size={12}
                                color="#305797"
                                style={ReviewManagementStyles.dropdownIcon}
                            />
                        </View>
                        <View style={ReviewManagementStyles.dropdownButton} >
                            <Text style={ReviewManagementStyles.dropdownText} >Date</Text>
                            <Ionicons
                                name="chevron-down"
                                size={12}
                                color="#305797"
                                style={ReviewManagementStyles.dropdownIcon}
                            />
                        </View>
                    </View>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    {reviews.map((item) => (
                        <View key={item.id} style={ReviewManagementStyles.reviewCard}>
                            <View style={ReviewManagementStyles.reviewHeader}>
                                <Text style={ReviewManagementStyles.username}>
                                    {item.username}
                                </Text>
                                {renderStars(item.stars)}
                            </View>

                            <Text style={ReviewManagementStyles.package}>
                                Package: {item.package}
                            </Text>

                            <Text style={ReviewManagementStyles.comment}>
                                {item.comment}
                            </Text>

                            <TouchableOpacity
                                style={ReviewManagementStyles.removeButton}
                                onPress={() => setModalRemoveVisible(true)}
                            >
                                <Text style={ReviewManagementStyles.removeButtonText}>
                                    Remove
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>

            </View>

            <Modal
                transparent
                animationType='fade'
                visible={modalRemoveVisible}
                onRequestClose={() => { setModalRemoveVisible }}
            >

                <View style={ModalStyle.modalOverlay}>
                    <View style={ModalStyle.modalBox}>
                        <Text style={ModalStyle.modalTitle}>Remove Review</Text>
                        <Text style={ModalStyle.modalText}>Are you sure you want to remove this review?</Text>

                        <View style={{ flexDirection: "row", marginTop: 10, gap: 20 }}>
                            <TouchableOpacity
                                style={ModalStyle.modalButton}
                                onPress={() => {
                                    removeOk()
                                }}
                            >
                                <Text style={ModalStyle.modalButtonText}>Yes</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={ModalStyle.modalCancelButton}
                                onPress={() => {
                                    removeCancel()
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
                visible={modalRemoveOkVisible}
                onRequestClose={() => { setModalRemoveOkVisible }}
            >

                <View style={ModalStyle.modalOverlay}>
                    <View style={ModalStyle.modalBox}>
                        <Text style={ModalStyle.modalTitle}>Review Removed</Text>
                        <Text style={ModalStyle.modalText}>This review has been successfully removed!</Text>

                        <TouchableOpacity
                            style={ModalStyle.modalButton}
                            onPress={() => {
                                removeModalOK()
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