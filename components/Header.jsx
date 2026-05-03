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
            // 🔥 Match Web: Request 25 items
            const response = await api.get('/notifications/my?limit=25', withUserHeader(user._id));

            // 🔥 Count unread within those 25 items (Should result in 22)
            const list = response.data || [];
            const count = list.filter(n => !n.isRead).length;

            setUnreadCount(count);
        } catch (error) {
            console.log("Header Sync Error:", error.message);
        }
    };

    useEffect(() => {
        fetchUnread();

        // Keep the badge updated whenever the user navigates back to the current screen
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
                source={require('../assets/images/Logo.png')}
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
                            minWidth: 18, height: 18, paddingHorizontal: 4, // minWidth ensures it stays circular but can expand
                            justifyContent: 'center', alignItems: 'center',
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