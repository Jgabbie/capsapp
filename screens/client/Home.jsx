import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'

// --- OPTIMIZED IMAGE IMPORT ---
import { Image } from 'expo-image'; 

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
    
    const [packages, setPackages] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)

    const [activeDropdown, setActiveDropdown] = useState(null) 
    const [selectedActivity, setSelectedActivity] = useState('Activities')
    const [selectedDuration, setSelectedDuration] = useState('Duration')

    const [contactName, setContactName] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [contactMessage, setContactMessage] = useState('')
    const [submittingContact, setSubmittingContact] = useState(false)
    const [emailError, setEmailError] = useState('')
    const [isSuccessModalVisible, setSuccessModalVisible] = useState(false)

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

    const TravelCard = ({ item }) => {
        const imageSource = item.images && item.images.length > 0 
            ? item.images[0]
            : require('../../assets/images/japan_imagesmall.png')

        return (
            <TouchableOpacity style={HomeStyle.card} onPress={() => cs.navigate("packagedetails", { id: item._id })}>
                {/* --- UPDATED TO USE EXPO-IMAGE --- */}
                <Image 
                    source={imageSource} 
                    style={HomeStyle.cardImage} 
                    contentFit="cover"
                    transition={300} 
                />
                {/* 🔥 NEW: Wrapper for text to give it padding inside the white box */}
                <View style={HomeStyle.cardContent}>
                    <Text style={HomeStyle.cardTitle} numberOfLines={1}>{item.packageName}</Text>
                    <View style={HomeStyle.infoRow}>
                        <Image source={require('../../assets/images/date_iconsmall.png')} style={{width: 12, height: 12}} contentFit="contain" />
                        <Text style={HomeStyle.infoText}>{item.packageDuration} DAYS</Text>
                    </View>
                    <View style={HomeStyle.infoRow}>
                        <Image source={require('../../assets/images/location_iconsmall.png')} style={{width: 12, height: 12}} contentFit="contain" />
                        <Text style={HomeStyle.infoText} numberOfLines={1}>
                            {item.packageType.charAt(0).toUpperCase() + item.packageType.slice(1)}
                        </Text>
                    </View>
                    <Text style={HomeStyle.priceText}>₱{item.packagePricePerPax.toLocaleString()}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    const BannerCard = ({ item, subText }) => {
        const imageSource = item.images && item.images.length > 0 
            ? item.images[0]
            : require('../../assets/images/southkorea_image.png')

        return (
            <View style={HomeStyle.bannerCard}>
                 {/* --- UPDATED TO USE EXPO-IMAGE --- */}
                <Image 
                    source={imageSource} 
                    style={HomeStyle.bannerImage} 
                    contentFit="cover"
                    transition={300}
                />
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

            {/* 🔥 UPDATED KEYBOARD AVOIDING VIEW & SCROLL VIEW 🔥 */}
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} 
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20} 
            >
                <ScrollView 
                    style={HomeStyle.container} 
                    contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 120 : 180 }} 
                    showsVerticalScrollIndicator={false} 
                    keyboardShouldPersistTaps="handled"
                >
                    
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