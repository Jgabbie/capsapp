import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState, useMemo } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';

import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import NotificationStyle from '../../styles/clientstyles/NotificationStyle';
import { api, withUserHeader } from '../../utils/api';
import { useUser } from '../../context/UserContext';

export default function Notifications() {
    const navigation = useNavigation();
    const { user } = useUser();
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [notifs, setNotifs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchNotifs = async () => {
        try {
            const res = await api.get('/notifications/my', withUserHeader(user._id));
            setNotifs(res.data || []);
        } catch (e) { 
            console.log("Notif Error:", e.message); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => {
        if (user?._id) fetchNotifs();
    }, [user?._id]);

    const handleMarkAsRead = async (item) => {
        // 1. Mark it as read in the database
        if (!item.isRead) {
            try {
                await api.patch(`/notifications/${item._id}/read`, {}, withUserHeader(user._id));
                setNotifs(prev => prev.map(n => n._id === item._id ? { ...n, isRead: true } : n));
            } catch (e) { 
                console.log(e.message); 
            }
        }
        
        // 2. Convert Web Links to Mobile Routes!
        // E.g., Web sends "/user-transactions" -> Regex turns it into "usertransactions"
        if (item.link) {
            try {
                const route = item.link.replace(/[\/-]/g, '').toLowerCase();
                navigation.navigate(route);
            } catch (err) {
                console.log("Navigation error:", err);
            }
        }
    };

    const filteredNotifs = useMemo(() => {
        return notifs.filter(n => 
            n.title.toLowerCase().includes(search.toLowerCase()) || 
            n.message.toLowerCase().includes(search.toLowerCase())
        );
    }, [notifs, search]);

    return (
        <View style={{ flex: 1, backgroundColor: "#f5f7fa" }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />
            
            <ScrollView contentContainerStyle={NotificationStyle.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={NotificationStyle.headerContainer}>
                    <Text style={NotificationStyle.title}>Notifications</Text>
                    <Text style={NotificationStyle.subtitle}>Stay updated with your recent activities.</Text>
                </View>

                <View style={NotificationStyle.searchContainer}>
                    <Ionicons name="search" size={18} color="#9ca3af" />
                    <TextInput 
                        style={NotificationStyle.searchInput} 
                        placeholder="Search notifications..." 
                        placeholderTextColor="#9ca3af"
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch("")}>
                            <Ionicons name="close-circle" size={18} color="#9ca3af" />
                        </TouchableOpacity>
                    )}
                </View>

                {loading ? <ActivityIndicator size="large" color="#305797" style={{ marginTop: 40 }} /> : (
                    <View>
                        {filteredNotifs.length === 0 ? (
                            <View style={NotificationStyle.emptyContainer}>
                                <Ionicons name="notifications-off-outline" size={60} color="#d1d5db" />
                                <Text style={NotificationStyle.emptyText}>No notifications yet.</Text>
                            </View>
                        ) : filteredNotifs.map(item => (
                            <TouchableOpacity 
                                key={item._id} 
                                style={[NotificationStyle.notifCard, !item.isRead && NotificationStyle.unreadCard]}
                                onPress={() => handleMarkAsRead(item)}
                                activeOpacity={0.7}
                            >
                                <View style={NotificationStyle.dotContainer}>
                                    <View style={item.isRead ? NotificationStyle.dotRead : NotificationStyle.dotUnread} />
                                </View>
                                
                                <View style={NotificationStyle.content}>
                                    <Text style={NotificationStyle.notifTitle}>{item.title}</Text>
                                    <Text style={NotificationStyle.notifMessage}>{item.message}</Text>
                                    {/* Formatted to match Web: 4/4/2026, 8:46:36 PM */}
                                    <Text style={NotificationStyle.time}>
                                        {dayjs(item.createdAt).format('M/D/YYYY, h:mm A')}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}