import { View, Text } from 'react-native'
import React, { useState } from 'react'
import Header from '../../components/Header'
import AdminSidebar from '../../components/AdminSidebar'
import AddPackagesStyle from '../../styles/adminstyles/AddPackagesStyle'

export default function AddPackages() {
    const [isSidebarVisible, setSidebarVisible] = useState(false);

    return (
        <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
            
            <Header openSidebar={() => setSidebarVisible(true)} />

            <AdminSidebar 
                visible={isSidebarVisible} 
                onClose={() => setSidebarVisible(false)} 
            />

            <View style={AddPackagesStyle.container}>
                <Text style={AddPackagesStyle.headerText}>Add Package</Text>
                
                <View style={AddPackagesStyle.formPlaceholder}>
                    <Text style={{ color: '#777' }}>Form fields coming soon...</Text>
                </View>
            </View>
        </View>
    )
}