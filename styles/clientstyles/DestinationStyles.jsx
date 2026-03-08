import { StyleSheet } from "react-native";

const DestinationStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 25,
    paddingBottom: 20
  },
  sideBarButton: {
    backgroundColor: '#E0E0E0',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideBarImage: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  rightIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  profileIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  bellButton: {
    position: 'absolute',
    top: -5,
    left: -10,
    zIndex: 1,
  },
  bellIcon: {
    width: 25,
    height: 25,
  },

  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#305797",
    textAlign: "center",
    marginTop: 10,
  },
  heroSubtitle: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f8fc",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#dbe3ef",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: "#333",
  },
  dropdownGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef3fb",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#d6e0f0",
  },
  dropdownText: {
    fontSize: 12,
    color: "#305797",
    fontWeight: "600",
  },
  dropdownIcon: {
    marginLeft: 6,
  },
  packageCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 18,
    elevation: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e6e9ef",
  },
  packageImage: {
    width: "100%",
    height: 170,
  },
  packageContent: {
    padding: 14,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#305797",
    textAlign: "center",
  },
  packageDescription: {
    fontSize: 12,
    color: "#777",
    marginTop: 6,
    textAlign: "center",
  },
  viewDetailsButton: {
    marginTop: 12,
    backgroundColor: "#305797",
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 18,
  },
  viewDetailsText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  packageMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: "#333",
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  detailsHeader: {
    paddingHorizontal: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#305797",
  },
  daysBadge: {
    backgroundColor: "#305797",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  daysText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
    textAlign: "center",
  },
  heroImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 10,
  },
  heroCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    elevation: 3,
    marginTop: -20,
    marginHorizontal: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e6e9ef",
  },
  heroDescription: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  priceLabel: {
    fontSize: 11,
    color: "#777",
  },
  priceValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#305797",
  },
  priceUnit: {
    fontSize: 11,
    color: "#777",
  },
  availabilityButton: {
    backgroundColor: "#305797",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  availabilityText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 11,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#305797",
    marginTop: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#1f4fa2",
  },
  tabButtonActive: {
    backgroundColor: "#1f4fa2",
  },
  tabText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  sectionBody: {
    padding: 16,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#305797",
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 12,
    color: "#333",
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#305797",
    maxHeight: "92%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#305797",
  },
  modalBody: {
    marginTop: 12,
    maxHeight: "76%",
  },
  modalBodyContent: {
    paddingBottom: 8,
  },
  modalBox: {
    borderWidth: 2,
    borderColor: "#305797",
    borderRadius: 10,
    padding: 10,
  },
  calendarBox: {
    borderWidth: 2,
    borderColor: "#305797",
    borderRadius: 10,
    padding: 10,
    overflow: "hidden",
  },
  calendar: {
    marginTop: 8,
  },
  modalSubTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#305797",
    textAlign: "center",
    marginTop: 12,
  },
  modalParagraph: {
    fontSize: 11,
    color: "#333",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 16,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  primaryButton: {
    backgroundColor: "#305797",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
    minWidth: 110,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  dangerButton: {
    backgroundColor: "#9b2242",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
    minWidth: 110,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 11,
  },
  cardOption: {
    borderWidth: 1,
    borderColor: "#e0e4ea",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f9fafc",
  },
  cardOptionSelected: {
    borderWidth: 2,
    borderColor: "#305797",
    backgroundColor: "#f0f6ff"
  },
  cardOptionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#305797",
  },
  cardOptionText: {
    fontSize: 11,
    color: "#333",
    marginTop: 4,
    lineHeight: 16,
  },
  optionImage: {
    width: "100%",
    height: 110,
    borderRadius: 10,
    marginBottom: 6,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#305797",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#305797",
  },
  travelerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 6,
  },
  travelerLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  travelerSub: {
    fontSize: 10,
    color: "#777",
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  counterButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  counterValue: {
    fontSize: 12,
    fontWeight: "700",
    minWidth: 12,
    textAlign: "center",
  },
  selectRow: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#94a3b8",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxFill: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: "#305797",
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#333",
    textAlign: "left",
  },
  summaryText: {
    fontSize: 12,
    color: "#333",
    marginBottom: 4,
  },
  summaryWarning: {
    fontSize: 10,
    color: "#b91c1c",
    textAlign: "center",
    marginTop: 8,
  },
  termsCard: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  termsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 10,
  },
  termsText: {
    fontSize: 12,
    color: "#333",
    lineHeight: 18,
  },
  uploadPassportIntro: {
    textAlign: "center",
    color: "#555",
    marginBottom: 12,
    fontSize: 12,
  },
  uploadPassportOuter: {
    borderWidth: 2,
    borderColor: "#305797",
    borderRadius: 14,
    borderStyle: "dashed",
    padding: 14,
    marginTop: 6,
  },
  uploadPassportInner: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    borderStyle: "dashed",
    minHeight: 190,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  uploadPassportTitle: {
    marginTop: 12,
    fontSize: 16,
    color: "#222",
    fontWeight: "700",
    textAlign: "center",
  },
  uploadPassportHint: {
    marginTop: 8,
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
  uploadPassportFileName: {
    marginTop: 12,
    fontSize: 12,
    color: "#305797",
    fontWeight: "600",
    textAlign: "center",
  },
  quotationIntro: {
    fontSize: 12,
    color: "#5b6472",
    lineHeight: 18,
    marginBottom: 10,
  },
  quotationRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  quotationHalf: {
    flex: 1,
  },
  quotationLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#305797",
    marginBottom: 6,
  },
  quotationInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    color: "#1f2937",
    backgroundColor: "#fff",
  },
  quotationDropdownTrigger: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quotationDropdownText: {
    color: "#1f2937",
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  quotationDropdownMenu: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    marginTop: 6,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  quotationDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  quotationDropdownItemText: {
    color: "#1f2937",
    fontSize: 12,
  },
  quotationTextArea: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 84,
    color: "#1f2937",
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
  quotationBudgetValues: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  quotationBudgetValue: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "600",
  },
  quotationItineraryCard: {
    backgroundColor: "#eef2f8",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  quotationItineraryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
  },
  quotationItineraryItem: {
    width: "50%",
    paddingRight: 8,
  },
  quotationItineraryDay: {
    fontWeight: "700",
    color: "#305797",
    marginBottom: 2,
  },
  quotationNotesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
    columnGap: 8,
  },
  quotationNotesItem: {
    width: "48%",
  },
  quotationNotesItemFull: {
    width: "100%",
  },
  quotationSectionGap: {
    marginTop: 8,
  },
  approvalCard: {
    alignItems: "center",
    padding: 20,
  },
  approvalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
  },
  approvalText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#305797",
  },
  paymentTitle: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
    marginBottom: 20
  },
  paymentSectionTitle: {
    fontSize: 14,
    fontFamily: "Montserrat_700Bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#305797"
  },
  paymentCardRow: {
    flexDirection: "row",
    gap: 12
  },
  paymentCard: {
    flex: 1,
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "center",
    alignItems: "center",
    elevation: 2
  },
  paymentCardSelected: {
    borderColor: "#305797",
    borderWidth: 2,
    backgroundColor: "#F0F6FF"
  },
  payementCardLogo: {
    width: 140,
    height: 100,
  },
  paymentSumamryCard: {
    marginTop: 30,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F5F8FF",
    borderWidth: 1,
    borderColor: "#305797"
  },
  paymentSummaryTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 14,
    color: "#305797",
    marginBottom: 6
  },
  paymentSummaryAmount: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 22,
    color: "#305797",
    marginBottom: 4
  },
  paymentSummarySubtext: {
    fontFamily: "Roboto_400Regular",
    fontSize: 12,
    color: "#555"
  },
  paymentSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  paymentlabel: {
    fontFamily: "Roboto_400Regular",
    fontSize: 13,
    color: "#3b3b3b"
  },
  paymentValue: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 13,
    color: "#222"
  },
  paymentDivider: {
    height: 1,
    backgroundColor: "DDE3F0",
    marginVertical: 12
  },
  wishlistContainer: {
    paddingHorizontal: 16,
    marginTop: 10
  },
  wishlistButton: {
    backgroundColor: "#305797",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center"
  },
  wishlistButtonText: {
    color: "#fff",
    fontWeight: "semibold"
  },
  recentReviewContainer: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  userReview: {
    fontWeight: "semibold"
  },
  userStarContainer: {
    flexDirection: "row",
    narginVertical: 4
  },
  reviewContainer: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0"
  },
  reviewTitle: {
    fontWeight: "semibold",
    marginBottom: 8
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 10
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: "ddd",
    borderRadius: 8,
    padding: 10,
    height: 80,
    textAlignVertical: "top",
    marginBottom: 10
  },
  reviewButton: {
    backgroundColor: "#305797",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center"
  },
  reviewButtonText: {
    color: "#fff",
    fontWeight: "semibold"
  }
})

export default DestinationStyles