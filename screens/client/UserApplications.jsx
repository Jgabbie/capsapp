import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Calendar } from 'react-native-calendars';

import { useFonts, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';

import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import UserApplicationsStyle from '../../styles/clientstyles/UserApplicationsStyle';
import { api, withUserHeader } from '../../utils/api';
import { useUser } from '../../context/UserContext';

export default function UserApplications() {
    const cs = useNavigation();
    const { user } = useUser();
    const [isSidebarVisible, setSidebarVisible] = useState(false);

    const [fontsLoaded] = useFonts({
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    });

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState('Status');
    const [applicationDateFilter, setApplicationDateFilter] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);

    useEffect(() => {
        const fetchApplications = async () => {
            if (!user?._id) return;
            setLoading(true);
            try {
                const [visaRes, passportRes] = await Promise.all([
                    api.get('/visa/applications', withUserHeader(user._id)),
                    api.get('/passport/applications', withUserHeader(user._id))
                ]);

                const visas = (visaRes.data || []).map(v => ({
                    key: v._id,
                    type: 'Visa',
                    serviceName: v.serviceName || 'Visa Application',
                    date: v.createdAt,
                    status: Array.isArray(v.status) ? v.status[0] : v.status,
                    ref: v.applicationNumber
                }));

                const passports = (passportRes.data || []).map(p => ({
                    key: p._id,
                    type: 'Passport',
                    serviceName: p.applicationType || 'Passport Application',
                    date: p.createdAt,
                    status: p.status,
                    ref: p.applicationNumber
                }));

                const combined = [...visas, ...passports].sort((a, b) => new Date(b.date) - new Date(a.date));
                setApplications(combined);
            } catch (error) {
                Alert.alert("Error", error.response?.data?.message || "Could not load applications.");
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, [user?._id]);

    const statusOptions = useMemo(() => {
        const uniqueStatuses = [...new Set(applications
            .map((app) => String(app.status || '').trim())
            .filter(Boolean))];
        return ['All', ...uniqueStatuses];
    }, [applications]);

    const filteredApps = useMemo(() => {
        return applications.filter((app) => {
            const search = searchText.trim().toLowerCase();
            const serviceName = String(app.serviceName || '').toLowerCase();
            const ref = String(app.ref || '').toLowerCase();
            const status = String(app.status || '').toLowerCase();

            const matchesSearch =
                search === '' ||
                serviceName.includes(search) ||
                ref.includes(search) ||
                status.includes(search);

            const matchesStatus =
                statusFilter === 'Status' ||
                statusFilter === 'All' ||
                status === String(statusFilter).toLowerCase();

            const matchesDate =
                !applicationDateFilter ||
                dayjs(app.date).format('YYYY-MM-DD') === applicationDateFilter;

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [applications, searchText, statusFilter, applicationDateFilter]);

    const handleDateChange = (day) => {
        setApplicationDateFilter(day.dateString);
        setShowDateModal(false);
    };

    const getStatusStyle = (status) => {
        const s = String(status || '').toLowerCase();
        if (s.includes('submitted') || s.includes('pending')) return { bg: '#fffbe6', text: '#d48806' };
        if (s.includes('approved') || s.includes('released') || s.includes('complete')) return { bg: '#f6ffed', text: '#389e0d' };
        if (s.includes('rejected') || s.includes('cancelled')) return { bg: '#fff1f0', text: '#cf1322' };
        return { bg: '#f0f5ff', text: '#2f54eb' };
    };

    if (!fontsLoaded) return null;

    return (
        <View style={UserApplicationsStyle.container}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                <View style={UserApplicationsStyle.headerContainer}>
                    <Text style={UserApplicationsStyle.title}>My Applications</Text>
                    <Text style={UserApplicationsStyle.subtitle}>Track your ongoing visa and passport applications.</Text>

                    <View style={UserApplicationsStyle.filterSection}>
                        <View style={UserApplicationsStyle.searchContainer}>
                            <Ionicons name="search" size={18} color="#9ca3af" />
                            <TextInput
                                style={UserApplicationsStyle.searchInput}
                                placeholder="Search applications..."
                                placeholderTextColor="#9ca3af"
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                            {searchText !== '' && (
                                <TouchableOpacity onPress={() => setSearchText('')}>
                                    <Ionicons name="close-circle" size={18} color="#d1d5db" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={UserApplicationsStyle.dropdownGroup}>
                            <TouchableOpacity
                                style={UserApplicationsStyle.dropdownButton}
                                onPress={() => setShowStatusModal(true)}
                            >
                                <Text style={UserApplicationsStyle.dropdownText}>
                                    {statusFilter === 'All' ? 'Status' : statusFilter}
                                </Text>
                                <Ionicons name="chevron-down" size={12} color="#9ca3af" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={UserApplicationsStyle.dropdownButton}
                                onPress={() => setShowDateModal(true)}
                            >
                                <Text style={UserApplicationsStyle.dropdownText}>
                                    {applicationDateFilter ? dayjs(applicationDateFilter).format('MMM DD') : 'Application Date'}
                                </Text>
                                <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
                            </TouchableOpacity>

                            {(statusFilter !== 'Status' && statusFilter !== 'All') || applicationDateFilter ? (
                                <TouchableOpacity
                                    style={UserApplicationsStyle.clearFilterBtn}
                                    onPress={() => {
                                        setStatusFilter('Status');
                                        setApplicationDateFilter(null);
                                    }}
                                >
                                    <Ionicons name="refresh-circle" size={30} color="#ff4d4f" />
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    </View>

                </View>

                <View style={UserApplicationsStyle.filterScroll}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#305797" style={{ marginTop: 40 }} />
                    ) : filteredApps.length === 0 ? (
                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <Text style={{ color: '#9ca3af', fontFamily: 'Roboto_400Regular' }}>No applications found.</Text>
                        </View>
                    ) : (
                        filteredApps.map((item, index) => {
                            const statusStyle = getStatusStyle(item.status);
                            return (
                                <View key={item.key || index} style={UserApplicationsStyle.card}>
                                    <View style={UserApplicationsStyle.cardHeader}>

                                        {/* 🔥 FIXED: Added headerLeft to handle flex space cleanly */}
                                        <View style={UserApplicationsStyle.headerLeft}>
                                            <Text style={UserApplicationsStyle.typeLabel}>{item.ref}</Text>
                                            <Text style={UserApplicationsStyle.applicationName} numberOfLines={2}>
                                                {item.serviceName}
                                            </Text>
                                        </View>

                                        <View style={[UserApplicationsStyle.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                            <Text style={[UserApplicationsStyle.statusText, { color: statusStyle.text }]}>
                                                {item.status}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={UserApplicationsStyle.cardFooter}>
                                        <View>
                                            <Text style={UserApplicationsStyle.dateLabel}>Application Date</Text>
                                            <Text style={UserApplicationsStyle.dateText}>{dayjs(item.date).format('MMM D, YYYY')}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={UserApplicationsStyle.viewButton}
                                            onPress={() => {
                                                if (item.type === 'Visa') {
                                                    cs.navigate('visaprogress', { applicationId: item.key });
                                                } else {
                                                    cs.navigate('passportprogress', { applicationId: item.key });
                                                }
                                            }}
                                        >
                                            <Text style={UserApplicationsStyle.viewButtonText}>View</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            <Modal
                visible={showStatusModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowStatusModal(false)}
            >
                <TouchableOpacity
                    style={UserApplicationsStyle.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowStatusModal(false)}
                >
                    <TouchableWithoutFeedback>
                        <View style={UserApplicationsStyle.modalContainer}>
                            <View style={UserApplicationsStyle.modalHeaderRow}>
                                <Text style={UserApplicationsStyle.modalTitleText}>Select Status</Text>
                                <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                                    <Ionicons name="close" size={22} color="#9ca3af" />
                                </TouchableOpacity>
                            </View>

                            <View style={UserApplicationsStyle.tagContainer}>
                                {statusOptions.map((status) => {
                                    const isSelected =
                                        (statusFilter === 'Status' && status === 'All') || status === statusFilter;
                                    return (
                                        <TouchableOpacity
                                            key={status}
                                            style={[
                                                UserApplicationsStyle.modalStatusTag,
                                                isSelected && UserApplicationsStyle.modalStatusTagSelected,
                                            ]}
                                            onPress={() => {
                                                setStatusFilter(status);
                                                setShowStatusModal(false);
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    UserApplicationsStyle.modalStatusText,
                                                    isSelected && UserApplicationsStyle.modalStatusTextSelected,
                                                ]}
                                            >
                                                {status}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            <Modal
                visible={showDateModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDateModal(false)}
            >
                <TouchableOpacity
                    style={UserApplicationsStyle.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDateModal(false)}
                >
                    <TouchableWithoutFeedback>
                        <View style={UserApplicationsStyle.modalContainer}>
                            <View style={UserApplicationsStyle.modalHeaderRow}>
                                <Text style={UserApplicationsStyle.modalTitleText}>Application Date</Text>
                                <TouchableOpacity onPress={() => setShowDateModal(false)}>
                                    <Ionicons name="close" size={22} color="#9ca3af" />
                                </TouchableOpacity>
                            </View>
                            <Calendar
                                onDayPress={handleDateChange}
                                markedDates={applicationDateFilter ? {
                                    [applicationDateFilter]: { selected: true, selectedColor: '#305797' },
                                } : {}}
                                theme={{
                                    selectedDayBackgroundColor: '#305797',
                                    todayTextColor: '#305797',
                                    arrowColor: '#305797',
                                }}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}