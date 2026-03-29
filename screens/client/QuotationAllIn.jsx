import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const formatPeso = (value) => `₱${(Number(value) || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

export default function QuotationAllIn() {
    const navigation = useNavigation();
    const route = useRoute();
    const [isSidebarVisible, setSidebarVisible] = useState(false);

    // Destructure passed data from PackageDetails/Date Modal
    const { pkg, selectedDate, selectedDatePrice, selectedDateRate } = route.params || {};

    // 1. Local State for Selection
    const [selectedSoloGrouped, setSelectedSoloGrouped] = useState("solo");
    const [counts, setCounts] = useState({ adult: 2, child: 0, infant: 0 });

    // 2. Calculation Logic (Mapped from Web snippets)
    const packagePricePerPax = selectedDatePrice || pkg?.price || 0;
    const soloRate = (pkg?.packageSoloRate || 0) + (selectedDateRate || 0);
    const childRate = (pkg?.packageChildRate || 0) + (selectedDateRate || 0);
    const infantRate = (pkg?.packageInfantRate || 0) + (selectedDateRate || 0);

    const travelersCount = useMemo(() => {
        return selectedSoloGrouped === 'solo' 
            ? { adult: 1, child: 0, infant: 0 } 
            : counts;
    }, [selectedSoloGrouped, counts]);

    const totalAmount = useMemo(() => {
        if (selectedSoloGrouped === 'solo') return soloRate;
        return (travelersCount.adult * packagePricePerPax) + 
               (travelersCount.child * childRate) + 
               (travelersCount.infant * infantRate);
    }, [selectedSoloGrouped, travelersCount, packagePricePerPax, soloRate, childRate, infantRate]);

    const totalTravelers = travelersCount.adult + travelersCount.child + travelersCount.infant;

    // Get Airline & Hotel properly based on actual DB schema
    const airlineDisplay = pkg?.packageAirlines?.[0]?.name || 'N/A';
    const hotelDisplay = pkg?.packageHotel?.[0]?.name || pkg?.packageHotels?.[0]?.name || 'N/A';

    // 3. Handlers
    const updateCount = (type, action) => {
        setCounts(prev => {
            let newVal = action === 'inc' ? prev[type] + 1 : prev[type] - 1;
            // Business rule: min 2 adults for group, max 10 for all categories
            if (type === 'adult') newVal = Math.max(2, Math.min(newVal, 10));
            else newVal = Math.max(0, Math.min(newVal, 10));
            return { ...prev, [type]: newVal };
        });
    };

    const handleProceed = () => {
        // Strip heavy images
        const { image, images, ...cleanPkg } = pkg;

        const bookingSetupData = {
            pkg: cleanPkg,
            selectedDate,
            arrangement: 'All in Package',
            bookingType: selectedSoloGrouped === 'solo' ? 'Solo Booking' : 'Group Booking',
            travelerCounts: travelersCount,
            totalPrice: totalAmount,
            airline: airlineDisplay,
            hotel: hotelDisplay
        };
        
        navigation.navigate("bookingreview", { setupData: bookingSetupData });
    };

    return (
        <SafeAreaView style={QuotationAllInStyle.safeArea}>
            <StatusBar barStyle="dark-content" />
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={QuotationAllInStyle.container} showsVerticalScrollIndicator={false}>
                
                {/* Header */}
                <View style={QuotationAllInStyle.headerRow}>
                    <View style={QuotationAllInStyle.titleGroup}>
                        <Text style={QuotationAllInStyle.mainTitle}>Package Arrangement</Text>
                        <Text style={QuotationAllInStyle.subtitle}>Select if you are traveling alone or with a group.</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={QuotationAllInStyle.backButton}>
                        <Text style={QuotationAllInStyle.backButtonText}>BACK</Text>
                    </TouchableOpacity>
                </View>

                {/* Solo Selection Card */}
                <TouchableOpacity 
                    activeOpacity={0.9}
                    style={[QuotationAllInStyle.card, selectedSoloGrouped === 'solo' && QuotationAllInStyle.cardSelected]}
                    onPress={() => setSelectedSoloGrouped('solo')}
                >
                    <Image source={require('../../assets/images/fixedallin.jpg')} style={QuotationAllInStyle.cardImage} />
                    <View style={QuotationAllInStyle.cardContent}>
                        <Text style={QuotationAllInStyle.cardTitle}>Single Supplement / Solo Booking</Text>
                        <Text style={QuotationAllInStyle.cardDesc}>Book for yourself with a single traveler setup.</Text>
                        <Text style={QuotationAllInStyle.cardNote}>Note: A single supplement fee applies for solo travelers.</Text>
                    </View>
                </TouchableOpacity>

                {/* Group Selection Card */}
                <TouchableOpacity 
                    activeOpacity={0.9}
                    style={[QuotationAllInStyle.card, selectedSoloGrouped === 'group' && QuotationAllInStyle.cardSelected]}
                    onPress={() => setSelectedSoloGrouped('group')}
                >
                    <Image source={require('../../assets/images/allinpackage.jpg')} style={QuotationAllInStyle.cardImage} />
                    <View style={QuotationAllInStyle.cardContent}>
                        <Text style={QuotationAllInStyle.cardTitle}>Grouped Booking</Text>
                        <Text style={QuotationAllInStyle.cardDesc}>Plan a trip for a group with shared activities.</Text>
                        <Text style={QuotationAllInStyle.cardNote}>Note: Group booking requires a minimum of 2 travelers.</Text>
                    </View>
                </TouchableOpacity>

                {/* Traveler Counters */}
                {selectedSoloGrouped === 'group' && (
                    <View style={QuotationAllInStyle.counterSection}>
                        <Text style={QuotationAllInStyle.counterSectionTitle}>Number of Travelers</Text>
                        
                        <View style={QuotationAllInStyle.counterRow}>
                            <View style={QuotationAllInStyle.counterLabelGroup}>
                                <Text style={QuotationAllInStyle.counterLabel}>Adult</Text>
                                <Text style={QuotationAllInStyle.counterSublabel}>Ages 12 and above</Text>
                            </View>
                            <View style={QuotationAllInStyle.counterControls}>
                                <TouchableOpacity onPress={() => updateCount('adult', 'dec')} style={QuotationAllInStyle.counterBtn}><Ionicons name="remove" size={18} color="#305797" /></TouchableOpacity>
                                <Text style={QuotationAllInStyle.counterValue}>{counts.adult}</Text>
                                <TouchableOpacity onPress={() => updateCount('adult', 'inc')} style={QuotationAllInStyle.counterBtn}><Ionicons name="add" size={18} color="#305797" /></TouchableOpacity>
                            </View>
                        </View>

                        <View style={QuotationAllInStyle.counterRow}>
                            <View style={QuotationAllInStyle.counterLabelGroup}>
                                <Text style={QuotationAllInStyle.counterLabel}>Child</Text>
                                <Text style={QuotationAllInStyle.counterSublabel}>Ages 3-11</Text>
                            </View>
                            <View style={QuotationAllInStyle.counterControls}>
                                <TouchableOpacity onPress={() => updateCount('child', 'dec')} style={QuotationAllInStyle.counterBtn}><Ionicons name="remove" size={18} color="#305797" /></TouchableOpacity>
                                <Text style={QuotationAllInStyle.counterValue}>{counts.child}</Text>
                                <TouchableOpacity onPress={() => updateCount('child', 'inc')} style={QuotationAllInStyle.counterBtn}><Ionicons name="add" size={18} color="#305797" /></TouchableOpacity>
                            </View>
                        </View>

                        <View style={[QuotationAllInStyle.counterRow, { borderBottomWidth: 0 }]}>
                            <View style={QuotationAllInStyle.counterLabelGroup}>
                                <Text style={QuotationAllInStyle.counterLabel}>Infant</Text>
                                <Text style={QuotationAllInStyle.counterSublabel}>Ages 0-2</Text>
                            </View>
                            <View style={QuotationAllInStyle.counterControls}>
                                <TouchableOpacity onPress={() => updateCount('infant', 'dec')} style={QuotationAllInStyle.counterBtn}><Ionicons name="remove" size={18} color="#305797" /></TouchableOpacity>
                                <Text style={QuotationAllInStyle.counterValue}>{counts.infant}</Text>
                                <TouchableOpacity onPress={() => updateCount('infant', 'inc')} style={QuotationAllInStyle.counterBtn}><Ionicons name="add" size={18} color="#305797" /></TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* --- NEW BOOKING SUMMARY SECTION --- */}
                <View style={QuotationAllInStyle.summarySection}>
                    
                    {/* ADDED: Booking Details Title */}
                    <Text style={{ fontFamily: "Montserrat_700Bold", fontSize: 16, color: "#1f2a44", marginBottom: 10, marginLeft: 5 }}>
                        Booking Details
                    </Text>

                    {/* CARD 1: BOOKING DETAILS */}
                    <View style={QuotationAllInStyle.bookingDetailsCard}>
                        <View style={QuotationAllInStyle.detailRowBreakdown}>
                            <Text style={QuotationAllInStyle.breakdownLabel}>Tour Package</Text>
                            {/* ADDED: Bold text styling & Uppercase for Tour Package */}
                            <Text style={[QuotationAllInStyle.breakdownValue, { fontFamily: 'Montserrat_700Bold', color: '#1f2a44', textTransform: 'uppercase' }]} numberOfLines={2}>
                                {pkg?.title}
                            </Text>
                        </View>
                        <View style={QuotationAllInStyle.detailRowBreakdown}>
                            <Text style={QuotationAllInStyle.breakdownLabel}>Booking Type</Text>
                            <Text style={QuotationAllInStyle.breakdownValue}>{selectedSoloGrouped === 'solo' ? 'Solo Booking' : 'Group Booking'}</Text>
                        </View>
                        <View style={QuotationAllInStyle.detailRowBreakdown}>
                            <Text style={QuotationAllInStyle.breakdownLabel}>Travel Date</Text>
                            <Text style={QuotationAllInStyle.breakdownValue}>{selectedDate}</Text>
                        </View>
                        <View style={QuotationAllInStyle.detailRowBreakdown}>
                            <Text style={QuotationAllInStyle.breakdownLabel}>Airline / Hotel</Text>
                            {/* FIXED: Uses the correct database schema names */}
                            <Text style={QuotationAllInStyle.breakdownValue}>
                                {airlineDisplay} • {hotelDisplay}
                            </Text>
                        </View>
                        <View style={[QuotationAllInStyle.detailRowBreakdown, { borderBottomWidth: 0 }]}>
                            <Text style={QuotationAllInStyle.breakdownLabel}>Travelers</Text>
                            <Text style={QuotationAllInStyle.breakdownValue}>
                                {totalTravelers} Person(s) 
                                {selectedSoloGrouped === 'group' && ` (${counts.adult} Adults${counts.child ? `, ${counts.child} Children` : ''})`}
                            </Text>
                        </View>
                    </View>

                    {/* CARD 2: TOTAL AMOUNT */}
                    <View style={QuotationAllInStyle.totalAmountCard}>
                        <Text style={QuotationAllInStyle.totalLabel}>TOTAL AMOUNT</Text>
                        <Text style={QuotationAllInStyle.totalValue}>{formatPeso(totalAmount)}</Text>
                        
                        {/* Breakdown Logic */}
                        {selectedSoloGrouped === 'solo' ? (
                            <View style={QuotationAllInStyle.pricingRow}>
                                <Text style={QuotationAllInStyle.pricingText}>Solo rate</Text>
                                <Text style={QuotationAllInStyle.pricingText}>{formatPeso(pkg?.packageSoloRate || totalAmount - (selectedDateRate || 0))}</Text>
                            </View>
                        ) : (
                            <>
                                {counts.adult > 0 && (
                                    <View style={QuotationAllInStyle.pricingRow}>
                                        <Text style={QuotationAllInStyle.pricingText}>Adults ({counts.adult} x {formatPeso((pkg?.price || 0))})</Text>
                                        <Text style={QuotationAllInStyle.pricingText}>{formatPeso(counts.adult * (pkg?.price || 0))}</Text>
                                    </View>
                                )}
                                {counts.child > 0 && (
                                    <View style={QuotationAllInStyle.pricingRow}>
                                        <Text style={QuotationAllInStyle.pricingText}>Child ({counts.child} x {formatPeso(pkg?.packageChildRate || 0)})</Text>
                                        <Text style={QuotationAllInStyle.pricingText}>{formatPeso(counts.child * (pkg?.packageChildRate || 0))}</Text>
                                    </View>
                                )}
                                {counts.infant > 0 && (
                                    <View style={QuotationAllInStyle.pricingRow}>
                                        <Text style={QuotationAllInStyle.pricingText}>Infant ({counts.infant} x {formatPeso(pkg?.packageInfantRate || 0)})</Text>
                                        <Text style={QuotationAllInStyle.pricingText}>{formatPeso(counts.infant * (pkg?.packageInfantRate || 0))}</Text>
                                    </View>
                                )}
                            </>
                        )}

                        {/* ADDED: Date Surcharge Row */}
                        <View style={QuotationAllInStyle.pricingRow}>
                            <Text style={QuotationAllInStyle.pricingText}>Date surcharge</Text>
                            <Text style={QuotationAllInStyle.pricingText}>
                                {selectedDateRate > 0 ? formatPeso(selectedDateRate * totalTravelers) : 'NONE'}
                            </Text>
                        </View>

                        <Text style={QuotationAllInStyle.summaryNote}>*All inclusions fees are already factored in the total price.</Text>

                        {/* Dashed Package Type Box */}
                        <View style={QuotationAllInStyle.dashedBox}>
                            <Text style={QuotationAllInStyle.dashedBoxLabel}>Package Type:</Text>
                            <Text style={QuotationAllInStyle.dashedBoxValue}>{pkg?.packageType || 'INTERNATIONAL'}</Text>
                        </View>

                        <TouchableOpacity 
                            style={QuotationAllInStyle.proceedButton}
                            onPress={handleProceed}
                        >
                            <Text style={QuotationAllInStyle.proceedButtonText}>Proceed to Details</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}