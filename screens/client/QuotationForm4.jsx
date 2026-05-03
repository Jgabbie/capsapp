import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Image, Modal } from 'react-native';
import QuotationFormStepStyle from '../../styles/clientstyles/QuotationFormStepStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import ModalStyle from '../../styles/componentstyles/ModalStyle';
import { useUser } from '../../context/UserContext';

const formatLongDate = (dateVal) => {
    if (!dateVal) return "";
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateVal).toLocaleDateString('en-US', options);
};

export default function QuotationForm4({ route, navigation }) {
    const { user } = useUser();
    const [isProceedModalOpen, setIsProceedModalOpen] = useState(false);

    const { quotation, travelerUploads, passengers, leadGuestInfo, medicalData, emergency } = route.params || {};

    const currentDateLong = formatLongDate(new Date());

    const handleOpenConfirmModal = () => {
        setIsProceedModalOpen(true);
    };

    const confirmBooking = () => {
        setIsProceedModalOpen(false);
        navigation.navigate("quotationpaymentmode", {
            quotation, travelerUploads, passengers, leadGuestInfo, medicalData, emergency
        });
    };

    return (
        <SafeAreaView style={QuotationFormStepStyle.safeArea}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={QuotationFormStepStyle.scrollViewContent} showsVerticalScrollIndicator={false}>

                <View style={QuotationFormStepStyle.paperPage}>
                    <Image source={require('../../assets/images/Logo.png')} style={QuotationFormStepStyle.logo} />

                    <View style={[QuotationFormStepStyle.row, { alignItems: 'flex-start', marginTop: 10 }]}>
                        <View style={{ flex: 1, paddingRight: 5 }}>
                            <View style={[QuotationFormStepStyle.headerBlue, { marginTop: 0, marginBottom: 5 }]}>
                                <Text style={QuotationFormStepStyle.headerBlueText}>WAIVER & DISCLAIMER</Text>
                            </View>
                            <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 7, textAlign: 'justify', marginBottom: 15, lineHeight: 10 }}>
                                Our travel company is not liable for changes of flight, tours, and hotel accommodation due to weather, transportation, property renovation related issue, force majeure, acts of terrorism, and other unforseen events.
                            </Text>
                        </View>

                        <View style={{ flex: 1, paddingLeft: 5, borderLeftWidth: 1, borderColor: '#ccc' }}>
                            <View style={[QuotationFormStepStyle.headerBlue, { marginTop: 0, marginBottom: 5 }]}>
                                <Text style={QuotationFormStepStyle.headerBlueText}>SECURITY DEPOSITS</Text>
                            </View>
                            <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 7, textAlign: 'justify', marginBottom: 15, lineHeight: 10 }}>
                                Certain hotels and resorts require a security deposit to cover potential charges, damages, or additional services used during stay.
                            </Text>
                        </View>
                    </View>

                    <View style={[QuotationFormStepStyle.signatureBlock, { marginTop: 30 }]}>
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
                    <TouchableOpacity
                        style={[QuotationAllInStyle.proceedButton, { backgroundColor: '#28a745' }]}
                        onPress={handleOpenConfirmModal}
                    >
                        <Text style={QuotationAllInStyle.proceedButtonText}>SUBMIT FINAL BOOKING</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={QuotationFormStepStyle.backTextButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={QuotationFormStepStyle.backText}>Back to Disclaimers</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal transparent animationType='fade' visible={isProceedModalOpen} onRequestClose={() => setIsProceedModalOpen(false)}>
                <View style={ModalStyle.modalOverlay}>
                    <View style={[ModalStyle.modalBox, { width: '90%', paddingHorizontal: 20, paddingVertical: 25 }]}>
                        <Text style={[ModalStyle.modalTitle, { fontSize: 20, textAlign: 'center', marginBottom: 15 }]}>Proceed to Booking</Text>

                        <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                            <Text style={[ModalStyle.modalText, { textAlign: 'justify', marginBottom: 12, lineHeight: 20 }]}>Make sure that you have read the terms and conditions before proceeding.</Text>
                            <Text style={[ModalStyle.modalText, { textAlign: 'center', marginBottom: 15, lineHeight: 20 }]}>Thank you for choosing our travel services.</Text>
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
