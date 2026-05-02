import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import QuotationBookingProcessStyle from '../../styles/clientstyles/QuotationBookingProcessStyle';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const formatPeso = (value) => `₱${(Number(value) || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

export default function QuotationBookingProcess() {
    const navigation = useNavigation();
    const route = useRoute();
    const [isSidebarVisible, setSidebarVisible] = useState(false);

    // Expecting quotation data passed from UserQuotationRequest
    const { quotation } = route.params || {};
    const pkg = quotation?.packageId || { packageName: quotation?.packageName };

    const totalAmount = quotation?.totalPrice || quotation?.amount || 0;

    return (
        <SafeAreaView style={QuotationBookingProcessStyle.safeArea}>
            <StatusBar barStyle="dark-content" />
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={[QuotationBookingProcessStyle.container, { paddingBottom: 30 }]} showsVerticalScrollIndicator={false}>
                <View style={QuotationBookingProcessStyle.headerRow}>
                    <View style={QuotationBookingProcessStyle.titleGroup}>
                        <Text style={QuotationBookingProcessStyle.mainTitle}>Booking Summary</Text>
                        <Text style={QuotationBookingProcessStyle.subtitle}>Review the details provided for this quotation.</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={QuotationBookingProcessStyle.backButton}>
                        <Text style={QuotationBookingProcessStyle.backButtonText}>BACK</Text>
                    </TouchableOpacity>
                </View>

                <View style={QuotationBookingProcessStyle.bookingDetailsCard}>
                    <Text style={QuotationBookingProcessStyle.bookingDetailsTitle}>Booking Details</Text>

                    <View style={QuotationBookingProcessStyle.detailRowBreakdown}>
                        <Text style={QuotationBookingProcessStyle.breakdownLabel}>Tour Package</Text>
                        <Text style={[QuotationBookingProcessStyle.breakdownValue, { fontFamily: 'Montserrat_700Bold', color: '#1f2a44', textTransform: 'uppercase' }]} numberOfLines={2}>
                            {pkg?.packageName || pkg?.title || 'TOUR PACKAGE'}
                        </Text>
                    </View>

                    <View style={QuotationBookingProcessStyle.detailRowBreakdown}>
                        <Text style={QuotationBookingProcessStyle.breakdownLabel}>Requested Date</Text>
                        <Text style={QuotationBookingProcessStyle.breakdownValue}>{quotation?.requestedDate || 'Not set'}</Text>
                    </View>

                    <View style={[QuotationBookingProcessStyle.detailRowBreakdown, { borderBottomWidth: 0 }]}>
                        <Text style={QuotationBookingProcessStyle.breakdownLabel}>Total Amount</Text>
                        <Text style={QuotationBookingProcessStyle.breakdownValue}>{formatPeso(totalAmount)}</Text>
                    </View>
                </View>

                <TouchableOpacity style={QuotationBookingProcessStyle.proceedButton} onPress={() => navigation.navigate('quotationincluexclu', { quotation })}>
                    <Text style={QuotationBookingProcessStyle.proceedButtonText}>Itinerary, Inclusions & Exclusions</Text>
                </TouchableOpacity>

                <View style={{ height: 60 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
