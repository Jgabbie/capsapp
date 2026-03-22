import React, { useState, useMemo, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

import DestinationStyles from "../../styles/clientstyles/DestinationStyles";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { api } from "../../utils/api";
import { useUser } from "../../context/UserContext";

export default function QuotationForm({ route, navigation }) {
    const { user } = useUser();
    const { pkg, isInternational, arrangement, selectedDate } = route.params;
    
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- FORM STATES ---
    const [travelers, setTravelers] = useState("1");
    const [airline, setAirline] = useState(arrangement === 'Land Arrangement' ? "NONE" : "");
    const [hotel, setHotel] = useState("");
    const [budgetRange, setBudgetRange] = useState([pkg.packagePricePerPax || 10000, 100000]);
    const [additionalComments, setAdditionalComments] = useState("");
    
    // Dynamic Itinerary Notes (Creates 1 box per day)
    const packageDays = pkg.packageDuration || 1;
    const [itineraryNotes, setItineraryNotes] = useState(
        Array.from({ length: packageDays }, () => "")
    );

    const [errors, setErrors] = useState({});

    // --- VALIDATION LOGIC (From Web) ---
    const validate = () => {
        let newErrors = {};
        if (!travelers || parseInt(travelers) < 1) newErrors.travelers = "Required";
        if (arrangement !== 'Land Arrangement' && !airline.trim()) newErrors.airline = "Required";
        if (!hotel.trim()) newErrors.hotel = "Required";
        
        const missingNote = itineraryNotes.some(note => !note.trim());
        if (missingNote) newErrors.itinerary = "Please fill all itinerary notes (or type 'NONE')";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            Alert.alert("Missing Information", "Please fill out all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                packageId: pkg.id,
                packageName: pkg.title,
                travelDetails: {
                    arrangementType: arrangement || "Customized",
                    travelDate: selectedDate || "To be discussed",
                    travelers: parseInt(travelers),
                    preferredAirlines: airline,
                    preferredHotels: hotel,
                    budgetRange: budgetRange,
                    itineraryNotes: itineraryNotes,
                    additionalComments: additionalComments
                }
            };

            await api.post("/quotation/create-quotation", payload);
            
            Alert.alert("Success", "Your quotation request has been submitted!", [
                { text: "OK", onPress: () => navigation.navigate("home") }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to submit request. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateNote = (text, index) => {
        const updated = [...itineraryNotes];
        updated[index] = text;
        setItineraryNotes(updated);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView style={DestinationStyles.container} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                    <Ionicons name="arrow-back" size={20} color="#305797" />
                    <Text style={{ color: "#305797", fontWeight: "600", marginLeft: 5 }}>Back to Package</Text>
                </TouchableOpacity>

                <View style={DestinationStyles.modalBox}>
                    <Text style={DestinationStyles.modalTitle}>Request Quotation</Text>
                    <Text style={DestinationStyles.quotationIntro}>For: {pkg.title} ({arrangement || "Domestic"})</Text>

                    {/* Travelers */}
                    <Text style={DestinationStyles.quotationLabel}>NUMBER OF TRAVELERS</Text>
                    <TextInput 
                        style={[DestinationStyles.quotationInput, errors.travelers && { borderColor: 'red' }]}
                        keyboardType="numeric"
                        value={travelers}
                        onChangeText={setTravelers}
                    />

                    {/* Airline (Hide if Land Arrangement) */}
                    {arrangement !== 'Land Arrangement' && (
                        <>
                            <Text style={[DestinationStyles.quotationLabel, { marginTop: 15 }]}>PREFERRED AIRLINES</Text>
                            <TextInput 
                                style={[DestinationStyles.quotationInput, errors.airline && { borderColor: 'red' }]}
                                placeholder="e.g. Cebu Pacific, PAL"
                                value={airline}
                                onChangeText={setAirline}
                            />
                        </>
                    )}

                    {/* Hotel */}
                    <Text style={[DestinationStyles.quotationLabel, { marginTop: 15 }]}>PREFERRED HOTEL</Text>
                    <TextInput 
                        style={[DestinationStyles.quotationInput, errors.hotel && { borderColor: 'red' }]}
                        placeholder="e.g. 3-Star Hotel in City Center"
                        value={hotel}
                        onChangeText={setHotel}
                    />

                    {/* Budget Range */}
                    <Text style={[DestinationStyles.quotationLabel, { marginTop: 20 }]}>BUDGET RANGE (PER PAX)</Text>
                    <View style={DestinationStyles.quotationBudgetValues}>
                        <Text style={{ color: '#305797', fontWeight: 'bold' }}>₱{budgetRange[0].toLocaleString()}</Text>
                        <Text style={{ color: '#305797', fontWeight: 'bold' }}>₱{budgetRange[1].toLocaleString()}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <MultiSlider
                            values={[budgetRange[0], budgetRange[1]]}
                            min={5000}
                            max={150000}
                            step={1000}
                            sliderLength={280}
                            onValuesChange={setBudgetRange}
                            selectedStyle={{ backgroundColor: '#305797' }}
                            markerStyle={{ backgroundColor: '#305797' }}
                        />
                    </View>
                </View>

                {/* Itinerary Notes */}
                <Text style={DestinationStyles.sectionTitle}>Itinerary Customization</Text>
                <Text style={{ fontSize: 12, color: '#777', marginBottom: 10 }}>Type "NONE" for days you don't want to change.</Text>
                
                {itineraryNotes.map((note, index) => (
                    <View key={index} style={{ marginBottom: 15 }}>
                        <Text style={DestinationStyles.quotationLabel}>DAY {index + 1} NOTES</Text>
                        <TextInput 
                            style={[DestinationStyles.quotationTextArea, errors.itinerary && !note && { borderColor: 'red' }]}
                            placeholder={`Request changes for Day ${index + 1}...`}
                            multiline
                            value={note}
                            onChangeText={(val) => updateNote(val, index)}
                        />
                    </View>
                ))}

                <Text style={[DestinationStyles.quotationLabel, { marginTop: 10 }]}>ADDITIONAL COMMENTS</Text>
                <TextInput 
                    style={DestinationStyles.quotationTextArea}
                    placeholder="Any other special requests?"
                    multiline
                    value={additionalComments}
                    onChangeText={setAdditionalComments}
                />

                <TouchableOpacity 
                    style={[DestinationStyles.primaryButton, { marginTop: 30, paddingVertical: 15, marginLeft: 0 }]} 
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={DestinationStyles.primaryText}>Submit Request</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}