import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Alert, TextInput, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import BookingUploadsStyle from '../../styles/clientstyles/BookingUploadsStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Image } from 'expo-image';
import { useUser } from '../../context/UserContext'; 

const formatDate = (date) => {
    if (!date) return "";
    return date.toISOString().split('T')[0]; 
};

export default function BookingUploads({ route, navigation }) {
    const { user } = useUser();
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const { setupData } = route.params || {};
    
    const counts = setupData?.travelerCounts || { adult: 1, child: 0, infant: 0 };
    const totalTravelers = counts.adult + counts.child + counts.infant;
    const bookingType = setupData?.bookingType || 'Solo Booking';
    
    // 🔥 THE FIX: Web-Synced Domestic Logic
    // We check both paths just in case the data structure shifted during navigation
    const packageType = setupData?.packageType || setupData?.pkg?.packageType || '';
    const isDomestic = String(packageType).toLowerCase().includes('domestic');
    const travelDocumentLabel = isDomestic ? 'Valid ID' : 'Passport';

    const travelerTypes = useMemo(() => {
        const types = [];
        for(let i=0; i<counts.adult; i++) types.push('Adult');
        for(let i=0; i<counts.child; i++) types.push('Child');
        for(let i=0; i<counts.infant; i++) types.push('Infant');
        return types;
    }, [counts]);

    const getRoomOptions = () => {
        if (bookingType === 'Solo Booking') return ['SINGLE'];
        if (totalTravelers === 2 || totalTravelers === 4) return ['TWIN', 'DOUBLE'];
        if (totalTravelers === 3) return ['TRIPLE'];
        return ['TWIN', 'DOUBLE', 'TRIPLE'];
    };
    const roomOptions = getRoomOptions();

    const [travelersData, setTravelersData] = useState(() => {
        return Array.from({ length: totalTravelers }).map((_, index) => {
            if (index === 0 && user) {
                return {
                    title: user.title || '', 
                    firstName: user.firstname || '',
                    lastName: user.lastname || '',
                    roomType: bookingType === 'Solo Booking' ? 'SINGLE' : '',
                    birthdate: '', passportNo: '', passportExpiry: ''
                };
            }
            return {
                title: '', firstName: '', lastName: '', 
                roomType: bookingType === 'Solo Booking' ? 'SINGLE' : '', 
                birthdate: '', passportNo: '', passportExpiry: ''
            };
        });
    });

    const [uploads, setUploads] = useState({});
    const [activeDropdown, setActiveDropdown] = useState(null); 
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerConfig, setDatePickerConfig] = useState({ index: 0, type: 'birthdate', currentDate: new Date() });

    const updateTraveler = (index, field, value) => {
        const newData = [...travelersData];
        newData[index][field] = value;
        setTravelersData(newData);
    };

    const pickImage = async (index, type) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setUploads(prev => ({
                ...prev,
                [index]: {
                    ...prev[index],
                    [type]: result.assets[0].uri
                }
            }));
        }
    };

    const currentYear = new Date().getFullYear();
    const maxBirthDate = new Date(); 
    const minExpiryYear = currentYear === 2026 ? 2027 : currentYear + 1;
    const minExpiryDate = new Date(minExpiryYear, 0, 1);

    const openDatePicker = (index, type) => {
        const existingDateStr = travelersData[index][type];
        const initialDate = existingDateStr ? new Date(existingDateStr) : new Date();
        setDatePickerConfig({ index, type, currentDate: initialDate });
        setShowDatePicker(true);
    };

    const onDateSelected = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios'); 
        if (selectedDate) {
            setDatePickerConfig(prev => ({ ...prev, currentDate: selectedDate }));
            if (Platform.OS !== 'ios') {
                updateTraveler(datePickerConfig.index, datePickerConfig.type, formatDate(selectedDate));
            }
        }
    };

    const confirmIOSDate = () => {
        updateTraveler(datePickerConfig.index, datePickerConfig.type, formatDate(datePickerConfig.currentDate));
        setShowDatePicker(false);
    };

    const handleNext = () => {
        const uploadedCount = Object.keys(uploads).length;
        const isComplete = Object.values(uploads).every(u => u.passport && u.photo);

        if (uploadedCount < totalTravelers || !isComplete) {
            Alert.alert("Missing Documents", `Please upload both ${travelDocumentLabel} and 2x2 Photo for all travelers.`);
            return;
        }
        navigation.navigate("registrationstep1", { setupData, travelerUploads: uploads, travelersData });
    };

    return (
        <SafeAreaView style={BookingUploadsStyle.safeArea}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={BookingUploadsStyle.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* 🔥 DYNAMIC MAIN TITLE 🔥 */}
                <Text style={QuotationAllInStyle.mainTitle}>Upload {travelDocumentLabel}</Text>
                <Text style={[QuotationAllInStyle.subtitle, { marginBottom: 20 }]}>
                    Please upload a clear image of your {travelDocumentLabel.toLowerCase()} for each traveler.
                </Text>

                {/* 🔥 DYNAMIC NOTES BOX 🔥 */}
                <View style={BookingUploadsStyle.notesBox}>
                    <Text style={BookingUploadsStyle.notesTitle}>Note:</Text>
                    <View style={BookingUploadsStyle.bulletRow}>
                        <Text style={BookingUploadsStyle.bullet}>•</Text>
                        <Text style={BookingUploadsStyle.notesText}>
                            {isDomestic ? 'Upload a clear image of the valid ID' : 'Upload a clear image of the passport bio page'}
                        </Text>
                    </View>
                    <View style={BookingUploadsStyle.bulletRow}><Text style={BookingUploadsStyle.bullet}>•</Text><Text style={BookingUploadsStyle.notesText}>Accepted formats: JPG, PNG</Text></View>
                    <View style={BookingUploadsStyle.bulletRow}><Text style={BookingUploadsStyle.bullet}>•</Text><Text style={BookingUploadsStyle.notesText}>Maximum file size: 5MB</Text></View>
                    <View style={BookingUploadsStyle.bulletRow}><Text style={BookingUploadsStyle.bullet}>•</Text><Text style={BookingUploadsStyle.notesText}>Blurry or cropped images may delay booking confirmation</Text></View>

                    <Text style={[BookingUploadsStyle.notesTitle, { marginTop: 12 }]}>Note for 2x2 ID Photos:</Text>
                    <View style={BookingUploadsStyle.bulletRow}><Text style={BookingUploadsStyle.bullet}>•</Text><Text style={BookingUploadsStyle.notesText}>Upload a clear image of the 2x2 ID photo</Text></View>
                    <View style={BookingUploadsStyle.bulletRow}><Text style={BookingUploadsStyle.bullet}>•</Text><Text style={BookingUploadsStyle.notesText}>The photo must have a white plain background</Text></View>
                    <View style={BookingUploadsStyle.bulletRow}><Text style={BookingUploadsStyle.bullet}>•</Text><Text style={BookingUploadsStyle.notesText}>Face should be clearly visible and not covered by any accessories</Text></View>
                    <View style={BookingUploadsStyle.bulletRow}><Text style={BookingUploadsStyle.bullet}>•</Text><Text style={BookingUploadsStyle.notesText}>No Fullnames or any names printed in the photo</Text></View>
                    <View style={BookingUploadsStyle.bulletRow}><Text style={BookingUploadsStyle.bullet}>•</Text><Text style={BookingUploadsStyle.notesText}>Accepted formats: JPG, PNG</Text></View>
                    <View style={BookingUploadsStyle.bulletRow}><Text style={BookingUploadsStyle.bullet}>•</Text><Text style={BookingUploadsStyle.notesText}>Maximum file size: 5MB</Text></View>
                    <View style={BookingUploadsStyle.bulletRow}><Text style={BookingUploadsStyle.bullet}>•</Text><Text style={BookingUploadsStyle.notesText}>Blurry or cropped images may delay booking confirmation</Text></View>
                </View>

                {travelersData.map((t, index) => (
                    <View key={index} style={BookingUploadsStyle.uploadCard}>
                        <Text style={BookingUploadsStyle.travelerHeader}>Traveler {index + 1} - {travelerTypes[index]}</Text>
                        <Text style={BookingUploadsStyle.cardSubtitle}>Upload {travelDocumentLabel.toLowerCase()} and 2x2 ID photo</Text>
                        
                        <View style={BookingUploadsStyle.formSection}>
                            <View style={BookingUploadsStyle.formRow}>
                                <TouchableOpacity 
                                    style={[BookingUploadsStyle.input, BookingUploadsStyle.selectInput, { flex: 0.35 }]} 
                                    onPress={() => setActiveDropdown({ index, type: 'title' })}
                                >
                                    <Text style={[BookingUploadsStyle.inputText, !t.title && BookingUploadsStyle.placeholderText]}>
                                        {t.title || 'MR/MS'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={14} color="#9ca3af" />
                                </TouchableOpacity>

                                <TextInput style={[BookingUploadsStyle.input, { flex: 1 }]} placeholder="First name" value={t.firstName} onChangeText={(v) => updateTraveler(index, 'firstName', v)} />
                                <TextInput style={[BookingUploadsStyle.input, { flex: 1 }]} placeholder="Last name" value={t.lastName} onChangeText={(v) => updateTraveler(index, 'lastName', v)} />
                            </View>

                            <View style={BookingUploadsStyle.formRow}>
                                <TouchableOpacity 
                                    style={[BookingUploadsStyle.input, BookingUploadsStyle.selectInput, { flex: 1 }]} 
                                    onPress={() => {
                                        if (bookingType !== 'Solo Booking') {
                                            setActiveDropdown({ index, type: 'roomType' });
                                        }
                                    }}
                                >
                                    <Text style={[BookingUploadsStyle.inputText, !t.roomType && BookingUploadsStyle.placeholderText]}>
                                        {t.roomType || 'Room type'}
                                    </Text>
                                    {bookingType !== 'Solo Booking' && <Ionicons name="chevron-down" size={14} color="#9ca3af" />}
                                </TouchableOpacity>

                                <TouchableOpacity style={[BookingUploadsStyle.input, BookingUploadsStyle.selectInput, { flex: 1 }]} onPress={() => openDatePicker(index, 'birthdate')}>
                                    <Text style={[BookingUploadsStyle.inputText, !t.birthdate && BookingUploadsStyle.placeholderText]}>
                                        {t.birthdate || 'Birthdate'}
                                    </Text>
                                    <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
                                </TouchableOpacity>
                            </View>

                            {/* 🔥 CONDITIONAL PASSPORT FIELDS 🔥 */}
                            {!isDomestic && (
                                <View style={BookingUploadsStyle.formRow}>
                                    <TextInput style={[BookingUploadsStyle.input, { flex: 1 }]} placeholder="Passport number" keyboardType="numeric" maxLength={7} value={t.passportNo} onChangeText={(v) => updateTraveler(index, 'passportNo', v.replace(/[^0-9]/g, ''))} />
                                    
                                    <TouchableOpacity style={[BookingUploadsStyle.input, BookingUploadsStyle.selectInput, { flex: 1 }]} onPress={() => openDatePicker(index, 'passportExpiry')}>
                                        <Text style={[BookingUploadsStyle.inputText, !t.passportExpiry && BookingUploadsStyle.placeholderText]}>
                                            {t.passportExpiry || 'Passport expiry'}
                                        </Text>
                                        <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <View style={BookingUploadsStyle.uploadRow}>
                            <View style={BookingUploadsStyle.uploadSlot}>
                                {/* 🔥 DYNAMIC LABEL AND ICON 🔥 */}
                                <Text style={BookingUploadsStyle.slotLabel}>{travelDocumentLabel.toUpperCase()} PREVIEW</Text>
                                <TouchableOpacity style={[BookingUploadsStyle.dragger, uploads[index]?.passport && BookingUploadsStyle.draggerActive]} onPress={() => pickImage(index, 'passport')}>
                                    {uploads[index]?.passport ? <Image source={{ uri: uploads[index].passport }} style={BookingUploadsStyle.previewImage} /> : <Ionicons name={isDomestic ? "id-card-outline" : "book-outline"} size={24} color="#305797" />}
                                </TouchableOpacity>
                            </View>

                            <View style={BookingUploadsStyle.uploadSlot}>
                                <Text style={BookingUploadsStyle.slotLabel}>2x2 PHOTO</Text>
                                <TouchableOpacity style={[BookingUploadsStyle.dragger, uploads[index]?.photo && BookingUploadsStyle.draggerActive]} onPress={() => pickImage(index, 'photo')}>
                                    {uploads[index]?.photo ? <Image source={{ uri: uploads[index].photo }} style={BookingUploadsStyle.previewImage} /> : <Ionicons name="person-outline" size={24} color="#305797" />}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}

                <View style={BookingUploadsStyle.footerContainer}>
                    <TouchableOpacity style={BookingUploadsStyle.smallProceedButton} onPress={handleNext}>
                        <Text style={BookingUploadsStyle.smallProceedButtonText}>Next: Traveler Information</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={BookingUploadsStyle.backTextButton} onPress={() => navigation.goBack()}>
                        <Text style={BookingUploadsStyle.backText}>Back to Review</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal visible={activeDropdown !== null} transparent={true} animationType="fade">
                <TouchableOpacity style={BookingUploadsStyle.dropdownOverlay} activeOpacity={1} onPress={() => setActiveDropdown(null)}>
                    <View style={BookingUploadsStyle.dropdownMenu}>
                        {activeDropdown?.type === 'title' ? (
                            ['MR', 'MS'].map(opt => (
                                <TouchableOpacity key={opt} style={BookingUploadsStyle.dropdownItem} onPress={() => {
                                    updateTraveler(activeDropdown.index, 'title', opt);
                                    setActiveDropdown(null);
                                }}>
                                    <Text style={BookingUploadsStyle.dropdownItemText}>{opt}</Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            roomOptions.map(opt => (
                                <TouchableOpacity key={opt} style={BookingUploadsStyle.dropdownItem} onPress={() => {
                                    updateTraveler(activeDropdown.index, 'roomType', opt);
                                    setActiveDropdown(null);
                                }}>
                                    <Text style={BookingUploadsStyle.dropdownItemText}>{opt}</Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>

            {showDatePicker && (
                Platform.OS === 'ios' ? (
                    <Modal transparent={true} animationType="slide">
                        <View style={BookingUploadsStyle.iosPickerContainer}>
                            <View style={BookingUploadsStyle.iosPickerHeader}>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <Text style={{ color: '#ef4444', fontSize: 16 }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={confirmIOSDate}>
                                    <Text style={{ color: '#305797', fontSize: 16, fontWeight: 'bold' }}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={datePickerConfig.currentDate}
                                mode="date"
                                display="spinner"
                                maximumDate={datePickerConfig.type === 'birthdate' ? maxBirthDate : undefined}
                                minimumDate={datePickerConfig.type === 'passportExpiry' ? minExpiryDate : undefined}
                                onChange={onDateSelected}
                            />
                        </View>
                    </Modal>
                ) : (
                    <DateTimePicker
                        value={datePickerConfig.currentDate}
                        mode="date"
                        display="default"
                        maximumDate={datePickerConfig.type === 'birthdate' ? maxBirthDate : undefined}
                        minimumDate={datePickerConfig.type === 'passportExpiry' ? minExpiryDate : undefined}
                        onChange={onDateSelected}
                    />
                )
            )}
        </SafeAreaView>
    );
}