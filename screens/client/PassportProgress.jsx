import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Linking } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import dayjs from "dayjs";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import PassportProgressStyle from "../../styles/clientstyles/PassportProgressStyle";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";

export default function PassportProgress() {
    const cs = useNavigation()
    const route = useRoute()
    const { user } = useUser()
    const [isSidebarVisible, setSidebarVisible] = useState(false)
    
    const applicationId = route.params?.applicationId;

    const [application, setApplication] = useState(null)
    const [loading, setLoading] = useState(true)
    
    const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(null);
    const [confirmingSchedule, setConfirmingSchedule] = useState(false);

    const fetchApplicationDetails = async () => {
        if (!user?._id || !applicationId) return;
        
        try {
            setLoading(true);
            const appRes = await api.get('/passport/applications', withUserHeader(user._id));
            const appData = appRes.data.find(app => app._id === applicationId);
            
            if (!appData) throw new Error("Application not found in your list.");
            
            setApplication(appData);
        } catch (error) {
            console.log("Error fetching details:", error.message);
            Alert.alert('Error', 'Unable to load application details.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchApplicationDetails();
    }, [user?._id, applicationId]);

    const handleConfirmSchedule = async () => {
        if (selectedScheduleIndex === null) {
            Alert.alert("Notice", "Please select an appointment option first.");
            return;
        }

        const selected = application.suggestedAppointmentSchedules[selectedScheduleIndex];
        if (!selected?.date || !selected?.time) {
            Alert.alert("Error", "Selected option is missing date or time.");
            return;
        }

        try {
            setConfirmingSchedule(true);
            await api.put(`/passport/applications/${application._id}/choose-appointment`, {
                date: selected.date,
                time: selected.time
            }, withUserHeader(user._id));

            Alert.alert("Success", "Appointment schedule confirmed!");
            setSelectedScheduleIndex(null);
            
            await fetchApplicationDetails();
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to confirm appointment schedule.');
        } finally {
            setConfirmingSchedule(false);
        }
    };

    const openDocument = (url) => {
        if (url) Linking.openURL(url).catch(err => console.error("Couldn't open document", err));
    };

    const appStatus = useMemo(() => {
        if (!application?.status) return "Application submitted";
        return Array.isArray(application.status) ? application.status[0] : application.status;
    }, [application]);

    const steps = [
        "Application submitted",
        "Application approved",
        "Payment complete",
        "Documents uploaded",
        "Documents approved",
        "Documents received",
        "Documents submitted",
        "Processing by DFA",
        "DFA approved",
        "Passport released"
    ];

    const currentStepIndex = useMemo(() => {
        const index = steps.findIndex(s => s.toLowerCase() === appStatus.toLowerCase());
        return Math.max(0, index);
    }, [steps, appStatus]);

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f5f7fa', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#305797" />
                <Text style={{ marginTop: 10, color: '#6b7280' }}>Loading details...</Text>
            </View>
        );
    }

    if (!application) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f5f7fa', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#6b7280' }}>Application not found.</Text>
                <TouchableOpacity onPress={() => cs.goBack()} style={{ marginTop: 20, padding: 10, backgroundColor: '#305797', borderRadius: 8 }}>
                    <Text style={{ color: '#fff' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={PassportProgressStyle.container}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={PassportProgressStyle.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={PassportProgressStyle.headerContainer}>
                    <TouchableOpacity onPress={() => cs.goBack()} style={PassportProgressStyle.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text style={PassportProgressStyle.title}>Passport Details</Text>
                </View>

                {/* Application Info Card */}
                <View style={PassportProgressStyle.card}>
                    <Text style={PassportProgressStyle.cardTitle}>Application Info</Text>
                    
                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Reference</Text>
                        <Text style={PassportProgressStyle.infoValue}>{application.applicationNumber || application.applicationId || application._id}</Text>
                    </View>
                    
                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Status</Text>
                        <View style={PassportProgressStyle.statusTag}>
                            <Text style={PassportProgressStyle.statusText}>{appStatus}</Text>
                        </View>
                    </View>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Date Submitted</Text>
                        <Text style={PassportProgressStyle.infoValue}>{dayjs(application.createdAt).format('MMM D, YYYY')}</Text>
                    </View>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Applicant Name</Text>
                        <Text style={PassportProgressStyle.infoValue}>{application.username || 'N/A'}</Text>
                    </View>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>DFA Location</Text>
                        <Text style={PassportProgressStyle.infoValue}>{application.dfaLocation}</Text>
                    </View>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Preferred Date</Text>
                        <Text style={PassportProgressStyle.infoValue}>{dayjs(application.preferredDate).format('MMM D, YYYY')}</Text>
                    </View>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Preferred Time</Text>
                        <Text style={PassportProgressStyle.infoValue}>{application.preferredTime}</Text>
                    </View>

                    <View style={[PassportProgressStyle.infoRow, { borderBottomWidth: 0 }]}>
                        <Text style={PassportProgressStyle.infoLabel}>Application Type</Text>
                        <Text style={[PassportProgressStyle.infoValue, { fontFamily: 'Montserrat_700Bold', color: '#305797' }]}>
                            {application.applicationType}
                        </Text>
                    </View>
                </View>

                {/* 🔥 SUGGESTED APPOINTMENTS CARD 🔥 */}
                {appStatus.toLowerCase() === 'application submitted' && (
                    <View style={PassportProgressStyle.card}>
                        <Text style={PassportProgressStyle.cardTitle}>Suggested Appointment Options</Text>
                        
                        {application.suggestedAppointmentSchedules?.length > 0 ? (
                            <>
                                <Text style={{ color: '#6b7280', marginBottom: 15, fontSize: 13 }}>Please select a date and time for your DFA appointment.</Text>
                                
                                {application.suggestedAppointmentSchedules.map((slot, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            PassportProgressStyle.optionCard,
                                            selectedScheduleIndex === index && PassportProgressStyle.optionCardSelected
                                        ]}
                                        onPress={() => setSelectedScheduleIndex(index)}
                                    >
                                        <View style={PassportProgressStyle.optionTag}>
                                            <Text style={PassportProgressStyle.optionTagText}>Option {index + 1}</Text>
                                        </View>
                                        <Text style={PassportProgressStyle.optionDate}>{dayjs(slot.date).format("MMM DD, YYYY")}</Text>
                                        <Text style={PassportProgressStyle.optionTime}>{slot.time}</Text>
                                    </TouchableOpacity>
                                ))}
                                
                                <TouchableOpacity 
                                    style={[PassportProgressStyle.submitBtn, selectedScheduleIndex === null && { opacity: 0.5 }]}
                                    disabled={selectedScheduleIndex === null || confirmingSchedule}
                                    onPress={handleConfirmSchedule}
                                >
                                    {confirmingSchedule ? <ActivityIndicator color="#fff" /> : <Text style={PassportProgressStyle.submitBtnText}>Confirm Selected Date</Text>}
                                </TouchableOpacity>
                            </>
                        ) : (
                            /* 🔥 EMPTY STATE DISPLAYED HERE 🔥 */
                            <Text style={{ color: '#6b7280', fontSize: 14 }}>No suggested dates yet. Please check back later.</Text>
                        )}
                    </View>
                )}

                {/* Submitted Documents Display */}
                {application.submittedDocuments && Object.keys(application.submittedDocuments).length > 0 && (
                    <View style={PassportProgressStyle.card}>
                        <Text style={PassportProgressStyle.cardTitle}>Submitted Documents</Text>
                        
                        {application.submittedDocuments.passportPhoto && (
                            <View style={PassportProgressStyle.docRow}>
                                <Text style={PassportProgressStyle.docLabel}>Passport Photo</Text>
                                <TouchableOpacity onPress={() => openDocument(application.submittedDocuments.passportPhoto)}>
                                    <Text style={PassportProgressStyle.docLink}>View Document</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {application.submittedDocuments.birthCertificate && (
                            <View style={PassportProgressStyle.docRow}>
                                <Text style={PassportProgressStyle.docLabel}>Birth Certificate</Text>
                                <TouchableOpacity onPress={() => openDocument(application.submittedDocuments.birthCertificate)}>
                                    <Text style={PassportProgressStyle.docLink}>View Document</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {application.submittedDocuments.applicationForm && (
                            <View style={PassportProgressStyle.docRow}>
                                <Text style={PassportProgressStyle.docLabel}>Application Form</Text>
                                <TouchableOpacity onPress={() => openDocument(application.submittedDocuments.applicationForm)}>
                                    <Text style={PassportProgressStyle.docLink}>View Document</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {application.submittedDocuments.govId && (
                            <View style={PassportProgressStyle.docRow}>
                                <Text style={PassportProgressStyle.docLabel}>Government ID</Text>
                                <TouchableOpacity onPress={() => openDocument(application.submittedDocuments.govId)}>
                                    <Text style={PassportProgressStyle.docLink}>View Document</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {application.submittedDocuments.oldPassport && (
                            <View style={PassportProgressStyle.docRow}>
                                <Text style={PassportProgressStyle.docLabel}>Old Passport</Text>
                                <TouchableOpacity onPress={() => openDocument(application.submittedDocuments.oldPassport)}>
                                    <Text style={PassportProgressStyle.docLink}>View Document</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* Progress Tracker Card */}
                <View style={PassportProgressStyle.card}>
                    <Text style={PassportProgressStyle.cardTitle}>Progress Tracker</Text>

                    <View style={{ marginTop: 10 }}>
                        {steps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isActive = index === currentStepIndex;
                            const isLast = index === steps.length - 1;

                            return (
                                <View key={index} style={PassportProgressStyle.stepItem}>
                                    <View style={PassportProgressStyle.stepIndicator}>
                                        <View style={[PassportProgressStyle.stepCircle, isCompleted ? PassportProgressStyle.stepCircleActive : PassportProgressStyle.stepCircleInactive]}>
                                            <Text style={isCompleted ? PassportProgressStyle.stepNumberActive : PassportProgressStyle.stepNumberInactive}>
                                                {index + 1}
                                            </Text>
                                        </View>
                                        {!isLast && (
                                            <View style={[PassportProgressStyle.stepLine, isCompleted && !isActive ? PassportProgressStyle.stepLineActive : {}]} />
                                        )}
                                    </View>
                                    
                                    <View style={PassportProgressStyle.stepContent}>
                                        <Text style={isCompleted ? PassportProgressStyle.stepTitleActive : PassportProgressStyle.stepTitleInactive}>
                                            {step}
                                        </Text>
                                        {isActive && (
                                            <Text style={PassportProgressStyle.stepDesc}>Current Stage</Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}