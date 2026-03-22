import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import Header from '../../components/Header'
import UserTransactionStyle from '../../styles/clientstyles/UserTransactionStyle'
import { api, withUserHeader } from '../../utils/api'
import { useUser } from '../../context/UserContext'
import Sidebar from '../../components/Sidebar'

export default function UserTransactions() {

    const cs = useNavigation()
    const { user } = useUser()
    const [isSidebarVisible, setSidebarVisible] = useState(false)
    const [searchText, setSearchText] = useState('')

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })

    const [getTransac, setTransac] = useState([])

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!user?._id) {
                setTransac([])
                return
            }

            try {
                const response = await api.get('/transaction/my-transactions', withUserHeader(user._id))
                setTransac(response.data || [])
            } catch (_error) {
                setTransac([])
            }
        }

        fetchTransactions()
    }, [user?._id])

    const filteredTransactions = useMemo(() => {
        if (!searchText.trim()) return getTransac
        const text = searchText.trim().toLowerCase()

        return getTransac.filter((item) => {
            const packageName = item.packageName?.toLowerCase() || ''
            const status = item.status?.toLowerCase() || ''
            const bookingRef = item.bookingId?.reference?.toLowerCase() || ''
            return packageName.includes(text) || status.includes(text) || bookingRef.includes(text)
        })
    }, [getTransac, searchText])

    return (
        <View style={{ flex: 1 }}>
            
            <Sidebar 
                visible={isSidebarVisible} 
                onClose={() => setSidebarVisible(false)} 
            />

            <Header openSidebar={() => setSidebarVisible(true)} />

            <ScrollView
                contentContainerStyle={UserTransactionStyle.container}
                showsVerticalScrollIndicator={false}
            >
                <Text style={UserTransactionStyle.title}>My Transactions</Text>

                <View style={UserTransactionStyle.searchRow}>
                    <View style={UserTransactionStyle.searchBar}>
                        <Ionicons name="search" size={16} />
                        <TextInput
                            style={UserTransactionStyle.searchInput}
                            placeholder='Search transaction'
                            placeholderTextColor="#777"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>

                    <View style={UserTransactionStyle.dropdownGroup}>
                        <View style={UserTransactionStyle.dropdownButton}>
                            <Text style={UserTransactionStyle.dropdownText}>Status</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" />
                        </View>
                        <View style={UserTransactionStyle.dropdownButton}>
                            <Text style={UserTransactionStyle.dropdownText}>Date</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" />
                        </View>
                    </View>
                </View>

                {filteredTransactions.map((item) => (
                    <View key={item._id} style={UserTransactionStyle.transactionCard}>

                        <View style={UserTransactionStyle.cardHeader}>
                            <Text style={UserTransactionStyle.transactionRef}>{item.bookingId?.reference || item._id}</Text>
                            <Text style={[
                                UserTransactionStyle.transactionStatus,
                                item.status === "Successful" ? { color: "#2ecc71" } : { color: "#f1c40f" }
                            ]}>
                                {item.status}
                            </Text>
                        </View>

                        <View style={UserTransactionStyle.cardBody}>
                            <Text style={UserTransactionStyle.packageName}>{item.packageName}</Text>

                            <View style={UserTransactionStyle.detailRow}>
                                <Text style={UserTransactionStyle.detailLabel}>Date:</Text>
                                <Text style={UserTransactionStyle.detailValue}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                            </View>

                            <View style={UserTransactionStyle.detailRow}>
                                <Text style={UserTransactionStyle.detailLabel}>Amount:</Text>
                                <Text style={UserTransactionStyle.amount}>₱{item.amount}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={UserTransactionStyle.viewButton}
                            onPress={() => cs.navigate("bookinginvoice", { booking: item.bookingId })}
                        >
                            <Text style={UserTransactionStyle.buttonText}>View Receipt</Text>
                        </TouchableOpacity>

                    </View>
                ))}
            </ScrollView>
        </View>
    )
}