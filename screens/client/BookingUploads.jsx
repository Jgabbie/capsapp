import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import BookingUploadsStyle from '../../styles/clientstyles/BookingUploadsStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

export default function BookingUploads({ route, navigation }) {
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const { setupData } = route.params || {};
    
    // Calculate total slots needed
    const counts = setupData?.travelerCounts || { adult: 1, child: 0, infant: 0 };
    const totalTravelers = counts.adult + counts.child + counts.infant;

    // State to hold URIs for each traveler: { index: { passport: uri, photo: uri } }
    const [uploads, setUploads] = useState({});

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

    const handleNext = () => {
        // Validation: Check if all travelers have both uploads
        const uploadedCount = Object.keys(uploads).length;
        const isComplete = Object.values(uploads).every(u => u.passport && u.photo);

        if (uploadedCount < totalTravelers || !isComplete) {
            Alert.alert("Missing Documents", "Please upload both Passport and 2x2 Photo for all travelers.");
            return;
        }

        // Forward setupData + uploads to Registration Step 1
        navigation.navigate("registrationstep1", { setupData, travelerUploads: uploads });
    };

    return (
        <SafeAreaView style={BookingUploadsStyle.safeArea}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={BookingUploadsStyle.container} showsVerticalScrollIndicator={false}>
                <Text style={QuotationAllInStyle.mainTitle}>Document Upload</Text>
                {/* 🔥 UPDATED SUBTITLE 🔥 */}
                <Text style={[QuotationAllInStyle.subtitle, { marginBottom: 20 }]}>
                    Please upload a clear image of your passport bio page for each traveler.
                </Text>

                {/* 🔥 NEW INSTRUCTIONS BOX (Matches Web) 🔥 */}
                <View style={BookingUploadsStyle.notesBox}>
                    <Text style={BookingUploadsStyle.notesTitle}>Note:</Text>
                    <View style={BookingUploadsStyle.bulletRow}>
                        <Text style={BookingUploadsStyle.bullet}>•</Text>
                        <Text style={BookingUploadsStyle.notesText}>Upload a clear image of the passport bio page</Text>
                    </View>
                    <View style={BookingUploadsStyle.bulletRow}>
                        <Text style={BookingUploadsStyle.bullet}>•</Text>
                        <Text style={BookingUploadsStyle.notesText}>Accepted formats: JPG, PNG</Text>
                    </View>
                    <View style={BookingUploadsStyle.bulletRow}>
                        <Text style={BookingUploadsStyle.bullet}>•</Text>
                        <Text style={BookingUploadsStyle.notesText}>Maximum file size: 5MB</Text>
                    </View>
                    <View style={BookingUploadsStyle.bulletRow}>
                        <Text style={BookingUploadsStyle.bullet}>•</Text>
                        <Text style={BookingUploadsStyle.notesText}>Blurry or cropped images may delay booking confirmation</Text>
                    </View>

                    <Text style={[BookingUploadsStyle.notesTitle, { marginTop: 12 }]}>Note for 2x2 ID Photos:</Text>
                    <View style={BookingUploadsStyle.bulletRow}>
                        <Text style={BookingUploadsStyle.bullet}>•</Text>
                        <Text style={BookingUploadsStyle.notesText}>Upload a clear image of the 2x2 ID photo</Text>
                    </View>
                    <View style={BookingUploadsStyle.bulletRow}>
                        <Text style={BookingUploadsStyle.bullet}>•</Text>
                        <Text style={BookingUploadsStyle.notesText}>The photo must have a white plain background</Text>
                    </View>
                    <View style={BookingUploadsStyle.bulletRow}>
                        <Text style={BookingUploadsStyle.bullet}>•</Text>
                        <Text style={BookingUploadsStyle.notesText}>Face should be clearly visible and not covered by any accessories (e.g., glasses, hat)</Text>
                    </View>
                    <View style={BookingUploadsStyle.bulletRow}>
                        <Text style={BookingUploadsStyle.bullet}>•</Text>
                        <Text style={BookingUploadsStyle.notesText}>No Fullnames or any names printed in the photo</Text>
                    </View>
                    <View style={BookingUploadsStyle.bulletRow}>
                        <Text style={BookingUploadsStyle.bullet}>•</Text>
                        <Text style={BookingUploadsStyle.notesText}>Accepted formats: JPG, PNG</Text>
                    </View>
                    <View style={BookingUploadsStyle.bulletRow}>
                        <Text style={BookingUploadsStyle.bullet}>•</Text>
                        <Text style={BookingUploadsStyle.notesText}>Maximum file size: 5MB</Text>
                    </View>
                    <View style={BookingUploadsStyle.bulletRow}>
                        <Text style={BookingUploadsStyle.bullet}>•</Text>
                        <Text style={BookingUploadsStyle.notesText}>Blurry or cropped images may delay booking confirmation</Text>
                    </View>
                </View>

                {/* Dynamic Traveler Cards */}
                {Array.from({ length: totalTravelers }).map((_, index) => (
                    <View key={index} style={BookingUploadsStyle.uploadCard}>
                        <Text style={BookingUploadsStyle.travelerHeader}>Traveler {index + 1}</Text>
                        
                        <View style={BookingUploadsStyle.uploadRow}>
                            {/* Passport Slot */}
                            <View style={BookingUploadsStyle.uploadSlot}>
                                <Text style={BookingUploadsStyle.slotLabel}>PASSPORT BIO</Text>
                                <TouchableOpacity 
                                    style={[BookingUploadsStyle.dragger, uploads[index]?.passport && BookingUploadsStyle.draggerActive]} 
                                    onPress={() => pickImage(index, 'passport')}
                                >
                                    {uploads[index]?.passport ? (
                                        <Image source={{ uri: uploads[index].passport }} style={BookingUploadsStyle.previewImage} />
                                    ) : (
                                        <Ionicons name="book-outline" size={24} color="#305797" />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* 2x2 Photo Slot */}
                            <View style={BookingUploadsStyle.uploadSlot}>
                                <Text style={BookingUploadsStyle.slotLabel}>2x2 ID PHOTO</Text>
                                <TouchableOpacity 
                                    style={[BookingUploadsStyle.dragger, uploads[index]?.photo && BookingUploadsStyle.draggerActive]} 
                                    onPress={() => pickImage(index, 'photo')}
                                >
                                    {uploads[index]?.photo ? (
                                        <Image source={{ uri: uploads[index].photo }} style={BookingUploadsStyle.previewImage} />
                                    ) : (
                                        <Ionicons name="person-outline" size={24} color="#305797" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}

                {/* 🔥 NEW COMPACT FOOTER NAVIGATION 🔥 */}
                <View style={BookingUploadsStyle.footerContainer}>
                    <TouchableOpacity 
                        style={BookingUploadsStyle.smallProceedButton}
                        onPress={handleNext}
                    >
                        <Text style={BookingUploadsStyle.smallProceedButtonText}>Next: Traveler Information</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={BookingUploadsStyle.backTextButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={BookingUploadsStyle.backText}>Back to Review</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}