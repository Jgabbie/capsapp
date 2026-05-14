import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Alert, TextInput, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Linking from 'expo-linking';
import DateTimePicker from '@react-native-community/datetimepicker';

import BookingUploadsStyle from '../../styles/clientstyles/BookingUploadsStyle';
import QuotationUploadsStyle from '../../styles/clientstyles/QuotationUploadsStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import QuotationFormStepStyle from '../../styles/clientstyles/QuotationFormStepStyle';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Image } from 'expo-image';
import { useUser } from '../../context/UserContext';
import { api, withUserHeader } from '../../utils/api';

const formatDate = (date) => {
    if (!date) return "";
    return date.toISOString().split('T')[0];
};

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

const getBirthdayBounds = (travelerType) => {
    const today = new Date();
    const category = String(travelerType || '').toLowerCase();

    if (category === 'infant') {
        const maxDate = new Date(today);
        const minDate = new Date(today);
        minDate.setFullYear(minDate.getFullYear() - 2);

        return {
            minDate: minDate,
            maxDate: maxDate,
            minAge: 0,
            maxAge: 2
        };
    }

    if (category === 'child') {
        const maxDate = new Date(today);
        maxDate.setFullYear(maxDate.getFullYear() - 3);
        const minDate = new Date(today);
        minDate.setFullYear(minDate.getFullYear() - 11);

        return {
            minDate: minDate,
            maxDate: maxDate,
            minAge: 3,
            maxAge: 11
        };
    }

    const adultMinDate = new Date(1935, 0, 1);
    const adultMaxDate = new Date(today);
    adultMaxDate.setFullYear(adultMaxDate.getFullYear() - 12);

    return {
        minDate: adultMinDate,
        maxDate: adultMaxDate,
        minAge: 12,
        maxAge: null
    };
};

const isMinorTravelerType = (travelerType) => {
    const normalized = String(travelerType || '').toLowerCase();
    return normalized === 'child' || normalized === 'infant';
};

