import React, { useState, useMemo, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Modal, TouchableWithoutFeedback } from "react-native";
import { Image } from 'expo-image';
import { Ionicons } from "@expo/vector-icons";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { Calendar } from 'react-native-calendars';
import dayjs from "dayjs";
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import Constants from "expo-constants";

import QuotationFormStyle from "../../styles/clientstyles/QuotationFormStyle";
import ModalStyle from "../../styles/componentstyles/ModalStyle";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";

dayjs.extend(isSameOrBefore);

// Utility for fetching images
const getTravelSystemApiBase = () => {
    if (Platform.OS === "web") return "http://localhost:8000";
    const hostUri = Constants.expoConfig?.hostUri || "";
    const host = hostUri.split(":")[0];
    return host ? `http://${host}:8000` : "http://10.0.2.2:8000";
};
const packageApiBase = getTravelSystemApiBase();
const toImageUrl = (source) => {
    if (!source) return "https://via.placeholder.com/800x500?text=No+Image";
    const value = String(source);
    if (value.startsWith("http") || value.startsWith("data:")) return value;
    return `${packageApiBase}/${value.replace(/^\/+/, "")}`;
};

// Time Picker Lists
const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const minutesList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const periodsList = ['AM', 'PM'];

export default function QuotationForm({ route, navigation }) {
    const { user } = useUser();
    const today = dayjs();

    // Data Extraction
    const { pkg, packageId: routePackageId, id: routeId } = route.params || {};
    const finalPackageId = pkg?._id || pkg?.id || routePackageId || routeId;

    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- PACKAGE DATA ---
    const hotels = pkg?.packageHotels || [];
    const airlines = pkg?.packageAirlines || [];
    const fixedItinerary = pkg?.packageItineraries || {};
    const days = pkg?.packageDuration || 1;
    const basePrice = Number(pkg?.packagePricePerPax) || 0;
    const dateRanges = pkg?.packageSpecificDate || [];
    const inclusions = pkg?.packageInclusions || [];
    const exclusions = pkg?.packageExclusions || [];
    const images = pkg?.images || pkg?.packageImages || [];
    const packageType = pkg?.packageType || 'domestic';
    const isInternational = packageType.toLowerCase() === 'international';

    const minBudget = basePrice;
    const maxBudget = Math.max(120000, basePrice);

    // Parse Fixed Itinerary
    const fixedItineraryEntries = useMemo(() => {
        if (!fixedItinerary || typeof fixedItinerary !== 'object') return [];
        return Object.keys(fixedItinerary)
            .sort((a, b) => Number(a.replace('day', '')) - Number(b.replace('day', '')))
            .map((dayKey) => ({
                label: dayKey.replace('day', 'Day '),
                items: fixedItinerary[dayKey] || []
            }));
    }, [fixedItinerary]);

    const itineraryLabels = useMemo(() => {
        return Array.from({ length: days }, (_, index) => `Day ${index + 1}`);
    }, [days]);

    // --- FORM STATES ---
    const [packageCategory, setPackageCategory] = useState("All in Package");
    const [preferredAirlines, setPreferredAirlines] = useState("");
    const [preferredHotels, setPreferredHotels] = useState("");
    const [preferredDate, setPreferredDate] = useState("");
    const [budgetRange, setBudgetRange] = useState([minBudget, maxBudget]);
    const [itineraryNotes, setItineraryNotes] = useState(itineraryLabels.map(() => ""));
    const [additionalComments, setAdditionalComments] = useState("");

    const [travelerType, setTravelerType] = useState('solo');
    const [adultCount, setAdultCount] = useState(2);
    const [childCount, setChildCount] = useState(0);
    const [infantCount, setInfantCount] = useState(0);

    // Flight Details States
    const [flightAirline, setFlightAirline] = useState("");
    const [flightDate, setFlightDate] = useState("");
    const [flightTime, setFlightTime] = useState("");

    const [tempHour, setTempHour] = useState("12");
    const [tempMinute, setTempMinute] = useState("00");
    const [tempPeriod, setTempPeriod] = useState("PM");

    const [errors, setErrors] = useState({});

    // Selected slot capacity (from chosen preferred date). Default to 20 (web limit).
    const [selectedSlotCapacity, setSelectedSlotCapacity] = useState(20);

    const [isHotelModalOpen, setHotelModalOpen] = useState(false);
    const [isAirlineModalOpen, setAirlineModalOpen] = useState(false);
    const [isDateModalOpen, setDateModalOpen] = useState(false);
    const [isFlightDateModalOpen, setFlightDateModalOpen] = useState(false);
    const [isFlightTimeModalOpen, setFlightTimeModalOpen] = useState(false);
    const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);

    // Auto-adjust group minimum
    useEffect(() => {
        if (travelerType === 'group' && adultCount < 2) {
            setAdultCount(2);
        }
    }, [travelerType, adultCount]);

    // Maximum allowed passengers: depends on selected slot capacity (default to 20 if none selected)
    const maxAllowed = useMemo(() => Number(selectedSlotCapacity || 20), [selectedSlotCapacity]);

    const clampTravelerCountsToSlot = (nextLimit) => {
        const limit = Number(nextLimit) || 0;

        if (travelerType === 'solo') {
            setAdultCount(1);
            setChildCount(0);
            setInfantCount(0);
            return;
        }

        let nextAdult = adultCount;
        let nextChild = childCount;
        let nextInfant = infantCount;

        if (nextAdult + nextChild + nextInfant > limit) {
            nextAdult = Math.max(2, Math.min(nextAdult, limit));
            let remaining = Math.max(0, limit - nextAdult);

            nextChild = Math.min(nextChild, remaining);
            remaining -= nextChild;

            nextInfant = Math.min(nextInfant, remaining);
        }

        setAdultCount(nextAdult);
        setChildCount(nextChild);
        setInfantCount(nextInfant);
    };

    const SectionHeader = ({ number, title, titleStyle }) => (
        <View style={QuotationFormStyle.sectionHeaderRow}>
            <View style={QuotationFormStyle.sectionBadge}>
                <Text style={QuotationFormStyle.sectionBadgeText}>{number}</Text>
            </View>
            <Text style={[QuotationFormStyle.sectionHeaderText, titleStyle]}>{title}</Text>
        </View>
    );

    const notesSectionNumber = packageCategory === 'Land Arrangement' ? 5 : 4;


    // --- VALIDATION LOGIC ---
    const validate = () => {
        let newErrors = {};

        const totalTravelers = travelerType === 'solo' ? 1 : Math.max(0, adultCount) + Math.max(0, childCount) + Math.max(0, infantCount);

        if (!totalTravelers || totalTravelers < 1) newErrors.travelers = "Please enter the number of travelers";
        if (totalTravelers > maxAllowed) newErrors.travelers = `Total travelers exceed allowed maximum (${maxAllowed}).`;

        if (packageCategory !== 'Land Arrangement') {
            if (!preferredAirlines.trim() && airlines.length > 0) newErrors.preferredAirlines = "Please provide your preferred airlines";
        }

        if (!preferredHotels.trim()) newErrors.preferredHotels = "Please provide your preferred hotels";
        if (!preferredDate) newErrors.preferredDate = "Please select your preferred date";

        if (packageCategory === 'Land Arrangement') {
            if (!flightAirline.trim()) newErrors.flightAirline = "Please provide your airline";
            if (!flightDate) newErrors.flightDate = "Please select flight date";
            if (!flightTime) newErrors.flightTime = "Please provide flight time";
        }

        const missingNote = itineraryNotes.some(note => !note.trim());
        if (missingNote) newErrors.itineraryNotes = "Please fill out all itinerary notes. Type 'NONE' if no changes.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            Alert.alert("Missing Information", "Please fix the highlighted errors before submitting.");
            return;
        }

        if (!finalPackageId) {
            Alert.alert("Error", "Package ID is missing. Cannot submit quotation.");
            return;
        }

        setIsSubmitting(true);
        try {
            let flightDetails = null;
            if (packageCategory === 'Land Arrangement') {
                flightDetails = { flightAirline, flightDate, flightTime };
            } else {
                flightDetails = { flightAirline: "", flightDate: "", flightTime: "" };
            }

            // Structured traveler count exactly like the web
            const travelersPayload = travelerType === 'solo'
                ? { adult: 1, child: 0, infant: 0 }
                : { adult: adultCount, child: childCount, infant: infantCount };

            const totalTravelers =
                (Number(travelersPayload.adult) || 0) +
                (Number(travelersPayload.child) || 0) +
                (Number(travelersPayload.infant) || 0);

            // The core data object - synced with the backend quotation form fields
            const detailsObject = {
                travelers: travelersPayload,
                travelersCount: totalTravelers,
                preferredAirlines,
                preferredHotels,
                preferredDate,
                budgetRange,
                itineraryNotes,
                additionalComments: additionalComments || "None",
                flightDetails,
                packageCategory,
                arrangementType: packageCategory,
                travelDate: preferredDate,
                preferredDates: preferredDate
            };

            // Send both legacy and synced fields so the current backend version accepts the request.
            const payload = {
                packageId: finalPackageId,
                packageName: pkg?.packageName || pkg?.title || "Tour Package",
                travelDetails: detailsObject,
                quotationDetails: detailsObject
            };

            console.log("📤 Sending Quotation Payload:", JSON.stringify(payload, null, 2));

            await api.post("/quotation/create-quotation", payload, withUserHeader(user?._id));

            setSuccessModalVisible(true);
        } catch (error) {
            const backendError = error.response?.data?.message || error.response?.data?.error || JSON.stringify(error.response?.data) || "Failed to submit request.";
            console.error("❌ Quotation Error Detail:", error.response?.data || error.message);
            Alert.alert("Backend Error", backendError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return dayjs(dateString).format("MMM DD, YYYY");
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView style={QuotationFormStyle.container} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

                <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <Ionicons name="arrow-back" size={20} color="#305797" />
                    <Text style={{ color: "#305797", fontFamily: "Montserrat_600SemiBold", marginLeft: 8 }}>Back</Text>
                </TouchableOpacity>

                {/* 🔥 REMOVED CARD BORDERS HERE */}
                <View style={QuotationFormStyle.headerGroup}>
                    <Text style={QuotationFormStyle.mainTitle}>Package Quotation</Text>
                    <Text style={QuotationFormStyle.subtitle}>Kindly input your preferences and requests so that we can tailor your customized package.</Text>
                </View>

                {/* --- PACKAGE INFO DISPLAY --- */}
                <View style={QuotationFormStyle.infoCard}>

                    {/* 🔥 LIVE SCROLLING EXPO-IMAGES HERE */}
                    {images.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                            {images.map((img, idx) => (
                                <Image
                                    key={idx}
                                    source={toImageUrl(img)}
                                    style={[QuotationFormStyle.coverImage, { width: 280, marginRight: 12 }]}
                                    contentFit="cover"
                                    transition={300}
                                />
                            ))}
                        </ScrollView>
                    )}

                    <View style={QuotationFormStyle.infoRow}>
                        <View style={QuotationFormStyle.infoTag}>
                            <Text style={QuotationFormStyle.infoTagText}>{packageType.toUpperCase()}</Text>
                        </View>
                        <Text style={QuotationFormStyle.packageTitle} numberOfLines={1}>{pkg?.packageName || "Tour Package"}</Text>
                    </View>
                    <Text style={QuotationFormStyle.packageDesc}>{pkg?.packageDescription}</Text>

                    <View style={QuotationFormStyle.listContainer}>
                        <Text style={QuotationFormStyle.listTitle}>Inclusions</Text>
                        {inclusions.length > 0 ? inclusions.map((item, idx) => (
                            <View key={`inc-${idx}`} style={QuotationFormStyle.listItemRow}>
                                <Text style={QuotationFormStyle.listBullet}>•</Text>
                                <Text style={QuotationFormStyle.listItemText}>{item}</Text>
                            </View>
                        )) : <Text style={QuotationFormStyle.listItemText}>No inclusions listed.</Text>}
                    </View>

                    <View style={QuotationFormStyle.listContainer}>
                        <Text style={QuotationFormStyle.listTitle}>Exclusions</Text>
                        {exclusions.length > 0 ? exclusions.map((item, idx) => (
                            <View key={`exc-${idx}`} style={QuotationFormStyle.listItemRow}>
                                <Text style={QuotationFormStyle.listBullet}>•</Text>
                                <Text style={QuotationFormStyle.listItemText}>{item}</Text>
                            </View>
                        )) : <Text style={QuotationFormStyle.listItemText}>No exclusions listed.</Text>}
                    </View>
                </View>

                {/* --- ARRANGEMENT SELECTOR --- */}
                <View style={QuotationFormStyle.section}>
                    <SectionHeader number={1} title="Select Arrangement Type" />

                    <TouchableOpacity
                        style={[QuotationFormStyle.selectionCard, packageCategory === 'All in Package' && QuotationFormStyle.selectionCardActive]}
                        onPress={() => setPackageCategory('All in Package')}
                    >
                        <Text style={QuotationFormStyle.selectionTitle}>All-in Package</Text>
                        <Text style={QuotationFormStyle.selectionDesc}>This selection includes flights, hotel, and tours.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[QuotationFormStyle.selectionCard, packageCategory === 'Land Arrangement' && QuotationFormStyle.selectionCardActive]}
                        onPress={() => setPackageCategory('Land Arrangement')}
                    >
                        <Text style={QuotationFormStyle.selectionTitle}>Land Arrangement</Text>
                        <Text style={QuotationFormStyle.selectionDesc}>This section excludes flights. Best if you have your own tickets.</Text>
                    </TouchableOpacity>
                </View>

                {/* --- TRAVELERS CARD --- */}
                <View style={QuotationFormStyle.section}>
                    <SectionHeader number={2} title={'Select If "Solo Booking" or "Group Booking"'} />
                    <Text style={{ color: '#444', marginTop: 2, marginBottom: 8 }}>Maximum allowed: {maxAllowed} passenger{maxAllowed > 1 ? 's' : ''}</Text>

                    <TouchableOpacity
                        style={[QuotationFormStyle.selectionCard, travelerType === 'solo' && QuotationFormStyle.selectionCardActive]}
                        onPress={() => setTravelerType('solo')}
                    >
                        <Text style={QuotationFormStyle.selectionTitle}>Solo</Text>
                        <Text style={QuotationFormStyle.selectionDesc}>If you are a solo traveler, an additional single supplement rate may apply.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[QuotationFormStyle.selectionCard, travelerType === 'group' && QuotationFormStyle.selectionCardActive, { marginBottom: 10 }]}
                        onPress={() => setTravelerType('group')}
                    >
                        <Text style={QuotationFormStyle.selectionTitle}>Group</Text>
                        <Text style={QuotationFormStyle.selectionDesc}>Group bookings may have different pricing and availability. The maximum pax allowed per booking is 2 or more.</Text>
                    </TouchableOpacity>

                    {travelerType === 'group' && (
                        <View style={{ marginBottom: 20 }}>
                            <View style={QuotationFormStyle.travelerCounterRow}>
                                <Text style={QuotationFormStyle.travelerCounterLabel}>Adult</Text>
                                <View style={QuotationFormStyle.travelerCounterControls}>
                                    <TouchableOpacity style={QuotationFormStyle.travelerCounterBtn} onPress={() => setAdultCount(Math.max(2, adultCount - 1))}>
                                        <Text style={QuotationFormStyle.travelerCounterBtnText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={QuotationFormStyle.travelerCounterValue}>{adultCount}</Text>
                                    <TouchableOpacity
                                        style={QuotationFormStyle.travelerCounterBtn}
                                        onPress={() => {
                                            const currentTotal = adultCount + childCount + infantCount;
                                            if (currentTotal + 1 > maxAllowed) {
                                                Alert.alert('Limit reached', `You can only add up to ${maxAllowed} passengers for the selected date.`);
                                                return;
                                            }
                                            setAdultCount(adultCount + 1);
                                        }}
                                        disabled={(adultCount + childCount + infantCount) >= maxAllowed}
                                    >
                                        <Text style={QuotationFormStyle.travelerCounterBtnText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={QuotationFormStyle.travelerCounterRow}>
                                <Text style={QuotationFormStyle.travelerCounterLabel}>Child</Text>
                                <View style={QuotationFormStyle.travelerCounterControls}>
                                    <TouchableOpacity style={QuotationFormStyle.travelerCounterBtn} onPress={() => setChildCount(Math.max(0, childCount - 1))}>
                                        <Text style={QuotationFormStyle.travelerCounterBtnText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={QuotationFormStyle.travelerCounterValue}>{childCount}</Text>
                                    <TouchableOpacity
                                        style={QuotationFormStyle.travelerCounterBtn}
                                        onPress={() => {
                                            const currentTotal = adultCount + childCount + infantCount;
                                            if (currentTotal + 1 > maxAllowed) {
                                                Alert.alert('Limit reached', `You can only add up to ${maxAllowed} passengers for the selected date.`);
                                                return;
                                            }
                                            setChildCount(childCount + 1);
                                        }}
                                        disabled={(adultCount + childCount + infantCount) >= maxAllowed}
                                    >
                                        <Text style={QuotationFormStyle.travelerCounterBtnText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={QuotationFormStyle.travelerCounterRow}>
                                <Text style={QuotationFormStyle.travelerCounterLabel}>Infant</Text>
                                <View style={QuotationFormStyle.travelerCounterControls}>
                                    <TouchableOpacity style={QuotationFormStyle.travelerCounterBtn} onPress={() => setInfantCount(Math.max(0, infantCount - 1))}>
                                        <Text style={QuotationFormStyle.travelerCounterBtnText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={QuotationFormStyle.travelerCounterValue}>{infantCount}</Text>
                                    <TouchableOpacity
                                        style={QuotationFormStyle.travelerCounterBtn}
                                        onPress={() => {
                                            const currentTotal = adultCount + childCount + infantCount;
                                            if (currentTotal + 1 > maxAllowed) {
                                                Alert.alert('Limit reached', `You can only add up to ${maxAllowed} passengers for the selected date.`);
                                                return;
                                            }
                                            setInfantCount(infantCount + 1);
                                        }}
                                        disabled={(adultCount + childCount + infantCount) >= maxAllowed}
                                    >
                                        <Text style={QuotationFormStyle.travelerCounterBtnText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* --- PREFERRED DETAILS CARD --- */}
                <View style={QuotationFormStyle.section}>
                    <SectionHeader number={3} title="Fill up the required details below" />

                    {packageCategory === 'All in Package' && (
                        <View style={QuotationFormStyle.inputGroup}>
                            <Text style={QuotationFormStyle.inputLabel}>Preferred Airlines <Text style={{ color: 'red' }}>*</Text></Text>
                            <TouchableOpacity
                                style={[QuotationFormStyle.dropdownButton, errors.preferredAirlines && QuotationFormStyle.inputErrorBorder]}
                                onPress={() => setAirlineModalOpen(true)}
                            >
                                <Text style={preferredAirlines ? QuotationFormStyle.dropdownText : QuotationFormStyle.dropdownPlaceholder}>
                                    {preferredAirlines || "Select preferred airline"}
                                </Text>
                                <Ionicons name="chevron-down" size={16} color="#bfbfbf" />
                            </TouchableOpacity>
                            {errors.preferredAirlines && <Text style={QuotationFormStyle.errorText}>{errors.preferredAirlines}</Text>}
                            <Text style={[QuotationFormStyle.helperNote, { color: '#ef4444' }]}>Note: Airfare may increase from the usual inclusion in the package, if you choose an airline other than the fixed one.</Text>
                        </View>
                    )}

                    <View style={QuotationFormStyle.inputGroup}>
                        <Text style={QuotationFormStyle.inputLabel}>Preferred Hotels <Text style={{ color: 'red' }}>*</Text></Text>
                        <TouchableOpacity
                            style={[QuotationFormStyle.dropdownButton, errors.preferredHotels && QuotationFormStyle.inputErrorBorder]}
                            onPress={() => setHotelModalOpen(true)}
                        >
                            <Text style={preferredHotels ? QuotationFormStyle.dropdownText : QuotationFormStyle.dropdownPlaceholder}>
                                {preferredHotels || "Select preferred hotel"}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color="#bfbfbf" />
                        </TouchableOpacity>
                        {errors.preferredHotels && <Text style={QuotationFormStyle.errorText}>{errors.preferredHotels}</Text>}
                        <Text style={[QuotationFormStyle.helperNote, { color: '#ef4444' }]}>Note: Hotel rates may increase if you choose a hotel other than the fixed one. Rates may also increase or decrease depending on the stars of the chosen hotel.</Text>
                    </View>

                    {/* 🔥 UPDATED DATES TO MATCH WEB SELECTOR 🔥 */}
                    <View style={QuotationFormStyle.inputGroup}>
                        <Text style={QuotationFormStyle.inputLabel}>Preferred Travel Dates <Text style={{ color: 'red' }}>*</Text></Text>
                        <TouchableOpacity
                            style={[QuotationFormStyle.dropdownButton, errors.preferredDate && QuotationFormStyle.inputErrorBorder]}
                            onPress={() => setDateModalOpen(true)}
                        >
                            <Text style={preferredDate ? QuotationFormStyle.dropdownText : QuotationFormStyle.dropdownPlaceholder}>
                                {preferredDate || "Select preferred dates"}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color="#bfbfbf" />
                        </TouchableOpacity>
                        {errors.preferredDate && <Text style={QuotationFormStyle.errorText}>{errors.preferredDate}</Text>}
                    </View>

                    <View style={QuotationFormStyle.inputGroup}>
                        <Text style={QuotationFormStyle.inputLabel}>Budget Range (Per Pax) <Text style={{ color: 'red' }}>*</Text></Text>
                        <View style={QuotationFormStyle.budgetRow}>
                            <Text style={QuotationFormStyle.budgetValue}>₱ {budgetRange[0].toLocaleString()}</Text>
                            <Text style={QuotationFormStyle.budgetValue}>₱ {budgetRange[1].toLocaleString()}</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <MultiSlider
                                values={[budgetRange[0], budgetRange[1]]}
                                min={minBudget}
                                max={maxBudget}
                                step={500}
                                sliderLength={280}
                                onValuesChange={setBudgetRange}
                                selectedStyle={{ backgroundColor: '#305797' }}
                                markerStyle={{ backgroundColor: '#305797', width: 16, height: 16 }}
                                unselectedStyle={{ backgroundColor: '#e7ecf7' }}
                            />
                        </View>
                    </View>
                </View>

                {/* --- LAND ARRANGEMENT FLIGHT DETAILS --- */}
                {packageCategory === 'Land Arrangement' && (
                    <View style={QuotationFormStyle.section}>
                        <SectionHeader
                            number={4}
                            title="If you are booking for Land Arrangement, Fill up the required details below"
                            titleStyle={QuotationFormStyle.flightSectionHeaderText}
                        />
                        <Text style={QuotationFormStyle.sectionTitle}>Flight Details</Text>

                        <View style={[QuotationFormStyle.inputGroup, { marginTop: 15 }]}>
                            <Text style={QuotationFormStyle.inputLabel}>Airline <Text style={{ color: 'red' }}>*</Text></Text>
                            <TextInput
                                style={[QuotationFormStyle.textInput, errors.flightAirline && QuotationFormStyle.inputErrorBorder]}
                                placeholder="Enter airline name"
                                value={flightAirline}
                                onChangeText={setFlightAirline}
                            />
                            {errors.flightAirline && <Text style={QuotationFormStyle.errorText}>{errors.flightAirline}</Text>}
                        </View>

                        <View style={QuotationFormStyle.inputGroup}>
                            <Text style={QuotationFormStyle.inputLabel}>Flight Date <Text style={{ color: 'red' }}>*</Text></Text>
                            <TouchableOpacity
                                style={[QuotationFormStyle.dropdownButton, errors.flightDate && QuotationFormStyle.inputErrorBorder]}
                                onPress={() => setFlightDateModalOpen(true)}
                            >
                                <Text style={flightDate ? QuotationFormStyle.dropdownText : QuotationFormStyle.dropdownPlaceholder}>
                                    {flightDate || "Select flight date"}
                                </Text>
                                <Ionicons name="calendar-outline" size={16} color="#bfbfbf" />
                            </TouchableOpacity>
                            {errors.flightDate && <Text style={QuotationFormStyle.errorText}>{errors.flightDate}</Text>}
                        </View>

                        <View style={QuotationFormStyle.inputGroup}>
                            <Text style={QuotationFormStyle.inputLabel}>Flight Time <Text style={{ color: 'red' }}>*</Text></Text>
                            <TouchableOpacity
                                style={[QuotationFormStyle.dropdownButton, errors.flightTime && QuotationFormStyle.inputErrorBorder]}
                                onPress={() => setFlightTimeModalOpen(true)}
                            >
                                <Text style={flightTime ? QuotationFormStyle.dropdownText : QuotationFormStyle.dropdownPlaceholder}>
                                    {flightTime || "Select flight time"}
                                </Text>
                                <Ionicons name="time-outline" size={16} color="#bfbfbf" />
                            </TouchableOpacity>
                            {errors.flightTime && <Text style={QuotationFormStyle.errorText}>{errors.flightTime}</Text>}
                        </View>

                        <View style={QuotationFormStyle.flightNoteBox}>
                            <Text style={QuotationFormStyle.flightNoteText}>
                                Note: Please provide your flight details. This will help us coordinate your airport transfers and ensure a seamless experience. If you haven't booked your flights yet, please provide your estimated flight schedule. Lastly, make sure that your chosen travel date is aligned to your flight schedule.
                            </Text>
                        </View>
                    </View>
                )}

                {/* --- FIXED ITINERARY & NOTES --- */}
                <View style={QuotationFormStyle.section}>
                    <Text style={QuotationFormStyle.sectionTitle}>Fixed Itinerary</Text>
                    <Text style={QuotationFormStyle.sectionSubtitle}>The following is a list of fixed activities for your trip.</Text>

                    {fixedItineraryEntries.length > 0 && (
                        <View style={{ marginBottom: 25 }}>
                            <View style={{ marginTop: 10 }}>
                                {fixedItineraryEntries.map((entry) => (
                                    <View key={entry.label} style={QuotationFormStyle.itineraryDayBox}>
                                        <Text style={QuotationFormStyle.itineraryDayTitle}>{entry.label}</Text>
                                        {entry.items.map((item, idx) => (
                                            <View key={idx} style={QuotationFormStyle.listItemRow}>
                                                <Text style={QuotationFormStyle.listBullet}>•</Text>
                                                <Text style={QuotationFormStyle.listItemText}>
                                                    {typeof item === 'string' ? item : item.activity}
                                                    {item.isOptional && item.optionalActivity && `\nOptional: ${item.optionalActivity} ${item.optionalPrice ? `(₱${item.optionalPrice.toLocaleString()})` : ''}`}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* --- ITINERARY NOTES + ADDITIONAL COMMENTS --- */}
                <View style={QuotationFormStyle.section}>
                    <SectionHeader number={notesSectionNumber} title="Provide comments or details about the itinerary for possible changes" />
                    <Text style={[QuotationFormStyle.sectionTitle, { marginTop: 6 }]}>Itinerary Notes</Text>
                    <Text style={[QuotationFormStyle.helperNote, { marginBottom: 18, marginTop: 2 }]}>Provide any additional information or modifications you would like to make to the itinerary.</Text>

                    {itineraryLabels.map((label, index) => (
                        <View key={index} style={QuotationFormStyle.inputGroup}>
                            <Text style={QuotationFormStyle.inputLabel}>{label}</Text>
                            <TextInput
                                style={[QuotationFormStyle.textInput, QuotationFormStyle.textArea, errors.itineraryNotes && !itineraryNotes[index].trim() && QuotationFormStyle.inputErrorBorder]}
                                placeholder={`Notes for ${label.toLowerCase()}. Type "NONE" if no changes`}
                                multiline
                                value={itineraryNotes[index]}
                                onChangeText={(text) => {
                                    const updated = [...itineraryNotes];
                                    updated[index] = text;
                                    setItineraryNotes(updated);
                                }}
                            />
                        </View>
                    ))}
                    {errors.itineraryNotes && <Text style={[QuotationFormStyle.errorText, { marginTop: -10, marginBottom: 15 }]}>{errors.itineraryNotes}</Text>}

                    <Text style={[QuotationFormStyle.helperNote, { color: '#ef4444', marginTop: 4, marginBottom: 14 }]}>Note: If you wish to not have any changes in the following Itinerary, kindly type "NONE" in the fields of the Itinerary notes.</Text>
                    <Text style={[QuotationFormStyle.inputLabel, { marginTop: 4, marginBottom: 8 }]}>Additional Comments</Text>
                    <TextInput
                        style={[QuotationFormStyle.textInput, QuotationFormStyle.textArea]}
                        placeholder="Anything else we should know?"
                        multiline
                        value={additionalComments}
                        onChangeText={setAdditionalComments}
                    />

                    <TouchableOpacity
                        style={QuotationFormStyle.submitButton}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={QuotationFormStyle.submitButtonText}>Submit Request</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* ================= MODALS FOR SELECTORS ================= */}

            {/* AIRLINE MODAL */}
            <Modal visible={isAirlineModalOpen} transparent animationType="fade">
                <TouchableOpacity style={ModalStyle.modalOverlay} activeOpacity={1} onPress={() => setAirlineModalOpen(false)}>
                    <TouchableWithoutFeedback>
                        <View style={[ModalStyle.modalBox, { width: '85%', padding: 0 }]}>
                            <Text style={{ textAlign: 'center', fontSize: 16, fontFamily: 'Montserrat_700Bold', color: '#305797', marginVertical: 15 }}>Select Airline</Text>
                            {airlines.map((a, i) => (
                                <TouchableOpacity key={i} style={{ padding: 15, borderTopWidth: 1, borderColor: '#f0f0f0' }} onPress={() => { setPreferredAirlines(a.name); setAirlineModalOpen(false); }}>
                                    <Text style={{ fontFamily: 'Roboto_400Regular', color: '#333', textAlign: 'center' }}>{a.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            {/* HOTEL MODAL */}
            <Modal visible={isHotelModalOpen} transparent animationType="fade">
                <TouchableOpacity style={ModalStyle.modalOverlay} activeOpacity={1} onPress={() => setHotelModalOpen(false)}>
                    <TouchableWithoutFeedback>
                        <View style={[ModalStyle.modalBox, { width: '85%', padding: 0, maxHeight: '70%' }]}>
                            <Text style={{ textAlign: 'center', fontSize: 16, fontFamily: 'Montserrat_700Bold', color: '#305797', marginVertical: 15 }}>Select Hotel</Text>
                            <ScrollView>
                                {hotels.map((h, i) => (
                                    <TouchableOpacity key={i} style={{ padding: 15, borderTopWidth: 1, borderColor: '#f0f0f0' }} onPress={() => { setPreferredHotels(h.name); setHotelModalOpen(false); }}>
                                        <Text style={{ fontFamily: 'Roboto_400Regular', color: '#333', textAlign: 'center' }}>{h.name} ({h.stars} Star)</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            <Modal visible={isDateModalOpen} transparent animationType="fade">
                <TouchableOpacity style={ModalStyle.modalOverlay} activeOpacity={1} onPress={() => setDateModalOpen(false)}>
                    <TouchableWithoutFeedback>
                        <View style={[ModalStyle.modalBox, { width: '90%', padding: 0, maxHeight: '70%' }]}>
                            <Text style={{ textAlign: 'center', fontSize: 16, fontFamily: 'Montserrat_700Bold', color: '#305797', marginVertical: 15 }}>Select Travel Dates</Text>
                            <ScrollView>
                                {dateRanges.length === 0 ? (
                                    <Text style={{ textAlign: 'center', padding: 20, color: '#888' }}>No dates available.</Text>
                                ) : (
                                    dateRanges
                                        .filter((range) => dayjs(range.startdaterange).isAfter(today, 'day'))
                                        .map((range, i) => {
                                            const rangeString = `${formatDate(range.startdaterange)} - ${formatDate(range.enddaterange)}`;
                                            const hasSlots = Number(range.slots) > 0;

                                            return (
                                                <TouchableOpacity
                                                    key={i}
                                                    style={{ padding: 15, borderTopWidth: 1, borderColor: '#f0f0f0', backgroundColor: hasSlots ? '#fff' : '#f9f9f9', opacity: hasSlots ? 1 : 0.5 }}
                                                    disabled={!hasSlots}
                                                    onPress={() => {
                                                        const nextSlotCapacity = Number(range.slots) || 0;
                                                        setPreferredDate(`${rangeString}`);
                                                        // Save the numeric slot capacity for enforcement and trim traveler counts if needed.
                                                        setSelectedSlotCapacity(nextSlotCapacity);
                                                        clampTravelerCountsToSlot(nextSlotCapacity);
                                                        setDateModalOpen(false);
                                                    }}
                                                >
                                                    <Text style={{ fontFamily: 'Roboto_400Regular', color: '#333', textAlign: 'center' }}>{rangeString}</Text>
                                                    <Text style={{ fontFamily: 'Roboto_400Regular', color: hasSlots ? '#305797' : '#e74c3c', textAlign: 'center', fontSize: 12, marginTop: 4 }}>
                                                        {hasSlots ? `Slots Available: ${range.slots}` : 'Fully Booked'}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })
                                )}
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            {/* FLIGHT DATE MODAL */}
            <Modal visible={isFlightDateModalOpen} transparent animationType="fade">
                <TouchableOpacity style={ModalStyle.modalOverlay} activeOpacity={1} onPress={() => setFlightDateModalOpen(false)}>
                    <TouchableWithoutFeedback>
                        <View style={[ModalStyle.modalBox, { width: '90%', padding: 15 }]}>
                            <Text style={{ textAlign: 'center', fontSize: 16, fontFamily: 'Montserrat_700Bold', color: '#305797', marginVertical: 15 }}>Select Flight Date</Text>
                            <Calendar
                                onDayPress={(day) => { setFlightDate(day.dateString); setFlightDateModalOpen(false); }}
                                theme={{ selectedDayBackgroundColor: '#305797', todayTextColor: '#305797', arrowColor: '#305797' }}
                                minDate={new Date().toISOString().split('T')[0]}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            {/* FLIGHT TIME MODAL */}
            <Modal visible={isFlightTimeModalOpen} transparent animationType="fade">
                <TouchableOpacity style={ModalStyle.modalOverlay} activeOpacity={1} onPress={() => setFlightTimeModalOpen(false)}>
                    <TouchableWithoutFeedback>
                        <View style={[ModalStyle.modalBox, { width: '85%', padding: 20 }]}>
                            <Text style={{ textAlign: 'center', fontSize: 16, fontFamily: 'Montserrat_700Bold', color: '#305797', marginBottom: 15 }}>Select Flight Time</Text>

                            <View style={{ flexDirection: 'row', height: 180, justifyContent: 'space-between' }}>
                                {/* Hours Column */}
                                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                                    {hoursList.map(h => (
                                        <TouchableOpacity key={`h-${h}`} onPress={() => setTempHour(h)} style={{ paddingVertical: 10, backgroundColor: tempHour === h ? '#f0f5ff' : 'transparent', borderRadius: 6 }}>
                                            <Text style={{ textAlign: 'center', fontFamily: tempHour === h ? 'Montserrat_600SemiBold' : 'Roboto_400Regular', color: tempHour === h ? '#305797' : '#333' }}>{h}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {/* Minutes Column */}
                                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                                    {minutesList.map(m => (
                                        <TouchableOpacity key={`m-${m}`} onPress={() => setTempMinute(m)} style={{ paddingVertical: 10, backgroundColor: tempMinute === m ? '#f0f5ff' : 'transparent', borderRadius: 6 }}>
                                            <Text style={{ textAlign: 'center', fontFamily: tempMinute === m ? 'Montserrat_600SemiBold' : 'Roboto_400Regular', color: tempMinute === m ? '#305797' : '#333' }}>{m}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {/* AM/PM Column */}
                                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                                    {periodsList.map(p => (
                                        <TouchableOpacity key={`p-${p}`} onPress={() => setTempPeriod(p)} style={{ paddingVertical: 10, backgroundColor: tempPeriod === p ? '#f0f5ff' : 'transparent', borderRadius: 6 }}>
                                            <Text style={{ textAlign: 'center', fontFamily: tempPeriod === p ? 'Montserrat_600SemiBold' : 'Roboto_400Regular', color: tempPeriod === p ? '#305797' : '#333' }}>{p}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            <TouchableOpacity
                                style={[QuotationFormStyle.submitButton, { height: 42, marginTop: 15 }]}
                                onPress={() => {
                                    setFlightTime(`${tempHour}:${tempMinute} ${tempPeriod}`);
                                    setFlightTimeModalOpen(false);
                                }}
                            >
                                <Text style={QuotationFormStyle.submitButtonText}>Confirm Time</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            {/* 🔥 NEW SUCCESS MODAL (WEB DESIGN MATCH) 🔥 */}
            <Modal visible={isSuccessModalVisible} transparent animationType="fade">
                <View style={ModalStyle.modalOverlay}>
                    <View style={[ModalStyle.modalBox, { width: '90%', padding: 25, alignItems: 'center', borderRadius: 12 }]}>
                        <TouchableOpacity
                            style={{ position: 'absolute', top: 15, right: 15, padding: 5 }}
                            onPress={() => {
                                setSuccessModalVisible(false);
                                navigation.navigate("userquotations");
                            }}
                        >
                            <Ionicons name="close" size={24} color="#888" />
                        </TouchableOpacity>

                        <Text style={{ fontFamily: "Montserrat_700Bold", fontSize: 22, color: "#305797", textAlign: "center", marginTop: 20, marginBottom: 12 }}>
                            Quotation Request Submitted
                        </Text>

                        <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 14, color: "#555", textAlign: "center", lineHeight: 22, marginBottom: 25, paddingHorizontal: 10 }}>
                            Your package quotation request has been submitted successfully. Please wait for your quotation to be generated.
                        </Text>

                        <TouchableOpacity
                            style={[QuotationFormStyle.submitButton, { width: '80%', height: 45, marginTop: 0 }]}
                            onPress={() => {
                                setSuccessModalVisible(false);
                                navigation.navigate("userquotations");
                            }}
                        >
                            <Text style={QuotationFormStyle.submitButtonText}>Continue</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>

        </KeyboardAvoidingView>
    );
}