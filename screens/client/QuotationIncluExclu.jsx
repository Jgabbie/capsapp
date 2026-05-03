import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import QuotationIncluExcluStyle from '../../styles/clientstyles/QuotationIncluExcluStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

export default function QuotationIncluExclu({ route, navigation }) {
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const { quotation } = route.params || {};
    const pkg = quotation?.packageId || quotation?.pkg || {};
    const pdfRevisions = Array.isArray(quotation?.pdfRevisions) ? quotation.pdfRevisions : [];
    const latestPdfRevision = pdfRevisions.length > 0 ? pdfRevisions[pdfRevisions.length - 1] : null;

    const inclusions = Array.isArray(latestPdfRevision?.travelDetails.inclusions)
        ? latestPdfRevision.travelDetails.inclusions
        : (Array.isArray(pkg?.packageInclusions) ? pkg.packageInclusions : []);

    const exclusions = Array.isArray(latestPdfRevision?.travelDetails.exclusions)
        ? latestPdfRevision.travelDetails.exclusions
        : (Array.isArray(pkg?.packageExclusions) ? pkg.packageExclusions : []);

    const itinerarySource = latestPdfRevision?.travelDetails.itinerary || pkg?.packageItineraries || {};
    const itineraryEntries = Array.isArray(itinerarySource)
        ? itinerarySource.map((items, index) => [`Day ${index + 1}`, items])
        : Object.entries(itinerarySource);

    console.log(inclusions)
    console.log(exclusions)
    console.log(itineraryEntries)

    return (
        <SafeAreaView style={QuotationIncluExcluStyle.safeArea}>
            <StatusBar barStyle="dark-content" />
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={QuotationIncluExcluStyle.container} showsVerticalScrollIndicator={false}>

                <View style={QuotationIncluExcluStyle.headerGroup}>
                    <Text style={QuotationAllInStyle.mainTitle}>Itinerary, Inclusions & Exclusions</Text>
                    <Text style={QuotationAllInStyle.subtitle}>Review the day-by-day schedule and what your package covers.</Text>
                </View>

                {/* --- ITINERARY SECTION --- */}
                <View style={QuotationIncluExcluStyle.sectionCard}>
                    <View style={QuotationIncluExcluStyle.cardHeader}>
                        <View>
                            <View style={QuotationIncluExcluStyle.pill}>
                                <Text style={QuotationIncluExcluStyle.pillText}>Itinerary</Text>
                            </View>
                            <Text style={QuotationIncluExcluStyle.sectionTitle}>Day-by-day plan</Text>
                            <Text style={QuotationIncluExcluStyle.sectionSubtitle}>Activities and highlights for each day.</Text>
                        </View>
                    </View>

                    {itineraryEntries.map(([day, items], i) => (
                        <View key={i} style={QuotationIncluExcluStyle.itineraryDayBox}>
                            <Text style={QuotationIncluExcluStyle.dayLabel}>{day.toUpperCase()}</Text>
                            {(Array.isArray(items) ? items : [items]).map((item, j) => (
                                <View key={j} style={QuotationIncluExcluStyle.activityRow}>
                                    <View style={QuotationIncluExcluStyle.activityBullet} />
                                    <Text style={QuotationIncluExcluStyle.activityText}>
                                        {typeof item === 'object' ? (item?.activity || item?.optionalActivity || item?.title || '') : item}
                                        {typeof item === 'object' && item?.isOptional ? " (Optional)" : ""}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                {/* --- INCLUSIONS & EXCLUSIONS SECTION --- */}
                <View style={QuotationIncluExcluStyle.sectionCard}>
                    <View style={QuotationIncluExcluStyle.cardHeader}>
                        <View>
                            <View style={QuotationIncluExcluStyle.pill}>
                                <Text style={QuotationIncluExcluStyle.pillText}>Package</Text>
                            </View>
                            <Text style={QuotationIncluExcluStyle.sectionTitle}>Inclusions & Exclusions</Text>
                            <Text style={QuotationIncluExcluStyle.sectionSubtitle}>Know what is covered and what is not.</Text>
                        </View>
                    </View>

                    <View style={QuotationIncluExcluStyle.gridRow}>
                        <View style={QuotationIncluExcluStyle.gridCol}>
                            <Text style={[QuotationIncluExcluStyle.gridTitle, { color: '#305797' }]}>Inclusions</Text>
                            {inclusions.map((item, i) => (
                                <Text key={i} style={QuotationIncluExcluStyle.itemText}>✓ {item}</Text>
                            ))}
                        </View>

                        <View style={QuotationIncluExcluStyle.gridCol}>
                            <Text style={[QuotationIncluExcluStyle.gridTitle, { color: '#b54747' }]}>Exclusions</Text>
                            {exclusions.map((item, i) => (
                                <Text key={i} style={QuotationIncluExcluStyle.itemText}>✕ {item}</Text>
                            ))}
                        </View>
                    </View>

                    {/* No Visa Requirement card here per request */}

                    <View style={[QuotationIncluExcluStyle.policyCard, { marginTop: 16 }]}>
                        <Text style={QuotationIncluExcluStyle.policyTitle}>Cancellation Policy</Text>
                        <Text style={QuotationIncluExcluStyle.policyText}>
                            Please be informed that cancellation request with medical reasons are only accepted and refundable with valid medical certificate. Cancellation request without medical reasons are non-refundable. For any cancellation request, please reach out to us through the Contact Us section on our Home page.
                        </Text>
                    </View>

                    {/* 🔥 NEW BOTTOM NAVIGATION BUTTONS 🔥 */}
                    <View style={QuotationIncluExcluStyle.actionContainer}>

                        {/* Upload ID Button (Goes Forward) */}
                        <TouchableOpacity
                            style={QuotationIncluExcluStyle.primaryButton}
                            onPress={() => navigation.navigate('quotationuploads', { quotation })}
                        >
                            <Text style={QuotationIncluExcluStyle.primaryButtonText}>Upload Valid ID</Text>
                        </TouchableOpacity>

                        {/* Back Button (Goes Backward) */}
                        <TouchableOpacity
                            style={QuotationIncluExcluStyle.secondaryButton}
                            // Using goBack() prevents app from stacking infinite screens!
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={QuotationIncluExcluStyle.secondaryButtonText}>Back</Text>
                        </TouchableOpacity>

                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
