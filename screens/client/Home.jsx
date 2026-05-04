import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, ImageBackground, Alert, Dimensions } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Ionicons } from "@expo/vector-icons"
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'

import { Image } from 'expo-image';

import Chatbot from '../../components/Chatbot'
import HomeStyle from '../../styles/clientstyles/HomeStyle'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'

import { api, withUserHeader } from '../../utils/api'
import { useUser } from '../../context/UserContext'

const { width } = Dimensions.get("window");

// 🔥 MOVED OUTSIDE: Prevents React from rebuilding the card every 5 seconds!
const BannerCard = React.memo(({ item, subText, isWishlisted, onPress }) => {
    const imageSource = item.images && item.images.length > 0
        ? item.images[0]
        : require('../../assets/images/southkorea_image.png')

    return (
        <View style={HomeStyle.bannerCard}>
            <Image
                source={imageSource}
                style={HomeStyle.bannerImage}
                contentFit="cover"
                transition={300} // 🔥 Will only trigger once on initial load now!
            />

            {isWishlisted && (
                <View style={{
                    position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: 20, padding: 6, elevation: 4, shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2
                }}>
                    <Ionicons name="heart" size={22} color="#cf1322" />
                </View>
            )}

            <View style={HomeStyle.bannerFooter}>
                <Text style={HomeStyle.bannerTitle}>{item.packageName}</Text>
                <Text style={HomeStyle.bannerSub} numberOfLines={2}>
                    {subText || item.packageDescription}
                </Text>
            </View>
            <TouchableOpacity
                style={HomeStyle.viewAllButton}
                onPress={onPress}
            >
                <Text style={HomeStyle.viewAllText}>View Package</Text>
                <Image source={require('../../assets/images/arrow_righticon.png')} style={[HomeStyle.arrowIcon, { tintColor: "#fff" }]} contentFit="contain" />
            </TouchableOpacity>
        </View>
    )
});

