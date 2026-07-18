import { StyleSheet, Platform } from "react-native";

const VisaGuidanceStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fa"
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40
    },
    // NEW HERO BANNER STYLES (Added without changing anything else)
    heroSection: {
        height: 200,
        marginHorizontal: -20, // Stretches it to the edges ignoring the 20px padding
        marginTop: -20,        // Pushes it to the very top
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    heroTitleText: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 24,
        color: "#fff",
        marginBottom: 8,
        textAlign: 'center',
        zIndex: 1,
    },
    heroSubText: {
        fontFamily: "Montserrat_400Regular",
        fontSize: 13,
        color: "#fff",
        textAlign: 'center',
        lineHeight: 20,
        zIndex: 1,
    },
    headerContainer: {
        marginBottom: 16,
        marginTop: 10,
    },
    title: {
        fontSize: 22,
        fontFamily: "Montserrat_700Bold",
        color: "#305797",
        marginBottom: 6
    },
    subtitle: {
        fontSize: 14,
        fontFamily: "Montserrat_400Regular",
        color: "#6b7280",
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: 24,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontFamily: "Montserrat_400Regular",
        fontSize: 15,
        color: '#1f2937',
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        marginBottom: 22,
        borderWidth: 1,
        borderColor: "#d8dce3",
        overflow: "hidden",

        ...Platform.select({
            ios: {
                shadowColor: "#000000",
                shadowOffset: {
                    width: 0,
                    height: 3
                },
                shadowOpacity: 0.14,
                shadowRadius: 7
            },
            android: {
                elevation: 4
            }
        })
    },

    cardImage: {
        width: "100%",
        height: 245,
        backgroundColor: "#eef2f7"
    },

    cardImagePlaceholder: {
        width: "100%",
        height: 245,
        backgroundColor: "#eef2f7",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
    },

    cardImagePlaceholderText: {
        fontFamily: "Montserrat_400Regular",
        fontSize: 13,
        color: "#64748b"
    },

    cardContent: {
        paddingHorizontal: 28,
        paddingTop: 24,
        paddingBottom: 25,
        alignItems: "center"
    },

    visaTitle: {
        width: "100%",
        minHeight: 48,
        fontSize: 19,
        lineHeight: 24,
        fontFamily: "Montserrat_700Bold",
        color: "#202124",
        textAlign: "center",
        textTransform: "uppercase",
        marginBottom: 19
    },

    description: {
        width: "100%",
        minHeight: 78,
        fontSize: 14,
        lineHeight: 24,
        color: "#69758f",
        fontFamily: "Montserrat_400Regular",
        textAlign: "center",
        marginBottom: 13
    },

    price: {
        fontSize: 28,
        lineHeight: 34,
        fontFamily: "Montserrat_700Bold",
        color: "#244d89",
        textAlign: "center"
    },

    priceCaption: {
        fontSize: 12,
        lineHeight: 18,
        color: "#8a8f99",
        fontFamily: "Montserrat_400Regular",
        textAlign: "center",
        marginTop: 2
    },

    serviceTypeText: {
        fontSize: 12,
        color: "#666666",
        fontFamily: "Montserrat_600SemiBold",
        textAlign: "center",
        marginTop: 16,
        marginBottom: 27
    },

    applyButton: {
        minWidth: 175,
        minHeight: 49,
        backgroundColor: "#315d9f",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        paddingHorizontal: 21,
        paddingVertical: 13
    },

    applyButtonText: {
        color: "#ffffff",
        fontSize: 14,
        fontFamily: "Montserrat_700Bold"
    },
    emptyText: {
        textAlign: 'center',
        color: '#6b7280',
        fontFamily: "Montserrat_400Regular",
        marginTop: 40,
        fontSize: 16
    }
});

export default VisaGuidanceStyle;