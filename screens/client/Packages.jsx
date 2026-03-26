import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, Modal, Dimensions, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

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
    const [budgetRange, setBudgetRange] = useState([0, 150000]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [tourType, setTourType] = useState('All');
    const [daysValue, setDaysValue] = useState([15]);
    const [travelersValue, setTravelersValue] = useState("");

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true);
                setError("");
                
                const response = await api.get('/package/get-packages');
                
                const mapped = response.data.map((item) => ({
                    id: item._id,
                    title: item.packageName,
                    description: item.packageDescription,
                    image: item.images?.[0] || "https://via.placeholder.com/800x500?text=No+Image",
                    packagePricePerPax: item.packagePricePerPax || 0,
                    duration: `${item.packageDuration || 0} Days`,
                    packageDuration: item.packageDuration || 0,
                    packageType: item.packageType || "Domestic",
                    packageAvailableSlots: item.packageAvailableSlots || 0,
                    packageTags: item.packageTags || [],
                    rawItem: item 
                }));
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
            const matchesTravelers = !tv || item.packageAvailableSlots >= tv;
            return matchesSearch && matchesBudget && matchesTags && matchesType && matchesDays && matchesTravelers;
        });
    }, [packages, searchText, budgetRange, selectedTags, tourType, daysValue, travelersValue]);

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

                {loading ? <ActivityIndicator size="large" color="#305797" style={{marginTop: 50}} /> : error ? <Text style={{color:'red', textAlign:'center', marginTop: 20}}>{error}</Text> : (
                    filteredPackages.map((item) => {
                        const tv = Number(travelersValue);
                        const displayPrice = (tv > 0) ? item.packagePricePerPax * tv : item.packagePricePerPax;
                        
                        return (
                            <View key={item.id} style={DestinationStyles.packageCard}>
                                <Image source={{ uri: item.image }} style={DestinationStyles.packageImage} />
                                <View style={DestinationStyles.packageContent}>
                                    <Text style={DestinationStyles.packageTitle}>{item.title}</Text>
                                    <Text style={DestinationStyles.packageTypeLabel}>{item.packageType} • {item.duration}</Text>
                                    
                                    {/* 1. NEW FEATURE: Render Tags dynamically */}
                                    {item.packageTags && item.packageTags.length > 0 && (
                                        <View style={DestinationStyles.packageTagsRow}>
                                            {/* We slice to 4 so it doesn't overflow the card and look messy */}
                                            {item.packageTags.slice(0, 4).map((tag, index) => (
                                                <View key={index} style={DestinationStyles.tagPill}>
                                                    <Text style={DestinationStyles.tagText}>{tag}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    <View style={DestinationStyles.packageFooter}>
                                        <View style={DestinationStyles.priceContainer}>
                                            {/* 2. NEW FEATURE: Dynamic Computation Display */}
                                            {tv > 1 ? (
                                                <>
                                                    <Text style={{ fontSize: 11, color: '#777', marginBottom: 2 }}>
                                                        {formatPeso(item.packagePricePerPax)} x {tv} pax =
                                                    </Text>
                                                    <Text style={DestinationStyles.packagePrice}>{formatPeso(displayPrice)}</Text>
                                                </>
                                            ) : (
                                                <Text style={DestinationStyles.packagePrice}>{formatPeso(displayPrice)}</Text>
                                            )}
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
                            <View style={{ alignItems: 'center' }}>
                                <MultiSlider values={budgetRange} sliderLength={width - 80} onValuesChange={setBudgetRange} min={0} max={150000} step={1000} selectedStyle={{backgroundColor:'#305797'}} markerStyle={{backgroundColor:'#305797'}} />
                                <Text style={{ color: '#555', fontSize: 12 }}>{formatPeso(budgetRange[0])} - {formatPeso(budgetRange[1])}</Text>
                            </View>

                            <Text style={DestinationStyles.filterLabel}>Tour Type</Text>
                            <View style={DestinationStyles.filterPillContainer}>
                                {['All', 'Domestic', 'International'].map(t => (
                                    <TouchableOpacity key={t} style={[DestinationStyles.filterPill, tourType === t && DestinationStyles.filterPillSelected]} onPress={() => setTourType(t)}>
                                        <Text style={[DestinationStyles.filterPillText, tourType === t && { color: '#fff' }]}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[DestinationStyles.filterLabel, { marginTop: 15 }]}>Max Days: {daysValue[0]}</Text>
                            <View style={{ alignItems: 'center' }}>
                                <MultiSlider values={daysValue} sliderLength={width - 80} onValuesChange={setDaysValue} min={1} max={15} step={1} selectedStyle={{backgroundColor:'#305797'}} markerStyle={{backgroundColor:'#305797'}} />
                            </View>

                            <Text style={DestinationStyles.filterLabel}>Group Size</Text>
                            <TextInput 
                                style={DestinationStyles.searchBar} 
                                placeholder="Number of travelers" 
                                keyboardType="numeric" 
                                value={travelersValue} 
                                // 3. NEW FEATURE: Regex blocks non-numbers instantly
                                onChangeText={(text) => setTravelersValue(text.replace(/[^0-9]/g, ''))} 
                            />
                            
                            {tagOptions.length > 0 && (
                                <>
                                    <Text style={DestinationStyles.filterLabel}>Tags / Activities</Text>
                                    <View style={DestinationStyles.filterPillContainer}>
                                        {tagOptions.map(tag => (
                                            <TouchableOpacity key={tag} style={[DestinationStyles.filterPill, selectedTags.includes(tag) && DestinationStyles.filterPillSelected]} onPress={() => {
                                                setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
                                            }}>
                                                <Text style={[DestinationStyles.filterPillText, selectedTags.includes(tag) && { color: '#fff' }]}>{tag}</Text>
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