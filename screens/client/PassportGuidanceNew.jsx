import { View, Text, TouchableOpacity, Alert, ScrollView, Modal, ActivityIndicator, Pressable } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'

import { Ionicons } from '@expo/vector-icons'
import { Calendar } from 'react-native-calendars'

import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import PassportGuidanceStyle from '../../styles/clientstyles/PassportGuidanceStyle'
import { api, withUserHeader } from '../../utils/api'
import { useUser } from '../../context/UserContext'

import dayjs from 'dayjs'

import {
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold
} from '@expo-google-fonts/montserrat'

import {
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold
} from '@expo-google-fonts/roboto'

const dfaLocations = [
    'DFA Aseana (Paranaque)',
    'DFA NCR Central (Robinsons Galleria Ortigas)',
    'DFA NCR East (SM Megamall)',
    'DFA NCR North (Robinsons Novaliches)',
    'DFA NCR Northeast (Ali Mall Cubao)',
    'DFA NCR South (Festival Mall Muntinlupa)',
    'DFA NCR West (SM City Manila)',
    'DFA Angeles (SM City Clark)',
    'DFA Antipolo (SM Center Antipolo)',
    'DFA Baguio (SM City Baguio)',
    'DFA Balanga (The Bunker Bataan)',
    'DFA Calasiao (Robinsons Calasiao)',
    'DFA Candon (Candon City Arena)',
    'DFA Dasmarinas (SM City Dasmarinas)',
    'DFA Ilocos Norte (Robinsons Place San Nicolas)',
    'DFA La Union (CSI Mall San Fernando)',
    'DFA Legazpi (Pacific Mall Legazpi)',
    'DFA Lipa (Robinsons Lipa)',
    'DFA Lucena (Pacific Mall Lucena)',
    'DFA Malolos (Xentro Mall Malolos)',
    'DFA Olongapo (SM City Olongapo Central)',
    'DFA Pampanga (Robinsons Starmills San Fernando)',
    'DFA Paniqui (WalterMart Paniqui)',
    'DFA Puerto Princesa (Robinsons Place Palawan)',
    'DFA San Pablo (SM City San Pablo)',
    'DFA Santiago (Robinsons Place Santiago)',
    'DFA Tuguegarao (Regional Government Center)',
    'DFA Antique (CityMall Antique)',
    'DFA Bacolod (Robinsons Place Bacolod)',
    'DFA Cebu (Robinsons Galleria Cebu)',
    'DFA Dumaguete (Robinsons Place Dumaguete)',
    'DFA Iloilo (Robinsons Place Iloilo)',
    'DFA Tacloban (Robinsons North Tacloban)',
    'DFA Tagbilaran (Alturas Mall)',
    'DFA Butuan (Robinsons Place Butuan)',
    'DFA Cagayan de Oro (SM CDO Downtown Premier)',
    'DFA Clarin (Clarin Town Center)',
    'DFA Davao (SM City Davao)',
    'DFA General Santos (Robinsons Place General Santos)',
    'DFA Kidapawan',
    'DFA Pagadian (C3 Mall)',
    'DFA Tagum (Robinsons Place Tagum)',
    'DFA Zamboanga (Go-Velayo Building)'
];

const timeSlots = [
    "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
];

const requirements = [
    "Confirmed DFA appointment",
    "Accomplished application form",
    "Original PSA birth certificate",
    "Valid government-issued ID",
    "Supporting documents (if required)"
];

const steps = [
    { title: "Book your DFA appointment", desc: "Select your preferred DFA site and date." },
    { title: "Prepare requirements", desc: "Complete forms and secure supporting documents." },
    { title: "Attend appointment", desc: "Submit documents and complete biometrics." },
    { title: "Track release", desc: "Wait for delivery or pick-up availability." },
];

