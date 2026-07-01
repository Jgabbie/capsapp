import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Alert, TextInput, Platform, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Linking from 'expo-linking';
import { Calendar } from 'react-native-calendars';

import BookingUploadsStyle from '../../styles/clientstyles/BookingUploadsStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import QuotationFormStepStyle from '../../styles/clientstyles/QuotationFormStepStyle';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Image } from 'expo-image';
import { useUser } from '../../context/UserContext';
import { api, withUserHeader } from '../../utils/api';

import dayjs from 'dayjs';

import {
    useFonts,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

import {
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
} from "@expo-google-fonts/roboto";



//format date to YYYY-MM-DD
const formatDate = (date) => {
    if (!date) return "";
    return dayjs(date).format('YYYY-MM-DD');
};


//calculate age based on birthdate
const computeAge = (birthDate) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age -= 1;
    }

    return age < 0 ? null : age;
};


//get min and max birthdate based on traveler type
const getBirthdayBounds = (travelerType) => {
    const today = new Date();
    const category = String(travelerType || '').toLowerCase();

    if (category === 'infant') {
        const maxDate = new Date(today); // Today
        const minDate = new Date(today);
        minDate.setFullYear(minDate.getFullYear() - 2); // 2 years ago

        return {
            minDate: minDate,
            maxDate: maxDate,
            minAge: 0,
            maxAge: 2
        };
    }

    if (category === 'child') {
        const maxDate = new Date(today);
        maxDate.setFullYear(maxDate.getFullYear() - 3); // 3 years ago
        const minDate = new Date(today);
        minDate.setFullYear(minDate.getFullYear() - 11); // 11 years ago

        return {
            minDate: minDate,
            maxDate: maxDate,
            minAge: 3,
            maxAge: 11
        };
    }

    // Adult
    const adultMinDate = new Date(1935, 0, 1);
    const adultMaxDate = new Date(today);
    adultMaxDate.setFullYear(adultMaxDate.getFullYear() - 12);

    return {
        minDate: adultMinDate,
        maxDate: adultMaxDate, // 12+ years old
        minAge: 18,
        maxAge: null
    };
};


//check if traveler type is minor (child or infant)
const isMinorTravelerType = (travelerType) => {
    const normalized = String(travelerType || '').toLowerCase();
    return normalized === 'child' || normalized === 'infant';
};

