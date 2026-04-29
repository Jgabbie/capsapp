import React, { useEffect, useState, useMemo, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Image } from 'expo-image';

import DestinationStyles from "../../styles/clientstyles/DestinationStyles";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";
import ModalStyle from "../../styles/componentstyles/ModalStyle";

const { width } = Dimensions.get('window');
const formatPeso = (value) => `₱${(Number(value) || 0).toLocaleString("en-PH")}`;

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
    const scrollViewRef = useRef(null); 
    const carouselRef = useRef(null);
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    
    const [loading, setLoading] = useState(true);
    const [fullPkg, setFullPkg] = useState(null);
    const [reviews, setReviews] = useState([]);
    
    // State to track wishlisted items for the heart icon
    const [wishlistedIds, setWishlistedIds] = useState(new Set());

    const [activeTab, setActiveTab] = useState("itinerary");
    const [showReviews, setShowReviews] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // Review Form States
    const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [isEditingReview, setIsEditingReview] = useState(false);

    // Modal States
    const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
    const [isArrangementModalOpen, setIsArrangementModalOpen] = useState(false);
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [isDeleteReviewModalOpen, setIsDeleteReviewModalOpen] = useState(false);

    const [selectedArrangement, setSelectedArrangement] = useState("All in Package");
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    const passedPkg = route?.params?.pkg;
    const packageId = route?.params?.id || passedPkg?._id || passedPkg?.id;

    const fetchReviewsData = async () => {
        try {
            const reviewResponse = await api.get(`/rating/package/${packageId}/ratings`, withUserHeader(user?._id));
            setReviews(reviewResponse.data || []);
        } catch (reviewErr) {
            console.log("No reviews yet or unauthorized.");
        }
    };

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
                    images: currentPkg.images || [currentPkg.image],
                    packageSpecificDate: currentPkg.packageSpecificDate || [], 
                    packageDiscountPercent: currentPkg.packageDiscountPercent || 0,
                    packageDeposit: currentPkg.packageDeposit || 0,
                    visaRequired: currentPkg.visaRequired || false,
                    rawPackage: currentPkg
                });

                if (user?._id) {
                    try {
                        const wishRes = await api.get('/wishlist', withUserHeader(user._id));
                        const items = wishRes.data.wishlist || wishRes.data;
                        const ids = new Set();
                        items.forEach(w => {
                            const pId = w.packageId?._id || w.packageId;
                            if (pId) ids.add(String(pId));
                        });
                        setWishlistedIds(ids);
                    } catch(e) {
                        console.log("Wishlist fetch error:", e.message);
                    }
                }

            } catch (err) {
                console.log("Error loading package data:", err.message);
            }

            await fetchReviewsData();
            setLoading(false); 
        };

        loadData();
    }, [packageId, user?._id]); 

    // Auto-Scrolling Image Carousel Logic
    useEffect(() => {
        if (!fullPkg?.images || fullPkg.images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => {
                const next = (prev + 1) % fullPkg.images.length;
                carouselRef.current?.scrollTo({ x: next * (width - 32), animated: true });
                return next;
            });
        }, 5000);
        return () => clearInterval(interval);
    }, [fullPkg?.images]);

    // Ratings Logic
    const averageRating = useMemo(() => {
        if (!reviews.length) return 0;
        const total = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
        return (total / reviews.length).toFixed(1);
    }, [reviews]);

    const ratingBreakdown = useMemo(() => {
        const breakdown = [0, 0, 0, 0, 0];
        reviews.forEach((review) => {
            const value = Math.round(Number(review.rating) || 0);
            if (value >= 1 && value <= 5) {
                breakdown[value - 1] += 1;
            }
        });
        return breakdown;
    }, [reviews]);

    const userReview = useMemo(() => {
        if (!user) return null;
        return reviews.find(r => {
            const rUserId = r.userId?._id || r.userId;
            return String(rUserId) === String(user._id);
        });
    }, [reviews, user]);

    // Handlers
    const handlePrimaryAction = () => {
        if (!user) {
            Alert.alert("Login Required", "Please login to proceed.");
            return;
        }
        setIsArrangementModalOpen(true);
    };

    const handleWishlistAdd = async () => {
        if (!user) {
            Alert.alert("Login Required", "Please login to save to your wishlist.");
            return;
        }
        try {
            await api.post('/wishlist/add', { packageId: fullPkg.id }, withUserHeader(user?._id));
            
            setWishlistedIds(prev => {
                const next = new Set(prev);
                next.add(String(fullPkg.id));
                return next;
            });

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

    const handleEditClick = () => {
        setReviewForm({ rating: userReview.rating, comment: userReview.review });
        setIsEditingReview(true);
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
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
            if (isEditingReview && userReview) {
                await api.put(`/rating/${userReview._id || userReview.id}`, {
                    rating: reviewForm.rating,
                    review: reviewForm.comment.trim(),
                }, withUserHeader(user._id));
                Alert.alert("Success", "Review updated!");
            } else {
                await api.post('/rating/submit-rating', {
                    packageId: fullPkg.id,
                    rating: reviewForm.rating,
                    review: reviewForm.comment.trim(),
                }, withUserHeader(user._id));
                Alert.alert("Success", "Review submitted!");
            }
            
            setReviewForm({ rating: 0, comment: "" });
            setIsEditingReview(false);
            await fetchReviewsData();
        } catch (error) {
            Alert.alert("Error", "Unable to submit review.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!userReview) return;
        setIsSubmittingReview(true);
        try {
            await api.delete(`/rating/${userReview._id || userReview.id}`, withUserHeader(user._id));
            Alert.alert("Success", "Review deleted.");
            setIsDeleteReviewModalOpen(false);
            setIsEditingReview(false);
            setReviewForm({ rating: 0, comment: "" });
            await fetchReviewsData();
        } catch (error) {
            Alert.alert("Error", "Unable to delete review.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const disableForm = isSubmittingReview || (!isEditingReview && !!userReview);

    if (loading || !fullPkg) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#305797" />
                <Text style={{ marginTop: 10, color: "#305797" }}>Loading details...</Text>
            </View>
        );
    }

    const totalSlots = fullPkg.packageAvailableSlots ?? fullPkg.slots ?? 
        (fullPkg.packageSpecificDate || []).reduce((sum, dateObj) => sum + (Number(dateObj.slots) || Number(dateObj.availableSlots) || 0), 0);
    const isPackageSoldOut = totalSlots <= 0 || fullPkg.availability === 'Sold out';
    
    const discountPercent = Number(fullPkg.packageDiscountPercent || 0);
    const basePrice = Number(fullPkg.price || 0);
    const baseDeposit = Number(fullPkg.packageDeposit || 0);
    const discountedPrice = discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : basePrice;
    const discountedDeposit = discountPercent > 0
        ? baseDeposit * (1 - discountPercent / 100)
        : baseDeposit;

    const cancellationPolicy = "All tour packages will not be converted to any travel funds in case the tour will not push through whether it be government mandated, due to natural calamities, etc. Tour package purchase is non-refundable, non-reroutable, non-rebookable, and non-transferable unless otherwise stated and is due to natural calamities and force majeur that is beyond our control otherwise NON-REFUNDABLE.";

    const isWishlisted = fullPkg && wishlistedIds.has(String(fullPkg.id));

    return (
        <View style={DestinationStyles.detailsContainer}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }} keyboardShouldPersistTaps="handled">
                    
                    <View style={DestinationStyles.detailsHeader}>
                        <View style={DestinationStyles.titleRowHeader}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 10, paddingTop: 4 }}>
                                <Ionicons name="arrow-back" size={24} color="#305797" />
                            </TouchableOpacity>
                            <Text style={DestinationStyles.detailsTitle} numberOfLines={2}>{fullPkg.title}</Text>
                        </View>
                        
                        <View style={DestinationStyles.subtitleRow}>
                            <Text style={DestinationStyles.durationText}>{fullPkg.duration} DAYS</Text>
                            <View style={DestinationStyles.ratingContainer}>
                                <Ionicons name="star" size={14} color="#facc15" />
                                <Text style={DestinationStyles.ratingText}>{averageRating} ({reviews.length} reviews)</Text>
                            </View>
                        </View>
                        
                        <View style={DestinationStyles.carouselContainer}>
                            <ScrollView 
                                ref={carouselRef}
                                horizontal 
                                pagingEnabled 
                                showsHorizontalScrollIndicator={false}
                                onMomentumScrollEnd={(e) => {
                                    const newIndex = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
                                    setCurrentImageIndex(newIndex);
                                }}
                            >
                                {fullPkg.images.map((img, idx) => (
                                    <Image key={idx} source={getImageUrl(img)} style={[DestinationStyles.heroImage, { width: width - 32 }]} contentFit="cover" transition={300} />
                                ))}
                            </ScrollView>
                            {fullPkg.images.length > 1 && (
                                <View style={DestinationStyles.carouselDots}>
                                    {fullPkg.images.map((_, idx) => (
                                        <View key={idx} style={[DestinationStyles.dot, currentImageIndex === idx && DestinationStyles.activeDot]} />
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={DestinationStyles.heroCard}>
                        <Text style={DestinationStyles.packageDetailsHeading}>Package Details</Text>
                        
                        <View style={DestinationStyles.packageDetailGrid}>
                            <View style={DestinationStyles.packageDetailItem}>
                                <Text style={DestinationStyles.packageDetailLabel}>Duration</Text>
                                <Text style={DestinationStyles.packageDetailValue}>{fullPkg.duration} days</Text>
                            </View>
                            <View style={DestinationStyles.packageDetailItem}>
                                <Text style={DestinationStyles.packageDetailLabel}>Type</Text>
                                <Text style={DestinationStyles.packageDetailValue}>{fullPkg.packageType.toUpperCase()}</Text>
                            </View>
                            <View style={DestinationStyles.packageDetailItem}>
                                <Text style={DestinationStyles.packageDetailLabel}>Deposit</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 }}>
                                    {discountPercent > 0 && (
                                        <Text style={DestinationStyles.packagePriceOld}>{formatPeso(baseDeposit)}</Text>
                                    )}
                                    <Text style={DestinationStyles.packageDetailValue}>{formatPeso(discountedDeposit)}</Text>
                                </View>
                            </View>
                            <View style={DestinationStyles.packageDetailItem}>
                                <Text style={DestinationStyles.packageDetailLabel}>Visa</Text>
                                <Text style={DestinationStyles.packageDetailValue}>{fullPkg.visaRequired ? 'Required' : 'Not required'}</Text>
                            </View>
                        </View>

                        <Text style={DestinationStyles.heroDescription}>{fullPkg.description}</Text>
                    </View>

                    <View style={DestinationStyles.priceCard}>
                        <Text style={DestinationStyles.priceLabel}>PRICE PER PAX</Text>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 }}>
                            {discountPercent > 0 && (
                                <Text style={DestinationStyles.packagePriceOld}>{formatPeso(basePrice)}</Text>
                            )}
                            <Text style={DestinationStyles.priceValue}>{formatPeso(discountedPrice)}</Text>
                            {discountPercent > 0 && (
                                <Text style={DestinationStyles.discountTextOnly}>-{discountPercent}%</Text>
                            )}
                        </View>

                        <View style={DestinationStyles.priceRowDivider} />

                        <View style={DestinationStyles.priceRow}>
                            <Text style={DestinationStyles.priceUnit}>Slots</Text>
                            <Text style={DestinationStyles.slotsValue}>{totalSlots}</Text>
                        </View>
                        <View style={DestinationStyles.priceRow}>
                            <Text style={DestinationStyles.priceUnit}>Deposit</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                                {discountPercent > 0 && (
                                    <Text style={DestinationStyles.packagePriceOld}>{formatPeso(baseDeposit)}</Text>
                                )}
                                <Text style={DestinationStyles.slotsValue}>{formatPeso(discountedDeposit)}</Text>
                            </View>
                        </View>
                        
                        <TouchableOpacity 
                            style={[DestinationStyles.availabilityButton, isPackageSoldOut && { backgroundColor: '#cbd5e1' }]} 
                            onPress={handlePrimaryAction}
                            disabled={isPackageSoldOut}
                        >
                            <Text style={[DestinationStyles.availabilityText, isPackageSoldOut && { color: '#64748b' }]}>
                                {isPackageSoldOut ? "Sold Out" : "Check Availability"}
                            </Text>
                        </TouchableOpacity>

                        <View style={DestinationStyles.policyDivider} />
                        <View style={DestinationStyles.cancellationPolicyBox}>
                            <Text style={DestinationStyles.cancellationPolicyTitle}>CANCELLATION POLICY</Text>
                            <Text style={DestinationStyles.cancellationPolicyText}>{cancellationPolicy}</Text>
                        </View>
                    </View>

                    <View style={{ paddingHorizontal: 16 }}>
                        <View style={[DestinationStyles.wishlistContainer, { flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginTop: 5 }]}>
                            <TouchableOpacity style={[DestinationStyles.wishlistButton, { flex: 1 }]} onPress={handleWishlistAdd}>
                                <Ionicons 
                                    name={isWishlisted ? "heart" : "heart-outline"} 
                                    size={18} 
                                    color={isWishlisted ? "#ff4d4f" : "#fff"} 
                                    style={{ marginRight: 6 }} 
                                />
                                <Text style={DestinationStyles.wishlistButtonText}>
                                    {isWishlisted ? "Wishlisted" : "Wishlist"}
                                </Text>
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
                            <View style={DestinationStyles.breakdownCard}>
                                <View style={DestinationStyles.breakdownHeader}>
                                    <View>
                                        <Text style={DestinationStyles.breakdownLabel}>AVERAGE RATING</Text>
                                        <View style={DestinationStyles.breakdownAvgRow}>
                                            <View style={DestinationStyles.starsContainerLarge}>
                                                {[1,2,3,4,5].map(star => (
                                                    <Ionicons key={star} name={star <= averageRating ? "star" : "star-outline"} size={21} color="#facc15" />
                                                ))}
                                            </View>
                                            <Text style={DestinationStyles.breakdownAvgText}>{averageRating}</Text>
                                        </View>
                                    </View>
                                    <Text style={DestinationStyles.breakdownCount}>{reviews.length} reviews</Text>
                                </View>
                                <View style={DestinationStyles.breakdownBody}>
                                    <Text style={DestinationStyles.breakdownBodyTitle}>Review Breakdown for {fullPkg.title}</Text>
                                    {[5,4,3,2,1].map(star => {
                                        const count = ratingBreakdown[star-1];
                                        const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                                        return (
                                            <View key={star} style={DestinationStyles.breakdownBarRow}>
                                                <Text style={DestinationStyles.breakdownStarLabel}>{star} star</Text>
                                                <View style={DestinationStyles.breakdownBarBg}>
                                                    <View style={[DestinationStyles.breakdownBarFill, { width: `${pct}%` }]} />
                                                </View>
                                                <Text style={DestinationStyles.breakdownCountLabel}>{count}</Text>
                                            </View>
                                        )
                                    })}
                                </View>
                            </View>

                            {reviews.length === 0 ? (
                                <Text style={{ color: "#777", fontStyle: "italic", marginBottom: 20 }}>No reviews yet for this package.</Text>
                            ) : (
                                reviews.map((r, i) => {
                                    const rUserId = r.userId?._id || r.userId;
                                    const isMe = user && String(rUserId) === String(user._id);
                                    
                                    return (
                                        <View key={i} style={DestinationStyles.recentReviewContainer}>
                                            <View style={DestinationStyles.reviewHeaderRow}>
                                                <Image 
                                                    source={ r.userId?.profileImage ? getImageUrl(r.userId.profileImage) : require('../../assets/images/profile_icon60.png') } 
                                                    style={DestinationStyles.reviewProfileImg} 
                                                    contentFit="cover"
                                                />
                                                <View style={DestinationStyles.reviewHeaderInfo}>
                                                    <View>
                                                        <Text style={DestinationStyles.userReview}>
                                                            {r.userId?.username || r.fullName || "User"}
                                                            {isMe && <Text style={{ color: "#888", fontWeight: 'normal' }}> (You)</Text>}
                                                        </Text>
                                                        <Text style={{ fontSize: 11, color: '#777', marginBottom: 4 }}>
                                                            {formatFullDate(r.createdAt || r.date)}
                                                        </Text>
                                                    </View>
                                                    <View style={DestinationStyles.userStarContainer}>
                                                        {[...Array(5)].map((_, idx) => (
                                                            <Ionicons key={idx} name={idx < r.rating ? "star" : "star-outline"} size={14} color="#facc15" />
                                                        ))}
                                                    </View>
                                                </View>
                                            </View>
                                            <Text style={{ color: "#333", fontSize: 13, marginTop: 4 }}>{r.review}</Text>

                                            {isMe && (
                                                <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
                                                    <TouchableOpacity onPress={handleEditClick}>
                                                        <Text style={{ color: '#305797', fontSize: 13, fontFamily: 'Montserrat_600SemiBold' }}>Edit</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => setIsDeleteReviewModalOpen(true)}>
                                                        <Text style={{ color: '#ef4444', fontSize: 13, fontFamily: 'Montserrat_600SemiBold' }}>Delete</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    )
                                })
                            )}

                            <View style={DestinationStyles.reviewContainer}>
                                <Text style={[DestinationStyles.reviewTitle, { color: '#305797' }]}>Leave a review</Text>
                                <View style={DestinationStyles.starsContainer}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <TouchableOpacity key={star} disabled={disableForm} onPress={() => setReviewForm({...reviewForm, rating: star})}>
                                            <Ionicons name={star <= reviewForm.rating ? "star" : "star-outline"} size={26} color={disableForm ? "#d1d5db" : "#facc15"} style={{ marginRight: 4 }} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <TextInput
                                    style={[DestinationStyles.reviewInput, disableForm && { backgroundColor: '#f3f4f6', color: '#9ca3af' }]}
                                    placeholder="Share your experience..."
                                    placeholderTextColor="#9ca3af"
                                    multiline
                                    editable={!disableForm}
                                    value={reviewForm.comment}
                                    onChangeText={(val) => setReviewForm({...reviewForm, comment: val})}
                                />
                                
                                <TouchableOpacity style={DestinationStyles.reviewButton} onPress={handleSubmitReview} disabled={disableForm}>
                                    <Text style={DestinationStyles.reviewButtonText}>
                                        {isSubmittingReview ? "Submitting..." : (isEditingReview ? "Update Review" : "Submit Review")}
                                    </Text>
                                </TouchableOpacity>

                                {isEditingReview && (
                                    <TouchableOpacity 
                                        style={[DestinationStyles.reviewButton, { backgroundColor: '#991b1b', marginTop: 10 }]} 
                                        onPress={() => setIsDeleteReviewModalOpen(true)} 
                                        disabled={isSubmittingReview}
                                    >
                                        <Text style={DestinationStyles.reviewButtonText}>Delete Review</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ) : (
                        <>
                            <View style={DestinationStyles.tabRow}>
                                {["itinerary", "inclusions", "terms"].map((tab) => {
                                    const isActive = activeTab === tab;
                                    return (
                                        <TouchableOpacity 
                                            key={tab} 
                                            style={[DestinationStyles.tabButton, isActive && DestinationStyles.tabButtonActive]} 
                                            onPress={() => setActiveTab(tab)}
                                        >
                                            <Text style={[DestinationStyles.tabText, isActive && DestinationStyles.tabTextActive]}>
                                                {tab.toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <View style={DestinationStyles.sectionBody}>
                                {activeTab === "itinerary" && Object.entries(fullPkg.packageItineraries || {}).map(([day, items], i) => (
                                    <View key={i} style={{ marginBottom: 15 }}>
                                        <Text style={DestinationStyles.sectionTitle}>{day.toUpperCase()}</Text>
                                        {Array.isArray(items) ? items.map((item, j) => (
                                            <View key={j} style={DestinationStyles.tabItemRow}>
                                                <Text style={DestinationStyles.tabItemDot}>•</Text>
                                                <Text style={DestinationStyles.sectionText}>
                                                    {typeof item === 'object' ? (item.activity || item.optionalActivity) : item}
                                                    {item.isOptional ? " (Optional)" : ""}
                                                </Text>
                                            </View>
                                        )) : (
                                            <View style={DestinationStyles.tabItemRow}>
                                                <Text style={DestinationStyles.tabItemDot}>•</Text>
                                                <Text style={DestinationStyles.sectionText}>
                                                    {typeof items === 'object' ? (items.activity || items.optionalActivity) : items}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
                                
                                {activeTab === "inclusions" && (
                                    <>
                                        <Text style={DestinationStyles.sectionTitle}>INCLUSIONS</Text>
                                        {fullPkg.packageInclusions?.length > 0 ? fullPkg.packageInclusions.map((item, i) => (
                                            <View key={i} style={DestinationStyles.tabItemRow}>
                                                <Text style={DestinationStyles.tabItemDot}>✓</Text>
                                                <Text style={DestinationStyles.sectionText}>
                                                    {typeof item === 'object' ? (item.activity || item.optionalActivity || item.item) : item}
                                                </Text>
                                            </View>
                                        )) : <Text style={DestinationStyles.sectionText}>None specified.</Text>}
                                        
                                        <Text style={[DestinationStyles.sectionTitle, { marginTop: 20 }]}>EXCLUSIONS</Text>
                                        {fullPkg.packageExclusions?.length > 0 ? fullPkg.packageExclusions.map((item, i) => (
                                            <View key={i} style={DestinationStyles.tabItemRow}>
                                                <Text style={DestinationStyles.tabItemDot}>✕</Text>
                                                <Text style={DestinationStyles.sectionText}>
                                                    {typeof item === 'object' ? (item.activity || item.optionalActivity || item.item) : item}
                                                </Text>
                                            </View>
                                        )) : <Text style={DestinationStyles.sectionText}>None specified.</Text>}
                                    </>
                                )}

                                {activeTab === "terms" && (
                                    <>
                                        <Text style={DestinationStyles.sectionTitle}>TERMS AND CONDITIONS</Text>
                                        {fullPkg.packageTermsConditions?.length > 0 ? fullPkg.packageTermsConditions.map((item, i) => (
                                            <View key={i} style={DestinationStyles.tabItemRow}>
                                                <Text style={DestinationStyles.tabItemDot}>•</Text>
                                                <Text style={DestinationStyles.sectionText}>
                                                    {typeof item === 'object' ? (item.term || item.policy) : item}
                                                </Text>
                                            </View>
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

            <Modal transparent animationType='fade' visible={isDeleteReviewModalOpen} onRequestClose={() => setIsDeleteReviewModalOpen(false)}>
                <View style={ModalStyle.modalOverlay}>
                    <View style={ModalStyle.modalBox}>
                        <Text style={ModalStyle.modalTitle}>Delete review?</Text>
                        <Text style={ModalStyle.modalText}>This will permanently remove your review for this package.</Text>
                        <View style={ModalStyle.modalButtonContainer}>
                            <TouchableOpacity style={ModalStyle.modalButton} onPress={() => setIsDeleteReviewModalOpen(false)}>
                                <Text style={ModalStyle.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[ModalStyle.modalButton, {backgroundColor: '#991b1b'}]} onPress={handleDeleteReview}>
                                {isSubmittingReview ? <ActivityIndicator size="small" color="#fff" /> : <Text style={ModalStyle.modalButtonText}>Delete</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* NATIVE ARRANGEMENT MODAL */}
            <Modal visible={isArrangementModalOpen} transparent animationType="slide" onRequestClose={() => setIsArrangementModalOpen(false)}>
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
                                <Image source={require('../../assets/images/fixedallin.jpg')} style={DestinationStyles.arrangementImage} contentFit="cover" />
                                <View style={DestinationStyles.arrangementTextContainer}>
                                    <Text style={DestinationStyles.arrangementTitleText}>All in Package</Text>
                                    <Text style={DestinationStyles.arrangementDesc}>In this selection, you will receive a fixed itinerary based on the current package. This allows you to proceed with the booking process without any changes to the package details.</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={[DestinationStyles.arrangementOptionCard, selectedArrangement === 'Private Tour' && DestinationStyles.arrangementOptionCardSelected]} onPress={() => setSelectedArrangement('Private Tour')} activeOpacity={0.8}>
                                <Image source={require('../../assets/images/allinpackage.jpg')} style={DestinationStyles.arrangementImage} contentFit="cover" />
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
                                    navigation.navigate("quotationform", { pkg: fullPkg.rawPackage, arrangement: 'Land Arrangement' }); 
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

            {/* NATIVE DATE SELECTION MODAL */}
            <Modal visible={isDateModalOpen} transparent animationType="fade" onRequestClose={() => setIsDateModalOpen(false)}>
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
                                    
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const startDate = new Date(range.startdaterange);
                                    startDate.setHours(0, 0, 0, 0);
                                    
                                    const isPastOrToday = startDate.getTime() <= today.getTime();
                                    const isSoldOut = range.slots <= 0;
                                    const isDisabled = isSoldOut || isPastOrToday;
                                    
                                    return (
                                        <TouchableOpacity 
                                            key={index}
                                            disabled={isDisabled}
                                            style={[
                                                DestinationStyles.dateCard, 
                                                isSelected && DestinationStyles.dateCardSelected,
                                                isDisabled && { opacity: 0.5, backgroundColor: '#f9fafb', borderColor: '#e5e7eb' } 
                                            ]}
                                            onPress={() => {
                                                if (!isDisabled) {
                                                    setSelectedSchedule(range);
                                                }
                                            }}
                                            activeOpacity={isDisabled ? 1 : 0.8}
                                        >
                                            {isSelected && (
                                                <View style={DestinationStyles.selectedBadge}>
                                                    <Text style={DestinationStyles.selectedBadgeText}>SELECTED</Text>
                                                </View>
                                            )}
                                            <View style={DestinationStyles.dateRow}>
                                                <Ionicons name="calendar-outline" size={18} color={isDisabled ? "#9ca3af" : "#305797"} />
                                                <Text style={[DestinationStyles.dateText, isDisabled && { color: '#9ca3af' }]}>
                                                    Dates: {formatShortDate(range.startdaterange)} - {formatShortDate(range.enddaterange)}
                                                </Text>
                                            </View>
                                            <View style={DestinationStyles.priceRowDate}>
                                                <Text style={[
                                                    DestinationStyles.priceTextDate, 
                                                    isDisabled && { color: '#9ca3af' }
                                                ]}>
                                                    {formatPeso(fullPkg.price || 0)} / pax
                                                    {range.extrarate > 0 && (
                                                        <Text style={{ color: isDisabled ? '#9ca3af' : '#64748b', fontSize: 12 }}>
                                                            {` + ${formatPeso(range.extrarate)} extra`}
                                                        </Text>
                                                    )}
                                                </Text>
                                                <View style={DestinationStyles.slotsBadge}>
                                                    <Text style={[
                                                        DestinationStyles.slotsBadgeText, 
                                                        (range.slots <= 10 && range.slots > 0) && { color: '#b91c1c' },
                                                        isDisabled && { color: '#9ca3af', fontWeight: 'bold' } 
                                                    ]}>
                                                        {isPastOrToday ? "Date Passed" : isSoldOut ? "Sold Out" : `${range.slots} slots left`}
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

                                        navigation.navigate("quotationallin", { 
                                            pkg: fullPkg.rawPackage, 
                                            arrangement: 'All in Package', 
                                            selectedDate: dateString,
                                            selectedDateSlots: Number(selectedSchedule.slots || selectedSchedule.availableSlots || 0),
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