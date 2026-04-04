import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Linking,
  Platform,
} from "react-native";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";
import { generateBookingInvoicePdf } from "../../utils/bookingInvoicePdf";

export default function QuotationCheckout({ route, navigation }) {
  const { user } = useUser();
  const [quotation, setQuotation] = useState(route?.params?.quotation || null);
  const prefilledRegistration = route?.params?.prefilledRegistration;
  const startStep = route?.params?.startStep;

  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [step, setStep] = useState(startStep === "invoice" ? "invoice" : "registration");
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [processing, setProcessing] = useState(false);
  const [invoicePdfUrl, setInvoicePdfUrl] = useState("");
  const [hasHandledPaymentCallback, setHasHandledPaymentCallback] = useState(false);
  const [registration, setRegistration] = useState({
    fullName: prefilledRegistration?.fullName || "",
    email: prefilledRegistration?.email || "",
    phone: prefilledRegistration?.phone || "",
  });

  const callbackParams = useMemo(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      return { status: "", checkoutToken: "", quotationId: "" };
    }

    const search = new URLSearchParams(window.location.search || "");
    return {
      status: search.get("booking") || "",
      checkoutToken: search.get("checkoutToken") || "",
      quotationId: search.get("quotationId") || "",
    };
  }, []);

  const totalPrice = useMemo(() => {
    const fromTravelDetails = Number(quotation?.travelDetails?.budgetRange?.[1] || 0);
    return fromTravelDetails > 0 ? fromTravelDetails : 29000;
  }, [quotation]);

  const invoiceData = useMemo(() => {
    const travelers = Number(quotation?.travelDetails?.travelers || 1);
    const safeTravelers = travelers > 0 ? travelers : 1;
    const subtotal = totalPrice;
    const tax = subtotal * 0.12;
    const totalWithTax = subtotal + tax;
    const itemRate = subtotal / safeTravelers;
    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(issueDate.getDate() + 14);

    return {
      company: {
        name: "M&RC Travel and Tours",
        address: "Paranaque City, Metro Manila, Philippines",
        email: "info@mrc-travel.com",
        phone: "+63 2 555 1234",
      },
      invoice: {
        number: `INV-${String(quotation?._id || "").slice(-8).toUpperCase() || "00000000"}`,
        issueDate: issueDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        dueDate: dueDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        status: "Unpaid",
      },
      customer: {
        name: registration.fullName || user?.username || "Customer",
        email: registration.email || "N/A",
        phone: registration.phone || "N/A",
      },
      booking: {
        reference: quotation?.reference || "N/A",
        packageName: quotation?.packageName || "N/A",
        travelDates: quotation?.travelDetails?.travelDate || "TBD",
        travelers: safeTravelers,
      },
      items: [
        {
          description: "Tour Package",
          qty: safeTravelers,
          rate: itemRate,
          amount: subtotal,
        },
      ],
      subtotal,
      tax,
      totalWithTax,
    };
  }, [quotation, registration, totalPrice, user?.username]);

  const formatCurrency = (value) => `PHP ${Number(value || 0).toFixed(2)}`;

  const showMessage = (title, body) => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.alert(`${title}\n\n${body}`);
      return;
    }
    Alert.alert(title, body);
  };

  useEffect(() => {
    if (step !== "invoice") return;

    try {
      const { blob, dataUri } = generateBookingInvoicePdf(invoiceData);
      if (Platform.OS === "web") {
        const objectUrl = URL.createObjectURL(blob);
        setInvoicePdfUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      }
      setInvoicePdfUrl(dataUri);
    } catch (_error) {
      setInvoicePdfUrl("");
    }
  }, [step, invoiceData]);

  useEffect(() => {
    const fallbackQuotationId = route?.params?.quotationId;
    const targetQuotationId = quotation?._id || fallbackQuotationId || callbackParams.quotationId;

    if (quotation || !targetQuotationId || !user?._id) return;

    const fetchQuotationFromId = async () => {
      try {
        const response = await api.get(
          `/quotation/get-quotation/${targetQuotationId}`,
          withUserHeader(user._id)
        );
        setQuotation(response.data);
      } catch (_error) {
        setQuotation(null);
      }
    };

    fetchQuotationFromId();
  }, [route?.params?.quotationId, callbackParams.quotationId, quotation, user?._id]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!callbackParams.status || hasHandledPaymentCallback) return;

    if (callbackParams.status === "cancel") {
      setHasHandledPaymentCallback(true);
      showMessage("Payment cancelled", "Your payment was cancelled.");
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/quotationcheckout");
      }
      return;
    }

    if (callbackParams.status !== "success") return;
    if (!callbackParams.checkoutToken) return;
    if (!quotation) return;

    const actingUserId = user?._id || quotation?.userId;
    if (!actingUserId) return;

    const finalizeAfterSuccess = async () => {
      try {
        setProcessing(true);

        const bookingDetails = {
          packageName: quotation.packageName,
          travelers: Number(quotation?.travelDetails?.travelers || 1),
          travelDate: quotation?.travelDetails?.travelDate || "TBD",
          totalPrice,
          preferredAirlines: quotation?.travelDetails?.preferredAirlines || "",
          preferredHotels: quotation?.travelDetails?.preferredHotels || "",
          fullName: registration.fullName || user?.username || "",
          email: registration.email || "",
          phone: registration.phone || "",
        };

        const bookingRes = await api.post(
          "/booking/create-booking",
          {
            packageId: quotation.packageId || quotation._id,
            // UPDATED SCHEMA FIX: Placed travelers and travelDate at the ROOT level
            travelers: Number(quotation?.travelDetails?.travelers || 1),
            travelDate: quotation?.travelDetails?.travelDate || "TBD",
            bookingDetails,
            checkoutToken: callbackParams.checkoutToken,
          },
          withUserHeader(actingUserId)
        );

        const bookingId = bookingRes.data?._id;
        if (bookingId) {
          await api.post(
            "/transaction/create-transaction",
            {
              bookingId,
              amount: totalPrice,
              method: paymentMethod || "gcash",
              status: "Paid",
              packageName: quotation.packageName,
            },
            withUserHeader(actingUserId)
          );
        }

        await api.put(
          `/quotation/${quotation._id}`,
          { status: "Approved" },
          withUserHeader(actingUserId)
        );

        setHasHandledPaymentCallback(true);
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", "/quotationcheckout");
        }
        showMessage("Payment successful", "Booking confirmed and added to My Bookings.");
        navigation.replace("userbookings");
      } catch (error) {
        setHasHandledPaymentCallback(true);
        showMessage("Payment received", error.response?.data?.message || "Payment returned, but booking confirmation failed. Please contact support.");
      } finally {
        setProcessing(false);
      }
    };

    finalizeAfterSuccess();
  }, [
    callbackParams.checkoutToken,
    callbackParams.status,
    hasHandledPaymentCallback,
    navigation,
    paymentMethod,
    quotation,
    registration.email,
    registration.fullName,
    registration.phone,
    totalPrice,
    user?._id,
    user?.username,
  ]);

  if (!quotation) {
    return (
      <View style={styles.centered}>
        <Text style={styles.meta}>Loading quotation...</Text>
      </View>
    );
  }

  const finalizeBooking = async () => {
    const actingUserId = user?._id || quotation?.userId;
    if (!actingUserId) {
      showMessage("Login required", "Please login first.");
      return;
    }

    setProcessing(true);

    try {
      const tokenRes = await api.post(
        "/payment/create-checkout-token",
        { totalPrice },
        withUserHeader(actingUserId)
      );
      const checkoutToken = tokenRes.data?.token;

      const webOrigin =
        Platform.OS === "web" && typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:8081";
      const successUrl = `${webOrigin}/quotationcheckout?quotationId=${quotation?._id || ""}&booking=success&checkoutToken=${encodeURIComponent(checkoutToken || "")}`;
      const cancelUrl = `${webOrigin}/quotationcheckout?quotationId=${quotation?._id || ""}&booking=cancel`;

      const sessionRes = await api.post(
        "/payment/create-checkout-session",
        {
          checkoutToken,
          totalPrice,
          packageName: quotation.packageName,
          travelersCount: quotation.travelDetails?.travelers || 1,
          successUrl,
          cancelUrl,
        },
        withUserHeader(actingUserId)
      );

      const checkoutUrl = sessionRes.data?.data?.attributes?.checkout_url;
      if (!checkoutUrl) {
        setProcessing(false);
        showMessage("Error", "Unable to redirect to PayMongo checkout.");
        return;
      }

      if (Platform.OS === "web") {
        window.location.href = checkoutUrl;
        return;
      }

      await Linking.openURL(checkoutUrl);
      setProcessing(false);
    } catch (error) {
      setProcessing(false);
      showMessage("Error", error.response?.data?.message || "Unable to proceed to payment");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header openSidebar={() => setSidebarVisible(true)} />
      <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Quotation Booking Checkout</Text>
        <Text style={styles.meta}>Reference: {quotation.reference}</Text>
        <Text style={styles.meta}>Package: {quotation.packageName}</Text>

        {step === "registration" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Booking Registration</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={registration.fullName}
              onChangeText={(value) => setRegistration((prev) => ({ ...prev, fullName: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={registration.email}
              onChangeText={(value) => setRegistration((prev) => ({ ...prev, email: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              keyboardType="phone-pad"
              value={registration.phone}
              onChangeText={(value) => setRegistration((prev) => ({ ...prev, phone: value }))}
            />
          </View>
        )}

        {step === "invoice" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Booking Invoice</Text>

            <View style={styles.invoiceHeader}>
              <View>
                <Text style={styles.invoiceBrand}>{invoiceData.company.name}</Text>
                <Text style={styles.meta}>{invoiceData.company.address}</Text>
                <Text style={styles.meta}>{invoiceData.company.email}</Text>
                <Text style={styles.meta}>{invoiceData.company.phone}</Text>
              </View>
              <View>
                <Text style={styles.invoiceTitle}>Booking Invoice</Text>
                <Text style={styles.meta}>Invoice #: {invoiceData.invoice.number}</Text>
                <Text style={styles.meta}>Issue Date: {invoiceData.invoice.issueDate}</Text>
                <Text style={styles.meta}>Due Date: {invoiceData.invoice.dueDate}</Text>
                <Text style={styles.invoiceStatus}>{invoiceData.invoice.status}</Text>
              </View>
            </View>

            <View style={styles.invoiceInfoRow}>
              <View style={styles.invoiceInfoBox}>
                <Text style={styles.invoiceBoxTitle}>Bill To</Text>
                <Text style={styles.meta}>{invoiceData.customer.name}</Text>
                <Text style={styles.meta}>{invoiceData.customer.email}</Text>
                <Text style={styles.meta}>{invoiceData.customer.phone}</Text>
              </View>
              <View style={styles.invoiceInfoBox}>
                <Text style={styles.invoiceBoxTitle}>Booking Details</Text>
                <Text style={styles.meta}>{invoiceData.booking.packageName}</Text>
                <Text style={styles.meta}>Reference: {invoiceData.booking.reference}</Text>
                <Text style={styles.meta}>Travel Date: {invoiceData.booking.travelDates}</Text>
                <Text style={styles.meta}>Travelers: {invoiceData.booking.travelers}</Text>
              </View>
            </View>

            <View style={styles.invoiceTable}>
              <View style={[styles.invoiceTableRow, styles.invoiceTableHeader]}>
                <Text style={[styles.invoiceCell, styles.invoiceDesc]}>Description</Text>
                <Text style={[styles.invoiceCell, styles.invoiceQty]}>Qty</Text>
                <Text style={[styles.invoiceCell, styles.invoiceRate]}>Rate</Text>
                <Text style={[styles.invoiceCell, styles.invoiceAmount]}>Amount</Text>
              </View>
              {invoiceData.items.map((item, index) => (
                <View key={`invoice-item-${index}`} style={styles.invoiceTableRow}>
                  <Text style={[styles.invoiceCell, styles.invoiceDesc]}>{item.description}</Text>
                  <Text style={[styles.invoiceCell, styles.invoiceQty]}>{item.qty}</Text>
                  <Text style={[styles.invoiceCell, styles.invoiceRate]}>{formatCurrency(item.rate)}</Text>
                  <Text style={[styles.invoiceCell, styles.invoiceAmount]}>{formatCurrency(item.amount)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.invoiceTotals}>
              <Text style={styles.meta}>Subtotal: {formatCurrency(invoiceData.subtotal)}</Text>
              <Text style={styles.meta}>Tax (12%): {formatCurrency(invoiceData.tax)}</Text>
              <Text style={styles.invoiceTotalText}>Total: {formatCurrency(invoiceData.totalWithTax)}</Text>
            </View>

            {invoicePdfUrl ? (
              <TouchableOpacity
                style={[styles.button, styles.invoicePdfButton]}
                onPress={() => Linking.openURL(invoicePdfUrl)}
              >
                <Text style={styles.buttonText}>Open Generated Invoice PDF</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {step === "payment" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <Text style={styles.meta}>Select payment method</Text>
            <View style={styles.paymentRow}>
              {[
                "gcash",
                "paypal",
                "bdo",
                "metrobank",
              ].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[styles.paymentBtn, paymentMethod === method && styles.paymentBtnActive]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text style={styles.paymentText}>{method.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.meta}>Amount: ₱{totalPrice.toLocaleString()}</Text>
          </View>
        )}

        <View style={styles.actions}>
          {step !== "registration" && (
            <TouchableOpacity
              style={[styles.button, styles.secondary]}
              onPress={() => setStep(step === "payment" ? "invoice" : "registration")}
            >
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
          )}

          {step === "registration" && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                if (!registration.fullName || !registration.email || !registration.phone) {
                  Alert.alert("Missing details", "Please complete booking registration.");
                  return;
                }
                setStep("invoice");
              }}
            >
              <Text style={styles.buttonText}>Proceed to Invoice</Text>
            </TouchableOpacity>
          )}

          {step === "invoice" && (
            <TouchableOpacity style={styles.button} onPress={finalizeBooking} disabled={processing}>
              <Text style={styles.buttonText}>{processing ? "Redirecting..." : "Proceed to Payment"}</Text>
            </TouchableOpacity>
          )}

          {step === "payment" && (
            <TouchableOpacity style={styles.button} onPress={finalizeBooking} disabled={processing}>
              <Text style={styles.buttonText}>{processing ? "Processing..." : "Pay & Confirm Booking"}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
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
    marginBottom: 6,
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
    color: "#305797",
    marginBottom: 8,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  invoiceBrand: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2a44",
    marginBottom: 4,
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2a44",
    marginBottom: 4,
    textAlign: "right",
  },
  invoiceStatus: {
    marginTop: 4,
    color: "#2d5fb8",
    fontWeight: "700",
    textAlign: "right",
  },
  invoiceInfoRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  invoiceInfoBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
  },
  invoiceBoxTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 6,
  },
  invoiceTable: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 4,
  },
  invoiceTableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  invoiceTableHeader: {
    backgroundColor: "#f9fafb",
  },
  invoiceCell: {
    fontSize: 11,
    color: "#1f2a44",
  },
  invoiceDesc: {
    flex: 3,
  },
  invoiceQty: {
    flex: 1,
    textAlign: "center",
  },
  invoiceRate: {
    flex: 1.5,
    textAlign: "right",
  },
  invoiceAmount: {
    flex: 1.5,
    textAlign: "right",
  },
  invoiceTotals: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  invoiceTotalText: {
    marginTop: 2,
    color: "#1f2a44",
    fontWeight: "700",
  },
  invoicePdfButton: {
    marginTop: 14,
    backgroundColor: "#1f2a44",
  },
  input: {
    borderWidth: 1,
    borderColor: "#dbe3ef",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  actions: {
    marginTop: 16,
    gap: 10,
  },
  button: {
    backgroundColor: "#305797",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondary: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  paymentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  paymentBtn: {
    backgroundColor: "#eef3fb",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  paymentBtnActive: {
    backgroundColor: "#305797",
  },
  paymentText: {
    color: "#1f2a44",
    fontWeight: "600",
  },
});