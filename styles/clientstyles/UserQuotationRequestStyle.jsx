import { StyleSheet, Platform, Dimensions } from "react-native";

const { width } = Dimensions.get('window');

const UserQuotationRequestStyle = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#eef2f6", // Very light blue/gray matching web background
  },
  scrollContainer: {
    padding: 15,
    paddingTop: 24,
    flexGrow: 1,
    paddingBottom: 305,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eef2f6",
  },

  topIntroSection: {
    marginBottom: 14,
  },
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#305797",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  backButtonText: {
    color: "#fff",
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 13,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: "Montserrat_700Bold",
    color: "#1f2f4a",
    marginBottom: 6,
  },
  pageSubtitle: {
    fontFamily: "Roboto_400Regular",
    color: "#666",
    fontSize: 12,
    lineHeight: 18,
  },

  // --- HEADER CARD ---
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    borderTopWidth: 4,
    borderTopColor: "#305797",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
      android: { elevation: 2 },
    }),
  },
  packageTitle: {
    fontSize: 20,
    fontFamily: "Montserrat_700Bold",
    color: "#305797", // Dark blue text
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  metaLabel: {
    fontFamily: "Montserrat_700Bold",
    color: "#333",
    fontSize: 12,
  },
  metaValue: {
    fontFamily: "Roboto_400Regular",
    color: "#555",
    fontSize: 12,
  },
  metaDivider: {
    color: "#ccc",
    marginHorizontal: 8,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  statusText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 11,
  },

  // --- HISTORY CARDS ---
  historyContainer: {
    flexDirection: 'column',
    gap: 15,
    marginBottom: 20,
  },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    borderTopWidth: 4,
    borderTopColor: "#305797",
    minHeight: 120,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
      android: { elevation: 2 },
    }),
  },
  historyTitle: {
    fontSize: 14,
    fontFamily: "Montserrat_700Bold",
    color: "#333",
    marginBottom: 15,
  },
  emptyText: {
    fontFamily: "Roboto_400Regular",
    color: "#9ca3af",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 15,
    fontSize: 12,
  },
  historyList: {
    flexDirection: 'column',
    gap: 10,
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyItemVersion: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 12,
    color: "#333",
  },
  historyItemDate: {
    fontFamily: "Roboto_400Regular",
    fontSize: 10,
    color: "#888",
  },
  historyItemSub: {
    fontFamily: "Roboto_400Regular",
    fontSize: 11,
    color: "#555",
    marginBottom: 4,
  },
  historyItemLink: {
    fontFamily: "Roboto_500Medium",
    fontSize: 11,
    color: "#305797",
    textDecorationLine: "underline",
  },
  historyItemComment: {
    fontFamily: "Roboto_400Regular",
    fontSize: 12,
    color: "#555",
    fontStyle: 'italic',
    marginBottom: 4,
    marginTop: 4,
  },

  // --- LATEST REVISION ---
  latestRevisionSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
    color: "#333",
    marginBottom: 10,
  },
  latestRevisionDescription: {
    fontFamily: "Roboto_400Regular",
    color: "#666",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  latestRevisionBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    padding: 20,
    minHeight: 100,
    justifyContent: 'center',
  },
  pdfLinkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f5ff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#adc6ff',
  },
  pdfLinkBoxText: {
    fontFamily: "Montserrat_600SemiBold",
    color: "#305797",
    fontSize: 13,
    marginBottom: 2,
  },

  // --- REVISION NOTES SECTION HEADER ---
  revisionNotesSection: {
    marginBottom: 15,
  },
  revisionNotesTitle: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
    color: "#333",
    marginBottom: 6,
  },
  revisionNotesSubtitle: {
    fontFamily: "Roboto_400Regular",
    color: "#666",
    fontSize: 13,
    lineHeight: 19,
  },

  // --- INPUT & BUTTONS ---
  inputSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    ...Platform.select({
        ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
        android: { elevation: 2 },
    }),
  },
  noteInput: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 6,
    padding: 12,
    height: 80,
    textAlignVertical: "top",
    fontFamily: "Roboto_400Regular",
    fontSize: 13,
    color: "#333",
  },
  charCount: {
    textAlign: 'right',
    fontFamily: "Roboto_400Regular",
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    marginBottom: 15,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  secondaryBtn: {
    backgroundColor: "#439c17",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  secondaryBtnText: {
    color: "#fff",
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 13,
  },
  primaryBtn: {
    backgroundColor: "#305797",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  primaryBtnText: {
    color: "#fff",
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 13,
  },
  disabledBtn: {
    backgroundColor: "#f5f5f5",
    borderColor: '#d9d9d9',
    borderWidth: 1,
  },
  disabledBtnText: {
    color: "#b8b8b8",
  },

  // --- CENTERED MODALS (ANT DESIGN STYLE) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContentCentered: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 24,
    width: "100%",
    maxWidth: 350,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 },
      android: { elevation: 10 },
    }),
  },
  modalTitleCentered: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  modalTextCentered: {
    fontFamily: "Roboto_400Regular",
    color: "#555",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  modalPrimaryBtnFull: {
    backgroundColor: "#305797",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    width: '100%',
  },
  modalPrimaryBtnTextFull: {
    color: "#fff",
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 10,
  },
  modalPrimaryBtnHalf: {
    flex: 1,
    backgroundColor: "#305797",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  modalPrimaryBtnTextHalf: {
    color: "#fff",
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 13,
  },
  modalSecondaryBtnHalf: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: '#d9d9d9',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  modalSecondaryBtnTextHalf: {
    color: "#555",
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 13,
  },
});

export default UserQuotationRequestStyle;