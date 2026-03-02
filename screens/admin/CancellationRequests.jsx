import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import Header from '../../components/Header'
import AdminSidebar from '../../components/AdminSidebar'
import CancellationRequestStyle from '../../styles/adminstyles/CancellationRequestStyle'
import ModalStyle from '../../styles/componentstyles/ModalStyle'


export default function CancellationRequests() {
    const [isSidebarVisible, setSidebarVisible] = useState(false)

    const [modalApproveVisible, setModalApproveVisible] = useState(false)
    const [modalApproveOkVisible, setModalApproveOkVisible] = useState(false)
    const [modalDeniedVisible, setModalDeniedVisible] = useState(false)
    const [modalDeniedOkVisible, setModalDeniedOkVisible] = useState(false)

    const [cancels, setCancels] = useState([
        { id: "1", ref: "CR-0001", username: "jlanuza", package: "Boracay Tour", reason: "Emergency", date: "09-14-2026", },
        { id: "2", ref: "CR-0002", username: "jnssnbau", package: "Japan Tour", reason: "Schedule", date: "09-15-2026", },
        { id: "3", ref: "CR-0003", username: "marionb", package: "Ilocos Tour", reason: "Emergency", date: "09-16-2026", },
        { id: "4", ref: "CR-0004", username: "tayshnsn", package: "Korea Tour", reason: "Emergency", date: "09-17-2026", },
        { id: "5", ref: "CR-0005", username: "jlanuza", package: "El Nido Tour", reason: "Health", date: "10-20-2026", },
    ])
    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => { setSidebarVisible(true) }} />
            <AdminSidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />
            <View style={CancellationRequestStyle.container}>
                <Text style={CancellationRequestStyle.header}>Cancellation Requests</Text>

                <View style={CancellationRequestStyle.statsContainer}>
                    <View style={CancellationRequestStyle.statsRow}>
                        <View style={CancellationRequestStyle.card}>
                            <Text style={CancellationRequestStyle.cardValue}>20</Text>
                            <Text style={CancellationRequestStyle.cardLabel}>Requests</Text>
                        </View>

                        <View style={CancellationRequestStyle.card}>
                            <Text style={CancellationRequestStyle.cardValue}>10</Text>
                            <Text style={CancellationRequestStyle.cardLabel}>Pending</Text>
                        </View>
                    </View>

                    <View style={CancellationRequestStyle.statsRow}>
                        <View style={CancellationRequestStyle.card}>
                            <Text style={CancellationRequestStyle.cardValue}>8</Text>
                            <Text style={CancellationRequestStyle.cardLabel}>Approved</Text>
                        </View>

                        <View style={CancellationRequestStyle.card}>
                            <Text style={CancellationRequestStyle.cardValue}>2</Text>
                            <Text style={CancellationRequestStyle.cardLabel}>Denied</Text>
                        </View>
                    </View>
                </View>

                <View style={CancellationRequestStyle.searchRow}>
                    <View style={CancellationRequestStyle.searchBar} >
                        <Ionicons name="search" size={16} />
                        <TextInput
                            style={CancellationRequestStyle.searchInput}
                            placeholder='Search cancel reference'
                            placeholderTextColor="#777"
                        />
                    </View>
                    <View style={CancellationRequestStyle.dropdownGroup}>
                        <View style={CancellationRequestStyle.dropdownButton} >
                            <Text style={CancellationRequestStyle.dropdownText} >Status</Text>
                            <Ionicons
                                name="chevron-down"
                                size={12}
                                color="#305797"
                                style={CancellationRequestStyle.dropdownIcon}
                            />
                        </View>
                        <View style={CancellationRequestStyle.dropdownButton} >
                            <Text style={CancellationRequestStyle.dropdownText} >Date</Text>
                            <Ionicons
                                name="chevron-down"
                                size={12}
                                color="#305797"
                                style={CancellationRequestStyle.dropdownIcon}
                            />
                        </View>
                    </View>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                    {cancels.map((item) => (
                        <View key={item.id} style={CancellationRequestStyle.requestCard}>

                            <View style={CancellationRequestStyle.cardTopRow}>
                                <Text style={CancellationRequestStyle.cardRef}>{item.ref}</Text>
                                <Text style={CancellationRequestStyle.cardDate}>{item.date}</Text>
                            </View>

                            <Text style={CancellationRequestStyle.cardLabel}>
                                Username: <Text style={CancellationRequestStyle.cardValue}>{item.username}</Text>
                            </Text>

                            <Text style={CancellationRequestStyle.cardLabel}>
                                Package: <Text style={CancellationRequestStyle.cardValue}>{item.package}</Text>
                            </Text>

                            <Text style={CancellationRequestStyle.cardLabel}>
                                Reason: <Text style={CancellationRequestStyle.cardValue}>{item.reason}</Text>
                            </Text>

                            <View style={CancellationRequestStyle.cardButtonRow}>
                                <TouchableOpacity
                                    style={CancellationRequestStyle.approveButton}
                                    onPress={() => setModalApproveVisible(true)}
                                >
                                    <Text style={CancellationRequestStyle.buttonText}>Approve</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={CancellationRequestStyle.denyButton}
                                    onPress={() => setModalDeniedVisible(true)}
                                >
                                    <Text style={CancellationRequestStyle.buttonText}>Deny</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    ))}
                </ScrollView>

                <Modal
                    transparent
                    animationType='fade'
                    visible={modalApproveVisible}
                    onRequestClose={() => { setModalApproveVisible(false) }}
                >

                    <View style={ModalStyle.modalOverlay}>
                        <View style={ModalStyle.modalBox}>
                            <Text style={ModalStyle.modalTitle}>Approve Cancellation</Text>
                            <Text style={ModalStyle.modalText}>Are you sure you want to approve this cancellation request?</Text>

                            <View style={ModalStyle.modalButtonContainer}>
                                <TouchableOpacity
                                    style={ModalStyle.modalButton}
                                    onPress={() => {
                                        setModalApproveOkVisible(true)
                                        setModalApproveVisible(false)
                                    }}
                                >
                                    <Text style={ModalStyle.modalButtonText}>Approve</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={ModalStyle.modalCancelButton}
                                    onPress={() => {
                                        setModalApproveVisible(false)
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
                    visible={modalApproveOkVisible}
                    onRequestClose={() => { setModalApproveOkVisible }}
                >

                    <View style={ModalStyle.modalOverlay}>
                        <View style={ModalStyle.modalBox}>
                            <Text style={ModalStyle.modalTitle}>Request Approved</Text>
                            <Text style={ModalStyle.modalText}>You have successfully approved this cancellation request!</Text>


                            <TouchableOpacity
                                style={ModalStyle.modalButton}
                                onPress={() => {
                                    setModalApproveOkVisible(false)
                                }}
                            >
                                <Text style={ModalStyle.modalButtonText}>OK</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>

                <Modal
                    transparent
                    animationType='fade'
                    visible={modalDeniedVisible}
                    onRequestClose={() => { setModalDeniedVisible }}
                >

                    <View style={ModalStyle.modalOverlay}>
                        <View style={ModalStyle.modalBox}>
                            <Text style={ModalStyle.modalTitle}>Deny Cancellation</Text>
                            <Text style={ModalStyle.modalText}>Are you sure you want to deny this cancellation request?</Text>

                            <View style={ModalStyle.modalButtonContainer}>
                                <TouchableOpacity
                                    style={ModalStyle.modalButton}
                                    onPress={() => {
                                        setModalDeniedOkVisible(true)
                                        setModalDeniedVisible(false)
                                    }}
                                >
                                    <Text style={ModalStyle.modalButtonText}>Deny</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={ModalStyle.modalCancelButton}
                                    onPress={() => {
                                        setModalDeniedVisible(false)
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
                    visible={modalDeniedOkVisible}
                    onRequestClose={() => { setModalDeniedOkVisible }}
                >

                    <View style={ModalStyle.modalOverlay}>
                        <View style={ModalStyle.modalBox}>
                            <Text style={ModalStyle.modalTitle}>Request Denied</Text>
                            <Text style={ModalStyle.modalText}>You have successfully denied this cancellation request!</Text>


                            <TouchableOpacity
                                style={ModalStyle.modalButton}
                                onPress={() => {
                                    setModalDeniedOkVisible(false)
                                }}
                            >
                                <Text style={ModalStyle.modalButtonText}>OK</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    )
}