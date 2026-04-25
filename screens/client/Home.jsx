import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'

import { Image } from 'expo-image'; 

import Chatbot from '../../components/Chatbot'
import HomeStyle from '../../styles/clientstyles/HomeStyle'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'

// 🔥 IMPORTED withUserHeader to fetch wishlist safely
import { api, withUserHeader } from '../../utils/api' 
import { useUser } from '../../context/UserContext'

export default function Home() {
    const cs = useNavigation()
    const { user, updateUser } = useUser() 
    const [isSidebarVisible, setSidebarVisible] = useState(false)
    
    const [packages, setPackages] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)
    
    // 🔥 NEW: Wishlist State
    const [wishlistedIds, setWishlistedIds] = useState(new Set())

    const [activeDropdown, setActiveDropdown] = useState(null) 
    const [selectedTag, setSelectedTag] = useState('Tags')
    const [selectedDuration, setSelectedDuration] = useState('Length of Stay')

    const [contactName, setContactName] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [contactMessage, setContactMessage] = useState('')
    const [submittingContact, setSubmittingContact] = useState(false)
    const [emailError, setEmailError] = useState('')
    const [isSuccessModalVisible, setSuccessModalVisible] = useState(false)

    const tagOptions = ['All Tags', 'Beach', 'Island', 'Scenery', 'Spring', 'Culture', 'Sightseeing', 'Temples']
    const durationOptions = ['All Durations', '2 Days', '3 Days', '4 Days', '5 Days', '6 Days', '7 Days']

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const pkgResponse = await api.get('/package/get-packages')
                setPackages(pkgResponse.data)

                if (user?._id) {
                    try {
                        // 🔥 UPDATED: Fetch user details AND wishlist simultaneously
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

                        // 🔥 Set up the wishlist map
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

    const filteredPackages = packages.filter(pkg => {
        const matchesSearch = pkg.packageName.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesActivity = selectedTag === 'Tags' || selectedTag === 'All Tags' || 
            (pkg.packageTags && pkg.packageTags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())) ||
            pkg.packageDescription.toLowerCase().includes(selectedTag.toLowerCase())

        const matchesDuration = selectedDuration === 'Length of Stay' || selectedDuration === 'All Durations' || 
            pkg.packageDuration === parseInt(selectedDuration.split(' ')[0])

        return matchesSearch && matchesActivity && matchesDuration
    })

    const internationalPackages = filteredPackages.filter(pkg => pkg.packageType.toLowerCase() === 'international')
    const domesticPackages = filteredPackages.filter(pkg => pkg.packageType.toLowerCase() === 'domestic')

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
                message: contactMessage
            };
            
            await api.post('/email/contact', payload);
            setSuccessModalVisible(true);
            
            setContactName('');
            setContactEmail('');
            setContactMessage('');
            setEmailError('');
            
        } catch (error) {
            console.log("Contact submit error:", error.message);
        } finally {
            setSubmittingContact(false);
        }
    }

    const isContactFormValid = contactName.trim() !== '' && contactEmail.trim() !== '' && contactMessage.trim() !== '' && emailError === '';

    const BannerCard = ({ item, subText }) => {
        const imageSource = item.images && item.images.length > 0 
            ? item.images[0]
            : require('../../assets/images/southkorea_image.png')

        return (
            <View style={HomeStyle.bannerCard}>
                <Image 
                    source={imageSource} 
                    style={HomeStyle.bannerImage} 
                    contentFit="cover"
                    transition={300}
                />
                
                {/* 🔥 NEW: Floating Wishlist Heart */}
                {wishlistedIds.has(String(item._id)) && (
                    <View style={{ 
                        position: 'absolute', 
                        top: 12, 
                        right: 12, 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        borderRadius: 20, 
                        padding: 6, 
                        elevation: 4, 
                        shadowColor: '#000', 
                        shadowOffset: {width: 0, height: 2}, 
                        shadowOpacity: 0.2, 
                        shadowRadius: 2 
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
                    onPress={() => cs.navigate("packagedetails", { id: item._id })}
                >
                    <Text style={HomeStyle.viewAllText}>View Package</Text>
                    <Image source={require('../../assets/images/arrow_righticon.png')} style={[HomeStyle.arrowIcon, {tintColor: "#fff"}]} contentFit="contain" />
                </TouchableOpacity>
            </View>
        )
    }

    const DropdownModal = () => (
        <Modal visible={activeDropdown !== null} transparent={true} animationType="fade">
            <TouchableOpacity 
                style={HomeStyle.dropdownOverlay} 
                activeOpacity={1} 
                onPress={() => setActiveDropdown(null)} 
            >
                <View style={HomeStyle.dropdownListContent}>
                    {activeDropdown === 'tag' ? (
                        <ScrollView style={{maxHeight: 250}} showsVerticalScrollIndicator={false}>
                        {tagOptions.map((option, index) => {
                            const isActive = selectedTag === option || (selectedTag === 'Tags' && option === 'All Tags');
                            return (
                                <TouchableOpacity 
                                    key={index} 
                                    style={[HomeStyle.modalOption, index === tagOptions.length -1 && {borderBottomWidth: 0}]}
                                    onPress={() => {
                                        setSelectedTag(option === 'All Tags' ? 'Tags' : option)
                                        setActiveDropdown(null)
                                    }}
                                >
                                    <Text style={[
                                        HomeStyle.modalOptionText,
                                        { 
                                            color: isActive ? '#305797' : '#555', 
                                            fontFamily: isActive ? 'Montserrat_700Bold' : 'Roboto_400Regular' 
                                        }
                                    ]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                        </ScrollView>
                    ) : activeDropdown === 'duration' ? (
                        <ScrollView style={{maxHeight: 250}} showsVerticalScrollIndicator={false}>
                        {durationOptions.map((option, index) => {
                            const isActive = selectedDuration === option || (selectedDuration === 'Length of Stay' && option === 'All Durations');
                            return (
                                <TouchableOpacity 
                                    key={index} 
                                    style={[HomeStyle.modalOption, index === durationOptions.length -1 && {borderBottomWidth: 0}]}
                                    onPress={() => {
                                        setSelectedDuration(option === 'All Durations' ? 'Length of Stay' : option)
                                        setActiveDropdown(null)
                                    }}
                                >
                                    <Text style={[
                                        HomeStyle.modalOptionText,
                                        { 
                                            color: isActive ? '#305797' : '#555', 
                                            fontFamily: isActive ? 'Montserrat_700Bold' : 'Roboto_400Regular' 
                                        }
                                    ]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                        </ScrollView>
                    ) : null}
                </View>
            </TouchableOpacity>
        </Modal>
    )

    if (!fontsLoaded) return null;

    return (
        <View style={{ flex: 1, backgroundColor: '#f5f7fa' }} >
            <Header openSidebar={() => { setSidebarVisible(true) }} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <DropdownModal />

            <Modal visible={isSuccessModalVisible} transparent={true} animationType="fade">
                <View style={HomeStyle.successModalOverlay}>
                    <View style={HomeStyle.successModalBox}>
                        <Text style={HomeStyle.successModalTitle}>Your message has been sent</Text>
                        <Text style={HomeStyle.successModalSub}>Kindly check your email for responses.</Text>
                        <TouchableOpacity 
                            style={HomeStyle.successModalButton}
                            onPress={() => setSuccessModalVisible(false)}
                        >
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
                    <Text style={HomeStyle.heroSubtitle}>
                        Discover affordable vacation travel and tours. Book your dream activities and start exploring the world!
                    </Text>

                    <View style={HomeStyle.searchRow}>
                        <View style={HomeStyle.searchBar} >
                            <Ionicons name="search" size={16} color="#777" />
                            <TextInput
                                style={HomeStyle.searchInput}
                                placeholder='Search here...'
                                placeholderTextColor="#777"
                                value={searchQuery}
                                onChangeText={(text) => setSearchQuery(text)}
                            />
                        </View>
                        <View style={HomeStyle.dropdownGroup}>
                            <TouchableOpacity style={HomeStyle.dropdownButton} onPress={() => setActiveDropdown('tag')}>
                                <Text style={HomeStyle.dropdownText} numberOfLines={1}>
                                    {selectedTag.length > 8 ? selectedTag.substring(0,8) + '...' : selectedTag}
                                </Text>
                                <Ionicons name="chevron-down" size={12} color="#305797" style={HomeStyle.dropdownIcon} />
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={HomeStyle.dropdownButton} onPress={() => setActiveDropdown('duration')}>
                                <Text style={HomeStyle.dropdownText} numberOfLines={1}>
                                    {selectedDuration.length > 10 ? selectedDuration.substring(0,10) + '...' : selectedDuration}
                                </Text>
                                <Ionicons name="chevron-down" size={12} color="#305797" style={HomeStyle.dropdownIcon} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={HomeStyle.secondMainTitle}>Your Link to the World</Text>

                    {loading ? (
                        <ActivityIndicator size="large" color="#305797" style={{ marginTop: 20 }} />
                    ) : (
                        <>
                            {internationalPackages.length > 0 && (
                                <>
                                    <Text style={HomeStyle.title}>Packages For You</Text>
                                    {internationalPackages.map((pkg) => (
                                        <BannerCard key={pkg._id} item={pkg} />
                                    ))}
                                </>
                            )}

                            {domesticPackages.length > 0 && (
                                <>
                                    <Text style={HomeStyle.title}>Local Packages</Text>
                                    {domesticPackages.map((pkg) => (
                                        <BannerCard key={pkg._id} item={pkg} />
                                    ))}
                                </>
                            )}
                        </>
                    )}

                    <ImageBackground 
                        source={require('../../assets/images/LandingPage2_Banner.png')} 
                        style={HomeStyle.bgSectionContainer}
                        imageStyle={{ borderRadius: 15 }}
                    >
                        <View style={HomeStyle.bgOverlay} />
                        <Text style={HomeStyle.bgTitle}>Book Your Tours Now</Text>
                        
                        <Text style={[HomeStyle.bgDesc, { marginBottom: 15 }]}>
                            Ready for your next adventure? Book your international tour with M&RC Travel today and explore the world with ease and comfort. From stunning destinations to well-planned itineraries, we handle all the details so you can focus on making unforgettable memories. Don’t wait—your dream journey starts now!
                        </Text>
                        
                        <TouchableOpacity style={HomeStyle.bgButton} onPress={() => cs.navigate("packages")}>
                            <Text style={HomeStyle.bgButtonText}>BROWSE TOUR PACKAGES</Text>
                        </TouchableOpacity>
                    </ImageBackground>

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
                        imageStyle={{ borderRadius: 15 }}
                    >
                        <View style={HomeStyle.bgOverlay} />
                        <Text style={HomeStyle.bgTitle}>M&RC Travel and Tours</Text>
                        <Text style={HomeStyle.bgDesc}>
                            Ready for your next adventure? Book your international tour with M&RC Travel today and explore the world with ease and comfort. From stunning destinations to well-planned itineraries, we handle all the details so you can focus on making unforgettable memories. Don’t wait—your dream journey starts now!
                        </Text>
                    </ImageBackground>

                    <View style={HomeStyle.contactContainer}>
                        <Text style={HomeStyle.contactTitle}>Contact Us</Text>
                        <Text style={HomeStyle.contactDesc}>
                            Have questions or need assistance? Our friendly customer support team is here to help you with all your travel needs. Whether you’re looking for more information about our tour packages, need help with booking, or want to customize your itinerary, we’re just a message away. Contact us today and let us make your travel dreams a reality!
                        </Text>

                        <View style={HomeStyle.contactCard}>
                            <Text style={HomeStyle.contactCardTitle}>Send us a message:</Text>
                            
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