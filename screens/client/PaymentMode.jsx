import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from "dayjs";

import PaymentStyle from '../../styles/clientstyles/PaymentStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import RegistrationFormStyle from '../../styles/clientstyles/RegistrationFormStyle';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { api, withUserHeader } from '../../utils/api';
import { useUser } from '../../context/UserContext';

const formatPesoNumber = (value) => `${(Number(value) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatPeso = (value) => `₱${formatPesoNumber(value)}`;
const formatPesoDisplay = (value) => `PHP ${formatPesoNumber(value)}`;

// 🔥 NEW: Custom Date Parser to bypass Hermes "Invalid Date" bug
const parseDateStringSafe = (dateStr) => {
    if (!dateStr) return null;

    const months = {
        "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
        "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11,
        "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "Jun": 5, "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
    };

    try {
        const cleanStr = dateStr.replace(/,/g, '').trim();
        const parts = cleanStr.split(/\s+/);

        // Look for [Month, Day, Year] format
        if (parts.length === 3) {
            const month = months[parts[0]];
            const day = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);

            if (month !== undefined && !isNaN(day) && !isNaN(year)) {
                return new Date(year, month, day);
            }
        }

        // Fallback
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) return parsed;
    } catch (e) {
        return null;
    }
    return null;
};

export default function PaymentMode({ route, navigation }) {
    const { user } = useUser();
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const { setupData, travelerUploads, passengers, leadGuestInfo, medicalData, emergency } = route.params || {};

    const [paymentType, setPaymentType] = useState('deposit');
    const [frequency, setFrequency] = useState('Every 2 weeks');
    const [showFreqDropdown, setShowFreqDropdown] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState('');

    const travelerTotal = useMemo(() => {
        const counts = setupData?.travelerCounts || { adult: 1, child: 0, infant: 0 };
        return counts.adult + counts.child + counts.infant;
    }, [setupData]);

    const travelers = setupData?.travelerCounts || { adult: 1, child: 0, infant: 0 };

    console.log("Number of travelers:", travelers);

    const totalAmount = setupData?.totalPrice || 0;

    useEffect(() => {
        const fetchInvoiceNumber = async () => {
            try {
                const response = await api.get('/booking/bookings-total-month', withUserHeader(user?._id));
                const number = response.data?.invoiceNumber;
                if (number) {
                    setInvoiceNumber(number);
                    return;
                }
            } catch (error) {
                console.log('Error fetching monthly invoice number:', error.message);
            }

            const fallbackMonth = dayjs().format('MM');
            setInvoiceNumber(`${fallbackMonth}01`);
        };

        fetchInvoiceNumber();
    }, [user?._id]);

    // 🔥 BULLETPROOF SCHEDULE LOGIC
    const scheduleData = useMemo(() => {
        const getFrequencyWeeks = (val) => {
            if (val === 'Every week') return 1;
            if (val === 'Every 3 weeks') return 3;
            return 2;
        };

        const freqWeeks = getFrequencyWeeks(frequency);
        const today = dayjs().startOf('day');

        let travelDateComputation = today;

        // Extract the string (e.g., "May 13, 2026")
        const rawTravelDate = setupData?.travelDate?.startDate || (setupData?.selectedDate ? setupData.selectedDate.split(' - ')[0] : null);

        // Use our safe parser to convert it
        if (rawTravelDate) {
            const parsedJsDate = parseDateStringSafe(rawTravelDate);
            if (parsedJsDate) {
                travelDateComputation = dayjs(parsedJsDate).startOf('day');
            }
        }

        const maxAllowedDate = today.add(45, 'day');

        const dueCutoffDate = travelDateComputation.isBefore(maxAllowedDate)
            ? travelDateComputation
            : maxAllowedDate;

        const depositAmount = (setupData?.pkg?.packageDeposit || 0) * travelerTotal;
        const remainingAmount = Math.max(totalAmount - depositAmount, 0);

        const paymentDates = [];
        let nextDate = today.add(freqWeeks, 'week');

        // Loop forward in time until we hit the travel cutoff
        while (nextDate.isBefore(dueCutoffDate) || nextDate.isSame(dueCutoffDate, 'day')) {
            paymentDates.push(nextDate);
            nextDate = nextDate.add(freqWeeks, 'week');
        }

        if (paymentDates.length === 0) {
            paymentDates.push(dueCutoffDate.subtract(1, 'day'));
        }

        const installmentCount = paymentDates.length;
        const installmentAmount = installmentCount ? remainingAmount / installmentCount : 0;

        const schedule = [
            { label: 'Deposit', amount: depositAmount, date: today.toISOString() },
            ...paymentDates.map((date, index) => ({
                label: `Installment ${index + 1}`,
                amount: installmentAmount,
                date: date.toISOString()
            }))
        ];

        return { schedule, depositAmount };
    }, [frequency, travelerTotal, totalAmount, setupData]);

    const handleProceed = () => {
        const amountToPay = paymentType === 'deposit' ? scheduleData.depositAmount : totalAmount;

        navigation.navigate("paymentmethod", {
            ...route.params,
            paymentType,
            frequency,
            amountToPay,
            fullSchedule: scheduleData.schedule
        });
    };

    const issueDate = dayjs();

    const lastInstallmentDate = scheduleData.schedule.length > 0
        ? dayjs(scheduleData.schedule[scheduleData.schedule.length - 1].date)
        : dayjs();

    const amountToCharge = paymentType === 'deposit' ? scheduleData.depositAmount : totalAmount;
    const dueDateDisplay = paymentType === 'deposit' ? lastInstallmentDate : issueDate;

    const customerName = leadGuestInfo?.fullName || `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Customer';
    const ratePerPax = travelerTotal > 0 ? totalAmount / travelerTotal : totalAmount;

    const travelerCountByType = {
        adult: Number(travelers?.adult || 0),
        child: Number(travelers?.child || 0),
        infant: Number(travelers?.infant || 0)
    };

    const adultRate = Number(setupData?.paymentDetails?.adultRate) || Number(setupData?.pkg?.packagePricePerPax) || ratePerPax;
    const childRate = Number(setupData?.paymentDetails?.childRate) || Number(setupData?.pkg?.packageChildRate) || ratePerPax;
    const infantRate = Number(setupData?.paymentDetails?.infantRate) || Number(setupData?.pkg?.packageInfantRate) || ratePerPax;

    const packageTitleDisplay = setupData?.pkg?.title || setupData?.pkg?.packageName || 'TOUR PACKAGE';

    const fallbackRate = ratePerPax;
    const previewInvoiceItems = [
        travelerCountByType.adult > 0
            ? { date: issueDate, activity: 'Adult', description: packageTitleDisplay, qty: travelerCountByType.adult, rate: Number(adultRate) || fallbackRate }
            : null,
        travelerCountByType.child > 0
            ? { date: issueDate, activity: 'Child', description: packageTitleDisplay, qty: travelerCountByType.child, rate: Number(childRate) || fallbackRate }
            : null,
        travelerCountByType.infant > 0
            ? { date: issueDate, activity: 'Infant', description: packageTitleDisplay, qty: travelerCountByType.infant, rate: Number(infantRate) || fallbackRate }
            : null,
    ].filter(Boolean);

    if (previewInvoiceItems.length === 0) {
        previewInvoiceItems.push({
            date: issueDate,
            activity: 'Adult',
            description: packageTitleDisplay,
            qty: travelerTotal || 1,
            rate: fallbackRate
        });
    }

    let previewSubtotal = previewInvoiceItems.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.rate || 0), 0);
    const previewTotalAmount = Number(totalAmount || previewSubtotal || 0);

    if (previewInvoiceItems.length > 0 && Math.abs(previewSubtotal - previewTotalAmount) > 0.5) {
        const firstItemQty = Number(previewInvoiceItems[0].qty || 1);
        previewInvoiceItems[0].rate = firstItemQty > 0 ? previewTotalAmount / firstItemQty : previewTotalAmount;
        previewSubtotal = previewInvoiceItems.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.rate || 0), 0);
    }

    const displayTravelDate = setupData?.selectedDate
        ? setupData.selectedDate
        : (setupData?.travelDate?.startDate ? `${dayjs(setupData.travelDate.startDate).format("MMM D, YYYY")} - ${dayjs(setupData.travelDate.endDate).format("MMM D, YYYY")}` : 'TBD');

    return (
        <SafeAreaView style={PaymentStyle.safeArea}>
            <StatusBar barStyle="dark-content" />
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={PaymentStyle.container} showsVerticalScrollIndicator={false}>

                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#305797', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 16 }}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={16} color="#fff" />
                    <Text style={{ color: '#fff', fontFamily: 'Montserrat_600SemiBold', marginLeft: 6, fontSize: 14 }}>Back</Text>
                </TouchableOpacity>

                <Text style={PaymentStyle.sectionTitle}>Mode of Payment</Text>
                <Text style={PaymentStyle.sectionSubtitle}>Select your mode of payment.</Text>

                <View style={PaymentStyle.progressContainer}>
                    <View style={[PaymentStyle.progressStep, PaymentStyle.progressStepActive]}><Text style={PaymentStyle.progressText}>1</Text></View>
                    <View style={PaymentStyle.progressLine} />
                    <View style={PaymentStyle.progressStep}><Text style={[PaymentStyle.progressText, { color: '#64748b' }]}>2</Text></View>
                </View>

                <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontFamily: "Montserrat_700Bold", fontSize: 18, color: "#1f2a44", marginBottom: 4 }}>Booking Invoice</Text>
                    <Text style={{ fontFamily: "Roboto_400Regular", fontSize: 12, color: "#4b5563" }}>Please review your booking invoice before proceeding to payment.</Text>
                </View>

                <View style={PaymentStyle.previewButtonContainer}>
                    <View style={PaymentStyle.previewHeader}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={PaymentStyle.previewLabel}>Package:</Text>
                            <Text style={PaymentStyle.previewValue} numberOfLines={2}>{packageTitleDisplay.toUpperCase()}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                            <Text style={PaymentStyle.previewLabel}>Travelers:</Text>
                            <Text style={PaymentStyle.previewValue}>{travelerTotal} Person(s)</Text>
                        </View>
                    </View>
                    <View style={PaymentStyle.previewTotalRow}>
                        <Text style={PaymentStyle.previewTotalLabel}>GRAND TOTAL:</Text>
                        <Text style={PaymentStyle.previewTotalAmount}>{formatPeso(totalAmount)}</Text>
                    </View>
                    <TouchableOpacity style={PaymentStyle.previewBtn} onPress={() => setShowInvoiceModal(true)}>
                        <Ionicons name="document-text-outline" size={18} color="#305797" />
                        <Text style={PaymentStyle.previewBtnText}>Preview Booking Invoice</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    activeOpacity={0.9}
                    style={[PaymentStyle.modeCard, paymentType === 'deposit' && PaymentStyle.modeCardSelected]}
                    onPress={() => setPaymentType('deposit')}
                >
                    <View style={[PaymentStyle.radioCircle, paymentType === 'deposit' && PaymentStyle.radioCircleSelected]}>
                        {paymentType === 'deposit' && <View style={PaymentStyle.radioInner} />}
                    </View>
                    <View style={PaymentStyle.modeContent}>
                        <Text style={PaymentStyle.modeTitle}>Deposit</Text>
                        <Text style={PaymentStyle.modeDesc}>Make a partial payment to secure your booking. Choose this option to pay a portion of the total amount.</Text>

                        {paymentType === 'deposit' && (
                            <View style={{ marginTop: 12 }}>
                                <Text style={{ fontFamily: "Montserrat_600SemiBold", fontSize: 12, color: "#1f2a44", marginBottom: 6 }}>Payment Schedule:</Text>
                                <TouchableOpacity style={PaymentStyle.pickerContainer} onPress={() => setShowFreqDropdown(true)}>
                                    <Text style={{ fontSize: 13, fontFamily: 'Roboto_500Medium', color: '#1f2a44' }}>{frequency}</Text>
                                    <Ionicons name="chevron-down" size={18} color="#64748b" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.9}
                    style={[PaymentStyle.modeCard, paymentType === 'full' && PaymentStyle.modeCardSelected]}
                    onPress={() => setPaymentType('full')}
                >
                    <View style={[PaymentStyle.radioCircle, paymentType === 'full' && PaymentStyle.radioCircleSelected]}>
                        {paymentType === 'full' && <View style={PaymentStyle.radioInner} />}
                    </View>
                    <View style={PaymentStyle.modeContent}>
                        <Text style={PaymentStyle.modeTitle}>Full Payment</Text>
                        <Text style={PaymentStyle.modeDesc}>Pay the full amount to secure your booking and not worry about future payment deadlines.</Text>
                    </View>
                </TouchableOpacity>

                {paymentType === 'deposit' && (
                    <View style={PaymentStyle.scheduleBox}>
                        <Text style={PaymentStyle.scheduleTitle}>Payment Schedule</Text>
                        {scheduleData.schedule.map((item, idx) => (
                            <View key={idx} style={PaymentStyle.scheduleItem}>
                                <View style={PaymentStyle.scheduleInfoContainer}>
                                    <Text style={PaymentStyle.scheduleLabel}>{item.label}</Text>
                                    <Text style={PaymentStyle.scheduleDate}>{dayjs(item.date).format('MMM DD, YYYY')}</Text>
                                </View>
                                <Text style={PaymentStyle.scheduleAmount}>PHP {formatPesoNumber(item.amount)}</Text>
                            </View>
                        ))}
                        <Text style={PaymentStyle.scheduleNote}>Note: A penalty of PHP 200 applies for late deposit payments.</Text>
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
                <View style={PaymentStyle.invModalOverlay}>
                    <SafeAreaView style={{ flex: 1, width: '100%', padding: 15, justifyContent: 'center' }}>
                        <View style={PaymentStyle.invPaper}>
                            <TouchableOpacity style={PaymentStyle.invCloseBtn} onPress={() => setShowInvoiceModal(false)}>
                                <Ionicons name="close-circle" size={28} color="#b54747" />
                            </TouchableOpacity>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={PaymentStyle.invHeader}>
                                    <View style={PaymentStyle.invCompanyBlock}>
                                        <Image source={require('../../assets/images/Logored.png')} style={PaymentStyle.invLogo} resizeMode="contain" />
                                        <View style={PaymentStyle.invCompanyDetails}>
                                            <Text style={PaymentStyle.invCompanyName}>M&RC Travel and Tours</Text>
                                            <Text style={PaymentStyle.invMutedText}>2nd Floor #1 Cor Fatima street, San Antonio Avenue Valley 1</Text>
                                            <Text style={PaymentStyle.invMutedText}>Parañaque City, Philippines</Text>
                                            <Text style={PaymentStyle.invMutedText}>1709 PHL</Text>
                                            <Text style={PaymentStyle.invMutedText}>+63 9690554806</Text>
                                            <Text style={PaymentStyle.invMutedText}>info1@mrctravels.com</Text>
                                        </View>
                                    </View>
                                    <View style={PaymentStyle.invTitleBlock}>
                                        <Text style={PaymentStyle.invTitleText}>Invoice {invoiceNumber || `${issueDate.format('MM')}01`}</Text>
                                    </View>
                                </View>

                                <View style={PaymentStyle.invDivider} />

                                <View style={PaymentStyle.invBillRow}>
                                    <View style={PaymentStyle.invBillTo}>
                                        <Text style={PaymentStyle.invTinyLabel}>BILL TO</Text>
                                        <Text style={PaymentStyle.invCustomerName}>{customerName.toUpperCase()}</Text>
                                        <Text style={PaymentStyle.invMutedText}>{leadGuestInfo?.contact || user?.phonenum || '--'}</Text>
                                        <Text style={PaymentStyle.invMutedText}>Travel Date: {displayTravelDate}</Text>
                                    </View>
                                    <View style={PaymentStyle.invSummaryGrid}>
                                        <View style={PaymentStyle.invSummaryCol}>
                                            <Text style={PaymentStyle.invTinyLabel}>DATE</Text>
                                            <Text style={PaymentStyle.invSummaryValue}>{issueDate.format('MM/DD/YYYY')}</Text>
                                        </View>
                                        <View style={[PaymentStyle.invSummaryCol, PaymentStyle.invDarkBg]}>
                                            <Text style={[PaymentStyle.invTinyLabel, { color: '#fff' }]}>PLEASE PAY</Text>
                                            <Text style={[PaymentStyle.invSummaryValue, { color: '#fff', fontSize: 11 }]}>
                                                {formatPesoDisplay(totalAmount)}
                                            </Text>
                                        </View>
                                        <View style={PaymentStyle.invSummaryCol}>
                                            <Text style={PaymentStyle.invTinyLabel}>DUE DATE</Text>
                                            <Text style={PaymentStyle.invSummaryValue}>{dueDateDisplay.format('MM/DD/YYYY')}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={PaymentStyle.invTable}>
                                    <View style={PaymentStyle.invTableHeader}>
                                        <Text style={[PaymentStyle.invCell, { flex: 1.5 }]}>DATE</Text>
                                        <Text style={[PaymentStyle.invCell, { flex: 1.5 }]}>ACTIVITY</Text>
                                        <Text style={[PaymentStyle.invCell, { flex: 3 }]}>DESCRIPTION</Text>
                                        <Text style={[PaymentStyle.invCell, { flex: 1, textAlign: 'center' }]}>QTY</Text>
                                        <Text style={[PaymentStyle.invCell, { flex: 1.5, textAlign: 'right' }]}>RATE</Text>
                                        <Text style={[PaymentStyle.invCell, { flex: 2, textAlign: 'right' }]}>AMOUNT</Text>
                                    </View>
                                    {previewInvoiceItems.map((item, idx) => (
                                        <View key={`inv-row-${idx}`} style={PaymentStyle.invTableRow}>
                                            <Text style={[PaymentStyle.invCell, { flex: 1.5 }]}>{dayjs(item.date).format('MM/DD/YYYY')}</Text>
                                            <Text style={[PaymentStyle.invCell, { flex: 1.5 }]}>{item.activity}</Text>
                                            <Text style={[PaymentStyle.invCell, { flex: 3 }]} numberOfLines={2}>{item.description}</Text>
                                            <Text style={[PaymentStyle.invCell, { flex: 1, textAlign: 'center' }]}>{item.qty}</Text>
                                            <Text style={[PaymentStyle.invCell, { flex: 1.5, textAlign: 'right' }]}>PHP {formatPesoNumber(item.rate)}</Text>
                                            <Text style={[PaymentStyle.invCell, { flex: 2, textAlign: 'right' }]}>PHP {formatPesoNumber(Number(item.qty || 0) * Number(item.rate || 0))}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={PaymentStyle.invFooter}>
                                    <View style={PaymentStyle.invBankInfo}>
                                        <Text style={[PaymentStyle.invMutedText, { marginBottom: 10 }]}>Payment to be deposited in below bank details:</Text>
                                        <Text style={PaymentStyle.invTinyLabel}>PESO ACCOUNT:</Text>
                                        <Text style={PaymentStyle.invMutedText}>BANK: BDO UNIBANK - TRIDENT TOWER BRANCH</Text>
                                        <Text style={PaymentStyle.invMutedText}>ACCOUNT NAME: M&RC TRAVEL AND TOURS</Text>
                                        <Text style={PaymentStyle.invMutedText}>ACCOUNT NUMBER: 006830132692</Text>
                                    </View>
                                    <View style={PaymentStyle.invTotalContainer}>
                                        <View style={PaymentStyle.invTotalRow}>
                                            <Text style={PaymentStyle.invTotalLabel}>TOTAL DUE</Text>
                                            <Text style={PaymentStyle.invTotalValue}>{formatPesoDisplay(totalAmount)}</Text>
                                        </View>
                                        <Text style={PaymentStyle.invThankYou}>THANK YOU.</Text>
                                    </View>
                                </View>

                                {paymentType === 'deposit' && (
                                    <View style={PaymentStyle.invScheduleSection}>
                                        <Text style={[PaymentStyle.invCustomerName, { marginBottom: 8, fontSize: 10 }]}>Payment Schedule</Text>
                                        {scheduleData.schedule.map((item, idx) => (
                                            <View key={idx} style={PaymentStyle.invScheduleRow}>
                                                <Text style={PaymentStyle.invScheduleLabel}>
                                                    {item.label}
                                                    {'\n'}
                                                    <Text style={{ fontSize: 7, color: '#777', fontWeight: 'normal' }}>{dayjs(item.date).format('MM/DD/YYYY')}</Text>
                                                </Text>
                                                <Text style={PaymentStyle.invScheduleAmount}>PHP {formatPesoNumber(item.amount)}</Text>
                                            </View>
                                        ))}
                                        <Text style={PaymentStyle.invScheduleNote}>Note: A penalty of PHP 200 applies for late deposit payments.</Text>
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