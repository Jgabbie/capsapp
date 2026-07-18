import { StyleSheet } from "react-native";

const WishlistStyle = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 120,
        backgroundColor: "#f9fafb",
        flexGrow: 1
    },
    title: {
        fontSize: 24,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginBottom: 5
    },
    subtitle: {
        fontSize: 13,
        color: "#64748b",
        fontFamily: "Montserrat_400Regular",
        marginBottom: 20
    },

    // --- FILTER BOX (Matches Web) ---
    filterBox: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        marginBottom: 25,
        zIndex: 10
    },
    filterLabel: {
        fontSize: 12,
        fontFamily: "Montserrat_600SemiBold",
        color: "#1e293b",
        marginBottom: 5
    },
    searchBar: {
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#cbd5e1",
        height: 42,
        justifyContent: 'center',
        marginBottom: 15
    },
    searchInput: {
        fontSize: 14,
        color: "#333",
        fontFamily: "Montserrat_400Regular"
    },
    dropdownRow: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    dropdownButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#cbd5e1",
        height: 40,
    },
    dropdownText: {
        fontSize: 12,
        color: "#475569",
        fontFamily: "Montserrat_400Regular",
    },
    dropdownMenu: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 5,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        zIndex: 20,
        width: 140
    },
    dropdownMenuItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },
    dropdownMenuItemText: {
        fontSize: 13,
        color: '#334155',
        fontFamily: 'Montserrat_400Regular'
    },

    // --- SLIDER STYLES ---
    budgetValuesRow: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        paddingHorizontal: 5,
        marginBottom: -5
    },

    // --- PACKAGES HEADER ---
    packagesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 15
    },
    packagesTitle: {
        fontSize: 18,
        fontFamily: "Montserrat_700Bold",
        color: "#1e293b",
    },
    foundText: {
        backgroundColor: "#305797",
        fontSize: 12,
        fontWeight: "600",
        color: "#fff",
        borderRadius: 15,
        padding: 10,
    },

    card: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#d5dbe4",
        marginBottom: 22,
        overflow: "hidden",

        elevation: 4,

        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.12,
        shadowRadius: 5
    },

    cardImageWrapper: {
        position: "relative",
        width: "100%",
        height: 215,
        overflow: "hidden",
        backgroundColor: "#e5e7eb"
    },

    cardImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover"
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
        elevation: 5
    },

    discountRibbonText: {
        color: "#17458a",
        fontSize: 14,
        fontFamily: "Montserrat_700Bold"
    },

    topRemoveButton: {
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
        color: "#ffffff",
        fontSize: 11,
        fontFamily: "Montserrat_700Bold"
    },

    cardContent: {
        paddingTop: 24,
        paddingHorizontal: 18,
        paddingBottom: 24,
        alignItems: "center"
    },

    packageName: {
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

    packagePriceOld: {
        fontSize: 14,
        fontFamily: "Montserrat_600SemiBold",
        color: "#9a9a9a",
        textDecorationLine: "line-through"
    },

    priceText: {
        fontSize: 27,
        lineHeight: 33,
        fontFamily: "Montserrat_700Bold",
        color: "#244d89"
    },

    priceCaption: {
        fontSize: 12,
        lineHeight: 18,
        color: "#8a8f99",
        fontFamily: "Montserrat_400Regular",
        marginTop: 2,
        textAlign: "center"
    },

    packageMetaRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
        marginBottom: 18
    },

    packageMetaText: {
        fontSize: 12,
        color: "#626262",
        fontFamily: "Montserrat_600SemiBold",
        textTransform: "uppercase"
    },

    packageMetaDot: {
        marginHorizontal: 9,
        fontSize: 14,
        color: "#6b7280"
    },

    packageStatsRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        marginBottom: 24
    },

    slotsPill: {
        flex: 1,
        minHeight: 46,
        backgroundColor: "#315d9f",
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 14,

        elevation: 3,

        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowOpacity: 0.15,
        shadowRadius: 5
    },

    slotsPillText: {
        color: "#ffffff",
        fontSize: 13,
        fontFamily: "Montserrat_700Bold",
        textAlign: "center"
    },

    ratingPill: {
        minWidth: 100,
        minHeight: 46,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#ffffff",
        borderRadius: 24,
        paddingHorizontal: 16,

        elevation: 4,

        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowOpacity: 0.12,
        shadowRadius: 6
    },

    ratingPillText: {
        color: "#3f3f3f",
        fontSize: 13,
        fontFamily: "Montserrat_700Bold"
    },

    cardButtonRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "stretch",
        gap: 10
    },

    viewDetailsButton: {
        flex: 1,
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#315d9f",
        paddingHorizontal: 14,
        paddingVertical: 13
    },

    viewDetailsButtonText: {
        color: "#ffffff",
        fontSize: 12,
        fontFamily: "Montserrat_700Bold"
    },

    removeButton: {
        width: 115,
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        backgroundColor: "#a32345",
        paddingHorizontal: 10,
        paddingVertical: 13
    },

    removeButtonText: {
        color: "#ffffff",
        fontSize: 12,
        fontFamily: "Montserrat_700Bold"
    },

    // --- EMPTY STATE ---
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    emptyStateImage: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
        opacity: 0.5,
        marginBottom: 15
    },
    emptyStateText: {
        fontSize: 15,
        color: '#94a3b8',
        fontFamily: 'Montserrat_500Medium'
    }
});

export default WishlistStyle;