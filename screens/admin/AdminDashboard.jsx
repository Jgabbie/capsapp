import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { LineChart, BarChart } from 'react-native-chart-kit'
import Header from '../../components/Header'
import AdminDashboardStyles from '../../styles/adminstyles/AdminDashboardStyle'
import AdminSidebar from '../../components/AdminSidebar'

export default function AdminDashboard() {
    const [isSidebarVisible, setSidebarVisible] = useState(false)

    const screenWidth = Dimensions.get('window').width

    const [getBookings, setBookings] = useState([
        { id: "1", ref: "BR-0001", package: "Boracay Tour", pax: "4", date: "09-14-2026", amount: 70000 },
    ])

    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => { setSidebarVisible(true) }} />
            <AdminSidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView style={AdminDashboardStyles.container}>
                <Text style={AdminDashboardStyles.header}>Admin Dashboard</Text>
                <View style={AdminDashboardStyles.statsContainer}>
                    <View style={AdminDashboardStyles.statsRow}>
                        <View style={AdminDashboardStyles.card}>
                            <Text style={AdminDashboardStyles.cardValue}>20</Text>
                            <Text style={AdminDashboardStyles.cardLabel}>Bookings</Text>
                        </View>

                        <View style={AdminDashboardStyles.card}>
                            <Text style={AdminDashboardStyles.cardValue}>5</Text>
                            <Text style={AdminDashboardStyles.cardLabel}>Users</Text>
                        </View>
                    </View>

                    <View style={AdminDashboardStyles.statsRow}>
                        <View style={AdminDashboardStyles.card}>
                            <Text style={AdminDashboardStyles.cardValue}>10</Text>
                            <Text style={AdminDashboardStyles.cardLabel}>Transactions</Text>
                        </View>

                        <View style={AdminDashboardStyles.card}>
                            <Text style={AdminDashboardStyles.cardValue}>10</Text>
                            <Text style={AdminDashboardStyles.cardLabel}>Cancellations</Text>
                        </View>
                    </View>

                    <Text style={AdminDashboardStyles.sectionTitle}>Monthly Bookings</Text>
                    <View style={{ alignItems: 'center' }}>

                        <View style={AdminDashboardStyles.cardChart}>
                            <LineChart
                                data={{
                                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                                    datasets: [
                                        {
                                            data: [20, 45, 28, 80, 99, 43]
                                        }
                                    ]
                                }}
                                width={screenWidth - 40}
                                height={220}
                                chartConfig={{
                                    propsForBackgroundLines: {
                                        strokeWidth: 0
                                    },
                                    backgroundColor: "#fff",
                                    backgroundGradientFrom: "#fff",
                                    backgroundGradientTo: "#fff",
                                    decimalPlaces: 0,
                                    color: () => "#305797",
                                    labelColor: () => "#305797",
                                    propsForDots: {
                                        propsForDots: {
                                            r: "2",
                                            strokeWidth: "0",
                                            fill: "#305797"
                                        }
                                    }
                                }}
                                style={{
                                    borderRadius: 12,
                                    marginBottom: 20
                                }}
                            />
                        </View>

                        <View style={AdminDashboardStyles.cardChart}>
                            <BarChart
                                data={{
                                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
                                    datasets: [{ data: [15, 30, 22, 40, 35] }]
                                }}
                                width={screenWidth - 40}
                                height={220}
                                yAxisLabel=""
                                chartConfig={{
                                    propsForBackgroundLines: {
                                        strokeWidth: 0
                                    },
                                    backgroundColor: "#fff",
                                    backgroundGradientFrom: "#fff",
                                    backgroundGradientTo: "#fff",
                                    decimalPlaces: 0,
                                    color: () => "#305797",
                                    labelColor: () => "#305797",
                                }}
                                style={{
                                    borderRadius: 12,
                                    marginBottom: 20
                                }}
                            />
                        </View>
                    </View>


                    <Text style={AdminDashboardStyles.sectionTitle}>Recent Bookings</Text>

                    {getBookings.map((item) => (
                        <View key={item.id} style={AdminDashboardStyles.bookingCard}>

                            <View style={AdminDashboardStyles.cardHeader}>
                                <Text style={AdminDashboardStyles.bookingRef}>{item.ref}</Text>
                                <Text style={AdminDashboardStyles.bookingStatus}>Confirmed</Text>
                            </View>

                            <View style={AdminDashboardStyles.cardBody}>
                                <Text style={AdminDashboardStyles.packageName}>{item.package}</Text>

                                <View style={AdminDashboardStyles.detailRow}>
                                    <Text style={AdminDashboardStyles.detailLabel}>Travelers:</Text>
                                    <Text style={AdminDashboardStyles.detailValue}>{item.pax}</Text>
                                </View>

                                <View style={AdminDashboardStyles.detailRow}>
                                    <Text style={AdminDashboardStyles.detailLabel}>Travel Date:</Text>
                                    <Text style={AdminDashboardStyles.detailValue}>{item.date}</Text>
                                </View>

                                <View style={AdminDashboardStyles.detailRow}>
                                    <Text style={AdminDashboardStyles.detailLabel}>Total Amount:</Text>
                                    <Text style={AdminDashboardStyles.price}>₱{item.price}</Text>
                                </View>
                            </View>

                            <View style={AdminDashboardStyles.cardActions}>
                                <TouchableOpacity
                                    style={AdminDashboardStyles.viewButton}
                                    onPress={() => cs.navigate("bookinginvoice")}
                                >
                                    <Text style={AdminDashboardStyles.buttonText}>View Details</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={AdminDashboardStyles.cancelButton}
                                    onPress={() => setModalVisible(true)}
                                >
                                    <Text style={AdminDashboardStyles.buttonText}>Cancel Booking</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    ))}

                </View>
            </ScrollView>
        </View>
    )
}
//https://www.npmjs.com/package/react-native-chart-kit