import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, ToastAndroid, Platform, Alert } from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';

import UserPreferenceStyle from '../../styles/clientstyles/UserPreferenceStyle';
import { api, withUserHeader } from '../../utils/api';
import { extractPackageTags } from '../../utils/packageTags';
import { useUser } from '../../context/UserContext';

export default function UserPreference() {
    const navigation = useNavigation();
    
    // 🔥 FIX 1: Extracted setUser from the context!
    const { user, setUser } = useUser(); 
    
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular, 
        Montserrat_500Medium, 
        Montserrat_600SemiBold, 
        Montserrat_700Bold,
        Roboto_400Regular, 
        Roboto_500Medium
    });

    const [moodOptions, setMoodOptions] = useState([]);
    const tourOptions = useMemo(() => ['Domestic', 'International'], []);
    const [isLoading, setIsLoading] = useState(false);
    const [selections, setSelections] = useState({ moods: [], tours: [], pace: [] });

    // Fetch dynamic package tags exactly like the web does
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await api.get('/package/get-packages');
                setMoodOptions(extractPackageTags(response.data));
            } catch (error) {
                setMoodOptions([]);
            }
        };
        fetchTags();
    }, []);

    const toggleSelection = (key, value, limit) => {
        setSelections((prev) => {
            const current = prev[key];
            const exists = current.includes(value);
            
            // Limit check (e.g., max 3 moods)
            if (!exists && limit && current.length >= limit) return prev;
            
            const next = exists ? current.filter((item) => item !== value) : [...current, value];
            return { ...prev, [key]: next };
        });
    };

    const totalSelections = selections.moods.length + selections.tours.length + selections.pace.length;
    const canContinue = totalSelections >= 3;

    const showMessage = (msg) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(msg, ToastAndroid.SHORT);
        } else {
            Alert.alert(msg);
        }
    };

    const handleContinue = async () => {
        if (!canContinue) return;
        setIsLoading(true);
        try {
            // 1. Save their preferences
            await api.post('/preferences/save', selections, withUserHeader(user?._id));
            
            // 2. Tell the database they have completed their first login
            await api.post('/users/login-once', {}, withUserHeader(user?._id));

            showMessage('Preferences saved!');
            
            // 3. Update the context so the app knows they are done
            setUser({ ...user, loginOnce: true }); 
            
            // 🔥 4. FORCE NAVIGATION: Clear the history and jump to Home!
            navigation.reset({ index: 0, routes: [{ name: 'home' }] });
            
        } catch (error) {
            console.error("Continue Error:", error);
            showMessage(error.response?.data?.message || 'Unable to save preferences.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!fontsLoaded) return null;

    return (
        <View style={UserPreferenceStyle.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                
                <View style={UserPreferenceStyle.heroSection}>
                    <Text style={UserPreferenceStyle.eyebrow}>New here?</Text>
                    <Text style={UserPreferenceStyle.title}>Let us tailor your travel moodboard</Text>
                    <Text style={UserPreferenceStyle.subtitle}>Pick a few vibes and tour styles so we can personalize your feed.</Text>
                    
                    <View style={UserPreferenceStyle.progressContainer}>
                        <Text style={UserPreferenceStyle.progressText}>{totalSelections} selected</Text>
                        <View style={UserPreferenceStyle.progressDivider} />
                        <Text style={UserPreferenceStyle.progressTarget}>Choose at least 3</Text>
                    </View>
                </View>

                <View style={UserPreferenceStyle.card}>
                    <Text style={UserPreferenceStyle.questionTitle}>What are you in the mood for?</Text>
                    <Text style={UserPreferenceStyle.questionSubtitle}>Choose up to 3.</Text>
                    
                    <View style={UserPreferenceStyle.chipGrid}>
                        {moodOptions.map((option) => {
                            const isSelected = selections.moods.includes(option);
                            return (
                                <TouchableOpacity 
                                    key={option} 
                                    style={[UserPreferenceStyle.chip, isSelected && UserPreferenceStyle.chipSelected]}
                                    onPress={() => toggleSelection('moods', option, 3)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[UserPreferenceStyle.chipText, isSelected && UserPreferenceStyle.chipTextSelected]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={UserPreferenceStyle.card}>
                    <Text style={UserPreferenceStyle.questionTitle}>What type of tour do you like?</Text>
                    <Text style={UserPreferenceStyle.questionSubtitle}>Pick as many as you want.</Text>
                    
                    <View style={UserPreferenceStyle.chipGrid}>
                        {tourOptions.map((option) => {
                            const isSelected = selections.tours.includes(option);
                            return (
                                <TouchableOpacity 
                                    key={option} 
                                    style={[UserPreferenceStyle.chip, isSelected && UserPreferenceStyle.chipSelected]}
                                    onPress={() => toggleSelection('tours', option, null)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[UserPreferenceStyle.chipText, isSelected && UserPreferenceStyle.chipTextSelected]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            <View style={UserPreferenceStyle.footer}>
                <Text style={UserPreferenceStyle.footerNote}>Your picks will shape the tours we recommend next.</Text>
                <TouchableOpacity 
                    style={[UserPreferenceStyle.ctaButton, !canContinue && UserPreferenceStyle.ctaButtonDisabled]}
                    disabled={!canContinue || isLoading}
                    onPress={handleContinue}
                >
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={UserPreferenceStyle.ctaText}>Continue</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}