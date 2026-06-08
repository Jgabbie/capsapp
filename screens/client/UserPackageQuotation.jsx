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
import UserPackageQuotationStyle from "../../styles/clientstyles/UserPackageQuotationStyle";

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

    // Modal States
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);

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

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [quotations, searchText, statusFilter, bookingDateFilter]);

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



    const handleDateChange = (day) => {
        setBookingDateFilter(day.dateString);
        setShowDateModal(false);
    };



    const clearFilters = () => {
        setStatusFilter("Status");
        setBookingDateFilter(null);
    };

    const hasActiveFilters = (statusFilter !== "Status" && statusFilter !== "All") || bookingDateFilter;

    return (
        <View style={UserPackageQuotationStyle.container}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                <Text style={UserPackageQuotationStyle.title}>My Quotation Requests</Text>
                <Text style={UserPackageQuotationStyle.subtitle}>Review your customized package quotation requests.</Text>

                {/* --- FILTER ROW --- */}
                <View style={UserPackageQuotationStyle.filterSection}>

                    <View style={{ flex: 1 }}>
                        <Text style={UserPackageQuotationStyle.filterLabel}>Status</Text>
                        <View style={UserPackageQuotationStyle.searchBar}>
                            <Ionicons name="search" size={16} color="#777" />
                            <TextInput
                                style={UserPackageQuotationStyle.searchInput}
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
                    </View>


                    <View style={UserPackageQuotationStyle.filterRow}>

                        {/* Status Filter */}
                        <View style={{ flex: 1 }}>
                            <Text style={UserPackageQuotationStyle.filterLabel}>Status</Text>
                            <View style={UserPackageQuotationStyle.dropdownGroup}>
                                <TouchableOpacity style={UserPackageQuotationStyle.dropdownButton} onPress={() => setShowStatusModal(true)}>
                                    <Text style={[UserPackageQuotationStyle.dropdownText, statusFilter !== "Status" && UserPackageQuotationStyle.dropdownTextSelected]} numberOfLines={1}>
                                        {statusFilter}
                                    </Text>
                                    <Ionicons name="chevron-down" size={14} color={statusFilter !== "Status" ? "#305797" : "#999"} style={UserPackageQuotationStyle.dropdownIcon} />
                                </TouchableOpacity>
                                {statusFilter !== "Status" && (
                                    <TouchableOpacity onPress={() => setStatusFilter("Status")} style={{ marginLeft: 6 }}>
                                        <Ionicons name="close-circle" size={18} color="#999" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>


                        {/* Requested Date Filter */}
                        <View style={{ flex: 1 }}>
                            <Text style={UserPackageQuotationStyle.filterLabel}>Date</Text>
                            <View style={UserPackageQuotationStyle.dropdownGroup}>
                                <TouchableOpacity style={UserPackageQuotationStyle.dropdownButton} onPress={() => setShowDateModal(true)}>
                                    <Text style={[UserPackageQuotationStyle.dropdownText, bookingDateFilter && UserPackageQuotationStyle.dropdownTextSelected]} numberOfLines={1}>
                                        {bookingDateFilter ? dayjs(bookingDateFilter).format('MMM DD, YYYY') : "Requested Date"}
                                    </Text>
                                    <Ionicons name="calendar-outline" size={14} color={bookingDateFilter ? "#305797" : "#999"} style={UserPackageQuotationStyle.dropdownIcon} />
                                </TouchableOpacity>
                                {bookingDateFilter && (
                                    <TouchableOpacity onPress={() => setBookingDateFilter(null)} style={{ marginLeft: 6 }}>
                                        <Ionicons name="close-circle" size={18} color="#999" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>


                        {hasActiveFilters && (
                            <TouchableOpacity
                                style={[UserPackageQuotationStyle.clearFilterBtn, { marginLeft: 8 }]}
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
                            <View key={item._id} style={UserPackageQuotationStyle.quoteCard}>
                                <View style={UserPackageQuotationStyle.cardHeader}>
                                    <Text style={UserPackageQuotationStyle.quoteRef}>{item.reference}</Text>
                                    <View style={[UserPackageQuotationStyle.statusBadge, { backgroundColor: sStyle.bg, borderColor: sStyle.border }]}>
                                        <Text style={[UserPackageQuotationStyle.statusText, { color: sStyle.text }]}>
                                            {item.status || 'Pending'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={UserPackageQuotationStyle.cardBody}>
                                    <Text style={UserPackageQuotationStyle.packageName} numberOfLines={1}>{pName}</Text>

                                    {/* ADDED PACKAGE TYPE */}
                                    <View style={UserPackageQuotationStyle.detailRow}>
                                        <Text style={UserPackageQuotationStyle.detailLabel}>Package Type:</Text>
                                        <Text style={UserPackageQuotationStyle.detailValue}>{pType.toUpperCase()}</Text>
                                    </View>

                                    <View style={UserPackageQuotationStyle.detailRow}>
                                        <Text style={UserPackageQuotationStyle.detailLabel}>Travelers:</Text>
                                        <Text style={UserPackageQuotationStyle.detailValue}>{calculateTotalTravelers(item)}</Text>
                                    </View>

                                    <View style={UserPackageQuotationStyle.detailRow}>
                                        <Text style={UserPackageQuotationStyle.detailLabel}>Requested Date:</Text>
                                        <Text style={UserPackageQuotationStyle.detailValue}>{getRequestedDateForItem(item)}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={UserPackageQuotationStyle.viewButton}
                                    onPress={() => navigation.navigate("userquotationrequest", { id: item._id })}
                                >
                                    <Ionicons name="eye-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                                    <Text style={UserPackageQuotationStyle.buttonText}>View Details</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })
                )}

                {!loading && filteredQuotations.length === 0 && (
                    <View style={UserPackageQuotationStyle.emptyContainer}>
                        <Image
                            source={require("../../assets/images/empty_logo.png")}
                            style={UserPackageQuotationStyle.emptyImage}
                            resizeMode="contain"
                        />
                        <Text style={UserPackageQuotationStyle.emptyText}>No Data yet</Text>
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
                    style={UserPackageQuotationStyle.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowStatusModal(false)}
                >
                    <TouchableWithoutFeedback>
                        <View style={UserPackageQuotationStyle.modalContainer}>
                            <View style={UserPackageQuotationStyle.modalHeaderRow}>
                                <Text style={UserPackageQuotationStyle.modalTitleText}>Select Status</Text>
                                <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                                    <Ionicons name="close" size={22} color="#999" />
                                </TouchableOpacity>
                            </View>

                            <View style={UserPackageQuotationStyle.tagContainer}>
                                {statusOptions.map((status) => {
                                    const isSelected = status === statusFilter;
                                    return (
                                        <TouchableOpacity
                                            key={status}
                                            onPress={() => { setStatusFilter(status); setShowStatusModal(false); }}
                                            style={[UserPackageQuotationStyle.modalStatusTag, isSelected && UserPackageQuotationStyle.modalStatusTagSelected]}
                                        >
                                            <Text style={[UserPackageQuotationStyle.modalStatusText, isSelected && UserPackageQuotationStyle.modalStatusTextSelected]}>{status}</Text>
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
                <TouchableOpacity style={UserPackageQuotationStyle.modalOverlay} activeOpacity={1} onPress={() => setShowDateModal(false)}>
                    <TouchableWithoutFeedback>
                        <View style={UserPackageQuotationStyle.modalContainer}>
                            <View style={UserPackageQuotationStyle.modalHeaderRow}>
                                <Text style={UserPackageQuotationStyle.modalTitleText}>Booking Date</Text>
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



        </View>
    );
}