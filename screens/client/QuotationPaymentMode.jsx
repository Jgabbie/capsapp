import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from "dayjs";

import QuotationPaymentStyle from '../../styles/clientstyles/QuotationPaymentStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import RegistrationFormStyle from '../../styles/clientstyles/RegistrationFormStyle';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { api, withUserHeader } from '../../utils/api';
import { useUser } from '../../context/UserContext';

const formatPesoNumber = (value) => `${(Number(value) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatPeso = (value) => `₱${formatPesoNumber(value)}`;
const formatPesoDisplay = (value) => `PHP ${formatPesoNumber(value)}`;

const parseDateStringSafe = (dateStr) => {
    if (!dateStr) return null;
    try {
        const cleanStr = dateStr.replace(/,/g, '').trim();
        const parts = cleanStr.split(/\s+/);
        if (parts.length === 3) {
            const monthNames = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
            const month = monthNames[parts[0].slice(0, 3)];
            const day = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            if (!isNaN(month) && !isNaN(day) && !isNaN(year)) return new Date(year, month, day);
        }
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) return parsed;
    } catch (e) {
        return null;
    }
    return null;
};

export default function QuotationPaymentMode({ route, navigation }) {
    const { user } = useUser();
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const { quotation, travelerUploads, passengers, leadGuestInfo, medicalData, emergency, setupData } = route.params || {};

    const [paymentType, setPaymentType] = useState('deposit');
    const [frequency, setFrequency] = useState('Every 2 weeks');
    const [showFreqDropdown, setShowFreqDropdown] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState('');

    const pdfRevisions = Array.isArray(quotation?.pdfRevisions) ? quotation.pdfRevisions : [];
    const latestPdfRevision = pdfRevisions.length > 0 ? pdfRevisions[pdfRevisions.length - 1] : null;
    const travelDetails = latestPdfRevision?.travelDetails || {};

    console.log("Travel Details from PDF Revision: ", travelDetails);

    const packageName = quotation?.packageId?.packageName || 'N/A'
    const packageTravelDate = latestPdfRevision?.travelDetails.travelDates || 'N/A';
    const totalAmount = travelDetails?.totalPrice || 0;

    const travelerTotal = useMemo(() => {
        const counts = travelDetails.travelers;
        return counts.adult + counts.child + counts.infant;
    }, [quotation]);


    useEffect(() => {
        const fetchInvoiceNumber = async () => {
            try {
                // Try to use the same controller logic as BookingInvoice: allow passing a reference
                const reference = setupData?.reference || setupData?.ref || "--";
                const config = { ...(withUserHeader(user?._id) || {}), params: reference && reference !== "--" ? { reference } : {} };
                const invoiceRes = await api.get('/booking/bookings-total-month', config);
                const number = invoiceRes.data?.invoiceNumber;

                if (number) {
                    setInvoiceNumber(number);
                    return;
                }

                // If controller didn't return a prebuilt invoiceNumber, construct using sequence/total
                const total = Number(invoiceRes.data?.totalBookings || 0);
                const createdAtValue = setupData?.createdAt || setupData?.bookingDate || new Date();
                const monthKey = dayjs(createdAtValue).format('MM');
                const sequence = Number(invoiceRes.data?.sequence || total + 1) || total + 1;
                setInvoiceNumber(`${monthKey}${String(sequence).padStart(2, '0')}`);
                return;
            } catch (error) {
                console.log('Error fetching monthly invoice number:', error.message);
            }

            // Fallback: current month with sequence 01
            const fallbackMonth = dayjs().format('MM');
            setInvoiceNumber(`${fallbackMonth}01`);
        };

        fetchInvoiceNumber();
    }, [user?._id, setupData]);


    const buildInvoiceNumber = (allBookings, currentBooking) => {
        if (!currentBooking) return "";
        const createdAtValue = currentBooking.bookingDate || currentBooking.createdAt;
        const createdAt = createdAtValue ? dayjs(createdAtValue) : null;
        if (!createdAt || !createdAt.isValid()) return "";

        const getIdentity = (item) =>
            String(item?._id || item?.id || item?.reference || item?.ref || "");

        const currentIdentity = getIdentity(currentBooking);
        const monthKey = createdAt.format("MM");

        const monthBookings = (allBookings || [])
            .map((item) => ({
                ...item,
                _createdAt: item.bookingDate || item.createdAt,
                _identity: getIdentity(item)
            }))
            .filter((item) => item._createdAt && dayjs(item._createdAt).isValid())
            .filter((item) => dayjs(item._createdAt).isSame(createdAt, "month"));

        monthBookings.sort((a, b) => {
            const timeDiff = dayjs(a._createdAt).valueOf() - dayjs(b._createdAt).valueOf();
            if (timeDiff !== 0) return timeDiff;
            return a._identity.localeCompare(b._identity);
        });

        let index = monthBookings.findIndex((item) => item._identity === currentIdentity);

        if (index < 0) {
            const currentRef = String(currentBooking.reference || currentBooking.ref || "");
            if (currentRef) {
                index = monthBookings.findIndex(
                    (item) => String(item.reference || item.ref || "") === currentRef
                );
            }
        }

        const sequence = index >= 0 ? index + 1 : monthBookings.length + 1;
        return `${monthKey}${String(sequence).padStart(2, "0")}`;
    };


    const scheduleData = useMemo(() => {
        const getFrequencyWeeks = (val) => {
            if (val === 'Every week') return 1;
            if (val === 'Every 3 weeks') return 3;
            return 2;
        };

        const freqWeeks = getFrequencyWeeks(frequency);
        const today = dayjs().startOf('day');
        let travelDateComputation = today;

        const rawTravelDate = quotation?.travelDate?.startDate || (quotation?.selectedDate ? quotation.selectedDate.split(' - ')[0] : null);
        if (rawTravelDate) {
            const parsedJsDate = parseDateStringSafe(rawTravelDate);
            if (parsedJsDate) travelDateComputation = dayjs(parsedJsDate).startOf('day');
        }

        const maxAllowedDate = today.add(45, 'day');
        const dueCutoffDate = travelDateComputation.isBefore(maxAllowedDate) ? travelDateComputation : maxAllowedDate;

        const depositAmount = (travelDetails.totalDeposit || 0) * travelerTotal;
        const remainingAmount = Math.max(totalAmount - depositAmount, 0);

        const paymentDates = [];
        let nextDate = today.add(freqWeeks, 'week');

        while (nextDate.isBefore(dueCutoffDate) || nextDate.isSame(dueCutoffDate, 'day')) {
            paymentDates.push(nextDate);
            nextDate = nextDate.add(freqWeeks, 'week');
        }

        if (paymentDates.length === 0) paymentDates.push(dueCutoffDate.subtract(1, 'day'));

        const installmentCount = paymentDates.length;
        const installmentAmount = installmentCount ? remainingAmount / installmentCount : 0;

        const schedule = [
            { label: 'Deposit', amount: depositAmount, date: today.toISOString() },
            ...paymentDates.map((date, index) => ({ label: `Installment ${index + 1}`, amount: installmentAmount, date: date.toISOString() }))
        ];

        return { schedule, depositAmount };
    }, [frequency, travelerTotal, totalAmount, quotation]);

    const handleProceed = () => {
        const amountToPay = paymentType === 'deposit' ? scheduleData.depositAmount : totalAmount;
        navigation.navigate("quotationpaymentmethod", {
            ...route.params,
            paymentType,
            frequency,
            amountToPay,
            fullSchedule: scheduleData.schedule
        });
    };

    const issueDate = dayjs();
    const lastInstallmentDate = scheduleData.schedule.length > 0 ? dayjs(scheduleData.schedule[scheduleData.schedule.length - 1].date) : dayjs();
    const amountToCharge = paymentType === 'deposit' ? scheduleData.depositAmount : totalAmount;
    const dueDateDisplay = paymentType === 'deposit' ? lastInstallmentDate : issueDate;
    const customerName = leadGuestInfo?.fullName || `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Customer';
    const ratePerPax = travelerTotal > 0 ? totalAmount / travelerTotal : totalAmount;
    const packageTitleDisplay = quotation?.pkg?.title || quotation?.pkg?.packageName || 'TOUR PACKAGE';
    const displayTravelDate = quotation?.selectedDate ? quotation.selectedDate : (quotation?.travelDate?.startDate ? `${dayjs(quotation.travelDate.startDate).format("MMM D, YYYY")} - ${dayjs(quotation.travelDate.endDate).format("MMM D, YYYY")}` : 'TBD');

    return (
        <SafeAreaView style={QuotationPaymentStyle.safeArea}>
            <StatusBar barStyle="dark-content" />
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={QuotationPaymentStyle.container} showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#305797', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 16 }}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={16} color="#fff" />
                    <Text style={{ color: '#fff', fontFamily: 'Montserrat_600SemiBold', marginLeft: 6, fontSize: 14 }}>Back</Text>
                </TouchableOpacity>

                <Text style={QuotationPaymentStyle.sectionTitle}>Mode of Payment</Text>
                <Text style={QuotationPaymentStyle.sectionSubtitle}>Select your mode of payment.</Text>

                <View style={QuotationPaymentStyle.progressContainer}>
                    <View style={[QuotationPaymentStyle.progressStep, QuotationPaymentStyle.progressStepActive]}><Text style={QuotationPaymentStyle.progressText}>1</Text></View>
                    <View style={QuotationPaymentStyle.progressLine} />
                    <View style={QuotationPaymentStyle.progressStep}><Text style={[QuotationPaymentStyle.progressText, { color: '#64748b' }]}>2</Text></View>
                </View>

                <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontFamily: "Montserrat_700Bold", fontSize: 18, color: "#1f2a44", marginBottom: 4 }}>Booking Invoice</Text>
                    <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 12, color: "#4b5563" }}>Please review your booking invoice before proceeding to payment.</Text>
                </View>

                <View style={QuotationPaymentStyle.previewButtonContainer}>
                    <View style={QuotationPaymentStyle.previewHeader}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={QuotationPaymentStyle.previewLabel}>Package:</Text>
                            <Text style={QuotationPaymentStyle.previewValue} numberOfLines={2}>{packageName}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                            <Text style={QuotationPaymentStyle.previewLabel}>Travelers:</Text>
                            <Text style={QuotationPaymentStyle.previewValue}>{travelerTotal} Person(s)</Text>
                        </View>
                    </View>
                    <View style={QuotationPaymentStyle.previewTotalRow}>
                        <Text style={QuotationPaymentStyle.previewTotalLabel}>GRAND TOTAL:</Text>
                        <Text style={QuotationPaymentStyle.previewTotalAmount}>{formatPeso(totalAmount)}</Text>
                    </View>
                    <TouchableOpacity style={QuotationPaymentStyle.previewBtn} onPress={() => setShowInvoiceModal(true)}>
                        <Ionicons name="document-text-outline" size={18} color="#305797" />
                        <Text style={QuotationPaymentStyle.previewBtnText}>Preview Booking Invoice</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    activeOpacity={0.9}
                    style={[QuotationPaymentStyle.modeCard, paymentType === 'deposit' && QuotationPaymentStyle.modeCardSelected]}
                    onPress={() => setPaymentType('deposit')}
                >
                    <View style={[QuotationPaymentStyle.radioCircle, paymentType === 'deposit' && QuotationPaymentStyle.radioCircleSelected]}>
                        {paymentType === 'deposit' && <View style={QuotationPaymentStyle.radioInner} />}
                    </View>
                    <View style={QuotationPaymentStyle.modeContent}>
                        <Text style={QuotationPaymentStyle.modeTitle}>Deposit</Text>
                        <Text style={QuotationPaymentStyle.modeDesc}>Make a partial payment to secure your booking. Choose this option to pay a portion of the total amount.</Text>

                        {paymentType === 'deposit' && (
                            <View style={{ marginTop: 12 }}>
                                <Text style={{ fontFamily: "Montserrat_600SemiBold", fontSize: 12, color: "#1f2a44", marginBottom: 6 }}>Payment Schedule:</Text>
                                <TouchableOpacity style={QuotationPaymentStyle.pickerContainer} onPress={() => setShowFreqDropdown(true)}>
                                    <Text style={{ fontSize: 13, fontFamily: 'Roboto_500Medium', color: '#1f2a44' }}>{frequency}</Text>
                                    <Ionicons name="chevron-down" size={18} color="#64748b" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.9}
                    style={[QuotationPaymentStyle.modeCard, paymentType === 'full' && QuotationPaymentStyle.modeCardSelected]}
                    onPress={() => setPaymentType('full')}
                >
                    <View style={[QuotationPaymentStyle.radioCircle, paymentType === 'full' && QuotationPaymentStyle.radioCircleSelected]}>
                        {paymentType === 'full' && <View style={QuotationPaymentStyle.radioInner} />}
                    </View>
                    <View style={QuotationPaymentStyle.modeContent}>
                        <Text style={QuotationPaymentStyle.modeTitle}>Full Payment</Text>
                        <Text style={QuotationPaymentStyle.modeDesc}>Pay the full amount to secure your booking and not worry about future payment deadlines.</Text>
                    </View>
                </TouchableOpacity>

                {paymentType === 'deposit' && (
                    <View style={QuotationPaymentStyle.scheduleBox}>
                        <Text style={QuotationPaymentStyle.scheduleTitle}>Payment Schedule</Text>
                        {scheduleData.schedule.map((item, idx) => (
                            <View key={idx} style={QuotationPaymentStyle.scheduleItem}>
                                <View style={QuotationPaymentStyle.scheduleInfoContainer}>
                                    <Text style={QuotationPaymentStyle.scheduleLabel}>{item.label}</Text>
                                    <Text style={QuotationPaymentStyle.scheduleDate}>{dayjs(item.date).format('MMM DD, YYYY')}</Text>
                                </View>
                                <Text style={QuotationPaymentStyle.scheduleAmount}>PHP {formatPesoNumber(item.amount)}</Text>
                            </View>
                        ))}
                        <Text style={QuotationPaymentStyle.scheduleNote}>Note: A penalty of PHP 200 applies for late deposit payments.</Text>
                    </View>
                )}

                <TouchableOpacity style={QuotationAllInStyle.proceedButton} onPress={handleProceed}>
                    <Text style={QuotationAllInStyle.proceedButtonText}>Continue to Payment Method</Text>
                </TouchableOpacity>

                <View style={{ height: 50 }} />
            </ScrollView>

            <Modal visible={showFreqDropdown} transparent animationType="fade">
                <TouchableOpacity style={RegistrationFormStyle.modalOverlay} activeOpacity={1} onPress={() => setShowFreqDropdown(false)}>
                    <View style={RegistrationFormStyle.dropdownBox}>
                        {['Every week', 'Every 2 weeks', 'Every 3 weeks'].map((opt) => (
                            <TouchableOpacity key={opt} style={RegistrationFormStyle.dropdownItem} onPress={() => { setFrequency(opt); setShowFreqDropdown(false); }}>
                                <Text style={RegistrationFormStyle.dropdownText}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={showInvoiceModal} animationType="slide" transparent={true}>
                <View style={QuotationPaymentStyle.invModalOverlay}>
                    <SafeAreaView style={{ flex: 1, width: '100%', padding: 15, justifyContent: 'center' }}>
                        <View style={QuotationPaymentStyle.invPaper}>
                            <TouchableOpacity style={QuotationPaymentStyle.invCloseBtn} onPress={() => setShowInvoiceModal(false)}>
                                <Ionicons name="close-circle" size={28} color="#b54747" />
                            </TouchableOpacity>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={QuotationPaymentStyle.invHeader}>
                                    <View style={QuotationPaymentStyle.invCompanyBlock}>
                                        <Image source={require('../../assets/images/Logored.png')} style={QuotationPaymentStyle.invLogo} resizeMode="contain" />
                                        <View style={QuotationPaymentStyle.invCompanyDetails}>
                                            <Text style={QuotationPaymentStyle.invCompanyName}>M&RC Travel and Tours</Text>
                                            <Text style={QuotationPaymentStyle.invMutedText}>2nd Floor #1 Cor Fatima street, San Antonio Avenue Valley 1</Text>
                                            <Text style={QuotationPaymentStyle.invMutedText}>Parañaque City, Philippines</Text>
                                            <Text style={QuotationPaymentStyle.invMutedText}>1709 PHL</Text>
                                            <Text style={QuotationPaymentStyle.invMutedText}>+63 9690554806</Text>
                                            <Text style={QuotationPaymentStyle.invMutedText}>info1@mrctravels.com</Text>
                                        </View>
                                    </View>
                                    <View style={QuotationPaymentStyle.invTitleBlock}>
                                        <Text style={QuotationPaymentStyle.invTitleText}>Invoice {invoiceNumber || `${issueDate.format('MM')}01`}</Text>
                                    </View>
                                </View>

                                <View style={QuotationPaymentStyle.invDivider} />

                                <View style={QuotationPaymentStyle.invBillRow}>
                                    <View style={QuotationPaymentStyle.invBillTo}>
                                        <Text style={QuotationPaymentStyle.invTinyLabel}>BILL TO</Text>
                                        <Text style={QuotationPaymentStyle.invCustomerName}>{customerName.toUpperCase()}</Text>
                                        <Text style={QuotationPaymentStyle.invMutedText}>{leadGuestInfo?.contact || user?.phonenum || '--'}</Text>
                                        <Text style={QuotationPaymentStyle.invMutedText}>Travel Date: {displayTravelDate}</Text>
                                    </View>
                                    <View style={QuotationPaymentStyle.invSummaryGrid}>
                                        <View style={QuotationPaymentStyle.invSummaryCol}>
                                            <Text style={QuotationPaymentStyle.invTinyLabel}>DATE</Text>
                                            <Text style={QuotationPaymentStyle.invSummaryValue}>{issueDate.format('MM/DD/YYYY')}</Text>
                                        </View>
                                        <View style={[QuotationPaymentStyle.invSummaryCol, QuotationPaymentStyle.invDarkBg]}>
                                            <Text style={[QuotationPaymentStyle.invTinyLabel, { color: '#fff' }]}>PLEASE PAY</Text>
                                            <Text style={[QuotationPaymentStyle.invSummaryValue, { color: '#fff', fontSize: 11 }]}>
                                                {formatPesoDisplay(totalAmount)}
                                            </Text>
                                        </View>
                                        <View style={QuotationPaymentStyle.invSummaryCol}>
                                            <Text style={QuotationPaymentStyle.invTinyLabel}>DUE DATE</Text>
                                            <Text style={QuotationPaymentStyle.invSummaryValue}>{dueDateDisplay.format('MM/DD/YYYY')}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={QuotationPaymentStyle.invTable}>
                                    <View style={QuotationPaymentStyle.invTableHeader}>
                                        <Text style={[QuotationPaymentStyle.invCell, { flex: 1.5 }]}>DATE</Text>
                                        <Text style={[QuotationPaymentStyle.invCell, { flex: 1.5 }]}>ACTIVITY</Text>
                                        <Text style={[QuotationPaymentStyle.invCell, { flex: 3 }]}>DESCRIPTION</Text>
                                        <Text style={[QuotationPaymentStyle.invCell, { flex: 1, textAlign: 'center' }]}>QTY</Text>
                                        <Text style={[QuotationPaymentStyle.invCell, { flex: 1.5, textAlign: 'right' }]}>RATE</Text>
                                        <Text style={[QuotationPaymentStyle.invCell, { flex: 2, textAlign: 'right' }]}>AMOUNT</Text>
                                    </View>
                                    <View style={QuotationPaymentStyle.invTableRow}>
                                        <Text style={[QuotationPaymentStyle.invCell, { flex: 1.5 }]}>{issueDate.format('MM/DD/YYYY')}</Text>
                                        <Text style={[QuotationPaymentStyle.invCell, { flex: 1.5 }]}>Adult</Text>
                                        <Text style={[QuotationPaymentStyle.invCell, { flex: 3 }]} numberOfLines={2}>{packageName}</Text>
                                        <Text style={[QuotationPaymentStyle.invCell, { flex: 1, textAlign: 'center' }]}>{travelerTotal}</Text>
                                        <Text style={[QuotationPaymentStyle.invCell, { flex: 1.5, textAlign: 'right' }]}>PHP {formatPesoNumber(ratePerPax)}</Text>
                                        <Text style={[QuotationPaymentStyle.invCell, { flex: 2, textAlign: 'right' }]}>PHP {formatPesoNumber(totalAmount)}</Text>
                                    </View>
                                </View>

                                <View style={QuotationPaymentStyle.invFooter}>
                                    <View style={QuotationPaymentStyle.invBankInfo}>
                                        <Text style={[QuotationPaymentStyle.invMutedText, { marginBottom: 10 }]}>Payment to be deposited in below bank details:</Text>
                                        <Text style={QuotationPaymentStyle.invTinyLabel}>PESO ACCOUNT:</Text>
                                        <Text style={QuotationPaymentStyle.invMutedText}>BANK: BDO UNIBANK - TRIDENT TOWER BRANCH</Text>
                                        <Text style={QuotationPaymentStyle.invMutedText}>ACCOUNT NAME: M&RC TRAVEL AND TOURS</Text>
                                        <Text style={QuotationPaymentStyle.invMutedText}>ACCOUNT NUMBER: 006830132692</Text>
                                    </View>
                                    <View style={QuotationPaymentStyle.invTotalContainer}>
                                        <View style={QuotationPaymentStyle.invTotalRow}>
                                            <Text style={QuotationPaymentStyle.invTotalLabel}>TOTAL DUE</Text>
                                            <Text style={QuotationPaymentStyle.invTotalValue}>{formatPesoDisplay(totalAmount)}</Text>
                                        </View>
                                        <Text style={QuotationPaymentStyle.invThankYou}>THANK YOU.</Text>
                                    </View>
                                </View>

                                {paymentType === 'deposit' && (
                                    <View style={QuotationPaymentStyle.invScheduleSection}>
                                        <Text style={[QuotationPaymentStyle.invCustomerName, { marginBottom: 8, fontSize: 10 }]}>Payment Schedule</Text>
                                        {scheduleData.schedule.map((item, idx) => (
                                            <View key={idx} style={QuotationPaymentStyle.invScheduleRow}>
                                                <Text style={QuotationPaymentStyle.invScheduleLabel}>
                                                    {item.label}
                                                    {'\n'}
                                                    <Text style={{ fontSize: 7, color: '#777', fontWeight: 'normal' }}>{dayjs(item.date).format('MM/DD/YYYY')}</Text>
                                                </Text>
                                                <Text style={QuotationPaymentStyle.invScheduleAmount}>PHP {formatPesoNumber(item.amount)}</Text>
                                            </View>
                                        ))}
                                        <Text style={QuotationPaymentStyle.invScheduleNote}>Note: A penalty of PHP 200 applies for late deposit payments.</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
