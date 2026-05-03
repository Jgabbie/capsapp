import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import Constants from 'expo-constants';
import dayjs from 'dayjs';

import QuotationBookingProcessStyle from '../../styles/clientstyles/QuotationBookingProcessStyle';
import ModalStyle from '../../styles/componentstyles/ModalStyle';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { api, withUserHeader } from '../../utils/api';
import { useUser } from '../../context/UserContext';

const formatPeso = (value) => `₱${(Number(value) || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const getImageUrl = (img) => {
    if (!img) return 'https://via.placeholder.com/800x500?text=No+Image';
    if (img.startsWith('http') || img.startsWith('data:')) return img;

    const hostUri = Constants.expoConfig?.hostUri || '';
    const host = Platform.OS === 'web' ? 'localhost' : (hostUri.split(':')[0] || '10.0.2.2');
    return `http://${host}:8000/${String(img).replace(/^\/+/, '')}`;
};

const formatTravelDates = (details) => {
    const value = details?.travelDates || details?.preferredDates || details?.travelDate || details?.preferredDate;
    if (!value) return 'Not set';

    if (Array.isArray(value) && value.length >= 2) {
        return `${dayjs(value[0]).format('MMM DD, YYYY')} - ${dayjs(value[1]).format('MMM DD, YYYY')}`;
    }

    if (typeof value === 'object') {
        const start = value.startDate || value.startdaterange || value.start;
        const end = value.endDate || value.enddaterange || value.end;
        if (start && end) {
            return `${dayjs(start).format('MMM DD, YYYY')} - ${dayjs(end).format('MMM DD, YYYY')}`;
        }
    }

    return dayjs(value).isValid() ? dayjs(value).format('MMM DD, YYYY') : String(value);
};

const formatTravelers = (travelers) => {
    if (!travelers) return 'N/A';
    if (typeof travelers === 'number') return `Adult: ${travelers}`;

    const adult = Number(travelers.adult) || 0;
    const child = Number(travelers.child) || 0;
    const infant = Number(travelers.infant) || 0;
    const parts = [`Adult: ${adult}`];
    if (child > 0) parts.push(`Child: ${child}`);
    if (infant > 0) parts.push(`Infant: ${infant}`);
    return parts.join(', ');
};