export default function QuotationUploads({ route, navigation }) {
    const { user } = useUser();
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const { quotation } = route.params || {};

    const counts = quotation?.travelerCounts || { adult: 1, child: 0, infant: 0 };
    const totalTravelers = counts.adult + counts.child + counts.infant;
    const bookingType = quotation?.bookingType || 'Solo Booking';

    const packageType = quotation?.packageId.packageType || quotation?.pkg?.packageType || '';
    const isDomestic = String(packageType).toLowerCase().includes('domestic');
    const travelDocumentLabel = isDomestic ? 'Valid ID' : 'Passport';

    const travelerTypes = useMemo(() => {
        const types = [];
        for (let i = 0; i < counts.adult; i++) types.push('Adult');
        for (let i = 0; i < counts.child; i++) types.push('Child');
        for (let i = 0; i < counts.infant; i++) types.push('Infant');
        return types;
    }, [counts]);

    const getRoomOptions = () => {
        if (bookingType === 'Solo Booking') return ['SINGLE'];
        return ['TWIN', 'DOUBLE', 'TRIPLE'];
    };
    const roomOptions = getRoomOptions();

    const [travelersData, setTravelersData] = useState(() => {
        return Array.from({ length: totalTravelers }).map((_, index) => {
            const travelerType = index < counts.adult ? 'Adult' : index < counts.adult + counts.child ? 'Child' : 'Infant';

            let initialRoomType = '';

            if (bookingType === 'Solo Booking') {
                initialRoomType = 'SINGLE';
            } else if (bookingType === 'Group Booking') {
                if (isMinorTravelerType(travelerType)) {
                    initialRoomType = 'N/A';
                } else {
                    initialRoomType = 'TWIN';
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
    const [datePickerConfig, setDatePickerConfig] = useState({ index: 0, type: 'birthdate', currentDate: new Date() });
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    useEffect(() => {
        // Only apply adjustments if necessary to avoid unnecessary re-renders or loops
        setTravelersData(prevData => {
            if (!Array.isArray(prevData)) return prevData;

            // If lengths differ, we should rebuild/adjust
            const lengthsDiffer = prevData.length !== travelerTypes.length;

            let changed = lengthsDiffer;
            const newData = prevData.map((traveler, index) => {
                const travelerType = travelerTypes[index];
                let updated = traveler;

                if (isMinorTravelerType(travelerType)) {
                    if (traveler.roomType !== 'N/A') {
                        updated = { ...traveler, roomType: 'N/A' };
                    }
                } else if (bookingType === 'Group Booking') {
                    if (!traveler.roomType) {
                        updated = { ...traveler, roomType: 'TWIN' };
                    }
                }

                if (updated !== traveler) changed = true;
                return updated;
            });

            return changed ? newData : prevData;
        });
    }, [travelerTypes, bookingType]);

    const updateTraveler = (index, field, value) => {
        const newData = [...travelersData];
        newData[index][field] = value;
        setTravelersData(newData);
    };

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

    const pickImage = async (index, type) => {
        try {
            // For 2x2 photo, allow image or PDF (image will be square-cropped)
            if (type === 'photo') {
                Alert.alert(
                    'Select File Type',
                    'Choose how you want to upload the 2x2 photo',
                    [
                        {
                            text: 'Upload Image (JPG/PNG)',
                            onPress: async () => {
                                try {
                                    const options = {
                                        mediaTypes: MediaTypeOptions.Images,
                                        quality: 0.8,
                                        allowsEditing: true,
                                        aspect: [1, 1],
                                    };

                                    const result = await launchImageLibraryAsync(options);
                                    if (!result.canceled) {
                                        const asset = result.assets[0];
                                        const fileName = asset.fileName || asset.name || `traveler-${index + 1}-photo.jpg`;
                                        const mimeType = asset.mimeType || 'image/jpeg';
                                        const uploadedUrl = await uploadDocumentToCloudinary(asset.uri, fileName, mimeType, user?._id);

                                        if (!uploadedUrl) {
                                            throw new Error('Upload failed');
                                        }

                                        setUploads(prev => ({
                                            ...prev,
                                            [index]: {
                                                ...prev[index],
                                                [type]: uploadedUrl,
                                                [`${type}Type`]: 'image'
                                            }
                                        }));
                                    }
                                } catch (imageError) {
                                    console.error('Image picker error:', imageError);
                                    Alert.alert('Error', 'Failed to pick image. Please try again.');
                                }
                            }
                        },
                        {
                            text: 'Upload PDF',
                            onPress: async () => {
                                try {
                                    const pdfResult = await DocumentPicker.getDocumentAsync({
                                        type: 'application/pdf',
                                        copyToCacheDirectory: true,
                                    });

                                    console.log('PDF Result:', pdfResult);

                                    if (pdfResult && pdfResult.assets && pdfResult.assets.length > 0) {
                                        const pdfFile = pdfResult.assets[0];
                                        const uploadedUrl = await uploadDocumentToCloudinary(
                                            pdfFile.uri,
                                            pdfFile.name || `traveler-${index + 1}-photo.pdf`,
                                            pdfFile.mimeType || 'application/pdf',
                                            user?._id
                                        );

                                        if (!uploadedUrl) {
                                            throw new Error('Upload failed');
                                        }

                                        setUploads(prev => ({
                                            ...prev,
                                            [index]: {
                                                ...prev[index],
                                                [type]: uploadedUrl,
                                                [`${type}Type`]: 'pdf',
                                                [`${type}Name`]: pdfFile.name
                                            }
                                        }));
                                    } else if (pdfResult && pdfResult.canceled) {
                                        console.log('PDF selection cancelled');
                                    }
                                } catch (pdfError) {
                                    console.error('PDF picker error:', pdfError);
                                    Alert.alert('Error', 'Failed to pick PDF. Please try again.');
                                }
                            }
                        },
                        {
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel'
                        }
                    ]
                );
            } else {
                // For passport/ID, allow both images and PDFs
                Alert.alert(
                    'Select File Type',
                    'Choose how you want to upload your document',
                    [
                        {
                            text: 'Upload Image (JPG/PNG)',
                            onPress: async () => {
                                try {
                                    const result = await launchImageLibraryAsync({
                                        mediaTypes: MediaTypeOptions.Images,
                                        quality: 0.7,
                                        allowsEditing: true,
                                    });

                                    if (!result.canceled) {
                                        const asset = result.assets[0];
                                        const fileName = asset.fileName || asset.name || `traveler-${index + 1}-document.jpg`;
                                        const mimeType = asset.mimeType || 'image/jpeg';
                                        const uploadedUrl = await uploadDocumentToCloudinary(asset.uri, fileName, mimeType, user?._id);

                                        if (!uploadedUrl) {
                                            throw new Error('Upload failed');
                                        }

                                        setUploads(prev => ({
                                            ...prev,
                                            [index]: {
                                                ...prev[index],
                                                [type]: uploadedUrl,
                                                [`${type}Type`]: 'image'
                                            }
                                        }));
                                    }
                                } catch (imageError) {
                                    console.error('Image picker error:', imageError);
                                    Alert.alert('Error', 'Failed to pick image. Please try again.');
                                }
                            }
                        },
                        {
                            text: 'Upload PDF',
                            onPress: async () => {
                                try {
                                    const pdfResult = await DocumentPicker.getDocumentAsync({
                                        type: 'application/pdf',
                                        copyToCacheDirectory: true,
                                    });

                                    console.log('PDF Result:', pdfResult);

                                    if (pdfResult && pdfResult.assets && pdfResult.assets.length > 0) {
                                        const pdfFile = pdfResult.assets[0];
                                        const uploadedUrl = await uploadDocumentToCloudinary(
                                            pdfFile.uri,
                                            pdfFile.name || `traveler-${index + 1}-document.pdf`,
                                            pdfFile.mimeType || 'application/pdf',
                                            user?._id
                                        );

                                        if (!uploadedUrl) {
                                            throw new Error('Upload failed');
                                        }

                                        setUploads(prev => ({
                                            ...prev,
                                            [index]: {
                                                ...prev[index],
                                                [type]: uploadedUrl,
                                                [`${type}Type`]: 'pdf',
                                                [`${type}Name`]: pdfFile.name
                                            }
                                        }));
                                    } else if (pdfResult && pdfResult.canceled) {
                                        // User cancelled, do nothing
                                        console.log('PDF selection cancelled');
                                    }
                                } catch (pdfError) {
                                    console.error('PDF picker error:', pdfError);
                                    Alert.alert('Error', 'Failed to pick PDF. Please try again.');
                                }
                            }
                        },
                        {
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel'
                        }
                    ]
                );
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

    const getBirthdayLimits = (travelerIndex) => {
        const travelerType = travelerTypes[travelerIndex];
        const bounds = getBirthdayBounds(travelerType);
        return bounds;
    };

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

    const isValidPassportNumber = (passportNo) => /^P\d{7}[A-Z]$/.test(String(passportNo || '').trim().toUpperCase());

    const handleViewPDF = async (pdfUri) => {
        try {
            await Linking.openURL(pdfUri);
        } catch (error) {
            console.error('Error opening PDF:', error);
            Alert.alert('Error', 'Failed to open PDF. Please try again.');
        }
    };

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

        setShowVerifyModal(true);
    };

    const handleConfirmContinue = () => {
        setShowVerifyModal(false);
        navigation.navigate("quotationform1", { quotation, travelerUploads: uploads, travelersData });
    };

    return (
        <SafeAreaView style={BookingUploadsStyle.safeArea}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={BookingUploadsStyle.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={QuotationAllInStyle.mainTitle}>Upload {travelDocumentLabel}</Text>
                <Text style={[QuotationAllInStyle.subtitle, { marginBottom: 20 }]}>Please upload a clear image of your {travelDocumentLabel.toLowerCase()} for each traveler.</Text>

                {travelersData.map((t, index) => (
                    <View key={index} style={BookingUploadsStyle.uploadCard}>
                        <Text style={BookingUploadsStyle.travelerHeader}>Traveler {index + 1} - {travelerTypes[index]}</Text>
                        <Text style={BookingUploadsStyle.cardSubtitle}>Upload {travelDocumentLabel.toLowerCase()} and 2x2 ID photo</Text>

                        <View style={BookingUploadsStyle.formSection}>
                            {/* Row 1: Title, First Name, Last Name */}
                            <View style={BookingUploadsStyle.formRow}>
                                <View style={BookingUploadsStyle.formColSmall}>
                                    <Text style={QuotationUploadsStyle.inputLabel}>Title</Text>
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
                                    <Text style={QuotationUploadsStyle.inputLabel}>First Name</Text>
                                    <TextInput style={BookingUploadsStyle.input} placeholder="First name" maxLength={30} value={t.firstName} onChangeText={(v) => /^[A-Za-z\s-]*$/.test(v) && updateTraveler(index, 'firstName', v)} />
                                </View>

                                <View style={BookingUploadsStyle.formCol}>
                                    <Text style={QuotationUploadsStyle.inputLabel}>Last Name</Text>
                                    <TextInput style={BookingUploadsStyle.input} placeholder="Last name" maxLength={30} value={t.lastName} onChangeText={(v) => /^[A-Za-z\s-]*$/.test(v) && updateTraveler(index, 'lastName', v)} />
                                </View>
                            </View>

                            {/* Row 2: Room Type & Birthdate */}
                            <View style={BookingUploadsStyle.formRow}>
                                <View style={BookingUploadsStyle.formCol}>
                                    <Text style={QuotationUploadsStyle.inputLabel}>Room Type</Text>
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
                                    <Text style={QuotationUploadsStyle.inputLabel}>Birthdate</Text>
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
                                        <Text style={QuotationUploadsStyle.inputLabel}>Passport Number</Text>
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
                                        <Text style={QuotationUploadsStyle.inputLabel}>Passport Expiry</Text>
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
                                            <Text style={QuotationUploadsStyle.removeImageText}>Remove</Text>
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
                                            <Text style={QuotationUploadsStyle.removeImageText}>{uploads[index]?.photoType === 'pdf' ? 'Remove' : 'Remove Image'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : null}
                            </View>
                        </View>
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
                                maximumDate={datePickerConfig.type === 'birthdate' ? getBirthdayLimits(datePickerConfig.index).maxDate : undefined}
                                minimumDate={datePickerConfig.type === 'birthdate' ? getBirthdayLimits(datePickerConfig.index).minDate : (datePickerConfig.type === 'passportExpiry' ? minExpiryDate : undefined)}
                                onChange={onDateSelected}
                            />
                        </View>
                    </Modal>
                ) : (
                    <DateTimePicker
                        value={datePickerConfig.currentDate}
                        mode="date"
                        display="default"
                        maximumDate={datePickerConfig.type === 'birthdate' ? getBirthdayLimits(datePickerConfig.index).maxDate : undefined}
                        minimumDate={datePickerConfig.type === 'birthdate' ? getBirthdayLimits(datePickerConfig.index).minDate : (datePickerConfig.type === 'passportExpiry' ? minExpiryDate : undefined)}
                        onChange={onDateSelected}
                    />
                )
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
