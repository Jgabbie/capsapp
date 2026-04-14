import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, StatusBar, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import AdminSidebar from "../../components/AdminSidebar";
import BookingInvoiceStyle from "../../styles/clientstyles/BookingInvoiceStyle";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";

export default function BookingInvoice({ route, navigation }) {
    const { user } = useUser();
    
    // We expect the whole booking object from the previous screen
    const rawBooking = route?.params?.booking || null;
    const source = route?.params?.source || "user";
    const role = String(user?.role || "").trim().toLowerCase();
    const isAdminView = source === "admin" || role === "admin";
    
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [booking, setBooking] = useState(rawBooking);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const bookingDetails = booking?.bookingDetails || {};
    const reference = booking?.reference || booking?.ref || "--";

    // 1. Fetch live data exactly like the web version does
    useEffect(() => {
        if (!reference || reference === "--") {
            setLoading(false);
            return;
        }

        const fetchAllData = async () => {
            try {
                const bookingRes = await api.get(`/booking/by-reference/${reference}`, withUserHeader(user?._id));
                setBooking(bookingRes.data?.booking || rawBooking);
                setTransactions(bookingRes.data?.transactions || []);
            } catch (err) {
                console.error("Failed to load live booking details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [reference, user?._id]);

    // 2. Computed Totals (Synced with web calculations)
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Number(value || 0));
    };

    const totalPrice = Number(booking?.totalPrice || bookingDetails?.totalPrice || 0);
    
    // Sum only successful transactions
    const paidAmount = transactions
        .filter(txn => txn.status === "Paid" || txn.status === "Successful" || txn.status === "Fully Paid")
        .reduce((sum, txn) => sum + Number(txn.amount || 0), 0);

    const remainingBalance = Math.max(totalPrice - paidAmount, 0);

    // 3. Status logic
    const transactionStatus = transactions.length === 0 ? "Pending" : (paidAmount >= totalPrice ? "Fully Paid" : "Partial");
    
    const getPaymentStatus = () => {
        if (transactionStatus === "Fully Paid" || transactionStatus === "Paid") return { label: "Fully Paid", color: "#389e0d", bg: "#f6ffed" };
        if (transactionStatus === "Pending") return { label: "Not Paid", color: "#cf1322", bg: "#fff1f0" };
        return { label: "Balance Due", color: "#d48806", bg: "#fffbe6" };
    };
    const paymentStatus = getPaymentStatus();

    // 4. Display Variables
    const packageName = booking?.packageId?.packageName || bookingDetails?.packageName || "Tour Package";
    
    let formattedTravelDate = '--';
    if (booking?.travelDate && typeof booking.travelDate === 'string') {
        formattedTravelDate = booking.travelDate;
    } else if (booking?.travelDate?.startDate) {
        formattedTravelDate = `${dayjs(booking.travelDate.startDate).format('MMM D, YYYY')} - ${dayjs(booking.travelDate.endDate).format('MMM D, YYYY')}`;
    }

    // 5. Extract Travelers with Documents
    // 🔥 FIX: Safely check for arrays so it never tries to .map() a number!
    const travelersWithDocs = Array.isArray(bookingDetails?.travelers) 
        ? bookingDetails.travelers 
        : Array.isArray(bookingDetails?.passengers) 
            ? bookingDetails.passengers 
            : [];

    return (
        <SafeAreaView style={BookingInvoiceStyle.safeArea}>
            <StatusBar barStyle="dark-content" />
            <Header openSidebar={() => setSidebarVisible(true)} />
            {isAdminView ? (
                <AdminSidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />
            ) : (
                <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />
            )}

            {loading ? (
                <ActivityIndicator size="large" color="#305797" style={{ marginTop: 50 }} />
            ) : (
                <ScrollView contentContainerStyle={BookingInvoiceStyle.container} showsVerticalScrollIndicator={false}>
                    
                    {/* HEADER */}
                    <TouchableOpacity style={BookingInvoiceStyle.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={16} color="#fff" />
                        <Text style={BookingInvoiceStyle.backButtonText}>Back</Text>
                    </TouchableOpacity>

                    <Text style={BookingInvoiceStyle.pageTitle}>Booking Invoice</Text>
                    <Text style={BookingInvoiceStyle.pageSubtitle}>Review your balance and download the booking invoice.</Text>

                    {/* META SUMMARY CARD */}
                    <View style={BookingInvoiceStyle.metaContainer}>
                        <View style={BookingInvoiceStyle.metaRow}>
                            <View style={BookingInvoiceStyle.metaItem}>
                                <Text style={BookingInvoiceStyle.metaLabel}>Reference</Text>
                                <Text style={BookingInvoiceStyle.metaValue}>{reference}</Text>
                            </View>
                            <View style={BookingInvoiceStyle.metaItem}>
                                <Text style={BookingInvoiceStyle.metaLabel}>Package</Text>
                                <Text style={BookingInvoiceStyle.metaValue} numberOfLines={1}>{packageName}</Text>
                            </View>
                            <View style={[BookingInvoiceStyle.metaItem, { width: '100%' }]}>
                                <Text style={BookingInvoiceStyle.metaLabel}>Travel Date</Text>
                                <Text style={BookingInvoiceStyle.metaValue}>{formattedTravelDate}</Text>
                            </View>
                        </View>

                        <View style={BookingInvoiceStyle.statsRow}>
                            <View style={BookingInvoiceStyle.statCard}>
                                <Text style={BookingInvoiceStyle.statLabel}>Total Price</Text>
                                <Text style={BookingInvoiceStyle.statAmount}>{formatCurrency(totalPrice)}</Text>
                            </View>
                            <View style={BookingInvoiceStyle.statCard}>
                                <Text style={BookingInvoiceStyle.statLabel}>Paid Amount</Text>
                                <Text style={BookingInvoiceStyle.statAmount}>{formatCurrency(paidAmount)}</Text>
                            </View>
                            <View style={[BookingInvoiceStyle.statCard, BookingInvoiceStyle.statHighlight]}>
                                <Text style={BookingInvoiceStyle.statLabel}>Balance</Text>
                                <Text style={[BookingInvoiceStyle.statAmount, BookingInvoiceStyle.statAmountRed]}>{formatCurrency(remainingBalance)}</Text>
                                <Text style={[BookingInvoiceStyle.statusTag, { backgroundColor: paymentStatus.bg, color: paymentStatus.color }]}>
                                    {paymentStatus.label}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* DOCUMENTS CARD */}
                    <View style={BookingInvoiceStyle.card}>
                        <Text style={BookingInvoiceStyle.cardTitle}>Traveler Documents</Text>
                        
                        {travelersWithDocs.length === 0 ? (
                            <Text style={{ color: '#888' }}>No documents uploaded yet.</Text>
                        ) : (
                            travelersWithDocs.map((traveler, index) => (
                                <View key={index} style={BookingInvoiceStyle.travelerDocSection}>
                                    <Text style={BookingInvoiceStyle.travelerName}>
                                        Traveler {index + 1}: {traveler?.firstName} {traveler?.lastName}
                                    </Text>
                                    
                                    <View style={BookingInvoiceStyle.travelerDetailsRow}>
                                        <Text style={BookingInvoiceStyle.travelerDetailText}>Room: {traveler?.roomType || 'N/A'}</Text>
                                        <Text style={BookingInvoiceStyle.travelerDetailText}>Age: {traveler?.age ?? 'N/A'}</Text>
                                        <Text style={BookingInvoiceStyle.travelerDetailText}>Passport: {traveler?.passportNo || 'N/A'}</Text>
                                    </View>

                                    <View style={BookingInvoiceStyle.docGrid}>
                                        {traveler?.passportFile && (
                                            <View style={BookingInvoiceStyle.docCol}>
                                                <Text style={BookingInvoiceStyle.docLabel}>Passport / ID</Text>
                                                <Image source={{ uri: traveler.passportFile }} style={BookingInvoiceStyle.docImage} resizeMode="cover" />
                                            </View>
                                        )}
                                        {traveler?.photoFile && (
                                            <View style={BookingInvoiceStyle.docCol}>
                                                <Text style={BookingInvoiceStyle.docLabel}>2x2 Photo</Text>
                                                <Image source={{ uri: traveler.photoFile }} style={BookingInvoiceStyle.docImage} resizeMode="cover" />
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))
                        )}
                    </View>

                    {/* TRANSACTION HISTORY CARD */}
                    <View style={BookingInvoiceStyle.card}>
                        <Text style={BookingInvoiceStyle.cardTitle}>Transaction History</Text>
                        
                        <View style={BookingInvoiceStyle.noticeBox}>
                            <Text style={BookingInvoiceStyle.noticeText}>
                                <Text style={{ fontFamily: 'Montserrat_700Bold' }}>Note:</Text> Using a PayMongo gateway has a convenience fee of 3.5% and ₱15.
                            </Text>
                        </View>

                        {transactions.length === 0 ? (
                            <Text style={{ color: '#888', marginTop: 10 }}>No transactions yet.</Text>
                        ) : (
                            transactions.map((txn, index) => (
                                <View key={index} style={BookingInvoiceStyle.txnCard}>
                                    <View style={BookingInvoiceStyle.txnRow}>
                                        <Text style={BookingInvoiceStyle.txnLabel}>Date</Text>
                                        <Text style={BookingInvoiceStyle.txnValue}>{dayjs(txn.createdAt).format("MMM D, YYYY")}</Text>
                                    </View>
                                    <View style={BookingInvoiceStyle.txnRow}>
                                        <Text style={BookingInvoiceStyle.txnLabel}>Method</Text>
                                        <Text style={BookingInvoiceStyle.txnValue}>{txn.method || "N/A"}</Text>
                                    </View>
                                    <View style={[BookingInvoiceStyle.txnRow, { marginTop: 8 }]}>
                                        <Text style={BookingInvoiceStyle.txnLabel}>Amount</Text>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={BookingInvoiceStyle.txnValue}>{formatCurrency(txn.amount)}</Text>
                                            <Text style={[BookingInvoiceStyle.txnStatus, { 
                                                backgroundColor: (txn.status === "Successful" || txn.status === "Paid") ? '#f6ffed' : '#fffbe6',
                                                color: (txn.status === "Successful" || txn.status === "Paid") ? '#389e0d' : '#d48806',
                                                marginTop: 4
                                            }]}>
                                                {txn.status}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>

                    {/* PDF GENERATOR PLACEHOLDER */}
                    <View style={BookingInvoiceStyle.card}>
                        <Text style={BookingInvoiceStyle.cardTitle}>Booking Registration</Text>
                        <Text style={{ color: '#555', marginBottom: 16 }}>Download your complete registration forms and terms & conditions.</Text>
                        
                        <TouchableOpacity style={BookingInvoiceStyle.pdfButton} onPress={() => Alert.alert("PDF Generation", "This feature will generate a PDF of your booking forms in a future update.")}>
                            <Ionicons name="document-text-outline" size={20} color="#305797" />
                            <Text style={BookingInvoiceStyle.pdfButtonText}>Download Registration PDF</Text>
                        </TouchableOpacity>
                    </View>

                    {/* PROCEED TO CHECKOUT BUTTON (Only if Balance > 0) */}
                    {remainingBalance > 0 && booking?.status !== 'Cancelled' && (
                        <View style={BookingInvoiceStyle.checkoutSection}>
                            <Text style={BookingInvoiceStyle.checkoutTitle}>Amount to Pay</Text>
                            <Text style={BookingInvoiceStyle.checkoutAmount}>{formatCurrency(remainingBalance)}</Text>
                            
                            <TouchableOpacity 
                                style={BookingInvoiceStyle.checkoutButton} 
                                onPress={() => navigation.navigate('paymentmethod', { 
                                    setupData: bookingDetails, 
                                    amountToPay: remainingBalance,
                                    paymentType: 'Full Payment',
                                    travelerUploads: {}, // Assuming uploads are already complete
                                    passengers: travelersWithDocs,
                                    leadGuestInfo: {
                                        title: bookingDetails.leadTitle || '',
                                        contact: bookingDetails.leadContact || '',
                                        address: bookingDetails.leadAddress || ''
                                    },
                                    medicalData: bookingDetails.medicalData || {},
                                    emergency: bookingDetails.emergencyContact || {}
                                })}
                            >
                                <Text style={BookingInvoiceStyle.checkoutButtonText}>Proceed to Payment Methods</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                </ScrollView>
            )}
        </SafeAreaView>
    );
}