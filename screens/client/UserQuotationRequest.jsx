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
import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";
import styles from "../../styles/clientstyles/UserQuotationRequestStyle";

export default function UserQuotationRequest({ route, navigation }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { user } = useUser();
  const quotationId = route?.params?.id || route?.params?.quotationId; 

  const isDisabled =
        quotation?.status === "Pending" ||
        quotation?.status === "Revision Requested" ||
        quotation?.status === "Approved" ||
        quotation?.status === "Rejected";

  const fetchQuotation = async () => {
    if (!quotationId || !user?._id) return;
    setLoading(true);
    try {
      const response = await api.get(`/quotation/get-quotation/${quotationId}`, withUserHeader(user._id));
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
    if (!notes.trim() || notes.length > 200) {
        return Alert.alert("Validation", "Please provide notes for revision (max 200 characters).");
    }

    setActionLoading(true);
    try {
      await api.post(`/quotation/${quotationId}/request-revision`, { notes }, withUserHeader(user._id));
      setNotes("");
      setIsRevisionModalOpen(true);
    } catch (error) {
      Alert.alert("Error", "Failed to request revision.");
    } finally {
        setActionLoading(false);
    }
  };

  const handleAcceptQuotation = () => {
    if (!quotation?.pdfRevisions?.length) {
      return Alert.alert("Hold on", "Wait for the admin to upload a price quotation first.");
    }
    setIsAcceptModalOpen(true);
  };

  const handleFinalProceed = () => {
      setIsAcceptModalOpen(false);
      // Navigation logic to your booking process goes here
      navigation.navigate("quotationcheckout", { 
          id: quotationId,
          quotationData: quotation 
      });
  };

  const getStatusColor = (status) => {
    const s = String(status || '').trim().toLowerCase();
    switch (s) {
        case 'approved':
        case 'successful':
        case 'booked':
            return { bg: '#f6ffed', text: '#389e0d' }; // Green
        case 'pending':
            return { bg: '#fffbe6', text: '#d48806' }; // Gold/Yellow
        case 'rejected':
            return { bg: '#fff1f0', text: '#cf1322' }; // Red
        case 'under review':
            return { bg: '#e6f7ff', text: '#0958d9' }; // Blue
        case 'revision requested':
            return { bg: '#f9f0ff', text: '#531dab' }; // Purple
        case 'cancelled':
        default:
            return { bg: '#f5f5f5', text: '#555555' }; // Grey
    }
  };

  if (loading || !quotation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#305797" />
        <Text style={{marginTop: 10, color: '#666', fontFamily: 'Roboto_400Regular'}}>Loading quotation...</Text>
      </View>
    );
  }

  const sStyle = getStatusColor(quotation.status);
  const latestRevision = quotation?.pdfRevisions?.filter(rev => rev?.url).slice(-1)[0];
  const displayPackageName = quotation?.packageName || quotation?.packageId?.packageName || "Tour Package";

  return (
    <View style={styles.mainContainer}>
      <Header openSidebar={() => setSidebarVisible(true)} />
      <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        <View style={styles.topIntroSection}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>Booking Quotation Request</Text>
          <Text style={styles.pageSubtitle}>
            Review your the details of your booking quotation request here. You can view the latest quotation PDF, check the revision history, and provide feedback for any necessary revisions.
          </Text>
        </View>

        {/* --- HEADER CARD (Web Sync) --- */}
        <View style={styles.headerCard}>
            <Text style={styles.packageTitle}>{displayPackageName}</Text>
            <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Reference: </Text>
                <Text style={styles.metaValue}>{quotation.reference}</Text>
                <Text style={styles.metaDivider}> | </Text>
                <Text style={styles.metaLabel}>Status: </Text>
                <View style={[styles.statusTag, { backgroundColor: sStyle.bg }]}>
                    <Text style={[styles.statusText, { color: sStyle.text }]}>{quotation.status}</Text>
                </View>
            </View>
        </View>

        {/* --- HISTORY CARDS --- */}
        <View style={styles.historyContainer}>
            {/* PDF Revisions */}
            <View style={styles.historyCard}>
                <Text style={styles.historyTitle}>Quotation Revision History</Text>
                {quotation.pdfRevisions?.filter((rev) => rev?.url)?.length === 0 ? (
                    <Text style={styles.emptyText}>No PDF revisions uploaded yet.</Text>
                ) : (
                    <View style={styles.historyList}>
                        {quotation.pdfRevisions.filter((rev) => rev?.url).map((rev, index) => (
                            <View key={index} style={styles.historyItem}>
                                <View style={styles.historyItemHeader}>
                                    <Text style={styles.historyItemVersion}>Version {rev.version}</Text>
                                    <Text style={styles.historyItemDate}>{dayjs(rev.uploadedAt).format('MMM DD, YYYY HH:mm')}</Text>
                                </View>
                                <Text style={styles.historyItemSub}>Uploaded by {rev.uploaderName}</Text>
                                <TouchableOpacity onPress={() => handleOpenPDF(rev.url)}>
                                    <Text style={styles.historyItemLink}>View PDF Document</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* Revision Notes */}
            <View style={styles.historyCard}>
                <Text style={styles.historyTitle}>Revision Notes History</Text>
                {quotation.revisionComments?.length === 0 ? (
                    <Text style={styles.emptyText}>No revision comments yet.</Text>
                ) : (
                    <View style={styles.historyList}>
                        {quotation.revisionComments.map((c, i) => (
                            <View key={c._id || i} style={styles.historyItem}>
                                <View style={styles.historyItemHeader}>
                                    <Text style={styles.historyItemVersion}>{c.authorName} <Text style={{color: '#999', fontSize: 11}}>({c.role})</Text></Text>
                                </View>
                                <Text style={styles.historyItemComment}>"{c.comments}"</Text>
                                <Text style={styles.historyItemDate}>{dayjs(c.createdAt).format('MMM DD, YYYY HH:mm')}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </View>

        {/* --- LATEST REVISION (PDF Link for Mobile) --- */}
        <View style={styles.latestRevisionSection}>
            <Text style={styles.sectionHeading}>Latest Revision</Text>
            <Text style={styles.latestRevisionDescription}>
              The file below shows the latest revision of your quotation. If you have requested a revision, please wait for the provider to upload the updated quotation.
            </Text>
            <View style={styles.latestRevisionBox}>
                {latestRevision ? (
                     <TouchableOpacity style={styles.pdfLinkBox} onPress={() => handleOpenPDF(latestRevision.url)}>
                        <Ionicons name="document-text" size={24} color="#305797" />
                        <View style={{marginLeft: 10}}>
                            <Text style={styles.pdfLinkBoxText}>Tap to view latest PDF (Version {latestRevision.version})</Text>
                            <Text style={{color: '#666', fontSize: 12}}>Uploaded {dayjs(latestRevision.uploadedAt).format('MMM DD, YYYY')}</Text>
                        </View>
                     </TouchableOpacity>
                ) : (
                    <Text style={styles.emptyText}>No PDF uploaded yet.</Text>
                )}
            </View>
        </View>

        {/* --- REVISION NOTES SECTION HEADER --- */}
        {quotation?.status && ['booked', 'complete', 'completed', 'approved', 'rejected'].includes(quotation.status.toLowerCase()) ? null : (
            <View style={styles.revisionNotesSection}>
                <Text style={styles.revisionNotesTitle}>Revision Notes</Text>
                <Text style={styles.revisionNotesSubtitle}>
                  Provide feedback for revision if you want to request changes to the quotation. If you are satisfied with the quotation, you can proceed to accept it.
                </Text>
            </View>
        )}

        {/* --- ACTION SECTION --- */}
        {quotation?.status && ['booked', 'complete', 'completed', 'approved', 'rejected'].includes(quotation.status.toLowerCase()) ? null : (
            <View style={styles.inputSection}>
                <TextInput
                    style={styles.noteInput}
                    placeholder="Kindly provide any notes for revision (max 200 characters). Please be as detailed as possible."
                    placeholderTextColor="#999"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    maxLength={200}
                    editable={!isDisabled}
                />
                <Text style={styles.charCount}>{notes.length}/200</Text>

                <View style={styles.actionRow}>
                    <TouchableOpacity 
                        style={[styles.secondaryBtn, isDisabled && styles.disabledBtn]} 
                        onPress={handleAcceptQuotation}
                        disabled={isDisabled}
                    >
                        <Text style={[styles.secondaryBtnText, isDisabled && styles.disabledBtnText]}>Accept Quotation</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.primaryBtn, (isDisabled || !notes.trim()) && styles.disabledBtn]} 
                        onPress={handleRequestRevision}
                        disabled={isDisabled || !notes.trim()}
                    >
                        {actionLoading ? <ActivityIndicator color="#fff" size="small"/> : <Text style={[styles.primaryBtnText, (isDisabled || !notes.trim()) && styles.disabledBtnText]}>Request Revision</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        )}

      </ScrollView>

      {/* --- MODAL: SUCCESS REVISION --- */}
      <Modal transparent visible={isRevisionModalOpen} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCentered}>
            <Text style={styles.modalTitleCentered}>Revision Requested</Text>
            <View style={{alignItems: 'center', marginVertical: 15}}>
                <Ionicons name="checkmark-circle" size={60} color="#52c41a" />
            </View>
            <Text style={styles.modalTextCentered}>Your revision request has been submitted.</Text>
            <TouchableOpacity style={styles.modalPrimaryBtnFull} onPress={() => { setIsRevisionModalOpen(false); fetchQuotation(); }}>
                <Text style={styles.modalPrimaryBtnTextFull}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: ACCEPT CONFIRMATION --- */}
      <Modal transparent visible={isAcceptModalOpen} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCentered}>
            <Text style={styles.modalTitleCentered}>Accepting Quotation</Text>
            <Text style={styles.modalTextCentered}>Are you sure you want to proceed with this quotation?</Text>
            
            <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modalPrimaryBtnHalf} onPress={handleFinalProceed}>
                    <Text style={styles.modalPrimaryBtnTextHalf}>Proceed</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSecondaryBtnHalf} onPress={() => setIsAcceptModalOpen(false)}>
                    <Text style={styles.modalSecondaryBtnTextHalf}>Cancel</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}