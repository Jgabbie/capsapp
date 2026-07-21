import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Image, TouchableOpacity, SafeAreaView, StatusBar, Modal, Pressable } from 'react-native';
import RegistrationFormStyle from '../../styles/clientstyles/RegistrationFormStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import { useUser } from '../../context/UserContext';

import {
    useFonts,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";



//format long date fun
const formatLongDate = (dateVal) => {
    if (!dateVal) return "";
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateVal).toLocaleDateString('en-US', options);
};

export default function RegistrationStep2({ route, navigation }) {
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_600SemiBold,
        Montserrat_700Bold,
    });

    const { user } = useUser();
    const { setupData, travelerUploads, passengers, leadGuestInfo, medicalData: prevMedicalData, emergency: prevEmergency } = route.params || {};

    const currentDateLong = formatLongDate(new Date());

    //state for medical data and emergency contact, initialized with previous data if available
    const [medicalData, setMedicalData] = useState(
        prevMedicalData || {
            dietary: '',
            dietaryDetails: '',
            medical: '',
            medicalDetails: '',
            insurance1: '',
            insurance2: '',
        }
    );

    const [emergency, setEmergency] = useState(
        prevEmergency || {
            title: '', fullName: '', email: '', contact: '', relation: ''
        }
    );

    const [activeDropdown, setActiveDropdown] = useState(null);
    const relationOptions = ['MOTHER', 'FATHER', 'SISTER', 'BROTHER', 'RELATIVE', 'OTHERS'];


    const [alertModal, setAlertModal] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'warning',
    });


    //show custom alert modal
    const showAlertModal = (
        title,
        message,
        type = 'warning'
    ) => {
        setAlertModal({
            visible: true,
            title,
            message,
            type,
        });
    };


    //close custom alert modal
    const closeAlertModal = () => {
        setAlertModal(prev => ({
            ...prev,
            visible: false,
        }));
    };


    //valid email function
    const isValidEmail = (email) => {
        if (!email) return true;
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    };


    //valid contact function
    const isValidContact = (contact) => {
        if (!contact) return true;
        const digits = contact.replace(/\D/g, "");
        // If starts with 09: must have 11 digits
        if (digits.startsWith("09")) {
            return digits.length === 11;
        }
        // If doesn't start with 09: must have 7-8 digits
        return digits.length >= 7 && digits.length <= 8;
    };

    const emailHasError = !isValidEmail(emergency.email) && emergency.email.length > 0;
    const contactHasError = !isValidContact(emergency.contact) && emergency.contact.length > 0;


    //next function
    const handleNext = () => {
        if (!medicalData.dietary) return showAlertModal(
            'Required',
            'Please select Y or N for Dietary requests.',
            'warning'
        );
        if (medicalData.dietary === 'Y' && !medicalData.dietaryDetails.trim()) return showAlertModal(
            'Required',
            'Please provide details for the Dietary request.',
            'warning'
        );

        if (!medicalData.medical) return showAlertModal(
            'Required',
            'Please select Y or N for Medical conditions.',
            'warning'
        );
        if (medicalData.medical === 'Y' && !medicalData.medicalDetails.trim()) return showAlertModal(
            'Required',
            'Please provide details for the Medical conditions.',
            'warning'
        );

        if (!medicalData.insurance1) return showAlertModal(
            'Required',
            'Please select Y or N for Travel Insurance.',
            'warning'
        );
        if (!medicalData.insurance2) return showAlertModal(
            'Required',
            'Please select Y or N for the second Travel Insurance confirmation.',
            'warning'
        );

        if (!emergency.title || !emergency.fullName || !emergency.email || !emergency.contact || !emergency.relation) {
            return showAlertModal(
                'Required',
                'Please complete all required fields in the Emergency Contact section.',
                'warning'
            );
        }

        if (emailHasError) {
            return showAlertModal(
                'Invalid Input',
                'Please enter a valid email address.',
                'warning'
            );
        }
        if (contactHasError) {
            return showAlertModal(
                'Invalid Input',
                'Enter valid contact number (09xxxxxxxxxx or 8xxxxxxx-8xxxxxxxx)',
                'warning'
            );
        }

        navigation.navigate("registrationstep3", { ...route.params, medicalData, emergency });
    };


    //dropdown select handler
    const handleDropdownSelect = (value, field) => {
        const target = field || activeDropdown;
        if (target === 'dietary') {
            setMedicalData((prev) => ({
                ...prev,
                dietary: value,
                dietaryDetails: value === 'N' ? 'N/A' : (prev.dietaryDetails === 'N/A' ? '' : prev.dietaryDetails)
            }));
        } else if (target === 'medical') {
            setMedicalData((prev) => ({
                ...prev,
                medical: value,
                medicalDetails: value === 'N' ? 'N/A' : (prev.medicalDetails === 'N/A' ? '' : prev.medicalDetails)
            }));
        } else if (target === 'insurance1') {
            setMedicalData((prev) => ({ ...prev, insurance1: value }));
        } else if (target === 'insurance2') {
            setMedicalData((prev) => ({ ...prev, insurance2: value }));
        } else if (target === 'emergencyTitle') {
            setEmergency((prev) => ({ ...prev, title: value }));
        } else if (target === 'relation') {
            setEmergency((prev) => ({ ...prev, relation: value }));
        }
        setActiveDropdown(null);
    };


    //render dropdown options based on the active dropdown
    const renderDropdownOptions = () => {
        if (activeDropdown === 'emergencyTitle') {
            return (
                <>
                    <TouchableOpacity style={RegistrationFormStyle.dropdownItem} onPress={() => handleDropdownSelect('MR')}>
                        <Text style={[RegistrationFormStyle.dropdownText, { color: emergency.title === 'MR' ? '#305797' : '#000' }]}>MR</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[RegistrationFormStyle.dropdownItem, { borderBottomWidth: 0 }]} onPress={() => handleDropdownSelect('MS')}>
                        <Text style={[RegistrationFormStyle.dropdownText, { color: emergency.title === 'MS' ? '#305797' : '#000' }]}>MS</Text>
                    </TouchableOpacity>
                </>
            );
        }

        if (activeDropdown === 'relation') {
            return relationOptions.map((option, index) => (
                <TouchableOpacity
                    key={option}
                    style={[RegistrationFormStyle.dropdownItem, index === relationOptions.length - 1 && { borderBottomWidth: 0 }]}
                    onPress={() => handleDropdownSelect(option)}
                >
                    <Text style={[RegistrationFormStyle.dropdownText, { color: emergency.relation === option ? '#305797' : '#000' }]}>{option}</Text>
                </TouchableOpacity>
            ));
        }

        // Default to Y/N for the others (matching the web format)
        return (
            <>
                <TouchableOpacity style={RegistrationFormStyle.dropdownItem} onPress={() => handleDropdownSelect('Y', activeDropdown)}>
                    <Text style={RegistrationFormStyle.dropdownText}>Y</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[RegistrationFormStyle.dropdownItem, { borderBottomWidth: 0 }]} onPress={() => handleDropdownSelect('N', activeDropdown)}>
                    <Text style={RegistrationFormStyle.dropdownText}>N</Text>
                </TouchableOpacity>
            </>
        );
    };





    return (
        <SafeAreaView style={RegistrationFormStyle.safeArea}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={RegistrationFormStyle.scrollViewContent} showsVerticalScrollIndicator={false}>

                <View style={RegistrationFormStyle.paperPage}>
                    <Image source={require('../../assets/images/LastPushLogo.png')} style={RegistrationFormStyle.logo} />

                    <View style={RegistrationFormStyle.headerGold}>
                        <Text style={RegistrationFormStyle.headerGoldText}>TRAVEL REGISTRATION DETAILS</Text>
                    </View>
                    <Text style={{ fontSize: 8, fontStyle: 'italic', textAlign: 'center', marginBottom: 10 }}>
                        Instructions: Please fill-up and write your answers inside each box.
                    </Text>

                    {/* Package Info */}
                    <Text style={[RegistrationFormStyle.label, { marginBottom: 4 }]}>
                        {/*  FIXED: Now properly checks for packageName first, just like Step 1 */}
                        TOUR PACKAGE TITLE: <Text style={{ fontFamily: "Montserrat_400Regular" }}>{setupData?.pkg?.packageName || setupData?.pkg?.title || ''}</Text>
                    </Text>
                    <Text style={[RegistrationFormStyle.label, { marginBottom: 15 }]}>
                        PACKAGE TRAVEL DATE: <Text style={{ fontFamily: "Montserrat_400Regular" }}>{setupData?.selectedDate}</Text>
                    </Text>

                    {/* --- DIETARY REQUESTS --- */}
                    <View style={RegistrationFormStyle.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={RegistrationFormStyle.label}>Does anyone in your group have any dietary requests?</Text>
                            <Text style={{ fontSize: 7, fontStyle: 'italic', color: '#666', marginBottom: 5 }}>(Applicable for tour package with meal inclusions; if not included, please select N)</Text>
                        </View>
                        <TouchableOpacity style={[RegistrationFormStyle.paperInput, { width: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#000' }]} onPress={() => setActiveDropdown('dietary')}>
                            <Text style={{ fontSize: 10 }}>{medicalData.dietary || 'Y / N'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[RegistrationFormStyle.row, { alignItems: 'flex-start', marginTop: 5, marginBottom: 15 }]}>
                        <Text style={{ fontSize: 9, marginTop: 5, marginRight: 5 }}>If yes, please indicate details:</Text>
                        <TextInput
                            maxLength={250}
                            style={{ flex: 1, borderWidth: 1, borderColor: '#000', height: 40, padding: 5, fontSize: 10, textAlignVertical: 'top', color: '#000' }}
                            multiline
                            value={medicalData.dietaryDetails}
                            onChangeText={(text) => {
                                const cleanedDetails = text
                                    .replace(/[^a-zA-Z0-9\s.,!?'"()@&/:;#+\-]/g, "")
                                    .replace(/[^\S\r\n]{2,}/g, " ")
                                    .replace(/^\s+/, "");

                                setMedicalData((prev) => ({
                                    ...prev,
                                    dietaryDetails: cleanedDetails
                                }));
                            }}
                            autoCapitalize="sentences"
                            autoCorrect={false}
                            editable={medicalData.dietary === 'Y'}
                            backgroundColor={medicalData.dietary === 'Y' ? '#fff' : '#fff'} //  Kept white as requested
                        />
                    </View>

                    {/* --- MEDICAL CONDITIONS --- */}
                    <View style={RegistrationFormStyle.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={RegistrationFormStyle.label}>Does anyone in your group have any Allergies/Medical conditions?</Text>
                            <Text style={{ fontSize: 7, fontStyle: 'italic', color: '#666', marginBottom: 5 }}>(Applicable for tour package with meal inclusions; if not included, please select N)</Text>
                        </View>
                        <TouchableOpacity style={[RegistrationFormStyle.paperInput, { width: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#000' }]} onPress={() => setActiveDropdown('medical')}>
                            <Text style={{ fontSize: 10 }}>{medicalData.medical || 'Y / N'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[RegistrationFormStyle.row, { alignItems: 'flex-start', marginTop: 5, marginBottom: 15 }]}>
                        <Text style={{ fontSize: 9, marginTop: 5, marginRight: 5 }}>If yes, please indicate details:</Text>
                        <TextInput
                            maxLength={250}
                            style={{ flex: 1, borderWidth: 1, borderColor: '#000', height: 40, padding: 5, fontSize: 10, textAlignVertical: 'top', color: '#000' }}
                            multiline
                            value={medicalData.medicalDetails}
                            onChangeText={(text) => {
                                const cleanedDetails = text
                                    .replace(/[^a-zA-Z0-9\s.,!?'"()@&/:;#+\-]/g, "")
                                    .replace(/[^\S\r\n]{2,}/g, " ")
                                    .replace(/^\s+/, "");

                                setMedicalData((prev) => ({
                                    ...prev,
                                    medicalDetails: cleanedDetails
                                }));
                            }}
                            autoCapitalize="sentences"
                            autoCorrect={false}
                            editable={medicalData.medical === 'Y'}
                            backgroundColor={medicalData.medical === 'Y' ? '#fff' : '#fff'} //  Kept white as requested
                        />
                    </View>

                    {/* --- TRAVEL INSURANCE --- */}
                    <View style={{ borderWidth: 1, borderColor: '#000', padding: 10, marginBottom: 15 }}>
                        <Text style={RegistrationFormStyle.label}>TRAVEL INSURANCE</Text>
                        <Text style={{ fontSize: 7, textAlign: 'justify', marginBottom: 10, marginTop: 4 }}>
                            We highly encourage <Text style={{ fontWeight: 'bold' }}>ALL OUR CLIENTS</Text> to have and are covered with travel insurance for health, repatriation, loss of luggage/belongings and in case of cancellation, flight delays, and the like that is why purchasing of travel insurance together with our tour packages is compulsory for your convenience and peace of mind.
                        </Text>

                        <View style={RegistrationFormStyle.row}>
                            <Text style={{ fontSize: 9, flex: 1 }}>Do you agree to purchase a Travel Insurance from us?</Text>
                            <TouchableOpacity style={[RegistrationFormStyle.paperInput, { width: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#000' }]} onPress={() => setActiveDropdown('insurance1')}>
                                <Text style={{ fontSize: 10 }}>{medicalData.insurance1 || 'Y / N'}</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={{ fontSize: 7, fontStyle: 'italic', marginVertical: 10, color: '#666' }}>
                            Note: Purchasing of travel insurance from our Travel & Tours company does not hold us liable for any claims and anything about the process of claims from the insurance company. We can only provide the documents from our suppliers, operators, and airlines' end if necessary. Kindly email us immediately at <Text style={{ color: '#1d4ed8', fontWeight: '700' }}>info1@mrctravel.com</Text> if you plan to purchase travel insurance from us.
                        </Text>

                        <View style={RegistrationFormStyle.row}>
                            <Text style={{ fontSize: 9, flex: 1 }}>Do you agree to purchase a Travel Insurance from us?</Text>
                            <TouchableOpacity style={[RegistrationFormStyle.paperInput, { width: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#000' }]} onPress={() => setActiveDropdown('insurance2')}>
                                <Text style={{ fontSize: 10 }}>{medicalData.insurance2 || 'Y / N'}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Insurance Tables */}
                        <View style={{ borderWidth: 1, borderColor: '#000', marginTop: 10 }}>
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
                        <Text style={RegistrationFormStyle.headerBlueText}>EMERGENCY CONTACT <Text style={{ fontSize: 8, fontStyle: 'italic', fontFamily: "Montserrat_400Regular", color: '#333' }}>(i.e: the person to contact in the event of an emergency while you are away)</Text></Text>
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
                                <TextInput
                                    maxLength={50}
                                    style={{ flex: 1, fontSize: 9, padding: 0, height: 15, color: '#000' }}
                                    value={emergency.fullName}
                                    onChangeText={(v) => setEmergency({ ...emergency, fullName: v.replace(/[^A-Za-z\s-]/g, '') })}
                                />
                            </View>
                        </View>
                        {/* Row 2 */}
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1.5, borderRightWidth: 1, borderColor: '#000', padding: 4, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={RegistrationFormStyle.label}>Email: </Text>
                                <TextInput
                                    maxLength={50}
                                    style={{ flex: 1, fontSize: 9, padding: 0, height: 15, color: emailHasError ? '#b54747' : '#000', }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    value={emergency.email}
                                    onChangeText={(text) => {
                                        const cleanedEmail = text
                                            .replace(/\s/g, "")
                                            .replace(/[^a-zA-Z0-9@._+-]/g, "")
                                            .toLowerCase();

                                        setEmergency((prev) => ({
                                            ...prev,
                                            email: cleanedEmail
                                        }));
                                    }}
                                />
                            </View>
                            <View style={{ flex: 1.5, borderRightWidth: 1, borderColor: '#000', padding: 4, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={RegistrationFormStyle.label}>Contact Number: </Text>
                                <TextInput
                                    style={{ flex: 1, fontSize: 9, padding: 0, height: 15, color: contactHasError ? '#b54747' : '#000' }}
                                    keyboardType="phone-pad"
                                    maxLength={11}
                                    value={emergency.contact}
                                    onChangeText={(v) => setEmergency({ ...emergency, contact: v.replace(/[^0-9]/g, '') })}
                                />
                            </View>
                            <View style={{ flex: 1.3, padding: 4, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={RegistrationFormStyle.label}>Relation: </Text>
                                <TouchableOpacity
                                    style={{ flex: 1, marginLeft: 5 }}
                                    onPress={() => setActiveDropdown('relation')}
                                >
                                    <Text style={{ fontSize: 9, color: emergency.relation ? '#000' : '#888' }}>
                                        {emergency.relation || 'Select'}
                                    </Text>
                                </TouchableOpacity>
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
                    <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                        <View style={RegistrationFormStyle.dropdownBox}>
                            {renderDropdownOptions()}
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>


            <Modal
                visible={alertModal.visible}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={closeAlertModal}
            >
                <Pressable
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 25,
                    }}
                    onPress={closeAlertModal}
                >
                    <Pressable
                        style={{
                            width: '100%',
                            maxWidth: 340,
                            backgroundColor: '#ffffff',
                            borderRadius: 22,
                            paddingHorizontal: 26,
                            paddingTop: 24,
                            paddingBottom: 22,
                            alignItems: 'center',
                            elevation: 8,
                        }}
                        onPress={event => event.stopPropagation()}
                    >
                        <View
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                backgroundColor:
                                    alertModal.type === 'error'
                                        ? '#fee2e2'
                                        : alertModal.type === 'warning'
                                            ? '#fef3c7'
                                            : alertModal.type === 'info'
                                                ? '#dbeafe'
                                                : '#d1fae5',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 18,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 32,
                                    fontFamily: 'Montserrat_700Bold',
                                    color:
                                        alertModal.type === 'error'
                                            ? '#dc2626'
                                            : alertModal.type === 'warning'
                                                ? '#d97706'
                                                : alertModal.type === 'info'
                                                    ? '#305797'
                                                    : '#059669',
                                }}
                            >
                                {alertModal.type === 'error'
                                    ? '×'
                                    : alertModal.type === 'warning'
                                        ? '!'
                                        : alertModal.type === 'info'
                                            ? 'i'
                                            : '✓'}
                            </Text>
                        </View>

                        <Text
                            style={{
                                color: '#1f2937',
                                fontFamily: 'Montserrat_700Bold',
                                fontSize: 18,
                                lineHeight: 24,
                                textAlign: 'center',
                                marginBottom: 10,
                            }}
                        >
                            {alertModal.title}
                        </Text>

                        <Text
                            style={{
                                color: '#6b7280',
                                fontFamily: 'Montserrat_400Regular',
                                fontSize: 14,
                                lineHeight: 21,
                                textAlign: 'center',
                                marginBottom: 22,
                            }}
                        >
                            {alertModal.message}
                        </Text>

                        <TouchableOpacity
                            style={{
                                minWidth: 110,
                                backgroundColor: '#305797',
                                borderRadius: 10,
                                paddingHorizontal: 28,
                                paddingVertical: 12,
                                alignItems: 'center',
                            }}
                            activeOpacity={0.8}
                            onPress={closeAlertModal}
                        >
                            <Text
                                style={{
                                    color: '#ffffff',
                                    fontFamily: 'Montserrat_600SemiBold',
                                    fontSize: 14,
                                }}
                            >
                                Got It
                            </Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}