import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Platform, KeyboardAvoidingView, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';

import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import FAQsStyle from '../../styles/clientstyles/FAQsStyle';

const faqData = [
    {
        category: 'Bookings',
        question: 'How do I book a tour package?',
        answer: 'Go to Destinations, choose a package, then follow the booking steps. You will receive a booking reference after submission.'
    },
    {
        category: 'Bookings',
        question: 'Can I cancel a booking?',
        answer: 'Yes. Open My Bookings, choose a booking, and submit a cancellation request with the required proof.'
    },
    {
        category: 'Payments',
        question: 'What payment methods are supported?',
        answer: 'Payments are processed through the available options shown during checkout. If you need help, contact support.'
    },
    {
        category: 'Quotations',
        question: 'How do I request a quotation?',
        answer: 'Use the quotation request page to submit your travel details. Our team will send a quote once reviewed.'
    },
    {
        category: 'Account',
        question: 'How do I reset my password?',
        answer: 'Use the Reset Password page and follow the instructions sent to your email.'
    },
    {
        category: 'Services',
        question: 'Do you offer visa and passport services?',
        answer: 'Yes. Visit the Services page for passport and visa assistance options.'
    },
    {
        category: 'Services',
        question: 'What documents do I need to prepare?',
        answer: 'Refer to the requirements section above for a general list. Specific services may have additional requirements.'
    },
    {
        category: 'Services',
        question: 'How long does the process take?',
        answer: 'Processing times vary by the DFA office and Embassy and the type of service you are applying for. After submission, you will receive updates on your application status.'
    },
    {
        category: 'Services',
        question: 'Can I reschedule my appointment?',
        answer: 'Rescheduling policies depend on the DFA office. If you need to change your appointment, please contact the DFA office directly.'
    }
];

export default function FAQs() {
    const cs = useNavigation();
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [expandedIndex, setExpandedIndex] = useState(null);

    const [fontsLoaded] = useFonts({
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium
    });

    const categories = useMemo(() => {
        const unique = new Set(faqData.map((item) => item.category));
        return ['All', ...Array.from(unique)];
    }, []);

    const filteredFaqs = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return faqData.filter((item) => {
            const matchesTerm = !term || item.question.toLowerCase().includes(term) || item.answer.toLowerCase().includes(term);
            const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
            return matchesTerm && matchesCategory;
        });
    }, [activeCategory, searchTerm]);

    const toggleAccordion = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    if (!fontsLoaded) return null;

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
                            style={FAQsStyle.searchInput}
                            placeholder="Search a question or keyword"
                            placeholderTextColor="#9ca3af"
                            value={searchTerm}
                            onChangeText={(text) => {
                                setSearchTerm(text);
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