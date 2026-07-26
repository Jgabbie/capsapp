import React, { useState, useCallback, useMemo } from 'react';
import { View, TouchableOpacity, TextInput, ScrollView, Modal, ActivityIndicator, Alert, Platform, Dimensions } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { Image } from 'expo-image';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Constants from "expo-constants";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Chatbot from '../../components/Chatbot';
import WishlistStyle from '../../styles/clientstyles/WishlistStyle';
import ModalStyle from '../../styles/componentstyles/ModalStyle';
import { api, withUserHeader } from '../../utils/api';
import { useUser } from '../../context/UserContext';

import { useFonts } from '@expo-google-fonts/montserrat';

import {
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold
} from '@expo-google-fonts/montserrat';


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
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_600SemiBold,
        Montserrat_700Bold,
    });

    const cs = useNavigation();
    const { user } = useUser();

    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [packages, setPackages] = useState([]);

    //modal States
    const [modalVisible, setModalVisible] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);

    //filter States
    const [searchText, setSearchText] = useState("");
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedAvailability, setSelectedAvailability] = useState("All");

    const [priceRange, setPriceRange] = useState([0, 100000]);

    const getAvailabilityStatus = (slots) => {
        if (slots === undefined || slots === null) return "Available";
        if (slots <= 0) return "Sold out";
        if (slots <= 5) return "Few slots";
        return "Available";
    };


    //fetch wishlist items when the component mounts or when the user changes
    useFocusEffect(
        useCallback(() => {
            const fetchWishlist = async () => {
                if (!user?._id) return;
                try {
                    setLoading(true);
                    const [wishlistResponse, ratingResponse] = await Promise.all([
                        api.get('/wishlist', withUserHeader(user._id)),
                        api
                            .get('/rating/average-ratings')
                            .catch(() => ({
                                data: {
                                    averagesPayload: []
                                }
                            }))
                    ]);

                    const items =
                        wishlistResponse.data.wishlist ||
                        wishlistResponse.data ||
                        [];

                    const ratingMap = new Map();

                    if (ratingResponse.data?.averagesPayload) {
                        ratingResponse.data.averagesPayload.forEach((ratingItem) => {
                            ratingMap.set(
                                String(ratingItem.id),
                                Number(ratingItem.averageRating) || 0
                            );
                        });
                    }

                    const mapped = items.map(item => {
                        const pkg = item.packageId || item.package || item;

                        let calculatedSlots = 0;
                        if (pkg.packageSpecificDate && Array.isArray(pkg.packageSpecificDate)) {
                            calculatedSlots = pkg.packageSpecificDate.reduce((sum, dateObj) => {
                                return sum + (Number(dateObj.slots) || Number(dateObj.availableSlots) || 0);
                            }, 0);
                        }

                        const finalSlots =
                            pkg.packageAvailableSlots ??
                            pkg.slots ??
                            calculatedSlots;

                        const finalDiscount =
                            pkg.packageDiscountPercent ??
                            pkg.discount ??
                            0;

                        // Get the live average rating from /rating/average-ratings
                        const packageRating =
                            ratingMap.get(String(pkg._id)) ??
                            ratingMap.get(String(pkg.packageItem)) ??
                            Number(pkg.averageRating) ??
                            0;

                        return {
                            id: pkg._id,
                            title: pkg.packageName,
                            image: toImageUrl(pkg.images?.[0]),
                            packagePricePerPax: Number(pkg.packagePricePerPax) || 0,

                            duration: `${pkg.packageDuration || 0} Days`,
                            packageDuration: pkg.packageDuration || 0,

                            packageType: pkg.packageType || "Domestic",
                            availability: getAvailabilityStatus(finalSlots),
                            slots: finalSlots,

                            discount: Number(finalDiscount) || 0,

                            packageTags: pkg.packageTags || [],

                            rating: Number(packageRating || 0).toFixed(1),

                            reference:
                                pkg.packageCode ||
                                pkg.reference ||
                                `PKG-${String(pkg._id)
                                    .substring(0, 8)
                                    .toUpperCase()}`,

                            rawPackage: pkg
                        };
                    });
                    setPackages(mapped);
                } catch (err) {
                    console.error("Fetch Wishlist Error:", err.message);
                    Alert.alert("Fetch Wishlist Error", err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchWishlist();
        }, [user?._id])
    );


    //dropdown Lists
    const categoriesList = ["All", "Domestic", "International"];
    const availabilitiesList = ["All", "Available", "Few slots", "Sold out"];


    //filtering Logic
    const filteredPackages = useMemo(() => {
        return packages.filter((item) => {
            const q = searchText.toLowerCase();
            const matchesSearch =
                !q ||
                item.title?.toLowerCase().includes(q) ||
                item.packageType?.toLowerCase().includes(q) ||
                item.packageTags?.some((tag) =>
                    tag.toLowerCase().includes(q)
                );

            const matchesCategory = selectedCategory === "All" || item.packageType?.toLowerCase() === selectedCategory.toLowerCase();
            const matchesAvailability = selectedAvailability === "All" || item.availability === selectedAvailability;

            //  UPDATED: Price slider filter logic
            const actualPrice = item.discount > 0 ? item.packagePricePerPax * (1 - item.discount / 100) : item.packagePricePerPax;
            const matchesPrice = actualPrice >= priceRange[0] && actualPrice <= priceRange[1];

            return matchesSearch && matchesCategory && matchesAvailability && matchesPrice;
        });
    }, [packages, searchText, selectedCategory, selectedAvailability, priceRange]);


    //handle removing an item from the wishlist, sending a delete request to the server and updating local state
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


    //toggle dropdown visibility for category and availability filters
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
                            maxLength={50}
                            style={WishlistStyle.searchInput}
                            placeholder="Search by destination or package name"
                            placeholderTextColor="#9ca3af"
                            value={searchText}
                            autoCorrect={false}
                            onChangeText={(text) => {
                                const cleanedSearch = text
                                    .replace(/[^a-zA-Z0-9\s,'&()./-]/g, "")
                                    .replace(/\s{2,}/g, " ")
                                    .replace(/^\s+/, "");

                                setSearchText(cleanedSearch);
                            }}
                        />
                    </View>

                    {/*  UPDATED: Category and Availability Side-by-Side */}
                    <View style={WishlistStyle.dropdownRow}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={WishlistStyle.filterLabel}>Category</Text>
                            <TouchableOpacity style={WishlistStyle.dropdownButton} onPress={() => toggleDropdown('category')}>
                                <Text style={WishlistStyle.dropdownText}>{selectedCategory}</Text>
                                <Ionicons name="chevron-down" size={14} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={WishlistStyle.filterLabel}>Availability</Text>
                            <TouchableOpacity style={WishlistStyle.dropdownButton} onPress={() => toggleDropdown('availability')}>
                                <Text style={WishlistStyle.dropdownText}>{selectedAvailability}</Text>
                                <Ionicons name="chevron-down" size={14} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/*  NEW: Price Slider */}
                    <Text style={[WishlistStyle.filterLabel, { marginTop: 15 }]}>Price</Text>
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
                            selectedStyle={{ backgroundColor: '#305797' }} markerStyle={{ backgroundColor: '#305797' }}
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
                        const actualPrice =
                            item.discount > 0
                                ? item.packagePricePerPax * (1 - item.discount / 100)
                                : item.packagePricePerPax;

                        const availabilityColor =
                            item.availability === "Available"
                                ? "#00bf63"
                                : item.availability === "Few slots"
                                    ? "#f59e0b"
                                    : "#ef4444";

                        return (
                            <View key={item.id} style={WishlistStyle.card}>
                                <View style={WishlistStyle.cardImageWrapper}>
                                    <Image
                                        style={WishlistStyle.cardImage}
                                        source={{ uri: item.image }}
                                    />

                                    {item.discount > 0 && (
                                        <View style={WishlistStyle.discountRibbon}>
                                            <Text style={WishlistStyle.discountRibbonText}>
                                                {item.discount}% OFF
                                            </Text>
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        style={WishlistStyle.topRemoveButton}
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            setItemToRemove(item);
                                            setModalVisible(true);
                                        }}
                                    >
                                        <Ionicons
                                            name="trash-outline"
                                            size={24}
                                            color="#a32345"
                                        />
                                    </TouchableOpacity>

                                    <View
                                        style={[
                                            WishlistStyle.imageAvailabilityBadge,
                                            {
                                                backgroundColor: availabilityColor
                                            }
                                        ]}
                                    >
                                        <Text style={WishlistStyle.imageAvailabilityText}>
                                            {item.availability.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View style={WishlistStyle.cardContent}>
                                    <Text
                                        style={WishlistStyle.packageName}
                                        numberOfLines={2}
                                    >
                                        {item.title}
                                    </Text>

                                    <View style={WishlistStyle.priceDisplayRow}>
                                        {item.discount > 0 && (
                                            <Text style={WishlistStyle.packagePriceOld}>
                                                {formatPeso(item.packagePricePerPax)}
                                            </Text>
                                        )}

                                        <Text style={WishlistStyle.priceText}>
                                            {formatPeso(actualPrice)}
                                        </Text>
                                    </View>

                                    <Text style={WishlistStyle.priceCaption}>
                                        {item.discount > 0
                                            ? "Discounted price per person"
                                            : "Price per person"}
                                    </Text>

                                    <View style={WishlistStyle.packageMetaRow}>
                                        <Text style={WishlistStyle.packageMetaText}>
                                            {item.duration}
                                        </Text>

                                        <Text style={WishlistStyle.packageMetaDot}>
                                            •
                                        </Text>

                                        <Text style={WishlistStyle.packageMetaText}>
                                            {item.packageType}
                                        </Text>
                                    </View>

                                    <View style={WishlistStyle.packageStatsRow}>
                                        <View style={WishlistStyle.slotsPill}>
                                            <Text style={WishlistStyle.slotsPillText}>
                                                Slots Available: {item.slots}
                                            </Text>
                                        </View>

                                        <View style={WishlistStyle.ratingPill}>
                                            <Ionicons
                                                name="star"
                                                size={21}
                                                color="#facc15"
                                            />

                                            <Text style={WishlistStyle.ratingPillText}>
                                                {item.rating || "0.0"}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={WishlistStyle.cardButtonRow}>
                                        <TouchableOpacity
                                            style={WishlistStyle.viewDetailsButton}
                                            activeOpacity={0.85}
                                            onPress={() =>
                                                cs.navigate("packagedetails", {
                                                    pkg: item.rawPackage,
                                                    id: item.id
                                                })
                                            }
                                        >
                                            <Ionicons
                                                name="eye-outline"
                                                size={16}
                                                color="#ffffff"
                                            />

                                            <Text style={WishlistStyle.viewDetailsButtonText}>
                                                VIEW DETAILS
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={WishlistStyle.removeButton}
                                            activeOpacity={0.85}
                                            onPress={() => {
                                                setItemToRemove(item);
                                                setModalVisible(true);
                                            }}
                                        >
                                            <Ionicons
                                                name="trash-outline"
                                                size={15}
                                                color="#ffffff"
                                            />

                                            <Text style={WishlistStyle.removeButtonText}>
                                                REMOVE
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
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