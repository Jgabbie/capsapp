import { StyleSheet, Platform, Dimensions } from "react-native";

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#f5f7fa", // Web-like background
  },
  title: {
    fontSize: 22,
    fontFamily: "Montserrat_700Bold",
    color: "#305797",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    fontFamily: "Roboto_400Regular",
    marginBottom: 20,
  },

  // --- Search & Filter ---
  filterSection: {
    marginBottom: 24,
    gap: 12,
  },
  // NEW: Wrapper to hold the buttons evenly
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%'
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: "Montserrat_600SemiBold",
    color: "#1e293b",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#d9d9d9",
    height: 42,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: "#333",
    fontFamily: "Roboto_400Regular",
  },
  dropdownGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#d9d9d9",
    height: 42,
  },
  dropdownText: {
    fontFamily: "Roboto_400Regular",
    fontSize: 10,
    color: "#333",
  },
  clearFilterBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Quote Cards ---
  quoteCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 12,
    marginBottom: 12,
  },
  quoteRef: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 13,
    color: "#305797",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 11,
  },

  // --- Card Body ---
  cardBody: {
    marginBottom: 15,
  },
  packageName: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
    color: "#333",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  detailLabel: {
    fontFamily: "Montserrat_600SemiBold",
    color: "#6b7280",
    fontSize: 12,
  },
  detailValue: {
    fontFamily: "Roboto_400Regular",
    color: "#1f2937",
    fontSize: 12,
  },

  // --- Actions & Empty States ---
  viewButton: {
    flexDirection: 'row',
    backgroundColor: "#305797",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 10,
    opacity: 0.8,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 15,
    fontFamily: "Roboto_400Regular",
  },


  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: width > 500 ? 400 : '95%',
    maxWidth: 400,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  modalTitleText: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    color: '#305797',
  },
  tagContainer: {
    flexDirection: 'column',
  },
  modalStatusTag: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  modalStatusTagSelected: {
    backgroundColor: '#f8faff',
  },
  modalStatusText: {
    color: '#333',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    textAlign: 'center'
  },
  modalStatusTextSelected: {
    color: '#305797',
    fontFamily: 'Montserrat_600SemiBold',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlotButton: {
    flexBasis: '30%',
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  timeSlotButtonSelected: {
    borderColor: '#305797',
    backgroundColor: '#f8faff',
  },
  timeSlotText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'Roboto_400Regular',
  },
  timeSlotTextSelected: {
    color: '#305797',
    fontFamily: 'Montserrat_600SemiBold',
  },


  modalCard: {
    width: '92%',
    maxWidth: 430,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8
    },
    shadowOpacity: 0.18,
    shadowRadius: 16
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },

  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#edf3fc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },

  titleModal: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 17,
    color: '#1e293b'
  },

  subtitleModal: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
    color: '#64748b',
    marginTop: 3
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center'
  },

  calendar: {
    borderWidth: 1,
    borderColor: '#e8edf4',
    borderRadius: 18,
    paddingBottom: 6,
    overflow: 'hidden'
  },

  arrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#edf3fc',
    justifyContent: 'center',
    alignItems: 'center'
  },

  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f5fc',
    borderWidth: 1,
    borderColor: '#dce7f7',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 14
  },

  selectedDateIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },

  selectedDateLabel: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 11,
    color: '#64748b'
  },

  selectedDateValue: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
    color: '#305797',
    marginTop: 1
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16
  },

  cancelButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#d8dee8',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center'
  },

  cancelText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13,
    color: '#64748b'
  },

  confirmButton: {
    flex: 1.4,
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: '#305797',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    elevation: 2
  },

  confirmText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13,
    color: '#ffffff'
  }
});