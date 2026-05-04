import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import RegistrationFormStyle from '../../styles/clientstyles/RegistrationFormStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import { useUser } from '../../context/UserContext';

const formatLongDate = (dateVal) => {
    if (!dateVal) return "";
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateVal).toLocaleDateString('en-US', options);
};

export default function RegistrationStep3({ route, navigation }) {
    const { user } = useUser();
    // Pass all previous data forward
    const { setupData, travelerUploads, passengers, leadGuestInfo, medicalData, emergency } = route.params || {};

    const currentDateLong = formatLongDate(new Date());

    const handleNext = () => {
        // Move to the final Terms & Conditions step (Step 4)
        navigation.navigate("registrationstep4", { 
            setupData, travelerUploads, passengers, leadGuestInfo, medicalData, emergency 
        });
    };

    return (
        <SafeAreaView style={RegistrationFormStyle.safeArea}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={RegistrationFormStyle.scrollViewContent} showsVerticalScrollIndicator={false}>
                
                <View style={RegistrationFormStyle.paperPage}>
                    {/* Logo */}
                    <Image source={require('../../assets/images/LastPushLogo.png')} style={RegistrationFormStyle.logo} />

                    {/* Payment Details Section */}
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontFamily: "Montserrat_700Bold", fontSize: 10, color: '#000', marginBottom: 5 }}>PAYMENT DETAILS</Text>
                        <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 7, color: '#000', textAlign: 'justify', marginBottom: 8, lineHeight: 11 }}>
                            We have multiple payment channels (BDO, GCASH, CC MAYA) with accounts names under M&RC TRAVEL AND TOURS and its owners, MR. RHON CARLE & MRS. MARICAR CARLE. Payments can only be paid directly to these accounts through online transfers, bank transfers, direct deposit or via credit card (via MAYA payment physical only with surcharge of <Text style={{ color: '#d32f2f', fontFamily: "Roboto_700Bold", fontWeight: 'bold' }}>3.5%</Text>).
                        </Text>
                        <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 7, color: '#000', textAlign: 'justify', lineHeight: 11 }}>
                            As the lead guest and the sole mediator between the Travel Agency and the guests enlisted of this group, I hereby confirm that all the above information is correct and true and I am happy for M&RC Travel and Tours to access this information when organizing this trip/travel for me.
                        </Text>
                    </View>

                    {/* Gold Header */}
                    <View style={RegistrationFormStyle.headerGold}>
                        <Text style={RegistrationFormStyle.headerGoldText}>GENERAL PACKAGE DISCLAIMER, TERMS & CONDITIONS</Text>
                    </View>

                    {/* Two Column Layout for the Terms */}
                    <View style={[RegistrationFormStyle.row, { alignItems: 'flex-start', marginTop: 10 }]}>
                        
                        {/* LEFT COLUMN */}
                        <View style={{ flex: 1, paddingRight: 5 }}>
                            {/* 🔥 Made this explicitly bold and slightly larger for mobile screens 🔥 */}
                            <Text style={{ fontFamily: "Montserrat_700Bold", fontWeight: 'bold', fontStyle: 'italic', fontSize: 8, textAlign: 'justify', marginBottom: 8, lineHeight: 11, color: '#000' }}>
                                Complete and signed copy this form must be sent together with all the participant's PASSPORT COPIES (for international) or VALID ID's (for domestic). Failure to send accomplished form will be subject to penalties or cancellation of your package. Upon completion of your booking process and deposit, you will receive a Booking Confirmation of your purchase and registration.
                            </Text>
                            <Text style={{ fontFamily: "Montserrat_700Bold", fontWeight: 'bold', fontStyle: 'italic', fontSize: 8, textAlign: 'justify', marginBottom: 15, lineHeight: 11, color: '#000' }}>
                                By making any payments or purchase, this shall mean that you have read and agreed to the terms and conditions set forth in the quotation proposed to you before purchasing.
                            </Text>

                            <View style={[RegistrationFormStyle.headerBlue, { marginTop: 0, marginBottom: 5 }]}>
                                <Text style={RegistrationFormStyle.headerBlueText}>PAYMENTS & PENALTIES</Text>
                            </View>
                            <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 7, textAlign: 'justify', marginBottom: 15, lineHeight: 10 }}>
                                If you choose installment, you need to follow the payment schedule and failure to do so will be subject to penalties and/or cancellation of your tour package. We can only acknowledge payments that are directly paid to us by cash (at our office) and bank deposit or online cashless transfers to our official payment channels. Other mode of payments such as payment through a specific person such as M&RC Travel and Tours Staffs will not be honoured.
                            </Text>

                            <View style={[RegistrationFormStyle.headerBlue, { marginTop: 0, marginBottom: 5 }]}>
                                <Text style={RegistrationFormStyle.headerBlueText}>CANCELLATION POLICY</Text>
                            </View>
                            <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 7, textAlign: 'justify', marginBottom: 15, lineHeight: 10 }}>
                                Please refer to the quotation sent to you. All tour packages will not be converted to any travel funds in case the tour will not push through whether it be government mandated, due to natural calamities, etc. Tour package purchase is non-refundable, non-reroutable, non-rebookable, and non-transferable unless otherwise stated and is due to natural calamities and force majeur that is beyond our control otherwise NON-REFUNDABLE.
                            </Text>
                        </View>

                        {/* RIGHT COLUMN */}
                        <View style={{ flex: 1, paddingLeft: 5, borderLeftWidth: 1, borderColor: '#ccc' }}>
                            <View style={[RegistrationFormStyle.headerBlue, { marginTop: 0, marginBottom: 5 }]}>
                                <Text style={RegistrationFormStyle.headerBlueText}>AMENDMENTS</Text>
                            </View>
                            <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 7, textAlign: 'justify', marginBottom: 15, lineHeight: 10 }}>
                                Any amendment request such as changes in name (MINOR spelling only) date of birth of the passenger may have applicable charges.
                            </Text>

                            <View style={[RegistrationFormStyle.headerBlue, { marginTop: 0, marginBottom: 5 }]}>
                                <Text style={RegistrationFormStyle.headerBlueText}>PASSPORT & VISAS</Text>
                            </View>
                            <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 7, textAlign: 'justify', marginBottom: 8, lineHeight: 10 }}>
                                Make sure your passport/ID is valid at least 6 months PRIOR to your onward and return date to avoid inconvenience. Our travel company is not liable for refusal of boarding due to passport validity. For VISA assistance, failure to comply with the requirements on the deadlines may automatically result to cancellation of package. Submission of VISA applications through travel agencies does not guarantee VISA approval. The discretion still lies upon the consul and company is not liable for such decision. Our travel company will try our best to have your VISA approved but in the event of denied VISA, the amount indicated in the cancellation/refund policy per person is non-refundable since airline, hotel and tour are all confirmed and guaranteed prior to VISA issuance.
                            </Text>
                            <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 7, textAlign: 'justify', marginBottom: 8, lineHeight: 10 }}>
                                We appreciate honest declaration to avoid confusion/disapproval of VISA/Documents and/or prolonged processing. Any fake documents submitted for VISA application processing will be confiscated and payments will be forfeited. This includes tampered and illegally procured documents as verified by respective agencies. Moreover, the company has the right to file charges against you.
                            </Text>
                            <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 7, textAlign: 'justify', marginBottom: 15, lineHeight: 10 }}>
                                Original passport, with approve VISA will be release only once fully paid, once there is a valid travel or reason to secure the passport, client must submit notarized reasons and stating for the compliance and to paid the balance as stated in the due date.
                            </Text>
                        </View>

                    </View>

                    {/* Signature Block */}
                    <View style={[RegistrationFormStyle.signatureBlock, { marginTop: 30 }]}>
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

                {/* Footer Navigation Buttons */}
                <View style={RegistrationFormStyle.footerContainer}>
                    <TouchableOpacity 
                        style={QuotationAllInStyle.proceedButton}
                        onPress={handleNext}
                    >
                        <Text style={QuotationAllInStyle.proceedButtonText}>Next: Terms & Conditions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={RegistrationFormStyle.backTextButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={RegistrationFormStyle.backText}>Back to Dietary & Insurance</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}