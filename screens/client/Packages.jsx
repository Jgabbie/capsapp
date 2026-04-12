import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Dimensions, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
// --- OPTIMIZED IMAGE IMPORT ---
import { Image } from 'expo-image';

import DestinationStyles from "../../styles/clientstyles/DestinationStyles";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Chatbot from "../../components/Chatbot";
import { api } from "../../utils/api";

const { width } = Dimensions.get('window');

const formatPeso = (value) => `₱${(Number(value) || 0).toLocaleString("en-PH")}`;

export default function Packages({ navigation }) {
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filter States
    const [searchText, setSearchText] = useState("");
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    
    // 🔥 UPDATED: Budget States (Max 100,000)
    const [budgetRange, setBudgetRange] = useState([0, 100000]);
    const [minBudgetInput, setMinBudgetInput] = useState("0");
    const [maxBudgetInput, setMaxBudgetInput] = useState("100000");

    const [selectedTags, setSelectedTags] = useState([]);
    const [tourType, setTourType] = useState('All');
    
    // 🔥 UPDATED: Days States (Max 10)
    const [daysValue, setDaysValue] = useState([10]);
    const [daysInput, setDaysInput] = useState("10");

    const [travelersValue, setTravelersValue] = useState("");

    const getAvailabilityStatus = (slots) => {
        if (slots === undefined || slots === null) return "Available"; 
        if (slots <= 0) return "Sold out";
        if (slots <= 5) return "Few slots";
        return "Available";
    };

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true);
                setError("");
                
                const response = await api.get('/package/get-packages');
                
                const mapped = response.data.map((item) => {
                    // Extract exact slots calculation
                    let calculatedSlots = 0;
                    if (item.packageSpecificDate && Array.isArray(item.packageSpecificDate)) {
                        calculatedSlots = item.packageSpecificDate.reduce((sum, dateObj) => {
                            return sum + (Number(dateObj.slots) || Number(dateObj.availableSlots) || 0);
                        }, 0);
                    }
                    const finalSlots = item.packageAvailableSlots ?? item.slots ?? calculatedSlots;

                    return {
                        id: item._id,
                        title: item.packageName,
                        description: item.packageDescription,
                        image: item.images?.[0] || "https://via.placeholder.com/800x500?text=No+Image",
                        packagePricePerPax: item.packagePricePerPax || 0,
                        duration: `${item.packageDuration || 0} Days`,
                        packageDuration: item.packageDuration || 0,
                        packageType: item.packageType || "Domestic",
                        slots: finalSlots,
                        availability: getAvailabilityStatus(finalSlots),
                        rating: item.averageRating ? Number(item.averageRating).toFixed(1) : "0.0", // Safely fetch rating
                        packageTags: item.packageTags || [],
                        rawItem: item 
                    };
                });
                setPackages(mapped);
            } catch (err) {
                console.log("Fetch Error: ", err.message);
                setError("Unable to load packages. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    const tagOptions = useMemo(() => {
        const unique = new Set();
        packages.forEach(p => p.packageTags?.forEach(t => unique.add(t)));
        return Array.from(unique);
    }, [packages]);

    const filteredPackages = useMemo(() => {
        return packages.filter((item) => {
            const q = searchText.toLowerCase();
            const matchesSearch = !q || item.title.toLowerCase().includes(q) || item.packageTags.some(t => t.toLowerCase().includes(q));
            const matchesBudget = item.packagePricePerPax >= budgetRange[0] && item.packagePricePerPax <= budgetRange[1];
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
            // 🔥 CAP AT 100000 🔥
            if (num >= budgetRange[0] && num <= 100000) setBudgetRange([budgetRange[0], num]);
        }
    };

    const handleDaysInputChange = (value) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        setDaysInput(numericValue);
        const num = Number(numericValue);
        // 🔥 CAP AT 10 🔥
        if (num >= 1 && num <= 10) {
            setDaysValue([num]);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView style={DestinationStyles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                <Text style={DestinationStyles.heroTitle}>Destinations & Packages</Text>
                <Text style={DestinationStyles.heroSubtitle}>Find the best tour packages that match your budget.</Text>

                <View style={DestinationStyles.searchRow}>
                    <View style={DestinationStyles.searchBar}>
                        <Ionicons name="search" size={18} color="#777" />
                        <TextInput style={DestinationStyles.searchInput} placeholder="Search destination..." value={searchText} onChangeText={setSearchText} />
                    </View>
                    <TouchableOpacity style={DestinationStyles.filterButton} onPress={() => setFilterModalVisible(true)}>
                        <Ionicons name="options-outline" size={18} color="#fff" />
                        <Text style={DestinationStyles.filterButtonText}>Filters</Text>
                    </TouchableOpacity>
                </View>

                {/* 🔥 NEW RESULTS HEADER 🔥 */}
                <View style={DestinationStyles.resultsHeader}>
                    <Text style={DestinationStyles.resultsTitle}>Available Packages</Text>
                    <Text style={DestinationStyles.resultsCount}>
                        {filteredPackages.length === 1 ? '1 found' : `${filteredPackages.length} found`}
                    </Text>
                </View>

                {loading ? <ActivityIndicator size="large" color="#305797" style={{marginTop: 50}} /> : error ? <Text style={{color:'red', textAlign:'center', marginTop: 20}}>{error}</Text> : (
                    filteredPackages.map((item) => {
                        const tv = Number(travelersValue);
                        const displayPrice = (tv > 0) ? item.packagePricePerPax * tv : item.packagePricePerPax;
                        
                        return (
                            <View key={item.id} style={DestinationStyles.packageCard}>
                                <Image 
                                    source={item.image} 
                                    style={DestinationStyles.packageImage}
                                    contentFit="cover"
                                    transition={300} 
                                />
                                <View style={DestinationStyles.packageContent}>
                                    
                                    {/* 🔥 NEW: Title and Rating Row 🔥 */}
                                    <View style={DestinationStyles.cardHeaderRow}>
                                        <Text style={DestinationStyles.packageTitle} numberOfLines={2}>{item.title}</Text>
                                        {item.rating && item.rating !== "0.0" ? (
                                            <View style={DestinationStyles.ratingContainer}>
                                                <Ionicons name="star" size={14} color="#facc15" />
                                                <Text style={DestinationStyles.ratingText}>{item.rating}</Text>
                                            </View>
                                        ) : null}
                                    </View>

                                    {/* 🔥 NEW: Type, Availability, and Duration Row 🔥 */}
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

                                    {/* 🔥 NEW: Slots Text 🔥 */}
                                    <Text style={DestinationStyles.slotsText}>Slots: {item.slots}</Text>
                                    
                                    {/* Tags */}
                                    {item.packageTags && item.packageTags.length > 0 && (
                                        <View style={DestinationStyles.packageTagsRow}>
                                            {item.packageTags.slice(0, 4).map((tag, index) => (
                                                <View key={index} style={DestinationStyles.tagPill}>
                                                    <Text style={DestinationStyles.tagText}>{tag}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {/* Footer with Price and Button */}
                                    <View style={DestinationStyles.packageFooter}>
                                        <View style={DestinationStyles.priceContainer}>
                                            {tv > 1 ? (
                                                <Text style={{ fontSize: 11, color: '#777', marginBottom: 2 }}>
                                                    {formatPeso(item.packagePricePerPax)} x {tv} pax =
                                                </Text>
                                            ) : null}
                                            <View style={DestinationStyles.priceRowBox}>
                                                <Text style={DestinationStyles.packagePrice}>{formatPeso(displayPrice)}</Text>
                                                <Text style={DestinationStyles.budgetPaxText}>Budget / Pax</Text>
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
                                    min={0} max={100000} step={1000} 
                                    selectedStyle={{backgroundColor:'#305797'}} markerStyle={{backgroundColor:'#305797'}} 
                                />
                                <Text style={{ color: '#555', fontSize: 12, alignSelf: 'flex-start', marginLeft: 15 }}>₱0 - ₱100,000</Text>
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
                    </View>
                </View>
            </Modal>
            <Chatbot />
        </View>
    );
}