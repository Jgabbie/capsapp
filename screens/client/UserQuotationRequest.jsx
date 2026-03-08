import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Modal,
} from "react-native";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";

export default function UserQuotationRequest({ route, navigation }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showBookingSummary, setShowBookingSummary] = useState(false);
  const [showBookingRegistration, setShowBookingRegistration] = useState(false);
  const [bookingSummaryLines, setBookingSummaryLines] = useState([]);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);
  const { user } = useUser();

  const quotationId = route?.params?.quotationId;

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [quotationId, user?._id]);

  const handleRequestRevision = async () => {
    if (!notes.trim()) {
      Alert.alert("Validation", "Please provide notes for revision.");
      return;
    }

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
      Alert.alert("Error", error.response?.data?.message || "Failed to request revision.");
    }
  };

  const handleAcceptQuotation = async () => {
    if (!quotation) return;

    setProcessing(true);
    try {
      if (!quotation.pdfRevisions || quotation.pdfRevisions.length === 0) {
        Alert.alert("Quotation not ready", "Wait for admin to upload quotation first.");
        return;
      }

      const details = quotation.travelDetails || {};
      const summaryLines = [
        `Reference: ${quotation.reference || "--"}`,
        `Package: ${quotation.packageName || "--"}`,
        `Travelers: ${details.travelers ?? 0}`,
        `Preferred Airlines: ${details.preferredAirlines || "--"}`,
        `Preferred Hotels: ${details.preferredHotels || "--"}`,
        `Budget: ₱${details.budgetRange?.[0] ?? 0} - ₱${details.budgetRange?.[1] ?? 0}`,
      ];

      setBookingSummaryLines(summaryLines);
      setShowBookingSummary(true);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Unable to accept quotation");
    } finally {
      setProcessing(false);
    }
  };

  const handleProceedBooking = () => {
    setShowBookingSummary(false);
    setHasAgreedToTerms(false);
    setShowBookingRegistration(true);
  };

  const handleProceedFromRegistration = () => {
    if (!hasAgreedToTerms) {
      Alert.alert("Agreement required", "Please agree to all terms and conditions first.");
      return;
    }

    setShowBookingRegistration(false);
    navigation.navigate("quotationcheckout", {
      quotation,
      startStep: "invoice",
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Header openSidebar={() => setSidebarVisible(true)} />
      <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

      <ScrollView contentContainerStyle={styles.container}>
        {loading || !quotation ? (
          <ActivityIndicator size="large" color="#305797" style={{ marginTop: 24 }} />
        ) : (
          <>
            <Text style={styles.title}>{quotation.packageName}</Text>
            <Text style={styles.meta}>Reference: {quotation.reference}</Text>
            <Text style={styles.meta}>Status: {quotation.status}</Text>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Travel Details</Text>
              <Text style={styles.meta}>Travelers: {quotation.travelDetails?.travelers ?? 0}</Text>
              <Text style={styles.meta}>Preferred Airlines: {quotation.travelDetails?.preferredAirlines || "--"}</Text>
              <Text style={styles.meta}>Preferred Hotels: {quotation.travelDetails?.preferredHotels || "--"}</Text>
              <Text style={styles.meta}>
                Budget: ₱{quotation.travelDetails?.budgetRange?.[0] ?? 0} - ₱
                {quotation.travelDetails?.budgetRange?.[1] ?? 0}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Quotation PDF Revisions</Text>
              {(quotation.pdfRevisions || []).length === 0 ? (
                <Text style={styles.meta}>No quotation PDF uploaded yet.</Text>
              ) : (
                quotation.pdfRevisions.map((revision, index) => (
                  <TouchableOpacity
                    key={`${revision._id || index}`}
                    style={styles.pdfRow}
                    onPress={() => Linking.openURL(revision.url)}
                  >
                    <Text style={styles.linkText}>Open PDF v{revision.version}</Text>
                    <Text style={styles.meta}>By {revision.uploaderName}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Revision Notes History</Text>
              {(quotation.revisionComments || []).length === 0 ? (
                <Text style={styles.meta}>No revision comments yet.</Text>
              ) : (
                quotation.revisionComments.map((comment, index) => (
                  <View key={`${comment._id || index}`} style={styles.commentItem}>
                    <Text style={styles.commentAuthor}>
                      {comment.authorName} ({comment.role})
                    </Text>
                    <Text style={styles.meta}>{comment.comments}</Text>
                  </View>
                ))
              )}
            </View>

            <TextInput
              style={styles.noteInput}
              placeholder="Provide notes for revision"
              value={notes}
              onChangeText={setNotes}
              multiline
              editable={quotation.status !== "Approved"}
            />

            <TouchableOpacity
              style={[styles.primaryButton, processing && { opacity: 0.5 }]}
              onPress={handleAcceptQuotation}
              disabled={processing || quotation.status === "Approved"}
            >
              <Text style={styles.buttonText}>Accept & Book</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRequestRevision}
              disabled={quotation.status === "Approved"}
            >
              <Text style={styles.buttonText}>Request Revision</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <Modal
        transparent
        visible={showBookingSummary}
        animationType="fade"
        onRequestClose={() => setShowBookingSummary(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Booking Summary</Text>
            {bookingSummaryLines.map((line, index) => (
              <Text key={`summary-${index}`} style={styles.modalSummaryText}>{line}</Text>
            ))}

            <Text style={styles.modalSectionTitle}>Uploaded Quotation PDF</Text>
            {(quotation?.pdfRevisions || []).length === 0 ? (
              <Text style={styles.modalSummaryText}>No uploaded PDF found.</Text>
            ) : (
              (() => {
                const latestPdf = quotation.pdfRevisions[quotation.pdfRevisions.length - 1];
                return (
                  <TouchableOpacity
                    style={styles.modalPdfRow}
                    onPress={() => Linking.openURL(latestPdf.url)}
                  >
                    <Text style={styles.modalPdfLink}>Open PDF v{latestPdf.version}</Text>
                    <Text style={styles.modalPdfMeta}>By {latestPdf.uploaderName}</Text>
                  </TouchableOpacity>
                );
              })()
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowBookingSummary(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalProceedButton]}
                onPress={handleProceedBooking}
              >
                <Text style={styles.buttonText}>Proceed</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={showBookingRegistration}
        animationType="fade"
        onRequestClose={() => setShowBookingRegistration(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.registrationModalCard}>
            <TouchableOpacity style={styles.registrationCloseBtn} onPress={() => setShowBookingRegistration(false)}>
              <Text style={styles.registrationCloseText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Booking Registration</Text>

            <View style={styles.registrationInfoCard}>
              <Text style={styles.registrationInfoTitle}>{quotation?.packageName || "Package"}</Text>
              <Text style={styles.registrationInfoText}>
                Duration: {Array.isArray(quotation?.travelDetails?.fixedItinerary) ? quotation.travelDetails.fixedItinerary.length : "N/A"} days
              </Text>
              <Text style={styles.registrationInfoText}>
                Price per pax: ₱{
                  (quotation?.travelDetails?.travelers || 0) > 0
                    ? Math.round((quotation?.travelDetails?.budgetRange?.[1] || 0) / quotation.travelDetails.travelers)
                    : 0
                }
              </Text>
            </View>

            <View style={styles.registrationInfoCard}>
              <Text style={styles.registrationSectionTitle}>Terms and Conditions</Text>
              <Text style={styles.registrationInfoText}>
                By booking this package, you agree to follow all rules and regulations set forth by our service. Please read carefully.
              </Text>
            </View>

            <View style={styles.registrationInfoCard}>
              <Text style={styles.registrationSectionTitle}>Cancellation Policy</Text>
              <Text style={styles.registrationInfoText}>
                Cancellations within 24 hours of booking receive a full refund. Cancellations after that are non-refundable.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.agreementRow}
              onPress={() => setHasAgreedToTerms((prev) => !prev)}
              activeOpacity={0.8}
            >
              <View style={styles.checkboxBox}>
                {hasAgreedToTerms ? <Text style={styles.checkboxCheck}>✓</Text> : null}
              </View>
              <Text style={styles.agreementText}>I have read and agree to all terms and conditions</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalProceedButton, !hasAgreedToTerms && styles.modalDisabledButton]}
                onPress={handleProceedFromRegistration}
                disabled={!hasAgreedToTerms}
              >
                <Text style={styles.buttonText}>Proceed</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelOutlinedButton]}
                onPress={() => setShowBookingRegistration(false)}
              >
                <Text style={styles.modalCancelOutlinedText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  meta: {
    marginTop: 4,
    color: "#666",
  },
  card: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#305797",
  },
  commentItem: {
    marginBottom: 10,
  },
  commentAuthor: {
    fontWeight: "700",
    color: "#333",
  },
  pdfRow: {
    marginBottom: 10,
  },
  linkText: {
    color: "#2d5fb8",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  noteInput: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    textAlignVertical: "top",
  },
  primaryButton: {
    marginTop: 14,
    backgroundColor: "#305797",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryButton: {
    marginTop: 10,
    backgroundColor: "#6c757d",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  registrationModalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    position: "relative",
  },
  registrationCloseBtn: {
    position: "absolute",
    right: 12,
    top: 8,
    padding: 4,
    zIndex: 2,
  },
  registrationCloseText: {
    fontSize: 28,
    color: "#999",
    lineHeight: 28,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#305797",
    marginBottom: 10,
    textAlign: "center",
  },
  modalSummaryText: {
    color: "#444",
    marginBottom: 4,
  },
  modalSectionTitle: {
    marginTop: 10,
    marginBottom: 6,
    color: "#305797",
    fontWeight: "700",
  },
  modalPdfRow: {
    marginBottom: 8,
  },
  modalPdfLink: {
    color: "#2d5fb8",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  modalPdfMeta: {
    color: "#666",
    marginTop: 2,
  },
  registrationInfoCard: {
    borderWidth: 1,
    borderColor: "#e4e7ec",
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
    backgroundColor: "#fff",
  },
  registrationInfoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  registrationSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  registrationInfoText: {
    color: "#444",
    marginBottom: 4,
  },
  agreementRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#c7ccd3",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCheck: {
    color: "#305797",
    fontWeight: "700",
  },
  agreementText: {
    flex: 1,
    color: "#333",
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 14,
    gap: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: "#6c757d",
  },
  modalProceedButton: {
    backgroundColor: "#305797",
  },
  modalDisabledButton: {
    backgroundColor: "#c5c9cf",
  },
  modalCancelOutlinedButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ff4d4f",
  },
  modalCancelOutlinedText: {
    color: "#ff4d4f",
    fontWeight: "600",
  },
});
