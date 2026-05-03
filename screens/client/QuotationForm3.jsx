import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import QuotationFormStepStyle from '../../styles/clientstyles/QuotationFormStepStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import { useUser } from '../../context/UserContext';

const formatLongDate = (dateVal) => {
    if (!dateVal) return "";
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateVal).toLocaleDateString('en-US', options);
};

export default function QuotationForm3({ route, navigation }) {
    const { user } = useUser();
    const { quotation, travelerUploads, passengers, leadGuestInfo, medicalData, emergency } = route.params || {};

    const currentDateLong = formatLongDate(new Date());

    const handleNext = () => {
        navigation.navigate("quotationform4", {
            quotation, travelerUploads, passengers, leadGuestInfo, medicalData, emergency
        });
    };

    return (
        <SafeAreaView style={QuotationFormStepStyle.safeArea}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={QuotationFormStepStyle.scrollViewContent} showsVerticalScrollIndicator={false}>

                <View style={QuotationFormStepStyle.paperPage}>
                    <Image source={require('../../assets/images/Logo.png')} style={QuotationFormStepStyle.logo} />

                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontFamily: "Montserrat_700Bold", fontSize: 10, color: '#000', marginBottom: 5 }}>PAYMENT DETAILS</Text>
                        <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 7, color: '#000', textAlign: 'justify', marginBottom: 8, lineHeight: 11 }}>
                            We have multiple payment channels (BDO, GCASH, CC MAYA) with accounts names under M&RC TRAVEL AND TOURS and its owners, MR. RHON CARLE & MRS. MARICAR CARLE.
                        </Text>
                    </View>

                    <View style={QuotationFormStepStyle.headerGold}>
                        <Text style={QuotationFormStepStyle.headerGoldText}>GENERAL PACKAGE DISCLAIMER, TERMS & CONDITIONS</Text>
                    </View>

                    <View style={[QuotationFormStepStyle.row, { alignItems: 'flex-start', marginTop: 10 }]}>
                        <View style={{ flex: 1, paddingRight: 5 }}>
                            <Text style={{ fontFamily: "Montserrat_700Bold", fontWeight: 'bold', fontStyle: 'italic', fontSize: 8, textAlign: 'justify', marginBottom: 8, lineHeight: 11, color: '#000' }}>
                                Complete and signed copy this form must be sent together with all the participant's PASSPORT COPIES (for international) or VALID ID's (for domestic).
                            </Text>
                            <Text style={{ fontFamily: "Montserrat_700Bold", fontWeight: 'bold', fontStyle: 'italic', fontSize: 8, textAlign: 'justify', marginBottom: 15, lineHeight: 11, color: '#000' }}>
                                By making any payments or purchase, this shall mean that you have read and agreed to the terms and conditions set forth in the quotation proposed to you before purchasing.
                            </Text>

                            <View style={[QuotationFormStepStyle.headerBlue, { marginTop: 0, marginBottom: 5 }]}>
                                <Text style={QuotationFormStepStyle.headerBlueText}>PAYMENTS & PENALTIES</Text>
                            </View>
                            <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 7, textAlign: 'justify', marginBottom: 15, lineHeight: 10 }}>
                                If you choose installment, you need to follow the payment schedule and failure to do so will be subject to penalties and/or cancellation of your tour package.
                            </Text>
                        </View>

                        <View style={{ flex: 1, paddingLeft: 5, borderLeftWidth: 1, borderColor: '#ccc' }}>
                            <View style={[QuotationFormStepStyle.headerBlue, { marginTop: 0, marginBottom: 5 }]}>
                                <Text style={QuotationFormStepStyle.headerBlueText}>AMENDMENTS</Text>
                            </View>
                            <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 7, textAlign: 'justify', marginBottom: 15, lineHeight: 10 }}>
                                Any amendment request such as changes in name (MINOR spelling only) date of birth of the passenger may have applicable charges.
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
                        style={QuotationAllInStyle.proceedButton}
                        onPress={handleNext}
                    >
                        <Text style={QuotationAllInStyle.proceedButtonText}>Next: Terms & Conditions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={QuotationFormStepStyle.backTextButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={QuotationFormStepStyle.backText}>Back to Dietary & Insurance</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
