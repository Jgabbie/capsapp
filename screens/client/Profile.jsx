import { View, Text, TextInput, TouchableOpacity, Image, Modal, ScrollView, Platform, ToastAndroid, Alert, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useFonts } from 'expo-font'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from "@expo-google-fonts/montserrat"
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from "@expo-google-fonts/roboto"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from 'expo-image-picker'
import DateTimePicker from '@react-native-community/datetimepicker'
import dayjs from 'dayjs' 

import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import ModalStyle from '../../styles/componentstyles/ModalStyle'
import ProfileStyle from '../../styles/clientstyles/ProfileStyle'

import { api, withUserHeader } from '../../utils/api' 
import { useUser } from '../../context/UserContext'

export default function Profile() {
    const { user, updateUser } = useUser() 
    const [isSidebarVisible, setSidebarVisible] = useState(false)
    const [editing, setEditing] = useState(false)
    
    // Modals & Pickers
    const [confirmModalVisible, setConfirmModalVisible] = useState(false)
    const [successModalVisible, setSuccessModalVisible] = useState(false)
    const [genderModalVisible, setGenderModalVisible] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false)

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })

    const [profileImage, setProfileImage] = useState('')
    const [userData, setUserData] = useState({
        username: "",
        firstname: "",
        lastname: "",
        email: "",
        phonenum: "",
        address: "",
        gender: "",
        birthdate: "",
        nationality: "",
        role: "",
        isAccountVerified: false
    })

    const [originalData, setOriginalData] = useState({})
    const [errors, setErrors] = useState({
        firstname: "",
        lastname: "",
        email: "",
        phonenum: ""
    })

    const [recentBookings, setRecentBookings] = useState([])
    const [recentReviews, setRecentReviews] = useState([])
    const [loadingExtra, setLoadingExtra] = useState(false)

    // 🔥 PREFERENCES STATES 🔥
    const [moodOptions, setMoodOptions] = useState([])
    const tourOptions = ['Domestic', 'International']
    const [preferences, setPreferences] = useState({ moods: [], tours: [] })
    const [originalPreferences, setOriginalPreferences] = useState({ moods: [], tours: [] })
    const [editingPreferences, setEditingPreferences] = useState(false)
    const [savingPreferences, setSavingPreferences] = useState(false)

    // --- FETCH USER DATA ---
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get(`/users/users/${user._id}`)
                const currentUser = response.data.user || response.data

                if (currentUser) {
                    let phone = currentUser.phonenum || currentUser.phone || ""
                    phone = phone.replace("+63", "").trim() 

                    const mappedData = {
                        username: currentUser.username || "",
                        firstname: currentUser.firstname || "",
                        lastname: currentUser.lastname || "",
                        email: currentUser.email || "",
                        phonenum: phone, 
                        address: currentUser.homeAddress || currentUser.address || "",
                        gender: currentUser.gender || "",
                        birthdate: currentUser.birthdate || "",
                        nationality: currentUser.nationality || "",
                        role: currentUser.role || "Customer", 
                        isAccountVerified: currentUser.isAccountVerified || false
                    }
                    setUserData(mappedData)
                    setOriginalData(mappedData)
                    
                    const img = currentUser.profileImage || currentUser.profileImageUrl || ""
                    setProfileImage(img)

                    updateUser({
                        firstname: currentUser.firstname,
                        lastname: currentUser.lastname,
                        email: currentUser.email,
                        profileImage: img
                    })
                }
            } catch (error) {
                console.log("Fetch Error:", error.message)
            }
        }
        if (user?._id) fetchUserData()
    }, [user?._id])

    // --- FETCH RECENT ACTIVITY & PREFERENCES ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?._id) return;
            setLoadingExtra(true);
            try {
                const [bookingsRes, reviewsRes, tagsRes, prefRes] = await Promise.all([
                    api.get('/booking/my-bookings', withUserHeader(user._id)).catch(() => ({ data: [] })),
                    api.get('/rating/my-ratings', withUserHeader(user._id)).catch(() => ({ data: [] })),
                    api.get('/package/get-packages-for-users', withUserHeader(user._id)).catch(() => ({ data: [] })),
                    api.get('/preferences/me', withUserHeader(user._id)).catch(() => ({ data: null }))
                ]);

                setRecentBookings(bookingsRes.data?.bookings || bookingsRes.data || []);
                setRecentReviews(reviewsRes.data?.ratings || reviewsRes.data || []);

                // Extract unique tags for Moods
                const uniqueTags = new Set();
                const packagesData = tagsRes.data?.data || tagsRes.data || []; 
                
                packagesData.forEach((pkg) => {
                    pkg.packageTags?.forEach((tag) => uniqueTags.add(tag));
                });
                
                // 🔥 ADDED FALLBACK JUST LIKE THE OTHER SCREEN 🔥
                if (uniqueTags.size > 0) {
                    setMoodOptions(Array.from(uniqueTags));
                } else {
                    setMoodOptions(['Beach', 'Island', 'Scenery', 'Spring', 'Culture', 'Sightseeing', 'Temples', 'Winter']);
                }

                // Set user preferences
                if (prefRes.data?.preferrences) {
                    const savedPrefs = {
                        moods: prefRes.data.preferrences.moods || [],
                        tours: prefRes.data.preferrences.tours || []
                    };
                    setPreferences(savedPrefs);
                    setOriginalPreferences(savedPrefs);
                }

            } catch (error) {
                console.log("Error fetching dashboard data:", error.message);
            } finally {
                setLoadingExtra(false);
            }
        };
        fetchDashboardData();
    }, [user?._id]);

    const showMessage = (msg) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(msg, ToastAndroid.SHORT)
        } else {
            Alert.alert(msg)
        }
    }

    const toProperCase = (value) =>
        value.toLowerCase().split(" ").map(word =>
            word.split("-").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join("-")
        ).join(" ");

    const validate = (field, value) => {
        if (field === "firstname") {
            if (value === "") return "First name is required.";
            if (value.length < 2) return "Must be at least 2 characters.";
            if (/[ ]$/.test(value)) return "Must not end with a space.";
        }
        if (field === "lastname") {
            if (value === "") return "Last name is required.";
            if (value.length < 2) return "Must be at least 2 characters.";
            if (/[ -]$/.test(value)) return "Must not end with a space or dash.";
        }
        if (field === "email") {
            if (value === "") return "Email is required.";
            if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) return "Invalid email format.";
        }
        if (field === "phonenum") {
            const rawDigits = value.replace(/\D/g, "")
            if (rawDigits === "") return "Phone is required.";
            if (rawDigits.length < 10) return "Phone must be 10 digits";
            if (rawDigits.slice(0, 1) !== "8" && rawDigits.slice(0, 1) !== "9") return "Must start with 8 or 9";
        }
        return "";
    };

    const valueHandler = (field, value) => {
        setUserData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: validate(field, value) }));
    };

    const formatPhone = (val) => {
        let cleanVal = val.replace("+63", "")
        let value = cleanVal.replace(/\D/g, "");
        
        let formatted = "";
        if (value.length > 0) formatted += value.slice(0, 3);
        if (value.length >= 4) formatted += " " + value.slice(3, 6);
        if (value.length >= 7) formatted += " " + value.slice(6, 10);
        valueHandler("phonenum", formatted);
    }

    const getInitials = () => {
        const currentUsername = userData.username?.trim() || user?.username?.trim() || "";
        return currentUsername ? currentUsername.charAt(0).toUpperCase() : "U";
    }

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            showMessage("Permission to access camera roll is required!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true 
        });

        if (!result.canceled && result.assets[0].base64) {
            const sizeInBytes = result.assets[0].base64.length * (3/4)
            if (sizeInBytes > 2 * 1024 * 1024) {
                showMessage('Image must be 2MB or less.');
                return;
            }
            setProfileImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    }

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            valueHandler('birthdate', formattedDate);
        }
    };

    const handleSavePress = () => {
        const nextErrors = {
            firstname: validate('firstname', userData.firstname),
            lastname: validate('lastname', userData.lastname),
            email: validate('email', userData.email),
            phonenum: validate('phonenum', userData.phonenum)
        }
        setErrors(nextErrors)

        const hasErrors = Object.values(nextErrors).some(Boolean)
        if (hasErrors) {
            showMessage('Please fix the highlighted fields before saving.')
            return
        }
        setConfirmModalVisible(true)
    }

    const confirmSave = async () => {
        try {
            const response = await api.put(`/users/users/${user._id}`, {
                ...userData,
                phone: userData.phonenum, 
                homeAddress: userData.address,
                profileImage: profileImage 
            })

            if (response.data.success || response.status === 200) {
                setOriginalData(userData)
                setEditing(false)
                setConfirmModalVisible(false)
                setSuccessModalVisible(true)

                updateUser({
                    firstname: userData.firstname,
                    lastname: userData.lastname,
                    email: userData.email,
                    profileImage: profileImage
                })
            }
        } catch (error) {
            console.log("Update Error:", error.response?.data || error.message)
            showMessage("Failed to update profile.")
            setConfirmModalVisible(false)
        }
    }

    const cancelEdit = () => {
        setUserData(originalData)
        setErrors({ firstname: "", lastname: "", email: "", phonenum: "" })
        setEditing(false)
    }

    // 🔥 PREFERENCES HANDLERS 🔥
    const togglePreference = (key, value, limit) => {
        if (!editingPreferences) return;
        setPreferences(prev => {
            const current = prev[key] || [];
            const exists = current.includes(value);

            if (!exists && limit && current.length >= limit) return prev;

            const next = exists ? current.filter(item => item !== value) : [...current, value];
            return { ...prev, [key]: next };
        });
    };

    const savePreferences = async () => {
        setSavingPreferences(true);
        try {
            await api.post('/preferences/save', {
                moods: preferences.moods,
                tours: preferences.tours
            }, withUserHeader(user._id));
            setOriginalPreferences(preferences);
            setEditingPreferences(false);
            showMessage('Preferences saved successfully!');
        } catch (error) {
            showMessage('Failed to save preferences');
        } finally {
            setSavingPreferences(false);
        }
    };

    const cancelPreferencesEdit = () => {
        setPreferences(originalPreferences);
        setEditingPreferences(false);
    };

    const getStatusStyle = (status) => {
        const s = String(status).toLowerCase();
        if (s.includes('success') || s.includes('approve')) return { bg: '#f0f4ff', text: '#305797' };
        if (s.includes('reject') || s.includes('cancel')) return { bg: '#fee2e2', text: '#b91c1c' };
        return { bg: '#fef9c3', text: '#b45309' }; 
    };

    if (!fontsLoaded) return null;

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f5f7fa' }} showsVerticalScrollIndicator={false}>
            <Header openSidebar={() => { setSidebarVisible(true) }} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <View style={ProfileStyle.container}>
                
                {/* --- MY PROFILE CARD --- */}
                <View style={ProfileStyle.card}>
                    <Text style={ProfileStyle.profileHeading}>My Profile</Text>

                    <View style={ProfileStyle.profileImageContainer}>
                        <View style={ProfileStyle.profileAvatarWrapper}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={ProfileStyle.profileImage} />
                            ) : (
                                <Text style={ProfileStyle.profileAvatarPlaceholder}>{getInitials()}</Text>
                            )}
                        </View>
                        {editing && (
                            <>
                                <TouchableOpacity style={ProfileStyle.changePhotoButton} onPress={pickImage}>
                                    <Text style={ProfileStyle.changePhotoText}>Change Photo</Text>
                                </TouchableOpacity>
                                <Text style={ProfileStyle.photoHelpText}>PNG/JPG up to 2MB.</Text>
                            </>
                        )}
                    </View>

                    {/* 🔥 NEW ROLE DISPLAY HERE 🔥 */}
                    <Text style={ProfileStyle.roleSubtitle}>Customer</Text>

                    <Text style={ProfileStyle.profileLabel}>Username</Text>
                    <TextInput value={userData.username} editable={false} style={[ProfileStyle.profileInputs, ProfileStyle.profileInputsDisabled]} />

                    <View style={ProfileStyle.fullNameContainer}>
                        <View style={ProfileStyle.halfInput}>
                            <Text style={ProfileStyle.profileLabel}>First Name</Text>
                            <TextInput 
                                value={userData.firstname} editable={editing} 
                                onChangeText={(text) => valueHandler('firstname', toProperCase(text))}
                                style={[ProfileStyle.profileInputs, !editing && ProfileStyle.profileInputsDisabled, errors.firstname && ProfileStyle.profileInputsError]} 
                            />
                            {errors.firstname ? <Text style={ProfileStyle.errorMessage}>{errors.firstname}</Text> : null}
                        </View>
                        <View style={ProfileStyle.halfInput}>
                            <Text style={ProfileStyle.profileLabel}>Last Name</Text>
                            <TextInput 
                                value={userData.lastname} editable={editing} 
                                onChangeText={(text) => valueHandler('lastname', toProperCase(text))}
                                style={[ProfileStyle.profileInputs, !editing && ProfileStyle.profileInputsDisabled, errors.lastname && ProfileStyle.profileInputsError]} 
                            />
                            {errors.lastname ? <Text style={ProfileStyle.errorMessage}>{errors.lastname}</Text> : null}
                        </View>
                    </View>

                    <Text style={ProfileStyle.profileLabel}>Email Address</Text>
                    <TextInput 
                        value={userData.email} 
                        editable={editing} 
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onChangeText={(text) => valueHandler('email', text.trim())}
                        style={[ProfileStyle.profileInputs, !editing && ProfileStyle.profileInputsDisabled, errors.email && ProfileStyle.profileInputsError]} 
                    />
                    {errors.email ? <Text style={ProfileStyle.errorMessage}>{errors.email}</Text> : null}

                    <Text style={ProfileStyle.profileLabel}>Phone Number</Text>
                    <View style={[ProfileStyle.phoneInputContainer, !editing && ProfileStyle.profileInputsDisabled, errors.phonenum && ProfileStyle.profileInputsError]}>
                        <Text style={ProfileStyle.phonePrefix}>+63</Text>
                        <TextInput 
                            value={userData.phonenum} editable={editing} keyboardType="numeric" maxLength={12} 
                            onChangeText={formatPhone} style={[ProfileStyle.phoneInput, !editing && ProfileStyle.profileInputsDisabled]} 
                        />
                    </View>
                    {errors.phonenum ? <Text style={ProfileStyle.errorMessage}>{errors.phonenum}</Text> : null}

                    <Text style={ProfileStyle.profileLabel}>Home Address</Text>
                    <TextInput 
                        value={userData.address} editable={editing} 
                        onChangeText={(text) => valueHandler('address', text)}
                        style={[ProfileStyle.profileInputs, !editing && ProfileStyle.profileInputsDisabled]} 
                    />

                    <Text style={ProfileStyle.profileLabel}>Gender</Text>
                    <TouchableOpacity 
                        style={[ProfileStyle.profileInputs, ProfileStyle.dropdownButton, !editing && ProfileStyle.profileInputsDisabled]} 
                        disabled={!editing} onPress={() => setGenderModalVisible(true)}
                    >
                        <Text style={{ color: userData.gender ? '#333' : '#a0a0a0', fontFamily: 'Roboto_400Regular' }}>
                            {userData.gender || "Select gender"}
                        </Text>
                        {editing && <Ionicons name="chevron-down" size={16} color="#666" />}
                    </TouchableOpacity>

                    <Text style={ProfileStyle.profileLabel}>Date of Birth</Text>
                    <TouchableOpacity 
                        style={[ProfileStyle.profileInputs, ProfileStyle.dropdownButton, !editing && ProfileStyle.profileInputsDisabled]} 
                        disabled={!editing} onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={[ProfileStyle.datePickerText, { color: userData.birthdate ? '#333' : '#a0a0a0' }]}>
                            {userData.birthdate || "Select birthdate"}
                        </Text>
                        <Ionicons name="calendar-outline" size={16} color={editing ? "#305797" : "#a0a0a0"} />
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={userData.birthdate ? new Date(userData.birthdate) : new Date()}
                            mode="date" display="default" maximumDate={new Date()} onChange={handleDateChange}
                        />
                    )}

                    <Text style={ProfileStyle.profileLabel}>Nationality</Text>
                    <TextInput 
                        value={userData.nationality} editable={editing} 
                        onChangeText={(text) => valueHandler('nationality', text)}
                        style={[ProfileStyle.profileInputs, !editing && ProfileStyle.profileInputsDisabled]} 
                    />

                    {userData.isAccountVerified && (
                        <View style={ProfileStyle.verifiedBadge}>
                            <Ionicons name="checkmark" size={18} color="#52c41a" style={{ marginRight: 5 }} />
                            <Text style={ProfileStyle.verifiedText}>Account Verified</Text>
                        </View>
                    )}

                    {!editing ? (
                        <TouchableOpacity style={[ProfileStyle.editButton, { marginTop: 25 }]} onPress={() => setEditing(true)}>
                            <Text style={ProfileStyle.buttonText}><Ionicons name="pencil" size={14} color="#fff"/> Edit Profile</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={ProfileStyle.actionContainer}>
                            <TouchableOpacity style={ProfileStyle.saveButton} onPress={handleSavePress}>
                                <Text style={ProfileStyle.buttonText}><Ionicons name="save-outline" size={16} color="#fff"/> Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={ProfileStyle.cancelButton} onPress={cancelEdit}>
                                <Text style={ProfileStyle.buttonText}><Ionicons name="close" size={16} color="#fff"/> Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* --- 🔥 NEW: PREFERENCES CARD 🔥 --- */}
                <View style={ProfileStyle.card}>
                    <View style={ProfileStyle.preferencesHeader}>
                        <Text style={ProfileStyle.profileHeading}>Preferences</Text>
                        {!editingPreferences && (
                            <TouchableOpacity style={ProfileStyle.editPrefButton} onPress={() => setEditingPreferences(true)}>
                                <Ionicons name="pencil" size={14} color="#fff" />
                                <Text style={ProfileStyle.editPrefButtonText}>Edit</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Moods Section */}
                    <Text style={ProfileStyle.prefSectionTitle}>What are you in the mood for?</Text>
                    <Text style={ProfileStyle.prefSubText}>Choose up to 3</Text>
                    <View style={ProfileStyle.chipGrid}>
                        {moodOptions.map(option => {
                            const isSelected = preferences.moods.includes(option);
                            return (
                                <TouchableOpacity 
                                    key={option}
                                    style={[ProfileStyle.chip, isSelected && ProfileStyle.chipSelected]}
                                    onPress={() => togglePreference('moods', option, 3)}
                                    disabled={!editingPreferences}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[ProfileStyle.chipText, isSelected && ProfileStyle.chipTextSelected]}>{option}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    {/* Tour Type Section */}
                    <Text style={[ProfileStyle.prefSectionTitle, { marginTop: 20 }]}>What type of tour do you like?</Text>
                    <Text style={ProfileStyle.prefSubText}>Pick as many as you want.</Text>
                    <View style={ProfileStyle.chipGrid}>
                        {tourOptions.map(option => {
                            const isSelected = preferences.tours.includes(option);
                            return (
                                <TouchableOpacity 
                                    key={option}
                                    style={[ProfileStyle.chip, isSelected && ProfileStyle.chipSelected]}
                                    onPress={() => togglePreference('tours', option)}
                                    disabled={!editingPreferences}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[ProfileStyle.chipText, isSelected && ProfileStyle.chipTextSelected]}>{option}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    {/* Edit Actions */}
                    {editingPreferences && (
                        <View style={ProfileStyle.actionContainer}>
                            <TouchableOpacity style={ProfileStyle.saveButton} onPress={savePreferences} disabled={savingPreferences}>
                                {savingPreferences ? <ActivityIndicator color="#fff" size="small"/> : <Text style={ProfileStyle.buttonText}><Ionicons name="save-outline" size={16} color="#fff"/> Save</Text>}
                            </TouchableOpacity>
                            <TouchableOpacity style={ProfileStyle.cancelButton} onPress={cancelPreferencesEdit}>
                                <Text style={ProfileStyle.buttonText}><Ionicons name="close" size={16} color="#fff"/> Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* --- DYNAMIC REVIEWS --- */}
                <Text style={ProfileStyle.sectionTitle}>My Recent Reviews</Text>
                {loadingExtra ? (
                    <ActivityIndicator size="small" color="#305797" style={{ marginTop: 10, marginBottom: 20 }} />
                ) : recentReviews.length === 0 ? (
                    <View style={ProfileStyle.emptyStateCard}>
                        <Text style={ProfileStyle.emptyStateText}>No reviews yet.</Text>
                    </View>
                ) : (
                    recentReviews.slice(0, 3).map((review, index) => (
                        <View key={index} style={[ProfileStyle.emptyStateCard, { alignItems: 'flex-start', padding: 15 }]}>
                            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#305797', fontSize: 14, marginBottom: 2, textTransform: 'uppercase' }}>
                                {review.packageId?.packageName || review.package?.packageName || review.packageName || "Tour Package"}
                            </Text>
                            <Text style={{ fontFamily: 'Roboto_400Regular', color: '#6b7280', fontSize: 12, marginBottom: 6 }}>
                                {dayjs(review.createdAt || review.date).format('MMM D, YYYY')}
                            </Text>
                            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#fadb14', fontSize: 16 }}>
                                {'★'.repeat(review.rating || 5)}{'☆'.repeat(5 - (review.rating || 5))}
                            </Text>
                            <Text style={{ fontFamily: 'Roboto_400Regular', color: '#4b5563', marginTop: 6 }} numberOfLines={2}>
                                {review.review}
                            </Text>
                        </View>
                    ))
                )}

                {/* --- DYNAMIC BOOKINGS --- */}
                <Text style={ProfileStyle.sectionTitle}>My Recent Bookings</Text>
                {loadingExtra ? (
                    <ActivityIndicator size="small" color="#305797" style={{ marginTop: 10, marginBottom: 20 }} />
                ) : recentBookings.length === 0 ? (
                    <View style={ProfileStyle.emptyStateCard}>
                        <Text style={ProfileStyle.emptyStateText}>No bookings yet.</Text>
                    </View>
                ) : (
                    recentBookings.slice(0, 3).map((booking, index) => {
                        const statusColor = getStatusStyle(booking.status || "Pending");
                        return (
                            <View key={index} style={[ProfileStyle.emptyStateCard, { alignItems: 'flex-start', padding: 15 }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 4 }}>
                                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#305797', fontSize: 14, flex: 1, textTransform: 'uppercase' }}>
                                        {booking.packageId?.packageName || booking.package?.packageName || booking.bookingDetails?.tourPackageTitle || booking.bookingDetails?.pkg?.packageName || booking.packageName || "Custom Package"}
                                    </Text>
                                    
                                    <View style={{ backgroundColor: statusColor.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginLeft: 8, alignSelf: 'flex-start' }}>
                                        <Text style={{ fontFamily: 'Montserrat_700Bold', color: statusColor.text, fontSize: 10, textTransform: 'uppercase' }}>
                                            {booking.status || "Pending"}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={{ fontFamily: 'Roboto_400Regular', color: '#6b7280', fontSize: 12, marginBottom: 10 }}>
                                    {dayjs(booking.createdAt || booking.bookingDate).format('MMM D, YYYY')}
                                </Text>

                                <Text style={{ fontFamily: 'Roboto_400Regular', color: '#4b5563', fontSize: 13 }}>
                                    Reference No. {booking.bookingReference || booking.reference || "N/A"} • {(booking.packageId?.packageType || booking.package?.packageType || booking.bookingDetails?.pkg?.packageType || "DOMESTIC").toUpperCase()}
                                </Text>
                            </View>
                        );
                    })
                )}
                <View style={{ height: 30 }} />

                {/* Modals */}
                <Modal visible={genderModalVisible} transparent={true} animationType="fade">
                    <TouchableOpacity style={ModalStyle.modalOverlay} activeOpacity={1} onPress={() => setGenderModalVisible(false)}>
                        <View style={[ModalStyle.modalBox, { width: '80%', paddingVertical: 10 }]}>
                            {['Male', 'Female', 'Other', 'Prefer not to say'].map((option, index) => (
                                <TouchableOpacity 
                                    key={index} 
                                    style={{ paddingVertical: 15, borderBottomWidth: index === 3 ? 0 : 1, borderBottomColor: '#f0f0f0', alignItems: 'center' }}
                                    onPress={() => { valueHandler('gender', option); setGenderModalVisible(false); }}
                                >
                                    <Text style={{ fontSize: 16, color: '#305797', fontFamily: 'Roboto_500Medium' }}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>

                <Modal transparent animationType='fade' visible={confirmModalVisible} onRequestClose={() => setConfirmModalVisible(false)}>
                    <View style={ModalStyle.modalOverlay}>
                        <View style={ModalStyle.modalBox}>
                            <Text style={ModalStyle.modalTitle}>Confirm Changes</Text>
                            <Text style={ModalStyle.modalText}>Are you sure you want to save these changes?</Text>
                            <View style={ModalStyle.modalButtonContainer}>
                                <TouchableOpacity style={ModalStyle.modalButton} onPress={confirmSave}>
                                    <Text style={ModalStyle.modalButtonText}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={ModalStyle.modalCancelButton} onPress={() => setConfirmModalVisible(false)}>
                                    <Text style={ModalStyle.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal transparent animationType='fade' visible={successModalVisible} onRequestClose={() => setSuccessModalVisible(false)}>
                    <View style={ModalStyle.modalOverlay}>
                        <View style={ModalStyle.modalBox}>
                            <Text style={ModalStyle.modalTitle}>Change Successful</Text>
                            <Text style={ModalStyle.modalText}>Your profile has been updated successfully!</Text>
                            <TouchableOpacity style={ModalStyle.modalButton} onPress={() => { setEditing(false); setSuccessModalVisible(false); }}>
                                <Text style={ModalStyle.modalButtonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </View>
        </ScrollView>
    )
}