export default function PassportGuidanceNew() {
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })

    const cs = useNavigation()
    const { user } = useUser()
    const [isSidebarVisible, setSidebarVisible] = useState(false)

    const [dfaLocation, setDfaLocation] = useState('')
    const [preferredDate, setPreferredDate] = useState(null)
    const [pendingPreferredDate, setPendingPreferredDate] = useState(null)
    const [preferredTime, setPreferredTime] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showTimePickerModal, setShowTimePickerModal] = useState(false)
    const [showDfaModal, setShowDfaModal] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)


    const minimumAppointmentDate = dayjs()
        .add(14, 'day')
        .format('YYYY-MM-DD')


    const formatDate = (date) => {
        return date || 'Select date'
    }


    const openPreferredDatePicker = () => {
        setPendingPreferredDate(
            preferredDate || minimumAppointmentDate
        )

        setShowDatePicker(true)
    }


    const closePreferredDatePicker = () => {
        setPendingPreferredDate(preferredDate)
        setShowDatePicker(false)
    }


    const selectPreferredDate = (dateString) => {
        const selectedDay = dayjs(dateString).day()

        if (selectedDay === 0 || selectedDay === 6) {
            Alert.alert(
                'Invalid Date',
                'Appointments are only available from Monday to Friday.'
            )
            return
        }

        setPendingPreferredDate(dateString)
    }


    const applyPreferredDate = () => {
        if (!pendingPreferredDate) return

        const selectedDay = dayjs(pendingPreferredDate).day()

        if (selectedDay === 0 || selectedDay === 6) {
            Alert.alert(
                'Invalid Date',
                'Appointments are only available from Monday to Friday.'
            )
            return
        }

        setPreferredDate(pendingPreferredDate)
        setShowDatePicker(false)
    }


    //submit the passport application
    const submitApplication = async () => {
        if (!user?._id) {
            Alert.alert('Login required', 'Please login to submit your request.')
            return
        }

        if (!dfaLocation || !preferredDate || !preferredTime) {
            Alert.alert('Missing fields', 'Please fill in DFA location, preferred date, and preferred time.')
            return
        }

        try {
            setIsSubmitting(true)

            const payload = {
                dfaLocation,
                preferredDate,
                preferredTime,
                applicationType: 'New Passport'
            };

            await api.post('/passport/apply', payload, withUserHeader(user._id))

            setShowSuccessModal(true)
        } catch (error) {
            const message = error?.response?.data?.message || 'Unable to submit passport application right now.'
            Alert.alert('Submission failed', message)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!fontsLoaded) return null;




    return (
        <View style={PassportGuidanceStyle.container}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={PassportGuidanceStyle.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={PassportGuidanceStyle.headerContainer}>
                    <TouchableOpacity onPress={() => cs.goBack()} style={PassportGuidanceStyle.backButton}>
                        <Ionicons name="arrow-back" size={16} color="#fff" />
                        <Text style={PassportGuidanceStyle.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <Text style={PassportGuidanceStyle.title}>New Passport Assistance</Text>
                    <Text style={PassportGuidanceStyle.subtitle}>Prepare your documents and pick a schedule for your application.</Text>
                </View>

                <View style={PassportGuidanceStyle.columnCard}>
                    <Text style={PassportGuidanceStyle.sectionTitle}>Requirements</Text>
                    {requirements.map((item, index) => (
                        <View key={index} style={PassportGuidanceStyle.requirementItem}>
                            <Text style={PassportGuidanceStyle.requirementText}>{item}</Text>
                        </View>
                    ))}
                </View>

                <View style={PassportGuidanceStyle.columnCard}>
                    <Text style={PassportGuidanceStyle.sectionTitle}>Step-by-step process</Text>
                    {steps.map((step, index) => (
                        <View key={index} style={PassportGuidanceStyle.stepRow}>
                            <View style={PassportGuidanceStyle.stepNumberContainer}>
                                <Text style={PassportGuidanceStyle.stepNumber}>{index + 1}</Text>
                            </View>
                            <View style={PassportGuidanceStyle.stepContent}>
                                <Text style={PassportGuidanceStyle.stepTitle}>{step.title}</Text>
                                <Text style={PassportGuidanceStyle.stepDesc}>{step.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={PassportGuidanceStyle.columnCard}>
                    <Text style={PassportGuidanceStyle.sectionTitle}>Application Details</Text>

                    <View style={PassportGuidanceStyle.feeBadge}>
                        <Text style={PassportGuidanceStyle.feeBadgeText}>Passport Fee PHP 2,000</Text>
                    </View>

                    <Text style={PassportGuidanceStyle.formLabel}>Select DFA location</Text>
                    <TouchableOpacity style={PassportGuidanceStyle.inputContainer} onPress={() => setShowDfaModal(true)}>
                        <Text style={[PassportGuidanceStyle.inputText, !dfaLocation && PassportGuidanceStyle.inputTextPlaceholder]}>
                            {dfaLocation || 'Choose a DFA site'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                    </TouchableOpacity>

                    <Text style={PassportGuidanceStyle.formLabel}>
                        Preferred date
                    </Text>

                    <TouchableOpacity
                        style={PassportGuidanceStyle.inputContainer}
                        onPress={openPreferredDatePicker}
                        activeOpacity={0.75}
                    >
                        <Text
                            style={[
                                PassportGuidanceStyle.inputText,
                                !preferredDate &&
                                PassportGuidanceStyle.inputTextPlaceholder
                            ]}
                        >
                            {preferredDate
                                ? dayjs(preferredDate).format('MMMM D, YYYY')
                                : 'Select date'}
                        </Text>

                        {preferredDate ? (
                            <TouchableOpacity
                                onPress={(event) => {
                                    event.stopPropagation()
                                    setPreferredDate(null)
                                    setPendingPreferredDate(null)
                                }}
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={20}
                                    color="#9ca3af"
                                />
                            </TouchableOpacity>
                        ) : (
                            <Ionicons
                                name="calendar-outline"
                                size={20}
                                color="#9ca3af"
                            />
                        )}
                    </TouchableOpacity>

                    <Text style={PassportGuidanceStyle.formLabel}>Preferred time</Text>
                    <TouchableOpacity style={PassportGuidanceStyle.inputContainer} onPress={() => setShowTimePickerModal(true)}>
                        <Text style={[PassportGuidanceStyle.inputText, !preferredTime && PassportGuidanceStyle.inputTextPlaceholder]}>
                            {preferredTime || 'Select time'}
                        </Text>
                        {preferredTime ? (
                            <TouchableOpacity onPress={() => setPreferredTime(null)}>
                                <Ionicons name="close-circle" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        ) : (
                            <Ionicons name="time-outline" size={20} color="#9ca3af" />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={PassportGuidanceStyle.submitButton} onPress={submitApplication} disabled={isSubmitting}>
                        <Text style={PassportGuidanceStyle.submitText}>{isSubmitting ? 'Submitting...' : 'Submit request'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modals */}
            <Modal
                visible={showDatePicker}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={closePreferredDatePicker}
            >
                <Pressable
                    style={PassportGuidanceStyle.dateModalOverlay}
                    onPress={closePreferredDatePicker}
                >
                    <Pressable
                        style={PassportGuidanceStyle.dateModalCard}
                        onPress={(event) => event.stopPropagation()}
                    >
                        <View style={PassportGuidanceStyle.dateModalHeader}>
                            <View style={PassportGuidanceStyle.dateModalHeaderContent}>
                                <View style={PassportGuidanceStyle.dateModalHeaderIcon}>
                                    <Ionicons
                                        name="calendar"
                                        size={21}
                                        color="#305797"
                                    />
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={PassportGuidanceStyle.dateModalTitle}>
                                        Preferred Date
                                    </Text>

                                    <Text style={PassportGuidanceStyle.dateModalSubtitle}>
                                        Appointments are available Monday to Friday.
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={PassportGuidanceStyle.dateModalCloseButton}
                                onPress={closePreferredDatePicker}
                            >
                                <Ionicons
                                    name="close"
                                    size={21}
                                    color="#64748b"
                                />
                            </TouchableOpacity>
                        </View>

                        <Calendar
                            initialDate={
                                pendingPreferredDate ||
                                preferredDate ||
                                minimumAppointmentDate
                            }
                            minDate={minimumAppointmentDate}
                            onDayPress={({ dateString }) => {
                                selectPreferredDate(dateString)
                            }}
                            markedDates={{
                                [
                                    pendingPreferredDate ||
                                    preferredDate ||
                                    minimumAppointmentDate
                                ]: {
                                    selected: true,
                                    selectedColor: '#305797',
                                    selectedTextColor: '#ffffff'
                                }
                            }}
                            enableSwipeMonths
                            hideExtraDays
                            disableAllTouchEventsForDisabledDays
                            renderArrow={(direction) => (
                                <View style={PassportGuidanceStyle.dateCalendarArrow}>
                                    <Ionicons
                                        name={
                                            direction === 'left'
                                                ? 'chevron-back'
                                                : 'chevron-forward'
                                        }
                                        size={18}
                                        color="#305797"
                                    />
                                </View>
                            )}
                            style={PassportGuidanceStyle.dateCalendar}
                            theme={{
                                backgroundColor: '#ffffff',
                                calendarBackground: '#ffffff',

                                textSectionTitleColor: '#94a3b8',
                                textDisabledColor: '#d1d5db',
                                dayTextColor: '#334155',
                                monthTextColor: '#1e293b',

                                selectedDayBackgroundColor: '#305797',
                                selectedDayTextColor: '#ffffff',
                                todayTextColor: '#305797',
                                arrowColor: '#305797',

                                textDayFontFamily: 'Roboto_400Regular',
                                textMonthFontFamily: 'Montserrat_700Bold',
                                textDayHeaderFontFamily: 'Roboto_500Medium',

                                textDayFontSize: 14,
                                textMonthFontSize: 16,
                                textDayHeaderFontSize: 12
                            }}
                        />

                        <View style={PassportGuidanceStyle.dateSelectedContainer}>
                            <View style={PassportGuidanceStyle.dateSelectedIcon}>
                                <Ionicons
                                    name="checkmark"
                                    size={17}
                                    color="#305797"
                                />
                            </View>

                            <View>
                                <Text style={PassportGuidanceStyle.dateSelectedLabel}>
                                    Selected date
                                </Text>

                                <Text style={PassportGuidanceStyle.dateSelectedValue}>
                                    {dayjs(
                                        pendingPreferredDate ||
                                        preferredDate ||
                                        minimumAppointmentDate
                                    ).format('MMMM D, YYYY')}
                                </Text>
                            </View>
                        </View>

                        <Text style={PassportGuidanceStyle.dateAvailabilityNote}>
                            Earliest available date:{' '}
                            {dayjs(minimumAppointmentDate).format('MMMM D, YYYY')}
                        </Text>

                        <View style={PassportGuidanceStyle.dateModalActions}>
                            <TouchableOpacity
                                style={PassportGuidanceStyle.dateModalCancelButton}
                                onPress={closePreferredDatePicker}
                                activeOpacity={0.75}
                            >
                                <Text style={PassportGuidanceStyle.dateModalCancelText}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={PassportGuidanceStyle.dateModalConfirmButton}
                                onPress={applyPreferredDate}
                                activeOpacity={0.75}
                            >
                                <Ionicons
                                    name="checkmark"
                                    size={18}
                                    color="#ffffff"
                                />

                                <Text style={PassportGuidanceStyle.dateModalConfirmText}>
                                    Confirm Date
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal visible={showTimePickerModal} transparent animationType="fade">
                <TouchableOpacity style={PassportGuidanceStyle.modalOverlay} activeOpacity={1} onPress={() => setShowTimePickerModal(false)}>
                    <View style={[PassportGuidanceStyle.modalCard, { padding: 0, maxHeight: '60%' }]}>
                        <View style={{ padding: 20, borderBottomWidth: 1, borderColor: '#e5e7eb', width: '100%', backgroundColor: '#f9fafb' }}>
                            <Text style={[PassportGuidanceStyle.sectionTitle, { marginBottom: 0, textAlign: 'center' }]}>Select Time</Text>
                        </View>
                        <ScrollView style={{ width: '100%' }}>
                            {timeSlots.map((slot, i) => (
                                <TouchableOpacity key={i} style={{ paddingVertical: 16, borderBottomWidth: 1, borderColor: '#f3f4f6', alignItems: 'center' }}
                                    onPress={() => { setPreferredTime(slot); setShowTimePickerModal(false); }}>
                                    <Text style={{ fontSize: 16, fontFamily: preferredTime === slot ? "Montserrat_700Bold" : "Roboto_500Medium", color: preferredTime === slot ? '#305797' : '#374151' }}>{slot}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={showDfaModal} transparent animationType="fade">
                <TouchableOpacity style={PassportGuidanceStyle.modalOverlay} activeOpacity={1} onPress={() => setShowDfaModal(false)}>
                    <View style={[PassportGuidanceStyle.modalCard, { padding: 0, maxHeight: '70%' }]}>
                        <View style={{ padding: 20, borderBottomWidth: 1, borderColor: '#e5e7eb', width: '100%', backgroundColor: '#f9fafb' }}>
                            <Text style={[PassportGuidanceStyle.sectionTitle, { marginBottom: 0, textAlign: 'center' }]}>Select DFA Site</Text>
                        </View>
                        <ScrollView style={{ width: '100%' }}>
                            {dfaLocations.map((loc, i) => (
                                <TouchableOpacity key={i} style={{ paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#f3f4f6' }}
                                    onPress={() => { setDfaLocation(loc); setShowDfaModal(false); }}>
                                    <Text style={{ fontSize: 15, fontFamily: dfaLocation === loc ? "Montserrat_600SemiBold" : "Roboto_400Regular", color: dfaLocation === loc ? '#305797' : '#374151' }}>{loc}</Text>
                                </TouchableOpacity>
                            ))}
                            <Text style={{ textAlign: 'center', padding: 20, color: '#9ca3af', fontStyle: 'italic', fontSize: 12 }}>More locations available on the official DFA website</Text>
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={showSuccessModal} transparent animationType="fade">
                <View style={PassportGuidanceStyle.modalOverlay}>
                    <View style={[PassportGuidanceStyle.modalCard, { padding: 0 }]}>
                        <TouchableOpacity style={{ alignSelf: 'flex-end', padding: 12 }} onPress={() => { setShowSuccessModal(false); cs.navigate('userapplications'); }}>
                            <Ionicons name="close" size={24} color="#9ca3af" />
                        </TouchableOpacity>
                        <View style={PassportGuidanceStyle.modalIconContainer}><Ionicons name="checkmark" size={32} color="#059669" /></View>
                        <Text style={PassportGuidanceStyle.modalTitle}>Application Submitted</Text>
                        <Text style={PassportGuidanceStyle.modalDesc}>Your passport application has been submitted successfully. Kindly wait for your application to be approved.</Text>
                        <TouchableOpacity style={PassportGuidanceStyle.modalButton} onPress={() => { setShowSuccessModal(false); cs.navigate('userapplications'); }}>
                            <Text style={PassportGuidanceStyle.modalButtonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}