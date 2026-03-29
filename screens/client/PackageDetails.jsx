import React, { useEffect, useState, useMemo } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, Platform, KeyboardAvoidingView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";

import DestinationStyles from "../../styles/clientstyles/DestinationStyles";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";
import ModalStyle from "../../styles/componentstyles/ModalStyle";

const formatPeso = (value) => `₱${(Number(value) || 0).toLocaleString("en-PH")}`;

// Date formatters to match the web
const formatShortDate = (dateString) => {
    if (!dateString) return "";
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

const formatFullDate = (dateString) => {
    if (!dateString) return "";
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

const getImageUrl = (img) => {
    if (!img) return "https://via.placeholder.com/800x500?text=No+Image";
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    
    let host = "localhost";
    if (Platform.OS !== "web") {
        const hostUri = Constants.expoConfig?.hostUri || "";
        host = hostUri.split(":")[0] || "10.0.2.2";
    }
    return `http://${host}:8000/${img.replace(/^\/+/, "")}`;
};

export default function PackageDetails({ route, navigation }) {
    const { user } = useUser();
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    
    const [loading, setLoading] = useState(true);
    const [fullPkg, setFullPkg] = useState(null);
    const [reviews, setReviews] = useState([]);
    
    const [activeTab, setActiveTab] = useState("itinerary");
    const [showReviews, setShowReviews] = useState(false);
    
    const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
    const [isArrangementModalOpen, setIsArrangementModalOpen] = useState(false);
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);

    const [selectedArrangement, setSelectedArrangement] = useState("All in Package");
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    const passedPkg = route?.params?.pkg;
    const packageId = route?.params?.id || passedPkg?._id || passedPkg?.id;

    useEffect(() => {
        const loadData = async () => {
            let currentPkg = passedPkg;

            if (!packageId && !currentPkg) {
                Alert.alert("Error", "No package data found.");
                navigation.goBack();
                return;
            }

            try {
                if (!currentPkg || Object.keys(currentPkg).length === 0) {
                    const response = await api.get("/package/get-packages");
                    currentPkg = response.data.find(p => p._id === packageId || p.id === packageId);
                    
                    if (!currentPkg) {
                        Alert.alert("Error", "Package not found in database.");
                        navigation.goBack();
                        return;
                    }
                }

                setFullPkg({
                    ...currentPkg,
                    id: packageId,
                    title: currentPkg.packageName || currentPkg.title,
                    description: currentPkg.packageDescription || currentPkg.description,
                    price: currentPkg.packagePricePerPax || currentPkg.price || 0,
                    duration: currentPkg.packageDuration || parseInt(currentPkg.duration) || 0,
                    isInternational: (currentPkg.packageType || "").toLowerCase().includes("international"),
                    image: currentPkg.image || getImageUrl(currentPkg.images?.[0]),
                    packageSpecificDate: currentPkg.packageSpecificDate || [], 
                });

            } catch (err) {
                console.log("Error loading package data:", err.message);
            }

            try {
                const reviewResponse = await api.get(`/rating/package/${packageId}/ratings`, withUserHeader(user?._id));
                setReviews(reviewResponse.data || []);
            } catch (reviewErr) {
                console.log("No reviews yet or unauthorized to view reviews.");
            }

            setLoading(false); 
        };

        loadData();
    }, [packageId, user?._id]); 

    const averageRating = useMemo(() => {
        if (!reviews.length) return 0;
        const total = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
        return (total / reviews.length).toFixed(1);
    }, [reviews]);

    // 🔥 THIS IS THE FUNCTION THAT FIXED THE LOCAL PACKAGE BUG 🔥
    const handlePrimaryAction = () => {
        if (!user) {
            Alert.alert("Login Required", "Please login to proceed.");
            return;
        }
        // Always open the Arrangement Modal, regardless of package type
        setIsArrangementModalOpen(true);
    };

    const handleWishlistAdd = async () => {
        if (!user) {
            Alert.alert("Login Required", "Please login to save to your wishlist.");
            return;
        }
        try {
            await api.post('/wishlist/add', { packageId: fullPkg.id }, withUserHeader(user?._id));
            setIsWishlistModalOpen(true);
        } catch (error) {
            const errorMsg = error.response?.data?.message?.toLowerCase() || "";
            if (errorMsg.includes("already") || error.response?.status === 400) {
                Alert.alert("Notice", "Package already in your wishlist");
            } else {
                Alert.alert("Error", "Failed to add to wishlist.");
            }
        }
    };

    const handleSubmitReview = async () => {
        if (!user) {
            Alert.alert("Login Required", "Please login to submit a review.");
            return;
        }
        if (!reviewForm.rating || !reviewForm.comment.trim()) {
            Alert.alert("Required", "Please provide a rating and a comment.");
            return;
        }

        setIsSubmittingReview(true);
        try {
            await api.post('/rating/submit-rating', {
                packageId: fullPkg.id,
                rating: reviewForm.rating,
                review: reviewForm.comment.trim(),
            }, withUserHeader(user?._id));

            Alert.alert("Success", "Your review has been submitted!");
            setReviewForm({ rating: 0, comment: "" });
            
            const reviewResponse = await api.get(`/rating/package/${packageId}/ratings`, withUserHeader(user?._id));
            setReviews(reviewResponse.data || []);
        } catch (error) {
            Alert.alert("Error", "Unable to submit review.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (loading || !fullPkg) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#305797" />
                <Text style={{ marginTop: 10, color: "#305797" }}>Loading details...</Text>
            </View>
        );
    }

    return (
        <View style={DestinationStyles.detailsContainer}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }} keyboardShouldPersistTaps="handled">
                    <View style={DestinationStyles.detailsHeader}>
                        <Text style={DestinationStyles.detailsTitle}>{fullPkg.title}</Text>
                        <Image source={{ uri: fullPkg.image }} style={DestinationStyles.heroImage} />
                    </View>

                    <View style={DestinationStyles.heroCard}>
                        <Text style={DestinationStyles.heroDescription}>{fullPkg.description}</Text>
                        <View style={DestinationStyles.priceRow}>
                            <View>
                                <Text style={DestinationStyles.priceValue}>{formatPeso(fullPkg.price)}</Text>
                                <Text style={{fontSize: 10, color: '#777'}}>/ Pax</Text>
                            </View>
                            <TouchableOpacity style={DestinationStyles.availabilityButton} onPress={handlePrimaryAction}>
                                <Text style={DestinationStyles.availabilityText}>
                                    {fullPkg.isInternational ? "Check Availability" : "Get Quotation"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[DestinationStyles.wishlistContainer, { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 16 }]}>
                            <TouchableOpacity style={[DestinationStyles.wishlistButton, { flex: 1 }]} onPress={handleWishlistAdd}>
                                <Ionicons name="heart-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                                <Text style={DestinationStyles.wishlistButtonText}>Wishlist</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={[DestinationStyles.wishlistButton, { flex: 1, backgroundColor: "#f0f2f5" }]} onPress={() => setShowReviews(!showReviews)}>
                                <Ionicons name="star-outline" size={18} color="#305797" style={{ marginRight: 6 }} />
                                <Text style={[DestinationStyles.wishlistButtonText, { color: "#305797" }]}>
                                    {showReviews ? "View Details" : "Reviews"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {showReviews ? (
                        <View style={DestinationStyles.sectionBody}>
                            <Text style={DestinationStyles.sectionTitle}>Reviews & Ratings</Text>
                            <Text style={{ marginBottom: 16, color: "#777" }}>
                                Average Rating: <Text style={{ fontWeight: 'bold', color: '#d48806' }}>⭐ {averageRating}</Text> ({reviews.length} reviews)
                            </Text>

                            {reviews.length === 0 ? (
                                <Text style={{ color: "#777", fontStyle: "italic", marginBottom: 20 }}>No reviews yet for this package.</Text>
                            ) : (
                                reviews.map((r, i) => (
                                    <View key={i} style={DestinationStyles.recentReviewContainer}>
                                        <View style={DestinationStyles.reviewHeaderRow}>
                                            <Image 
                                                source={ r.userId?.profileImage ? { uri: getImageUrl(r.userId.profileImage) } : require('../../assets/images/profile_icon60.png') } 
                                                style={DestinationStyles.reviewProfileImg} 
                                            />
                                            <View style={DestinationStyles.reviewHeaderInfo}>
                                                <View>
                                                    <Text style={DestinationStyles.userReview}>{r.userId?.username || r.fullName || "User"}</Text>
                                                    <Text style={{ fontSize: 11, color: '#777', marginBottom: 4 }}>
                                                        {formatFullDate(r.createdAt || r.date)}
                                                    </Text>
                                                </View>
                                                <View style={DestinationStyles.userStarContainer}>
                                                    {[...Array(5)].map((_, idx) => (
                                                        <Ionicons key={idx} name={idx < r.rating ? "star" : "star-outline"} size={14} color="#f5a623" />
                                                    ))}
                                                </View>
                                            </View>
                                        </View>
                                        <Text style={{ color: "#333", fontSize: 13, marginTop: 4 }}>{r.review}</Text>
                                    </View>
                                ))
                            )}

                            <View style={DestinationStyles.reviewContainer}>
                                <Text style={DestinationStyles.reviewTitle}>Write a Review</Text>
                                <View style={DestinationStyles.starsContainer}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <TouchableOpacity key={star} onPress={() => setReviewForm({...reviewForm, rating: star})}>
                                            <Ionicons name={star <= reviewForm.rating ? "star" : "star-outline"} size={26} color="#f5a623" style={{ marginRight: 4 }} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <TextInput
                                    style={DestinationStyles.reviewInput}
                                    placeholder="Share your experience..."
                                    multiline
                                    value={reviewForm.comment}
                                    onChangeText={(val) => setReviewForm({...reviewForm, comment: val})}
                                />
                                <TouchableOpacity style={DestinationStyles.reviewButton} onPress={handleSubmitReview} disabled={isSubmittingReview}>
                                    <Text style={DestinationStyles.reviewButtonText}>
                                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <>
                            <View style={DestinationStyles.tabRow}>
                                {["itinerary", "inclusions", "terms"].map((tab) => (
                                    <TouchableOpacity key={tab} style={[DestinationStyles.tabButton, activeTab === tab && DestinationStyles.tabButtonActive]} onPress={() => setActiveTab(tab)}>
                                        <Text style={DestinationStyles.tabText}>{tab.toUpperCase()}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={DestinationStyles.sectionBody}>
                                {activeTab === "itinerary" && Object.entries(fullPkg.packageItineraries || {}).map(([day, items], i) => (
                                    <View key={i} style={{ marginBottom: 15 }}>
                                        <Text style={DestinationStyles.sectionTitle}>{day.toUpperCase()}</Text>
                                        {Array.isArray(items) ? items.map((item, j) => (
                                            <Text key={j} style={DestinationStyles.sectionText}>
                                                • {typeof item === 'object' ? (item.activity || item.optionalActivity) : item}
                                                {item.isOptional ? " (Optional)" : ""}
                                            </Text>
                                        )) : (
                                            <Text style={DestinationStyles.sectionText}>
                                                • {typeof items === 'object' ? (items.activity || items.optionalActivity) : items}
                                            </Text>
                                        )}
                                    </View>
                                ))}
                                
                                {activeTab === "inclusions" && (
                                    <>
                                        <Text style={DestinationStyles.sectionTitle}>INCLUSIONS</Text>
                                        {fullPkg.packageInclusions?.length > 0 ? fullPkg.packageInclusions.map((item, i) => (
                                            <Text key={i} style={DestinationStyles.sectionText}>
                                                ✓ {typeof item === 'object' ? (item.activity || item.optionalActivity || item.item) : item}
                                            </Text>
                                        )) : <Text style={DestinationStyles.sectionText}>None specified.</Text>}
                                        
                                        <Text style={[DestinationStyles.sectionTitle, { marginTop: 20 }]}>EXCLUSIONS</Text>
                                        {fullPkg.packageExclusions?.length > 0 ? fullPkg.packageExclusions.map((item, i) => (
                                            <Text key={i} style={DestinationStyles.sectionText}>
                                                ✕ {typeof item === 'object' ? (item.activity || item.optionalActivity || item.item) : item}
                                            </Text>
                                        )) : <Text style={DestinationStyles.sectionText}>None specified.</Text>}
                                    </>
                                )}

                                {activeTab === "terms" && (
                                    <>
                                        <Text style={DestinationStyles.sectionTitle}>TERMS AND CONDITIONS</Text>
                                        {fullPkg.packageTermsConditions?.length > 0 ? fullPkg.packageTermsConditions.map((item, i) => (
                                            <Text key={i} style={[DestinationStyles.sectionText, { marginBottom: 8 }]}>
                                                • {typeof item === 'object' ? (item.term || item.policy) : item}
                                            </Text>
                                        )) : <Text style={DestinationStyles.sectionText}>Standard agency terms apply.</Text>}
                                    </>
                                )}
                            </View>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal transparent animationType='fade' visible={isWishlistModalOpen} onRequestClose={() => setIsWishlistModalOpen(false)}>
                <View style={ModalStyle.modalOverlay}>
                    <View style={ModalStyle.modalBox}>
                        <Text style={ModalStyle.modalTitle}>Success</Text>
                        <Text style={ModalStyle.modalText}>Successfully added to your wishlist!</Text>
                        <TouchableOpacity style={ModalStyle.modalButton} onPress={() => setIsWishlistModalOpen(false)}>
                            <Text style={ModalStyle.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Arrangement Selection Modal */}
            <Modal visible={isArrangementModalOpen} transparent animationType="slide">
                <View style={[DestinationStyles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
                    <View style={DestinationStyles.arrangementModalCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <Text style={[DestinationStyles.modalTitle, { fontSize: 18, flex: 1 }]}>Select Your Package Arrangement</Text>
                            <TouchableOpacity onPress={() => setIsArrangementModalOpen(false)}>
                                <Ionicons name="close" size={24} color="#555" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TouchableOpacity style={[DestinationStyles.arrangementOptionCard, selectedArrangement === 'All in Package' && DestinationStyles.arrangementOptionCardSelected]} onPress={() => setSelectedArrangement('All in Package')} activeOpacity={0.8}>
                                <Image source={require('../../assets/images/fixedallin.jpg')} style={DestinationStyles.arrangementImage} />
                                <View style={DestinationStyles.arrangementTextContainer}>
                                    <Text style={DestinationStyles.arrangementTitleText}>All in Package</Text>
                                    <Text style={DestinationStyles.arrangementDesc}>In this selection, you will receive a fixed itinerary based on the current package. This allows you to proceed with the booking process without any changes to the package details.</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={[DestinationStyles.arrangementOptionCard, selectedArrangement === 'Private Tour' && DestinationStyles.arrangementOptionCardSelected]} onPress={() => setSelectedArrangement('Private Tour')} activeOpacity={0.8}>
                                <Image source={require('../../assets/images/allinpackage.jpg')} style={DestinationStyles.arrangementImage} />
                                <View style={DestinationStyles.arrangementTextContainer}>
                                    <Text style={DestinationStyles.arrangementTitleText}>Private Tour</Text>
                                    <Text style={DestinationStyles.arrangementDesc}>In this selection, you can customize the itinerary of the current package. This allows you to send quotation request for more personalized experience.</Text>
                                    <Text style={DestinationStyles.arrangementNote}>Note: This option may have a higher price than the All in Package arrangement, as it offers more flexibility and customization. The final price will depend on the specific changes you request.</Text>
                                </View>
                            </TouchableOpacity>
                        </ScrollView>
                        <TouchableOpacity style={DestinationStyles.proceedButton} onPress={() => {
                                setIsArrangementModalOpen(false);
                                if (selectedArrangement === 'All in Package') {
                                    setIsDateModalOpen(true);
                                } else {
                                    // Private Tour goes to the customization form
                                    navigation.navigate("quotationform", { pkg: fullPkg, arrangement: 'Land Arrangement' }); 
                                }
                            }}>
                            <Text style={DestinationStyles.proceedButtonText}>Proceed</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={DestinationStyles.cancelArrangementButton} onPress={() => setIsArrangementModalOpen(false)}>
                            <Text style={DestinationStyles.cancelArrangementText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Date Selection Modal */}
            <Modal visible={isDateModalOpen} transparent animationType="fade">
                <View style={[DestinationStyles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
                    <View style={DestinationStyles.dateSelectionModalCard}>
                        
                        <View style={{ marginBottom: 15 }}>
                            <Text style={[DestinationStyles.modalTitle, { fontSize: 18 }]}>Select Preferred Date</Text>
                            <Text style={{ fontSize: 12, color: '#555', marginTop: 4, fontWeight: 'bold' }}>
                                Available Dates for {fullPkg?.title?.toUpperCase()}
                            </Text>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {(fullPkg?.packageSpecificDate || []).length > 0 ? (
                                (fullPkg.packageSpecificDate).map((range, index) => {
                                    const isSelected = selectedSchedule === range;
                                    const cardPrice = (fullPkg.price || 0) + (range.extrarate || 0);
                                    
                                    return (
                                        <TouchableOpacity 
                                            key={index}
                                            style={[DestinationStyles.dateCard, isSelected && DestinationStyles.dateCardSelected]}
                                            onPress={() => setSelectedSchedule(range)}
                                            activeOpacity={0.8}
                                        >
                                            {isSelected && (
                                                <View style={DestinationStyles.selectedBadge}>
                                                    <Text style={DestinationStyles.selectedBadgeText}>SELECTED</Text>
                                                </View>
                                            )}

                                            <View style={DestinationStyles.dateRow}>
                                                <Ionicons name="calendar-outline" size={18} color="#305797" />
                                                <Text style={DestinationStyles.dateText}>
                                                    Dates: {formatShortDate(range.startdaterange)} - {formatShortDate(range.enddaterange)}
                                                </Text>
                                            </View>

                                            <View style={DestinationStyles.priceRowDate}>
                                                <Text style={DestinationStyles.priceTextDate}>
                                                    {formatPeso(cardPrice)} / pax
                                                </Text>
                                                <View style={DestinationStyles.slotsBadge}>
                                                    <Text style={DestinationStyles.slotsText}>
                                                        {range.slots} slots left
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })
                            ) : (
                                <Text style={{ textAlign: 'center', color: '#777', paddingVertical: 20 }}>
                                    No available dates for this package.
                                </Text>
                            )}
                        </ScrollView>

                        <View style={DestinationStyles.selectionFooter}>
                            <Text style={DestinationStyles.selectionFooterText}>
                                You have selected: <Text style={{ fontWeight: 'bold' }}>
                                    {selectedSchedule 
                                        ? `${formatFullDate(selectedSchedule.startdaterange)} - ${formatFullDate(selectedSchedule.enddaterange)}` 
                                        : "None"}
                                </Text>
                            </Text>

                            <View style={DestinationStyles.selectionFooterButtons}>
                                <TouchableOpacity 
                                    style={DestinationStyles.dateCancelButton} 
                                    onPress={() => {
                                        setIsDateModalOpen(false);
                                        setSelectedSchedule(null);
                                    }}
                                >
                                    <Text style={DestinationStyles.dateCancelText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[DestinationStyles.dateProceedButton, !selectedSchedule && DestinationStyles.dateProceedButtonDisabled]} 
                                    disabled={!selectedSchedule}
                                    onPress={() => {
                                        setIsDateModalOpen(false);
                                        
                                        const dateString = `${formatFullDate(selectedSchedule.startdaterange)} - ${formatFullDate(selectedSchedule.enddaterange)}`;
                                        const finalPrice = (fullPkg.price || 0) + (selectedSchedule.extrarate || 0);

                                        // 🔥 ROUTE TO NEW ALL-IN SCREEN 🔥
                                        navigation.navigate("quotationallin", { 
                                            pkg: fullPkg, 
                                            arrangement: 'All in Package', 
                                            selectedDate: dateString,
                                            selectedDatePrice: finalPrice,
                                            selectedDateRate: selectedSchedule.extrarate || 0
                                        }); 
                                    }}
                                >
                                    <Text style={DestinationStyles.dateProceedText}>Proceed</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>
                </View>
            </Modal>
        </View>
    );
}