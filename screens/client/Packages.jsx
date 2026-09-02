import React, { useEffect, useMemo, useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Dimensions, ActivityIndicator, ToastAndroid, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { Image } from 'expo-image';

import DestinationStyles from "../../styles/clientstyles/DestinationStyles";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Chatbot from "../../components/Chatbot";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";

import {
    useFonts,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

const { width } = Dimensions.get('window');

const formatPeso = (value) => `₱${(Number(value) || 0).toLocaleString("en-PH")}`;

const showToast = (message) => {
    if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
        return;
    }
};

export default function Packages({ navigation, route }) {
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_600SemiBold,
        Montserrat_700Bold,
    });


    const { user, updateUser } = useUser();
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    //wishlist States
    const [wishlistedIds, setWishlistedIds] = useState(new Set());
    const [wishlistEntryMap, setWishlistEntryMap] = useState(new Map());

    //filter States
    const [searchText, setSearchText] = useState("");
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [budgetRange, setBudgetRange] = useState([0, 300000]);
    const [minBudgetInput, setMinBudgetInput] = useState("0");
    const [maxBudgetInput, setMaxBudgetInput] = useState("300000");
    const [selectedTags, setSelectedTags] = useState([]);
    const [tourType, setTourType] = useState('All');
    const [daysValue, setDaysValue] = useState([10]);
    const [daysInput, setDaysInput] = useState("10");
    const [travelersValue, setTravelersValue] = useState("");
    const [visibleCount, setVisibleCount] = useState(10);

    const [budgetFilterActive, setBudgetFilterActive] = useState(false);
    const [tourTypeFilterActive, setTourTypeFilterActive] = useState(false);
    const [travelersFilterActive, setTravelersFilterActive] = useState(false);
    const [daysFilterActive, setDaysFilterActive] = useState(false);
    const [tagsFilterActive, setTagsFilterActive] = useState(false);


    const [wishlistModalVisible, setWishlistModalVisible] = useState(false);
    const [wishlistAction, setWishlistAction] = useState("");

    const scrollViewRef = useRef(null);
    const [showScrollTop, setShowScrollTop] = useState(false);


    const scrollToTop = () => {
        scrollViewRef.current?.scrollTo({
            y: 0,
            animated: true,
        });
    };


    //get availability status based on slots
    const getAvailabilityStatus = (slots) => {
        if (slots === undefined || slots === null) return "Available";
        if (slots <= 0) return "Sold out";
        if (slots <= 5) return "Few slots";
        return "Available";
    };


    //catch route params for filters if navigated from other screens 
    useEffect(() => {
        if (route?.params) {
            const p = route.params;

            if (p.searchQuery) {
                setSearchText(p.searchQuery);
            }

            if (p.budgetRange) {
                setBudgetRange(p.budgetRange);
                setMinBudgetInput(String(p.budgetRange[0]));
                setMaxBudgetInput(String(p.budgetRange[1]));

                setBudgetFilterActive(true);
            }

            if (
                p.tourType &&
                p.tourType !== 'Tour Type' &&
                p.tourType !== 'All Types' &&
                p.tourType !== 'All'
            ) {
                setTourType(p.tourType);
                setTourTypeFilterActive(true);
            }

            if (p.travelers) {
                setTravelersValue(String(p.travelers));
                setTravelersFilterActive(true);
            }

            if (
                Array.isArray(p.selectedTags) &&
                p.selectedTags.length > 0
            ) {
                setSelectedTags(p.selectedTags);
                setTagsFilterActive(true);
            } else if (
                p.selectedTag &&
                p.selectedTag !== 'Select tags' &&
                p.selectedTag !== 'All Tags'
            ) {
                setSelectedTags([p.selectedTag]);
                setTagsFilterActive(true);
            }

            if (
                p.selectedDuration &&
                p.selectedDuration !== 'Length of Stay' &&
                p.selectedDuration !== 'All Durations'
            ) {
                const dayNum = parseInt(p.selectedDuration);

                if (!isNaN(dayNum)) {
                    setDaysValue([dayNum]);
                    setDaysInput(String(dayNum));
                    setDaysFilterActive(true);
                }
            }
        }
    }, [route?.params]);


    //reset all filters to default values
    const resetFilters = () => {
        setBudgetRange([0, 300000]);
        setMinBudgetInput('0');
        setMaxBudgetInput('300000');

        setTourType('All');
        setTravelersValue('');

        setDaysValue([maxDaysAvailable]);
        setDaysInput(String(maxDaysAvailable));

        setSelectedTags([]);
        setSearchText('');

        // Disable all filters again
        setBudgetFilterActive(false);
        setTourTypeFilterActive(false);
        setTravelersFilterActive(false);
        setDaysFilterActive(false);
        setTagsFilterActive(false);
    };


    //reset filters when navigating away from the screen
    useEffect(() => {
        const unsub = navigation.addListener('blur', () => {
            resetFilters();
        });
        return unsub;
    }, [navigation]);


    //fetch packages, ratings, and wishlist data from the API
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
                        console.error("Could not sync user data:", userErr.message);
                    }
                }
            } catch (err) {
                console.error("Fetch Error: ", err.message);
                setError("Unable to load packages. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?._id]);


    //handle wishlist toggle for adding/removing packages from the user's wishlist
    const handleWishlistToggle = async (packageId) => {
        if (!user?._id) {
            showToast("Please log in to manage your wishlist.");
            return;
        }

        const pId = String(packageId);
        const isWishlisted = wishlistedIds.has(pId);

        if (isWishlisted) {
            try {
                await api.delete('/wishlist/remove', {
                    ...withUserHeader(user._id),
                    data: { packageId: pId },
                });
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
                setWishlistAction("removed");
                setWishlistModalVisible(true);
            } catch (error) {
                console.error('Remove wishlist error', error.message);
                showToast('Failed to remove from wishlist. Please try again.');
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
                setWishlistAction("added");
                setWishlistModalVisible(true);
            } catch (error) {
                console.error('Add wishlist error', error.message);
                showToast('Failed to add to wishlist. Please try again.');
            }
        }
    };


    //generate unique tag options from the available packages for filtering
    const tagOptions = useMemo(() => {
        const unique = new Set();
        packages.forEach(p => p.packageTags?.forEach(t => unique.add(t)));
        return Array.from(unique);
    }, [packages]);


    // calculate the maximum days available from the packages for the days filter
    const maxDaysAvailable = useMemo(() => {
        if (packages.length === 0) return 10;
        const maxDays = Math.max(...packages.map(p => p.packageDuration || 0));
        return maxDays > 0 ? maxDays : 10;
    }, [packages]);


    //update the days filter if the maximum available days changes
    useEffect(() => {
        if (daysValue[0] > maxDaysAvailable) {
            setDaysValue([maxDaysAvailable]);
            setDaysInput(String(maxDaysAvailable));
        }
    }, [maxDaysAvailable]);


    //filter the packages based on search text, budget range, selected tags, tour type, days, and travelers
    const filteredPackages = useMemo(() => {
        return packages.filter((item) => {
            const q = searchText.trim().toLowerCase();

            // Search only applies when user enters something
            const matchesSearch =
                !q ||
                item.title.toLowerCase().includes(q) ||
                item.packageTags.some(tag =>
                    tag.toLowerCase().includes(q)
                );

            // Budget ignored until user edits it
            const matchesBudget =
                !budgetFilterActive ||
                (
                    item.discountedPrice >= budgetRange[0] &&
                    item.discountedPrice <= budgetRange[1]
                );

            // Tags ignored until user selects one
            const matchesTags =
                !tagsFilterActive ||
                selectedTags.length === 0 ||
                selectedTags.every(tag =>
                    item.packageTags.includes(tag)
                );

            // Tour type ignored until explicitly selected
            const matchesType =
                !tourTypeFilterActive ||
                tourType === 'All' ||
                item.packageType.toLowerCase() === tourType.toLowerCase();

            // Days ignored until user edits it
            const matchesDays =
                !daysFilterActive ||
                item.packageDuration <= daysValue[0];

            const tv = Number(travelersValue);

            // Travelers ignored until user enters a value
            const matchesTravelers =
                !travelersFilterActive ||
                !tv ||
                item.slots >= tv;

            return (
                matchesSearch &&
                matchesBudget &&
                matchesTags &&
                matchesType &&
                matchesDays &&
                matchesTravelers
            );
        });
    }, [
        packages,
        searchText,
        budgetRange,
        selectedTags,
        tourType,
        daysValue,
        travelersValue,
        budgetFilterActive,
        tourTypeFilterActive,
        travelersFilterActive,
        daysFilterActive,
        tagsFilterActive
    ]);

    const visiblePackages = useMemo(() => filteredPackages.slice(0, visibleCount), [filteredPackages, visibleCount]);


    //update the visible count whenever the filtered packages change, resetting to show a maximum of 10 packages
    useEffect(() => {
        setVisibleCount(Math.min(10, filteredPackages.length));
    }, [filteredPackages]);


    //handle changes to the budget input fields
    const handleBudgetInputChange = (type, value) => {
        setBudgetFilterActive(true);

        const numericValue = value.replace(/[^0-9]/g, '');

        if (type === 'min') {
            setMinBudgetInput(numericValue);

            const num = Number(numericValue);

            if (num <= budgetRange[1]) {
                setBudgetRange([num, budgetRange[1]]);
            }
        } else {
            setMaxBudgetInput(numericValue);

            const num = Number(numericValue);

            if (num >= budgetRange[0] && num <= 500000) {
                setBudgetRange([budgetRange[0], num]);
            }
        }
    };


    //handle changes to the days input field, ensuring it remains within valid bounds
    const handleDaysInputChange = (value) => {
        setDaysFilterActive(true);

        const numericValue = value.replace(/[^0-9]/g, '');

        setDaysInput(numericValue);

        const num = Number(numericValue);

        if (num >= 1 && num <= maxDaysAvailable) {
            setDaysValue([num]);
        }
    };


    //handle the "Load More" button click to show more packages, up to the total number of filtered packages
    const handleLoadMore = () => {
        setVisibleCount(prev => Math.min(prev + 10, filteredPackages.length));
    };


    //handle the "See Less" button click to reduce the number of visible packages, but not below 10
    const handleSeeLess = () => {
        setVisibleCount(prev => Math.max(10, prev - 10));
    };




    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView
                ref={scrollViewRef}
                style={DestinationStyles.container}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={(event) => {
                    const scrollY = event.nativeEvent.contentOffset.y;

                    setShowScrollTop(scrollY > 400);
                }}
            >
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
                        <TextInput
                            maxLength={50}
                            style={DestinationStyles.searchInput}
                            placeholder="Search here..."
                            placeholderTextColor="#999"
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

                {loading ? <ActivityIndicator size="large" color="#305797" style={{ marginTop: 50 }} /> : error ? <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>{error}</Text> : (
                    <>
                        {visiblePackages.length === 0 ? (
                            <Text
                                style={{
                                    textAlign: "center",
                                    marginTop: 40,
                                    marginBottom: 40,
                                    fontSize: 18,
                                    fontFamily: "Montserrat_500Medium",
                                    color: "#777",
                                }}
                            >
                                No results
                            </Text>
                        ) : (visiblePackages.map((item) => {
                            const tv = Number(travelersValue);

                            const originalPrice =
                                tv > 0
                                    ? item.packagePricePerPax * tv
                                    : item.packagePricePerPax;

                            const displayPrice =
                                tv > 0
                                    ? item.discountedPrice * tv
                                    : item.discountedPrice;

                            const isWishlisted = wishlistedIds.has(String(item.id));
                            const isSoldOut = item.availability === "Sold out";

                            const availabilityColors = isSoldOut
                                ? {
                                    backgroundColor: "#ef4444",
                                    color: "#ffffff"
                                }
                                : item.availability === "Few slots"
                                    ? {
                                        backgroundColor: "#f59e0b",
                                        color: "#ffffff"
                                    }
                                    : {
                                        backgroundColor: "#00bf63",
                                        color: "#ffffff"
                                    };

                            return (
                                <View
                                    key={item.id}
                                    style={DestinationStyles.packageCard}
                                >
                                    <View style={DestinationStyles.packageImageWrapper}>
                                        <Image
                                            source={item.image}
                                            style={DestinationStyles.packageImage}
                                            contentFit="cover"
                                            transition={300}
                                        />

                                        {item.discountPercent > 0 && (
                                            <View style={DestinationStyles.discountRibbon}>
                                                <Text style={DestinationStyles.discountRibbonText}>
                                                    {item.discountPercent}% OFF
                                                </Text>
                                            </View>
                                        )}

                                        <TouchableOpacity
                                            onPress={() => handleWishlistToggle(item.id)}
                                            style={DestinationStyles.wishlistCircleButton}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons
                                                name={isWishlisted ? "heart" : "heart-outline"}
                                                size={28}
                                                color="#cf1322"
                                            />
                                        </TouchableOpacity>

                                        <View
                                            style={[
                                                DestinationStyles.imageAvailabilityBadge,
                                                {
                                                    backgroundColor:
                                                        availabilityColors.backgroundColor
                                                }
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    DestinationStyles.imageAvailabilityText,
                                                    {
                                                        color: availabilityColors.color
                                                    }
                                                ]}
                                            >
                                                {item.availability.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={DestinationStyles.packageContent}>
                                        <Text
                                            style={DestinationStyles.packageTitle}
                                            numberOfLines={2}
                                        >
                                            {item.title}
                                        </Text>

                                        <View style={DestinationStyles.priceDisplayRow}>
                                            {item.discountPercent > 0 && (
                                                <Text style={DestinationStyles.packagePriceOld}>
                                                    {formatPeso(originalPrice)}
                                                </Text>
                                            )}

                                            <Text style={DestinationStyles.packagePrice}>
                                                {formatPeso(displayPrice)}
                                            </Text>
                                        </View>

                                        <Text style={DestinationStyles.priceCaption}>
                                            {item.discountPercent > 0
                                                ? "Discounted price per person"
                                                : "Price per person"}
                                        </Text>

                                        {tv > 1 && (
                                            <Text style={DestinationStyles.travelerPriceText}>
                                                {formatPeso(item.discountedPrice)} × {tv} travelers
                                            </Text>
                                        )}

                                        <View style={DestinationStyles.packageMetaRow}>
                                            <Text style={DestinationStyles.packageMetaText}>
                                                {item.duration}
                                            </Text>

                                            <Text style={DestinationStyles.packageMetaDot}>
                                                •
                                            </Text>

                                            <Text style={DestinationStyles.packageMetaText}>
                                                {item.packageType}
                                            </Text>
                                        </View>

                                        {item.packageTags &&
                                            item.packageTags.length > 0 && (
                                                <View style={DestinationStyles.packageTagsRow}>
                                                    {item.packageTags
                                                        .slice(0, 3)
                                                        .map((tag, index) => (
                                                            <View
                                                                key={`${tag}-${index}`}
                                                                style={DestinationStyles.tagPill}
                                                            >
                                                                <Text
                                                                    style={DestinationStyles.tagText}
                                                                >
                                                                    {tag}
                                                                </Text>
                                                            </View>
                                                        ))}
                                                </View>
                                            )}

                                        <View style={DestinationStyles.packageStatsRow}>
                                            <View style={DestinationStyles.packageStatPill}>
                                                <Text style={DestinationStyles.packageStatText}>
                                                    Slots: {item.slots}
                                                </Text>
                                            </View>

                                            <View style={DestinationStyles.packageStatPill}>
                                                <Ionicons
                                                    name="star"
                                                    size={22}
                                                    color="#facc15"
                                                />

                                                <Text style={DestinationStyles.packageStatText}>
                                                    {item.rating}
                                                </Text>
                                            </View>
                                        </View>

                                        <TouchableOpacity
                                            style={[
                                                DestinationStyles.viewDetailsButton,
                                                isSoldOut &&
                                                DestinationStyles.viewDetailsButtonDisabled
                                            ]}
                                            onPress={() =>
                                                navigation.navigate("packagedetails", {
                                                    pkg: item.rawItem,
                                                    id: item.id
                                                })
                                            }
                                            disabled={isSoldOut}
                                            activeOpacity={0.85}
                                        >
                                            <Ionicons
                                                name="cart-outline"
                                                size={17}
                                                color="#ffffff"
                                            />

                                            <Text style={DestinationStyles.viewDetailsText}>
                                                {isSoldOut ? "SOLD OUT" : "BOOK NOW"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                        )}

                        {visibleCount > 10 && (
                            <TouchableOpacity onPress={handleSeeLess} style={{ alignSelf: 'center', marginVertical: 6 }}>
                                <Text style={{ color: '#305797', fontSize: 16, fontFamily: 'Montserrat_400Regular' }}>See less</Text>
                            </TouchableOpacity>
                        )}

                        {visibleCount < filteredPackages.length && (
                            <TouchableOpacity onPress={handleLoadMore} style={{ alignSelf: 'center', marginVertical: 12 }}>
                                <Text style={{ color: '#305797', fontSize: 16, fontFamily: 'Montserrat_400Regular' }}>Load more</Text>
                            </TouchableOpacity>
                        )}

                    </>
                )}
            </ScrollView>

            {showScrollTop && (
                <TouchableOpacity
                    onPress={scrollToTop}
                    activeOpacity={0.8}
                    style={{
                        position: "absolute",
                        right: 20,
                        bottom: 90,
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: "#305797",
                        justifyContent: "center",
                        alignItems: "center",

                        // Android
                        elevation: 6,

                        // iOS
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                    }}
                >
                    <Ionicons
                        name="arrow-up"
                        size={26}
                        color="#ffffff"
                    />
                </TouchableOpacity>
            )}

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
                                    maxLength={6}
                                    style={DestinationStyles.budgetInputBox}
                                    keyboardType="numeric"
                                    value={minBudgetInput}
                                    onChangeText={(val) => handleBudgetInputChange('min', val)}
                                />
                                <Text style={DestinationStyles.budgetInputText}>to</Text>
                                <TextInput
                                    maxLength={6}
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
                                        setBudgetFilterActive(true);
                                        setBudgetRange(vals);
                                        setMinBudgetInput(String(vals[0]));
                                        setMaxBudgetInput(String(vals[1]));
                                    }}
                                    min={0} max={500000} step={1000}
                                    selectedStyle={{ backgroundColor: '#305797' }} markerStyle={{ backgroundColor: '#305797' }}
                                />
                                <Text style={{ color: '#555', fontSize: 12, alignSelf: 'flex-start', marginLeft: 15 }}>{formatPeso(budgetRange[0])} - {formatPeso(budgetRange[1])}</Text>
                            </View>

                            <Text style={[DestinationStyles.filterLabel, { marginTop: 20 }]}>Tour Type</Text>
                            <View style={DestinationStyles.filterPillContainer}>
                                {['All', 'Domestic', 'International'].map(t => (
                                    <TouchableOpacity key={t} style={[DestinationStyles.filterPill, tourType === t && DestinationStyles.filterPillSelected]} onPress={() => {
                                        setTourType(t);

                                        if (t === 'All') {
                                            setTourTypeFilterActive(false);
                                        } else {
                                            setTourTypeFilterActive(true);
                                        }
                                    }}>
                                        <Text style={[DestinationStyles.filterPillText, tourType === t && { color: '#000' }]}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[DestinationStyles.filterLabel, { marginTop: 20 }]}>Travelers</Text>
                            <TextInput
                                maxLength={2}
                                style={DestinationStyles.searchBar}
                                placeholder="How many travellers?"
                                placeholderTextColor={"#999"}
                                keyboardType="numeric"
                                value={travelersValue}
                                onChangeText={(text) => {
                                    const cleaned = text.replace(/[^0-9]/g, '');

                                    setTravelersValue(cleaned);
                                    setTravelersFilterActive(cleaned !== '');
                                }}
                            />
                            <Text style={DestinationStyles.filterSubtext}>Show packages with available slots for your group size</Text>

                            <Text style={[DestinationStyles.filterLabel, { marginTop: 20 }]}>Days of Tour</Text>
                            <View style={DestinationStyles.daysInputRow}>
                                <TextInput
                                    style={DestinationStyles.daysInputBox}
                                    keyboardType="numeric"
                                    value={daysInput}
                                    onChangeText={handleDaysInputChange}
                                    maxLength={2}
                                />
                                <Text style={DestinationStyles.daysMaxText}>Max{'\n'}Days</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <MultiSlider
                                    values={daysValue}
                                    sliderLength={width - 80}
                                    onValuesChange={(vals) => {
                                        setDaysFilterActive(true);
                                        setDaysValue(vals);
                                        setDaysInput(String(vals[0]));
                                    }}
                                    min={1} max={maxDaysAvailable} step={1}
                                    selectedStyle={{ backgroundColor: '#305797' }} markerStyle={{ backgroundColor: '#305797' }}
                                />
                                <Text style={{ color: '#555', fontSize: 12, alignSelf: 'flex-start', marginLeft: 15, fontFamily: "Montserrat_500Medium" }}>Up to {daysValue[0]} days</Text>
                            </View>

                            {tagOptions.length > 0 && (
                                <>
                                    <Text style={[DestinationStyles.filterLabel, { marginTop: 20 }]}>Tags / Activities</Text>
                                    <View style={DestinationStyles.filterPillContainer}>
                                        {tagOptions.map(tag => (
                                            <TouchableOpacity
                                                key={tag}
                                                style={[DestinationStyles.filterPill, selectedTags.includes(tag) && DestinationStyles.filterPillSelected]}
                                                onPress={() => {
                                                    setSelectedTags(prev => {
                                                        const updatedTags = prev.includes(tag)
                                                            ? prev.filter(t => t !== tag)
                                                            : [...prev, tag];

                                                        setTagsFilterActive(updatedTags.length > 0);

                                                        return updatedTags;
                                                    });
                                                }}
                                            >
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

                        {/*  NEW RESET BUTTON  */}
                        <TouchableOpacity style={DestinationStyles.resetButton} onPress={resetFilters}>
                            <Text style={DestinationStyles.resetText}>Reset Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>



            <Modal
                visible={wishlistModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setWishlistModalVisible(false)}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.45)",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 20,
                    }}
                >
                    <View
                        style={{
                            backgroundColor: "#fff",
                            borderRadius: 18,
                            width: "85%",
                            padding: 25,
                            alignItems: "center",
                        }}
                    >
                        <View
                            style={{
                                width: 70,
                                height: 70,
                                borderRadius: 35,
                                backgroundColor:
                                    wishlistAction === "added"
                                        ? "#e8f8ee"
                                        : "#fdecec",
                                justifyContent: "center",
                                alignItems: "center",
                                marginBottom: 18,
                            }}
                        >
                            <Ionicons
                                name={
                                    wishlistAction === "added"
                                        ? "heart-outline"
                                        : "heart-dislike-outline"
                                }
                                size={42}
                                color={
                                    wishlistAction === "added"
                                        ? "#10b54f"
                                        : "#e83838"
                                }
                            />
                        </View>

                        <Text
                            style={{
                                fontSize: 22,
                                fontFamily: "Montserrat_700Bold",
                                color: "#222",
                                marginBottom: 10,
                                textAlign: "center",
                            }}
                        >
                            {wishlistAction === "added"
                                ? "Added!"
                                : "Removed!"}
                        </Text>

                        <Text
                            style={{
                                textAlign: "center",
                                color: "#666",
                                fontFamily: "Montserrat_500Medium",
                                marginBottom: 24,
                                lineHeight: 22,
                            }}
                        >
                            {wishlistAction === "added"
                                ? "The package has been added to your wishlist."
                                : "The package has been removed from your wishlist."}
                        </Text>

                        <TouchableOpacity
                            onPress={() => setWishlistModalVisible(false)}
                            style={{
                                backgroundColor: "#305797",
                                paddingVertical: 12,
                                width: "100%",
                                borderRadius: 10,
                            }}
                        >
                            <Text
                                style={{
                                    color: "#fff",
                                    textAlign: "center",
                                    fontFamily: "Montserrat_600SemiBold",
                                    fontSize: 16,
                                }}
                            >
                                OK
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}