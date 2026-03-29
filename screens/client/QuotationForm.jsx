import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image, Modal, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { Calendar } from 'react-native-calendars';
import dayjs from "dayjs";
import Constants from "expo-constants";

import QuotationFormStyle from "../../styles/clientstyles/QuotationFormStyle";
import ModalStyle from "../../styles/componentstyles/ModalStyle";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";

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
const hoursList = Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0'));
const minutesList = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'));
const periodsList = ['AM', 'PM'];

export default function QuotationForm({ route, navigation }) {
    const { user } = useUser();
    
    // 🔥 UPDATED DATA EXTRACTION: Catches the ID no matter how it was passed
    const { pkg, packageId: routePackageId, id: routeId } = route.params || {};
    const finalPackageId = pkg?._id || pkg?.id || routePackageId || routeId;
    
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- DATA EXTRACTION (Matches Web) ---
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
    const [travelers, setTravelers] = useState("1");
    const [preferredAirlines, setPreferredAirlines] = useState("");
    const [preferredHotels, setPreferredHotels] = useState("");
    const [preferredDate, setPreferredDate] = useState(""); 
    const [budgetRange, setBudgetRange] = useState([minBudget, maxBudget]);
    const [itineraryNotes, setItineraryNotes] = useState(itineraryLabels.map(() => ""));
    const [additionalComments, setAdditionalComments] = useState("");
    
    // Flight Details States
    const [flightAirline, setFlightAirline] = useState("");
    const [flightDate, setFlightDate] = useState("");
    const [flightTime, setFlightTime] = useState("");
    
    // Temp States for Custom Time Picker
    const [tempHour, setTempHour] = useState("12");
    const [tempMinute, setTempMinute] = useState("00");
    const [tempPeriod, setTempPeriod] = useState("PM");

    const [errors, setErrors] = useState({});

    // Dropdown Modal States
    const [isHotelModalOpen, setHotelModalOpen] = useState(false);
    const [isAirlineModalOpen, setAirlineModalOpen] = useState(false);
    const [isDateModalOpen, setDateModalOpen] = useState(false);
    
    // NEW: Flight Modal States
    const [isFlightDateModalOpen, setFlightDateModalOpen] = useState(false);
    const [isFlightTimeModalOpen, setFlightTimeModalOpen] = useState(false);

    // --- VALIDATION LOGIC ---
    const validate = () => {
        let newErrors = {};
        
        if (!travelers || parseInt(travelers) < 1) newErrors.travelers = "Please enter the number of travelers";
        
        if (packageCategory !== 'Land Arrangement') {
            if (!preferredAirlines.trim()) newErrors.preferredAirlines = "Please provide your preferred airlines";
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

    // 🔥 UPDATED HANDLE SUBMIT
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

            // 🔥 CRITICAL FIX: The payload structure now perfectly matches the backend!
            const payload = {
                packageId: finalPackageId,
                packageName: pkg?.packageName || "Custom Tour Package", // Backend explicitly requires this!
                travelDetails: { // Changed from 'quotationDetails' to 'travelDetails'
                    travelers: parseInt(travelers) || 1,
                    preferredAirlines,
                    preferredHotels,
                    budgetRange,
                    itineraryNotes,
                    additionalComments: additionalComments || "None",
                    flightDetails,
                    packageCategory,
                    preferredDate
                }
            };

            console.log("📤 Sending Quotation Payload:", JSON.stringify(payload, null, 2));

            await api.post("/quotation/create-quotation", payload, withUserHeader(user?._id));
            
            Alert.alert(
                "Quotation Request Submitted", 
                "Your package quotation request has been submitted successfully. Please wait for your quotation to be generated.", 
                [{ text: "OK", onPress: () => navigation.navigate("home") }]
            );
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

                <View style={[QuotationFormStyle.section, QuotationFormStyle.sectionGradient]}>
                    <Text style={QuotationFormStyle.sectionTitle}>Package Quotation</Text>
                    <Text style={QuotationFormStyle.sectionSubtitle}>Kindly input your preferences and requests so that we can tailor your customized package.</Text>
                </View>

                {/* --- PACKAGE INFO DISPLAY --- */}
                <View style={QuotationFormStyle.infoCard}>
                    {images.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                            {images.map((img, idx) => (
                                <Image key={idx} source={{ uri: toImageUrl(img) }} style={[QuotationFormStyle.coverImage, { width: 280, marginRight: 10 }]} />
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
                    <Text style={QuotationFormStyle.selectionLabel}>Select Arrangement Type</Text>
                    
                    <TouchableOpacity 
                        style={[QuotationFormStyle.selectionCard, packageCategory === 'All in Package' && QuotationFormStyle.selectionCardActive]}
                        onPress={() => setPackageCategory('All in Package')}
                    >
                        <Text style={QuotationFormStyle.selectionTitle}>All-in Package</Text>
                        <Text style={QuotationFormStyle.selectionDesc}>Includes flights, hotel, and tours.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[QuotationFormStyle.selectionCard, packageCategory === 'Land Arrangement' && QuotationFormStyle.selectionCardActive]}
                        onPress={() => setPackageCategory('Land Arrangement')}
                    >
                        <Text style={QuotationFormStyle.selectionTitle}>Land Arrangement</Text>
                        <Text style={QuotationFormStyle.selectionDesc}>Excludes flights. Best if you have your own tickets.</Text>
                    </TouchableOpacity>
                </View>

                {/* --- FORM FIELDS --- */}
                <View style={QuotationFormStyle.section}>
                    
                    <View style={QuotationFormStyle.inputGroup}>
                        <Text style={QuotationFormStyle.inputLabel}>Number of Travelers <Text style={{color: 'red'}}>*</Text></Text>
                        <TextInput 
                            style={[QuotationFormStyle.textInput, errors.travelers && QuotationFormStyle.inputErrorBorder]}
                            keyboardType="numeric"
                            value={travelers}
                            onChangeText={setTravelers}
                        />
                        {errors.travelers && <Text style={QuotationFormStyle.errorText}>{errors.travelers}</Text>}
                        <Text style={QuotationFormStyle.helperNote}>Note: If you are a solo traveler, an additional single supplement rate may apply.</Text>
                    </View>

                    {packageCategory === 'All in Package' && (
                        <View style={QuotationFormStyle.inputGroup}>
                            <Text style={QuotationFormStyle.inputLabel}>Preferred Airlines <Text style={{color: 'red'}}>*</Text></Text>
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
                            <Text style={QuotationFormStyle.helperNote}>Note: Airfare may increase from the usual inclusion in the package, if you choose an airline other than the fixed one.</Text>
                        </View>
                    )}

                    <View style={QuotationFormStyle.inputGroup}>
                        <Text style={QuotationFormStyle.inputLabel}>Preferred Hotels <Text style={{color: 'red'}}>*</Text></Text>
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
                        <Text style={QuotationFormStyle.helperNote}>Note: Hotel rates may increase if you choose a hotel other than the fixed one.</Text>
                    </View>

                    <View style={QuotationFormStyle.inputGroup}>
                        <Text style={QuotationFormStyle.inputLabel}>Preferred Travel Dates <Text style={{color: 'red'}}>*</Text></Text>
                        <TouchableOpacity 
                            style={[QuotationFormStyle.dropdownButton, errors.preferredDate && QuotationFormStyle.inputErrorBorder]}
                            onPress={() => setDateModalOpen(true)}
                        >
                            <Text style={preferredDate ? QuotationFormStyle.dropdownText : QuotationFormStyle.dropdownPlaceholder}>
                                {preferredDate || "Select preferred dates"}
                            </Text>
                            {isInternational ? <Ionicons name="chevron-down" size={16} color="#bfbfbf" /> : <Ionicons name="calendar-outline" size={16} color="#bfbfbf" />}
                        </TouchableOpacity>
                        {errors.preferredDate && <Text style={QuotationFormStyle.errorText}>{errors.preferredDate}</Text>}
                    </View>

                    <View style={QuotationFormStyle.inputGroup}>
                        <Text style={QuotationFormStyle.inputLabel}>Budget Range (Per Pax) <Text style={{color: 'red'}}>*</Text></Text>
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
                        <Text style={QuotationFormStyle.sectionTitle}>Flight Details</Text>
                        
                        <View style={QuotationFormStyle.flightNoteBox}>
                            <Text style={QuotationFormStyle.flightNoteText}>
                                Note: Please provide your flight details. This will help us coordinate your airport transfers and ensure a seamless experience. Make sure your chosen travel date is aligned to your flight schedule.
                            </Text>
                        </View>

                        <View style={[QuotationFormStyle.inputGroup, { marginTop: 15 }]}>
                            <Text style={QuotationFormStyle.inputLabel}>Airline <Text style={{color: 'red'}}>*</Text></Text>
                            <TextInput 
                                style={[QuotationFormStyle.textInput, errors.flightAirline && QuotationFormStyle.inputErrorBorder]}
                                placeholder="Enter airline name"
                                value={flightAirline}
                                onChangeText={setFlightAirline}
                            />
                            {errors.flightAirline && <Text style={QuotationFormStyle.errorText}>{errors.flightAirline}</Text>}
                        </View>

                        <View style={QuotationFormStyle.inputGroup}>
                            <Text style={QuotationFormStyle.inputLabel}>Flight Date <Text style={{color: 'red'}}>*</Text></Text>
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
                            <Text style={QuotationFormStyle.inputLabel}>Flight Time <Text style={{color: 'red'}}>*</Text></Text>
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
                    </View>
                )}

                {/* --- FIXED ITINERARY & NOTES --- */}
                <View style={QuotationFormStyle.section}>
                    {fixedItineraryEntries.length > 0 && (
                        <View style={{ marginBottom: 25 }}>
                            <Text style={QuotationFormStyle.sectionTitle}>Fixed Itinerary</Text>
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

                    <Text style={QuotationFormStyle.sectionTitle}>Itinerary Notes</Text>
                    <Text style={[QuotationFormStyle.helperNote, { marginBottom: 15, marginTop: 0 }]}>Type "NONE" if you wish to not have any changes for that day.</Text>
                    
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
                    {errors.itineraryNotes && <Text style={[QuotationFormStyle.errorText, {marginTop: -10, marginBottom: 15}]}>{errors.itineraryNotes}</Text>}
                </View>

                {/* --- ADDITIONAL COMMENTS --- */}
                <View style={QuotationFormStyle.section}>
                    <Text style={QuotationFormStyle.inputLabel}>Additional Comments</Text>
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

            {/* DATE MODAL (Dynamic: Calendar for Domestic, List for International) */}
            <Modal visible={isDateModalOpen} transparent animationType="fade">
                <TouchableOpacity style={ModalStyle.modalOverlay} activeOpacity={1} onPress={() => setDateModalOpen(false)}>
                    <TouchableWithoutFeedback>
                        <View style={[ModalStyle.modalBox, { width: '90%', padding: 15, maxHeight: '70%' }]}>
                            <Text style={{ textAlign: 'center', fontSize: 16, fontFamily: 'Montserrat_700Bold', color: '#305797', marginVertical: 15 }}>Select Travel Dates</Text>
                            
                            {isInternational ? (
                                <ScrollView>
                                    {dateRanges.map((range, i) => {
                                        const rangeString = `${formatDate(range.startdaterange)} - ${formatDate(range.enddaterange)}`;
                                        return (
                                            <TouchableOpacity key={i} style={{ padding: 15, borderTopWidth: 1, borderColor: '#f0f0f0' }} onPress={() => { setPreferredDate(`${rangeString} (Slots: ${range.slots})`); setDateModalOpen(false); }}>
                                                <Text style={{ fontFamily: 'Roboto_400Regular', color: '#333', textAlign: 'center' }}>{rangeString}</Text>
                                                <Text style={{ fontFamily: 'Roboto_400Regular', color: '#777', textAlign: 'center', fontSize: 12 }}>Slots: {range.slots}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            ) : (
                                <Calendar 
                                    onDayPress={(day) => { setPreferredDate(day.dateString); setDateModalOpen(false); }} 
                                    theme={{ selectedDayBackgroundColor: '#305797', todayTextColor: '#305797', arrowColor: '#305797' }}
                                    minDate={new Date().toISOString().split('T')[0]} // Prevent past dates
                                />
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            {/* FLIGHT DATE MODAL (Always Calendar) */}
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

            {/* FLIGHT TIME MODAL (Custom Scrolling Picker mimicking Ant Design) */}
            <Modal visible={isFlightTimeModalOpen} transparent animationType="fade">
                <TouchableOpacity style={ModalStyle.modalOverlay} activeOpacity={1} onPress={() => setFlightTimeModalOpen(false)}>
                    <TouchableWithoutFeedback>
                        <View style={[ModalStyle.modalBox, { width: '85%', padding: 20 }]}>
                            <Text style={{ textAlign: 'center', fontSize: 16, fontFamily: 'Montserrat_700Bold', color: '#305797', marginBottom: 15 }}>Select Flight Time</Text>
                            
                            <View style={{ flexDirection: 'row', height: 180, justifyContent: 'space-between' }}>
                                {/* Hours Column */}
                                <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
                                    {hoursList.map(h => (
                                        <TouchableOpacity key={`h-${h}`} onPress={() => setTempHour(h)} style={{ paddingVertical: 10, backgroundColor: tempHour === h ? '#f0f5ff' : 'transparent', borderRadius: 6 }}>
                                            <Text style={{ textAlign: 'center', fontFamily: tempHour === h ? 'Montserrat_600SemiBold' : 'Roboto_400Regular', color: tempHour === h ? '#305797' : '#333' }}>{h}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                
                                {/* Minutes Column */}
                                <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
                                    {minutesList.map(m => (
                                        <TouchableOpacity key={`m-${m}`} onPress={() => setTempMinute(m)} style={{ paddingVertical: 10, backgroundColor: tempMinute === m ? '#f0f5ff' : 'transparent', borderRadius: 6 }}>
                                            <Text style={{ textAlign: 'center', fontFamily: tempMinute === m ? 'Montserrat_600SemiBold' : 'Roboto_400Regular', color: tempMinute === m ? '#305797' : '#333' }}>{m}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {/* AM/PM Column */}
                                <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
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

        </KeyboardAvoidingView>
    );
}