export default function BookingUploads({ route, navigation }) {
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold,
    });

    const { user } = useUser();
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const { setupData } = route.params || {};

    const counts = setupData?.travelerCounts || { adult: 1, child: 0, infant: 0 };
    const totalTravelers = counts.adult + counts.child + counts.infant;
    const bookingType = setupData?.bookingType || 'Solo Booking';

    //check both paths just in case the data structure shifted during navigation
    const packageType = setupData?.packageType || setupData?.pkg?.packageType || '';
    const isDomestic = String(packageType).toLowerCase().includes('domestic');
    const travelDocumentLabel = isDomestic ? 'Valid ID' : 'Passport';
    const rawVisaValue = setupData?.pkg?.requiresVisa ?? setupData?.pkg?.packageRequiresVisa ?? setupData?.pkg?.visaRequired;
    const requiresVisa = rawVisaValue === true || String(rawVisaValue).toLowerCase() === 'yes' || String(rawVisaValue).toLowerCase() === 'true';


    //memoized traveler types array to avoid recalculating on every render
    const travelerTypes = useMemo(() => {
        const types = [];
        for (let i = 0; i < counts.adult; i++) types.push('Adult');
        for (let i = 0; i < counts.child; i++) types.push('Child');
        for (let i = 0; i < counts.infant; i++) types.push('Infant');
        return types;
    }, [counts]);


    //get room options based on booking type
    const getRoomOptions = () => {
        if (bookingType === 'Solo Booking') return ['SINGLE'];
        // Grouped booking: Always show TWIN, DOUBLE, TRIPLE
        return ['TWIN', 'DOUBLE', 'TRIPLE'];
    };

    const roomOptions = getRoomOptions();

    //initialize travelers data with default values based on booking type and traveler type
    const [travelersData, setTravelersData] = useState(() => {
        return Array.from({ length: totalTravelers }).map((_, index) => {
            const travelerType = index < counts.adult ? 'Adult' : index < counts.adult + counts.child ? 'Child' : 'Infant';

            let initialRoomType = '';

            if (bookingType === 'Solo Booking') {
                initialRoomType = 'SINGLE';
            } else if (bookingType === 'Group Booking') {
                // For grouped booking, set TWIN as default for adults, N/A for child/infant
                if (isMinorTravelerType(travelerType)) {
                    initialRoomType = 'N/A';
                } else {
                    initialRoomType = 'TWIN'; // TWIN is the base/default for group
                }
            }

            if (index === 0 && user) {
                return {
                    title: user.title || '',
                    firstName: user.firstname || '',
                    lastName: user.lastname || '',
                    roomType: initialRoomType,
                    birthdate: '', passportNo: '', passportExpiry: ''
                };
            }
            return {
                title: '', firstName: '', lastName: '',
                roomType: initialRoomType,
                birthdate: '', passportNo: '', passportExpiry: ''
            };
        });
    });

    const [uploads, setUploads] = useState({});
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerConfig, setDatePickerConfig] = useState({
        index: 0,
        type: 'birthdate',
        currentDate: dayjs().format('YYYY-MM-DD')
    });
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    //enforce room type rules based on traveler type and booking type whenever travelerTypes or bookingType changes
    useEffect(() => {
        setTravelersData(prevData =>
            prevData.map((traveler, index) => {
                const travelerType = travelerTypes[index];

                if (isMinorTravelerType(travelerType)) {
                    // Child/Infant must have N/A room type
                    if (traveler.roomType !== 'N/A') {
                        return { ...traveler, roomType: 'N/A' };
                    }
                } else if (bookingType === 'Group Booking') {
                    // Adult in group booking: ensure TWIN as default if not set
                    if (!traveler.roomType) {
                        return { ...traveler, roomType: 'TWIN' };
                    }
                }
                return traveler;
            })
        );
    }, [travelerTypes, bookingType]);


    //update traveler data when a field changes
    const updateTraveler = (index, field, value) => {
        const newData = [...travelersData];
        newData[index][field] = value;
        setTravelersData(newData);
    };


    //upload document to cloudinary and return the uploaded URL
    const uploadDocumentToCloudinary = async (uri, name, type, userId) => {
        const formData = new FormData();
        formData.append('files', {
            uri,
            name,
            type,
        });

        const response = await api.post('/upload/upload-booking-documents', formData, {
            ...withUserHeader(userId),
            headers: {
                ...(withUserHeader(userId)?.headers || {}),
                'Content-Type': 'multipart/form-data',
            },
        });

        const uploadedUrls = response?.data?.urls || [];
        return uploadedUrls[0] || null;
    };


    //pick image or document for a traveler and upload it to cloudinary, then update the uploads state
    const pickImage = async (index, type) => {
        try {
            if (type === 'photo') {
                try {
                    const result = await DocumentPicker.getDocumentAsync({
                        type: ['image/*', 'application/pdf'],
                        copyToCacheDirectory: true,
                        multiple: false,
                    });

                    if (result.canceled || !result.assets?.length) {
                        return;
                    }

                    const file = result.assets[0];
                    const fileName = file.name || file.fileName || `traveler-${index + 1}-photo`;
                    const mimeType = file.mimeType || file.type || 'application/octet-stream';
                    const uploadedUrl = await uploadDocumentToCloudinary(file.uri, fileName, mimeType, user?._id);

                    if (!uploadedUrl) {
                        throw new Error('Upload failed');
                    }

                    const isPdf = String(mimeType).toLowerCase().includes('pdf') || String(fileName).toLowerCase().endsWith('.pdf');

                    setUploads(prev => ({
                        ...prev,
                        [index]: {
                            ...prev[index],
                            [type]: uploadedUrl,
                            [`${type}Type`]: isPdf ? 'pdf' : 'image',
                            [`${type}Name`]: isPdf ? fileName : null
                        }
                    }));
                } catch (fileError) {
                    console.error('Document picker error:', fileError);
                    Alert.alert('Error', 'Failed to pick file. Please try again.');
                }
            } else {
                try {
                    const result = await DocumentPicker.getDocumentAsync({
                        type: ['image/*', 'application/pdf'],
                        copyToCacheDirectory: true,
                        multiple: false,
                    });

                    if (result.canceled || !result.assets?.length) {
                        return;
                    }

                    const file = result.assets[0];
                    const fileName = file.name || file.fileName || `traveler-${index + 1}-document`;
                    const mimeType = file.mimeType || file.type || 'application/octet-stream';
                    const uploadedUrl = await uploadDocumentToCloudinary(file.uri, fileName, mimeType, user?._id);

                    if (!uploadedUrl) {
                        throw new Error('Upload failed');
                    }

                    const isPdf = String(mimeType).toLowerCase().includes('pdf') || String(fileName).toLowerCase().endsWith('.pdf');

                    setUploads(prev => ({
                        ...prev,
                        [index]: {
                            ...prev[index],
                            [type]: uploadedUrl,
                            [`${type}Type`]: isPdf ? 'pdf' : 'image',
                            [`${type}Name`]: isPdf ? fileName : null
                        }
                    }));
                } catch (fileError) {
                    console.error('Document picker error:', fileError);
                    Alert.alert('Error', 'Failed to pick file. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error in pickImage:', error);
            Alert.alert('Error', 'An error occurred. Please try again.');
        }
    };

    const currentYear = new Date().getFullYear();
    const maxBirthDate = new Date();
    const minExpiryYear = currentYear === 2026 ? 2027 : currentYear + 1;
    const minExpiryDate = new Date(minExpiryYear, 0, 1);


    //get birthday limits for a traveler based on their type (Adult, Child, Infant)
    const getBirthdayLimits = (travelerIndex) => {
        const travelerType = travelerTypes[travelerIndex];
        const bounds = getBirthdayBounds(travelerType);
        return bounds;
    };


    //open date picker for a specific traveler and field (birthdate or passportExpiry)
    const openDatePicker = (index, type) => {
        const existingDate = travelersData[index]?.[type];
        const travelerType = travelerTypes[index];
        const birthdayBounds = getBirthdayLimits(index);

        let initialDate;

        if (existingDate) {
            initialDate = formatDate(existingDate);
        } else if (type === 'birthdate') {
            if (travelerType === 'Adult') {
                initialDate = '2000-01-01';
            } else {
                initialDate = formatDate(birthdayBounds.maxDate);
            }
        } else {
            initialDate = formatDate(minExpiryDate);
        }

        setDatePickerConfig({
            index,
            type,
            currentDate: initialDate
        });

        setShowDatePicker(true);
    };


    //handle date selection from the date picker and update the corresponding traveler's data
    const selectPickerDate = (dateString) => {
        setDatePickerConfig(prev => ({
            ...prev,
            currentDate: dateString
        }));
    };


    const closeDatePicker = () => {
        setShowDatePicker(false);
    };


    const confirmPickerDate = () => {
        if (!datePickerConfig.currentDate) return;

        updateTraveler(
            datePickerConfig.index,
            datePickerConfig.type,
            datePickerConfig.currentDate
        );

        setShowDatePicker(false);
    };

    const isBirthdatePicker =
        datePickerConfig.type === 'birthdate';

    const activeBirthdayBounds = isBirthdatePicker
        ? getBirthdayLimits(datePickerConfig.index)
        : null;

    const activeMinimumDate = isBirthdatePicker
        ? formatDate(activeBirthdayBounds?.minDate)
        : formatDate(minExpiryDate);

    const activeMaximumDate = isBirthdatePicker
        ? formatDate(activeBirthdayBounds?.maxDate)
        : undefined;

    const activeSelectedDate =
        datePickerConfig.currentDate ||
        activeMinimumDate ||
        dayjs().format('YYYY-MM-DD');

    const activeTravelerType =
        travelerTypes[datePickerConfig.index] || 'Traveler';

    const datePickerTitle = isBirthdatePicker
        ? `${activeTravelerType} Birthdate`
        : 'Passport Expiry';

    const datePickerSubtitle = isBirthdatePicker
        ? `Choose a valid birthdate for this ${activeTravelerType.toLowerCase()}.`
        : `The passport must expire on or after ${dayjs(activeMinimumDate).format('MMMM D, YYYY')}.`;

    const isValidPassportNumber = (passportNo) => /^P\d{7}[A-Z]$/.test(String(passportNo || '').trim().toUpperCase());


    //handle viewing PDF documents by opening the URL in the default browser or PDF viewer
    const handleViewPDF = async (pdfUri) => {
        try {
            await Linking.openURL(pdfUri);
        } catch (error) {
            console.error('Error opening PDF:', error);
            Alert.alert('Error', 'Failed to open PDF. Please try again.');
        }
    };


    //handle "Next" button press: validate uploads and traveler data before proceeding to the next screen
    const handleNext = () => {
        const uploadedCount = Object.keys(uploads).length;
        const isComplete = Object.values(uploads).every(u => u.passport && u.photo);

        if (uploadedCount < totalTravelers || !isComplete) {
            Alert.alert("Missing Documents", `Please upload both ${travelDocumentLabel} and 2x2 Photo for all travelers.`);
            return;
        }

        if (!isDomestic) {
            const invalidPassportIndex = travelersData.findIndex(traveler => !isValidPassportNumber(traveler.passportNo));
            if (invalidPassportIndex !== -1) {
                Alert.alert(
                    "Invalid Passport Number",
                    "Passport number must start with P, followed by 7 digits, and end with a letter (e.g. P1234567A)"
                );
                return;
            }
        }

        if (requiresVisa) {
            const missingVisaIndex = Object.entries(uploads).findIndex(([, upload]) => {
                if (!upload) return false;
                if (upload.visaStatus !== 'yes') return false;
                return !upload.visa;
            });

            if (missingVisaIndex !== -1) {
                Alert.alert('Missing Visa', 'Please upload the visa document for travelers who have a visa.');
                return;
            }
        }

        setShowVerifyModal(true);
    };


    //handle confirmation from the verification modal and navigate to the next screen with the collected data
    const handleConfirmContinue = () => {
        setShowVerifyModal(false);
        navigation.navigate("registrationstep1", { setupData, travelerUploads: uploads, travelersData });
    };





    return (
        <SafeAreaView style={BookingUploadsStyle.safeArea}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={BookingUploadsStyle.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                <Text style={QuotationAllInStyle.mainTitle}>Upload {travelDocumentLabel}</Text>
                <Text style={[QuotationAllInStyle.subtitle, { marginBottom: 20 }]}>
                    Please upload a clear image of your {travelDocumentLabel.toLowerCase()} for each traveler.
                </Text>

                {travelersData.map((t, index) => (
                    <View key={index} style={BookingUploadsStyle.uploadCard}>
                        <Text style={BookingUploadsStyle.travelerHeader}>Traveler {index + 1} - {travelerTypes[index]}</Text>
                        <Text style={BookingUploadsStyle.cardSubtitle}>Upload {travelDocumentLabel.toLowerCase()} and 2x2 ID photo</Text>

                        <View style={BookingUploadsStyle.formSection}>
                            {/* Row 1: Title, First Name, Last Name */}
                            <View style={BookingUploadsStyle.formRow}>
                                <View style={BookingUploadsStyle.formColSmall}>
                                    <Text style={BookingUploadsStyle.inputLabel}>Title</Text>
                                    <TouchableOpacity
                                        style={[BookingUploadsStyle.input, BookingUploadsStyle.selectInput]}
                                        onPress={() => setActiveDropdown({ index, type: 'title' })}
                                    >
                                        <Text style={[BookingUploadsStyle.inputText, !t.title && BookingUploadsStyle.placeholderText]}>
                                            {t.title || 'MR'}
                                        </Text>
                                        <Ionicons name="chevron-down" size={14} color="#9ca3af" />
                                    </TouchableOpacity>
                                </View>

                                <View style={BookingUploadsStyle.formCol}>
                                    <Text style={BookingUploadsStyle.inputLabel}>First Name</Text>
                                    <TextInput style={BookingUploadsStyle.input} placeholder="First name" maxLength={30} value={t.firstName} onChangeText={(v) => /^[A-Za-z\s-]*$/.test(v) && updateTraveler(index, 'firstName', v)} />
                                </View>

                                <View style={BookingUploadsStyle.formCol}>
                                    <Text style={BookingUploadsStyle.inputLabel}>Last Name</Text>
                                    <TextInput style={BookingUploadsStyle.input} placeholder="Last name" maxLength={30} value={t.lastName} onChangeText={(v) => /^[A-Za-z\s-]*$/.test(v) && updateTraveler(index, 'lastName', v)} />
                                </View>
                            </View>

                            {/* Row 2: Room Type & Birthdate */}
                            <View style={BookingUploadsStyle.formRow}>
                                <View style={BookingUploadsStyle.formCol}>
                                    <Text style={BookingUploadsStyle.inputLabel}>Room Type</Text>
                                    <TouchableOpacity
                                        style={[
                                            BookingUploadsStyle.input,
                                            BookingUploadsStyle.selectInput,
                                            isMinorTravelerType(travelerTypes[index]) && { opacity: 0.6 },
                                            (bookingType === 'Solo Booking' || isMinorTravelerType(travelerTypes[index])) && BookingUploadsStyle.disabledInput
                                        ]}
                                        onPress={() => {
                                            if (bookingType !== 'Solo Booking' && !isMinorTravelerType(travelerTypes[index])) {
                                                setActiveDropdown({ index, type: 'roomType' });
                                            }
                                        }}
                                        disabled={bookingType === 'Solo Booking' || isMinorTravelerType(travelerTypes[index])}
                                    >
                                        <Text style={[BookingUploadsStyle.inputText, !t.roomType && BookingUploadsStyle.placeholderText]}>
                                            {t.roomType || 'Room type'}
                                        </Text>
                                        {bookingType !== 'Solo Booking' && !isMinorTravelerType(travelerTypes[index]) && <Ionicons name="chevron-down" size={14} color="#9ca3af" />}
                                    </TouchableOpacity>
                                </View>

                                <View style={BookingUploadsStyle.formCol}>
                                    <Text style={BookingUploadsStyle.inputLabel}>Birthdate</Text>
                                    <TouchableOpacity style={[BookingUploadsStyle.input, BookingUploadsStyle.selectInput]} onPress={() => openDatePicker(index, 'birthdate')}>
                                        <Text style={[BookingUploadsStyle.inputText, !t.birthdate && BookingUploadsStyle.placeholderText]}>
                                            {t.birthdate || 'Birthdate'}
                                        </Text>
                                        <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Row 3: Passport Fields (Non-Domestic Only) */}
                            {!isDomestic && (
                                <View style={BookingUploadsStyle.formRow}>
                                    <View style={BookingUploadsStyle.formCol}>
                                        <Text style={BookingUploadsStyle.inputLabel}>Passport Number</Text>
                                        <TextInput
                                            style={BookingUploadsStyle.input}
                                            placeholder="P1234567A"
                                            placeholderTextColor="#9ca3af"
                                            maxLength={9}
                                            value={t.passportNo}
                                            onChangeText={(text) => {
                                                const cleaned = (text || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
                                                const body = cleaned.startsWith('P') ? cleaned.slice(1) : cleaned.replace(/^P+/, '');
                                                let numbers = body.replace(/[^0-9]/g, '').slice(0, 7);
                                                let letters = body.replace(/[^A-Z]/g, '').slice(0, 1);
                                                const finalPassport = `P${numbers}${letters}`;
                                                updateTraveler(index, 'passportNo', finalPassport);
                                            }}
                                        />
                                    </View>

                                    <View style={BookingUploadsStyle.formCol}>
                                        <Text style={BookingUploadsStyle.inputLabel}>Passport Expiry</Text>
                                        <TouchableOpacity style={[BookingUploadsStyle.input, BookingUploadsStyle.selectInput]} onPress={() => openDatePicker(index, 'passportExpiry')}>
                                            <Text style={[BookingUploadsStyle.inputText, !t.passportExpiry && BookingUploadsStyle.placeholderText]}>
                                                {t.passportExpiry || 'Passport expiry'}
                                            </Text>
                                            <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>

                        <View style={BookingUploadsStyle.uploadRow}>
                            <View style={BookingUploadsStyle.uploadSlot}>
                                <Text style={BookingUploadsStyle.slotLabel}>{travelDocumentLabel.toUpperCase()} PREVIEW</Text>
                                <TouchableOpacity
                                    style={[BookingUploadsStyle.dragger, uploads[index]?.passport && BookingUploadsStyle.draggerActive]}
                                    onPress={() => pickImage(index, 'passport')}
                                >
                                    {uploads[index]?.passport ? (
                                        uploads[index]?.passportType === 'pdf' ? (
                                            <View style={BookingUploadsStyle.pdfPreviewContainer}>
                                                <Ionicons name="document-text" size={28} color="#dc2626" />
                                                <Text style={BookingUploadsStyle.pdfFileName}>{uploads[index]?.passportName?.substring(0, 15) || 'document.pdf'}</Text>
                                            </View>
                                        ) : (
                                            <Image source={{ uri: uploads[index].passport }} style={BookingUploadsStyle.previewImage} />
                                        )
                                    ) : (
                                        <Ionicons name={isDomestic ? "id-card-outline" : "book-outline"} size={24} color="#305797" />
                                    )}
                                </TouchableOpacity>
                                {uploads[index]?.passport ? (
                                    <View style={BookingUploadsStyle.fileActionButtons}>
                                        {uploads[index]?.passportType === 'pdf' && (
                                            <TouchableOpacity onPress={() => handleViewPDF(uploads[index].passport)}>
                                                <Text style={BookingUploadsStyle.viewPdfText}>View PDF</Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity onPress={() => setUploads(prev => ({ ...prev, [index]: { ...prev[index], passport: null, passportType: null, passportName: null } }))}>
                                            <Text style={BookingUploadsStyle.removeImageText}>Remove</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : null}
                            </View>

                            <View style={BookingUploadsStyle.uploadSlot}>
                                <Text style={BookingUploadsStyle.slotLabel}>2x2 PHOTO</Text>
                                <TouchableOpacity
                                    style={[BookingUploadsStyle.dragger, uploads[index]?.photo && BookingUploadsStyle.draggerActive]}
                                    onPress={() => pickImage(index, 'photo')}
                                >
                                    {uploads[index]?.photo ? (
                                        uploads[index]?.photoType === 'pdf' ? (
                                            <View style={BookingUploadsStyle.pdfPreviewContainer}>
                                                <Ionicons name="document-text" size={28} color="#dc2626" />
                                                <Text style={BookingUploadsStyle.pdfFileName}>{uploads[index]?.photoName?.substring(0, 15) || 'document.pdf'}</Text>
                                            </View>
                                        ) : (
                                            <Image source={{ uri: uploads[index].photo }} style={BookingUploadsStyle.previewImage} />
                                        )
                                    ) : (
                                        <Ionicons name="person-outline" size={24} color="#305797" />
                                    )}
                                </TouchableOpacity>
                                {uploads[index]?.photo ? (
                                    <View style={BookingUploadsStyle.fileActionButtons}>
                                        {uploads[index]?.photoType === 'pdf' && (
                                            <TouchableOpacity onPress={() => handleViewPDF(uploads[index].photo)}>
                                                <Text style={BookingUploadsStyle.viewPdfText}>View PDF</Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity onPress={() => setUploads(prev => ({ ...prev, [index]: { ...prev[index], photo: null, photoType: null, photoName: null } }))}>
                                            <Text style={BookingUploadsStyle.removeImageText}>Remove</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : null}
                            </View>
                        </View>

                        {requiresVisa && (
                            <View style={{ marginTop: 16, borderWidth: 1, borderColor: '#dbe4f3', borderRadius: 14, backgroundColor: '#f8fbff', padding: 14 }}>
                                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 15, color: '#1f2f52', textAlign: 'center', marginBottom: 10 }}>
                                    Do you have a visa for this tour package?
                                </Text>

                                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
                                    <TouchableOpacity
                                        onPress={() => setUploads(prev => ({
                                            ...prev,
                                            [index]: {
                                                ...prev[index],
                                                visaStatus: 'yes'
                                            }
                                        }))}
                                        style={{
                                            minWidth: 110,
                                            paddingVertical: 12,
                                            paddingHorizontal: 18,
                                            borderRadius: 8,
                                            backgroundColor: uploads[index]?.visaStatus === 'yes' ? '#305797' : '#fff',
                                            borderWidth: 1,
                                            borderColor: '#d1d5db',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text style={{ fontFamily: 'Montserrat_700Bold', color: uploads[index]?.visaStatus === 'yes' ? '#fff' : '#222' }}>Yes</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setUploads(prev => ({
                                            ...prev,
                                            [index]: {
                                                ...prev[index],
                                                visaStatus: 'no',
                                                visa: null,
                                                visaType: null,
                                                visaName: null,
                                            }
                                        }))}
                                        style={{
                                            minWidth: 110,
                                            paddingVertical: 12,
                                            paddingHorizontal: 18,
                                            borderRadius: 8,
                                            backgroundColor: uploads[index]?.visaStatus === 'no' ? '#305797' : '#fff',
                                            borderWidth: 1,
                                            borderColor: '#d1d5db',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text style={{ fontFamily: 'Montserrat_700Bold', color: uploads[index]?.visaStatus === 'no' ? '#fff' : '#222' }}>No</Text>
                                    </TouchableOpacity>
                                </View>

                                {uploads[index]?.visaStatus === 'no' && (
                                    <Text style={{ marginTop: 12, color: '#d9534f', fontSize: 13, textAlign: 'center', fontFamily: 'Roboto_400Regular' }}>
                                        This travel package requires a visa, we highly recommend for you to get one first before booking to avoid travel issues.
                                    </Text>
                                )}

                                {uploads[index]?.visaStatus === 'yes' && (
                                    <View style={{ marginTop: 14 }}>
                                        <TouchableOpacity
                                            onPress={() => pickImage(index, 'visa')}
                                            style={{
                                                alignSelf: 'center',
                                                backgroundColor: '#a53050',
                                                paddingVertical: 11,
                                                paddingHorizontal: 18,
                                                borderRadius: 10,
                                                shadowColor: '#000',
                                                shadowOpacity: 0.12,
                                                shadowRadius: 3,
                                                elevation: 2,
                                            }}
                                        >
                                            <Text style={{ color: '#fff', fontFamily: 'Montserrat_700Bold' }}>Upload Visa</Text>
                                        </TouchableOpacity>

                                        {uploads[index]?.visa ? (
                                            <View style={[BookingUploadsStyle.fileActionButtons, { alignItems: 'center', marginTop: 12 }]}>
                                                <View style={[BookingUploadsStyle.dragger, { width: '100%', minHeight: 140, borderStyle: 'dashed' }]}>
                                                    {uploads[index]?.visaType === 'pdf' ? (
                                                        <View style={BookingUploadsStyle.pdfPreviewContainer}>
                                                            <Ionicons name="document-text" size={28} color="#dc2626" />
                                                            <Text style={BookingUploadsStyle.pdfFileName}>{uploads[index]?.visaName?.substring(0, 15) || 'visa.pdf'}</Text>
                                                        </View>
                                                    ) : (
                                                        <Image source={{ uri: uploads[index].visa }} style={BookingUploadsStyle.previewImage} />
                                                    )}
                                                </View>

                                                {uploads[index]?.visaType === 'pdf' && (
                                                    <TouchableOpacity onPress={() => handleViewPDF(uploads[index].visa)}>
                                                        <Text style={BookingUploadsStyle.viewPdfText}>View PDF</Text>
                                                    </TouchableOpacity>
                                                )}

                                                <TouchableOpacity onPress={() => setUploads(prev => ({ ...prev, [index]: { ...prev[index], visa: null, visaType: null, visaName: null } }))}>
                                                    <Text style={BookingUploadsStyle.removeImageText}>Remove</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : null}
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                ))}

                <View style={BookingUploadsStyle.notesBox}>
                    <Text style={BookingUploadsStyle.notesTitle}>Note for Room Type:</Text>
                    <View style={BookingUploadsStyle.bulletRow}><Text style={BookingUploadsStyle.bullet}>•</Text><Text style={BookingUploadsStyle.notesText}>TWIN and DOUBLE rooms require two travelers to be listed</Text></View>
                    <View style={BookingUploadsStyle.bulletRow}><Text style={BookingUploadsStyle.bullet}>•</Text><Text style={BookingUploadsStyle.notesText}>TRIPLE rooms require three travelers to be listed</Text></View>
                    <View style={BookingUploadsStyle.bulletRow}><Text style={BookingUploadsStyle.bullet}>•</Text><Text style={BookingUploadsStyle.notesText}>If the rooms are not properly set, the employee will be the one assigning the rooms</Text></View>
                    <View style={BookingUploadsStyle.bulletRow}><Text style={BookingUploadsStyle.bullet}>•</Text><Text style={BookingUploadsStyle.notesText}>In the Passenger List below, travelers who are assign in "TWIN 1", "TWIN 2" and so on are considered "Roommates"</Text></View>
                    <View style={BookingUploadsStyle.bulletRow}><Text style={BookingUploadsStyle.bullet}>•</Text><Text style={BookingUploadsStyle.notesText}>Child and Infant do not have an assigned room type or bed. If you want your child to have a bed, please add number for "Adult" rather than "Child"</Text></View>

                    <Text style={[BookingUploadsStyle.notesTitle, { marginTop: 12 }]}>Note:</Text>
                    <View style={BookingUploadsStyle.bulletRow}>
                        <Text style={BookingUploadsStyle.bullet}>•</Text>
                        <Text style={BookingUploadsStyle.notesText}>
                            {isDomestic ? 'Upload a clear image or PDF of the valid ID' : 'Upload a clear image or PDF of the passport bio page'}
                        </Text>
                    </View>
                    <View style={BookingUploadsStyle.bulletRow}><Text style={BookingUploadsStyle.bullet}>•</Text><Text style={BookingUploadsStyle.notesText}>Accepted formats: JPG, PNG, PDF</Text></View>
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
                        ) : activeDropdown?.type === 'roomType' ? (
                            // Only show room options for adults
                            roomOptions.map(opt => (
                                <TouchableOpacity key={opt} style={BookingUploadsStyle.dropdownItem} onPress={() => {
                                    updateTraveler(activeDropdown.index, 'roomType', opt);
                                    setActiveDropdown(null);
                                }}>
                                    <Text style={BookingUploadsStyle.dropdownItemText}>{opt}</Text>
                                </TouchableOpacity>
                            ))
                        ) : null}
                    </View>
                </TouchableOpacity>
            </Modal>

            {showDatePicker && (
                <Modal
                    visible
                    transparent
                    animationType="fade"
                    statusBarTranslucent
                    onRequestClose={closeDatePicker}
                >
                    <Pressable
                        style={BookingUploadsStyle.dateModalOverlay}
                        onPress={closeDatePicker}
                    >
                        <Pressable
                            style={BookingUploadsStyle.dateModalCard}
                            onPress={(event) => event.stopPropagation()}
                        >
                            <View style={BookingUploadsStyle.dateModalHeader}>
                                <View style={BookingUploadsStyle.dateModalHeaderContent}>
                                    <View style={BookingUploadsStyle.dateModalHeaderIcon}>
                                        <Ionicons
                                            name={
                                                isBirthdatePicker
                                                    ? 'calendar'
                                                    : 'document-text'
                                            }
                                            size={21}
                                            color="#305797"
                                        />
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text style={BookingUploadsStyle.dateModalTitle}>
                                            {datePickerTitle}
                                        </Text>

                                        <Text style={BookingUploadsStyle.dateModalSubtitle}>
                                            {datePickerSubtitle}
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={BookingUploadsStyle.dateModalCloseButton}
                                    onPress={closeDatePicker}
                                >
                                    <Ionicons
                                        name="close"
                                        size={21}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
                            </View>

                            <Calendar
                                initialDate={activeSelectedDate}
                                minDate={activeMinimumDate}
                                maxDate={activeMaximumDate}
                                onDayPress={({ dateString }) => {
                                    selectPickerDate(dateString);
                                }}
                                markedDates={{
                                    [activeSelectedDate]: {
                                        selected: true,
                                        selectedColor: '#305797',
                                        selectedTextColor: '#ffffff'
                                    }
                                }}
                                enableSwipeMonths
                                hideExtraDays
                                disableAllTouchEventsForDisabledDays
                                renderArrow={(direction) => (
                                    <View style={BookingUploadsStyle.dateCalendarArrow}>
                                        <Ionicons
                                            name={
                                                direction === 'left'
                                                    ? 'chevron-back'
                                                    : 'chevron-forward'
                                            }
                                            size={18}
                                            color="#305797"
                                        />
                                    </View>
                                )}
                                style={BookingUploadsStyle.dateCalendar}
                                theme={{
                                    backgroundColor: '#ffffff',
                                    calendarBackground: '#ffffff',

                                    textSectionTitleColor: '#94a3b8',
                                    textDisabledColor: '#d1d5db',
                                    dayTextColor: '#334155',
                                    monthTextColor: '#1e293b',

                                    selectedDayBackgroundColor: '#305797',
                                    selectedDayTextColor: '#ffffff',
                                    todayTextColor: '#305797',
                                    arrowColor: '#305797',

                                    textDayFontFamily: 'Roboto_400Regular',
                                    textMonthFontFamily: 'Montserrat_700Bold',
                                    textDayHeaderFontFamily: 'Roboto_500Medium',

                                    textDayFontSize: 14,
                                    textMonthFontSize: 16,
                                    textDayHeaderFontSize: 12
                                }}
                            />

                            <View style={BookingUploadsStyle.dateSelectedContainer}>
                                <View style={BookingUploadsStyle.dateSelectedIcon}>
                                    <Ionicons
                                        name="checkmark"
                                        size={17}
                                        color="#305797"
                                    />
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={BookingUploadsStyle.dateSelectedLabel}>
                                        {isBirthdatePicker
                                            ? 'Selected birthdate'
                                            : 'Selected expiry date'}
                                    </Text>

                                    <Text style={BookingUploadsStyle.dateSelectedValue}>
                                        {dayjs(activeSelectedDate).format(
                                            'MMMM D, YYYY'
                                        )}
                                    </Text>

                                    {isBirthdatePicker && (
                                        <Text style={BookingUploadsStyle.dateSelectedExtra}>
                                            Age: {computeAge(activeSelectedDate)} years old
                                        </Text>
                                    )}
                                </View>
                            </View>

                            <Text style={BookingUploadsStyle.dateLimitNote}>
                                {isBirthdatePicker
                                    ? `Valid range: ${dayjs(activeMinimumDate).format('MMMM D, YYYY')} to ${dayjs(activeMaximumDate).format('MMMM D, YYYY')}`
                                    : `Minimum expiry date: ${dayjs(activeMinimumDate).format('MMMM D, YYYY')}`}
                            </Text>

                            <View style={BookingUploadsStyle.dateModalActions}>
                                <TouchableOpacity
                                    style={BookingUploadsStyle.dateModalCancelButton}
                                    onPress={closeDatePicker}
                                    activeOpacity={0.75}
                                >
                                    <Text style={BookingUploadsStyle.dateModalCancelText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={BookingUploadsStyle.dateModalConfirmButton}
                                    onPress={confirmPickerDate}
                                    activeOpacity={0.75}
                                >
                                    <Ionicons
                                        name="checkmark"
                                        size={18}
                                        color="#ffffff"
                                    />

                                    <Text style={BookingUploadsStyle.dateModalConfirmText}>
                                        Confirm Date
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>
            )}

            <Modal visible={showVerifyModal} transparent animationType="fade" onRequestClose={() => setShowVerifyModal(false)}>
                <TouchableOpacity style={QuotationFormStepStyle.modalOverlay} activeOpacity={1} onPress={() => setShowVerifyModal(false)}>
                    <View style={QuotationFormStepStyle.verifyModalCard}>
                        <TouchableOpacity style={QuotationFormStepStyle.closeButton} onPress={() => setShowVerifyModal(false)}>
                            <Text style={QuotationFormStepStyle.closeButtonText}>×</Text>
                        </TouchableOpacity>

                        <Text style={QuotationFormStepStyle.verifyModalTitle}>Please Verify Details</Text>
                        <Text style={QuotationFormStepStyle.verifyModalText}>
                            Kindly make sure to verify and check the information of your details - ensure passport and photo are clear and correct.
                        </Text>

                        <View style={QuotationFormStepStyle.verifyModalButtonsRow}>
                            <TouchableOpacity style={QuotationFormStepStyle.verifyPrimaryButton} onPress={handleConfirmContinue}>
                                <Text style={QuotationFormStepStyle.verifyPrimaryButtonText}>Confirm & Continue</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={QuotationFormStepStyle.verifySecondaryButton} onPress={() => setShowVerifyModal(false)}>
                                <Text style={QuotationFormStepStyle.verifySecondaryButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}