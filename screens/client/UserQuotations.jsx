<<<<<<< HEAD
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import UserQuotationStyle from '../../styles/clientstyles/UserQuotationStyle'

export default function UserQuotations() {

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

    const [getQuotes] = useState([
        {
            id: "1",
            quoteNo: "QT-0001",
            package: "Boracay Tour",
            travelers: 4,
            date: "09-20-2026",
            status: "Pending"
        }
    ])

    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => setSidebarVisible(true)} />

            <ScrollView
                contentContainerStyle={UserQuotationStyle.container}
                showsVerticalScrollIndicator={false}
            >
                <Text style={UserQuotationStyle.title}>My Quotations</Text>

                <View style={UserQuotationStyle.searchRow}>
                    <View style={UserQuotationStyle.searchBar}>
                        <Ionicons name="search" size={16} />
                        <TextInput
                            style={UserQuotationStyle.searchInput}
                            placeholder='Search quotation'
                            placeholderTextColor="#777"
                        />
                    </View>

                    <View style={UserQuotationStyle.dropdownGroup}>
                        <View style={UserQuotationStyle.dropdownButton}>
                            <Text style={UserQuotationStyle.dropdownText}>Status</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" />
                        </View>
                        <View style={UserQuotationStyle.dropdownButton}>
                            <Text style={UserQuotationStyle.dropdownText}>Date</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" />
                        </View>
                    </View>
                </View>

                {getQuotes.map((item) => (
                    <View key={item.id} style={UserQuotationStyle.quoteCard}>
                        <View style={UserQuotationStyle.cardHeader}>
                            <Text style={UserQuotationStyle.quoteRef}>{item.quoteNo}</Text>
                            <Text
                                style={[
                                    UserQuotationStyle.quoteStatus,
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

                        <View style={UserQuotationStyle.cardBody}>
                            <Text style={UserQuotationStyle.packageName}>{item.package}</Text>

                            <View style={UserQuotationStyle.detailRow}>
                                <Text style={UserQuotationStyle.detailLabel}>Travelers:</Text>
                                <Text style={UserQuotationStyle.detailValue}>{item.travelers}</Text>
                            </View>

                            <View style={UserQuotationStyle.detailRow}>
                                <Text style={UserQuotationStyle.detailLabel}>Travel Date:</Text>
                                <Text style={UserQuotationStyle.detailValue}>{item.date}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={UserQuotationStyle.viewButton}
                            onPress={() => cs.navigate("quotationdetails")}
                        >
                            <Text style={UserQuotationStyle.buttonText}>View Details</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>

    )
}
=======
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";

export default function UserQuotations({ navigation }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { user } = useUser();

  const fetchQuotations = async () => {
    if (!user?._id) return;

    setLoading(true);
    try {
      const response = await api.get("/quotation/my-quotations", withUserHeader(user._id));
      setQuotations(response.data || []);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Unable to load quotations");
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [user?._id]);

  useFocusEffect(
    useCallback(() => {
      fetchQuotations();
    }, [user?._id])
  );

  const filteredQuotations = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    if (!text) return quotations;

    return quotations.filter((item) => {
      const reference = item.reference?.toLowerCase() || "";
      const packageName = item.packageName?.toLowerCase() || "";
      const status = item.status?.toLowerCase() || "";
      return reference.includes(text) || packageName.includes(text) || status.includes(text);
    });
  }, [quotations, searchText]);

  return (
    <View style={{ flex: 1 }}>
      <Header openSidebar={() => setSidebarVisible(true)} />
      <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>My Quotation Requests</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#777" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reference, package, status"
            placeholderTextColor="#777"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#305797" style={{ marginTop: 24 }} />
        ) : (
          filteredQuotations.map((item) => (
            <View key={item._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.reference}>{item.reference}</Text>
                <Text style={styles.status}>{item.status}</Text>
              </View>

              <Text style={styles.packageName}>{item.packageName}</Text>
              <Text style={styles.meta}>Travelers: {item.travelDetails?.travelers ?? 0}</Text>
              <Text style={styles.meta}>
                Requested: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "--"}
              </Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("userquotationrequest", { quotationId: item._id })}
              >
                <Text style={styles.buttonText}>View Quotation</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {!loading && filteredQuotations.length === 0 ? (
          <Text style={styles.emptyText}>No quotation requests found.</Text>
        ) : null}
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
    fontWeight: "bold",
    color: "#305797",
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f8fc",
    borderRadius: 22,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reference: {
    color: "#305797",
    fontWeight: "700",
    fontSize: 16,
  },
  status: {
    color: "#2d5fb8",
    fontWeight: "600",
  },
  packageName: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  meta: {
    color: "#666",
    marginBottom: 4,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#305797",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
  },
});
>>>>>>> e1318fbd4944764da2d7d378fae1f2520eafe5cb
