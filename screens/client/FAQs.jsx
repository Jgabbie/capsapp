import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Platform, KeyboardAvoidingView, ImageBackground, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../utils/api'

import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import FAQsStyle from '../../styles/clientstyles/FAQsStyle';

import {
    useFonts,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold
} from '@expo-google-fonts/montserrat';


export default function FAQs() {
    const [fontsLoaded] = useFonts({
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_400Regular,
        Montserrat_500Medium
    });

    const cs = useNavigation();
    const [isSidebarVisible, setSidebarVisible] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [faqData, setFaqData] = useState([]);
    const [loading, setLoading] = useState(true);


    //generate unique categories from the FAQ data and include an "All" option
    const categories = useMemo(() => {
        const unique = new Set(faqData.map((item) => item.category));
        return ['All', ...Array.from(unique)];
    }, [faqData]);


    //filter the FAQ data based on the search term and active category, using useMemo for performance optimization
    const filteredFaqs = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return faqData.filter((item) => {
            const matchesTerm = !term || item.question.toLowerCase().includes(term) || item.answer.toLowerCase().includes(term);
            const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
            return matchesTerm && matchesCategory;
        });
    }, [faqData, activeCategory, searchTerm]);


    //toggle the expanded state of an accordion item based on its index
    const toggleAccordion = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    if (!fontsLoaded || loading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <ActivityIndicator size="large" color="#305797" />
            </View>
        );
    }

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            setLoading(true);

            const response = await api.get(
                `${process.env.EXPO_PUBLIC_API_URL}/faqs/get-faqs`
            );

            setFaqData(response.data);
        } catch (error) {
            console.error("Failed to fetch FAQs:", error);
        } finally {
            setLoading(false);
        }
    };



    return (
        <View style={FAQsStyle.container}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={FAQsStyle.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                    {/* Hero Section with Background Image */}
                    <ImageBackground
                        source={require('../../assets/images/FAQs_BackgroundImage.jpg')}
                        style={FAQsStyle.heroSection}
                        imageStyle={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                    >
                        <View style={FAQsStyle.heroOverlay} />
                        <Text style={FAQsStyle.heroTitle}>General FAQs</Text>
                        <Text style={FAQsStyle.heroSubtitle}>Find quick answers about bookings, payments, and services.</Text>
                    </ImageBackground>

                    <View style={FAQsStyle.introSection}>
                        <Text style={FAQsStyle.introTitle}>Frequently Asked Questions</Text>
                        <Text style={FAQsStyle.introSubtitle}>
                            Browse our FAQs to find quick answers about bookings, payments, and services. Can't find what you're looking for? Contact us for personalized support.
                        </Text>
                    </View>

                    {/* Horizontal Categories Filter */}
                    <View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={FAQsStyle.filterScroll}>
                            {categories.map((category) => {
                                const isActive = activeCategory === category;
                                return (
                                    <TouchableOpacity
                                        key={category}
                                        style={[FAQsStyle.filterPill, isActive && FAQsStyle.filterPillActive]}
                                        onPress={() => {
                                            setActiveCategory(category);
                                            setExpandedIndex(null);
                                        }}
                                    >
                                        <Text style={[FAQsStyle.filterPillText, isActive && FAQsStyle.filterPillTextActive]}>
                                            {category}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Search Bar */}
                    <View style={FAQsStyle.searchContainer}>
                        <Ionicons name="search" size={18} color="#9ca3af" />
                        <TextInput
                            maxLength={30}
                            style={FAQsStyle.searchInput}
                            placeholder="Search a question or keyword"
                            placeholderTextColor="#9ca3af"
                            value={searchTerm}
                            autoCorrect={false}
                            onChangeText={(text) => {
                                const cleanedSearch = text
                                    .replace(/[^a-zA-Z0-9\s.,?!'&()/#\-]/g, "")
                                    .replace(/\s{2,}/g, " ")
                                    .replace(/^\s+/, "");

                                setSearchTerm(cleanedSearch);
                                setExpandedIndex(null);
                            }}
                        />
                        {searchTerm.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchTerm('')}>
                                <Ionicons name="close-circle" size={18} color="#9ca3af" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* FAQ List */}
                    <View style={FAQsStyle.faqListContainer}>
                        {filteredFaqs.length === 0 ? (
                            <View style={FAQsStyle.emptyState}>
                                <Ionicons name="help-buoy-outline" size={48} color="#d1d5db" style={{ marginBottom: 10 }} />
                                <Text style={FAQsStyle.emptyTitle}>No matching questions found.</Text>
                                <Text style={FAQsStyle.emptySub}>Need more help? Reach out through the Contact Us section on our Home page.</Text>
                                <TouchableOpacity style={FAQsStyle.contactBtn} onPress={() => cs.navigate('home')}>
                                    <Text style={FAQsStyle.contactBtnText}>Contact Us</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={FAQsStyle.accordionWrapper}>
                                {filteredFaqs.map((item, index) => {
                                    const isExpanded = expandedIndex === index;
                                    return (
                                        <View key={index} style={FAQsStyle.accordionItem}>
                                            <TouchableOpacity
                                                style={FAQsStyle.accordionHeader}
                                                onPress={() => toggleAccordion(index)}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={FAQsStyle.questionText}>{item.question}</Text>
                                                <Ionicons
                                                    name={isExpanded ? "chevron-up" : "chevron-down"}
                                                    size={20}
                                                    color="#305797"
                                                />
                                            </TouchableOpacity>

                                            {isExpanded && (
                                                <View style={FAQsStyle.accordionBody}>
                                                    <Text style={FAQsStyle.answerText}>{item.answer}</Text>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}