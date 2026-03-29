import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import BookingReviewStyle from '../../styles/clientstyles/BookingReviewStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle'; // Reuse general buttons
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

export default function BookingReview({ route, navigation }) {
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    
    // Get the data passed from QuotationAllIn
    const { setupData } = route.params || {};
    const pkg = setupData?.pkg || {};

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
                    <Text style={QuotationAllInStyle.mainTitle}>Review Package</Text>
                    {/* UPDATED TEXT */}
                    <Text style={QuotationAllInStyle.subtitle}>Review the day-by-day schedule and what your package covers.</Text>
                </View>

                {/* --- ITINERARY SECTION --- */}
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

                    {Object.entries(pkg.packageItineraries || {}).map(([day, items], i) => (
                        <View key={i} style={BookingReviewStyle.itineraryDayBox}>
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
                    ))}
                </View>

                {/* --- INCLUSIONS & EXCLUSIONS SECTION --- */}
                <View style={BookingReviewStyle.sectionCard}>
                    <View style={BookingReviewStyle.cardHeader}>
                        <View>
                            <View style={BookingReviewStyle.pill}>
                                <Text style={BookingReviewStyle.pillText}>Coverage</Text>
                            </View>
                            <Text style={BookingReviewStyle.sectionTitle}>Inclusions & Exclusions</Text>
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
                </View>

                {/* --- NEW COMPACT FOOTER NAVIGATION --- */}
                <View style={BookingReviewStyle.footerContainer}>
                    <TouchableOpacity 
                        style={BookingReviewStyle.smallProceedButton}
                        onPress={handleNext}
                    >
                        <Text style={BookingReviewStyle.smallProceedButtonText}>Next: Upload Documents</Text>
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