export default function Home() {
    const cs = useNavigation()
    const { user, updateUser } = useUser()
    const [isSidebarVisible, setSidebarVisible] = useState(false)

    // 🔥 NEW CAROUSEL DATA & LOGIC 🔥
    const carouselRef = useRef(null);
    const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

    const carouselData = [
        {
            image: require('../../assets/images/Homepage1.png'),
            title: 'Discover the Philippines',
            subtitle: 'Sunlit beaches, island escapes, and soulful local journeys.'
        },
        {
            image: require('../../assets/images/Homepage2.png'),
            title: 'City Lights to Nature Trails',
            subtitle: 'From skyline adventures to quiet mountain mornings.'
        },
        {
            image: require('../../assets/images/LandingPage_Banner.png'),
            title: 'Your Next Adventure Awaits',
            subtitle: 'Handpicked tours that match your pace and budget.'
        }
    ];

    const [packages, setPackages] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)

    const [wishlistedIds, setWishlistedIds] = useState(new Set())

    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedTags, setSelectedTags] = useState([])
    const [selectedDuration, setSelectedDuration] = useState('Length of Stay')

    // 🔥 NEW FILTER STATES
    const [tourType, setTourType] = useState('Tour Type');
    const [travelers, setTravelers] = useState('');
    const [budgetRange, setBudgetRange] = useState([12000, 30000]); // Default 12k to 30k

    // 🔥 DYNAMIC TAGS (Pulls only available tags from packages)
    const tagOptions = React.useMemo(() => {
        const unique = new Set(['All Tags']);
        packages.forEach(p => p.packageTags?.forEach(t => unique.add(t)));
        return Array.from(unique);
    }, [packages]);

    // Contact Form States
    const [contactName, setContactName] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [contactSubject, setContactSubject] = useState('')
    const [contactMessage, setContactMessage] = useState('')
    const [submittingContact, setSubmittingContact] = useState(false)
    const [emailError, setEmailError] = useState('')
    const [isSuccessModalVisible, setSuccessModalVisible] = useState(false)
    const [isSubjectModalVisible, setSubjectModalVisible] = useState(false)

    const durationOptions = ['All Durations', '2 Days', '3 Days', '4 Days', '5 Days', '6 Days', '7 Days']
    const tourTypeOptions = ['All Types', 'Domestic', 'International']

    const subjectOptions = [
        'Passport Assistance Inquiry',
        'Visa Assistance Inquiry',
        'Booking Inquiry',
        'Quotation Inquiry',
        'Travel Agency Inquiry'
    ]

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveCarouselIndex((prevIndex) => {
                const nextIndex = prevIndex === carouselData.length - 1 ? 0 : prevIndex + 1;
                carouselRef.current?.scrollTo({ x: nextIndex * width, animated: true });
                return nextIndex;
            });
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, []);

    // Keeps the timer in sync if the user swipes manually!
    const handleCarouselScroll = (event) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / width);
        setActiveCarouselIndex(index);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const pkgResponse = await api.get('/package/get-packages')
                setPackages(pkgResponse.data)

                if (user?._id) {
                    try {
                        const [userResponse, wishlistResponse] = await Promise.all([
                            api.get(`/users/users/${user._id}`),
                            api.get('/wishlist', withUserHeader(user._id)).catch(() => ({ data: { wishlist: [] } }))
                        ]);

                        const currentUser = userResponse.data.user || userResponse.data

                        if (currentUser && currentUser.email) {
                            updateUser({
                                firstname: currentUser.firstname,
                                lastname: currentUser.lastname,
                                email: currentUser.email,
                                profileImage: currentUser.profileImage || currentUser.profileImageUrl || ""
                            })
                        }

                        const wIds = new Set();
                        if (wishlistResponse.data?.wishlist) {
                            wishlistResponse.data.wishlist.forEach(entry => {
                                const pId = entry.packageId?._id || entry.packageId;
                                if (pId) wIds.add(String(pId));
                            });
                        }
                        setWishlistedIds(wIds);

                    } catch (userErr) {
                        console.log("Could not sync user data for sidebar:", userErr.message)
                    }
                }
            } catch (error) {
                console.log("Failed to fetch packages:", error.message)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [user?._id])

    const domesticPackages = packages.filter(
        (pkg) => String(pkg.packageType).toLowerCase() === 'domestic'
    )
    const internationalPackages = packages.filter(
        (pkg) => String(pkg.packageType).toLowerCase() === 'international'
    )

    const handleEmailChange = (text) => {
        const cleanedText = text.replace(/\s/g, '');
        setContactEmail(cleanedText);

        if (cleanedText === '') {
            setEmailError('');
        } else if (user && cleanedText.toLowerCase() !== user.email.toLowerCase()) {
            setEmailError('Please use the email associated with your account.');
        } else {
            setEmailError('');
        }
    }

    const handleContactSubmit = async () => {
        if (!user || contactEmail.toLowerCase() !== user.email.toLowerCase()) {
            setEmailError('Please use the email associated with your account.');
            return;
        }

        setSubmittingContact(true);
        try {
            const payload = {
                name: contactName,
                email: contactEmail,
                subject: contactSubject,
                message: contactMessage
            };

            await api.post('/email/contact', payload);
            setSuccessModalVisible(true);

            setContactName('');
            setContactEmail('');
            setContactSubject('');
            setContactMessage('');
            setEmailError('');

        } catch (error) {
            console.log("Contact submit error:", error.message);
            Alert.alert("Failed to Send Message", "There was an error sending your message. Please try again later.");
        } finally {
            setSubmittingContact(false);
        }
    }

    // 🔥 Define the function to reset all filters to default
    const resetFilters = () => {
        setTourType('Tour Type');
        setTravelers('');
        setBudgetRange([12000, 30000]);
        setSelectedTags([]);
        setSelectedDuration('Length of Stay');
        setSearchQuery('');
    };

    // Done button will simply close the modal; search button triggers navigation

    const isContactFormValid = contactName.trim() !== '' && contactEmail.trim() !== '' && contactSubject.trim() !== '' && contactMessage.trim() !== '' && emailError === '';

    // 🔥 Define the Pagination Dots Component
    const renderPaginationDots = () => {
        return (
            <View style={HomeStyle.dotsContainer}>
                {carouselData.map((_, index) => (
                    <View 
                        key={index} 
                        style={[
                            HomeStyle.dot, 
                            activeCarouselIndex === index ? HomeStyle.dotActive : {}
                        ]} 
                    />
                ))}
            </View>
        );
    };

    if (!fontsLoaded) return null;

    return (
        <View style={{ flex: 1, backgroundColor: '#f5f7fa' }} >
            <Header openSidebar={() => { setSidebarVisible(true) }} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            {/* 🔥 NEW FILTERS MODAL 🔥 */}
            <Modal visible={isFilterModalVisible} animationType="slide" transparent={true} onRequestClose={() => setFilterModalVisible(false)}>
                <View style={HomeStyle.filterModalOverlay}>
                    <View style={HomeStyle.filterModalContainer}>
                        <View style={HomeStyle.filterModalHeader}>
                            <Text style={HomeStyle.filterModalTitle}>Advanced Filters</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#1f2a44" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            
                            <Text style={HomeStyle.filterSectionLabel}>Tour Type</Text>
                                    <View style={HomeStyle.filterPillContainer}>
                                {tourTypeOptions.map(type => (
                                    <TouchableOpacity 
                                        key={type} 
                                        style={[HomeStyle.filterPill, (tourType === type || (tourType === 'Tour Type' && type === 'All Types')) && HomeStyle.filterPillSelected]}
                                        onPress={() => setTourType(type === 'All Types' ? 'Tour Type' : type)}
                                    >
                                        <Text style={[HomeStyle.filterPillText, (tourType === type || (tourType === 'Tour Type' && type === 'All Types')) && HomeStyle.filterPillTextSelected]}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={HomeStyle.filterSectionLabel}>Duration</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                                {durationOptions.map(dur => (
                                    <TouchableOpacity 
                                        key={dur} 
                                        style={[HomeStyle.filterPill, {marginRight: 8}, (selectedDuration === dur || (selectedDuration === 'Length of Stay' && dur === 'All Durations')) && HomeStyle.filterPillSelected]}
                                        onPress={() => setSelectedDuration(dur === 'All Durations' ? 'Length of Stay' : dur)}
                                    >
                                        <Text style={[HomeStyle.filterPillText, (selectedDuration === dur || (selectedDuration === 'Length of Stay' && dur === 'All Durations')) && HomeStyle.filterPillTextSelected]}>{dur}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={HomeStyle.filterSectionLabel}>Tags / Activities</Text>
                            <View style={HomeStyle.filterPillContainer}>
                                {tagOptions.map(tag => (
                                    <TouchableOpacity
                                        key={tag}
                                        style={[HomeStyle.filterPill, (selectedTags.includes(tag) || (selectedTags.length === 0 && tag === 'All Tags')) && HomeStyle.filterPillSelected]}
                                        onPress={() => {
                                            if (tag === 'All Tags') {
                                                setSelectedTags([]);
                                                return;
                                            }
                                            setSelectedTags(prev => {
                                                if (prev.includes(tag)) return prev.filter(t => t !== tag);
                                                if (prev.length >= 3) {
                                                    Alert.alert('Limit reached', 'You can select up to 3 tags.');
                                                    return prev;
                                                }
                                                return [...prev, tag];
                                            })
                                        }}
                                    >
                                        <Text style={[HomeStyle.filterPillText, (selectedTags.includes(tag) || (selectedTags.length === 0 && tag === 'All Tags')) && HomeStyle.filterPillTextSelected]}>{tag}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={HomeStyle.filterSectionLabel}>Travelers</Text>
                            <TextInput 
                                style={HomeStyle.filterModalTextInput}
                                placeholder="How many travelers?"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                                value={travelers}
                                onChangeText={(t) => setTravelers(t.replace(/[^0-9]/g, ''))}
                            />

                            <TouchableOpacity style={HomeStyle.filterModalApplyBtn} onPress={() => setFilterModalVisible(false)}>
                                <Text style={HomeStyle.filterModalApplyText}>Done</Text>
                            </TouchableOpacity>

                            {/* 🔥 NEW RESET FILTER BUTTON 🔥 */}
                            <TouchableOpacity style={HomeStyle.filterModalResetBtn} onPress={resetFilters}>
                                <Text style={HomeStyle.filterModalResetText}>Reset Filter</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Subject Selection Modal */}
            <Modal visible={isSubjectModalVisible} transparent={true} animationType="fade">
                <TouchableOpacity style={HomeStyle.subjectModalOverlay} activeOpacity={1} onPress={() => setSubjectModalVisible(false)}>
                    <View style={HomeStyle.subjectModalBox}>
                        {subjectOptions.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[HomeStyle.subjectOption, index === subjectOptions.length - 1 && { borderBottomWidth: 0 }]}
                                onPress={() => {
                                    setContactSubject(option);
                                    setSubjectModalVisible(false);
                                }}
                            >
                                <Text style={[HomeStyle.subjectOptionText, contactSubject === option && { color: '#305797', fontFamily: 'Montserrat_600SemiBold' }]}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={isSuccessModalVisible} transparent={true} animationType="fade">
                <View style={HomeStyle.successModalOverlay}>
                    <View style={HomeStyle.successModalBox}>
                        <Text style={HomeStyle.successModalTitle}>Your message has been sent</Text>
                        <Text style={HomeStyle.successModalSub}>Kindly check your email for responses.</Text>
                        <TouchableOpacity style={HomeStyle.successModalButton} onPress={() => setSuccessModalVisible(false)}>
                            <Text style={HomeStyle.successModalButtonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <ScrollView
                    style={HomeStyle.container}
                    contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 80 : 100 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >

                    <View style={HomeStyle.mainTitleContainer}>
                        <Text style={HomeStyle.mainTitle}>M&RC Travel and Tours</Text>
                        <Text style={HomeStyle.byTravex}>by travex</Text>
                    </View>
                    <ImageBackground
                        source={require('../../assets/images/LandingPage_Banner.png')}
                        style={HomeStyle.heroContainer}
                        resizeMode="cover"
                        imageStyle={{ width: '100%', height: '100%' }}
                    >
                        <View style={HomeStyle.heroOverlay} />
                        <View style={HomeStyle.heroContentWrapper}>
                            <Text style={HomeStyle.heroTitle}>Your Link to the World</Text>
                            <Text style={HomeStyle.heroSubtitleWhite}>Discover affordable vacation travel and tours. Book your dream activities and start exploring the world!</Text>

                            {/* 🔥 NEW COMPACT FILTER CARD 🔥 */}
                            <View style={HomeStyle.heroFilterCard}>
                                
                                {/* Row 1: Search, Filter Button, Search Button */}
                                <View style={HomeStyle.heroSearchRow}>
                                    <View style={HomeStyle.heroSearchInputContainer}>
                                        <TextInput
                                            style={HomeStyle.heroSearchInput}
                                            placeholder='Search here...'
                                            placeholderTextColor="#999"
                                            value={searchQuery}
                                            onChangeText={setSearchQuery}
                                        />
                                    </View>
                                    
                                    <TouchableOpacity style={HomeStyle.heroFilterBtn} onPress={() => setFilterModalVisible(true)}>
                                        <Ionicons name="options-outline" size={20} color="#fff" />
                                        <Text style={HomeStyle.heroFilterBtnText}>Filters</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={HomeStyle.heroSearchBtn} 
                                        onPress={() => cs.navigate("packages", { 
                                            // Passing data to Packages screen
                                            searchQuery, selectedTags, selectedDuration, tourType, travelers, budgetRange 
                                        })}
                                    >
                                        <Ionicons name="search" size={24} color="#fff" />
                                    </TouchableOpacity>
                                </View>

                                {/* Row 2: Budget Slider */}
                                <View style={HomeStyle.heroBudgetRow}>
                                    <View style={HomeStyle.heroBudgetLabels}>
                                        <Text style={[HomeStyle.heroBudgetText, { flex: 1, textAlign: 'left' }]}>₱{budgetRange[0].toLocaleString()}</Text>
                                        <Text style={[HomeStyle.heroInputLabel, { flex: 1, textAlign: 'center' }]}>BUDGET</Text>
                                        <Text style={[HomeStyle.heroBudgetText, { flex: 1, textAlign: 'right' }]}>₱{budgetRange[1].toLocaleString()}</Text>
                                    </View>
                                    <MultiSlider 
                                        values={budgetRange} 
                                        sliderLength={width - 110} 
                                        onValuesChange={setBudgetRange} 
                                        min={0} max={100000} step={1000} 
                                        selectedStyle={{backgroundColor:'#fff'}} 
                                        markerStyle={{backgroundColor:'#fff', height: 16, width: 16}} 
                                        unselectedStyle={{backgroundColor: 'rgba(255,255,255,0.4)'}} 
                                    />
                                </View>
                            </View>
                        </View>
                    </ImageBackground>

                    {loading ? (
                        <ActivityIndicator size="large" color="#305797" style={{ marginTop: 20 }} />
                    ) : (
                        <>
                            <Text style={HomeStyle.title}>Local Packages</Text>
                            {domesticPackages.length > 0 && (
                                <ScrollView 
                                    horizontal 
                                    showsHorizontalScrollIndicator={false} 
                                    contentContainerStyle={{ paddingBottom: 10, paddingRight: 20 }}
                                >
                                    {domesticPackages.map((pkg) => (
                                        /* 🔥 Wrapped the exact BannerCard in a View to set its horizontal width */
                                        <View key={pkg._id} style={{ width: width * 0.85, marginRight: 15 }}>
                                            <BannerCard
                                                item={pkg}
                                                isWishlisted={wishlistedIds.has(String(pkg._id))}
                                                onPress={() => cs.navigate("packagedetails", { id: pkg._id })}
                                            />
                                        </View>
                                    ))}
                                </ScrollView>
                            )}

                            <Text style={[HomeStyle.title, { marginTop: 10 }]}>Packages For You</Text>
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false} 
                                contentContainerStyle={{ paddingBottom: 10, paddingRight: 20 }}
                            >
                                {internationalPackages.map((pkg) => (
                                    /* 🔥 Wrapped the exact BannerCard in a View to set its horizontal width */
                                    <View key={`foryou-${pkg._id}`} style={{ width: width * 0.85, marginRight: 15 }}>
                                        <BannerCard
                                            item={pkg}
                                            isWishlisted={wishlistedIds.has(String(pkg._id))}
                                            onPress={() => cs.navigate("packagedetails", { id: pkg._id })}
                                        />
                                    </View>
                                ))}
                            </ScrollView>
                        </>
                    )}

                    <ImageBackground
                        source={require('../../assets/images/LandingPage2_Banner.png')}
                        style={HomeStyle.bgSectionContainer}

                    >
                        <View style={HomeStyle.bgOverlay} />
                        <Text style={HomeStyle.bgTitle}>Book Your Tours Now</Text>
                        <Text style={[HomeStyle.bgDesc, { marginBottom: 15 }]}> 
                            Ready for your next adventure? Book your international tour with M&RC Travel today and explore the world with ease and comfort. From stunning destinations to well-planned itineraries, we handle all the details so you can focus on making unforgettable memories. Don’t wait-your dream journey starts now!
                        </Text>
                        <TouchableOpacity style={HomeStyle.bgButton} onPress={() => cs.navigate("packages")}>
                            <Text style={HomeStyle.bgButtonText}>BROWSE TOUR PACKAGES</Text>
                        </TouchableOpacity>
                    </ImageBackground>

                    {/* --- 🔥 NEW AUTO-SCROLLING CAROUSEL WITH SPECIFIC DESIGN 🔥 --- */}
                    <View style={HomeStyle.carouselContainer}>
                        <ScrollView
                            ref={carouselRef}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={handleCarouselScroll}
                            scrollEventThrottle={16}
                        >
                            {carouselData.map((item, index) => (
                                <View key={index} style={HomeStyle.carouselSlide}>
                                    
                                    <ImageBackground
                                        source={item.image}
                                        style={HomeStyle.carouselInner}
                                        imageStyle={{ borderRadius: 20 }} // 🔥 FIX: All 4 corners rounded perfectly
                                        resizeMode="cover"
                                    >
                                        <View style={HomeStyle.carouselOverlay} />
                                        <Text style={HomeStyle.carouselTitle}>{item.title}</Text>
                                        <Text style={HomeStyle.carouselSubtitle}>{item.subtitle}</Text>
                                    </ImageBackground>

                                </View>
                            ))}
                        </ScrollView>

                        {/* 🔥 NEW: DOTS INDICATOR UI ADDED HERE BELOW THE SCROLLVIEW 🔥 */}
                        {renderPaginationDots()}
                    </View>
                    {/* --- END CAROUSEL --- */}

                    <View style={HomeStyle.servicesContainer}>
                        <Text style={HomeStyle.servicesHeader}>THE <Text style={{ color: '#305797' }}>SERVICES</Text> WE OFFER</Text>
                        <View style={HomeStyle.servicesGrid}>
                            <View style={HomeStyle.serviceItem}>
                                <Image source={require('../../assets/images/Packages_Logo.png')} style={HomeStyle.serviceIcon} contentFit="contain" />
                                <Text style={HomeStyle.serviceTitle}>Tour Packages</Text>
                            </View>
                            <View style={HomeStyle.serviceItem}>
                                <Image source={require('../../assets/images/Passport_Logo.png')} style={HomeStyle.serviceIcon} contentFit="contain" />
                                <Text style={HomeStyle.serviceTitle}>Passport Assistance</Text>
                            </View>
                            <View style={HomeStyle.serviceItem}>
                                <Image source={require('../../assets/images/Visa_Logo.png')} style={HomeStyle.serviceIcon} contentFit="contain" />
                                <Text style={HomeStyle.serviceTitle}>Visa Assistance</Text>
                            </View>
                            <View style={HomeStyle.serviceItem}>
                                <Image source={require('../../assets/images/Quotation_Logo.png')} style={HomeStyle.serviceIcon} contentFit="contain" />
                                <Text style={HomeStyle.serviceTitle}>Quotations</Text>
                            </View>
                        </View>
                    </View>

                    <ImageBackground
                        source={require('../../assets/images/AboutUs_BackgroundImage.jpg')}
                        style={HomeStyle.bgSectionContainer}

                    >
                        <View style={HomeStyle.bgOverlay} />
                        <Text style={HomeStyle.bgTitle}>M&RC Travel and Tours</Text>
                        <Text style={HomeStyle.bgDesc}>
                            M&RC Travel and tours is a travel agency that provides a wide range of travel services, including tour packages, flight bookings, hotel reservations, and travel insurance. With a commitment to customer satisfaction and a passion for travel, M&RC Travel and Tours aims to create unforgettable travel experiences for its clients.
                        </Text>
                    </ImageBackground>

                    <View style={HomeStyle.contactContainer}>
                        <Text style={HomeStyle.contactTitle}>Contact Us</Text>
                        <Text style={HomeStyle.contactDesc}>
                            Have questions or need assistance? Our friendly customer support team is here to help you with all your travel needs. Whether you’re looking for more information about our tour packages, need help with booking, or want to customize your itinerary, we’re just a message away. Contact us today and let us make your travel dreams a reality!
                        </Text>

                        {/* 🔥 NEW: Contact Information Card (Blue) */}
                        <View style={HomeStyle.contactInfoCard}>
                            <Text style={HomeStyle.contactInfoTitle}>Contact Information</Text>
                            <Text style={HomeStyle.contactInfoSubtitle}>We are here to help you plan your trip.</Text>

                            <View style={HomeStyle.contactInfoItem}>
                                <Ionicons name="location-outline" size={24} color="#fff" style={HomeStyle.contactInfoIcon} />
                                <View style={HomeStyle.contactInfoTextContainer}>
                                    <Text style={HomeStyle.contactInfoLabel}>VISIT US</Text>
                                    <Text style={HomeStyle.contactInfoText}>2nd Floor #1 Cor Fatima street, San Antonio Avenue Valley 1, Brgy. San Antonio, Parañaque, Philippines, 1715</Text>
                                </View>
                            </View>

                            <View style={HomeStyle.contactInfoItem}>
                                <Ionicons name="time-outline" size={24} color="#fff" style={HomeStyle.contactInfoIcon} />
                                <View style={HomeStyle.contactInfoTextContainer}>
                                    <Text style={HomeStyle.contactInfoLabel}>OFFICE HOURS</Text>
                                    <Text style={HomeStyle.contactInfoText}>Monday - Saturday: 9:00 AM - 6:00 PM</Text>
                                </View>
                            </View>
                        </View>

                        <View style={HomeStyle.contactCard}>
                            <Text style={HomeStyle.contactCardTitle}>You have an inquiry? Send us a message!</Text>

                            <TextInput
                                style={HomeStyle.contactInput}
                                placeholder="Your Name"
                                placeholderTextColor="#999"
                                value={contactName}
                                onChangeText={(text) => setContactName(text.replace(/[^a-zA-Z\s]/g, ''))}
                            />

                            <View style={HomeStyle.inputWrapper}>
                                <TextInput
                                    style={[HomeStyle.contactInput, emailError ? HomeStyle.inputErrorBorder : null, { marginBottom: 0 }]}
                                    placeholder="Your Email"
                                    placeholderTextColor="#999"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={contactEmail}
                                    onChangeText={handleEmailChange}
                                />
                                {emailError ? <Text style={HomeStyle.errorText}>{emailError}</Text> : null}
                            </View>

                            {/* 🔥 NEW: Subject Dropdown Input */}
                            <TouchableOpacity
                                style={[HomeStyle.contactInput, { justifyContent: 'center' }]}
                                onPress={() => setSubjectModalVisible(true)}
                                activeOpacity={0.7}
                            >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ color: contactSubject ? '#333' : '#999', fontFamily: 'Roboto_400Regular' }}>
                                        {contactSubject || "Select subject"}
                                    </Text>
                                    <Ionicons name="chevron-down" size={16} color="#999" />
                                </View>
                            </TouchableOpacity>

                            <TextInput
                                style={HomeStyle.contactTextArea}
                                placeholder="Your Message"
                                placeholderTextColor="#999"
                                multiline={true}
                                numberOfLines={4}
                                textAlignVertical="top"
                                value={contactMessage}
                                onChangeText={setContactMessage}
                            />

                            <TouchableOpacity
                                style={[HomeStyle.contactSubmitBtn, !isContactFormValid && HomeStyle.contactSubmitBtnDisabled]}
                                disabled={!isContactFormValid || submittingContact}
                                onPress={handleContactSubmit}
                            >
                                {submittingContact ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={HomeStyle.contactSubmitText}>Submit</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <Chatbot />
        </View>
    )
}