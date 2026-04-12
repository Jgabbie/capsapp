import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from "expo-constants";

// --- OPTIMIZED IMAGE IMPORT ---
import { Image } from 'expo-image'; 

import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const formatPeso = (value) => `₱${(Number(value) || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const getImageUrl = (img) => {
    if (!img) return "https://via.placeholder.com/800x500?text=No+Image";
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    
    let host = "localhost";
    if (Platform.OS !== "web") {
        const hostUri = Constants.expoConfig?.hostUri || "";
        host = hostUri.split(":")[0] || "10.0.2.2";
    }
    return `http://${host}:8000/${img.replace(/^\/+/, "")}`;
};

export default function QuotationAllIn() {
    const navigation = useNavigation();
    const route = useRoute();
    const [isSidebarVisible, setSidebarVisible] = useState(false);

    // Destructure passed data from PackageDetails/Date Modal
    const { pkg, selectedDate, selectedDatePrice, selectedDateRate } = route.params || {};

    // 1. Local State for Selection
    const [selectedSoloGrouped, setSelectedSoloGrouped] = useState("solo");
    const [counts, setCounts] = useState({ adult: 2, child: 0, infant: 0 });

    // 2. Calculation Logic (Exactly Matched to Web)
    const discountPercent = Number(pkg?.packageDiscountPercent || pkg?.discount || 0);
    const discountMultiplier = discountPercent > 0 ? 1 - (discountPercent / 100) : 1;

    // Base rates INCLUDING the date surcharge BEFORE applying discounts
    const basePackagePricePerPax = selectedDatePrice || pkg?.packagePricePerPax || pkg?.price || 0;
    const baseSoloRate = (pkg?.packageSoloRate || 0) + (selectedDateRate || 0);
    const baseChildRate = (pkg?.packageChildRate || 0) + (selectedDateRate || 0);
    const baseInfantRate = (pkg?.packageInfantRate || 0) + (selectedDateRate || 0);

    // Apply the discount
    const packagePricePerPax = basePackagePricePerPax * discountMultiplier;
    const soloRate = baseSoloRate * discountMultiplier;
    const childRate = baseChildRate * discountMultiplier;
    const infantRate = baseInfantRate * discountMultiplier;

    const soloExtraRate = Math.max(0, soloRate - packagePricePerPax);
    const dateSurcharge = selectedDateRate || 0;

    // 🔥 NEW: Fetch Maximums from pkg or fallback to defaults
    const maxAdults = pkg?.maxAdults || 20;
    const maxChildren = pkg?.maxChildren || 10;
    const maxInfants = pkg?.maxInfants || 10;

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

    // Get Airline & Hotel
    const airlineDisplay = pkg?.packageAirlines?.[0]?.name || pkg?.packageAirlines?.[0] || 'N/A';
    const hotelDisplay = pkg?.packageHotels?.[0]?.name || pkg?.packageHotels?.[0] || 'N/A';

    // 3. Handlers
    const updateCount = (type, action) => {
        setCounts(prev => {
            let newVal = action === 'inc' ? prev[type] + 1 : prev[type] - 1;
            // 🔥 UPDATED: Business rule limits based on web variables
            if (type === 'adult') newVal = Math.max(2, Math.min(newVal, maxAdults));
            else if (type === 'child') newVal = Math.max(0, Math.min(newVal, maxChildren));
            else if (type === 'infant') newVal = Math.max(0, Math.min(newVal, maxInfants));
            return { ...prev, [type]: newVal };
        });
    };

    const handleProceed = () => {
        const { image, images, ...cleanPkg } = pkg; // Strip heavy images

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
                
                {/* --- BOOKING SUMMARY SECTION --- */}
                <View style={QuotationAllInStyle.headerRow}>
                    <View style={QuotationAllInStyle.titleGroup}>
                        <Text style={QuotationAllInStyle.mainTitle}>Booking Summary</Text>
                        <Text style={QuotationAllInStyle.subtitle}>Kindly check the details of your booking before proceeding.</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={QuotationAllInStyle.backButton}>
                        <Text style={QuotationAllInStyle.backButtonText}>BACK</Text>
                    </TouchableOpacity>
                </View>

                {/* Scrollable Images */}
                {(pkg?.images && pkg.images.length > 0) && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={QuotationAllInStyle.imageScrollContainer}>
                        {pkg.images.map((img, index) => (
                            <Image 
                                key={index} 
                                source={getImageUrl(img)} 
                                style={QuotationAllInStyle.summaryScrollImage} 
                                contentFit="cover" 
                                transition={300}
                            />
                        ))}
                    </ScrollView>
                )}

                {/* Booking Details Card */}
                <View style={QuotationAllInStyle.bookingDetailsCard}>
                    <Text style={QuotationAllInStyle.bookingDetailsTitle}>Booking Details</Text>
                    
                    <View style={QuotationAllInStyle.detailRowBreakdown}>
                        <Text style={QuotationAllInStyle.breakdownLabel}>Tour Package</Text>
                        <Text style={[QuotationAllInStyle.breakdownValue, { fontFamily: 'Montserrat_700Bold', color: '#1f2a44', textTransform: 'uppercase' }]} numberOfLines={2}>
                            {pkg?.title || pkg?.packageName || 'TOUR PACKAGE'}
                        </Text>
                    </View>
                    <View style={QuotationAllInStyle.detailRowBreakdown}>
                        <Text style={QuotationAllInStyle.breakdownLabel}>Booking Type</Text>
                        <Text style={QuotationAllInStyle.breakdownValue}>{selectedSoloGrouped === 'solo' ? 'Solo Booking' : 'Group Booking'}</Text>
                    </View>
                    <View style={QuotationAllInStyle.detailRowBreakdown}>
                        <Text style={QuotationAllInStyle.breakdownLabel}>Travel Date</Text>
                        <Text style={QuotationAllInStyle.breakdownValue}>{selectedDate || 'Not set'}</Text>
                    </View>
                    <View style={QuotationAllInStyle.detailRowBreakdown}>
                        <Text style={QuotationAllInStyle.breakdownLabel}>Airline / Hotel</Text>
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

                {/* Total Amount Card */}
                <View style={QuotationAllInStyle.totalAmountCard}>
                    <Text style={QuotationAllInStyle.totalLabel}>TOTAL AMOUNT</Text>
                    <Text style={QuotationAllInStyle.totalValue}>{formatPeso(totalAmount)}</Text>
                    
                    {/* Discount */}
                    {discountPercent > 0 && (
                        <View style={QuotationAllInStyle.pricingRow}>
                            <Text style={QuotationAllInStyle.pricingText}>Discount per pax</Text>
                            <Text style={QuotationAllInStyle.pricingText}>{discountPercent}%</Text>
                        </View>
                    )}

                    {/* Breakdown Logic */}
                    {selectedSoloGrouped === 'solo' ? (
                        <>
                            <View style={QuotationAllInStyle.pricingRow}>
                                <Text style={QuotationAllInStyle.pricingText}>Solo rate</Text>
                                <Text style={QuotationAllInStyle.pricingText}>{formatPeso(soloExtraRate)}</Text>
                            </View>
                            <View style={QuotationAllInStyle.pricingRow}>
                                <Text style={QuotationAllInStyle.pricingText}>Date surcharge</Text>
                                <Text style={QuotationAllInStyle.pricingText}>
                                    {dateSurcharge === 0 ? "NONE" : formatPeso(dateSurcharge)}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <>
                            {counts.adult > 0 && (
                                <View style={QuotationAllInStyle.pricingRow}>
                                    <Text style={QuotationAllInStyle.pricingText}>Adults ({counts.adult} x {formatPeso(packagePricePerPax)})</Text>
                                    <Text style={QuotationAllInStyle.pricingText}>{formatPeso(counts.adult * packagePricePerPax)}</Text>
                                </View>
                            )}
                            {counts.child > 0 && (
                                <View style={QuotationAllInStyle.pricingRow}>
                                    <Text style={QuotationAllInStyle.pricingText}>Child ({counts.child} x {formatPeso(childRate)})</Text>
                                    <Text style={QuotationAllInStyle.pricingText}>{formatPeso(counts.child * childRate)}</Text>
                                </View>
                            )}
                            {counts.infant > 0 && (
                                <View style={QuotationAllInStyle.pricingRow}>
                                    <Text style={QuotationAllInStyle.pricingText}>Infant ({counts.infant} x {formatPeso(infantRate)})</Text>
                                    <Text style={QuotationAllInStyle.pricingText}>{formatPeso(counts.infant * infantRate)}</Text>
                                </View>
                            )}
                            <View style={QuotationAllInStyle.pricingRow}>
                                <Text style={QuotationAllInStyle.pricingText}>Date surcharge</Text>
                                <Text style={QuotationAllInStyle.pricingText}>
                                    {dateSurcharge === 0 ? "NONE" : formatPeso(dateSurcharge * totalTravelers)}
                                </Text>
                            </View>
                        </>
                    )}

                    <Text style={QuotationAllInStyle.summaryNote}>
                        *All inclusions fees for this package are already factored in the total price, except for Visas and other additionals. For solo booking, rate has already been applied in the total price.
                    </Text>

                    {/* Dashed Package Type Box */}
                    <View style={QuotationAllInStyle.dashedBox}>
                        <Text style={QuotationAllInStyle.dashedBoxLabel}>Package Type:</Text>
                        <Text style={QuotationAllInStyle.dashedBoxValue}>{pkg?.packageType || 'INTERNATIONAL'}</Text>
                    </View>
                </View>

                {/* --- PACKAGE ARRANGEMENT SECTION --- */}
                <View style={QuotationAllInStyle.sectionHeader}>
                    <Text style={QuotationAllInStyle.sectionTitle}>Package Arrangement</Text>
                    <Text style={QuotationAllInStyle.subtitle}>Select if you are traveling alone or with a group.</Text>
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
                        <Text style={QuotationAllInStyle.cardNoteRed}>Note: A single supplement fee may apply which can be more than the usual rate. The per pax rate only apply to group with minimum of 2 travelers.</Text>
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
                        <Text style={QuotationAllInStyle.cardNoteRed}>Note: Group booking requires a minimum of 2 travelers.</Text>
                    </View>
                </TouchableOpacity>

                {/* --- 🔥 UPDATED TRAVELER COUNTERS TO MATCH WEB CARDS 🔥 --- */}
                {selectedSoloGrouped === 'group' && (
                    <View style={QuotationAllInStyle.counterSection}>
                        <Text style={QuotationAllInStyle.counterSectionTitle}>Number of Travelers</Text>
                        <Text style={[QuotationAllInStyle.subtitle, { marginBottom: 15 }]}>Kindly indicate the number of travelers in each category.</Text>
                        
                        {/* ADULT CARD */}
                        <View style={QuotationAllInStyle.travelerCard}>
                            <Text style={QuotationAllInStyle.counterLabel}>Adult</Text>
                            <Text style={QuotationAllInStyle.travelerDetailText}>Rates: {formatPeso(packagePricePerPax)} per adult</Text>
                            <Text style={QuotationAllInStyle.travelerDetailText}>
                                <Text style={{fontFamily: 'Montserrat_700Bold', color: '#475569'}}>Maximum: </Text>{maxAdults}
                            </Text>
                            <Text style={QuotationAllInStyle.travelerDetailText}>Ages 12 and above</Text>
                            
                            <View style={[QuotationAllInStyle.counterControls, { marginTop: 12 }]}>
                                <TouchableOpacity onPress={() => updateCount('adult', 'dec')} style={QuotationAllInStyle.counterBtn}><Ionicons name="remove" size={18} color="#305797" /></TouchableOpacity>
                                <Text style={QuotationAllInStyle.counterValue}>{counts.adult}</Text>
                                <TouchableOpacity onPress={() => updateCount('adult', 'inc')} style={QuotationAllInStyle.counterBtn}><Ionicons name="add" size={18} color="#305797" /></TouchableOpacity>
                            </View>
                        </View>

                        {/* CHILD CARD */}
                        <View style={QuotationAllInStyle.travelerCard}>
                            <Text style={QuotationAllInStyle.counterLabel}>Child</Text>
                            <Text style={QuotationAllInStyle.travelerDetailText}>Rates: {formatPeso(childRate)} per child</Text>
                            <Text style={QuotationAllInStyle.travelerDetailText}>
                                <Text style={{fontFamily: 'Montserrat_700Bold', color: '#475569'}}>Maximum: </Text>{maxChildren}
                            </Text>
                            <Text style={QuotationAllInStyle.travelerDetailText}>Ages 3-11</Text>
                            
                            <View style={[QuotationAllInStyle.counterControls, { marginTop: 12 }]}>
                                <TouchableOpacity onPress={() => updateCount('child', 'dec')} style={QuotationAllInStyle.counterBtn}><Ionicons name="remove" size={18} color="#305797" /></TouchableOpacity>
                                <Text style={QuotationAllInStyle.counterValue}>{counts.child}</Text>
                                <TouchableOpacity onPress={() => updateCount('child', 'inc')} style={QuotationAllInStyle.counterBtn}><Ionicons name="add" size={18} color="#305797" /></TouchableOpacity>
                            </View>
                        </View>

                        {/* INFANT CARD */}
                        <View style={[QuotationAllInStyle.travelerCard, { marginBottom: 0 }]}>
                            <Text style={QuotationAllInStyle.counterLabel}>Infant</Text>
                            <Text style={QuotationAllInStyle.travelerDetailText}>Rates: {formatPeso(infantRate)} per infant</Text>
                            <Text style={QuotationAllInStyle.travelerDetailText}>
                                <Text style={{fontFamily: 'Montserrat_700Bold', color: '#475569'}}>Maximum: </Text>{maxInfants}
                            </Text>
                            <Text style={QuotationAllInStyle.travelerDetailText}>Ages 0-2</Text>
                            
                            <View style={[QuotationAllInStyle.counterControls, { marginTop: 12 }]}>
                                <TouchableOpacity onPress={() => updateCount('infant', 'dec')} style={QuotationAllInStyle.counterBtn}><Ionicons name="remove" size={18} color="#305797" /></TouchableOpacity>
                                <Text style={QuotationAllInStyle.counterValue}>{counts.infant}</Text>
                                <TouchableOpacity onPress={() => updateCount('infant', 'inc')} style={QuotationAllInStyle.counterBtn}><Ionicons name="add" size={18} color="#305797" /></TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                <TouchableOpacity 
                    style={QuotationAllInStyle.proceedButton}
                    onPress={handleProceed}
                >
                    <Text style={QuotationAllInStyle.proceedButtonText}>Proceed to Details</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}