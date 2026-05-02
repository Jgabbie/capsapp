import React, { useState, useMemo, useEffect } from 'react';
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
    const { pkg, selectedDate, selectedDateSlots, selectedDatePrice, selectedDateRate } = route.params || {};

    // 🔥 FIXED: Prefer the actual slot count passed from the date picker
    const getAvailableSlots = () => {
        const directSlotCount = Number(selectedDateSlots);
        if (Number.isFinite(directSlotCount) && directSlotCount > 0) return directSlotCount;

        if (!selectedDate || !pkg?.packageSpecificDate) return 999;
        
        const dateSpecific = pkg.packageSpecificDate.find(d => {
            // Format 1: "May 8 - May 12"
            const format1 = `${new Date(d.startdaterange).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(d.enddaterange).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            
            // Format 2: "May 8, 2026 - May 12, 2026"
            const format2 = `${new Date(d.startdaterange).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(d.enddaterange).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            
            return selectedDate === format1 || selectedDate === format2;
        });
        
        if (dateSpecific) {
            const slotCount = Number(dateSpecific.slots || dateSpecific.availableSlots || 0);
            return Number.isFinite(slotCount) && slotCount > 0 ? slotCount : 999;
        }
        return 999;
    };

    const availableSlots = getAvailableSlots();
    const isGroupBookingDisabled = availableSlots < 2;

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

    const maxAdults = pkg?.maxAdults || 20;
    const maxChildren = pkg?.maxChildren || 10;
    const maxInfants = pkg?.maxInfants || 10;

    // 🔥 Cap max travelers based on available slots
    // With 2 slots: 2 adults, 0 children, 0 infants (locked)
    // With 3 slots: 3 adults, 1 child max, 1 infant max, etc.
    const maxTravelersFromSlots = availableSlots;
    const effectiveMaxAdults = Math.min(maxAdults, maxTravelersFromSlots);
    const effectiveMaxChildren = Math.min(maxChildren, Math.max(0, maxTravelersFromSlots - 2));
    const effectiveMaxInfants = Math.min(maxInfants, Math.max(0, maxTravelersFromSlots - 2));

    const travelersCount = useMemo(() => {
        return selectedSoloGrouped === 'solo' 
            ? { adult: 1, child: 0, infant: 0 } 
            : counts;
    }, [selectedSoloGrouped, counts]);

    useEffect(() => {
        if (selectedSoloGrouped === 'solo') {
            setCounts({ adult: 1, child: 0, infant: 0 });
            return;
        }

        if (availableSlots < 2) {
            setCounts({ adult: 2, child: 0, infant: 0 });
            return;
        }

        setCounts(prev => {
            const nextCounts = {
                adult: Math.max(2, Math.min(prev.adult, effectiveMaxAdults)),
                child: Math.max(0, Math.min(prev.child, effectiveMaxChildren)),
                infant: Math.max(0, Math.min(prev.infant, effectiveMaxInfants)),
            };

            let total = nextCounts.adult + nextCounts.child + nextCounts.infant;
            if (total <= maxTravelersFromSlots) {
                return nextCounts;
            }

            let overflow = total - maxTravelersFromSlots;
            let child = nextCounts.child;
            let infant = nextCounts.infant;
            let adult = nextCounts.adult;

            const reduceChild = Math.min(overflow, child);
            child -= reduceChild;
            overflow -= reduceChild;

            const reduceInfant = Math.min(overflow, infant);
            infant -= reduceInfant;
            overflow -= reduceInfant;

            if (overflow > 0) {
                adult = Math.max(2, adult - overflow);
            }

            return { adult, child, infant };
        });
    }, [selectedSoloGrouped, availableSlots, effectiveMaxAdults, effectiveMaxChildren, effectiveMaxInfants, maxTravelersFromSlots]);

    // 🔥 NEW: Calculate Original Total (Before Discount)
    const originalTotalAmount = useMemo(() => {
        if (selectedSoloGrouped === 'solo') return baseSoloRate;
        return (travelersCount.adult * basePackagePricePerPax) + 
               (travelersCount.child * baseChildRate) + 
               (travelersCount.infant * baseInfantRate);
    }, [selectedSoloGrouped, travelersCount, basePackagePricePerPax, baseSoloRate, baseChildRate, baseInfantRate]);

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
            
            if (type === 'adult') {
                newVal = Math.max(2, Math.min(newVal, effectiveMaxAdults));
                // If this would exceed total slots, cap it
                if (prev.child + prev.infant + newVal > maxTravelersFromSlots) {
                    newVal = Math.max(2, Math.min(newVal, maxTravelersFromSlots - prev.child - prev.infant));
                }
            } else if (type === 'child') {
                newVal = Math.max(0, Math.min(newVal, effectiveMaxChildren));
                // If this would exceed total slots, cap it
                if (prev.adult + prev.infant + newVal > maxTravelersFromSlots) {
                    newVal = Math.max(0, Math.min(newVal, maxTravelersFromSlots - prev.adult - prev.infant));
                }
            } else if (type === 'infant') {
                newVal = Math.max(0, Math.min(newVal, effectiveMaxInfants));
                // If this would exceed total slots, cap it
                if (prev.adult + prev.child + newVal > maxTravelersFromSlots) {
                    newVal = Math.max(0, Math.min(newVal, maxTravelersFromSlots - prev.adult - prev.child));
                }
            }
            
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

            <ScrollView contentContainerStyle={[QuotationAllInStyle.container, { paddingBottom: 30 }]} showsVerticalScrollIndicator={false}>
                
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
                    
                    {/* 🔥 UPDATED: Dynamic Pricing Breakdown perfectly matching Web */}
                    {discountPercent > 0 && (
                        <View style={QuotationAllInStyle.pricingRow}>
                            <Text style={QuotationAllInStyle.pricingText}>Discount</Text>
                            <Text style={QuotationAllInStyle.pricingValue}>{discountPercent}%</Text>
                        </View>
                    )}

                    {discountPercent > 0 && (
                        <View style={QuotationAllInStyle.pricingRow}>
                            <Text style={QuotationAllInStyle.pricingText}>Original total</Text>
                            <Text style={[QuotationAllInStyle.pricingValue, { textDecorationLine: 'line-through', color: '#9aa0a6', fontFamily: 'Roboto_400Regular' }]}>
                                {formatPeso(originalTotalAmount)}
                            </Text>
                        </View>
                    )}

                    {discountPercent > 0 && (
                        <View style={QuotationAllInStyle.pricingRow}>
                            <Text style={QuotationAllInStyle.pricingText}>Discounted total</Text>
                            <Text style={QuotationAllInStyle.pricingValue}>{formatPeso(totalAmount)}</Text>
                        </View>
                    )}

                    {selectedSoloGrouped === 'solo' && (
                        <View style={QuotationAllInStyle.pricingRow}>
                            <Text style={QuotationAllInStyle.pricingText}>Solo rate</Text>
                            <Text style={QuotationAllInStyle.pricingValue}>{formatPeso(soloExtraRate)}</Text>
                        </View>
                    )}

                    {/* Additional group traveler breakdowns just for clarity if needed, otherwise matches web */}
                    {selectedSoloGrouped === 'group' && travelersCount.adult > 0 && (
                        <View style={QuotationAllInStyle.pricingRow}>
                            <Text style={QuotationAllInStyle.pricingText}>Adults ({travelersCount.adult} x {formatPeso(packagePricePerPax)})</Text>
                            <Text style={QuotationAllInStyle.pricingValue}>{formatPeso(travelersCount.adult * packagePricePerPax)}</Text>
                        </View>
                    )}
                    {selectedSoloGrouped === 'group' && travelersCount.child > 0 && (
                        <View style={QuotationAllInStyle.pricingRow}>
                            <Text style={QuotationAllInStyle.pricingText}>Children ({travelersCount.child} x {formatPeso(childRate)})</Text>
                            <Text style={QuotationAllInStyle.pricingValue}>{formatPeso(travelersCount.child * childRate)}</Text>
                        </View>
                    )}
                    {selectedSoloGrouped === 'group' && travelersCount.infant > 0 && (
                        <View style={QuotationAllInStyle.pricingRow}>
                            <Text style={QuotationAllInStyle.pricingText}>Infants ({travelersCount.infant} x {formatPeso(infantRate)})</Text>
                            <Text style={QuotationAllInStyle.pricingValue}>{formatPeso(travelersCount.infant * infantRate)}</Text>
                        </View>
                    )}

                    <View style={QuotationAllInStyle.pricingRow}>
                        <Text style={QuotationAllInStyle.pricingText}>Date surcharge</Text>
                        <Text style={QuotationAllInStyle.pricingValue}>
                            {dateSurcharge === 0 ? "NONE" : formatPeso(dateSurcharge * totalTravelers)}
                        </Text>
                    </View>

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

                {/* 🔥 UPDATED: Solo Selection Card Image */}
                <TouchableOpacity 
                    activeOpacity={0.9}
                    style={[QuotationAllInStyle.card, selectedSoloGrouped === 'solo' && QuotationAllInStyle.cardSelected]}
                    onPress={() => setSelectedSoloGrouped('solo')}
                >
                    <Image source={require('../../assets/images/solobooking.jpg')} style={QuotationAllInStyle.cardImage} />
                    <View style={QuotationAllInStyle.cardContent}>
                        <Text style={QuotationAllInStyle.cardTitle}>Single Supplement / Solo Booking</Text>
                        <Text style={QuotationAllInStyle.cardDesc}>Book for yourself with a single traveler setup.</Text>
                        <Text style={QuotationAllInStyle.cardNoteRed}>Note: A single supplement fee may apply which can be more than the usual rate. The per pax rate only apply to group with minimum of 2 travelers.</Text>
                    </View>
                </TouchableOpacity>

                {/* 🔥 UPDATED: Group Selection Card Image */}
                <TouchableOpacity 
                    activeOpacity={0.9}
                    style={[QuotationAllInStyle.card, selectedSoloGrouped === 'group' && QuotationAllInStyle.cardSelected, isGroupBookingDisabled && { opacity: 0.5 }]}
                    onPress={() => !isGroupBookingDisabled && setSelectedSoloGrouped('group')}
                    disabled={isGroupBookingDisabled}
                >
                    <Image source={require('../../assets/images/groupedbooking.jpg')} style={QuotationAllInStyle.cardImage} />
                    <View style={QuotationAllInStyle.cardContent}>
                        <Text style={QuotationAllInStyle.cardTitle}>Grouped Booking</Text>
                        <Text style={QuotationAllInStyle.cardDesc}>Plan a trip for a group with shared activities.</Text>
                        <Text style={QuotationAllInStyle.cardNoteRed}>Note: Group booking should have a minimum of 2 travelers.</Text>
                    </View>
                </TouchableOpacity>

                {/* --- TRAVELER COUNTERS --- */}
                {selectedSoloGrouped === 'group' && !isGroupBookingDisabled && (
                    <View style={QuotationAllInStyle.counterSection}>
                        <Text style={QuotationAllInStyle.counterSectionTitle}>Number of Travelers</Text>
                        <Text style={[QuotationAllInStyle.subtitle, { marginBottom: 15 }]}>Kindly indicate the number of travelers in each category.</Text>
                        
                        {/* ADULT CARD */}
                        <View style={QuotationAllInStyle.travelerCard}>
                            <Text style={QuotationAllInStyle.counterLabel}>Adult</Text>
                            <Text style={QuotationAllInStyle.travelerDetailText}>Rates: {formatPeso(packagePricePerPax)} per adult</Text>
                            <Text style={QuotationAllInStyle.travelerDetailText}>
                                <Text style={{fontFamily: 'Montserrat_700Bold', color: '#475569'}}>Maximum: </Text>{effectiveMaxAdults}
                            </Text>
                            <Text style={QuotationAllInStyle.travelerDetailText}>Ages 12 and above</Text>
                            
                            <View style={[QuotationAllInStyle.counterControls, { marginTop: 12 }]}>
                                <TouchableOpacity onPress={() => updateCount('adult', 'dec')} style={QuotationAllInStyle.counterBtn} disabled={counts.adult <= 2}><Ionicons name="remove" size={18} color={counts.adult <= 2 ? "#ccc" : "#305797"} /></TouchableOpacity>
                                <Text style={QuotationAllInStyle.counterValue}>{counts.adult}</Text>
                                <TouchableOpacity onPress={() => updateCount('adult', 'inc')} style={QuotationAllInStyle.counterBtn} disabled={counts.adult >= effectiveMaxAdults}><Ionicons name="add" size={18} color={counts.adult >= effectiveMaxAdults ? "#ccc" : "#305797"} /></TouchableOpacity>
                            </View>
                        </View>

                        {/* CHILD CARD - HIDDEN IF MAX IS 0 */}
                        {effectiveMaxChildren > 0 && (
                            <View style={QuotationAllInStyle.travelerCard}>
                                <Text style={QuotationAllInStyle.counterLabel}>Child</Text>
                                <Text style={QuotationAllInStyle.travelerDetailText}>Rates: {formatPeso(childRate)} per child</Text>
                                <Text style={QuotationAllInStyle.travelerDetailText}>
                                    <Text style={{fontFamily: 'Montserrat_700Bold', color: '#475569'}}>Maximum: </Text>{effectiveMaxChildren}
                                </Text>
                                <Text style={QuotationAllInStyle.travelerDetailText}>Ages 3-11</Text>
                                
                                <View style={[QuotationAllInStyle.counterControls, { marginTop: 12 }]}>
                                    <TouchableOpacity onPress={() => updateCount('child', 'dec')} style={QuotationAllInStyle.counterBtn} disabled={counts.child <= 0}><Ionicons name="remove" size={18} color={counts.child <= 0 ? "#ccc" : "#305797"} /></TouchableOpacity>
                                    <Text style={QuotationAllInStyle.counterValue}>{counts.child}</Text>
                                    <TouchableOpacity onPress={() => updateCount('child', 'inc')} style={QuotationAllInStyle.counterBtn} disabled={counts.child >= effectiveMaxChildren}><Ionicons name="add" size={18} color={counts.child >= effectiveMaxChildren ? "#ccc" : "#305797"} /></TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* INFANT CARD - HIDDEN IF MAX IS 0 */}
                        {effectiveMaxInfants > 0 && (
                            <View style={[QuotationAllInStyle.travelerCard, { marginBottom: 0 }]}>
                                <Text style={QuotationAllInStyle.counterLabel}>Infant</Text>
                                <Text style={QuotationAllInStyle.travelerDetailText}>Rates: {formatPeso(infantRate)} per infant</Text>
                                <Text style={QuotationAllInStyle.travelerDetailText}>
                                    <Text style={{fontFamily: 'Montserrat_700Bold', color: '#475569'}}>Maximum: </Text>{effectiveMaxInfants}
                                </Text>
                                <Text style={QuotationAllInStyle.travelerDetailText}>Ages 0-2</Text>
                                
                                <View style={[QuotationAllInStyle.counterControls, { marginTop: 12 }]}>
                                    <TouchableOpacity onPress={() => updateCount('infant', 'dec')} style={QuotationAllInStyle.counterBtn} disabled={counts.infant <= 0}><Ionicons name="remove" size={18} color={counts.infant <= 0 ? "#ccc" : "#305797"} /></TouchableOpacity>
                                    <Text style={QuotationAllInStyle.counterValue}>{counts.infant}</Text>
                                    <TouchableOpacity onPress={() => updateCount('infant', 'inc')} style={QuotationAllInStyle.counterBtn} disabled={counts.infant >= effectiveMaxInfants}><Ionicons name="add" size={18} color={counts.infant >= effectiveMaxInfants ? "#ccc" : "#305797"} /></TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                <TouchableOpacity 
                    style={QuotationAllInStyle.proceedButton}
                    onPress={handleProceed}
                >
                    <Text style={QuotationAllInStyle.proceedButtonText}>Proceed to Details</Text>
                </TouchableOpacity>

                <View style={{ height: 60 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
