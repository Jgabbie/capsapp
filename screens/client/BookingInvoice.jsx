import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Platform } from "react-native";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import AdminSidebar from "../../components/AdminSidebar";
import { generateBookingInvoicePdf } from "../../utils/bookingInvoicePdf";
import { useUser } from "../../context/UserContext";

export default function BookingInvoice({ route, navigation }) {
  const { user } = useUser();
  const booking = route?.params?.booking || null;
  const source = route?.params?.source || "user";
  const role = String(user?.role || "").trim().toLowerCase();
  const isAdminView = source === "admin" || role === "admin";
  const [isSidebarVisible, setSidebarVisible] = React.useState(false);
  const [invoicePdfUrl, setInvoicePdfUrl] = useState("");

  const bookingDetails = booking?.bookingDetails || {};
  const passportUpload = bookingDetails?.passportUpload || {};
  const passportFileName = passportUpload?.passportFileName || "";
  const passportFileUrl = passportUpload?.passportFileUrl || "";

  // UPDATED: Now targeting the nested travelerCounts from the web schema
  const totals = useMemo(() => {
    const totalPrice = Number(bookingDetails?.travelerCounts?.totalPrice || bookingDetails?.totalPrice || 0);
    const paidAmount = Number(bookingDetails?.paidAmount || totalPrice);
    return {
      totalPrice,
      paidAmount,
      remainingBalance: Math.max(totalPrice - paidAmount, 0),
    };
  }, [bookingDetails]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(Number(value || 0));

  const invoiceData = useMemo(() => {
    const subtotal = totals.totalPrice;
    const tax = subtotal * 0.12;
    const totalWithTax = subtotal + tax;
    // UPDATED: Pulling travelers from the root booking object first
    const travelers = Number(booking?.travelers || bookingDetails?.travelers || 1);
    const issueDate = new Date(booking?.createdAt || Date.now());
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
        number: `INV-${String(booking?.reference || "00000000").replace(/[^A-Z0-9-]/gi, "").slice(-12)}`,
        issueDate: issueDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        dueDate: dueDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        status: totals.remainingBalance > 0 ? "Unpaid" : "Paid",
      },
      customer: {
        name: bookingDetails.fullName || "Customer",
        email: bookingDetails.email || "N/A",
        phone: bookingDetails.phone || "N/A",
      },
      booking: {
        reference: booking?.reference || "N/A",
        // UPDATED: Prioritize populated packageId from the backend
        packageName: booking?.packageId?.packageName || bookingDetails?.packageName || "N/A",
        // UPDATED: Prioritize root travelDate
        travelDates: booking?.travelDate || bookingDetails?.travelDate || "TBD",
        travelers,
      },
      items: [
        {
          description: "Tour Package",
          qty: travelers,
          rate: travelers > 0 ? subtotal / travelers : subtotal,
          amount: subtotal,
        },
      ],
      subtotal,
      tax,
      totalWithTax,
    };
  }, [booking, bookingDetails, totals]);

  useEffect(() => {
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
  }, [invoiceData]);

  // UI Variable fallbacks to match the schema fixes
  const displayPackageName = booking?.packageId?.packageName || bookingDetails?.packageName || "--";
  const displayTravelDate = booking?.travelDate || bookingDetails?.travelDate || "--";

  return (
    <View style={{ flex: 1 }}>
      <Header openSidebar={() => setSidebarVisible(true)} />
      {isAdminView ? (
        <AdminSidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />
      ) : (
        <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />
      )}

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Booking Invoice</Text>
        <Text style={styles.meta}>Reference: {booking?.reference || "--"}</Text>
        <Text style={styles.meta}>Package: {displayPackageName}</Text>
        <Text style={styles.meta}>Travel Date: {displayTravelDate}</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <Text style={styles.meta}>Total Price: {formatCurrency(totals.totalPrice)}</Text>
          <Text style={styles.meta}>Paid Amount: {formatCurrency(totals.paidAmount)}</Text>
          <Text style={styles.meta}>Remaining Balance: {formatCurrency(totals.remainingBalance)}</Text>
          <Text style={styles.statusTag}>{totals.remainingBalance > 0 ? "Balance Due" : "Fully Paid"}</Text>

          {invoicePdfUrl ? (
            <TouchableOpacity style={[styles.button, { marginTop: 14 }]} onPress={() => Linking.openURL(invoicePdfUrl)}>
              <Text style={styles.buttonText}>Open Invoice PDF</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {!!passportFileUrl && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Uploaded Passport</Text>
            <Text style={styles.meta}>File: {passportFileName || "Passport file"}</Text>
            <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={() => Linking.openURL(passportFileUrl)}>
              <Text style={styles.buttonText}>Open Passport File</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate(source === "admin" ? "bookingmanagement" : "userbookings")}> 
          <Text style={styles.buttonText}>{source === "admin" ? "Back to Booking Management" : "Back to Bookings"}</Text>
        </TouchableOpacity>
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
    marginBottom: 6,
  },
  card: {
    marginTop: 14,
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
  statusTag: {
    marginTop: 8,
    color: "#2d5fb8",
    fontWeight: "700",
  },
  button: {
    marginTop: 16,
    backgroundColor: "#305797",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});