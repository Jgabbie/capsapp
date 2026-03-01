import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import UserTransactionStyle from '../../styles/clientstyles/UserTransactionStyle'

export default function UserTransactions() {

    const cs = useNavigation()
    const [isSidebarVisible, setSidebarVisible] = useState(false)

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })

    const [getTransac, setTransac] = useState([
        { id: "1", ref: "TR-0001", package: "Boracay Tour", status: "Paid", date: "09-14-2026", amount: 70000 },
    ])

    return (
        <View style={{ flex: 1 }}>
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


                {getTransac.map((item) => (
                    <View key={item.id} style={UserTransactionStyle.transactionCard}>

                        <View style={UserTransactionStyle.cardHeader}>
                            <Text style={UserTransactionStyle.transactionRef}>{item.ref}</Text>
                            <Text style={[
                                UserTransactionStyle.transactionStatus,
                                item.status === "Paid" ? { color: "#2ecc71" } : { color: "#f1c40f" }
                            ]}>
                                {item.status}
                            </Text>
                        </View>

                        <View style={UserTransactionStyle.cardBody}>
                            <Text style={UserTransactionStyle.packageName}>{item.package}</Text>

                            <View style={UserTransactionStyle.detailRow}>
                                <Text style={UserTransactionStyle.detailLabel}>Date:</Text>
                                <Text style={UserTransactionStyle.detailValue}>{item.date}</Text>
                            </View>

                            <View style={UserTransactionStyle.detailRow}>
                                <Text style={UserTransactionStyle.detailLabel}>Amount:</Text>
                                <Text style={UserTransactionStyle.amount}>₱{item.amount}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={UserTransactionStyle.viewButton}
                            onPress={() => cs.navigate("transactionreceipt")}
                        >
                            <Text style={UserTransactionStyle.buttonText}>View Receipt</Text>
                        </TouchableOpacity>

                    </View>
                ))}
            </ScrollView>
        </View>

    )
}

//https://www.youtube.com/watch?v=iMCM1NceGJY