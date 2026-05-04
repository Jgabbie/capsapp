import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Image, TouchableOpacity, SafeAreaView, StatusBar, Modal, Alert } from 'react-native';
import QuotationFormStepStyle from '../../styles/clientstyles/QuotationFormStepStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import { useUser } from '../../context/UserContext';

const formatLongDate = (dateVal) => {
    if (!dateVal) return "";
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateVal).toLocaleDateString('en-US', options);
};

export default function QuotationForm2({ route, navigation }) {
    const { user } = useUser();
    const { quotation, travelerUploads, passengers, leadGuestInfo } = route.params || {};

    const pdfRevisions = Array.isArray(quotation?.pdfRevisions) ? quotation.pdfRevisions : [];
    const latestPdfRevision = pdfRevisions.length > 0 ? pdfRevisions[pdfRevisions.length - 1] : null;

    const packageName = quotation?.packageId?.packageName || 'N/A'
    const packageTravelDate = latestPdfRevision?.travelDetails.travelDates || 'N/A';


    const currentDateLong = formatLongDate(new Date());

    const [medicalData, setMedicalData] = useState({
        dietary: '',
        dietaryDetails: '',
        medical: '',
        medicalDetails: '',
        insurance1: '',
        insurance2: '',
    });

    const [emergency, setEmergency] = useState({
        title: '', fullName: '', email: '', contact: '', relation: ''
    });

    const [activeDropdown, setActiveDropdown] = useState(null);

    const isValidEmail = (email) => {
        if (!email) return true;
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
    };

    const isValidContact = (contact) => {
        if (!contact) return true;
        const digits = contact.replace(/\D/g, "");
        if (digits.length === 10 && (digits.startsWith("8") || digits.startsWith("9"))) return true;
        if (digits.length === 11 && digits.startsWith("09")) return true;
        return false;
    };

    const emailHasError = !isValidEmail(emergency.email) && emergency.email.length > 0;
    const contactHasError = !isValidContact(emergency.contact) && emergency.contact.length > 0;

    const handleNext = () => {
        if (!medicalData.dietary) return Alert.alert("Required", "Please select Y or N for Dietary requests.");
        if (medicalData.dietary === 'Y' && !medicalData.dietaryDetails.trim()) return Alert.alert("Required", "Please provide details for the Dietary request.");

        if (!medicalData.medical) return Alert.alert("Required", "Please select Y or N for Medical conditions.");
        if (medicalData.medical === 'Y' && !medicalData.medicalDetails.trim()) return Alert.alert("Required", "Please provide details for the Medical conditions.");

        if (!medicalData.insurance1) return Alert.alert("Required", "Please select Y or N for Travel Insurance.");
        if (!medicalData.insurance2) return Alert.alert("Required", "Please select Y or N for the second Travel Insurance confirmation.");

        if (!emergency.title || !emergency.fullName || !emergency.email || !emergency.contact || !emergency.relation) {
            return Alert.alert("Required", "Please complete all required fields in the Emergency Contact section.");
        }

        if (emailHasError) {
            return Alert.alert("Invalid Input", "Please enter a valid email address.");
        }
        if (contactHasError) {
            return Alert.alert("Invalid Input", "Please enter a valid 10 or 11 digit contact number.");
        }

        navigation.navigate("quotationform3", { ...route.params, medicalData, emergency, quotation });
    };

    const handleDropdownSelect = (value) => {
        if (activeDropdown === 'dietary') {
            setMedicalData({
                ...medicalData,
                dietary: value,
                dietaryDetails: value === 'N' ? 'N/A' : (medicalData.dietaryDetails === 'N/A' ? '' : medicalData.dietaryDetails)
            });
        } else if (activeDropdown === 'medical') {
            setMedicalData({
                ...medicalData,
                medical: value,
                medicalDetails: value === 'N' ? 'N/A' : (medicalData.medicalDetails === 'N/A' ? '' : medicalData.medicalDetails)
            });
        } else if (activeDropdown === 'insurance1') {
            setMedicalData({ ...medicalData, insurance1: value });
        } else if (activeDropdown === 'insurance2') {
            setMedicalData({ ...medicalData, insurance2: value });
        } else if (activeDropdown === 'emergencyTitle') {
            setEmergency({ ...emergency, title: value });
        }
        setActiveDropdown(null);
    };

    const renderDropdownOptions = () => {
        if (activeDropdown === 'emergencyTitle') {
            return (
                <>
                    <TouchableOpacity style={QuotationFormStepStyle.dropdownItem} onPress={() => handleDropdownSelect('MR')}>
                        <Text style={QuotationFormStepStyle.dropdownText}>MR</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[QuotationFormStepStyle.dropdownItem, { borderBottomWidth: 0 }]} onPress={() => handleDropdownSelect('MS')}>
                        <Text style={QuotationFormStepStyle.dropdownText}>MS</Text>
                    </TouchableOpacity>
                </>
            );
        }
        return (
            <>
                <TouchableOpacity style={QuotationFormStepStyle.dropdownItem} onPress={() => handleDropdownSelect('Y')}>
                    <Text style={QuotationFormStepStyle.dropdownText}>Y</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[QuotationFormStepStyle.dropdownItem, { borderBottomWidth: 0 }]} onPress={() => handleDropdownSelect('N')}>
                    <Text style={QuotationFormStepStyle.dropdownText}>N</Text>
                </TouchableOpacity>
            </>
        );
    };

    return (
        <SafeAreaView style={QuotationFormStepStyle.safeArea}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={QuotationFormStepStyle.scrollViewContent} showsVerticalScrollIndicator={false}>

                <View style={QuotationFormStepStyle.paperPage}>
                    <Image source={require('../../assets/images/LastPushLogo.png')} style={QuotationFormStepStyle.logo} />

                    <View style={QuotationFormStepStyle.headerGold}>
                        <Text style={QuotationFormStepStyle.headerGoldText}>TRAVEL REGISTRATION DETAILS</Text>
                    </View>
                    <Text style={{ fontSize: 8, fontStyle: 'italic', textAlign: 'center', marginBottom: 10 }}>
                        Instructions: Please fill-up and write your answers inside each box.
                    </Text>

                    <Text style={[QuotationFormStepStyle.label, { marginBottom: 4 }]}>TOUR PACKAGE TITLE: <Text style={{ fontFamily: "Roboto_400Regular" }}>{packageName}</Text></Text>
                    <Text style={[QuotationFormStepStyle.label, { marginBottom: 15 }]}>PACKAGE TRAVEL DATE: <Text style={{ fontFamily: "Roboto_400Regular" }}>{packageTravelDate}</Text></Text>

                    <View style={QuotationFormStepStyle.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={QuotationFormStepStyle.label}>Does anyone in your group have any dietary requests?</Text>
                            <Text style={{ fontSize: 7, fontStyle: 'italic', color: '#666', marginBottom: 5 }}>(Applicable for tour package with meal inclusions; if not included, please select N)</Text>
                        </View>
                        <TouchableOpacity style={[QuotationFormStepStyle.paperInput, { width: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#000' }]} onPress={() => setActiveDropdown('dietary')}>
                            <Text style={{ fontSize: 10 }}>{medicalData.dietary || 'Y / N'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[QuotationFormStepStyle.row, { alignItems: 'flex-start', marginTop: 5, marginBottom: 15 }]}>
                        <Text style={{ fontSize: 9, marginTop: 5, marginRight: 5 }}>If yes, please indicate details:</Text>
                        <TextInput
                            style={{ flex: 1, borderWidth: 1, borderColor: '#000', height: 40, padding: 5, fontSize: 10, textAlignVertical: 'top' }}
                            multiline
                            value={medicalData.dietaryDetails}
                            onChangeText={(v) => setMedicalData({ ...medicalData, dietaryDetails: v })}
                            editable={medicalData.dietary === 'Y'}
                            backgroundColor={medicalData.dietary === 'Y' ? '#fff' : '#fff'}
                        />
                    </View>

                    <View style={QuotationFormStepStyle.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={QuotationFormStepStyle.label}>Does anyone in your group have any Allergies/Medical conditions?</Text>
                            <Text style={{ fontSize: 7, fontStyle: 'italic', color: '#666', marginBottom: 5 }}>(Applicable for tour package with meal inclusions; if not included, please select N)</Text>
                        </View>
                        <TouchableOpacity style={[QuotationFormStepStyle.paperInput, { width: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#000' }]} onPress={() => setActiveDropdown('medical')}>
                            <Text style={{ fontSize: 10 }}>{medicalData.medical || 'Y / N'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[QuotationFormStepStyle.row, { alignItems: 'flex-start', marginTop: 5, marginBottom: 15 }]}>
                        <Text style={{ fontSize: 9, marginTop: 5, marginRight: 5 }}>If yes, please indicate details:</Text>
                        <TextInput
                            style={{ flex: 1, borderWidth: 1, borderColor: '#000', height: 40, padding: 5, fontSize: 10, textAlignVertical: 'top' }}
                            multiline
                            value={medicalData.medicalDetails}
                            onChangeText={(v) => setMedicalData({ ...medicalData, medicalDetails: v })}
                            editable={medicalData.medical === 'Y'}
                        />
                    </View>

                    <View style={{ borderWidth: 1, borderColor: '#000', padding: 10, marginBottom: 15 }}>
                        <Text style={QuotationFormStepStyle.label}>TRAVEL INSURANCE</Text>
                        <Text style={{ fontSize: 7, textAlign: 'justify', marginBottom: 10, marginTop: 4 }}>
                            We highly encourage ALL OUR CLIENTS to have and are covered with travel insurance for health, repatriation, loss of luggage/belongings and in case of cancellation, flight delays, and the like that is why purchasing of travel insurance together with our tour packages is compulsory for your convenience and peace of mind.
                        </Text>

                        <View style={QuotationFormStepStyle.row}>
                            <Text style={{ fontSize: 9, flex: 1 }}>Do you agree to purchase a Travel Insurance from us?</Text>
                            <TouchableOpacity style={[QuotationFormStepStyle.paperInput, { width: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#000' }]} onPress={() => setActiveDropdown('insurance1')}>
                                <Text style={{ fontSize: 10 }}>{medicalData.insurance1 || 'Y / N'}</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={{ fontSize: 7, fontStyle: 'italic', marginVertical: 10, color: '#666' }}>
                            Note: Purchasing of travel insurance from our Travel & Tours company does not hold us liable for any claims and anything about the process of claims from the insurance company.
                        </Text>

                        <View style={QuotationFormStepStyle.row}>
                            <Text style={{ fontSize: 9, flex: 1 }}>Do you agree to purchase a Travel Insurance from us?</Text>
                            <TouchableOpacity style={[QuotationFormStepStyle.paperInput, { width: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#000' }]} onPress={() => setActiveDropdown('insurance2')}>
                                <Text style={{ fontSize: 10 }}>{medicalData.insurance2 || 'Y / N'}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ borderWidth: 1, borderColor: '#000', marginTop: 10 }}>
                            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
                                <View style={{ flex: 1, borderRightWidth: 1, borderColor: '#000', padding: 4, justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 8, fontFamily: "Montserrat_700Bold", textAlign: 'right' }}>If YES, please indicate details:</Text>
                                </View>
                                <View style={{ flex: 1.5, padding: 4 }}>
                                    <Text style={{ fontSize: 7, fontStyle: 'italic' }}>Please check the conditions and coverage carefully and send us a copy of the policy so we can review as well.</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={{ backgroundColor: '#ADD8E6', borderWidth: 1, borderColor: '#000', paddingVertical: 4, paddingHorizontal: 5 }}>
                        <Text style={QuotationFormStepStyle.headerBlueText}>EMERGENCY CONTACT <Text style={{ fontSize: 8, fontStyle: 'italic', fontFamily: "Roboto_400Regular", color: '#333' }}>(i.e: the person to contact in the event of an emergency while you are away)</Text></Text>
                    </View>

                    <View style={{ borderWidth: 1, borderTopWidth: 0, borderColor: '#000' }}>
                        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
                            <View style={{ flex: 0.8, borderRightWidth: 1, borderColor: '#000', padding: 4, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={QuotationFormStepStyle.label}>Title: </Text>
                                <TouchableOpacity style={{ flex: 1, marginLeft: 5 }} onPress={() => setActiveDropdown('emergencyTitle')}>
                                    <Text style={{ fontSize: 9, color: emergency.title ? '#000' : '#888' }}>{emergency.title || 'MR/MS'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 2, padding: 4, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={QuotationFormStepStyle.label}>Full name: </Text>
                                <TextInput style={{ flex: 1, fontSize: 9, padding: 0, height: 15 }} value={emergency.fullName} onChangeText={(v) => setEmergency({ ...emergency, fullName: v.replace(/[^A-Za-z\s-]/g, '') })} />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1.5, borderRightWidth: 1, borderColor: '#000', padding: 4, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={QuotationFormStepStyle.label}>Email: </Text>
                                <TextInput
                                    style={{ flex: 1, fontSize: 9, padding: 0, height: 15, color: emailHasError ? '#b54747' : '#000' }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={emergency.email}
                                    onChangeText={(v) => setEmergency({ ...emergency, email: v.replace(/\s/g, '') })}
                                />
                            </View>
                            <View style={{ flex: 1.5, borderRightWidth: 1, borderColor: '#000', padding: 4, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={QuotationFormStepStyle.label}>Contact Number: </Text>
                                <TextInput
                                    style={{ flex: 1, fontSize: 9, padding: 0, height: 15, color: contactHasError ? '#b54747' : '#000' }}
                                    keyboardType="phone-pad"
                                    maxLength={11}
                                    value={emergency.contact}
                                    onChangeText={(v) => setEmergency({ ...emergency, contact: v.replace(/[^0-9]/g, '') })}
                                />
                            </View>
                            <View style={{ flex: 1, padding: 4, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={QuotationFormStepStyle.label}>Relation: </Text>
                                <TextInput style={{ flex: 1, fontSize: 9, padding: 0, height: 15 }} value={emergency.relation} onChangeText={(v) => setEmergency({ ...emergency, relation: v.replace(/[^A-Za-z\s-]/g, '') })} />
                            </View>
                        </View>
                    </View>

                    <View style={[QuotationFormStepStyle.signatureBlock, { marginTop: 40 }]}>
                        <View style={QuotationFormStepStyle.sigLine}>
                            <TextInput style={[QuotationFormStepStyle.paperInput, { width: '100%', textAlign: 'center' }]} value={`${user?.firstname || ''} ${user?.lastname || ''}`} editable={false} />
                            <Text style={QuotationFormStepStyle.sigText}>Signature over printed name</Text>
                        </View>
                        <View style={QuotationFormStepStyle.sigLine}>
                            <TextInput style={[QuotationFormStepStyle.paperInput, { width: '100%', textAlign: 'center' }]} value={currentDateLong} editable={false} />
                            <Text style={QuotationFormStepStyle.sigText}>Date</Text>
                        </View>
                    </View>
                </View>

                <View style={QuotationFormStepStyle.footerContainer}>
                    <TouchableOpacity style={QuotationAllInStyle.proceedButton} onPress={handleNext}>
                        <Text style={QuotationAllInStyle.proceedButtonText}>Next: Terms & Conditions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={QuotationFormStepStyle.backTextButton} onPress={() => navigation.goBack()}>
                        <Text style={QuotationFormStepStyle.backText}>Back to Traveler Info</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal visible={!!activeDropdown} transparent animationType="fade">
                <TouchableOpacity
                    style={QuotationFormStepStyle.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setActiveDropdown(null)}
                >
                    <View style={QuotationFormStepStyle.dropdownBox}>
                        {renderDropdownOptions()}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}
