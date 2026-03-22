import { View, TouchableOpacity, Image, Text } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import HeaderStyle from '../styles/componentstyles/HeaderStyle'
import { useUser } from '../context/UserContext'
import { api, withUserHeader } from '../utils/api'

export default function Header({ openSidebar }) {
    const cs = useNavigation()
    const { user } = useUser()
    const [unreadCount, setUnreadCount] = useState(0)

    const fetchUnread = async () => {
        if (!user?._id) return;
        try {
            // Path must match app.use('/api/notifications', ...) in your server.js
            const response = await api.get('/notifications/my', withUserHeader(user._id));
            const count = (response.data || []).filter(n => !n.isRead).length;
            setUnreadCount(count);
        } catch (error) {
            // If this logs 404, your backend route might be singular: '/notification/my'
            console.log("Header Notif Sync Error (Check your backend routes):", error.message);
        }
    };

    useEffect(() => {
        fetchUnread();
        
        const unsubscribe = cs.addListener('focus', () => {
            fetchUnread();
        });

        return unsubscribe;
    }, [user?._id, cs]);

    const profileImageSource = user?.profileImage
        ? { uri: user.profileImage }
        : require('../assets/images/profile_icon.png')

    return (
        <View style={HeaderStyle.headerContainer}>
            <TouchableOpacity style={HeaderStyle.sideBarButton} onPress={openSidebar}>
                <Image
                    source={require('../assets/images/sidebar_btn.png')}
                    style={HeaderStyle.sideBarImage}
                    resizeMode='contain'
                />
            </TouchableOpacity>

            <Image
                source={require('../assets/images/mrc_logo2.png')}
                style={HeaderStyle.logo}
                resizeMode='contain'
            />

            <View style={HeaderStyle.rightIconsContainer}>
                <TouchableOpacity style={HeaderStyle.bellButton} onPress={() => cs.navigate("notifications")}>
                    <Image
                        source={require('../assets/images/bell_icon.png')}
                        style={HeaderStyle.bellIcon}
                    />
                    {unreadCount > 0 && (
                        <View style={{
                            position: 'absolute', right: -2, top: -2,
                            backgroundColor: '#ff4d4f', borderRadius: 10,
                            width: 18, height: 18, justifyContent: 'center', alignItems: 'center',
                            borderWidth: 1.5, borderColor: '#fff'
                        }}>
                            <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Image
                    source={profileImageSource}
                    style={[HeaderStyle.profileIcon, { borderRadius: 50 }]} 
                />
            </View>
        </View>
    )
}