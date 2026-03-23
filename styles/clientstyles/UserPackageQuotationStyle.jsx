import { StyleSheet, Platform } from "react-native";

const UserPackageQuotationStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontFamily: "Montserrat_700Bold",
    color: "#305797",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    fontFamily: "Roboto_400Regular",
    marginBottom: 20,
  },
  
  // --- Search & Filter ---
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
    fontFamily: "Roboto_400Regular",
  },
  dropdownButton: {
    width: 48,
    height: 48,
    backgroundColor: "#f0f4f8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    justifyContent: "center",
    alignItems: "center",
  },

  // --- Quote Cards ---
  quoteCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  quoteRef: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 14,
    color: "#777",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 11,
  },
  
  // --- Card Body ---
  cardBody: {
    marginBottom: 15,
  },
  packageName: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
    color: "#305797",
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontFamily: "Roboto_400Regular",
    color: "#666",
    fontSize: 13,
  },
  detailValue: {
    fontFamily: "Roboto_500Medium",
    color: "#333",
    fontSize: 13,
  },

  // --- Actions & Empty States ---
  viewButton: {
    backgroundColor: "#305797",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Montserrat_700Bold",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    marginTop: 10,
    color: "#999",
    fontSize: 15,
    fontFamily: "Roboto_400Regular",
  },
});

export default UserPackageQuotationStyle;