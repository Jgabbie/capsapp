import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import BookingReviewStyle from '../../styles/clientstyles/BookingReviewStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle'; // Reuse general buttons
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

export default function BookingReview({ route, navigation }) {
    const [isSidebarVisible, setSidebarVisible] = useState(false);

    // Get the data passed from QuotationAllIn
    const { setupData } = route.params || {};
    const pkg = setupData?.pkg || {};

    // Properly check for "Yes", "true", or boolean true
    const rawVisaValue = pkg?.requiresVisa ?? pkg?.packageRequiresVisa ?? pkg?.visaRequired;
    const requiresVisa = rawVisaValue === true || String(rawVisaValue).toLowerCase() === 'yes' || String(rawVisaValue).toLowerCase() === 'true';

    // Check if it's a domestic package to dynamically change the button text
    const isDomestic = String(pkg?.packageType || '').toLowerCase().includes('domestic');
    const documentLabel = isDomestic ? 'Valid ID' : 'Passport';

    // Extract itinerary images
    const itineraryImages = pkg?.packageItineraryImages || {};


    // Helper function to get image URL for a day
    const getImageForDay = (dayLabel) => {
        if (!dayLabel || !itineraryImages) {
            return null;
        }

        // exact match first
        if (itineraryImages[dayLabel]) {
            return itineraryImages[dayLabel];
        }

        // lowercase
        const lowercase = dayLabel.toLowerCase();
        if (itineraryImages[lowercase]) {
            return itineraryImages[lowercase];
        }

        // removing spaces
        const noSpaces = dayLabel.replace(/\s+/g, '');
        if (itineraryImages[noSpaces]) {
            return itineraryImages[noSpaces];
        }

        // lowercase no spaces
        if (itineraryImages[noSpaces.toLowerCase()]) {
            return itineraryImages[noSpaces.toLowerCase()];
        }

        // Try numeric day (Day 1 -> 1)
        const dayMatch = dayLabel.match(/\d+/);
        if (dayMatch) {
            const dayNum = dayMatch[0];
            if (itineraryImages[dayNum]) {
                return itineraryImages[dayNum];
            }
            if (itineraryImages[`day${dayNum}`]) {
                return itineraryImages[`day${dayNum}`];
            }
            if (itineraryImages[`Day${dayNum}`]) {
                return itineraryImages[`Day${dayNum}`];
            }
        }
        return null;
    };

    const handleNext = () => {
        // Move to Screen 3: Uploads
        navigation.navigate("bookinguploads", { setupData });
    };

    return (
        <SafeAreaView style={BookingReviewStyle.safeArea}>
            <StatusBar barStyle="dark-content" />
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={BookingReviewStyle.container} showsVerticalScrollIndicator={false}>

                <View style={BookingReviewStyle.headerGroup}>
                    <Text style={QuotationAllInStyle.mainTitle}>Itinerary, Inclusions & Exclusions</Text>
                    <Text style={QuotationAllInStyle.subtitle}>Review the day-by-day schedule and what your package covers.</Text>
                </View>

                {/* section itinerary */}
                <View style={BookingReviewStyle.sectionCard}>
                    <View style={BookingReviewStyle.cardHeader}>
                        <View>
                            <View style={BookingReviewStyle.pill}>
                                <Text style={BookingReviewStyle.pillText}>Itinerary</Text>
                            </View>
                            <Text style={BookingReviewStyle.sectionTitle}>Day-by-day plan</Text>
                            <Text style={BookingReviewStyle.sectionSubtitle}>Activities and highlights for each day.</Text>
                        </View>
                    </View>

                    {Object.entries(pkg.packageItineraries || {}).map(([day, items], i) => {
                        const imageUrl = getImageForDay(day);
                        return (
                            <View key={i} style={BookingReviewStyle.itineraryDayBox}>
                                {imageUrl && (
                                    <Image
                                        source={imageUrl}
                                        style={{ width: '100%', height: 180, borderRadius: 8, marginBottom: 12 }}
                                        contentFit="cover"
                                        transition={300}
                                    />
                                )}
                                <Text style={BookingReviewStyle.dayLabel}>{day.toUpperCase()}</Text>
                                {(Array.isArray(items) ? items : [items]).map((item, j) => (
                                    <View key={j} style={BookingReviewStyle.activityRow}>
                                        <View style={BookingReviewStyle.activityBullet} />
                                        <Text style={BookingReviewStyle.activityText}>
                                            {typeof item === 'object' ? (item.activity || item.optionalActivity) : item}
                                            {item.isOptional ? " (Optional)" : ""}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        );
                    })}
                </View>

                {/* inclusions and exclusions */}
                <View style={BookingReviewStyle.sectionCard}>
                    <View style={BookingReviewStyle.cardHeader}>
                        <View>
                            <View style={BookingReviewStyle.pill}>
                                <Text style={BookingReviewStyle.pillText}>Package</Text>
                            </View>
                            <Text style={BookingReviewStyle.sectionTitle}>Inclusions, Exclusions, Requirements and Policies</Text>
                            <Text style={BookingReviewStyle.sectionSubtitle}>Know what is covered and what is not.</Text>
                        </View>
                    </View>

                    <View style={BookingReviewStyle.gridRow}>
                        {/* Inclusions */}
                        <View style={BookingReviewStyle.gridCol}>
                            <Text style={[BookingReviewStyle.gridTitle, { color: '#305797' }]}>Inclusions</Text>
                            {pkg.packageInclusions?.map((item, i) => (
                                <Text key={i} style={BookingReviewStyle.itemText}>✓ {item}</Text>
                            ))}
                        </View>

                        {/* Exclusions */}
                        <View style={BookingReviewStyle.gridCol}>
                            <Text style={[BookingReviewStyle.gridTitle, { color: '#b54747' }]}>Exclusions</Text>
                            {pkg.packageExclusions?.map((item, i) => (
                                <Text key={i} style={BookingReviewStyle.itemText}>✕ {item}</Text>
                            ))}
                        </View>
                    </View>

                    {/* Visa Requirement Card */}
                    <View style={[BookingReviewStyle.policyCard, { marginTop: 20 }]}>
                        <Text style={BookingReviewStyle.policyTitle}>Visa Requirement</Text>
                        <Text style={BookingReviewStyle.policyText}>
                            {requiresVisa
                                ? 'Please be informed that this package requires a visa. Please ensure you have a valid visa before travel.'
                                : 'This package does not require a visa.'}
                        </Text>
                    </View>

                    {/* Cancellation Policy Card */}
                    <View style={[BookingReviewStyle.policyCard, { marginTop: 16 }]}>
                        <Text style={BookingReviewStyle.policyTitle}>Cancellation Policy</Text>
                        <Text style={BookingReviewStyle.policyText}>
                            Please be informed that cancellation request with medical reasons are only accepted and refundable with valid medical certificate. Cancellation request without medical reasons are non-refundable. For any cancellation request, please reach out to us through the Contact Us section on our Home page.
                        </Text>
                    </View>
                </View>

                {/* Footer Navigation */}
                <View style={BookingReviewStyle.footerContainer}>
                    <TouchableOpacity
                        style={BookingReviewStyle.smallProceedButton}
                        onPress={handleNext}
                    >
                        <Text style={BookingReviewStyle.smallProceedButtonText}>Next: Upload {documentLabel}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={BookingReviewStyle.backTextButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={BookingReviewStyle.backText}>Back to Setup</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}