export default function QuotationBookingProcess() {
    const navigation = useNavigation();
    const route = useRoute();
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const { user } = useUser();
    const [quotation, setQuotation] = useState(route.params?.quotation || null);
    const [packageData, setPackageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGoBackModalOpen, setIsGoBackModalOpen] = useState(false);

    // Expecting quotation data passed from UserQuotationRequest
    const quotationId = route.params?.quotationId || route.params?.id || route.params?.quotation?._id;

    useEffect(() => {
        const fetchData = async () => {
            if (!quotationId || !user?._id) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(`/quotation/get-quotation/${quotationId}`, withUserHeader(user._id));
                const payload = response.data || response;
                setQuotation(payload);

                const packageId = payload?.packageId?._id || payload?.packageId;
                if (packageId) {
                    const pkgResponse = await api.get(`/package/get-package/${packageId}`);
                    setPackageData(pkgResponse.data || pkgResponse);
                }
            } catch (error) {
                console.error('Failed to load quotation booking summary:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [quotationId, user?._id]);

    const details = quotation?.latestPdfRevision?.travelDetails || quotation?.travelDetails || quotation?.quotationDetails || {};
    const pkg = packageData || quotation?.packageId || { packageName: quotation?.packageName };

    const packageImages = useMemo(() => {
        return packageData?.images || packageData?.packageImages || pkg?.images || pkg?.packageImages || [];
    }, [packageData, pkg]);

    const travelers = details.travelers || quotation?.travelers || { adult: 1, child: 0, infant: 0 };
    const travelerCount =
        typeof travelers === 'number'
            ? travelers
            : (Number(travelers.adult) || 0) + (Number(travelers.child) || 0) + (Number(travelers.infant) || 0);
    const bookingType = travelerCount <= 1 ? 'Solo Booking' : 'Group Booking';
    const packageType = (packageData?.packageType || pkg?.packageType || details.packageType || 'domestic').toString();
    const airline = details.preferredAirlines || details.flightDetails?.flightAirline || 'N/A';
    const hotel = details.preferredHotels || 'N/A';
    const travelDates = formatTravelDates(details);
    const totalAmount = Number(
        quotation?.latestPdfRevision?.travelDetails?.totalPrice ||
        details.totalPrice ||
        details.travelDatePrice ||
        details.budgetRange?.[0] ||
        details.budgetRange?.[1] ||
        0
    );

    return (
        <SafeAreaView style={QuotationBookingProcessStyle.safeArea}>
            <StatusBar barStyle="dark-content" />
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={[QuotationBookingProcessStyle.container, { paddingBottom: 30 }]} showsVerticalScrollIndicator={false}>
                <View style={QuotationBookingProcessStyle.headerRow}>
                    <View style={QuotationBookingProcessStyle.titleGroup}>
                        <Text style={QuotationBookingProcessStyle.mainTitle}>Booking Summary</Text>
                        <Text style={QuotationBookingProcessStyle.subtitle}>Kindly check the details of your booking before proceeding.</Text>
                    </View>
                    <TouchableOpacity onPress={() => setIsGoBackModalOpen(true)} style={QuotationBookingProcessStyle.backButton}>
                        <Text style={QuotationBookingProcessStyle.backButtonText}>BACK</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={QuotationBookingProcessStyle.bookingDetailsCard}>
                        <Text style={QuotationBookingProcessStyle.breakdownValue}>Loading booking summary...</Text>
                    </View>
                ) : null}

                {packageImages.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={QuotationBookingProcessStyle.imageScrollContainer}>
                        {packageImages.map((img, index) => (
                            <Image
                                key={index}
                                source={getImageUrl(img)}
                                style={QuotationBookingProcessStyle.summaryScrollImage}
                                contentFit="cover"
                                transition={300}
                            />
                        ))}
                    </ScrollView>
                )}

                <View style={QuotationBookingProcessStyle.bookingDetailsCard}>
                    <Text style={[QuotationBookingProcessStyle.bookingDetailsTitle, { marginBottom: 5, borderBottomWidth: 0, paddingBottom: 0 }]}>Overview</Text>
                    <Text style={[QuotationBookingProcessStyle.subtitle, { marginBottom: 25, marginTop: 0 }]}>Confirm your tour package, travel dates, and traveler details before proceeding.</Text>
                    <Text style={[QuotationBookingProcessStyle.bookingDetailsTitle, { marginBottom: 15, borderBottomWidth: 0, paddingBottom: 0 }]}>Booking Details</Text>
                    <View style={{ height: 1, backgroundColor: '#e2e8f0', marginBottom: 15 }} />

                    <View style={QuotationBookingProcessStyle.detailRowBreakdown}>
                        <Text style={QuotationBookingProcessStyle.breakdownLabel}>Tour Package</Text>
                        <Text style={[QuotationBookingProcessStyle.breakdownValue, { fontFamily: 'Montserrat_700Bold', color: '#1f2a44', textTransform: 'uppercase' }]} numberOfLines={2}>
                            {pkg?.packageName || pkg?.title || quotation?.packageName || 'TOUR PACKAGE'}
                        </Text>
                    </View>

                    <View style={QuotationBookingProcessStyle.detailRowBreakdown}>
                        <Text style={QuotationBookingProcessStyle.breakdownLabel}>Booking Type</Text>
                        <Text style={QuotationBookingProcessStyle.breakdownValue}>{bookingType}</Text>
                    </View>

                    <View style={QuotationBookingProcessStyle.detailRowBreakdown}>
                        <Text style={QuotationBookingProcessStyle.breakdownLabel}>Travel Date</Text>
                        <Text style={QuotationBookingProcessStyle.breakdownValue}>{travelDates}</Text>
                    </View>

                    <View style={QuotationBookingProcessStyle.detailRowBreakdown}>
                        <Text style={QuotationBookingProcessStyle.breakdownLabel}>Airline / Hotel</Text>
                        <Text style={QuotationBookingProcessStyle.breakdownValue} numberOfLines={2}>{airline} · {hotel}</Text>
                    </View>

                    <View style={[QuotationBookingProcessStyle.detailRowBreakdown, { borderBottomWidth: 0 }]}>
                        <Text style={QuotationBookingProcessStyle.breakdownLabel}>Travelers</Text>
                        <Text style={QuotationBookingProcessStyle.breakdownValue}>{formatTravelers(travelers)}</Text>
                    </View>
                </View>

                <View style={QuotationBookingProcessStyle.totalAmountCard}>
                    <Text style={QuotationBookingProcessStyle.totalLabel}>Total Amount</Text>
                    <Text style={QuotationBookingProcessStyle.totalValue}>{formatPeso(totalAmount)}</Text>
                    <Text style={QuotationBookingProcessStyle.totalFinePrint}>
                        *All inclusions fees for this package are already factored in the total price, execpt for Visas and other additionals. For solo booking, rate has already been applied in the total price.
                    </Text>

                    <View style={QuotationBookingProcessStyle.packageTypeCard}>
                        <Text style={QuotationBookingProcessStyle.packageTypeLabel}>Package Type:</Text>
                        <Text style={QuotationBookingProcessStyle.packageTypeValue}>{packageType}</Text>
                    </View>
                </View>

                <TouchableOpacity style={QuotationBookingProcessStyle.proceedButton} onPress={() => navigation.navigate('quotationincluexclu', { quotation })}>
                    <Text style={QuotationBookingProcessStyle.proceedButtonText}>Itinerary, Inclusions & Exclusions</Text>
                </TouchableOpacity>

                <View style={{ height: 60 }} />
            </ScrollView>

            <Modal transparent animationType='fade' visible={isGoBackModalOpen} onRequestClose={() => setIsGoBackModalOpen(false)}>
                <View style={ModalStyle.modalOverlay}>
                    <View style={[ModalStyle.modalBox, { width: '90%', paddingHorizontal: 20, paddingVertical: 25 }]}>
                        <Text style={[ModalStyle.modalTitle, { fontSize: 20, textAlign: 'center', marginBottom: 15, color: '#1f2a44' }]}>Go Back?</Text>

                        <Text style={[ModalStyle.modalText, { textAlign: 'center', marginBottom: 25, lineHeight: 22, color: '#555' }]}>
                            Are you sure you want to go back? If you go back, all the information you have entered in the booking form will reset and you will have to start the booking process from the beginning.
                        </Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                            <TouchableOpacity
                                style={[ModalStyle.modalButton, { flex: 1, backgroundColor: '#305797' }]}
                                onPress={() => {
                                    setIsGoBackModalOpen(false);
                                    navigation.goBack();
                                }}
                            >
                                <Text style={ModalStyle.modalButtonText}>Go Back</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[ModalStyle.modalCancelButton, { flex: 1, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1' }]}
                                onPress={() => setIsGoBackModalOpen(false)}
                            >
                                <Text style={[ModalStyle.modalButtonText, { color: '#475569' }]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
