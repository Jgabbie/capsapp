import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, Alert, ToastAndroid } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'

import Chatbot from '../../components/Chatbot'
import HomeStyle from '../../styles/clientstyles/HomeStyle'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { api } from '../../utils/api' 
import { useUser } from '../../context/UserContext'

export default function Home() {
    const cs = useNavigation()
    const { user, updateUser } = useUser() 
    const [isSidebarVisible, setSidebarVisible] = useState(false)
    
    // --- DATA & SEARCH STATES ---
    const [packages, setPackages] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)

    // --- DROPDOWN FILTER STATES ---
    const [activeDropdown, setActiveDropdown] = useState(null) 
    const [selectedActivity, setSelectedActivity] = useState('Activities')
    const [selectedDuration, setSelectedDuration] = useState('Duration')

    // --- CONTACT US STATES ---
    const [contactName, setContactName] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [contactMessage, setContactMessage] = useState('')
    const [submittingContact, setSubmittingContact] = useState(false)

    const activityOptions = ['All Activities', 'Adventure Type', 'Beach', 'Hiking', 'City Tour']
    const durationOptions = ['All Durations', '2 Days', '3 Days', '4 Days', '5 Days', '6 Days', '7 Days']

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })

    // --- FETCH DATA FROM MONGODB ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const pkgResponse = await api.get('/package/get-packages')
                setPackages(pkgResponse.data)

                if (user?._id) {
                    try {
                        const userResponse = await api.get(`/users/users/${user._id}`)
                        const currentUser = userResponse.data.user || userResponse.data 
                        
                        if (currentUser && currentUser.email) {
                            updateUser({
                                firstname: currentUser.firstname,
                                lastname: currentUser.lastname,
                                email: currentUser.email,
                                profileImage: currentUser.profileImage || currentUser.profileImageUrl || ""
                            })
                        }
                    } catch (userErr) {
                        console.log("Could not sync user data for sidebar:", userErr.message)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch packages:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [user?._id])

    // FILTER LOGIC
    const filteredPackages = packages.filter(pkg => {
        const matchesSearch = pkg.packageName.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesActivity = selectedActivity === 'Activities' || selectedActivity === 'All Activities' || 
            (pkg.packageTags && pkg.packageTags.some(tag => tag.toLowerCase() === selectedActivity.toLowerCase())) ||
            pkg.packageDescription.toLowerCase().includes(selectedActivity.toLowerCase())

        const matchesDuration = selectedDuration === 'Duration' || selectedDuration === 'All Durations' || 
            pkg.packageDuration === parseInt(selectedDuration.split(' ')[0])

        return matchesSearch && matchesActivity && matchesDuration
    })

    const internationalPackages = filteredPackages.filter(pkg => pkg.packageType.toLowerCase() === 'international')
    const domesticPackages = filteredPackages.filter(pkg => pkg.packageType.toLowerCase() === 'domestic')

    // --- CONTACT US SUBMIT LOGIC ---
    const handleContactSubmit = async () => {
        if (!user || contactEmail.toLowerCase() !== user.email.toLowerCase()) {
            if (Platform.OS === 'android') {
                ToastAndroid.show('Please use the email associated with your account.', ToastAndroid.SHORT);
            } else {
                Alert.alert('Invalid Email', 'Please use the email associated with your account.');
            }
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
            
            Alert.alert("Success", "Your message has been sent. Kindly check your email for responses.");
            setContactName('');
            setContactEmail('');
            setContactMessage('');
        } catch (error) {
            console.log("Contact submit error:", error.message);
            Alert.alert("Error", "Failed to send message. Please try again later.");
        } finally {
            setSubmittingContact(false);
        }
    }

    const isContactFormValid = contactName.trim() !== '' && contactEmail.trim() !== '' && contactMessage.trim() !== '';

    const TravelCard = ({ item }) => {
        const imageSource = item.images && item.images.length > 0 
            ? { uri: item.images[0] } 
            : require('../../assets/images/japan_imagesmall.png')

        return (
            <TouchableOpacity style={HomeStyle.card} onPress={() => cs.navigate("packagedetails", { id: item._id })}>
                <Image source={imageSource} style={HomeStyle.cardImage} />
                <Text style={HomeStyle.cardTitle} numberOfLines={1}>{item.packageName}</Text>
                <View style={HomeStyle.infoRow}>
                    <Image source={require('../../assets/images/date_iconsmall.png')} />
                    <Text style={HomeStyle.infoText}>{item.packageDuration} DAYS</Text>
                </View>
                <View style={HomeStyle.infoRow}>
                    <Image source={require('../../assets/images/location_iconsmall.png')} />
                    <Text style={HomeStyle.infoText} numberOfLines={1}>
                        {item.packageType.charAt(0).toUpperCase() + item.packageType.slice(1)}
                    </Text>
                </View>
                <Text style={HomeStyle.priceText}>₱{item.packagePricePerPax.toLocaleString()}</Text>
            </TouchableOpacity>
        )
    }

    const BannerCard = ({ item, subText }) => {
        const imageSource = item.images && item.images.length > 0 
            ? { uri: item.images[0] } 
            : require('../../assets/images/southkorea_image.png')

        return (
            <View style={HomeStyle.bannerCard}>
                <Image source={imageSource} style={HomeStyle.bannerImage} />
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
                    <Image source={require('../../assets/images/arrow_righticon.png')} style={HomeStyle.arrowIcon} tintColor={"#fff"} />
                </TouchableOpacity>
            </View>
        )
    }

    const DropdownModal = () => (
        <Modal visible={activeDropdown !== null} transparent={true} animationType="fade">
            <TouchableOpacity 
                style={HomeStyle.modalOverlay} 
                activeOpacity={1} 
                onPress={() => setActiveDropdown(null)} 
            >
                <View style={HomeStyle.modalContent}>
                    {activeDropdown === 'activity' ? (
                        activityOptions.map((option, index) => {
                            const isActive = selectedActivity === option || (selectedActivity === 'Activities' && option === 'All Activities');
                            return (
                                <TouchableOpacity 
                                    key={index} 
                                    style={[HomeStyle.modalOption, index === activityOptions.length -1 && {borderBottomWidth: 0}]}
                                    onPress={() => {
                                        setSelectedActivity(option === 'All Activities' ? 'Activities' : option)
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
                        })
                    ) : activeDropdown === 'duration' ? (
                        durationOptions.map((option, index) => {
                            const isActive = selectedDuration === option || (selectedDuration === 'Duration' && option === 'All Durations');
                            return (
                                <TouchableOpacity 
                                    key={index} 
                                    style={[HomeStyle.modalOption, index === durationOptions.length -1 && {borderBottomWidth: 0}]}
                                    onPress={() => {
                                        setSelectedDuration(option === 'All Durations' ? 'Duration' : option)
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
                        })
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

            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView style={HomeStyle.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    
                    <View style={HomeStyle.mainTitleContainer}>
                        <Text style={HomeStyle.mainTitle}>M&RC Travel and Tours</Text>
                        <Text style={HomeStyle.byTravex}>by travex</Text>
                    </View>

                    <View style={HomeStyle.searchRow}>
                        <View style={HomeStyle.searchBar} >
                            <Ionicons name="search" size={16} color="#777" />
                            <TextInput
                                style={HomeStyle.searchInput}
                                placeholder='Search packages'
                                placeholderTextColor="#777"
                                value={searchQuery}
                                onChangeText={(text) => setSearchQuery(text)}
                            />
                        </View>
                        <View style={HomeStyle.dropdownGroup}>
                            <TouchableOpacity style={HomeStyle.dropdownButton} onPress={() => setActiveDropdown('activity')}>
                                <Text style={HomeStyle.dropdownText} numberOfLines={1}>
                                    {selectedActivity.length > 10 ? selectedActivity.substring(0,8) + '...' : selectedActivity}
                                </Text>
                                <Ionicons name="chevron-down" size={12} color="#305797" style={HomeStyle.dropdownIcon} />
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={HomeStyle.dropdownButton} onPress={() => setActiveDropdown('duration')}>
                                <Text style={HomeStyle.dropdownText} numberOfLines={1}>
                                    {selectedDuration}
                                </Text>
                                <Ionicons name="chevron-down" size={12} color="#305797" style={HomeStyle.dropdownIcon} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#305797" style={{ marginTop: 20 }} />
                    ) : (
                        <>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                                {filteredPackages.length > 0 ? (
                                    filteredPackages.map((pkg) => (
                                        <TravelCard key={pkg._id} item={pkg} />
                                    ))
                                ) : (
                                    <Text style={HomeStyle.noResultsText}>No packages match your search.</Text>
                                )}
                            </ScrollView>

                            {internationalPackages.length > 0 && (
                                <>
                                    <Text style={HomeStyle.title}>Packages For You</Text>
                                    {internationalPackages.map((pkg) => (
                                        <BannerCard key={pkg._id} item={pkg} subText="Explore the world with our premium international tours" />
                                    ))}
                                </>
                            )}

                            {domesticPackages.length > 0 && (
                                <>
                                    <Text style={HomeStyle.title}>Local Packages</Text>
                                    {domesticPackages.map((pkg) => (
                                        <BannerCard key={pkg._id} item={pkg} subText="Discover the beauty of the Philippines" />
                                    ))}
                                </>
                            )}
                        </>
                    )}

                    {/* --- CONTACT US SECTION --- */}
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
                                onChangeText={(text) => setContactName(text.replace(/[^a-zA-Z\s]/g, ''))} // Letters and spaces only
                            />
                            
                            <TextInput
                                style={HomeStyle.contactInput}
                                placeholder="Your Email"
                                placeholderTextColor="#999"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={contactEmail}
                                onChangeText={(text) => setContactEmail(text.replace(/\s/g, ''))} // No spaces allowed
                            />
                            
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