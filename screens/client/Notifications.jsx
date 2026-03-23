import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState, useMemo } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
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
        } catch (e) { console.log("Notif Error:", e.message); } 
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (user?._id) fetchNotifs();
    }, [user?._id]);

    const handleMarkAsRead = async (item) => {
        if (!item.isRead) {
            try {
                await api.patch(`/notifications/${item._id}/read`, {}, withUserHeader(user._id));
                setNotifs(prev => prev.map(n => n._id === item._id ? { ...n, isRead: true } : n));
            } catch (e) { console.log(e.message); }
        }
        if (item.link) {
            // Mapping web links to mobile routes
            const route = item.link.replace('/', '').toLowerCase();
            navigation.navigate(route);
        }
    };

    const filteredNotifs = useMemo(() => {
        return notifs.filter(n => 
            n.title.toLowerCase().includes(search.toLowerCase()) || 
            n.message.toLowerCase().includes(search.toLowerCase())
        );
    }, [notifs, search]);

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />
            
            <View style={NotificationStyle.container}>
                <Text style={NotificationStyle.title}>Notifications</Text>
                
                <View style={NotificationStyle.searchBar}>
                    <Ionicons name="search" size={18} color="#777" />
                    <TextInput 
                        style={NotificationStyle.searchInput} 
                        placeholder="Search reference or updates..." 
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                {loading ? <ActivityIndicator color="#305797" /> : (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 20}}>
                        {filteredNotifs.length === 0 ? (
                            <View style={NotificationStyle.emptyContainer}>
                                <Ionicons name="notifications-off-outline" size={60} color="#eee" />
                                <Text style={NotificationStyle.emptyText}>No notifications yet.</Text>
                            </View>
                        ) : filteredNotifs.map(item => (
                            <TouchableOpacity 
                                key={item._id} 
                                style={[NotificationStyle.notifCard, !item.isRead && NotificationStyle.unreadCard]}
                                onPress={() => handleMarkAsRead(item)}
                            >
                                {!item.isRead && <View style={NotificationStyle.dot} />}
                                <View style={NotificationStyle.content}>
                                    <Text style={NotificationStyle.notifTitle}>{item.title}</Text>
                                    <Text style={NotificationStyle.notifMessage}>{item.message}</Text>
                                    <Text style={NotificationStyle.time}>{new Date(item.createdAt).toLocaleString()}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="#ccc" />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>
        </View>
    );
}