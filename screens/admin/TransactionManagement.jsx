import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import Header from '../../components/Header'
import AdminSidebar from '../../components/AdminSidebar'
import TransactionManagementStyle from '../../styles/adminstyles/TransactionManagementStyle'
import ModalStyle from '../../styles/componentstyles/ModalStyle'


export default function TransactionManagement() {

    const [isSidebarVisible, setSidebarVisible] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [modalOkVisible, setModalOkVisible] = useState(false)

    const [getTransac, setTransac] = useState([
        { id: "1", ref: "TR-0001", package: "Boracay Tour", status: "Paid", date: "09-14-2026", amount: 70000 },
    ])

    const modalOK = () => {
        setModalOkVisible(false)
    }

    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <AdminSidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView
                contentContainerStyle={TransactionManagementStyle.container}
                showsVerticalScrollIndicator={false}
            >
                <Text style={TransactionManagementStyle.title}>User Transactions</Text>

                <View style={TransactionManagementStyle.statsContainer}>
                    <View style={TransactionManagementStyle.statsRow}>
                        <View style={TransactionManagementStyle.card}>
                            <View style={TransactionManagementStyle.valueRow}>
                                <Text style={TransactionManagementStyle.cardValue}>25</Text>
                            </View>
                            <Text style={TransactionManagementStyle.cardLabel}>Total Packages</Text>
                        </View>
                        <View style={TransactionManagementStyle.card}>
                            <View style={TransactionManagementStyle.valueRow}>
                                <Text style={TransactionManagementStyle.cardValue}>12</Text>
                            </View>
                            <Text style={TransactionManagementStyle.cardLabel}>Available Packages</Text>
                        </View>
                    </View>
                </View>

                <View style={TransactionManagementStyle.searchRow}>
                    <View style={TransactionManagementStyle.searchBar}>
                        <Ionicons name="search" size={16} />
                        <TextInput
                            style={TransactionManagementStyle.searchInput}
                            placeholder='Search transaction'
                            placeholderTextColor="#777"
                        />
                    </View>

                    <View style={TransactionManagementStyle.dropdownGroup}>
                        <View style={TransactionManagementStyle.dropdownButton}>
                            <Text style={TransactionManagementStyle.dropdownText}>Status</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" />
                        </View>
                        <View style={TransactionManagementStyle.dropdownButton}>
                            <Text style={TransactionManagementStyle.dropdownText}>Date</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" />
                        </View>
                    </View>
                </View>


                {getTransac.map((item) => (
                    <View key={item.id} style={TransactionManagementStyle.transactionCard}>

                        <View style={TransactionManagementStyle.cardHeader}>
                            <Text style={TransactionManagementStyle.transactionRef}>{item.ref}</Text>
                            <Text style={[
                                TransactionManagementStyle.transactionStatus,
                                item.status === "Paid" ? { color: "#2ecc71" } : { color: "#f1c40f" }
                            ]}>
                                {item.status}
                            </Text>
                        </View>

                        <View style={TransactionManagementStyle.cardBody}>
                            <Text style={TransactionManagementStyle.packageName}>{item.package}</Text>

                            <View style={TransactionManagementStyle.detailRow}>
                                <Text style={TransactionManagementStyle.detailLabel}>Date:</Text>
                                <Text style={TransactionManagementStyle.detailValue}>{item.date}</Text>
                            </View>

                            <View style={TransactionManagementStyle.detailRow}>
                                <Text style={TransactionManagementStyle.detailLabel}>Amount:</Text>
                                <Text style={TransactionManagementStyle.amount}>₱{item.amount}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={TransactionManagementStyle.viewButton}
                            onPress={() => cs.navigate("transactionreceipt")}
                        >
                            <Text style={TransactionManagementStyle.buttonText}>View Receipt</Text>
                        </TouchableOpacity>

                    </View>
                ))}
            </ScrollView>

            <Modal
                transparent
                animationType='fade'
                visible={modalVisible}
                onRequestClose={() => { setModalVisible }}
            >

                <View style={ModalStyle.modalOverlay}>
                    <View style={ModalStyle.modalBox}>
                        <Text style={ModalStyle.modalTitle}>Remove Transaction</Text>
                        <Text style={ModalStyle.modalText}>Are you sure you want to remove this Transaction?</Text>

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
                        <Text style={ModalStyle.modalText}>You have removed the transaction successfully!</Text>


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