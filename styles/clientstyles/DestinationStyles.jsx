import { StyleSheet } from "react-native";

const DestinationStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#305797',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },

  backText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontFamily: "Montserrat_600SemiBold",
  },







  heroBanner: {
    height: 190,
    marginHorizontal: -20,
    marginTop: -20,
    marginBottom: 20,
    overflow: 'hidden'
  },

  heroBannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  },

  heroBannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.52)',
    paddingHorizontal: 24
  },

  heroBannerTitle: {
    fontSize: 24,
    fontFamily: "Montserrat_700Bold",
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8
  },

  heroBannerSubtitle: {
    fontSize: 14,
    fontFamily: "Montserrat_500Medium",
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20
  },

  heroTitle: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 22,
    color: "#305797",
    textAlign: "center",
    marginTop: 10
  },

  heroSubtitle: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    fontFamily: "Montserrat_600SemiBold",
    marginTop: 4,
    marginBottom: 16
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16
  },

  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 20,
    borderColor: "#dbe3ef",
    borderWidth: 1,
    fontFamily: "Montserrat_500Medium",
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    height: 42,
    fontFamily: 'Montserrat_400Regular',
  },

  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#305797",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    height: 40
  },

  filterButtonText: {
    color: "#fff",
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 12,
    marginLeft: 6
  },

  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    alignItems: 'baseline',
    marginBottom: 15,
    marginTop: 5
  },

  resultsTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    color: "#1e293b"
  },

  resultsCount: {
    backgroundColor: "#305797",
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    color: "#fff",
    borderRadius: 15,
    padding: 10,
  },

  packageCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#d5dbe4",

    elevation: 4,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.12,
    shadowRadius: 5
  },

  packageImageWrapper: {
    position: "relative",
    width: "100%",
    height: 215,
    overflow: "hidden",
    backgroundColor: "#e5e7eb"
  },

  packageImage: {
    width: "100%",
    height: "100%"
  },

  discountRibbon: {
    position: "absolute",
    top: 17,
    left: -45,
    width: 155,
    height: 34,
    backgroundColor: "#ffd400",
    alignItems: "center",
    justifyContent: "center",
    transform: [
      {
        rotate: "-45deg"
      }
    ],
    elevation: 4
  },

  discountRibbonText: {
    color: "#17458a",
    fontSize: 14,
    fontFamily: "Montserrat_700Bold",
    letterSpacing: 0.2
  },

  wishlistCircleButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",

    elevation: 5,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.16,
    shadowRadius: 4
  },

  imageAvailabilityBadge: {
    position: "absolute",
    left: 15,
    bottom: 14,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 18,
    elevation: 3
  },

  imageAvailabilityText: {
    fontSize: 11,
    fontFamily: "Montserrat_700Bold"
  },

  packageContent: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: "center"
  },

  packageTitle: {
    width: "100%",
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "Montserrat_700Bold",
    color: "#111827",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 22
  },

  priceDisplayRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 9
  },

  packagePrice: {
    fontSize: 27,
    lineHeight: 33,
    fontFamily: "Montserrat_700Bold",
    color: "#244d89"
  },

  packagePriceOld: {
    fontSize: 14,
    fontFamily: "Montserrat_600SemiBold",
    color: "#9a9a9a",
    textDecorationLine: "line-through"
  },

  priceCaption: {
    fontSize: 12,
    lineHeight: 18,
    color: "#8a8f99",
    fontFamily: "Montserrat_400Regular",
    marginTop: 2,
    textAlign: "center"
  },

  travelerPriceText: {
    fontSize: 11,
    color: "#6b7280",
    fontFamily: "Montserrat_400Regular",
    marginTop: 4,
    textAlign: "center"
  },

  packageMetaRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 17
  },

  packageMetaText: {
    fontSize: 12,
    color: "#626262",
    fontFamily: "Montserrat_600SemiBold",
    textTransform: "capitalize"
  },

  packageMetaDot: {
    marginHorizontal: 9,
    fontSize: 14,
    color: "#6b7280"
  },

  packageTagsRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 7,
    marginBottom: 18
  },

  tagPill: {
    backgroundColor: "#edf2fb",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18
  },

  tagText: {
    fontSize: 10,
    color: "#244d89",
    fontFamily: "Montserrat_600SemiBold"
  },

  packageStatsRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginBottom: 20
  },

  packageStatPill: {
    flex: 1,
    maxWidth: 145,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#315d9f",
    borderRadius: 24,
    paddingHorizontal: 15,

    elevation: 3,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.12,
    shadowRadius: 3
  },

  packageStatText: {
    color: "#ffffff",
    fontSize: 13,
    fontFamily: "Montserrat_700Bold"
  },

  viewDetailsButton: {
    minWidth: 170,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: "#315d9f",
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 0
  },

  viewDetailsButtonDisabled: {
    backgroundColor: "#9ca3af",
    opacity: 0.8
  },

  viewDetailsText: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Montserrat_700Bold"
  },

  detailsContainer: {
    flex: 1,
    backgroundColor: "#f5f7fa"
  },

  detailsHeader: {
    paddingHorizontal: 16,
    paddingTop: 10
  },

  titleRowHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  detailsTitle: {
    fontSize: 24,
    fontFamily: "Montserrat_700Bold",
    color: "#305797",
  },

  subtitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12
  },

  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#305797',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 9,
  },

  durationText: {
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
    color: '#FFFFFF',
  },

  averageRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#305797',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 9,
  },

  ratingContent: {
    justifyContent: 'center',
  },

  ratingValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  averageRatingValue: {
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
    color: '#FFFFFF',
  },

  averageRatingMaximum: {
    marginLeft: 3,
    fontSize: 12,
    fontFamily: "Montserrat_700Bold",
    color: '#FFFFFF',
  },

  averageRatingText: {
    marginTop: 1,
    fontSize: 12,
    fontFamily: "Montserrat_700Bold",
    color: '#FFFFFF',
  },






  carouselContainer: {
    width: "100%",
    height: 200,
    position: 'relative',
    marginTop: 5
  },

  heroImage: {
    height: 200,
    borderRadius: 12
  },

  carouselDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    gap: 6
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)'
  },

  activeDot: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5
  },

  heroCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    elevation: 2,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },

  packageDetailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16
  },

  packageDetailItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f7f9fc',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6e8ee'
  },

  packageDetailLabel: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4
  },

  packageDetailValue: {
    fontSize: 13,
    color: '#1f2a44',
    fontFamily: "Montserrat_700Bold",
  },

  heroDescription: {
    textAlign: "justify",
    fontFamily: "Montserrat_400Regular",
    fontSize: 12,
    color: "#374151",
    lineHeight: 20,
    marginTop: 15,
  },

  priceCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    elevation: 2,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },

  priceLabel: {
    fontSize: 12,
    fontFamily: "Montserrat_700Bold",
    color: "#6b7280",
    marginBottom: 8,
    letterSpacing: 0.5
  },

  priceValue: {
    fontSize: 28,
    fontFamily: "Montserrat_700Bold",
    color: "#305797"
  },

  priceRowDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },

  priceUnit: {
    fontSize: 13,
    fontFamily: "Montserrat_500Medium",
    color: "#6b7280"
  },

  slotsValue: {
    fontSize: 14,
    fontFamily: "Montserrat_700Bold",
    color: "#1f2a44"
  },

  availabilityButton: {
    backgroundColor: "#305797",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15
  },

  availabilityText: {
    fontFamily: "Montserrat_600SemiBold",
    color: "#fff",
    fontSize: 14
  },

  policyDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginTop: 18,
    marginBottom: 14
  },

  cancellationPolicyBox: {
    backgroundColor: '#fff'
  },

  cancellationPolicyTitle: {
    fontSize: 14,
    fontFamily: "Montserrat_700Bold",
    color: '#6b7280',
    marginBottom: 8,
    letterSpacing: 0.5
  },

  cancellationPolicyText: {
    textAlign: 'justify',
    fontFamily: "Montserrat_400Regular",
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20
  },

  tabRow: {
    flexDirection: "row",
    backgroundColor: "#305797",
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden'
  },

  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center"
  },

  tabButtonActive: {
    backgroundColor: "#fff"
  },

  tabText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Montserrat_600SemiBold",
    textAlign: 'center'
  },

  tabTextActive: {
    color: "#305797",
    fontFamily: "Montserrat_700Bold",
    fontSize: 10
  },

  sectionBody: {
    padding: 16,
    paddingBottom: 120,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderTopWidth: 0
  },

  sectionPill: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#305797",
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 12,
    marginTop: 12,
    gap: 6
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
    color: "#ffffff",
    textAlign: "center",
  },

  tabItemRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
    width: '100%',
    paddingRight: 15
  },

  tabItemDot: {
    marginRight: 8,
    color: '#333',
    fontSize: 14,
    lineHeight: 20
  },

  sectionText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Montserrat_500Medium",
    color: "#374151",
    lineHeight: 20
  },

  packageDetailsHeading: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
    color: "#305797",
    marginBottom: 15
  },

  discountTextOnly: {
    color: "#cf1322",
    fontFamily: "Montserrat_700Bold",
    fontSize: 14,
    marginLeft: 8
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end"
  },

  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 50,
    maxHeight: "90%"
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },

  modalTitle: {
    fontSize: 12,
    fontFamily: "Montserrat_700Bold",
    color: "#305797"
  },

  primaryButton: {
    backgroundColor: "#305797",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: '100%'
  },

  primaryText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: 'Montserrat_700Bold'
  },

  wishlistContainer: {
    paddingHorizontal: 5,
    marginTop: 12
  },

  wishlistButton: {
    backgroundColor: "#305797",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: '#305797'
  },

  wishlistButtonText: {
    color: "#fff",
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 13
  },

  recentReviewContainer: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },

  userReview: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 14,
    color: "#305797",
    marginBottom: 2
  },

  userStarContainer: {
    flexDirection: "row",
    marginTop: 2
  },

  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },

  reviewProfileImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#e6e9ef'
  },

  reviewHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },

  reviewContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },

  reviewTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
    color: "#1f2937",
    marginBottom: 12
  },

  starsContainer: {
    flexDirection: "row",
    marginBottom: 16
  },

  reviewInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 16,
    backgroundColor: "#f9fafb"
  },

  reviewButton: {
    backgroundColor: "#305797",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center"
  },

  reviewButtonText: {
    color: "#fff",
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14
  },


  filterLabel: {
    fontSize: 14,
    fontFamily: "Montserrat_700Bold",
    color: "#333",
    marginBottom: 10
  },

  filterPillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },

  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f2f5",
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },

  filterPillSelected: {
    backgroundColor: "#e6f4ff",
    borderColor: "#305797"
  },

  filterPillText: {
    fontSize: 13,
    color: "#555",
    fontFamily: "Montserrat_500Medium",
  },

  budgetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  budgetInputBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    color: '#333',
    fontSize: 14,
    fontFamily: "Montserrat_500Medium",
  },

  budgetInputText: {
    marginHorizontal: 15,
    color: '#555',
    fontSize: 14,
    fontFamily: "Montserrat_500Medium",
  },

  daysInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    fontFamily: "Montserrat_500Medium",
  },

  daysInputBox: {
    flex: 0.8,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    color: '#333',
    fontSize: 14
  },

  daysMaxText: {
    flex: 0.2,
    color: '#305797',
    fontSize: 12,
    fontFamily: "Montserrat_600SemiBold",
    textAlign: 'center',
    marginLeft: 10
  },

  filterSubtext: {
    fontSize: 11,
    color: '#777',
    marginTop: 6,
    marginBottom: 10,
    paddingHorizontal: 5,
    fontFamily: "Montserrat_500Medium",
  },

  arrangementModalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20, width: '92%',
    maxHeight: '85%',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },

  arrangementOptionCard: {
    borderWidth: 1,
    borderColor: "#e0e4ea",
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    backgroundColor: "#fff"
  },

  arrangementOptionCardSelected: {
    borderColor: "#305797",
    borderWidth: 2,
    backgroundColor: "#f4f8ff"
  },

  arrangementImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover'
  },

  arrangementTextContainer: {
    padding: 12
  },

  arrangementTitleText: {
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
    color: '#305797',
    marginBottom: 6
  },

  arrangementDesc: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
    textAlign: "justify",
    color: '#555',
    lineHeight: 18
  },

  arrangementNote: {
    fontSize: 11,
    color: '#cf1322',
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 16
  },

  proceedButton: {
    backgroundColor: "#305797",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10
  },

  proceedButtonText: {
    color: "#fff",
    fontFamily: "Montserrat_700Bold",
    fontSize: 14
  },

  cancelArrangementButton: {
    backgroundColor: "#d32f2f",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10
  },

  cancelArrangementText: {
    color: "#ffffff",
    fontFamily: "Montserrat_700Bold",
    fontSize: 14
  },

  dateSelectionModalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: '95%',
    height: '85%', //  CHANGED: Fixed height instead of maxHeight so it NEVER shrinks!
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },

  dateCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    position: 'relative'
  },

  dateCardSelected: {
    borderColor: "#305797",
    borderWidth: 2,
    backgroundColor: "#f4f8ff"
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },

  dateText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
    fontFamily: "Montserrat_500Medium",
  },

  priceRowDate: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  priceTextDate: {
    fontSize: 14,
    fontFamily: "Montserrat_700Bold",
    color: "#305797"
  },

  slotsBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },

  slotsBadgeText: {
    fontSize: 11,
    color: "#475569",
    fontFamily: "Montserrat_600SemiBold",
  },

  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#e6f4ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },

  selectedBadgeText: {
    color: '#1677ff',
    fontSize: 10,
    fontFamily: "Montserrat_700Bold",
  },

  selectionFooter: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 15
  },

  selectionFooterText: {
    fontSize: 13,
    fontFamily: "Montserrat_600SemiBold",
    color: '#333',
    marginBottom: 15
  },

  selectionFooterButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10
  },

  dateProceedButton: {
    backgroundColor: "#305797",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },

  dateProceedButtonDisabled: {
    backgroundColor: "#94a3b8"
  },

  dateProceedText: {
    color: "#fff",
    fontFamily: "Montserrat_700Bold",
  },

  dateCancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#d32f2f'
  },

  dateCancelText: {
    color: "#fff",
    fontFamily: "Montserrat_700Bold",
  },

  breakdownCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    overflow: 'hidden'
  },

  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center'
  },

  breakdownLabel: {
    fontSize: 11,
    color: '#777',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 4
  },

  breakdownAvgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 10
  },

  breakdownAvgText: {
    fontSize: 18,
    fontFamily: 'Montserrat_500Medium',
    color: '#305797',
    marginRight: 10,
    textAlignVertical: 'center'
  },

  starsContainerLarge: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  breakdownCount: {
    fontSize: 12,
    color: '#777',
    fontFamily: 'Montserrat_400Regular'
  },

  breakdownBody: {
    padding: 16
  },

  breakdownBodyTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_700Bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center'
  },

  breakdownBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },

  breakdownStarLabel: {
    width: 45,
    fontSize: 12,
    color: '#305797',
    fontFamily: 'Montserrat_600SemiBold'
  },

  breakdownBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden'
  },

  breakdownBarFill: {
    height: '100%',
    backgroundColor: '#facc15',
    borderRadius: 4
  },

  breakdownCountLabel: {
    width: 20,
    fontSize: 12,
    color: '#777',
    textAlign: 'right',
    fontFamily: 'Montserrat_400Regular'
  },

  resetButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },

  resetText: {
    color: '#475569',
    fontSize: 14,
    fontFamily: 'Montserrat_700Bold'
  },
  //  NEW VISA MODAL STYLES 
  visaModalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: '90%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  visaModalCloseBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
  },
  visaModalTitle: {
    fontSize: 22,
    fontFamily: "Montserrat_700Bold",
    color: "#305797",
    marginBottom: 12,
    textAlign: 'center',
    marginTop: 15
  },
  visaModalText: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    fontFamily: "Montserrat_400Regular"
  },
  visaButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12
  },
  visaPrimaryButton: {
    flex: 1,
    backgroundColor: "#305797",
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: 'center'
  },
  visaButtonText: {
    color: "#fff",
    fontFamily: "Montserrat_700Bold",
    fontSize: 13,
    textAlign: 'center'
  },
  //  NEW DATE FILTER STYLES 
  dateFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', //  NEW: Pushes items to edges cleanly
    marginBottom: 15,
    gap: 6 //  CHANGED: Tighter gap, and REMOVED flexWrap to force one row!
  },
  dateSearchContainer: {
    flex: 1, //  CHANGED: Removed minWidth so it naturally squishes to fit
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 38,
    backgroundColor: '#f8fafc'
  },
  dateSearchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Montserrat_500Medium",
    color: '#333',
    height: '100%',
    padding: 0
  },
  dateClearSearchBtn: {
    padding: 4
  },
  dateToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2 //  CHANGED: Tighter gap between the switch and text
  },
  dateToggleText: {
    fontSize: 11, //  CHANGED: Slightly smaller to fit in the single row
    color: '#475569',
    fontFamily: "Montserrat_500Medium",
  },
  dateClearFiltersBtn: {
    backgroundColor: '#305797',
    paddingHorizontal: 10, //  CHANGED: Smaller padding to save space
    paddingVertical: 10,
    borderRadius: 6,
    justifyContent: 'center'
  },
  dateClearFiltersText: {
    fontFamily: 'Montserrat_600SemiBold',
    color: '#fff',
    fontSize: 12,
  },
});

export default DestinationStyles;