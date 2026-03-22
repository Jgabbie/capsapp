import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";
import styles from "../../styles/clientstyles/UserPackageQuotationStyle"; // Make sure to link your style file

export default function UserPackageQuotation() {
  const navigation = useNavigation();
  const { user } = useUser();
  
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filtering States
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);

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

  // --- FILTERING LOGIC ---
  const filteredQuotations = useMemo(() => {
    return quotations.filter((item) => {
      // 1. Text Search Match
      const text = searchText.trim().toLowerCase();
      const matchesSearch = text === "" || 
        item.reference?.toLowerCase().includes(text) ||
        item.packageName?.toLowerCase().includes(text) ||
        item.status?.toLowerCase().includes(text);

      // 2. Status Match
      const matchesStatus = statusFilter === "" || item.status === statusFilter;

      // Note: For a true mobile Date Picker, you'd integrate @react-native-community/datetimepicker
      // For now, search handles simple date strings nicely.

      return matchesSearch && matchesStatus;
    });
  }, [quotations, searchText, statusFilter]);

  // --- UI HELPERS ---
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#1f8f3a';
      case 'Under Review': return '#305797';
      case 'Revision Requested': return '#faad14';
      case 'Rejected': return '#ff4d4f';
      default: return '#666';
    }
  };

  const statusOptions = ["Pending", "Under Review", "Revision Requested", "Approved", "Rejected", "Successful", "Cancelled"];

  return (
    <View style={styles.container}>
      <Header openSidebar={() => setSidebarVisible(true)} />
      <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>My Quotation Requests</Text>
        <Text style={styles.subtitle}>Review your customized package quotation requests.</Text>

        {/* Tactical Search & Filter Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#777" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search reference or package..."
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

          {/* Mobile Filter Button (Replaces Web Dropdowns) */}
          <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowFilterModal(true)}>
            <Ionicons name="filter-outline" size={16} color="#305797" />
            {statusFilter !== "" && <View style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff4d4f'}} />}
          </TouchableOpacity>
        </View>

        {/* List Rendering */}
        {loading ? (
          <ActivityIndicator size="large" color="#305797" style={{ marginTop: 40 }} />
        ) : (
          filteredQuotations.map((item) => (
            <View key={item._id} style={styles.quoteCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.quoteRef}>{item.reference}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                   <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                     {item.status}
                   </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.packageName}>{item.packageName}</Text>
                
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Travelers:</Text>
                    <Text style={styles.detailValue}>{item.travelDetails?.travelers ?? 0}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Requested Date:</Text>
                    <Text style={styles.detailValue}>{dayjs(item.createdAt).format("MMM DD, YYYY")}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.viewButton}
                // Ensure this navigates to your new Request file!
                onPress={() => navigation.navigate("userquotationrequest", { id: item._id })} 
              >
                <Text style={styles.buttonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {!loading && filteredQuotations.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No matching quotations found.</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* --- Filter Modal --- */}
      <Modal visible={showFilterModal} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)'}}>
              <View style={{ backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                  <Text style={{ fontSize: 18, fontFamily: 'Montserrat_700Bold', color: '#305797', marginBottom: 15 }}>Filter by Status</Text>
                  
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                      {statusOptions.map((status) => (
                          <TouchableOpacity 
                            key={status}
                            onPress={() => setStatusFilter(status === statusFilter ? "" : status)}
                            style={{ 
                                paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, 
                                borderColor: status === statusFilter ? '#305797' : '#eee',
                                backgroundColor: status === statusFilter ? '#305797' : '#fff'
                            }}
                          >
                              <Text style={{ color: status === statusFilter ? '#fff' : '#666', fontFamily: 'Roboto_500Medium', fontSize: 13 }}>{status}</Text>
                          </TouchableOpacity>
                      ))}
                  </View>

                  <TouchableOpacity 
                    style={{ marginTop: 25, backgroundColor: '#305797', padding: 15, borderRadius: 10, alignItems: 'center' }}
                    onPress={() => setShowFilterModal(false)}
                  >
                      <Text style={{ color: '#fff', fontFamily: 'Montserrat_700Bold' }}>Apply Filters</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

    </View>
  );
}