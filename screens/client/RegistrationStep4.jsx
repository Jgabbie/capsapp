import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Image, Modal } from 'react-native';
import RegistrationFormStyle from '../../styles/clientstyles/RegistrationFormStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import ModalStyle from '../../styles/componentstyles/ModalStyle'; // 🔥 IMPORTED MODAL STYLES 🔥
import { useUser } from '../../context/UserContext';

const formatLongDate = (dateVal) => {
    if (!dateVal) return "";
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateVal).toLocaleDateString('en-US', options);
};

export default function RegistrationStep4({ route, navigation }) {
    const { user } = useUser();
    
    // State to control the confirmation modal
    const [isProceedModalOpen, setIsProceedModalOpen] = useState(false);

    // Catch all the data passed from Step 3
    const { setupData, travelerUploads, passengers, leadGuestInfo, medicalData, emergency } = route.params || {};

    const currentDateLong = formatLongDate(new Date());

    // Opens the modal instead of instantly navigating
    const handleOpenConfirmModal = () => {
        setIsProceedModalOpen(true);
    };

    // Actual submission function when "Proceed" is clicked inside the modal
    const confirmBooking = () => {
        setIsProceedModalOpen(false);
        navigation.navigate("paymentmode", { 
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

                    {/* Two Column Layout for the Final Terms */}
                    <View style={[RegistrationFormStyle.row, { alignItems: 'flex-start', marginTop: 10 }]}>
                        
                        {/* LEFT COLUMN */}
                        <View style={{ flex: 1, paddingRight: 5 }}>
                            <View style={[RegistrationFormStyle.headerBlue, { marginTop: 0, marginBottom: 5 }]}>
                                <Text style={RegistrationFormStyle.headerBlueText}>WAIVER & DISCLAIMER</Text>
                            </View>
                            <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 7, textAlign: 'justify', marginBottom: 15, lineHeight: 10 }}>
                                Our travel company is not liable for changes of flight, tours, and hotel accommodation due to weather, transportation, property renovation related issue, force majeure, acts of terrorism, and other unforseen events that is company's out of control. The client waives the right for any claims over the company as such incidents occur. Company is not liable for any offloading incidents may it be due to immigration or airline/airport measures or any reasons beyond the company's control and as such, no refund can be made whatsoever. Company has the right to proceed with the confirmation of the whole package or any services such as flight, hotel and tours even without prior notice. However, if there will be a change of any of the said services on the part of those tour operators, an email notification will be sent to the concerned participants informing of the said change/s.
                            </Text>

                            <View style={[RegistrationFormStyle.headerBlue, { marginTop: 0, marginBottom: 5 }]}>
                                <Text style={RegistrationFormStyle.headerBlueText}>LEAD GUEST LIABILITIES AND RESPONSIBILITIES</Text>
                            </View>
                            <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 7, textAlign: 'justify', marginBottom: 8, lineHeight: 10 }}>
                                I am responsible in ensuring that all the participants have all the required documents necessary for travel abroad such as VISA and other related documents like Travel Authority for Government Employees, ARC or ALIEN REGISTRATION CARD and old passports for foreign passports or Balikbayans. Travel Clearance from DSWD for CHILD/MINORS NOT travelling with their parents etc.
                            </Text>
                            <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 7, textAlign: 'justify', marginBottom: 15, lineHeight: 10 }}>
                                I, the lead guest is the lead contact responsible for the whole group, I must disseminate any information I obtain from the company. The company is not liable for any miscommunication between members of the group. I am the sole mediator between the Travel Agency and the guests enlisted of this group. As the lead guest, all transactions related to our travel package will be communicated to and by me. I am responsible to coordinate with the respective authorities regarding the safety protocols in our destinations as well as to provide their requirements. I am aware that travel insurance is highly suggested for convenience, if any assistance from travel and tours company. I understand that our FINAL travel documents will be provided 3-7 days before departure or as soon as available as your trip will be required to be finalized before being sent to our valued clients.
                            </Text>
                        </View>

                        {/* RIGHT COLUMN */}
                        <View style={{ flex: 1, paddingLeft: 5, borderLeftWidth: 1, borderColor: '#ccc' }}>
                            <View style={[RegistrationFormStyle.headerBlue, { marginTop: 0, marginBottom: 5 }]}>
                                <Text style={RegistrationFormStyle.headerBlueText}>SECURITY DEPOSITS</Text>
                            </View>
                            <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 7, textAlign: 'justify', marginBottom: 15, lineHeight: 10 }}>
                                Certain hotels and resorts require a security deposit to cover potential charges, damages, or additional services used during stay. The security deposit is payable directly to M&RC. The hotel may deduct from the security deposit for, but not limited to, damage to hotel property, missing items, smoking penalties, unpaid bills or incidental expenses, excessive cleaning charges.
                            </Text>

                            <View style={[RegistrationFormStyle.headerBlue, { marginTop: 0, marginBottom: 5 }]}>
                                <Text style={RegistrationFormStyle.headerBlueText}>PURCHASING OF DOMESTIC TICKETS</Text>
                            </View>
                            <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 7, textAlign: 'justify', marginBottom: 15, lineHeight: 10 }}>
                                For purchased International tour packages to VISA countries, purchasing of domestic tickets or any tour activities prior to VISA issuance is highly discouraged. Non-compliance to this doesn't make the company liable to any applicable penalties to be paid to the airline in case of any changes in the booking. For non VISA countries, it is highly suggested to book domestic tickets that has atleast 14 hours to 24 hours allowance to your international flight for possible flight changes and delays. The Travel and Tour comapny is not liable for any missed connections resulting from the flight cancellations, delays, or changes to the itinerary whether it will be purchased outside the company or by client's own account.
                            </Text>

                            <View style={[RegistrationFormStyle.headerBlue, { marginTop: 0, marginBottom: 5 }]}>
                                <Text style={RegistrationFormStyle.headerBlueText}>PACKAGE</Text>
                            </View>
                            <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 7, textAlign: 'justify', marginBottom: 15, lineHeight: 10 }}>
                                Some packages requires a certain number of passengers in order to proceed. In the event that the required number of travelers was not met by the travel company and tour operator, they have the right to transfer passengers with PREVIOUS DENIED VISA will not be accepted. Some documents are needed to be submitted to the embassy/immigration if necessary. The rate quoted is based on a minimum number of travelers per departure. Lead guest must understand that the rate will vary if minimum number of travlers was not met or is subject to new quotation.
                            </Text>

                            {/* RED FINAL WAIVER TEXT */}
                            <Text style={{ fontFamily: "Montserrat_700Bold", fontWeight: 'bold', fontStyle: 'italic', fontSize: 8, textAlign: 'justify', color: '#d32f2f', lineHeight: 11 }}>
                                I have read and understand the Terms & Conditions detailed above and the Special Booking Conditions as stated out in the T&C of the tour package quotation I have availed, and accept them on behalf of myself and my party.
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
                    {/* 🔥 UPDATED: Submit Button to trigger Modal 🔥 */}
                    <TouchableOpacity 
                        style={[QuotationAllInStyle.proceedButton, { backgroundColor: '#28a745' }]}
                        onPress={handleOpenConfirmModal}
                    >
                        <Text style={QuotationAllInStyle.proceedButtonText}>SUBMIT FINAL BOOKING</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={RegistrationFormStyle.backTextButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={RegistrationFormStyle.backText}>Back to Disclaimers</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* 🔥 NEW: Proceed to Booking Modal matching the Web version 🔥 */}
            <Modal transparent animationType='fade' visible={isProceedModalOpen} onRequestClose={() => setIsProceedModalOpen(false)}>
                <View style={ModalStyle.modalOverlay}>
                    <View style={[ModalStyle.modalBox, { width: '90%', paddingHorizontal: 20, paddingVertical: 25 }]}>
                        
                        <Text style={[ModalStyle.modalTitle, { fontSize: 20, textAlign: 'center', marginBottom: 15 }]}>
                            Proceed to Booking
                        </Text>

                        <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                            <Text style={[ModalStyle.modalText, { textAlign: 'justify', marginBottom: 12, lineHeight: 20 }]}>
                                Make sure that you have read the terms and conditions before proceeding. The travel agency will not be tolerating any type of tampering and modifications in the booking details. Once, you have proceed with the booking, you will not be able to change or modify any of the booking details. If you have any concerns or questions regarding your booking, please contact our customer support for assistance.
                            </Text>
                            
                            <Text style={[ModalStyle.modalText, { textAlign: 'justify', marginBottom: 12, lineHeight: 20 }]}>
                                By clicking the "Proceed" button, you acknowledge that you have read and understood the terms and conditions of your booking, and you agree to proceed with the booking process. Please ensure that all the information you provided is accurate and complete before confirming your booking.
                            </Text>
                            
                            <Text style={[ModalStyle.modalText, { textAlign: 'center', marginBottom: 15, lineHeight: 20 }]}>
                                Thank you for choosing our travel services. We look forward to providing you with an unforgettable travel experience!
                            </Text>
                            
                            <Text style={[ModalStyle.modalText, { textAlign: 'center', color: '#b54747', fontFamily: 'Montserrat_600SemiBold', fontSize: 11, marginBottom: 10 }]}>
                                Note: Once you click the "Proceed" button, your booking will be submitted and cannot be modified. Please review all details carefully before proceeding.
                            </Text>
                            
                            <Text style={[ModalStyle.modalText, { textAlign: 'center', color: '#b54747', fontFamily: 'Montserrat_600SemiBold', fontSize: 11, marginBottom: 15 }]}>
                                If you have any questions or need further assistance, please contact our customer support team before proceeding.
                            </Text>
                        </ScrollView>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 10 }}>
                            <TouchableOpacity style={[ModalStyle.modalButton, { flex: 1, backgroundColor: '#305797' }]} onPress={confirmBooking}>
                                <Text style={ModalStyle.modalButtonText}>Proceed</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[ModalStyle.modalCancelButton, { flex: 1, backgroundColor: '#b54747', borderWidth: 0 }]} onPress={() => setIsProceedModalOpen(false)}>
                                <Text style={[ModalStyle.modalButtonText, { color: '#fff' }]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}