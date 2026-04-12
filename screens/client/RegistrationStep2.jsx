import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Image, TouchableOpacity, SafeAreaView, StatusBar, Modal, Alert } from 'react-native';
import RegistrationFormStyle from '../../styles/clientstyles/RegistrationFormStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import { useUser } from '../../context/UserContext'; 

const formatLongDate = (dateVal) => {
    if (!dateVal) return "";
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateVal).toLocaleDateString('en-US', options);
};

export default function RegistrationStep2({ route, navigation }) {
    const { user } = useUser();
    const { setupData, travelerUploads, passengers, leadGuestInfo } = route.params || {};

    const currentDateLong = formatLongDate(new Date());

    // --- State Management ---
    const [medicalData, setMedicalData] = useState({
        dietary: '', // 'Yes' or 'No'
        dietaryDetails: '',
        medical: '', // 'Yes' or 'No'
        medicalDetails: '',
        insurance: '', // 'Yes' or 'No'
    });

    const [emergency, setEmergency] = useState({
        title: '', fullName: '', email: '', contact: '', relation: ''
    });

    const [activeDropdown, setActiveDropdown] = useState(null);

    // --- Validation Logic ---
    const isValidEmail = (email) => {
        if (!email) return true; // Don't turn red if empty (handle empty on submit)
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    };

    const isValidContact = (contact) => {
        if (!contact) return true; // Don't turn red if empty
        const digits = contact.replace(/\D/g, "");
        // Valid PH numbers: 10 digits starting with 8 or 9 OR 11 digits starting with 09
        if (digits.length === 10 && (digits.startsWith("8") || digits.startsWith("9"))) return true;
        if (digits.length === 11 && digits.startsWith("09")) return true;
        return false;
    };

    // Derived boolean states to trigger the red text styling
    const emailHasError = !isValidEmail(emergency.email) && emergency.email.length > 0;
    const contactHasError = !isValidContact(emergency.contact) && emergency.contact.length > 0;

    // --- Proceed Handler ---
    const handleNext = () => {
        // Dietary Validation
        if (!medicalData.dietary) return Alert.alert("Required", "Please select Yes or No for Dietary requests.");
        if (medicalData.dietary === 'Yes' && !medicalData.dietaryDetails.trim()) return Alert.alert("Required", "Please provide details for the Dietary request.");

        // Medical Validation
        if (!medicalData.medical) return Alert.alert("Required", "Please select Yes or No for Medical conditions.");
        if (medicalData.medical === 'Yes' && !medicalData.medicalDetails.trim()) return Alert.alert("Required", "Please provide details for the Medical conditions.");

        // Insurance Validation
        if (!medicalData.insurance) return Alert.alert("Required", "Please select Yes or No for Travel Insurance.");

        // Emergency Contact Validation
        if (!emergency.title || !emergency.fullName || !emergency.email || !emergency.contact || !emergency.relation) {
            return Alert.alert("Required", "Please complete all required fields in the Emergency Contact section.");
        }

        // Block progression if validations fail
        if (emailHasError) {
            return Alert.alert("Invalid Input", "Please enter a valid email address.");
        }
        if (contactHasError) {
            return Alert.alert("Invalid Input", "Please enter a valid 10 or 11 digit contact number.");
        }

        navigation.navigate("registrationstep3", { ...route.params, medicalData, emergency });
    };

    // --- Dropdown Options ---
    const renderDropdownOptions = () => {
        if (activeDropdown === 'emergencyTitle') {
            return (
                <>
                    <TouchableOpacity style={RegistrationFormStyle.dropdownItem} onPress={() => { setEmergency({...emergency, title: 'MR'}); setActiveDropdown(null); }}>
                        <Text style={RegistrationFormStyle.dropdownText}>MR</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[RegistrationFormStyle.dropdownItem, { borderBottomWidth: 0 }]} onPress={() => { setEmergency({...emergency, title: 'MS'}); setActiveDropdown(null); }}>
                        <Text style={RegistrationFormStyle.dropdownText}>MS</Text>
                    </TouchableOpacity>
                </>
            );
        }
        
        // Default to Yes/No for the others
        return (
            <>
                <TouchableOpacity style={RegistrationFormStyle.dropdownItem} onPress={() => { setMedicalData({...medicalData, [activeDropdown]: 'Yes'}); setActiveDropdown(null); }}>
                    <Text style={RegistrationFormStyle.dropdownText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[RegistrationFormStyle.dropdownItem, { borderBottomWidth: 0 }]} onPress={() => { setMedicalData({...medicalData, [activeDropdown]: 'No'}); setActiveDropdown(null); }}>
                    <Text style={RegistrationFormStyle.dropdownText}>No</Text>
                </TouchableOpacity>
            </>
        );
    };

    return (
        <SafeAreaView style={RegistrationFormStyle.safeArea}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={RegistrationFormStyle.scrollViewContent} showsVerticalScrollIndicator={false}>
                
                <View style={RegistrationFormStyle.paperPage}>
                    <Image source={require('../../assets/images/Logo.png')} style={RegistrationFormStyle.logo} />
                    
                    {/* Header */}
                    <View style={RegistrationFormStyle.headerGold}>
                        <Text style={RegistrationFormStyle.headerGoldText}>TRAVEL REGISTRATION DETAILS</Text>
                    </View>
                    <Text style={{ fontSize: 8, fontStyle: 'italic', textAlign: 'center', marginBottom: 10 }}>
                        Instructions: Please fill-up and write your answers inside each box.
                    </Text>

                    {/* Package Info */}
                    <Text style={[RegistrationFormStyle.label, { marginBottom: 4 }]}>
                        TOUR PACKAGE TITLE: <Text style={{ fontFamily: "Roboto_400Regular" }}>{setupData?.pkg?.title}</Text>
                    </Text>
                    <Text style={[RegistrationFormStyle.label, { marginBottom: 15 }]}>
                        PACKAGE TRAVEL DATE: <Text style={{ fontFamily: "Roboto_400Regular" }}>{setupData?.selectedDate}</Text>
                    </Text>

                    {/* --- DIETARY REQUESTS --- */}
                    <View style={RegistrationFormStyle.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={RegistrationFormStyle.label}>Does anyone in your group have any dietary requests?</Text>
                            <Text style={{ fontSize: 7, fontStyle: 'italic', color: '#666', marginBottom: 5 }}>(Applicable for tour package with meal inclusions; if not included, please select No)</Text>
                        </View>
                        <TouchableOpacity style={[RegistrationFormStyle.paperInput, { width: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#000' }]} onPress={() => setActiveDropdown('dietary')}>
                            <Text style={{ fontSize: 10 }}>{medicalData.dietary || 'Y / N'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[RegistrationFormStyle.row, { alignItems: 'flex-start', marginTop: 5, marginBottom: 15 }]}>
                        <Text style={{ fontSize: 9, marginTop: 5, marginRight: 5 }}>If yes, please indicate details:</Text>
                        <TextInput 
                            style={{ flex: 1, borderWidth: 1, borderColor: '#000', height: 40, padding: 5, fontSize: 10, textAlignVertical: 'top' }}
                            multiline
                            value={medicalData.dietaryDetails}
                            onChangeText={(v) => setMedicalData({...medicalData, dietaryDetails: v})}
                            editable={medicalData.dietary === 'Yes'}
                            backgroundColor={medicalData.dietary === 'Yes' ? '#fff' : '#f0f0f0'}
                        />
                    </View>

                    {/* --- MEDICAL CONDITIONS --- */}
                    <View style={RegistrationFormStyle.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={RegistrationFormStyle.label}>Does anyone in your group have any Allergies/Medical conditions?</Text>
                        </View>
                        <TouchableOpacity style={[RegistrationFormStyle.paperInput, { width: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#000' }]} onPress={() => setActiveDropdown('medical')}>
                            <Text style={{ fontSize: 10 }}>{medicalData.medical || 'Y / N'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[RegistrationFormStyle.row, { alignItems: 'flex-start', marginTop: 5, marginBottom: 15 }]}>
                        <Text style={{ fontSize: 9, marginTop: 5, marginRight: 5 }}>If yes, please indicate details:</Text>
                        <TextInput 
                            style={{ flex: 1, borderWidth: 1, borderColor: '#000', height: 40, padding: 5, fontSize: 10, textAlignVertical: 'top' }}
                            multiline
                            value={medicalData.medicalDetails}
                            onChangeText={(v) => setMedicalData({...medicalData, medicalDetails: v})}
                            editable={medicalData.medical === 'Yes'}
                            backgroundColor={medicalData.medical === 'Yes' ? '#fff' : '#f0f0f0'}
                        />
                    </View>

                    {/* --- TRAVEL INSURANCE --- */}
                    <View style={{ borderWidth: 1, borderColor: '#000', padding: 10, marginBottom: 15 }}>
                        <Text style={RegistrationFormStyle.label}>TRAVEL INSURANCE</Text>
                        <Text style={{ fontSize: 7, textAlign: 'justify', marginBottom: 10 }}>
                            We highly encourage ALL OUR CLIENTS to have and are covered with travel insurance for health, repatriation, loss of luggage/belongings and in case of cancellation, flight delays, and the like that is why purchasing of travel insurance together with our tour packages is compulsory for your convenience and peace of mind.
                        </Text>
                        
                        <View style={RegistrationFormStyle.row}>
                            <Text style={{ fontSize: 9, flex: 1 }}>Do you agree to purchase a Travel Insurance from us?</Text>
                            <TouchableOpacity style={[RegistrationFormStyle.paperInput, { width: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#000' }]} onPress={() => setActiveDropdown('insurance')}>
                                <Text style={{ fontSize: 10 }}>{medicalData.insurance || 'Y / N'}</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={{ fontSize: 7, fontStyle: 'italic', marginVertical: 8, color: '#666' }}>
                            Note: Purchasing of travel insurance from our Travel & Tours company does not hold us liable for any claims and anything about the process of claims from the insurance company. We can only provide the documents from our suppliers, operators, and airlines' end if necessary.
                        </Text>

                        {/* Insurance Tables */}
                        <View style={{ borderWidth: 1, borderColor: '#000', marginTop: 5 }}>
                            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
                                <View style={{ flex: 1, borderRightWidth: 1, borderColor: '#000', padding: 4, justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 8, fontFamily: "Montserrat_700Bold", textAlign: 'right' }}>If YES, please indicate details:</Text>
                                </View>
                                <View style={{ flex: 1.5, padding: 4 }}>
                                    <Text style={{ fontSize: 7, fontStyle: 'italic' }}>Please check the conditions and coverage carefully and send us a copy of the policy so we can review as well.</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1, borderRightWidth: 1, borderColor: '#000', padding: 4, justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 8, fontFamily: "Montserrat_700Bold", textAlign: 'right' }}>If NO but chose not to purchase Travel Insurance from us:</Text>
                                </View>
                                <View style={{ flex: 1.5, padding: 4, justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 8, fontFamily: "Montserrat_700Bold" }}>I understand that I am waiving the right of any assistance from the travel and tours company related to claims.</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* --- EMERGENCY CONTACT --- */}
                    <View style={{ backgroundColor: '#ADD8E6', borderWidth: 1, borderColor: '#000', paddingVertical: 4, paddingHorizontal: 5 }}>
                        <Text style={RegistrationFormStyle.headerBlueText}>EMERGENCY CONTACT <Text style={{ fontSize: 8, fontStyle: 'italic', fontFamily: "Roboto_400Regular" }}>(vs. the person to contact in the event of an emergency while you are away)</Text></Text>
                    </View>
                    
                    <View style={{ borderWidth: 1, borderTopWidth: 0, borderColor: '#000' }}>
                        {/* Row 1 */}
                        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
                            <View style={{ flex: 0.8, borderRightWidth: 1, borderColor: '#000', padding: 4, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={RegistrationFormStyle.label}>Title: </Text>
                                <TouchableOpacity style={{ flex: 1, marginLeft: 5 }} onPress={() => setActiveDropdown('emergencyTitle')}>
                                    <Text style={{ fontSize: 9, color: emergency.title ? '#000' : '#888' }}>{emergency.title || 'MR/MS'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 2, padding: 4, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={RegistrationFormStyle.label}>Full name: </Text>
                                <TextInput style={{ flex: 1, fontSize: 9, padding: 0, height: 15 }} value={emergency.fullName} onChangeText={(v) => setEmergency({...emergency, fullName: v})} />
                            </View>
                        </View>
                        {/* Row 2 */}
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1.5, borderRightWidth: 1, borderColor: '#000', padding: 4, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={RegistrationFormStyle.label}>Email: </Text>
                                <TextInput 
                                    style={{ flex: 1, fontSize: 9, padding: 0, height: 15, color: emailHasError ? '#b54747' : '#000' }} 
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={emergency.email} 
                                    onChangeText={(v) => setEmergency({...emergency, email: v.replace(/\s/g, '')})} 
                                />
                            </View>
                            <View style={{ flex: 1.5, borderRightWidth: 1, borderColor: '#000', padding: 4, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={RegistrationFormStyle.label}>Contact Number: </Text>
                                <TextInput 
                                    style={{ flex: 1, fontSize: 9, padding: 0, height: 15, color: contactHasError ? '#b54747' : '#000' }} 
                                    keyboardType="phone-pad" 
                                    maxLength={11}
                                    value={emergency.contact} 
                                    onChangeText={(v) => setEmergency({...emergency, contact: v.replace(/[^0-9]/g, '')})} 
                                />
                            </View>
                            <View style={{ flex: 1, padding: 4, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={RegistrationFormStyle.label}>Relation: </Text>
                                <TextInput style={{ flex: 1, fontSize: 9, padding: 0, height: 15 }} value={emergency.relation} onChangeText={(v) => setEmergency({...emergency, relation: v})} />
                            </View>
                        </View>
                    </View>

                    {/* --- SIGNATURE --- */}
                    <View style={[RegistrationFormStyle.signatureBlock, { marginTop: 40 }]}>
                        <View style={RegistrationFormStyle.sigLine}>
                            <TextInput style={[RegistrationFormStyle.paperInput, { width: '100%', textAlign: 'center' }]} value={`${user?.firstname || ''} ${user?.lastname || ''}`} editable={false} />
                            <Text style={RegistrationFormStyle.sigText}>Signature over printed name</Text>
                        </View>
                        <View style={RegistrationFormStyle.sigLine}>
                            <TextInput style={[RegistrationFormStyle.paperInput, { width: '100%', textAlign: 'center' }]} value={currentDateLong} editable={false} />
                            <Text style={RegistrationFormStyle.sigText}>Date</Text>
                        </View>
                    </View>

                </View>

                {/* --- FOOTER BUTTONS --- */}
                <View style={RegistrationFormStyle.footerContainer}>
                    <TouchableOpacity style={QuotationAllInStyle.proceedButton} onPress={handleNext}>
                        <Text style={QuotationAllInStyle.proceedButtonText}>Next: Terms & Conditions</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={RegistrationFormStyle.backTextButton} onPress={() => navigation.goBack()}>
                        <Text style={RegistrationFormStyle.backText}>Back to Traveler Info</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* --- GLOBAL DROPDOWN MODAL --- */}
            <Modal visible={!!activeDropdown} transparent animationType="fade">
                <TouchableOpacity 
                    style={RegistrationFormStyle.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setActiveDropdown(null)}
                >
                    <View style={RegistrationFormStyle.dropdownBox}>
                        {renderDropdownOptions()}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}