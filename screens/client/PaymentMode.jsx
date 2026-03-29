import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from "dayjs";

import PaymentStyle from '../../styles/clientstyles/PaymentStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import RegistrationFormStyle from '../../styles/clientstyles/RegistrationFormStyle'; // Reusing modal style
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const formatPeso = (value) => `₱${(Number(value) || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

export default function PaymentMode({ route, navigation }) {
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const { setupData, travelerUploads, passengers, leadGuestInfo, medicalData, emergency } = route.params || {};

    const [paymentType, setPaymentType] = useState('full'); // 'deposit' or 'full'
    const [frequency, setFrequency] = useState('Every 2 weeks');
    const [showFreqDropdown, setShowFreqDropdown] = useState(false);

    const travelerTotal = useMemo(() => {
        const counts = setupData?.travelerCounts || { adult: 1, child: 0, infant: 0 };
        return counts.adult + counts.child + counts.infant;
    }, [setupData]);

    const totalAmount = setupData?.totalPrice || 0;

    // --- Calculation Logic (Ported from Web) ---
    const scheduleData = useMemo(() => {
        const getFrequencyWeeks = (val) => {
            if (val === 'Every week') return 1;
            if (val === 'Every 3 weeks') return 3;
            return 2;
        };

        const freqWeeks = getFrequencyWeeks(frequency);
        const today = dayjs();
        // Web logic: deposit is per pax
        const depositAmount = (setupData?.pkg?.packageDeposit || 5000) * travelerTotal;
        const remainingAmount = Math.max(totalAmount - depositAmount, 0);
        
        // Window: 45 days from today (as per web code)
        const dueCutoffDate = today.add(45, 'day');
        const installmentWindowDays = dueCutoffDate.diff(today, 'day');
        const installmentCount = Math.max(Math.floor(installmentWindowDays / (freqWeeks * 7)), 1);
        const installmentAmount = installmentCount ? remainingAmount / installmentCount : 0;

        const schedule = [
            { label: 'Deposit', amount: depositAmount, date: today },
        ];

        for (let i = 0; i < installmentCount; i++) {
            schedule.push({
                label: `Installment ${i + 1}`,
                amount: installmentAmount,
                date: today.add(freqWeeks * (i + 1), 'week')
            });
        }

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

    return (
        <SafeAreaView style={PaymentStyle.safeArea}>
            <StatusBar barStyle="dark-content" />
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={PaymentStyle.container} showsVerticalScrollIndicator={false}>
                <Text style={PaymentStyle.sectionTitle}>Mode of Payment</Text>
                <Text style={PaymentStyle.sectionSubtitle}>Choose how you want to settle your booking.</Text>

                {/* --- PROGRESS STEPS --- */}
                <View style={PaymentStyle.progressContainer}>
                    <View style={[PaymentStyle.progressStep, PaymentStyle.progressStepActive]}><Text style={PaymentStyle.progressText}>1</Text></View>
                    <View style={PaymentStyle.progressLine} />
                    <View style={PaymentStyle.progressStep}><Text style={[PaymentStyle.progressText, {color: '#64748b'}]}>2</Text></View>
                </View>

                {/* --- INVOICE SUMMARY --- */}
                <View style={PaymentStyle.invoiceCard}>
                    <View style={PaymentStyle.invoiceRow}>
                        <Text style={PaymentStyle.invoiceLabel}>Package:</Text>
                        <Text style={PaymentStyle.invoiceValue} numberOfLines={1}>{setupData?.pkg?.title}</Text>
                    </View>
                    <View style={PaymentStyle.invoiceRow}>
                        <Text style={PaymentStyle.invoiceLabel}>Travelers:</Text>
                        <Text style={PaymentStyle.invoiceValue}>{travelerTotal} Person(s)</Text>
                    </View>
                    <View style={[PaymentStyle.invoiceRow, PaymentStyle.invoiceTotal]}>
                        <Text style={[PaymentStyle.invoiceLabel, {fontFamily: "Montserrat_700Bold", color: '#1f2a44'}]}>GRAND TOTAL:</Text>
                        <Text style={[PaymentStyle.invoiceValue, {fontSize: 16, color: '#305797'}]}>{formatPeso(totalAmount)}</Text>
                    </View>
                </View>

                {/* --- DEPOSIT CARD --- */}
                <TouchableOpacity 
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
                                <Text style={{fontSize: 13}}>{frequency}</Text>
                                <Ionicons name="chevron-down" size={18} color="#64748b" />
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>

                {/* --- FULL PAYMENT CARD --- */}
                <TouchableOpacity 
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

                {/* --- PAYMENT SCHEDULE PREVIEW --- */}
                {paymentType === 'deposit' && (
                    <View style={PaymentStyle.scheduleBox}>
                        <Text style={PaymentStyle.scheduleTitle}>Payment Schedule</Text>
                        {scheduleData.schedule.map((item, idx) => (
                            <View key={idx} style={PaymentStyle.scheduleItem}>
                                <View>
                                    <Text style={PaymentStyle.scheduleLabel}>{item.label}</Text>
                                    <Text style={PaymentStyle.scheduleDate}>{item.date.format('MMM DD, YYYY')}</Text>
                                </View>
                                <Text style={PaymentStyle.scheduleAmount}>{formatPeso(item.amount)}</Text>
                            </View>
                        ))}
                        <Text style={PaymentStyle.scheduleNote}>* A penalty of ₱500 applies for late deposit payments.</Text>
                    </View>
                )}

                <TouchableOpacity style={QuotationAllInStyle.proceedButton} onPress={handleProceed}>
                    <Text style={QuotationAllInStyle.proceedButtonText}>Continue to Payment Method</Text>
                </TouchableOpacity>

                <View style={{height: 50}} />
            </ScrollView>

            {/* Frequency Dropdown Modal */}
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
        </SafeAreaView>
    );
}