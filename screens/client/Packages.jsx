import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";
import DestinationStyles from "../../styles/clientstyles/DestinationStyles";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Chatbot from "../../components/Chatbot";

const normalizeBaseUrl = (url) => String(url || "").trim().replace(/\/$/, "");

const getTravelSystemApiBase = () => {
    const envUrl = normalizeBaseUrl(process.env.EXPO_PUBLIC_TRAVELSYSTEM_API_URL);
    if (envUrl) return envUrl;

    if (Platform.OS === "web") return "http://localhost:8000";

    const hostUri =
        Constants.expoConfig?.hostUri ||
        Constants.linkingUri ||
        Constants.manifest2?.extra?.expoGo?.debuggerHost ||
        "";

    const host = hostUri
        .replace(/^https?:\/\//, "")
        .replace(/^exp:\/\//, "")
        .split(":")[0]
        .split("/")[0];

    if (host) return `http://${host}:8000`;

    return Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://localhost:8000";
};

const packageApiBase = getTravelSystemApiBase();

const formatPeso = (value) => {
    const amount = Number(value) || 0;
    return `₱${amount.toLocaleString("en-PH")}`;
};

const toImageUrl = (source) => {
    if (!source) return "https://via.placeholder.com/800x500?text=No+Image";
    const value = String(source);
    if (value.startsWith("http") || value.startsWith("data:")) return value;
    const clean = value.replace(/^\/+/, "");
    return `${packageApiBase}/${clean}`;
};

export default function Packages({ navigation }) {

    const [isSidebarVisible, setSidebarVisible] = useState(false)
    const [searchText, setSearchText] = useState("");
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await axios.get(`${packageApiBase}/api/package/get-packages`);

                const mapped = (response.data || []).map((item) => ({
                    id: item._id,
                    title: item.packageName || "Untitled Package",
                    description: item.packageDescription || "No description available.",
                    image: toImageUrl(item.images?.[0]),
                    price: formatPeso(item.packagePricePerPax),
                    duration: `${item.packageDuration || 0} Days`,
                    isInternational: (item.packageType || "").toLowerCase().includes("international"),
                    packageType: item.packageType,
                    packageCode: item.packageCode,
                    packagePricePerPax: item.packagePricePerPax,
                    packageDuration: item.packageDuration,
                    packageAvailableSlots: item.packageAvailableSlots,
                    packageSpecificDate: item.packageSpecificDate || [],
                    packageHotels: item.packageHotels || [],
                    packageAirlines: item.packageAirlines || [],
                    packageInclusions: item.packageInclusions || [],
                    packageExclusions: item.packageExclusions || [],
                    packageTermsConditions: item.packageTermsConditions || [],
                    packageItineraries: item.packageItineraries || [],
                    packageTags: item.packageTags || [],
                    images: item.images || [],
                }));

                setPackages(mapped);
            } catch (fetchError) {
                setError("Unable to load packages right now.");
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, []);

    const filteredPackages = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        if (!q) return packages;
        return packages.filter((item) =>
            [item.title, item.description, item.packageType]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(q))
        );
    }, [packages, searchText]);

    return (
        <View style={{ flex: 1 }}>
            <Header openSidebar={() => { setSidebarVisible(true) }} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView
                style={DestinationStyles.container}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <Text style={DestinationStyles.heroTitle}>Featured packages</Text>
                <Text style={DestinationStyles.heroSubtitle}>
                    Everyone loves to tour with friends, family, or teammates. We can
                    organize your tour to anywhere in the world.
                </Text>

                <View style={DestinationStyles.searchRow}>
                    <View style={DestinationStyles.searchBar}>
                        <Ionicons name="search" size={16} color="#777" />
                        <TextInput
                            style={DestinationStyles.searchInput}
                            placeholder="Search packages"
                            placeholderTextColor="#777"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>
                    <View style={DestinationStyles.dropdownGroup}>
                        <View style={DestinationStyles.dropdownButton}>
                            <Text style={DestinationStyles.dropdownText}>Activities</Text>
                            <Ionicons name="chevron-down" size={14} color="#305797" style={DestinationStyles.dropdownIcon} />
                        </View>
                        <View style={DestinationStyles.dropdownButton}>
                            <Text style={DestinationStyles.dropdownText}>Duration</Text>
                            <Ionicons name="chevron-down" size={14} color="#305797" style={DestinationStyles.dropdownIcon} />
                        </View>
                    </View>
                </View>

                {loading && (
                    <Text style={{ color: "#305797", marginBottom: 12 }}>Loading packages...</Text>
                )}

                {!!error && (
                    <Text style={{ color: "#d9534f", marginBottom: 12 }}>{error}</Text>
                )}

                {!loading && !error && filteredPackages.length === 0 && (
                    <Text style={{ color: "#777", marginBottom: 12 }}>No packages found.</Text>
                )}

                {filteredPackages.map((item) => (
                    <View key={item.id} style={DestinationStyles.packageCard}>
                        <Image source={{ uri: item.image }} style={DestinationStyles.packageImage} />
                        <View style={DestinationStyles.packageContent}>
                            <Text style={DestinationStyles.packageTitle}>{item.title}</Text>
                            <Text style={DestinationStyles.packageDescription}>{item.description}</Text>
                            <TouchableOpacity
                                style={DestinationStyles.viewDetailsButton}
                                onPress={() => navigation.navigate("packagedetails", { pkg: item })}
                            >
                                <Text style={DestinationStyles.viewDetailsText}>View Details</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={DestinationStyles.packageMetaRow}>
                            <View style={DestinationStyles.metaItem}>
                                <Ionicons name="location" size={14} color="#2d5fb8" />
                                <Text style={DestinationStyles.metaText}>Destination</Text>
                            </View>
                            <View style={DestinationStyles.metaItem}>
                                <Ionicons name="time" size={14} color="#2d5fb8" />
                                <Text style={DestinationStyles.metaText}>{item.duration}</Text>
                            </View>
                        </View>
                    </View>
                ))}

            </ScrollView>
            <Chatbot />
        </View >

    );
}