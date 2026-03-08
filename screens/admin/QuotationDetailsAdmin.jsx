import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Linking,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Header from "../../components/Header";
import AdminSidebar from "../../components/AdminSidebar";
import { api } from "../../utils/api";

export default function QuotationDetailsAdmin({ route }) {
  const quotationId = route?.params?.quotationId;

  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const fetchQuotation = async () => {
    if (!quotationId) return;

    try {
      const response = await api.get(`/quotation/admin/${quotationId}`);
      setQuotation(response.data);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Unable to load quotation details");
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [quotationId]);

  const latestRevision = useMemo(() => {
    const revisions = quotation?.pdfRevisions || [];
    return revisions.length ? revisions[revisions.length - 1] : null;
  }, [quotation]);

  const handleUploadPdfFile = async () => {
    const picked = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (picked.canceled) return;

    const file = picked.assets?.[0];
    if (!file?.uri) {
      Alert.alert("Validation", "No PDF file selected.");
      return;
    }

    const formData = new FormData();
    if (Platform.OS === "web" && file.file) {
      formData.append("pdf", file.file, file.name || `quotation-${Date.now()}.pdf`);
    } else {
      formData.append("pdf", {
        uri: file.uri,
        name: file.name || `quotation-${Date.now()}.pdf`,
        type: file.mimeType || "application/pdf",
      });
    }

    setUploadingPdf(true);

    try {
      await api.post(`/quotation/admin/${quotationId}/upload-pdf`, formData);
      Alert.alert("Success", "Quotation PDF uploaded.");
      fetchQuotation();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Unable to upload PDF revision");
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSendQuotation = async () => {
    try {
      await api.put(`/quotation/admin/${quotationId}/status`, { status: "Revised" });
      Alert.alert("Success", "Quotation sent successfully.");
      fetchQuotation();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Unable to send quotation");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header openSidebar={() => setSidebarVisible(true)} />
      <AdminSidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

      <ScrollView contentContainerStyle={styles.container}>
        {!quotation ? (
          <Text style={styles.emptyText}>Loading quotation details...</Text>
        ) : (
          <>
            <Text style={styles.title}>Quotation Details</Text>
            <Text style={styles.meta}>Reference: {quotation.reference}</Text>
            <Text style={styles.meta}>Status: {quotation.status}</Text>
            <Text style={styles.meta}>User: {quotation.userName}</Text>
            <Text style={styles.meta}>Package: {quotation.packageName}</Text>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Travel Details</Text>
              <Text style={styles.meta}>Travelers: {quotation.travelDetails?.travelers ?? 0}</Text>
              <Text style={styles.meta}>Preferred Airlines: {quotation.travelDetails?.preferredAirlines || "--"}</Text>
              <Text style={styles.meta}>Preferred Hotels: {quotation.travelDetails?.preferredHotels || "--"}</Text>
              <Text style={styles.meta}>
                Budget: ₱{quotation.travelDetails?.budgetRange?.[0] ?? 0} - ₱{quotation.travelDetails?.budgetRange?.[1] ?? 0}
              </Text>
              <Text style={styles.meta}>Additional Comments: {quotation.travelDetails?.additionalComments || "--"}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Latest PDF Revision</Text>
              {!latestRevision ? (
                <Text style={styles.meta}>No PDF revisions uploaded yet.</Text>
              ) : (
                <>
                  <Text style={styles.meta}>Version: {latestRevision.version}</Text>
                  <Text style={styles.meta}>Uploaded By: {latestRevision.uploaderName}</Text>
                  <Text style={styles.meta}>{new Date(latestRevision.uploadedAt).toLocaleString()}</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(latestRevision.url)}>
                    <Text style={styles.link}>Open Latest PDF</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Quotation Revision History</Text>
              {(quotation.pdfRevisions || []).length === 0 ? (
                <Text style={styles.meta}>No revision history yet.</Text>
              ) : (
                (quotation.pdfRevisions || [])
                  .slice()
                  .reverse()
                  .map((revision, index) => (
                    <View key={`${revision._id || index}`} style={styles.commentItem}>
                      <Text style={styles.commentAuthor}>Version {revision.version}</Text>
                      <Text style={styles.meta}>Uploaded By: {revision.uploaderName}</Text>
                      <Text style={styles.meta}>{new Date(revision.uploadedAt).toLocaleString()}</Text>
                      <TouchableOpacity onPress={() => Linking.openURL(revision.url)}>
                        <Text style={styles.link}>Open PDF</Text>
                      </TouchableOpacity>
                    </View>
                  ))
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Revision Comments</Text>
              {(quotation.revisionComments || []).length === 0 ? (
                <Text style={styles.meta}>No revision comments yet.</Text>
              ) : (
                quotation.revisionComments.map((comment, index) => (
                  <View key={`${comment._id || index}`} style={styles.commentItem}>
                    <Text style={styles.commentAuthor}>{comment.authorName} ({comment.role})</Text>
                    <Text style={styles.meta}>{comment.comments}</Text>
                    <Text style={styles.meta}>{new Date(comment.createdAt).toLocaleString()}</Text>
                  </View>
                ))
              )}
            </View>

            <TouchableOpacity style={[styles.button, styles.upload]} onPress={handleUploadPdfFile} disabled={uploadingPdf}>
              <Text style={styles.buttonText}>{uploadingPdf ? "Uploading..." : "Upload PDF File"}</Text>
            </TouchableOpacity>

            {(quotation.pdfRevisions || []).length > 0 && quotation.status !== "Revised" && (
              <TouchableOpacity style={[styles.button, styles.send]} onPress={handleSendQuotation}>
                <Text style={styles.buttonText}>Send Quotation</Text>
              </TouchableOpacity>
            )}
          </>
        )}
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
    marginBottom: 8,
  },
  meta: {
    color: "#555",
    marginBottom: 4,
  },
  emptyText: {
    color: "#555",
    textAlign: "center",
    marginTop: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#305797",
    fontWeight: "700",
    marginBottom: 8,
  },
  link: {
    color: "#2d5fb8",
    fontWeight: "600",
    marginTop: 6,
    textDecorationLine: "underline",
  },
  commentItem: {
    marginBottom: 10,
  },
  commentAuthor: {
    fontWeight: "700",
    color: "#333",
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  upload: {
    backgroundColor: "#6c757d",
  },
  send: {
    backgroundColor: "#305797",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
});
