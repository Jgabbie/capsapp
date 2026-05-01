import React, { useCallback, useMemo, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Modal,
    Image,
    TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { Calendar } from 'react-native-calendars'; // Added Calendar for Date Filter

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";
import styles from "../../styles/clientstyles/UserPackageQuotationStyle";

export default function UserPackageQuotation() {
    const navigation = useNavigation();
    const { user } = useUser();

    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filtering States
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("Status");
    const [bookingDateFilter, setBookingDateFilter] = useState(null);
    const [bookingTimeFilter, setBookingTimeFilter] = useState(null);

    // Modal States
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);
    const [showTimeModal, setShowTimeModal] = useState(false);

    // --- API LOGIC ---
    const fetchQuotations = async () => {
        if (!user?._id) return;
        setLoading(true);
        try {
            const response = await api.get("/quotation/my-quotations", withUserHeader(user._id));
            setQuotations(response.data || []);
        } catch (error) {
            console.error("Fetch Error:", error);
            Alert.alert("Error", "Unable to load your quotation requests.");
            setQuotations([]);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchQuotations(); }, [user?._id]));

    // --- HELPER LOGIC FOR TRAVELERS ---
    const getTravelersObject = (item) => {
        // Prefer mobile payload structure
        if (item?.travelDetails && item.travelDetails.travelers) return item.travelDetails.travelers;
        // Then web payload structure
        if (item?.quotationDetails && item.quotationDetails.travelers) return item.quotationDetails.travelers;
        // Legacy or alternate shapes
        if (item?.travelers) return item.travelers;
        if (item?.travelerCounts) return item.travelerCounts;
        return null;
    };

    const calculateTotalTravelers = (item) => {
        const travelersValue = getTravelersObject(item);
        if (typeof travelersValue === 'number') return travelersValue;
        if (travelersValue && typeof travelersValue === 'object') {
            return (Number(travelersValue.adult) || 0) +
                (Number(travelersValue.child) || 0) +
                (Number(travelersValue.infant) || 0);
        }
        return 0;
    };

    const getRequestedDateForItem = (item) => {
        // Return the date the quotation was requested (creation date)
        return dayjs(item.createdAt).format("MMM DD, YYYY");
    };

    // --- FILTERING LOGIC ---
    const filteredQuotations = useMemo(() => {
        return quotations.filter((item) => {
            const text = searchText.trim().toLowerCase();
            const pName = item.packageName || item.packageId?.packageName || "";

            const matchesSearch = text === "" ||
                item.reference?.toLowerCase().includes(text) ||
                pName.toLowerCase().includes(text) ||
                item.status?.toLowerCase().includes(text);

            const matchesStatus = statusFilter === "Status" || statusFilter === "All" || item.status === statusFilter;

            const itemCreatedAt = dayjs(item.createdAt);
            const matchesDate = !bookingDateFilter || itemCreatedAt.format('YYYY-MM-DD') === bookingDateFilter;
            const matchesTime = !bookingTimeFilter || itemCreatedAt.format('HH:mm') === bookingTimeFilter;

            return matchesSearch && matchesStatus && matchesDate && matchesTime;
        });
    }, [quotations, searchText, statusFilter, bookingDateFilter, bookingTimeFilter]);

    // --- EXACT WEB STATUS COLORS (ANT DESIGN) ---
    const getStatusStyle = (status) => {
        const s = String(status || '').trim().toLowerCase();
        switch (s) {
            case 'approved':
            case 'successful':
            case 'booked':
                return { bg: '#f6ffed', text: '#389e0d', border: '#b7eb8f' }; // Green
            case 'pending':
                return { bg: '#fffbe6', text: '#d48806', border: '#ffe58f' }; // Gold/Yellow
            case 'rejected':
                return { bg: '#fff1f0', text: '#cf1322', border: '#ffa39e' }; // Red
            case 'under review':
                return { bg: '#e6f7ff', text: '#0958d9', border: '#91caff' }; // Blue
            case 'revision requested':
                return { bg: '#f9f0ff', text: '#531dab', border: '#d3adf7' }; // Purple
            case 'cancelled':
            default:
                return { bg: '#f5f5f5', text: '#555555', border: '#d9d9d9' }; // Grey
        }
    };

    const statusOptions = ["All", "Successful", "Pending", "Cancelled", "Approved", "Rejected", "Under Review", "Revision Requested"];

    const timeSlots = [
        "08:00",
        "08:30",
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "01:00",
        "01:30",
        "02:00",
        "02:30",
        "03:00",
        "03:30",
        "04:00",
        "04:30",
    ];

    const handleDateChange = (day) => {
        setBookingDateFilter(day.dateString);
        setShowDateModal(false);
    };

    const handleTimeSelect = (slot) => {
        setBookingTimeFilter(slot);
        setShowTimeModal(false);
    };

    const clearFilters = () => {
        setStatusFilter("Status");
        setBookingDateFilter(null);
        setBookingTimeFilter(null);
    };

    const hasActiveFilters = (statusFilter !== "Status" && statusFilter !== "All") || bookingDateFilter || bookingTimeFilter;

    return (
        <View style={styles.container}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>My Quotation Requests</Text>
                <Text style={styles.subtitle}>Review your customized package quotation requests.</Text>

                {/* --- WEB SYNCED FILTER ROW --- */}
                <View style={styles.filterSection}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={16} color="#777" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search reference, package or status..."
                            placeholderTextColor="#999"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        {searchText !== "" && (
                            <TouchableOpacity onPress={() => setSearchText("")}>
                                <Ionicons name="close-circle" size={16} color="#ccc" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.dropdownGroup}>
                        <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowStatusModal(true)}>
                            <Text style={styles.dropdownText}>{statusFilter === 'All' ? 'Status' : statusFilter}</Text>
                            <Ionicons name="chevron-down" size={12} color="#bfbfbf" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowDateModal(true)}>
                            <Text style={styles.dropdownText}>
                                {bookingDateFilter ? dayjs(bookingDateFilter).format('MMM DD') : 'Booking Date'}
                            </Text>
                            <Ionicons name="calendar-outline" size={14} color="#bfbfbf" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowTimeModal(true)}>
                            <Text style={styles.dropdownText}>
                                {bookingTimeFilter ? dayjs(bookingTimeFilter, 'HH:mm').format('hh:mm A') : 'Booking Time'}
                            </Text>
                            <Ionicons name="time-outline" size={14} color="#bfbfbf" />
                        </TouchableOpacity>

                        {hasActiveFilters && (
                            <TouchableOpacity
                                style={styles.clearFilterBtn}
                                onPress={clearFilters}
                            >
                                <Ionicons name="refresh-circle" size={32} color="#ff4d4f" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#305797" style={{ marginTop: 40 }} />
                ) : (
                    filteredQuotations.map((item) => {
                        const sStyle = getStatusStyle(item.status);
                        // Get package name - prefer stored packageName (works for both web and mobile), fallback to populated packageId
                        const pName = item.packageName || item.packageId?.packageName || "Tour Package";
                        // Get package type - try packageId first, then quotationDetails/travelDetails
                        const pType = item.packageId?.packageType || item.quotationDetails?.packageType || item.travelDetails?.packageType || "DOMESTIC";

                        return (
                            <View key={item._id} style={styles.quoteCard}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.quoteRef}>{item.reference}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: sStyle.bg, borderColor: sStyle.border }]}>
                                        <Text style={[styles.statusText, { color: sStyle.text }]}>
                                            {item.status || 'Pending'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.cardBody}>
                                    <Text style={styles.packageName} numberOfLines={1}>{pName}</Text>

                                    {/* ADDED PACKAGE TYPE */}
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Package Type:</Text>
                                        <Text style={styles.detailValue}>{pType.toUpperCase()}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Travelers:</Text>
                                        <Text style={styles.detailValue}>{calculateTotalTravelers(item)}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Requested Date:</Text>
                                        <Text style={styles.detailValue}>{getRequestedDateForItem(item)}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.viewButton}
                                    onPress={() => navigation.navigate("userquotationrequest", { id: item._id })}
                                >
                                    <Ionicons name="eye-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                                    <Text style={styles.buttonText}>View Details</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })
                )}

                {!loading && filteredQuotations.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Image
                            source={require("../../assets/images/empty_logo.png")}
                            style={styles.emptyImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.emptyText}>No Data yet</Text>
                    </View>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* --- STATUS FILTER MODAL (Centered like web UI) --- */}
            <Modal
                visible={showStatusModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowStatusModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowStatusModal(false)}
                >
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeaderRow}>
                                <Text style={styles.modalTitleText}>Select Status</Text>
                                <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                                    <Ionicons name="close" size={22} color="#999" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.tagContainer}>
                                {statusOptions.map((status) => {
                                    const isSelected = status === statusFilter;
                                    return (
                                        <TouchableOpacity
                                            key={status}
                                            onPress={() => { setStatusFilter(status); setShowStatusModal(false); }}
                                            style={[styles.modalStatusTag, isSelected && styles.modalStatusTagSelected]}
                                        >
                                            <Text style={[styles.modalStatusText, isSelected && styles.modalStatusTextSelected]}>{status}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            {/* --- DATE PICKER MODAL --- */}
            <Modal visible={showDateModal} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDateModal(false)}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeaderRow}>
                                <Text style={styles.modalTitleText}>Booking Date</Text>
                                <TouchableOpacity onPress={() => setShowDateModal(false)}>
                                    <Ionicons name="close" size={22} color="#999" />
                                </TouchableOpacity>
                            </View>
                            <Calendar
                                onDayPress={handleDateChange}
                                theme={{ selectedDayBackgroundColor: '#305797', todayTextColor: '#305797', arrowColor: '#305797' }}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            <Modal visible={showTimeModal} transparent animationType="fade" onRequestClose={() => setShowTimeModal(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTimeModal(false)}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeaderRow}>
                                <Text style={styles.modalTitleText}>Booking Time</Text>
                                <TouchableOpacity onPress={() => setShowTimeModal(false)}>
                                    <Ionicons name="close" size={22} color="#999" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.timeGrid}>
                                {timeSlots.map((slot) => {
                                    const isSelected = bookingTimeFilter === slot;
                                    return (
                                        <TouchableOpacity
                                            key={slot}
                                            style={[styles.timeSlotButton, isSelected && styles.timeSlotButtonSelected]}
                                            onPress={() => handleTimeSelect(slot)}
                                        >
                                            <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextSelected]}>
                                                {dayjs(slot, 'HH:mm').format('hh:mm A')}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

        </View>
    );
}