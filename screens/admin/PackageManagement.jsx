import { View, Text, TouchableOpacity, Image, TextInput, FlatList, Modal, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useFonts } from 'expo-font'
import { useNavigation } from '@react-navigation/native'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import Header from '../../components/Header'
import AdminSidebar from '../../components/AdminSidebar'
import PackageManagementStyles from '../../styles/adminstyles/PackageManagementStyles'
import ModalStyle from '../../styles/componentstyles/ModalStyle'

export default function PackageManagement() {
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const navigation = useNavigation();
    const [removeModalVisible, setRemoveModalVisible] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);

    const [typeModalVisible, setTypeModalVisible] = useState(false);
    const [availModalVisible, setAvailModalVisible] = useState(false);
    const [selectedType, setSelectedType] = useState('Package Type');
    const [selectedAvailability, setSelectedAvailability] = useState('Availability');

    const [packages, setPackages] = useState([]); 

    const [fontsLoaded] = useFonts({
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold,
        Montserrat_700Bold
    });

    const confirmRemove = () => {
        setRemoveModalVisible(false);
        setSuccessModalVisible(true);
    };

    const ListEmptyComponent = () => (
        <View style={PackageManagementStyles.emptyContainer}>
            <Image 
                source={require('../../assets/images/empty_logo.png')} 
                style={PackageManagementStyles.emptyLogo} 
            />
            <Text style={PackageManagementStyles.emptyText}>No Packages</Text>
        </View>
    );

    const renderPackageItem = ({ item }) => (
        <View style={PackageManagementStyles.packageCard}>
            <Image source={item.image} style={PackageManagementStyles.cardImage} />
            <View style={PackageManagementStyles.cardContent}>
                <View style={PackageManagementStyles.cardHeaderRow}>
                    <Text style={PackageManagementStyles.packageName}>{item.name}</Text>
                    <Text style={PackageManagementStyles.slotsText}>Slots: {item.slots}</Text>
                </View>
                <Text style={PackageManagementStyles.packageDesc} numberOfLines={2}>
                    {item.desc}
                </Text>
                <View style={PackageManagementStyles.cardFooter}>
                    <Text style={PackageManagementStyles.priceText}>₱{item.price}</Text>
                    <View style={PackageManagementStyles.actionButtons}>
                        <TouchableOpacity style={PackageManagementStyles.editBtn}>
                            <Text style={PackageManagementStyles.btnText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={PackageManagementStyles.removeBtn} onPress={() => setRemoveModalVisible(true)}>
                            <Text style={PackageManagementStyles.btnText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    if (!fontsLoaded) return null;

    return (
        <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
            <Header openSidebar={() => { setSidebarVisible(true) }} />
            <AdminSidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <View style={PackageManagementStyles.container}>
                <Text style={PackageManagementStyles.header}>Package Management</Text>

                <View style={PackageManagementStyles.statsContainer}>
                    <View style={PackageManagementStyles.statsRow}>
                        <View style={PackageManagementStyles.statsCard}>
                            <Text style={PackageManagementStyles.cardValue}>0</Text>
                            <Text style={PackageManagementStyles.cardLabel}>Total Packages</Text>
                        </View>
                        <View style={PackageManagementStyles.statsCard}>
                            <Text style={PackageManagementStyles.cardValue}>0</Text>
                            <Text style={PackageManagementStyles.cardLabel}>Available</Text>
                        </View>
                        <View style={PackageManagementStyles.statsCard}>
                            <Text style={PackageManagementStyles.cardValue}>0</Text>
                            <Text style={PackageManagementStyles.cardLabel}>Unavailable</Text>
                        </View>
                    </View>
                </View>

                <View style={PackageManagementStyles.filterWrapper}>
                    <View style={PackageManagementStyles.searchBar}>
                        <Ionicons name="search" size={16} color="#777" />
                        <TextInput
                            style={PackageManagementStyles.searchInput}
                            placeholder='Search package...'
                            placeholderTextColor="#777"
                        />
                    </View>
                    
                    <View style={PackageManagementStyles.dropdownRow}>
                        <TouchableOpacity style={PackageManagementStyles.dropdownButton} onPress={() => setTypeModalVisible(true)}>
                            <Text style={PackageManagementStyles.dropdownText}>{selectedType}</Text>
                            <Ionicons name="chevron-down" size={14} color="#777" />
                        </TouchableOpacity>

                        <TouchableOpacity style={PackageManagementStyles.dropdownButton} onPress={() => setAvailModalVisible(true)}>
                            <Text style={PackageManagementStyles.dropdownText}>{selectedAvailability}</Text>
                            <Ionicons name="chevron-down" size={14} color="#777" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={PackageManagementStyles.addPackageBtn} 
                            onPress={() => navigation.navigate("addpackages")}
                        >
                            <Ionicons name="add" size={18} color="#fff" />
                            <Text style={PackageManagementStyles.addBtnText}>Add Package</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <FlatList 
                    data={packages} 
                    renderItem={renderPackageItem} 
                    keyExtractor={item => item.id} 
                    ListEmptyComponent={ListEmptyComponent}
                    showsVerticalScrollIndicator={false} 
                    contentContainerStyle={{ flexGrow: 1 }} 
                />
            </View>

            <Modal transparent visible={typeModalVisible} animationType="fade">
                <TouchableOpacity style={PackageManagementStyles.modalOverlay} onPress={() => setTypeModalVisible(false)}>
                    <View style={PackageManagementStyles.dropdownMenu}>
                        <TouchableOpacity style={PackageManagementStyles.menuItem} onPress={() => {setSelectedType('Domestic'); setTypeModalVisible(false)}}>
                            <Text style={PackageManagementStyles.menuText}>Domestic</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={PackageManagementStyles.menuItem} onPress={() => {setSelectedType('International'); setTypeModalVisible(false)}}>
                            <Text style={PackageManagementStyles.menuText}>International</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal transparent visible={availModalVisible} animationType="fade">
                <TouchableOpacity style={PackageManagementStyles.modalOverlay} onPress={() => setAvailModalVisible(false)}>
                    <View style={PackageManagementStyles.dropdownMenu}>
                        <TouchableOpacity style={PackageManagementStyles.menuItem} onPress={() => {setSelectedAvailability('Available'); setAvailModalVisible(false)}}>
                            <Text style={PackageManagementStyles.menuText}>Available</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={PackageManagementStyles.menuItem} onPress={() => {setSelectedAvailability('Unavailable'); setAvailModalVisible(false)}}>
                            <Text style={PackageManagementStyles.menuText}>Unavailable</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal transparent visible={removeModalVisible} animationType="fade">
                <View style={ModalStyle.modalOverlay}>
                    <View style={ModalStyle.modalBox}>
                        <Text style={ModalStyle.modalTitle}>Remove Package</Text>
                        <Text style={ModalStyle.modalText}>Are you sure you want to remove this package?</Text>
                        <View style={ModalStyle.modalButtonContainer}>
                            <TouchableOpacity style={ModalStyle.modalCancelButton} onPress={() => setRemoveModalVisible(false)}>
                                <Text style={ModalStyle.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={ModalStyle.modalButton} onPress={confirmRemove}>
                                <Text style={ModalStyle.modalButtonText}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}