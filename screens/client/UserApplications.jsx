import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';

import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import UserApplicationsStyle from '../../styles/clientstyles/UserApplicationsStyle';
import { api, withUserHeader } from '../../utils/api';
import { useUser } from '../../context/UserContext';

export default function UserApplications() {
    const cs = useNavigation();
    const { user } = useUser();
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [typeFilter, setTypeFilter] = useState("All"); 

    useEffect(() => {
        const fetchApplications = async () => {
            if (!user?._id) return;
            setLoading(true);
            try {
                const [passportRes, visaRes] = await Promise.all([
                    api.get('/passport/applications', withUserHeader(user._id)).catch(() => ({ data: [] })),
                    api.get('/visa/applications', withUserHeader(user._id)).catch(() => ({ data: [] }))
                ]);

                const passportApps = (passportRes.data || []).map(app => ({
                    key: app._id,
                    ref: app.applicationId || app._id,
                    type: 'Passport', // 🔥 FIXED: Force this to "Passport" so the filter button works perfectly
                    name: app.applicationType || 'Passport', // Will show "New Passport" or "Renew Passport"
                    status: app.status || 'Submitted',
                    date: app.createdAt,
                    details: app,
                }));

                const visaApps = (visaRes.data || []).map(app => ({
                    key: app._id,
                    ref: app.applicationNumber || app._id,
                    type: 'Visa',
                    name: app.serviceName || 'Visa',
                    status: app.status || 'Pending',
                    date: app.createdAt,
                    details: app,
                }));

                const combined = [...passportApps, ...visaApps].sort((a, b) => new Date(b.date) - new Date(a.date));
                setApplications(combined);
            } catch (err) {
                Alert.alert("Error", "Unable to load applications.");
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [user?._id]);

    const filteredData = applications.filter(item => {
        const matchesSearch =
            (item.ref || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (item.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (item.status || '').toLowerCase().includes(searchText.toLowerCase());
        const matchesType = typeFilter === "All" || item.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const getStatusColor = (status) => {
        const s = String(status).toLowerCase();
        if (s.includes('approved') || s.includes('complete') || s.includes('released')) return { bg: '#dcfce7', text: '#0369a1' };
        if (s.includes('rejected') || s.includes('cancelled')) return { bg: '#fee2e2', text: '#b91c1c' };
        return { bg: '#fef9c3', text: '#b45309' }; 
    };

    return (
        <View style={UserApplicationsStyle.container}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <View style={UserApplicationsStyle.headerContainer}>
                <Text style={UserApplicationsStyle.title}>My Applications</Text>
                <Text style={UserApplicationsStyle.subtitle}>Track your latest visa and passport applications.</Text>
                
                <View style={UserApplicationsStyle.searchContainer}>
                    <Ionicons name="search" size={18} color="#9ca3af" />
                    <TextInput
                        style={UserApplicationsStyle.searchInput}
                        placeholder="Search reference, type or status..."
                        placeholderTextColor="#9ca3af"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={16} color="#9ca3af" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={UserApplicationsStyle.filterScroll}>
                    {['All', 'Visa', 'Passport'].map(type => (
                        <TouchableOpacity 
                            key={type} 
                            style={[UserApplicationsStyle.filterPill, typeFilter === type && UserApplicationsStyle.filterPillActive]}
                            onPress={() => setTypeFilter(type)}
                        >
                            <Text style={[UserApplicationsStyle.filterPillText, typeFilter === type && UserApplicationsStyle.filterPillTextActive]}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={UserApplicationsStyle.listContainer} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color="#305797" style={{ marginTop: 40 }} />
                ) : filteredData.length === 0 ? (
                    <View style={UserApplicationsStyle.emptyContainer}>
                        <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
                        <Text style={UserApplicationsStyle.emptyText}>No applications found.</Text>
                    </View>
                ) : (
                    filteredData.map(item => {
                        const colors = getStatusColor(item.status);
                        return (
                            <View key={item.key} style={UserApplicationsStyle.card}>
                                <View style={UserApplicationsStyle.cardHeader}>
                                    <View>
                                        <Text style={UserApplicationsStyle.refText}>{item.ref}</Text>
                                        <Text style={UserApplicationsStyle.nameText}>{item.name}</Text>
                                    </View>
                                    <View style={[UserApplicationsStyle.statusTag, { backgroundColor: colors.bg }]}>
                                        <Text style={[UserApplicationsStyle.statusText, { color: colors.text }]}>{item.status}</Text>
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
            </ScrollView>
        </View>
    );
}