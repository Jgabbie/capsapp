import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Dimensions, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { Image } from 'expo-image';

import DestinationStyles from "../../styles/clientstyles/DestinationStyles";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Chatbot from "../../components/Chatbot";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";

const { width } = Dimensions.get('window');

const formatPeso = (value) => `₱${(Number(value) || 0).toLocaleString("en-PH")}`;

export default function Packages({ navigation, route }) { // 🔥 Add route here!
    const { user, updateUser } = useUser();
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Wishlist States
    const [wishlistedIds, setWishlistedIds] = useState(new Set());
    const [wishlistEntryMap, setWishlistEntryMap] = useState(new Map());

    // Filter States
    const [searchText, setSearchText] = useState("");
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [budgetRange, setBudgetRange] = useState([0, 200000]);
    const [minBudgetInput, setMinBudgetInput] = useState("0");
    const [maxBudgetInput, setMaxBudgetInput] = useState("200000");
    const [selectedTags, setSelectedTags] = useState([]);
    const [tourType, setTourType] = useState('All');
    const [daysValue, setDaysValue] = useState([10]);
    const [daysInput, setDaysInput] = useState("10");
    const [travelersValue, setTravelersValue] = useState("");

    const getAvailabilityStatus = (slots) => {
        if (slots === undefined || slots === null) return "Available"; 
        if (slots <= 0) return "Sold out";
        if (slots <= 5) return "Few slots";
        return "Available";
    };

    // 🔥 CATCH FILTERS FROM HOME SCREEN 🔥
    useEffect(() => {
        if (route?.params) {
            const p = route.params;
            if (p.searchQuery) setSearchText(p.searchQuery);
            if (p.budgetRange) {
                setBudgetRange(p.budgetRange);
                setMinBudgetInput(String(p.budgetRange[0]));
                setMaxBudgetInput(String(p.budgetRange[1]));
            }
            if (p.tourType && p.tourType !== 'Tour Type' && p.tourType !== 'All Types') {
                setTourType(p.tourType);
            }
            if (p.travelers) setTravelersValue(p.travelers);
            if (Array.isArray(p.selectedTags) && p.selectedTags.length > 0) {
                setSelectedTags(p.selectedTags);
            } else if (p.selectedTag && p.selectedTag !== 'Select tags' && p.selectedTag !== 'All Tags') {
                setSelectedTags([p.selectedTag]);
            }
            if (p.selectedDuration && p.selectedDuration !== 'Length of Stay' && p.selectedDuration !== 'All Durations') {
                const dayNum = parseInt(p.selectedDuration); // Extracts "3" from "3 Days"
                if (!isNaN(dayNum)) setDaysValue([dayNum]);
            }
        }
    }, [route?.params]);

    // 🔥 RESET FILTERS FUNCTION 🔥
    const resetFilters = () => {
        setBudgetRange([0, 200000]);
        setMinBudgetInput('0');
        setMaxBudgetInput('200000');
        setTourType('All');
        setTravelersValue('');
        setDaysValue([10]);
        setSelectedTags([]);
        setSearchText('');
    };

    // Reset filters when leaving the Packages screen so filters don't persist across navigation
    useEffect(() => {
        const unsub = navigation.addListener('blur', () => {
            resetFilters();
        });
        return unsub;
    }, [navigation]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");
                
                // Fetch Packages, Live Ratings, and Wishlist concurrently to match web
                const [pkgResponse, ratingResponse, wishlistResponse] = await Promise.all([
                    api.get('/package/get-packages'),
                    api.get('/rating/average-ratings').catch(() => ({ data: { averagesPayload: [] } })),
                    user?._id ? api.get('/wishlist', withUserHeader(user._id)).catch(() => ({ data: { wishlist: [] } })) : Promise.resolve({ data: { wishlist: [] } })
                ]);

                // Process Ratings Map
                const ratingMap = new Map();
                if (ratingResponse.data?.averagesPayload) {
                    ratingResponse.data.averagesPayload.forEach(r => {
                        ratingMap.set(String(r.id), Number(r.averageRating));
                    });
                }

                // Process Wishlist Map
                const wIds = new Set();
                const wMap = new Map();
                if (wishlistResponse.data?.wishlist) {
                    wishlistResponse.data.wishlist.forEach(entry => {
                        const pId = entry.packageId?._id || entry.packageId;
                        if (pId) {
                            wIds.add(String(pId));
                            wMap.set(String(pId), String(entry._id));
                        }
                    });
                }
                setWishlistedIds(wIds);
                setWishlistEntryMap(wMap);
                
                const mapped = pkgResponse.data.map((item) => {
                    let calculatedSlots = 0;
                    if (item.packageSpecificDate && Array.isArray(item.packageSpecificDate)) {
                        calculatedSlots = item.packageSpecificDate.reduce((sum, dateObj) => {
                            return sum + (Number(dateObj.slots) || Number(dateObj.availableSlots) || 0);
                        }, 0);
                    }
                    const finalSlots = item.packageAvailableSlots ?? item.slots ?? calculatedSlots;

                    // Calculate Discounts & True Ratings matching Web
                    const discountPercent = Number(item.packageDiscountPercent || 0);
                    const originalPrice = Number(item.packagePricePerPax || 0);
                    const discountedPrice = discountPercent > 0 ? originalPrice * (1 - discountPercent / 100) : originalPrice;
                    const rating = ratingMap.get(String(item._id)) || ratingMap.get(String(item.packageItem)) || Number(item.averageRating) || 0;

                    return {
                        id: item._id,
                        title: item.packageName,
                        description: item.packageDescription,
                        image: item.images?.[0] || "https://via.placeholder.com/800x500?text=No+Image",
                        packagePricePerPax: originalPrice,
                        discountPercent,
                        discountedPrice,
                        duration: `${item.packageDuration || 0} Days`,
                        packageDuration: item.packageDuration || 0,
                        packageType: item.packageType || "Domestic",
                        slots: finalSlots,
                        availability: getAvailabilityStatus(finalSlots),
                        rating: rating.toFixed(1),
                        packageTags: item.packageTags || [],
                        rawItem: item 
                    };
                });
                setPackages(mapped);

                if (user?._id) {
                    try {
                        const userResponse = await api.get(`/users/users/${user._id}`);
                        const currentUser = userResponse.data.user || userResponse.data;
                        if (currentUser && currentUser.email) {
                            updateUser({
                                firstname: currentUser.firstname,
                                lastname: currentUser.lastname,
                                email: currentUser.email,
                                profileImage: currentUser.profileImage || currentUser.profileImageUrl || ""
                            });
                        }
                    } catch (userErr) {
                        console.log("Could not sync user data:", userErr.message);
                    }
                }
            } catch (err) {
                console.log("Fetch Error: ", err.message);
                setError("Unable to load packages. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?._id]);

    const handleWishlistToggle = async (packageId) => {
        if (!user?._id) {
            Alert.alert("Login Required", "Please log in to manage your wishlist.");
            return;
        }
        
        const pId = String(packageId);
        const isWishlisted = wishlistedIds.has(pId);

        if (isWishlisted) {
            const entryId = wishlistEntryMap.get(pId);
            if (!entryId) return;

            try {
                await api.delete(`/wishlist/remove/${entryId}`, withUserHeader(user._id));
                setWishlistedIds(prev => {
                    const next = new Set(prev);
                    next.delete(pId);
                    return next;
                });
                setWishlistEntryMap(prev => {
                    const next = new Map(prev);
                    next.delete(pId);
                    return next;
                });
            } catch (error) {
                console.log("Remove wishlist error", error.message);
            }
        } else {
            try {
                await api.post('/wishlist/add', { packageId: pId }, withUserHeader(user._id));
                
                // Re-fetch to get the exact Entry ID from the database for future deletion
                const res = await api.get('/wishlist', withUserHeader(user._id));
                const wIds = new Set();
                const wMap = new Map();
                res.data.wishlist.forEach(entry => {
                    const id = entry.packageId?._id || entry.packageId;
                    if (id) {
                        wIds.add(String(id));
                        wMap.set(String(id), String(entry._id));
                    }
                });
                setWishlistedIds(wIds);
                setWishlistEntryMap(wMap);
            } catch (error) {
                console.log("Add wishlist error", error.message);
            }
        }
    };

    const tagOptions = useMemo(() => {
        const unique = new Set();
        packages.forEach(p => p.packageTags?.forEach(t => unique.add(t)));
        return Array.from(unique);
    }, [packages]);

    const filteredPackages = useMemo(() => {
        return packages.filter((item) => {
            const q = searchText.toLowerCase();
            const matchesSearch = !q || item.title.toLowerCase().includes(q) || item.packageTags.some(t => t.toLowerCase().includes(q));
            const matchesBudget = item.discountedPrice >= budgetRange[0] && item.discountedPrice <= budgetRange[1];
            const matchesTags = selectedTags.length === 0 || selectedTags.every(t => item.packageTags.includes(t));
            const matchesType = tourType === 'All' || item.packageType.toLowerCase() === tourType.toLowerCase();
            const matchesDays = item.packageDuration <= daysValue[0];
            const tv = Number(travelersValue);
            const matchesTravelers = !tv || item.slots >= tv;
            return matchesSearch && matchesBudget && matchesTags && matchesType && matchesDays && matchesTravelers;
        });
    }, [packages, searchText, budgetRange, selectedTags, tourType, daysValue, travelersValue]);

    const handleBudgetInputChange = (type, value) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        if (type === 'min') {
            setMinBudgetInput(numericValue);
            const num = Number(numericValue);
            if (num <= budgetRange[1]) setBudgetRange([num, budgetRange[1]]);
        } else {
            setMaxBudgetInput(numericValue);
            const num = Number(numericValue);
            if (num >= budgetRange[0] && num <= 200000) setBudgetRange([budgetRange[0], num]);
        }
    };

    const handleDaysInputChange = (value) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        setDaysInput(numericValue);
        const num = Number(numericValue);
        if (num >= 1 && num <= 10) setDaysValue([num]);
    };

    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView style={DestinationStyles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <View style={DestinationStyles.heroBanner}>
                    <Image
                        source={require('../../assets/images/Destination_BackgroundImage.jpg')}
                        style={DestinationStyles.heroBannerImage}
                        contentFit="cover"
                        transition={300}
                    />
                    <View style={DestinationStyles.heroBannerOverlay}>
                        <Text style={DestinationStyles.heroBannerTitle}>Find your destination</Text>
                        <Text style={DestinationStyles.heroBannerSubtitle}>Plan trips that match your budget and travel style.</Text>
                    </View>
                </View>

                <Text style={DestinationStyles.heroTitle}>Destinations & Packages</Text>
                <Text style={DestinationStyles.heroSubtitle}>Find the best tour packages that match your budget, activities, and schedule.</Text>

                <View style={DestinationStyles.searchRow}>
                    <View style={DestinationStyles.searchBar}>
                        <Ionicons name="search" size={18} color="#777" />
                        <TextInput style={DestinationStyles.searchInput} placeholder="Search here" placeholderTextColor="#999" value={searchText} onChangeText={setSearchText} />
                    </View>
                    <TouchableOpacity style={DestinationStyles.filterButton} onPress={() => setFilterModalVisible(true)}>
                        <Ionicons name="options-outline" size={18} color="#fff" />
                        <Text style={DestinationStyles.filterButtonText}>Filters</Text>
                    </TouchableOpacity>
                </View>

                <View style={DestinationStyles.resultsHeader}>
                    <Text style={DestinationStyles.resultsTitle}>Available Packages</Text>
                    <Text style={DestinationStyles.resultsCount}>
                        {filteredPackages.length === 1 ? '1 found' : `${filteredPackages.length} found`}
                    </Text>
                </View>

                {loading ? <ActivityIndicator size="large" color="#305797" style={{marginTop: 50}} /> : error ? <Text style={{color:'red', textAlign:'center', marginTop: 20}}>{error}</Text> : (
                    filteredPackages.map((item) => {
                        const tv = Number(travelersValue);
                        const originalPrice = (tv > 0) ? item.packagePricePerPax * tv : item.packagePricePerPax;
                        const displayPrice = (tv > 0) ? item.discountedPrice * tv : item.discountedPrice;
                        const isWishlisted = wishlistedIds.has(String(item.id));
                        
                        return (
                            <View key={item.id} style={DestinationStyles.packageCard}>
                                <Image 
                                    source={item.image} 
                                    style={DestinationStyles.packageImage}
                                    contentFit="cover"
                                    transition={300} 
                                />
                                <View style={DestinationStyles.packageContent}>
                                    
                                    <View style={DestinationStyles.cardHeaderRow}>
    <Text style={DestinationStyles.packageTitle} numberOfLines={2}>{item.title}</Text>
    {/* 🔥 Removed the "hide if 0.0" condition so the star is always visible */}
    <View style={DestinationStyles.ratingContainer}>
        <Ionicons name="star" size={14} color="#facc15" />
        <Text style={DestinationStyles.ratingText}>{item.rating}</Text>
    </View>
</View>

                                    <View style={DestinationStyles.cardSubHeaderRow}>
                                        <View style={[DestinationStyles.typeTag, { backgroundColor: item.packageType.toLowerCase() === 'domestic' ? '#fff3e0' : '#e8f4fd' }]}>
                                            <Text style={[DestinationStyles.typeTagText, { color: item.packageType.toLowerCase() === 'domestic' ? '#e65100' : '#0277bd' }]}>
                                                {item.packageType.toUpperCase()}
                                            </Text>
                                        </View>
                                        <View style={[DestinationStyles.availTag, { backgroundColor: item.availability === 'Available' ? '#e8f5e9' : item.availability === 'Sold out' ? '#ffebee' : '#fff8e1' }]}>
                                            <Text style={[DestinationStyles.availTagText, { color: item.availability === 'Available' ? '#2e7d32' : item.availability === 'Sold out' ? '#c62828' : '#f57f17' }]}>
                                                {item.availability.toUpperCase()}
                                            </Text>
                                        </View>
                                        <Text style={DestinationStyles.durationText}>{item.duration}</Text>
                                    </View>

                                    <View style={DestinationStyles.cardDetailsRow}>
                                        <View style={DestinationStyles.cardLeftColumn}>
                                            <Text style={DestinationStyles.slotsText}>Slots: {item.slots}</Text>
                                            {item.packageTags && item.packageTags.length > 0 && (
                                                <View style={DestinationStyles.packageTagsRow}>
                                                    {item.packageTags.slice(0, 4).map((tag, index) => (
                                                        <View key={index} style={DestinationStyles.tagPill}>
                                                            <Text style={DestinationStyles.tagText}>{tag}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                        
                                        <View style={DestinationStyles.cardRightColumn}>
                                            {item.discountPercent > 0 && (
                                                <View style={DestinationStyles.discountBadge}>
                                                    <Text style={DestinationStyles.discountBadgeText}>-{item.discountPercent}%</Text>
                                                </View>
                                            )}
                                            <TouchableOpacity onPress={() => handleWishlistToggle(item.id)} style={{ padding: 4 }}>
                                                <Ionicons 
                                                    name={isWishlisted ? "heart" : "heart-outline"} 
                                                    size={26} 
                                                    color={isWishlisted ? "#cf1322" : "#305797"} 
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={DestinationStyles.packageFooter}>
                                        <View style={DestinationStyles.priceContainer}>
                                            {tv > 1 ? (
                                                <Text style={{ fontSize: 11, color: '#777', marginBottom: 2 }}>
                                                    {formatPeso(item.discountedPrice)} x {tv} pax =
                                                </Text>
                                            ) : null}
                                            
                                            {item.discountPercent > 0 && (
                                                <Text style={DestinationStyles.packagePriceOld}>
                                                    {formatPeso(originalPrice)}
                                                </Text>
                                            )}

                                            <View style={DestinationStyles.priceRowBox}>
                                                <Text style={DestinationStyles.packagePrice}>{formatPeso(displayPrice)}</Text>
                                                <Text style={DestinationStyles.budgetPaxText}>
                                                    {item.discountPercent > 0 ? "Discounted / Pax" : "Budget / Pax"}
                                                </Text>
                                            </View>
                                        </View>

                                        <TouchableOpacity 
                                            style={DestinationStyles.viewDetailsButton} 
                                            onPress={() => navigation.navigate("packagedetails", { pkg: item.rawItem, id: item.id })}
                                        >
                                            <Text style={DestinationStyles.viewDetailsText}>View Details</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            <Modal visible={isFilterModalVisible} animationType="slide" transparent={true}>
                <View style={DestinationStyles.modalOverlay}>
                    <View style={[DestinationStyles.modalCard, { flex: 0.85 }]}>
                        <View style={DestinationStyles.modalHeader}>
                            <Text style={DestinationStyles.modalTitle}>Filters</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity>
                        </View>
                        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                            
                            <Text style={DestinationStyles.filterLabel}>Budget Range (₱)</Text>
                            <View style={DestinationStyles.budgetInputRow}>
                                <TextInput 
                                    style={DestinationStyles.budgetInputBox} 
                                    keyboardType="numeric"
                                    value={minBudgetInput}
                                    onChangeText={(val) => handleBudgetInputChange('min', val)}
                                />
                                <Text style={DestinationStyles.budgetInputText}>to</Text>
                                <TextInput 
                                    style={DestinationStyles.budgetInputBox} 
                                    keyboardType="numeric"
                                    value={maxBudgetInput}
                                    onChangeText={(val) => handleBudgetInputChange('max', val)}
                                />
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <MultiSlider 
                                    values={budgetRange} 
                                    sliderLength={width - 80} 
                                    onValuesChange={(vals) => {
                                        setBudgetRange(vals);
                                        setMinBudgetInput(String(vals[0]));
                                        setMaxBudgetInput(String(vals[1]));
                                    }} 
                                    min={0} max={200000} step={1000} 
                                    selectedStyle={{backgroundColor:'#305797'}} markerStyle={{backgroundColor:'#305797'}} 
                                />
                                <Text style={{ color: '#555', fontSize: 12, alignSelf: 'flex-start', marginLeft: 15 }}>{formatPeso(budgetRange[0])} - {formatPeso(budgetRange[1])}</Text>
                            </View>

                            <Text style={[DestinationStyles.filterLabel, {marginTop: 20}]}>Tour Type</Text>
                            <View style={DestinationStyles.filterPillContainer}>
                                {['All', 'Domestic', 'International'].map(t => (
                                    <TouchableOpacity key={t} style={[DestinationStyles.filterPill, tourType === t && DestinationStyles.filterPillSelected]} onPress={() => setTourType(t)}>
                                        <Text style={[DestinationStyles.filterPillText, tourType === t && { color: '#000' }]}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[DestinationStyles.filterLabel, { marginTop: 20 }]}>Travelers</Text>
                            <TextInput 
                                style={DestinationStyles.searchBar} 
                                placeholder="How many travellers?" 
                                keyboardType="numeric" 
                                value={travelersValue} 
                                onChangeText={(text) => setTravelersValue(text.replace(/[^0-9]/g, ''))} 
                            />
                            <Text style={DestinationStyles.filterSubtext}>Show packages with available slots for your group size</Text>

                            <Text style={[DestinationStyles.filterLabel, { marginTop: 20 }]}>Days of Tour</Text>
                            <View style={DestinationStyles.daysInputRow}>
                                <TextInput 
                                    style={DestinationStyles.daysInputBox} 
                                    keyboardType="numeric"
                                    value={daysInput}
                                    onChangeText={handleDaysInputChange}
                                />
                                <Text style={DestinationStyles.daysMaxText}>Max{'\n'}Days</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <MultiSlider 
                                    values={daysValue} 
                                    sliderLength={width - 80} 
                                    onValuesChange={(vals) => {
                                        setDaysValue(vals);
                                        setDaysInput(String(vals[0]));
                                    }} 
                                    min={1} max={10} step={1} 
                                    selectedStyle={{backgroundColor:'#305797'}} markerStyle={{backgroundColor:'#305797'}} 
                                />
                                <Text style={{ color: '#555', fontSize: 12, alignSelf: 'flex-start', marginLeft: 15 }}>Up to {daysValue[0]} days</Text>
                            </View>
                            
                            {tagOptions.length > 0 && (
                                <>
                                    <Text style={[DestinationStyles.filterLabel, { marginTop: 20 }]}>Tags / Activities</Text>
                                    <View style={DestinationStyles.filterPillContainer}>
                                        {tagOptions.map(tag => (
                                            <TouchableOpacity key={tag} style={[DestinationStyles.filterPill, selectedTags.includes(tag) && DestinationStyles.filterPillSelected]} onPress={() => {
                                                setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
                                            }}>
                                                <Text style={[DestinationStyles.filterPillText, selectedTags.includes(tag) && { color: '#000' }]}>{tag}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            )}
                        </ScrollView>
                        <TouchableOpacity style={[DestinationStyles.primaryButton, { marginTop: 15 }]} onPress={() => setFilterModalVisible(false)}>
                            <Text style={DestinationStyles.primaryText}>Apply Filters</Text>
                        </TouchableOpacity>

                        {/* 🔥 NEW RESET BUTTON 🔥 */}
                        <TouchableOpacity style={DestinationStyles.resetButton} onPress={resetFilters}>
                            <Text style={DestinationStyles.resetText}>Reset Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Chatbot />
        </View>
    );
}