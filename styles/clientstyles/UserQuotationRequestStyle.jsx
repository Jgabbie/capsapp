import { StyleSheet, Platform, Dimensions } from "react-native";

const { width, height } = Dimensions.get('window');

const UserQuotationRequestStyle = StyleSheet.create({
  // --- Main Layout ---
  mainContainer: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
  },

  // --- Header Section ---
  title: {
    fontSize: 24,
    fontFamily: "Montserrat_700Bold",
    color: "#305797",
    marginBottom: 8,
  },
  headerMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  metaText: {
    fontFamily: "Roboto_500Medium",
    color: "#6b7280",
    fontSize: 14,
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 12,
  },

  // --- Cards & Sections ---
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
    color: "#305797",
    marginBottom: 15,
  },

  // --- Travel Details ---
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontFamily: "Roboto_400Regular",
    color: "#6b7280",
    fontSize: 14,
  },
  detailValue: {
    fontFamily: "Roboto_500Medium",
    color: "#111827",
    fontSize: 14,
    maxWidth: "60%",
    textAlign: "right",
  },

  // --- PDF List ---
  pdfItem: {
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#305797",
  },
  pdfLink: {
    fontFamily: "Roboto_700Bold",
    color: "#305797",
    fontSize: 15,
    textDecorationLine: "underline",
    marginBottom: 4,
  },
  pdfMeta: {
    fontFamily: "Roboto_400Regular",
    color: "#6b7280",
    fontSize: 12,
  },
  emptyText: {
    fontFamily: "Roboto_400Regular",
    color: "#9ca3af",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },

  // --- Comments History ---
  commentBox: {
    backgroundColor: "#f9fafb",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  commentAuthor: {
    fontFamily: "Montserrat_700Bold",
    color: "#374151",
    fontSize: 14,
    marginBottom: 4,
  },
  commentText: {
    fontFamily: "Roboto_400Regular",
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentDate: {
    fontFamily: "Roboto_400Regular",
    color: "#9ca3af",
    fontSize: 11,
    textAlign: "right",
  },

  // --- Input & Actions ---
  actionContainer: {
    marginBottom: 40,
  },
  noteInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 15,
    height: 100,
    textAlignVertical: "top", // Ensures text starts at the top on Android
    fontFamily: "Roboto_400Regular",
    fontSize: 14,
    marginBottom: 15,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#1f8f3a", // Match Web Green
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontFamily: "Montserrat_700Bold",
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#305797",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#305797",
    fontFamily: "Montserrat_700Bold",
    fontSize: 14,
  },

  // --- MODALS (Summary & Terms) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 10 },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Montserrat_700Bold",
    color: "#305797",
    marginBottom: 15,
    textAlign: "center",
  },
  summaryList: {
    marginBottom: 20,
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 8,
  },
  summaryItem: {
    fontFamily: "Roboto_500Medium",
    color: "#374151",
    fontSize: 14,
    marginBottom: 8,
  },
  
  // Terms Specific
  termsScrollView: {
    maxHeight: height * 0.3, // Prevents it from getting too tall
    backgroundColor: "#f9fafb",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  termsText: {
    fontFamily: "Roboto_400Regular",
    color: "#4b5563",
    fontSize: 13,
    lineHeight: 22,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 4,
    marginRight: 10,
  },
  checkedCheckbox: {
    backgroundColor: "#305797",
    borderColor: "#305797",
  },
  checkboxLabel: {
    fontFamily: "Roboto_500Medium",
    color: "#374151",
    fontSize: 14,
    flex: 1,
  },

  // Modal Buttons
  modalActionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  modalBtnTextDark: {
    color: "#4b5563",
    fontFamily: "Montserrat_700Bold",
    fontSize: 14,
  },
  modalBtnPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#305797",
  },
  modalBtnTextLight: {
    color: "#fff",
    fontFamily: "Montserrat_700Bold",
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
});

export default UserQuotationRequestStyle;