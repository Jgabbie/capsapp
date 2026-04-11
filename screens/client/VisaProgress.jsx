import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Linking } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import dayjs from "dayjs";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import VisaProgressStyle from "../../styles/clientstyles/VisaProgressStyle";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";

export default function VisaProgress() {
    const cs = useNavigation()
    const route = useRoute()
    const { user } = useUser()
    const [isSidebarVisible, setSidebarVisible] = useState(false)
    
    const applicationId = route.params?.applicationId;

    const [application, setApplication] = useState(null)
    const [servicePrice, setServicePrice] = useState(0)
    const [dynamicSteps, setDynamicSteps] = useState([])
    const [loading, setLoading] = useState(true)

    // 🔥 NEW STATES FOR SUGGESTED SCHEDULES 🔥
    const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(null);
    const [confirmingSchedule, setConfirmingSchedule] = useState(false);

    const fetchApplicationDetails = async () => {
        if (!user?._id || !applicationId) return;
        
        try {
            setLoading(true);
            
            const appRes = await api.get('/visa/applications', withUserHeader(user._id));
            const appData = appRes.data.find(app => app._id === applicationId);
            
            if (!appData) throw new Error("Application not found in your list.");
            
            setApplication(appData);

            if (appData?.serviceId) {
                const serviceId = appData.serviceId._id || appData.serviceId;
                const servRes = await api.get(`/visa-services/get-service/${serviceId}`, withUserHeader(user._id));
                
                setServicePrice(servRes.data?.visaPrice || 0);
                
                if (servRes.data?.visaProcessSteps && servRes.data.visaProcessSteps.length > 0) {
                    setDynamicSteps(servRes.data.visaProcessSteps);
                }
            }
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

    // 🔥 NEW FUNCTION: Submit the chosen appointment to the backend 🔥
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
            await api.put(`/visa/applications/${application._id}/choose-appointment`, {
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

    const appStatus = useMemo(() => {
        if (!application?.status) return "Pending";
        return Array.isArray(application.status) ? application.status[0] : application.status;
    }, [application]);

    const openDocument = (url) => {
        if (url) Linking.openURL(url).catch(err => console.error("Couldn't open document", err));
    };

    const steps = useMemo(() => {
        if (dynamicSteps.length > 0) return dynamicSteps;
        if (application?.serviceName?.includes('Canada')) return ["aaa", "aaa", "aaa"];

        return [
            "Application Submitted",
            "Application Approved",
            "Payment Complete",
            "Documents Uploaded",
            "Documents Approved",
            "Documents Received",
            "Documents Submitted",
            "Processing by Embassy",
            "Embassy Approved",
            "Passport Released"
        ];
    }, [dynamicSteps, application]);

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
        <View style={VisaProgressStyle.container}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={VisaProgressStyle.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={VisaProgressStyle.headerContainer}>
                    <TouchableOpacity onPress={() => cs.goBack()} style={VisaProgressStyle.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text style={VisaProgressStyle.title}>Visa Application Details</Text>
                </View>

                {/* Application Info Card */}
                <View style={VisaProgressStyle.card}>
                    <Text style={VisaProgressStyle.cardTitle}>Application Info</Text>
                    
                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Reference</Text>
                        <Text style={VisaProgressStyle.infoValue}>{application.applicationNumber || application._id}</Text>
                    </View>
                    
                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Status</Text>
                        <View style={VisaProgressStyle.statusTag}>
                            <Text style={VisaProgressStyle.statusText}>{appStatus}</Text>
                        </View>
                    </View>

                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Date Submitted</Text>
                        <Text style={VisaProgressStyle.infoValue}>{dayjs(application.createdAt).format('MMM D, YYYY')}</Text>
                    </View>

                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Applicant Name</Text>
                        <Text style={VisaProgressStyle.infoValue}>{application.applicantName || 'N/A'}</Text>
                    </View>

                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Preferred Date</Text>
                        <Text style={VisaProgressStyle.infoValue}>{dayjs(application.preferredDate).format('MMM D, YYYY')}</Text>
                    </View>

                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Preferred Time</Text>
                        <Text style={VisaProgressStyle.infoValue}>{application.preferredTime}</Text>
                    </View>

                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Application Type</Text>
                        <Text style={VisaProgressStyle.infoValue}>{application.serviceName}</Text>
                    </View>

                    <View style={[VisaProgressStyle.infoRow, { borderBottomWidth: 0 }]}>
                        <Text style={VisaProgressStyle.infoLabel}>Total Price</Text>
                        <Text style={[VisaProgressStyle.infoValue, { fontFamily: 'Montserrat_700Bold', color: '#305797' }]}>
                            ₱{servicePrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                    </View>
                </View>

                {/* 🔥 SUGGESTED APPOINTMENTS CARD 🔥 */}
                {appStatus.toLowerCase() === 'application submitted' && (
                    <View style={VisaProgressStyle.card}>
                        <Text style={VisaProgressStyle.cardTitle}>Suggested Appointment Options</Text>
                        
                        {application.suggestedAppointmentSchedules?.length > 0 ? (
                            <>
                                <Text style={{ color: '#6b7280', marginBottom: 15, fontSize: 13 }}>Please select a date and time for your Embassy appointment.</Text>
                                
                                {application.suggestedAppointmentSchedules.map((slot, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            VisaProgressStyle.optionCard,
                                            selectedScheduleIndex === index && VisaProgressStyle.optionCardSelected
                                        ]}
                                        onPress={() => setSelectedScheduleIndex(index)}
                                    >
                                        <View style={VisaProgressStyle.optionTag}>
                                            <Text style={VisaProgressStyle.optionTagText}>Option {index + 1}</Text>
                                        </View>
                                        <Text style={VisaProgressStyle.optionDate}>{dayjs(slot.date).format("MMM DD, YYYY")}</Text>
                                        <Text style={VisaProgressStyle.optionTime}>{slot.time}</Text>
                                    </TouchableOpacity>
                                ))}
                                
                                <TouchableOpacity 
                                    style={[VisaProgressStyle.submitBtn, selectedScheduleIndex === null && { opacity: 0.5 }]}
                                    disabled={selectedScheduleIndex === null || confirmingSchedule}
                                    onPress={handleConfirmSchedule}
                                >
                                    {confirmingSchedule ? <ActivityIndicator color="#fff" /> : <Text style={VisaProgressStyle.submitBtnText}>Confirm Selected Date</Text>}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <Text style={{ color: '#6b7280', fontSize: 14 }}>No suggested dates yet. Please check back later.</Text>
                        )}
                    </View>
                )}

                {/* Submitted Documents Display */}
                {application.submittedDocuments && Object.keys(application.submittedDocuments).length > 0 && (
                    <View style={VisaProgressStyle.card}>
                        <Text style={VisaProgressStyle.cardTitle}>Submitted Documents</Text>
                        
                        {application.submittedDocuments.validPassport && (
                            <View style={VisaProgressStyle.docRow}>
                                <Text style={VisaProgressStyle.docLabel}>Valid Passport</Text>
                                <TouchableOpacity onPress={() => openDocument(application.submittedDocuments.validPassport)}>
                                    <Text style={VisaProgressStyle.docLink}>View Document</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {application.submittedDocuments.completedVisaApplicationForm && (
                            <View style={VisaProgressStyle.docRow}>
                                <Text style={VisaProgressStyle.docLabel}>Application Form</Text>
                                <TouchableOpacity onPress={() => openDocument(application.submittedDocuments.completedVisaApplicationForm)}>
                                    <Text style={VisaProgressStyle.docLink}>View Document</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {application.submittedDocuments.passportSizePhoto && (
                            <View style={VisaProgressStyle.docRow}>
                                <Text style={VisaProgressStyle.docLabel}>Passport Photo</Text>
                                <TouchableOpacity onPress={() => openDocument(application.submittedDocuments.passportSizePhoto)}>
                                    <Text style={VisaProgressStyle.docLink}>View Document</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {application.submittedDocuments.bankCertificateAndStatement && (
                            <View style={VisaProgressStyle.docRow}>
                                <Text style={VisaProgressStyle.docLabel}>Bank Cert / Statement</Text>
                                <TouchableOpacity onPress={() => openDocument(application.submittedDocuments.bankCertificateAndStatement)}>
                                    <Text style={VisaProgressStyle.docLink}>View Document</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* Progress Tracker Card */}
                <View style={VisaProgressStyle.card}>
                    <Text style={VisaProgressStyle.cardTitle}>Progress Tracker</Text>

                    <View style={{ marginTop: 10 }}>
                        {steps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isActive = index === currentStepIndex;
                            const isLast = index === steps.length - 1;

                            return (
                                <View key={index} style={VisaProgressStyle.stepItem}>
                                    <View style={VisaProgressStyle.stepIndicator}>
                                        <View style={[VisaProgressStyle.stepCircle, isCompleted ? VisaProgressStyle.stepCircleActive : VisaProgressStyle.stepCircleInactive]}>
                                            <Text style={isCompleted ? VisaProgressStyle.stepNumberActive : VisaProgressStyle.stepNumberInactive}>
                                                {index + 1}
                                            </Text>
                                        </View>
                                        {!isLast && (
                                            <View style={[VisaProgressStyle.stepLine, isCompleted && !isActive ? VisaProgressStyle.stepLineActive : {}]} />
                                        )}
                                    </View>
                                    
                                    <View style={VisaProgressStyle.stepContent}>
                                        <Text style={isCompleted ? VisaProgressStyle.stepTitleActive : VisaProgressStyle.stepTitleInactive}>
                                            {step.charAt(0).toUpperCase() + step.slice(1)}
                                        </Text>
                                        {isActive && (
                                            <Text style={VisaProgressStyle.stepDesc}>Current Stage</Text>
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