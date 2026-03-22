<<<<<<< HEAD
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native'
import Header from '../../components/Header'
import AdminSidebar from '../../components/AdminSidebar'
import QuotationManagementStyle from '../../styles/adminstyles/QuotationManagementStyle'

export default function QuotationManagement() {

    const cs = useNavigation()
    const [isSidebarVisible, setSidebarVisible] = useState(false)

    const [getQuotes] = useState([
        {
            id: "1",
            quoteNo: "QT-0001",
            username: "Juan Dela Cruz",
            package: "Boracay Tour",
            travelers: 4,
            date: "09-20-2026",
            status: "Pending"
        }
    ])

    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <AdminSidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView
                contentContainerStyle={QuotationManagementStyle.container}
                showsVerticalScrollIndicator={false}
            >
                <Text style={QuotationManagementStyle.title}>Quotation Management</Text>

                <View style={QuotationManagementStyle.statsContainer}>
                    <View style={QuotationManagementStyle.statsRow}>
                        <View style={QuotationManagementStyle.card}>
                            <View style={QuotationManagementStyle.valueRow}>
                                <Text style={QuotationManagementStyle.cardValue}>18</Text>
                            </View>
                            <Text style={QuotationManagementStyle.cardLabel}>Total Quotations</Text>
                        </View>
                        <View style={QuotationManagementStyle.card}>
                            <View style={QuotationManagementStyle.valueRow}>
                                <Text style={QuotationManagementStyle.cardValue}>6</Text>
                            </View>
                            <Text style={QuotationManagementStyle.cardLabel}>Pending Requests</Text>
                        </View>
                    </View>
                </View>

                <View style={QuotationManagementStyle.searchRow}>
                    <View style={QuotationManagementStyle.searchBar}>
                        <Ionicons name="search" size={16} />
                        <TextInput
                            style={QuotationManagementStyle.searchInput}
                            placeholder='Search quotation'
                            placeholderTextColor="#777"
                        />
                    </View>

                    <View style={QuotationManagementStyle.dropdownGroup}>
                        <View style={QuotationManagementStyle.dropdownButton}>
                            <Text style={QuotationManagementStyle.dropdownText}>Status</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" />
                        </View>
                        <View style={QuotationManagementStyle.dropdownButton}>
                            <Text style={QuotationManagementStyle.dropdownText}>Date</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" />
                        </View>
                    </View>
                </View>

                {getQuotes.map((item) => (
                    <View key={item.id} style={QuotationManagementStyle.quoteCard}>
                        <View style={QuotationManagementStyle.cardHeader}>
                            <Text style={QuotationManagementStyle.quoteRef}>{item.quoteNo}</Text>
                            <Text
                                style={[
                                    QuotationManagementStyle.quoteStatus,
                                    item.status === "Approved"
                                        ? { color: "#2ecc71" }
                                        : item.status === "Rejected"
                                            ? { color: "#e74c3c" }
                                            : { color: "#f1c40f" }
                                ]}
                            >
                                {item.status}
                            </Text>
                        </View>

                        <View style={QuotationManagementStyle.cardBody}>
                            <Text style={QuotationManagementStyle.packageName}>{item.package}</Text>

                            <View style={QuotationManagementStyle.detailRow}>
                                <Text style={QuotationManagementStyle.detailLabel}>User:</Text>
                                <Text style={QuotationManagementStyle.detailValue}>{item.username}</Text>
                            </View>

                            <View style={QuotationManagementStyle.detailRow}>
                                <Text style={QuotationManagementStyle.detailLabel}>Travelers:</Text>
                                <Text style={QuotationManagementStyle.detailValue}>{item.travelers}</Text>
                            </View>

                            <View style={QuotationManagementStyle.detailRow}>
                                <Text style={QuotationManagementStyle.detailLabel}>Travel Date:</Text>
                                <Text style={QuotationManagementStyle.detailValue}>{item.date}</Text>
                            </View>
                        </View>

                        <View style={QuotationManagementStyle.actionRow}>
                            <TouchableOpacity
                                style={QuotationManagementStyle.viewButton}
                                onPress={() => cs.navigate("quotationdetails")}
                            >
                                <Text style={QuotationManagementStyle.buttonText}>View</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={QuotationManagementStyle.approveButton}
                                onPress={() => { }}
                            >
                                <Text style={QuotationManagementStyle.buttonText}>Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={QuotationManagementStyle.rejectButton}
                                onPress={() => { }}
                            >
                                <Text style={QuotationManagementStyle.buttonText}>Reject</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    )
}
=======
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import AdminSidebar from "../../components/AdminSidebar";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";

export default function QuotationManagement() {
  const navigation = useNavigation();
  const { user } = useUser();
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [quotations, setQuotations] = useState([]);
  const [searchText, setSearchText] = useState("");

  const fetchQuotations = async () => {
    try {
      const response = await api.get("/quotation/all-quotations");
      setQuotations(response.data || []);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Unable to load quotations");
      setQuotations([]);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const filteredQuotations = useMemo(() => {
    if (!searchText.trim()) return quotations;
    const text = searchText.trim().toLowerCase();

    return quotations.filter((item) => {
      const reference = item.reference?.toLowerCase() || "";
      const packageName = item.packageName?.toLowerCase() || "";
      const userName = item.userName?.toLowerCase() || "";
      const status = item.status?.toLowerCase() || "";
      return (
        reference.includes(text) ||
        packageName.includes(text) ||
        userName.includes(text) ||
        status.includes(text)
      );
    });
  }, [quotations, searchText]);

  const handleStatusUpdate = async (quotationId, status) => {
    try {
      await api.put(`/quotation/admin/${quotationId}/status`, { status }, withUserHeader(user._id));
      fetchQuotations();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Unable to update quotation status");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header openSidebar={() => setSidebarVisible(true)} />
      <AdminSidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Quotation Management</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#777" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reference, package, user, status"
            placeholderTextColor="#777"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {filteredQuotations.map((item) => (
          <View key={item._id} style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.reference}>{item.reference}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
            <Text style={styles.label}>User: {item.userName}</Text>
            <Text style={styles.label}>Package: {item.packageName}</Text>
            <Text style={styles.label}>Travelers: {item.travelDetails?.travelers ?? 0}</Text>
            <Text style={styles.label}>Arrangement: {item.travelDetails?.arrangementType || "--"}</Text>
            <Text style={styles.label}>Airlines: {item.travelDetails?.preferredAirlines || "--"}</Text>
            <Text style={styles.label}>Hotels: {item.travelDetails?.preferredHotels || "--"}</Text>
            <Text style={styles.label}>PDF Revisions: {item.pdfRevisions?.length || 0}</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.reject]}
                onPress={() => handleStatusUpdate(item._id, "Rejected")}
              >
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.review]}
              onPress={() => navigation.navigate("quotationdetailsadmin", { quotationId: item._id })}
            >
              <Text style={styles.buttonText}>View Full Details</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#305797",
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f8fc",
    borderRadius: 22,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reference: {
    color: "#305797",
    fontWeight: "700",
  },
  status: {
    color: "#2d5fb8",
    fontWeight: "600",
  },
  label: {
    color: "#555",
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  reject: {
    backgroundColor: "#c62828",
  },
  review: {
    backgroundColor: "#305797",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
});
>>>>>>> e1318fbd4944764da2d7d378fae1f2520eafe5cb
