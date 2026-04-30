import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';

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

                console.log(visas)

                const passports = (passportRes.data || []).map(p => ({
                    key: p._id,
                    type: 'Passport',
                    serviceName: p.applicationType || 'Passport Application',
                    date: p.createdAt,
                    status: p.status,
                    ref: p.applicationNumber
                }));

                console.log(passports)

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

    const filteredApps = applications.filter(app =>
        app.serviceName.toLowerCase().includes(searchText.toLowerCase()) ||
        app.ref.toLowerCase().includes(searchText.toLowerCase()) ||
        app.status.toLowerCase().includes(searchText.toLowerCase())
    );

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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={UserApplicationsStyle.headerContainer}>
                    <Text style={UserApplicationsStyle.title}>My Applications</Text>
                    <Text style={UserApplicationsStyle.subtitle}>Track your ongoing visa and passport applications.</Text>

                    <View style={UserApplicationsStyle.searchContainer}>
                        <Ionicons name="search" size={20} color="#9ca3af" />
                        <TextInput
                            style={UserApplicationsStyle.searchInput}
                            placeholder="Search applications..."
                            value={searchText}
                            onChangeText={setSearchText}
                        />
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
        </View>
    );
}