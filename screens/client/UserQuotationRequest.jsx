import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  Modal,
} from "react-native";
import dayjs from "dayjs";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";

// Ensure this path matches exactly where you put your style file
import styles from "../../styles/clientstyles/UserQuotationRequestStyle";

export default function UserQuotationRequest({ route, navigation }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [showBookingSummary, setShowBookingSummary] = useState(false);
  const [showBookingRegistration, setShowBookingRegistration] = useState(false);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);

  const { user } = useUser();
  const quotationId = route?.params?.id || route?.params?.quotationId; 

  // --- API LOGIC ---
  const fetchQuotation = async () => {
    if (!quotationId || !user?._id) return;

    setLoading(true);
    try {
      const response = await api.get(
        `/quotation/get-quotation/${quotationId}`,
        withUserHeader(user._id)
      );
      setQuotation(response.data);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Unable to load quotation");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [quotationId, user?._id]);

  // --- ACTION HANDLERS ---
  const handleOpenPDF = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Your device cannot open this PDF link.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not open PDF.");
    }
  };

  const handleRequestRevision = async () => {
    if (!notes.trim()) return Alert.alert("Validation", "Please provide notes for revision.");

    try {
      await api.post(
        `/quotation/${quotationId}/request-revision`,
        { notes },
        withUserHeader(user._id)
      );
      setNotes("");
      Alert.alert("Success", "Revision requested successfully.");
      fetchQuotation();
    } catch (error) {
      Alert.alert("Error", "Failed to request revision.");
    }
  };

  const handleAcceptQuotation = () => {
    if (!quotation?.pdfRevisions?.length) {
      return Alert.alert("Hold on", "Wait for the admin to upload a price quotation first.");
    }
    setShowBookingSummary(true);
  };

  const handleProceedToRegistration = () => {
    setShowBookingSummary(false);
    setShowBookingRegistration(true);
  };

  const handleFinalProceed = () => {
    if (!hasAgreedToTerms) return Alert.alert("Required", "You must agree to the terms.");
    
    setShowBookingRegistration(false);
    navigation.navigate("quotationcheckout", { 
        id: quotationId,
        quotationData: quotation 
    });
  };

  // Dynamic Status Color Helper
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#1f8f3a';
      case 'Under Review': return '#305797';
      case 'Revision Requested': return '#faad14';
      case 'Rejected': return '#ff4d4f';
      default: return '#666';
    }
  };

  // --- RENDER ---
  if (loading || !quotation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#305797" />
      </View>
    );
  }

  const travel = quotation.travelDetails || {};

  return (
    <View style={styles.mainContainer}>
      <Header openSidebar={() => setSidebarVisible(true)} />
      <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{quotation.packageName}</Text>
        
        <View style={styles.headerMeta}>
            <Text style={styles.metaText}>Ref: {quotation.reference}</Text>
            {/* Dynamic inline coloring for the status badge based on data */}
            <View style={[styles.statusTag, { backgroundColor: getStatusColor(quotation.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(quotation.status) }]}>{quotation.status}</Text>
            </View>
        </View>

        {/* Section: Travel Requirements */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Travel Requirements</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Travelers:</Text>
            <Text style={styles.detailValue}>{travel.travelers || 0}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Airlines:</Text>
            <Text style={styles.detailValue}>{travel.preferredAirlines || "No preference"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Budget Range:</Text>
            <Text style={styles.detailValue}>₱{travel.budgetRange?.[0]?.toLocaleString()} - ₱{travel.budgetRange?.[1]?.toLocaleString()}</Text>
          </View>
        </View>

        {/* Section: PDF Docs */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Price Quotation Docs</Text>
          {quotation.pdfRevisions?.length > 0 ? (
            quotation.pdfRevisions.map((rev, idx) => (
              <TouchableOpacity key={rev._id || idx} style={styles.pdfItem} onPress={() => handleOpenPDF(rev.url)}>
                <Text style={styles.pdfLink}>View Version {rev.version}.pdf</Text>
                <Text style={styles.pdfMeta}>Uploaded by {rev.uploaderName} on {dayjs(rev.uploadedAt).format('MMM DD')}</Text>
              </TouchableOpacity>
            ))
          ) : <Text style={styles.emptyText}>No documents uploaded by admin yet.</Text>}
        </View>

        {/* Section: Chat/Notes History */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Conversation History</Text>
          {quotation.revisionComments?.map((c, i) => (
            <View key={c._id || i} style={styles.commentBox}>
              <Text style={styles.commentAuthor}>{c.authorName} ({c.role})</Text>
              <Text style={styles.commentText}>{c.comments}</Text>
              <Text style={styles.commentDate}>{dayjs(c.createdAt).format('MMM DD, YYYY')}</Text>
            </View>
          ))}
        </View>

        {/* Section: Actions (Only show if not approved) */}
        {quotation.status !== "Approved" && (
            <View style={styles.actionContainer}>
                <TextInput
                    style={styles.noteInput}
                    placeholder="Enter message for the agent..."
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                />
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={handleRequestRevision}>
                        <Text style={styles.secondaryButtonText}>Send Revision</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleAcceptQuotation}>
                        <Text style={styles.primaryButtonText}>Accept & Book</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )}
      </ScrollView>

      {/* --- MODAL 1: Booking Summary --- */}
      <Modal transparent visible={showBookingSummary} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Booking Summary</Text>
            <View style={styles.summaryList}>
                <Text style={styles.summaryItem}>• Package: {quotation.packageName}</Text>
                <Text style={styles.summaryItem}>• Travelers: {travel.travelers}</Text>
                <Text style={styles.summaryItem}>• Ref: {quotation.reference}</Text>
            </View>
            <View style={styles.modalActionRow}>
                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowBookingSummary(false)}>
                    <Text style={styles.modalBtnTextDark}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnPrimary} onPress={handleProceedToRegistration}>
                    <Text style={styles.modalBtnTextLight}>Proceed</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 2: Terms & Registration --- */}
      <Modal transparent visible={showBookingRegistration} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Terms & Conditions</Text>
            
            <ScrollView style={styles.termsScrollView}>
                <Text style={styles.termsText}>
                    1. Bookings are non-transferable.{"\n"}
                    2. Cancellation within 24 hours only.{"\n"}
                    3. Payments must be settled via the next checkout screen.{"\n"}
                    4. By proceeding, you agree to Travex agency terms.
                </Text>
            </ScrollView>
            
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setHasAgreedToTerms(!hasAgreedToTerms)}>
                <View style={[styles.checkbox, hasAgreedToTerms && styles.checkedCheckbox]} />
                <Text style={styles.checkboxLabel}>I agree to the terms and conditions</Text>
            </TouchableOpacity>

            <View style={styles.modalActionRow}>
                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowBookingRegistration(false)}>
                    <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.modalBtnPrimary, !hasAgreedToTerms && styles.disabledButton]} 
                    onPress={handleFinalProceed}
                    disabled={!hasAgreedToTerms}
                >
                    <Text style={styles.modalBtnTextLight}>Finalize Booking</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}