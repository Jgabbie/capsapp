import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'

import { useNavigation } from '@react-navigation/native'
import HeaderStyle from '../styles/HeaderStyle'


export default function Header({ openSidebar }) {
    const cs = useNavigation()

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

                <Image
                    source={require('../assets/images/profile_icon.png')}
                    style={HeaderStyle.profileIcon}
                />
            </View>
        </View>
    )
}