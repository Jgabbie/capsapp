import { View, TouchableOpacity, Image } from 'react-native'
import React from 'react'

import { useNavigation } from '@react-navigation/native'
import HeaderStyle from '../styles/componentstyles/HeaderStyle'
import { useUser } from '../context/UserContext' // <--- NEW

export default function Header({ openSidebar }) {
    const cs = useNavigation()
    const { user } = useUser() // <--- NEW

    // <--- NEW: Determine which image to show
    const profileImageSource = user?.profileImage
        ? { uri: user.profileImage }
        : require('../assets/images/profile_icon.png')

    return (
        <View style={HeaderStyle.headerContainer}>
            <TouchableOpacity
                style={HeaderStyle.sideBarButton}
                onPress={openSidebar}
            >
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
                <TouchableOpacity style={HeaderStyle.bellButton} onPress={() => {
                    cs.navigate("notifications")
                }}>
                    <Image
                        source={require('../assets/images/bell_icon.png')}
                        style={HeaderStyle.bellIcon}
                    />
                </TouchableOpacity>

                {/* <--- UPDATED: Using the dynamic image source and making it round */}
                <Image
                    source={profileImageSource}
                    style={[HeaderStyle.profileIcon, { borderRadius: 50 }]} 
                />
            </View>
        </View>
    )
}