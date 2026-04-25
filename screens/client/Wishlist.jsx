import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, Modal, ActivityIndicator, Alert, Platform, Dimensions } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Constants from "expo-constants";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

import { useFonts } from '@expo-google-fonts/montserrat';
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';

import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Chatbot from '../../components/Chatbot';
import WishlistStyle from '../../styles/clientstyles/WishlistStyle';
import ModalStyle from '../../styles/componentstyles/ModalStyle';
import { api, withUserHeader } from '../../utils/api';
import { useUser } from '../../context/UserContext';

const { width } = Dimensions.get('window');

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
    const [itemToRemove, setItemToRemove] = useState(null);

    // Filter States
    const [searchText, setSearchText] = useState("");
    const [activeDropdown, setActiveDropdown] = useState(null); 
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedAvailability, setSelectedAvailability] = useState("All");
    // 🔥 NEW: Price Slider State
    const [priceRange, setPriceRange] = useState([0, 100000]);

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold,
        Roboto_400Regular, Roboto_500Medium, Roboto_700Bold
    });

    const getAvailabilityStatus = (slots) => {
        if (slots === undefined || slots === null) return "Available"; 
        if (slots <= 0) return "Sold out";
        if (slots <= 5) return "Few slots";
        return "Available";
    };

    useFocusEffect(
        useCallback(() => {
            const fetchWishlist = async () => {
                if (!user?._id) return;
                try {
                    setLoading(true);
                    const response = await api.get('/wishlist', withUserHeader(user._id));
                    let items = response.data.wishlist || response.data;
                    
                    const mapped = items.map(item => {
                        const pkg = item.packageId || item.package || item; 
                        
                        let calculatedSlots = 0;
                        if (pkg.packageSpecificDate && Array.isArray(pkg.packageSpecificDate)) {
                            calculatedSlots = pkg.packageSpecificDate.reduce((sum, dateObj) => {
                                return sum + (Number(dateObj.slots) || Number(dateObj.availableSlots) || 0);
                            }, 0);
                        }

                        const finalSlots = pkg.packageAvailableSlots ?? pkg.slots ?? calculatedSlots;
                        const finalDiscount = pkg.packageDiscountPercent ?? pkg.discount ?? 0;

                        return {
                            id: pkg._id,
                            title: pkg.packageName,
                            image: toImageUrl(pkg.images?.[0]),
                            packagePricePerPax: pkg.packagePricePerPax || 0,
                            duration: `${pkg.packageDuration || 0} DAYS`,
                            packageDuration: pkg.packageDuration || 0,
                            packageType: pkg.packageType || "Domestic", 
                            availability: getAvailabilityStatus(finalSlots),
                            slots: finalSlots,
                            discount: finalDiscount,
                            reference: pkg.packageCode || pkg.reference || `PKG-${pkg._id.substring(0, 8).toUpperCase()}`,
                            rawPackage: pkg 
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

    // Dropdown Lists
    const categoriesList = ["All", "Domestic", "International"];
    const availabilitiesList = ["All", "Available", "Few slots", "Sold out"];

    // Filtering Logic
    const filteredPackages = useMemo(() => {
        return packages.filter((item) => {
            const q = searchText.toLowerCase();
            const matchesSearch = !q || item.title?.toLowerCase().includes(q) || item.packageType?.toLowerCase().includes(q);
            
            const matchesCategory = selectedCategory === "All" || item.packageType?.toLowerCase() === selectedCategory.toLowerCase();
            const matchesAvailability = selectedAvailability === "All" || item.availability === selectedAvailability;
            
            // 🔥 UPDATED: Price slider filter logic
            const actualPrice = item.discount > 0 ? item.packagePricePerPax * (1 - item.discount / 100) : item.packagePricePerPax;
            const matchesPrice = actualPrice >= priceRange[0] && actualPrice <= priceRange[1];

            return matchesSearch && matchesCategory && matchesAvailability && matchesPrice;
        });
    }, [packages, searchText, selectedCategory, selectedAvailability, priceRange]);

    const handleRemoveConfirm = async () => {
        if (!itemToRemove) return;
        try {
            await api.delete('/wishlist/remove', { 
                data: { packageId: itemToRemove.id }, 
                ...withUserHeader(user?._id) 
            });
            setPackages(prev => prev.filter(p => p.id !== itemToRemove.id));
            setModalVisible(false);
        } catch (err) {
            Alert.alert("Error", "Could not remove package from wishlist.");
            setModalVisible(false);
        }
    };

    const toggleDropdown = (type) => {
        setActiveDropdown(activeDropdown === type ? null : type);
    };

    if (!fontsLoaded) return null;

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={WishlistStyle.container} showsVerticalScrollIndicator={false}>
                
                <Text style={WishlistStyle.title}>Your Wishlist</Text>
                <Text style={WishlistStyle.subtitle}>Search and filter the packages you saved for later.</Text>

                <View style={WishlistStyle.filterBox}>
                    <Text style={WishlistStyle.filterLabel}>Search</Text>
                    <View style={WishlistStyle.searchBar}>
                        <TextInput
                            style={WishlistStyle.searchInput}
                            placeholder="Search by destination or package name"
                            placeholderTextColor="#9ca3af"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>

                    {/* 🔥 UPDATED: Category and Availability Side-by-Side */}
                    <View style={WishlistStyle.dropdownRow}>
                        <View style={{flex: 1, marginRight: 8}}>
                            <Text style={WishlistStyle.filterLabel}>Category</Text>
                            <TouchableOpacity style={WishlistStyle.dropdownButton} onPress={() => toggleDropdown('category')}>
                                <Text style={WishlistStyle.dropdownText}>{selectedCategory}</Text>
                                <Ionicons name="chevron-down" size={14} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={{flex: 1, marginLeft: 8}}>
                            <Text style={WishlistStyle.filterLabel}>Availability</Text>
                            <TouchableOpacity style={WishlistStyle.dropdownButton} onPress={() => toggleDropdown('availability')}>
                                <Text style={WishlistStyle.dropdownText}>{selectedAvailability}</Text>
                                <Ionicons name="chevron-down" size={14} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 🔥 NEW: Price Slider */}
                    <Text style={[WishlistStyle.filterLabel, {marginTop: 15}]}>Price</Text>
                    <View style={{ alignItems: 'center' }}>
                        <View style={WishlistStyle.budgetValuesRow}>
                            <Text style={{ fontSize: 12, color: '#555', fontFamily: 'Roboto_500Medium' }}>₱{priceRange[0].toLocaleString()}</Text>
                            <Text style={{ fontSize: 12, color: '#555', fontFamily: 'Roboto_500Medium' }}>₱{priceRange[1].toLocaleString()}</Text>
                        </View>
                        <MultiSlider 
                            values={priceRange} 
                            sliderLength={width - 90} 
                            onValuesChange={(vals) => setPriceRange(vals)} 
                            min={0} max={100000} step={1000} 
                            selectedStyle={{backgroundColor:'#305797'}} markerStyle={{backgroundColor:'#305797'}} 
                        />
                    </View>
                </View>

                {/* Dropdown Modals mapped to new layout position */}
                {activeDropdown === 'category' && (
                    <View style={[WishlistStyle.dropdownMenu, { top: 165, left: 15 }]}>
                        {categoriesList.map(cat => (
                            <TouchableOpacity key={cat} style={WishlistStyle.dropdownMenuItem} onPress={() => { setSelectedCategory(cat); setActiveDropdown(null); }}>
                                <Text style={WishlistStyle.dropdownMenuItemText}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                {activeDropdown === 'availability' && (
                    <View style={[WishlistStyle.dropdownMenu, { top: 165, right: 15 }]}>
                        {availabilitiesList.map(avail => (
                            <TouchableOpacity key={avail} style={WishlistStyle.dropdownMenuItem} onPress={() => { setSelectedAvailability(avail); setActiveDropdown(null); }}>
                                <Text style={WishlistStyle.dropdownMenuItemText}>{avail}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View style={WishlistStyle.packagesHeader}>
                    <Text style={WishlistStyle.packagesTitle}>Packages</Text>
                    <Text style={WishlistStyle.foundText}>
                        {filteredPackages.length === 1 ? '1 found' : `${filteredPackages.length} found`}
                    </Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#305797" style={{ marginTop: 50 }} />
                ) : filteredPackages.length === 0 ? (
                    <View style={WishlistStyle.emptyStateContainer}>
                        <Image source={require('../../assets/images/empty_logo.png')} style={WishlistStyle.emptyStateImage} />
                        <Text style={WishlistStyle.emptyStateText}>No packages match your filters.</Text>
                    </View>
                ) : (
                    filteredPackages.map((item) => {
                        // 🔥 Calculate display price dynamically
                        const actualPrice = item.discount > 0 ? item.packagePricePerPax * (1 - item.discount / 100) : item.packagePricePerPax;

                        return (
                            <View key={item.id} style={WishlistStyle.card}>
                                <Image style={WishlistStyle.cardImage} source={{ uri: item.image }} />

                                <View style={WishlistStyle.cardContent}>
                                    <View style={WishlistStyle.rowBetween}>
                                        <Text style={WishlistStyle.packageName} numberOfLines={1}>{item.title}</Text>
                                        <View style={[WishlistStyle.tag, { backgroundColor: item.packageType?.toLowerCase() === 'domestic' ? '#fff3e0' : '#e8f4fd' }]}>
                                            <Text style={[WishlistStyle.tagText, { color: item.packageType?.toLowerCase() === 'domestic' ? '#e65100' : '#0277bd' }]}>
                                                {item.packageType?.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={WishlistStyle.refText}>{item.reference}</Text>

                                    <View style={[WishlistStyle.rowBetween, { marginTop: 15, marginBottom: 8 }]}>
                                        <Text style={WishlistStyle.durationText}>{item.duration}</Text>
                                        <View style={[
                                            WishlistStyle.tag, 
                                            { backgroundColor: item.availability === 'Available' ? '#e8f5e9' : item.availability === 'Sold out' ? '#ffebee' : '#fff8e1' }
                                        ]}>
                                            <Text style={[
                                                WishlistStyle.tagText, 
                                                { color: item.availability === 'Available' ? '#2e7d32' : item.availability === 'Sold out' ? '#c62828' : '#f57f17' }
                                            ]}>
                                                {item.availability.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* 🔥 NEW: Slots and Discount Badge Layout */}
                                    <View style={[WishlistStyle.rowBetween, {marginBottom: 10}]}>
                                        <Text style={WishlistStyle.slotsText}>Slots: {item.slots}</Text>
                                        {item.discount > 0 && (
                                            <View style={WishlistStyle.discountBadge}>
                                                <Text style={WishlistStyle.discountBadgeText}>-{item.discount}%</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* 🔥 Restored the row format, but stacked the price text vertically! */}
<View style={WishlistStyle.rowBetween}>
    
    <View style={WishlistStyle.priceContainer}>
        {item.discount > 0 && (
            <Text style={WishlistStyle.packagePriceOld}>
                {formatPeso(item.packagePricePerPax)}
            </Text>
        )}
        
        {/* 🔥 Removed the priceRowBox wrapper to let these stack naturally */}
        <Text style={WishlistStyle.priceText}>{formatPeso(actualPrice)}</Text>
        <Text style={WishlistStyle.budgetPaxText}>
            {item.discount > 0 ? "Discounted / Pax" : "Budget / Pax"}
        </Text>
    </View>

    <View style={WishlistStyle.actionButtons}>
        <TouchableOpacity 
            style={WishlistStyle.btnView} 
            onPress={() => cs.navigate("packagedetails", { pkg: item.rawPackage, id: item.id })}
        >
            <Text style={WishlistStyle.btnViewText}>View details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
            style={WishlistStyle.btnRemove} 
            onPress={() => {
                setItemToRemove(item);
                setModalVisible(true);
            }}
        >
            <Text style={WishlistStyle.btnRemoveText}>Remove</Text>
        </TouchableOpacity>
    </View>
</View>
                                </View>
                            </View>
                        )
                    })
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