import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Constants from "expo-constants";

import { useFonts } from '@expo-google-fonts/montserrat';
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';

import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Chatbot from '../../components/Chatbot';
import WishlistStyle from '../../styles/clientstyles/WishlistStyle';
import ModalStyle from '../../styles/componentstyles/ModalStyle';
// ADDED THE IMPORT HERE
import { api, withUserHeader } from '../../utils/api';
import { useUser } from '../../context/UserContext';

const getTravelSystemApiBase = () => {
    if (Platform.OS === "web") return "http://localhost:8000";
    const hostUri = Constants.expoConfig?.hostUri || "";
    const host = hostUri.split(":")[0];
    return host ? `http://${host}:8000` : "http://10.0.2.2:8000";
};
const packageApiBase = getTravelSystemApiBase();
const formatPeso = (value) => `₱${(Number(value) || 0).toLocaleString("en-PH")}`;
const toImageUrl = (source) => {
    if (!source) return "https://via.placeholder.com/800x500?text=No+Image";
    const value = String(source);
    if (value.startsWith("http") || value.startsWith("data:")) return value;
    return `${packageApiBase}/${value.replace(/^\/+/, "")}`;
};

export default function Wishlist() {
    const cs = useNavigation();
    const { user } = useUser();
    
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [packages, setPackages] = useState([]);
    
    // Modal States
    const [modalVisible, setModalVisible] = useState(false);
    const [modalOkVisible, setModalOkVisible] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);

    // Filter States
    const [searchText, setSearchText] = useState("");
    const [isActivityOpen, setIsActivityOpen] = useState(false);
    const [isDurationOpen, setIsDurationOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState("Activities");
    const [selectedDuration, setSelectedDuration] = useState("Duration");

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold,
        Roboto_400Regular, Roboto_500Medium, Roboto_700Bold
    });

    // Fetch Wishlist Data every time screen is focused
    useFocusEffect(
        useCallback(() => {
            const fetchWishlist = async () => {
                if (!user?._id) return; // Ensure we have a user ID
                try {
                    setLoading(true);
                    // ADDED THE HEADER HERE
                    const response = await api.get('/wishlist', withUserHeader(user._id));
                    let items = response.data.wishlist || response.data;
                    
                    // Safely extract the package data
                    const mapped = items.map(item => {
                        const pkg = item.packageId || item.package || item; 
                        return {
                            id: pkg._id,
                            title: pkg.packageName,
                            image: toImageUrl(pkg.images?.[0]),
                            packagePricePerPax: pkg.packagePricePerPax || 0,
                            duration: `${pkg.packageDuration || 0} Days`,
                            packageDuration: pkg.packageDuration || 0,
                            packageTags: pkg.packageTags || [],
                            rawPackage: pkg // Pass this to the details page
                        };
                    });
                    setPackages(mapped);
                } catch (err) {
                    console.log("Fetch Wishlist Error:", err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchWishlist();
        }, [user?._id]) 
    );

    // Extract Unique Activities for Dropdown
    const activitiesList = useMemo(() => {
        const unique = new Set();
        packages.forEach(p => p.packageTags?.forEach(t => unique.add(t)));
        return ["All", ...Array.from(unique)];
    }, [packages]);

    const durationList = ["All", "1-3 Days", "4-7 Days", "8+ Days"];

    // Filtering Logic
    const filteredPackages = useMemo(() => {
        return packages.filter((item) => {
            const q = searchText.toLowerCase();
            const matchesSearch = !q || item.title?.toLowerCase().includes(q) || item.packageTags?.some(t => t.toLowerCase().includes(q));
            
            const matchesActivity = selectedActivity === "Activities" || selectedActivity === "All" || item.packageTags?.includes(selectedActivity);
            
            let matchesDuration = true;
            if (selectedDuration !== "Duration" && selectedDuration !== "All") {
                const days = item.packageDuration;
                if (selectedDuration === "1-3 Days") matchesDuration = days >= 1 && days <= 3;
                if (selectedDuration === "4-7 Days") matchesDuration = days >= 4 && days <= 7;
                if (selectedDuration === "8+ Days") matchesDuration = days >= 8;
            }

            return matchesSearch && matchesActivity && matchesDuration;
        });
    }, [packages, searchText, selectedActivity, selectedDuration]);

    // Remove Action
    const handleRemoveConfirm = async () => {
        if (!itemToRemove) return;
        try {
            await api.delete('/wishlist/remove', { 
                data: { packageId: itemToRemove.id }, 
                ...withUserHeader(user?._id) 
            });
            
            setPackages(prev => prev.filter(p => p.id !== itemToRemove.id)); // Remove locally
            setModalVisible(false); // Close the 'Are you sure?' modal and do nothing else!
        } catch (err) {
            Alert.alert("Error", "Could not remove package from wishlist.");
            setModalVisible(false);
        }
    };

    if (!fontsLoaded) return null;

    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={WishlistStyle.container} showsVerticalScrollIndicator={false}>
                <Text style={WishlistStyle.title}>My Wishlist</Text>

                {/* --- SEARCH & DROPDOWNS --- */}
                <View style={WishlistStyle.searchRow}>
                    <View style={WishlistStyle.searchBar}>
                        <Ionicons name="search" size={16} color="#777" />
                        <TextInput
                            style={WishlistStyle.searchInput}
                            placeholder="Search Packages"
                            placeholderTextColor="#777"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>

                    <View style={WishlistStyle.dropdownGroup}>
                        <TouchableOpacity 
                            style={WishlistStyle.dropdownButton} 
                            onPress={() => { setIsActivityOpen(!isActivityOpen); setIsDurationOpen(false); }}
                        >
                            <Text style={WishlistStyle.dropdownText} numberOfLines={1}>
                                {selectedActivity === "Activities" || selectedActivity === "All" ? "Activities" : selectedActivity}
                            </Text>
                            <Ionicons name={isActivityOpen ? "chevron-up" : "chevron-down"} size={12} color="#305797" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={WishlistStyle.dropdownButton} 
                            onPress={() => { setIsDurationOpen(!isDurationOpen); setIsActivityOpen(false); }}
                        >
                            <Text style={WishlistStyle.dropdownText} numberOfLines={1}>
                                {selectedDuration === "Duration" || selectedDuration === "All" ? "Duration" : selectedDuration}
                            </Text>
                            <Ionicons name={isDurationOpen ? "chevron-up" : "chevron-down"} size={12} color="#305797" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* --- RENDER DROPDOWN MENUS --- */}
                {isActivityOpen && (
                    <View style={WishlistStyle.dropdownMenu}>
                        {activitiesList.map(activity => (
                            <TouchableOpacity 
                                key={activity} 
                                style={WishlistStyle.dropdownMenuItem}
                                onPress={() => { setSelectedActivity(activity); setIsActivityOpen(false); }}
                            >
                                <Text style={WishlistStyle.dropdownMenuItemText}>{activity}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {isDurationOpen && (
                    <View style={[WishlistStyle.dropdownMenu, { right: 20 }]}>
                        {durationList.map(duration => (
                            <TouchableOpacity 
                                key={duration} 
                                style={WishlistStyle.dropdownMenuItem}
                                onPress={() => { setSelectedDuration(duration); setIsDurationOpen(false); }}
                            >
                                <Text style={WishlistStyle.dropdownMenuItemText}>{duration}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* --- RENDER CONTENT --- */}
                {loading ? (
                    <ActivityIndicator size="large" color="#305797" style={{ marginTop: 50 }} />
                ) : filteredPackages.length === 0 ? (
                    <View style={WishlistStyle.emptyStateContainer}>
                        <Image source={require('../../assets/images/empty_logo.png')} style={WishlistStyle.emptyStateImage} />
                        <Text style={WishlistStyle.emptyStateText}>No wishlisted packages yet.</Text>
                    </View>
                ) : (
                    filteredPackages.map((item) => (
                        <View key={item.id} style={WishlistStyle.card}>
                            <Image style={WishlistStyle.cardImage} source={{ uri: item.image }} />

                            <View style={WishlistStyle.cardContent}>
                                <Text style={WishlistStyle.packageName}>{item.title}</Text>
                                <View style={WishlistStyle.priceRow}>
                                    <Text style={WishlistStyle.newPrice}>{formatPeso(item.packagePricePerPax)}</Text>
                                    <Text style={{fontSize: 11, color: '#777'}}>/ Pax</Text>
                                </View>

                                <View style={WishlistStyle.buttonRow}>
                                    <TouchableOpacity
                                        style={WishlistStyle.viewButton}
                                        onPress={() => cs.navigate("packagedetails", { pkg: item.rawPackage, id: item.id })}
                                    >
                                        <Text style={WishlistStyle.viewButtonText}>View</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={WishlistStyle.removeButton}
                                        onPress={() => {
                                            setItemToRemove(item);
                                            setModalVisible(true);
                                        }}
                                    >
                                        <Text style={WishlistStyle.viewButtonText}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
            <Chatbot />

            {/* REMOVE CONFIRMATION MODAL */}
            <Modal transparent animationType='fade' visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={ModalStyle.modalOverlay}>
                    <View style={ModalStyle.modalBox}>
                        <Text style={ModalStyle.modalTitle}>Remove Package</Text>
                        <Text style={ModalStyle.modalText}>Are you sure you want to remove this package from your Wishlist?</Text>

                        <View style={ModalStyle.modalButtonContainer}>
                            <TouchableOpacity style={ModalStyle.modalButton} onPress={handleRemoveConfirm}>
                                <Text style={ModalStyle.modalButtonText}>Remove</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={ModalStyle.modalCancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={ModalStyle.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
}