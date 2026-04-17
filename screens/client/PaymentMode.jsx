import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from "dayjs";

import PaymentStyle from '../../styles/clientstyles/PaymentStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import RegistrationFormStyle from '../../styles/clientstyles/RegistrationFormStyle'; 
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { useUser } from '../../context/UserContext';

const formatPesoNumber = (value) => `${(Number(value) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatPeso = (value) => `₱${formatPesoNumber(value)}`;

export default function PaymentMode({ route, navigation }) {
    const { user } = useUser();
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const { setupData, travelerUploads, passengers, leadGuestInfo, medicalData, emergency } = route.params || {};

    const [paymentType, setPaymentType] = useState('deposit'); 
    const [frequency, setFrequency] = useState('Every 2 weeks');
    const [showFreqDropdown, setShowFreqDropdown] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);

    const travelerTotal = useMemo(() => {
        const counts = setupData?.travelerCounts || { adult: 1, child: 0, infant: 0 };
        return counts.adult + counts.child + counts.infant;
    }, [setupData]);

    const totalAmount = setupData?.totalPrice || 0;

    const scheduleData = useMemo(() => {
        const getFrequencyWeeks = (val) => {
            if (val === 'Every week') return 1;
            if (val === 'Every 3 weeks') return 3;
            return 2;
        };

        const freqWeeks = getFrequencyWeeks(frequency);
        const today = dayjs();
        
        const startDateString = setupData?.selectedDate ? setupData.selectedDate.split(' - ')[0] : null;
        const travelDateComputation = startDateString ? dayjs(startDateString) : today;

        const maxAllowedDate = today.add(45, 'day');
        const dueCutoffDate = travelDateComputation.isBefore(maxAllowedDate)
            ? travelDateComputation
            : maxAllowedDate;

        const depositAmount = (setupData?.pkg?.packageDeposit || 0) * travelerTotal;
        const remainingAmount = Math.max(totalAmount - depositAmount, 0);
        
        const paymentDates = [];
        let nextDate = dayjs(today).add(freqWeeks, 'week');

        while (nextDate.isBefore(dueCutoffDate) || nextDate.isSame(dueCutoffDate)) {
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
    const lastInstallmentDate = dayjs(scheduleData.schedule[scheduleData.schedule.length - 1].date);
    const amountToCharge = paymentType === 'deposit' ? scheduleData.depositAmount : totalAmount;
    const dueDateDisplay = paymentType === 'deposit' ? lastInstallmentDate : issueDate;
    const customerName = leadGuestInfo?.fullName || `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Customer';
    const ratePerPax = travelerTotal > 0 ? totalAmount / travelerTotal : totalAmount;

    return (
        <SafeAreaView style={PaymentStyle.safeArea}>
            <StatusBar barStyle="dark-content" />
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={PaymentStyle.container} showsVerticalScrollIndicator={false}>
                
                {/* 🔥 RESTORED BACK BUTTON 🔥 */}
                <TouchableOpacity 
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#305797', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 16 }} 
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={16} color="#fff" />
                    <Text style={{ color: '#fff', fontFamily: 'Montserrat_600SemiBold', marginLeft: 6, fontSize: 14 }}>Back</Text>
                </TouchableOpacity>

                <Text style={PaymentStyle.sectionTitle}>Mode of Payment</Text>
                <Text style={PaymentStyle.sectionSubtitle}>Choose how you want to settle your booking.</Text>

                <View style={PaymentStyle.progressContainer}>
                    <View style={[PaymentStyle.progressStep, PaymentStyle.progressStepActive]}><Text style={PaymentStyle.progressText}>1</Text></View>
                    <View style={PaymentStyle.progressLine} />
                    <View style={PaymentStyle.progressStep}><Text style={[PaymentStyle.progressText, {color: '#64748b'}]}>2</Text></View>
                </View>

                <View style={PaymentStyle.previewButtonContainer}>
                    <View style={PaymentStyle.previewHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={PaymentStyle.previewLabel}>Package:</Text>
                            <Text style={PaymentStyle.previewValue} numberOfLines={1}>{setupData?.pkg?.title?.toUpperCase() || 'TOUR PACKAGE'}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
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
                        <Text style={PaymentStyle.modeTitle}>Deposit / Installment</Text>
                        <Text style={PaymentStyle.modeDesc}>Secure your slot with a partial payment and pay the rest in installments.</Text>
                        
                        {paymentType === 'deposit' && (
                            <TouchableOpacity style={PaymentStyle.pickerContainer} onPress={() => setShowFreqDropdown(true)}>
                                <Text style={{fontSize: 13, fontFamily: 'Roboto_500Medium', color: '#1f2a44'}}>{frequency}</Text>
                                <Ionicons name="chevron-down" size={18} color="#64748b" />
                            </TouchableOpacity>
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
                        <Text style={PaymentStyle.modeDesc}>Settle the entire amount now for a worry-free booking experience.</Text>
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
                                <Text style={PaymentStyle.scheduleAmount}>{formatPeso(item.amount)}</Text>
                            </View>
                        ))}
                        <Text style={PaymentStyle.scheduleNote}>Note: A penalty of PHP 500 applies for late deposit payments.</Text>
                    </View>
                )}

                <TouchableOpacity style={QuotationAllInStyle.proceedButton} onPress={handleProceed}>
                    <Text style={QuotationAllInStyle.proceedButtonText}>Continue to Payment Method</Text>
                </TouchableOpacity>

                <View style={{height: 50}} />
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
                                        <Text style={PaymentStyle.invTitleText}>Invoice {issueDate.format('MM')}01</Text>
                                    </View>
                                </View>

                                <View style={PaymentStyle.invDivider} />

                                <View style={PaymentStyle.invBillRow}>
                                    <View style={PaymentStyle.invBillTo}>
                                        <Text style={PaymentStyle.invTinyLabel}>BILL TO</Text>
                                        <Text style={PaymentStyle.invCustomerName}>{customerName.toUpperCase()}</Text>
                                        <Text style={PaymentStyle.invMutedText}>{leadGuestInfo?.contact || user?.phonenum || '--'}</Text>
                                    </View>
                                    <View style={PaymentStyle.invSummaryGrid}>
                                        <View style={PaymentStyle.invSummaryCol}>
                                            <Text style={PaymentStyle.invTinyLabel}>DATE</Text>
                                            <Text style={PaymentStyle.invSummaryValue}>{issueDate.format('MM/DD/YYYY')}</Text>
                                        </View>
                                        <View style={[PaymentStyle.invSummaryCol, PaymentStyle.invDarkBg]}>
                                            <Text style={[PaymentStyle.invTinyLabel, {color: '#fff'}]}>PLEASE PAY</Text>
                                            <Text style={[PaymentStyle.invSummaryValue, {color: '#fff', fontSize: 10}]}>PHP {formatPesoNumber(amountToCharge)}</Text>
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
                                    <View style={PaymentStyle.invTableRow}>
                                        <Text style={[PaymentStyle.invCell, { flex: 1.5 }]}>{issueDate.format('MM/DD/YYYY')}</Text>
                                        <Text style={[PaymentStyle.invCell, { flex: 1.5 }]}>Adult</Text>
                                        <Text style={[PaymentStyle.invCell, { flex: 3 }]} numberOfLines={2}>{setupData?.pkg?.title}</Text>
                                        <Text style={[PaymentStyle.invCell, { flex: 1, textAlign: 'center' }]}>{travelerTotal}</Text>
                                        <Text style={[PaymentStyle.invCell, { flex: 1.5, textAlign: 'right' }]}>{formatPesoNumber(ratePerPax)}</Text>
                                        <Text style={[PaymentStyle.invCell, { flex: 2, textAlign: 'right' }]}>{formatPesoNumber(totalAmount)}</Text>
                                    </View>
                                </View>

                                <View style={PaymentStyle.invFooter}>
                                    <View style={PaymentStyle.invBankInfo}>
                                        <Text style={[PaymentStyle.invMutedText, {marginBottom: 10}]}>Payment to be deposited in below bank details:</Text>
                                        <Text style={PaymentStyle.invTinyLabel}>PESO ACCOUNT:</Text>
                                        <Text style={PaymentStyle.invMutedText}>BANK: BDO UNIBANK - TRIDENT TOWER BRANCH</Text>
                                        <Text style={PaymentStyle.invMutedText}>ACCOUNT NAME: M&RC TRAVEL AND TOURS</Text>
                                        <Text style={PaymentStyle.invMutedText}>ACCOUNT NUMBER: 006830132692</Text>
                                    </View>
                                    <View style={PaymentStyle.invTotalContainer}>
                                        <View style={PaymentStyle.invTotalRow}>
                                            <Text style={PaymentStyle.invTotalLabel}>TOTAL DUE</Text>
                                            <Text style={PaymentStyle.invTotalValue}>PHP {formatPesoNumber(totalAmount)}</Text>
                                        </View>
                                        <Text style={PaymentStyle.invThankYou}>THANK YOU.</Text>
                                    </View>
                                </View>

                                {paymentType === 'deposit' && (
                                    <View style={PaymentStyle.invScheduleSection}>
                                        <Text style={[PaymentStyle.invCustomerName, {marginBottom: 8, fontSize: 10}]}>Payment Schedule</Text>
                                        {scheduleData.schedule.map((item, idx) => (
                                            <View key={idx} style={PaymentStyle.invScheduleRow}>
                                                <Text style={PaymentStyle.invScheduleLabel}>
                                                    {item.label}
                                                    {'\n'}
                                                    <Text style={{fontSize: 7, color: '#777', fontWeight: 'normal'}}>{dayjs(item.date).format('MM/DD/YYYY')}</Text>
                                                </Text>
                                                <Text style={PaymentStyle.invScheduleAmount}>PHP {formatPesoNumber(item.amount)}</Text>
                                            </View>
                                        ))}
                                        <Text style={PaymentStyle.invScheduleNote}>Note: A penalty of PHP 500 applies for late deposit payments.</Text>
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