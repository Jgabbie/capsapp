import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, StatusBar, ActivityIndicator, Alert, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import * as ImagePicker from 'expo-image-picker';

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import AdminSidebar from "../../components/AdminSidebar";
import BookingInvoiceStyle from "../../styles/clientstyles/BookingInvoiceStyle";
import PaymentStyle from "../../styles/clientstyles/PaymentStyle";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";

export default function BookingInvoice({ route, navigation }) {
    const { user } = useUser();

    const rawBooking = route?.params?.booking || null;
    const source = route?.params?.source || "user";
    const role = String(user?.role || "").trim().toLowerCase();
    const isAdminView = source === "admin" || role === "admin";

    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [booking, setBooking] = useState(rawBooking);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState("");

    const [method, setMethod] = useState('paymongo');
    const [proofImage, setProofImage] = useState(null);
    const [isProceedModalOpen, setIsProceedModalOpen] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const bookingDetails = booking?.bookingDetails || {};
    const reference = booking?.reference || booking?.ref || booking?._id || "--";

    const buildInvoiceNumber = (allBookings, currentBooking) => {
        if (!currentBooking) return "";
        const createdAtValue = currentBooking.bookingDate || currentBooking.createdAt;
        const createdAt = createdAtValue ? dayjs(createdAtValue) : null;
        if (!createdAt || !createdAt.isValid()) return "";

        const getIdentity = (item) =>
            String(item?._id || item?.id || item?.reference || item?.ref || "");

        const currentIdentity = getIdentity(currentBooking);
        const monthKey = createdAt.format("MM");

        const monthBookings = (allBookings || [])
            .map((item) => ({
                ...item,
                _createdAt: item.bookingDate || item.createdAt,
                _identity: getIdentity(item)
            }))
            .filter((item) => item._createdAt && dayjs(item._createdAt).isValid())
            .filter((item) => dayjs(item._createdAt).isSame(createdAt, "month"));

        monthBookings.sort((a, b) => {
            const timeDiff = dayjs(a._createdAt).valueOf() - dayjs(b._createdAt).valueOf();
            if (timeDiff !== 0) return timeDiff;
            return a._identity.localeCompare(b._identity);
        });

        let index = monthBookings.findIndex((item) => item._identity === currentIdentity);

        if (index < 0) {
            const currentRef = String(currentBooking.reference || currentBooking.ref || "");
            if (currentRef) {
                index = monthBookings.findIndex(
                    (item) => String(item.reference || item.ref || "") === currentRef
                );
            }
        }

        const sequence = index >= 0 ? index + 1 : monthBookings.length + 1;
        return `${monthKey}${String(sequence).padStart(2, "0")}`;
    };

    useEffect(() => {
        if (!reference || reference === "--") {
            setLoading(false);
            return;
        }

        const fetchAllData = async () => {
            let finalBooking = rawBooking;
            let finalTxns = [];

            try {
                // Primary Fetch
                const bookingRes = await api.get(`/booking/by-reference/${reference}`, withUserHeader(user?._id));
                finalBooking = bookingRes.data?.booking || rawBooking;
                finalTxns = bookingRes.data?.transactions || [];
            } catch (err) {
                console.log("Primary fetch failed. Triggering Transaction Fallback...");

                // If by-reference 500s, we grab the transactions directly and link them!
                try {
                    const txRes = await api.get('/transaction/my-transactions', withUserHeader(user?._id));
                    const allTx = txRes.data?.transactions || txRes.data || [];


                    finalTxns = allTx.filter(tx =>
                        String(tx.bookingId?._id || tx.bookingId) === String(rawBooking?._id || rawBooking?.id) ||
                        tx.bookingId?.reference === reference ||
                        tx.bookingReference === reference
                    );
                } catch (txErr) {
                    console.log("Fallback transaction fetch failed:", txErr.message);
                }
            }

            setBooking(finalBooking);
            setTransactions(finalTxns);

            // Fetch invoice number from backend endpoint
            if (reference && reference !== "--") {
                try {
                    const invoiceRes = await api.get(`/booking/invoice-number/${reference}`, withUserHeader(user?._id));
                    const number = invoiceRes.data?.invoiceNumber;
                    if (number) setInvoiceNumber(number);
                    else {
                        const cDate = finalBooking.createdAt || finalBooking.bookingDate;
                        if (cDate) setInvoiceNumber(`${dayjs(cDate).format("MM")}01`);
                    }
                } catch (countErr) {
                    console.log("Error fetching invoice number:", countErr.message);
                    const cDate = finalBooking.createdAt || finalBooking.bookingDate || new Date();
                    setInvoiceNumber(`${dayjs(cDate).format("MM")}01`);
                }
            }

            setLoading(false);
        };
        fetchAllData();
    }, [reference, user?._id]);

    const formatCurrency = (value) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));
    const formatPesoNumber = (value) => `${(Number(value) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatPesoDisplay = (value) => `${formatPesoNumber(value)} PHP`;

    const totalPrice = Math.round(Number(booking?.totalPrice || bookingDetails?.totalPrice || 0) * 100) / 100;
    const computedPaidFromTxns = Math.round(transactions
        .filter(txn => txn.status === "Paid" || txn.status === "Successful" || txn.status === "Fully Paid")
        .reduce((sum, txn) => sum + Number(txn.amount || 0), 0) * 100) / 100;

    const isPaidStatus = booking?.status === "Fully Paid" || booking?.status === "Successful" || rawBooking?.status === "Fully Paid" || rawBooking?.computedStatus === "Fully Paid";
    const fallbackPaidAmount = isPaidStatus ? totalPrice : Number(booking?.paidAmount || rawBooking?.paidAmount || 0);

    const paidAmount = transactions.length > 0 ? computedPaidFromTxns : fallbackPaidAmount;
    const remainingBalance = Math.max(totalPrice - paidAmount, 0);

    const transactionStatus = (transactions.length === 0 && paidAmount === 0)
        ? "Not Paid" : (paidAmount >= totalPrice ? "Fully Paid" : "Partial");
    const hasPendingTransaction = transactions.some(
        (txn) => String(txn?.status || "").trim().toLowerCase() === "pending"
    );

    const getPaymentStatus = () => {
        // For Balance section: Always show payment status, not cancellation status
        // Determine payment status based on amounts (ignore Cancelled/Cancellation Requested)
        if (transactionStatus === "Fully Paid" || transactionStatus === "Paid" || paidAmount >= totalPrice) return { label: "Fully Paid", color: "#389e0d", bg: "#f6ffed" };
        if (transactionStatus === "Not Paid" || paidAmount === 0) return { label: "Not Paid", color: "#cf1322", bg: "#fff1f0" };
        return { label: "Balance Due", color: "#d48806", bg: "#fffbe6" };
    };

    const getCancellationStatus = () => {
        // Show cancellation/cancelled status in orange (matching web)
        const bookingStatus = String(booking?.status || booking?.computedStatus || "").trim();
        if (bookingStatus === 'Cancelled' || bookingStatus === 'Cancellation Requested') return { label: bookingStatus, color: "#d48806", bg: "#fffbe6" };
        return null;
    };
    const paymentStatus = getPaymentStatus();

    const packageName = booking?.packageId?.packageName || bookingDetails?.tourPackageTitle || bookingDetails?.packageName || "Tour Package";
    const packageVia = bookingDetails?.tourPackageVia || "N/A";

    let formattedTravelDate = '--';
    try {
        if (booking?.travelDate?.startDate && booking?.travelDate?.endDate) {
            const s = dayjs(booking.travelDate.startDate);
            const e = dayjs(booking.travelDate.endDate);
            if (s.isValid() && e.isValid()) formattedTravelDate = `${s.format('MMM D, YYYY')} - ${e.format('MMM D, YYYY')}`;
            else formattedTravelDate = `${booking.travelDate.startDate} - ${booking.travelDate.endDate}`;
        } else if (typeof booking?.travelDate === 'string') formattedTravelDate = booking.travelDate;
        else if (bookingDetails?.travelDate) formattedTravelDate = bookingDetails.travelDate;
        else if (rawBooking?.formattedTravelDate) formattedTravelDate = rawBooking.formattedTravelDate;
    } catch (e) { formattedTravelDate = '--'; }

    const handleViewInvoice = () => setShowInvoiceModal(true);

    const issueDate = booking?.createdAt ? dayjs(booking.createdAt) : dayjs();
    const travelDateObj = booking?.travelDate?.startDate ? dayjs(booking.travelDate.startDate) : dayjs().add(1, 'month');
    const fallbackDueDateDisplay = travelDateObj.isValid() ? travelDateObj.subtract(25, 'day') : issueDate.add(14, 'day');

    const customerName = bookingDetails?.leadFullName || `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Customer';
    const travelerTotal = Number(booking?.travelers || bookingDetails?.travelers?.length || bookingDetails?.passengers?.length || 1);
    const ratePerPax = travelerTotal > 0 ? totalPrice / travelerTotal : totalPrice;

    const baseTravelers = Array.isArray(bookingDetails?.travelers) ? bookingDetails.travelers : Array.isArray(bookingDetails?.passengers) ? bookingDetails.passengers : [];
    const fallbackPassports = bookingDetails?.passportFiles || booking?.passportFiles || [];
    const fallbackPhotos = bookingDetails?.photoFiles || booking?.photoFiles || [];

    const travelersWithDocs = baseTravelers.map((t, i) => {
        const rawPassport = t.passportFile || fallbackPassports[i] || null;
        const rawPhoto = t.photoFile || fallbackPhotos[i] || null;
        const normalizedAge = Number(t?.age);
        const fallbackPassengerType = Number.isFinite(normalizedAge)
            ? (normalizedAge <= 2 ? "INFANT" : normalizedAge <= 11 ? "CHILD" : "ADULT")
            : "ADULT";
        const passengerType = String(
            t.passengerType || t.type || t.travelerType || t.category || fallbackPassengerType
        ).toUpperCase();

        return {
            title: t.title || 'MR',
            firstName: t.firstName || 'Unknown',
            lastName: t.lastName || '',
            roomType: t.roomType || t.room || 'N/A',
            age: t.age?.toString() || 'N/A',
            birthday: t.birthday || t.bday || t.birthdate || null,
            passengerType,
            passportNo: t.passportNo || t.passport || 'N/A',
            passportExpiry: t.passportExpiry || t.expiry || null,
            passportFile: typeof rawPassport === 'string' ? rawPassport : rawPassport?.uri || null,
            photoFile: typeof rawPhoto === 'string' ? rawPhoto : rawPhoto?.uri || null,
        };
    });

    const paymentMode = bookingDetails?.paymentMode || (bookingDetails?.paymentDetails?.paymentType === 'deposit' ? 'Deposit' : 'Full Payment');
    const paymentFrequency = bookingDetails?.paymentDetails?.frequency || 'Every 2 weeks';
    const travelDateStart = booking?.travelDate?.startDate || bookingDetails?.travelDate?.startDate || null;

    const getFrequencyWeeks = (value) => {
        if (value === 'Every week') return 1;
        if (value === 'Every 3 weeks') return 3;
        return 2;
    };

    const travelerCountByType = travelersWithDocs.reduce(
        (acc, traveler) => {
            const type = String(traveler?.passengerType || '').toUpperCase();
            if (type === 'CHILD') acc.child += 1;
            else if (type === 'INFANT') acc.infant += 1;
            else acc.adult += 1;
            return acc;
        },
        { adult: 0, child: 0, infant: 0 }
    );

    const adultRate = Number(bookingDetails?.paymentDetails?.adultRate) || 0;
    const childRate = Number(bookingDetails?.paymentDetails?.childRate) || 0;
    const infantRate = Number(bookingDetails?.paymentDetails?.infantRate) || 0;

    const computedLineTotal =
        travelerCountByType.adult * adultRate +
        travelerCountByType.child * childRate +
        travelerCountByType.infant * infantRate;

    const perPaxRate = travelerTotal > 0 ? Number(totalPrice) / travelerTotal : Number(totalPrice);
    const fallbackRate = perPaxRate;
    const previewInvoiceItems = [
        travelerCountByType.adult > 0
            ? { date: issueDate, activity: 'Adult', description: packageName || 'Tour Package', qty: travelerCountByType.adult, rate: Number(adultRate) || fallbackRate }
            : null,
        travelerCountByType.child > 0
            ? { date: issueDate, activity: 'Child', description: packageName || 'Tour Package', qty: travelerCountByType.child, rate: Number(childRate) || fallbackRate }
            : null,
        travelerCountByType.infant > 0
            ? { date: issueDate, activity: 'Infant', description: packageName || 'Tour Package', qty: travelerCountByType.infant, rate: Number(infantRate) || fallbackRate }
            : null,
    ].filter(Boolean);

    if (previewInvoiceItems.length === 0) {
        previewInvoiceItems.push({ date: issueDate, activity: 'Package', description: packageName || 'Tour Package', qty: 1, rate: totalPrice });
    }

    let previewSubtotal = previewInvoiceItems.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.rate || 0), 0);
    // Use the authoritative booking total price to mirror web behavior
    const previewTotalAmount = Number(totalPrice || previewSubtotal || 0);

    // If the computed row sum doesn't match the booking total (web authoritative),
    // adjust the first invoice row rate so RATE/AMOUNT reflect the booking total.
    if (previewInvoiceItems.length > 0 && Math.abs(previewSubtotal - previewTotalAmount) > 0.5) {
        const first = previewInvoiceItems[0];
        const qty = Number(first.qty || 1);
        const adjustedRate = previewTotalAmount / qty;
        previewInvoiceItems[0] = { ...first, rate: adjustedRate };
        previewSubtotal = previewInvoiceItems.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.rate || 0), 0);
    }

    const depositAmount = Number(bookingDetails?.paymentDetails?.depositAmount) || 0;
    const remainingAfterDeposit = Math.max(previewTotalAmount - depositAmount, 0);
    const frequencyWeeks = getFrequencyWeeks(paymentFrequency);
    const baseDate = issueDate;
    const dueCutoffDate = travelDateStart && dayjs(travelDateStart).isValid()
        ? dayjs(travelDateStart).startOf('day')
        : baseDate.add(45, 'day');

    const paymentDates = [];
    let nextDate = dayjs(baseDate).add(frequencyWeeks, 'week').startOf('day');
    while (nextDate.isBefore(dueCutoffDate)) {
        paymentDates.push(nextDate);
        nextDate = nextDate.add(frequencyWeeks, 'week');
    }
    if (paymentDates.length === 0) {
        paymentDates.push(dueCutoffDate.subtract(1, 'day'));
    }

    const installmentAmount = paymentDates.length > 0 ? remainingAfterDeposit / paymentDates.length : 0;
    const paymentSchedule = [
        {
            label: 'Deposit',
            amount: depositAmount,
            date: baseDate,
            status: paidAmount >= (depositAmount - 0.01) ? 'PAID' : 'PENDING',
        },
        ...paymentDates.map((date, index) => {
            const threshold = depositAmount + installmentAmount * (index + 1);
            return {
                label: `Installment ${index + 1}`,
                amount: installmentAmount,
                date,
                status: paidAmount >= (threshold - 0.01) ? 'PAID' : 'PENDING',
            };
        }),
    ];

    const lastScheduleItem = paymentSchedule.length ? paymentSchedule[paymentSchedule.length - 1] : null;
    const dueDateDisplay = lastScheduleItem?.date || fallbackDueDateDisplay;

    const safeDate = (dateStr) => {
        if (!dateStr || dateStr === 'N/A' || dateStr === '') return 'N/A';
        const d = dayjs(dateStr);
        return d.isValid() ? d.format('MMM D, YYYY') : dateStr;
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            base64: true,
            quality: 0.5
        });
        if (!result.canceled) setProofImage(result.assets[0]);
    };

    const handleProceedClick = () => {
        if (method === 'manual' && !proofImage) {
            Alert.alert("Missing Proof", "Please upload a photo of your deposit slip.");
            return;
        }
        setIsProceedModalOpen(true);
    };

    const executePaymentFlow = async () => {
        setIsProceedModalOpen(false);
        setPaymentLoading(true);

        try {
            const targetPackageId = booking?.packageId?._id || booking?.packageId?.id || booking?.packageId;

            if (method === 'manual') {
                if (!proofImage?.base64) {
                    Alert.alert("Error", "Image data is missing. Please re-select the image.");
                    setPaymentLoading(false);
                    return;
                }

                const base64Image = `data:${proofImage.mimeType || 'image/jpeg'};base64,${proofImage.base64}`;
                const filename = proofImage.fileName || proofImage.uri.split('/').pop() || 'deposit.jpg';

                const manualPayload = {
                    bookingId: booking?._id || rawBooking?._id || rawBooking?.id,
                    packageId: targetPackageId,
                    amount: remainingBalance,
                    proofImage: base64Image,
                    proofImageType: proofImage.mimeType || 'image/jpeg',
                    proofFileName: filename
                };

                await api.post('/payment/manual-deposit', manualPayload, withUserHeader(user?._id));
                setPaymentLoading(false);
                navigation.navigate("paymentsuccess", { reference, mode: 'manual' });

            } else {
                // PayMongo
                const successDeepLink = Linking.createURL('paymentsuccess', { queryParams: { reference: reference, mode: 'online' } });
                const cancelDeepLink = Linking.createURL('bookinginvoice');

                const paymentPayload = {
                    bookingId: booking?._id || rawBooking?._id || rawBooking?.id,
                    bookingReference: reference,
                    packageId: targetPackageId,
                    totalPrice: remainingBalance,
                    successUrl: successDeepLink,
                    cancelUrl: cancelDeepLink,
                };

                const response = await api.post('/payment/create-checkout-session-deposit', { paymentPayload }, withUserHeader(user?._id));
                const checkoutUrl = response.data?.data?.attributes?.checkout_url || response.data?.checkoutUrl;

                setPaymentLoading(false);
                if (checkoutUrl) Linking.openURL(checkoutUrl);
            }
        } catch (error) {
            setPaymentLoading(false);
            console.error("Payment Error:", error);
            Alert.alert("Error", "Failed to process payment. Please try again.");
        }
    };


    const handleDownloadRegistrationForms = async () => {
        setIsGeneratingPdf(true);
        try {
            const htmlContent = `
                <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                        <style>
                            @page { size: A4 portrait; margin: 15mm 15mm 20mm 15mm; }
                            body { font-family: 'Helvetica', sans-serif; color: #000; font-size: 11px; margin: 0; padding: 0; }
                            .page { page-break-after: always; position: relative; }
                            .header-gold { background-color: #FFD700; border: 1px solid #000; text-align: center; font-weight: bold; padding: 6px; margin-bottom: 15px; font-size: 14px; text-transform: uppercase; }
                            .header-blue { background-color: #ADD8E6; border: 1px solid #000; font-weight: bold; padding: 5px; margin-top: 15px; margin-bottom: 10px; font-size: 11px; text-transform: uppercase; }
                            table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                            th, td { border: 1px solid #000; padding: 5px; text-align: left; font-size: 9px; }
                            th { background-color: #ADD8E6; text-align: center; font-weight: bold; }
                            .info-grid { display: table; width: 100%; margin-bottom: 15px; }
                            .info-row { display: table-row; }
                            .info-col { display: table-cell; padding-bottom: 8px; padding-right: 10px;}
                            .label { font-weight: bold; font-size: 8px; display: block; margin-bottom: 2px; text-transform: uppercase; }
                            .value { border-bottom: 1px solid #000; padding-bottom: 2px; width: 100%; display: inline-block; min-height: 12px; font-size: 10px; }
                            p { text-align: justify; line-height: 1.4; margin-bottom: 8px; font-size: 10px; }
                            .p-text { text-align: justify; line-height: 1.4; margin-bottom: 12px; font-size: 10px; }
                            .red-text { color: #d32f2f; font-weight: bold; font-style: italic; font-size: 10px;}
                            .sig-box { width: 45%; display: inline-block; text-align: center; margin-top: 40px; }
                            .sig-line { border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px; font-weight: bold; font-size: 11px; display: flex; align-items: flex-end; justify-content: center; height: 15px; }
                            .flex-container { display: flex; flex-direction: row; align-items: stretch; justify-content: space-between; gap: 15px;}
                            .flex-col { flex: 1; }
                            .logo-container { text-align: center; margin-bottom: 15px; }
                            .logo-container img { height: 60px; object-fit: contain; }
                            .yes-no-box { display: inline-block; width: 30px; border: 1px solid #000; text-align: center; font-weight: bold; padding: 4px; font-size: 10px;}
                            .detail-box { border: 1px solid #000; min-height: 35px; width: 100%; padding: 5px; font-size: 10px; margin-top: 5px; margin-bottom: 15px; }
                        </style>
                    </head>
                    <body>
                        <div class="page">
                            <div class="logo-container">
                                <img src="https://res.cloudinary.com/dcv8v7jjc/image/upload/v1775653130/booking-documents/Logo.png" alt="M&RC Travel and Tours" />
                            </div>
                            <div class="header-gold">BOOKING REGISTRATION FORM</div>
                            
                            <div class="info-grid">
                                <div class="info-row">
                                    <div class="info-col"><span class="label">DATE OF REGISTRATION</span><span class="value">${dayjs(booking?.createdAt).format('MMMM D, YYYY')}</span></div>
                                    <div class="info-col"><span class="label">PACKAGE TRAVEL DATE</span><span class="value">${formattedTravelDate}</span></div>
                                </div>
                                <div class="info-row">
                                    <div class="info-col"><span class="label">TOUR PACKAGE TITLE</span><span class="value">${packageName}</span></div>
                                    <div class="info-col"><span class="label">TOUR PACKAGE VIA</span><span class="value">${packageVia}</span></div>
                                </div>
                            </div>

                            <div class="header-blue">LEAD GUEST INFORMATION</div>
                            <div class="info-grid">
                                <div class="info-row">
                                    <div class="info-col" style="width: 15%;"><span class="label" style="color: red;">* TITLE:</span><span class="value">${bookingDetails?.leadTitle || 'MR'}</span></div>
                                    <div class="info-col" style="width: 85%;"><span class="label">FULL NAME:</span><span class="value">${bookingDetails?.leadFullName || user?.firstname + ' ' + user?.lastname}</span></div>
                                </div>
                                <div class="info-row">
                                    <div class="info-col"><span class="label">EMAIL ADD:</span><span class="value">${bookingDetails?.leadEmail || user?.email}</span></div>
                                    <div class="info-col"><span class="label">CONTACT DETAILS:</span><span class="value">${bookingDetails?.leadContact || user?.phonenum || 'N/A'}</span></div>
                                </div>
                                <div class="info-row">
                                    <div class="info-col" style="display: block; width: 100%;"><span class="label">ADDRESS:</span><span class="value">${bookingDetails?.leadAddress || 'N/A'}</span></div>
                                </div>
                            </div>

                            <div class="header-blue">PASSENGER LIST (INCLUDING LEAD GUEST)</div>
                            <table>
                                <tr><th>NO</th><th>TITLE</th><th>FIRST NAME</th><th>LAST NAME</th><th>ROOM</th><th>BIRTHDAY</th><th>AGE</th><th>PASSPORT #</th><th>EXPIRY</th></tr>
                                ${travelersWithDocs.map((t, idx) => `
                                    <tr>
                                        <td style="text-align: center;">${idx + 1}</td>
                                        <td style="text-align: center;">${t.title}</td>
                                        <td>${t.firstName}</td>
                                        <td>${t.lastName}</td>
                                        <td style="text-align: center;">${t.roomType}</td>
                                        <td style="text-align: center;">${safeDate(t.birthday)}</td>
                                        <td style="text-align: center;">${t.age}</td>
                                        <td style="text-align: center;">${t.passportNo}</td>
                                        <td style="text-align: center;">${safeDate(t.passportExpiry)}</td>
                                    </tr>
                                `).join('')}
                            </table>
                            
                            <div style="margin-top: 20px; font-size: 8px;">
                                <div style="width: 50%; float: left;">
                                    <span style="color: red; font-weight: bold;">GUIDE IN ROOM ASSIGNMENTS:</span><br/>
                                    <i>*Important note: All room type requests are subject for availability. Use of SINGLE ROOM has a single supplement charge.</i><br/><br/>
                                    <strong>TWIN BED ROOM</strong> - 1 Room with 2 single beds; 2 pax occupancy<br/>
                                    <strong>DOUBLE ROOM</strong> - 1 room with 1 double bed; 2 pax occupancy<br/>
                                    <strong>SINGLE ROOM</strong> - 1 room with 1 bed; 1 pax occupancy<br/>
                                    <strong>TRIPLE ROOM</strong> - 1 room with 3 single beds OR 1 double + 1 single
                                </div>
                                <div style="width: 45%; float: right; text-align: justify;">
                                    As the lead guest and the sole mediator between the Travel Agency and the guests enlisted of this group, I hereby confirm that all the above information is correct and true and I am happy for M&RC Travel and Tours to access this information when organizing this trip/travel for me.<br/><br/>
                                    By signing this form, I allow M&RC Travel and Tours to keep all my and our group's data on file and access details which are necessary for this trip/travel and authorized by me.
                                </div>
                                <div style="clear: both;"></div>
                            </div>
                            
                            <div class="sig-box" style="margin-top: 40px;">
                                <div class="sig-line">${bookingDetails?.leadFullName || user?.firstname + ' ' + user?.lastname}</div>
                                <div style="font-size: 9px; font-weight: bold;">Signature over printed name</div>
                            </div>
                            <div class="sig-box" style="float: right; margin-top: 40px;">
                                <div class="sig-line">${dayjs(booking?.createdAt).format('MMMM D, YYYY')}</div>
                                <div style="font-size: 9px; font-weight: bold;">Date</div>
                            </div>
                        </div>

                        <div class="page">
                            <div class="logo-container">
                                <img src="https://res.cloudinary.com/dcv8v7jjc/image/upload/v1775653130/booking-documents/Logo.png" alt="M&RC Travel and Tours" />
                            </div>
                            <div class="header-gold">TRAVEL REGISTRATION DETAILS</div>
                            <p style="text-align: center; font-style: italic; font-size: 9px; margin-bottom: 15px;">Instructions: Please fill-up and write your answers inside each box.</p>
                            
                            <div style="margin-bottom: 10px;"><strong>TOUR PACKAGE TITLE:</strong> ${packageName}</div>
                            <div style="margin-bottom: 20px;"><strong>PACKAGE TRAVEL DATE:</strong> ${formattedTravelDate}</div>

                            <table style="width: 100%; border: none;">
                                <tr>
                                    <td style="border: none; padding: 0; width: 90%;">
                                        <strong>Does anyone in your group have any dietary requests?</strong><br/>
                                        <span style="font-size: 8px; font-style: italic; color: #555;">(Applicable for tour package with meal inclusions; if not included, please select N/A)</span>
                                    </td>
                                    <td style="border: none; text-align: right;"><div class="yes-no-box">${bookingDetails?.dietaryRequest === 'Y' ? 'Y' : 'N'}</div></td>
                                </tr>
                            </table>
                            <div style="display: flex; align-items: center;">
                                <span style="font-size: 9px; margin-right: 10px;">If yes, please indicate details:</span>
                                <div class="detail-box">${bookingDetails?.dietaryDetails || ''}</div>
                            </div>

                            <table style="width: 100%; border: none;">
                                <tr>
                                    <td style="border: none; padding: 0; width: 90%;">
                                        <strong>Does anyone in your group have any Allergies/Medical conditions?</strong><br/>
                                        <span style="font-size: 8px; font-style: italic; color: #555;">(Applicable for tour package with meal inclusions; if not included, please select N/A)</span>
                                    </td>
                                    <td style="border: none; text-align: right;"><div class="yes-no-box">${bookingDetails?.medicalRequest === 'Y' ? 'Y' : 'N'}</div></td>
                                </tr>
                            </table>
                            <div style="display: flex; align-items: center;">
                                <span style="font-size: 9px; margin-right: 10px;">If yes, please indicate details:</span>
                                <div class="detail-box">${bookingDetails?.medicalDetails || ''}</div>
                            </div>
                            
                            <div style="border: 1px solid #000; padding: 15px; margin-top: 20px; border-radius: 5px;">
                                <div style="font-weight: bold; font-size: 11px; margin-bottom: 10px;">TRAVEL INSURANCE</div>
                                <p style="font-size: 9px; margin-bottom: 15px;">We highly encourage <strong>ALL OUR CLIENTS</strong> to have and are covered with travel insurance for health, repatriation, loss of luggage/belongings and in case of cancellation, flight delays, and the like that is why purchasing of travel insurance together with our tour packages is compulsory for your convenience and peace of mind.</p>
                                
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                    <div style="width: 80%; font-size: 10px;">Do you agree to purchase a Travel Insurance from us?</div>
                                    <div style="width: 15%; border: 1px solid #000; text-align: center; padding: 5px; font-weight: bold;">
                                        ${bookingDetails?.purchaseInsurance === 'Y' ? 'Y' : 'N'}
                                    </div>
                                </div>
                                <p style="font-style: italic; font-size: 8px; color: #555; margin-bottom: 15px;">Note: Purchasing of travel insurance from our Travel & Tours company does not hold us liable for any claims and anything about the process of claims from the insurance company. We can only provide the documents from our suppliers, operators, and airlines' end if necessary.</p>
                                
                                <table style="margin: 0;">
                                    <tr>
                                        <td style="width: 40%; text-align: right; font-weight: bold; border: 1px solid #000;">If YES, please indicate details:</td>
                                        <td style="font-style: italic; font-size: 9px; border: 1px solid #000;">Please check the conditions and coverage carefully and send us a copy of the policy so we can review as well.</td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: right; font-weight: bold; border: 1px solid #000;">If NO but chose not to purchase Travel Insurance from us:</td>
                                        <td style="font-weight: bold; border: 1px solid #000;">I understand that I am waiving the right of any assistance from the travel and tours company related to claims.</td>
                                    </tr>
                                </table>
                            </div>

                            <div class="header-blue" style="margin-top: 20px;">EMERGENCY CONTACT <span style="font-size: 8px; font-style: italic; text-transform: none; font-weight: normal;">(i.e: the person to contact in the event of an emergency while you are away)</span></div>
                            <table style="margin-top: 0;">
                                <tr>
                                    <td style="width: 15%;"><strong>Title:</strong> ${bookingDetails?.emergencyTitle || 'MR'}</td>
                                    <td colspan="3"><strong>Full name:</strong> ${bookingDetails?.emergencyName || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td colspan="2"><strong>Email:</strong> ${bookingDetails?.emergencyEmail || 'N/A'}</td>
                                    <td><strong>Contact Number:</strong> ${bookingDetails?.emergencyContact || 'N/A'}</td>
                                    <td><strong>Relation:</strong> ${bookingDetails?.emergencyRelation || 'N/A'}</td>
                                </tr>
                            </table>

                            <div class="sig-box" style="margin-top: 40px;">
                                <div class="sig-line">${bookingDetails?.leadFullName || user?.firstname + ' ' + user?.lastname}</div>
                                <div style="font-size: 9px; font-weight: bold;">Signature over printed name</div>
                            </div>
                            <div class="sig-box" style="float: right; margin-top: 40px;">
                                <div class="sig-line">${dayjs(booking?.createdAt).format('MMMM D, YYYY')}</div>
                                <div style="font-size: 9px; font-weight: bold;">Date</div>
                            </div>
                        </div>

                        <div class="page" style="page-break-after: auto;">
                            <div class="logo-container">
                                <img src="https://res.cloudinary.com/dcv8v7jjc/image/upload/v1775653130/booking-documents/Logo.png" alt="M&RC Travel and Tours" />
                            </div>
                            <div class="header-gold">GENERAL PACKAGE DISCLAIMER, TERMS & CONDITIONS</div>
                            
                            <div class="flex-container">
                                <div class="flex-col left" style="border-right: none; padding-right: 0;">
                                    <p class="red-text">Complete and signed copy this form must be sent together with all the participant's PASSPORT COPIES (for international) or VALID ID's (for domestic). Failure to send accomplished form will be subject to penalties or cancellation of your package. Upon completion of your booking process and deposit, you will receive a Booking Confirmation of your purchase and registration.</p>
                                    <p class="red-text">By making any payments or purchase, this shall mean that you have read and agreed to the terms and conditions set forth in the quotation proposed to you before purchasing.</p>

                                    <div class="header-blue">PAYMENTS & PENALTIES</div>
                                    <p class="p-text">If you choose installment, you need to follow the payment schedule and failure to do so will be subject to penalties and/or cancellation of your tour package. We can only acknowledge payments that are directly paid to us by cash (at our office) and bank deposit or online cashless transfers to our official payment channels. Other mode of payments such as payment through a specific person such as M&RC Travel and Tours Staffs will not be honoured.</p>

                                    <div class="header-blue">CANCELLATION POLICY</div>
                                    <p class="p-text">Please refer to the quotation sent to you. All tour packages will not be converted to any travel funds in case the tour will not push through whether it be government mandated, due to natural calamities, etc. Tour package purchase is non-refundable, non-reroutable, non-rebookable, and non-transferable unless otherwise stated and is due to natural calamities and force majeur that is beyond our control otherwise NON-REFUNDABLE.</p>
                                </div>

                                <div class="flex-col right" style="border-left: 1px solid #ccc; padding-left: 15px;">
                                    <div class="header-blue" style="margin-top: 0;">AMENDMENTS</div>
                                    <p class="p-text">Any amendment request such as changes in name (MINOR spelling only) date of birth of the passenger may have applicable charges.</p>
                                    
                                    <div class="header-blue">PASSPORT & VISAS</div>
                                    <p class="p-text">Make sure your passport/ID is valid at least 6 months PRIOR to your onward and return date to avoid inconvenience. Our travel company is not liable for refusal of boarding due to passport validity. For VISA assistance, failure to comply with the requirements on the deadlines may automatically result to cancellation of package. Submission of VISA applications through travel agencies does not guarantee VISA approval. The discretion still lies upon the consul and company is not liable for such decision. Our travel company will try our best to have your VISA approved but in the event of denied VISA, the amount indicated in the cancellation/refund policy per person is non-refundable since airline, hotel and tour are all confirmed and guaranteed prior to VISA issuance.</p>
                                    <p class="p-text">We appreciate honest declaration to avoid confusion/disapproval of VISA/Documents and/or prolonged processing. Any fake documents submitted for VISA application processing will be confiscated and payments will be forfeited. This includes tampered and illegally procured documents as verified by respective agencies. Moreover, the company has the right to file charges against you.</p>
                                    <p class="p-text">Original passport, with approve VISA will be release only once fully paid, once there is a valid travel or reason to secure the passport, client must submit notarized reasons and stating for the compliance and to paid the balance as stated in the due date.</p>
                                </div>
                            </div>
                            
                            <div class="sig-box" style="margin-top: 50px;">
                                <div class="sig-line">${bookingDetails?.leadFullName || user?.firstname + ' ' + user?.lastname}</div>
                                <div style="font-size: 9px; font-weight: bold;">Signature over printed name</div>
                            </div>
                            <div class="sig-box" style="float: right; margin-top: 50px;">
                                <div class="sig-line">${dayjs(booking?.createdAt).format('MMMM D, YYYY')}</div>
                                <div style="font-size: 9px; font-weight: bold;">Date</div>
                            </div>
                        </div>

                        <div class="page" style="page-break-after: auto;">
                            <div class="logo-container">
                                <img src="https://res.cloudinary.com/dcv8v7jjc/image/upload/v1775653130/booking-documents/Logo.png" alt="M&RC Travel and Tours" />
                            </div>
                            
                            <div class="flex-container">
                                <div class="flex-col left" style="border-right: none; padding-right: 0;">
                                    <div class="header-blue" style="margin-top: 0;">WAIVER & DISCLAIMER</div>
                                    <p class="p-text">Our travel company is not liable for changes of flight, tours, and hotel accommodation due to weather, transportation, property renovation related issue, force majeure, acts of terrorism, and other unforseen events that is company's out of control. The client waives the right for any claims over the company as such incidents occur. Company is not liable for any offloading incidents may it be due to immigration or airline/airport measures or any reasons beyond the company's control and as such, no refund can be made whatsoever. Company has the right to proceed with the confirmation of the whole package or any services such as flight, hotel and tours even without prior notice. However, if there will be a change of any of the said services on the part of those tour operators, an email notification will be sent to the concerned participants informing of the said change/s.</p>
                                    
                                    <div class="header-blue">LEAD GUEST LIABILITIES AND RESPONSIBILITIES</div>
                                    <p class="p-text">I am responsible in ensuring that all the participants have all the required documents necessary for travel abroad such as VISA and other related documents like Travel Authority for Government Employees, ARC or ALIEN REGISTRATION CARD and old passports for foreign passports or Balikbayans. Travel Clearance from DSWD for CHILD/MINORS NOT travelling with their parents etc.</p>
                                    <p class="p-text">I, the lead guest is the lead contact responsible for the whole group, I must disseminate any information I obtain from the company. The company is not liable for any miscommunication between members of the group. I am the sole mediator between the Travel Agency and the guests enlisted of this group. As the lead guest, all transactions related to our travel package will be communicated to and by me. I am responsible to coordinate with the respective authorities regarding the safety protocols in our destinations as well as to provide their requirements. I am aware that travel insurance is highly suggested for convenience, if any assistance from travel and tours company. I understand that our FINAL travel documents will be provided 3-7 days before departure or as soon as available as your trip will be required to be finalized before being sent to our valued clients.</p>
                                </div>

                                <div class="flex-col right" style="border-left: 1px solid #ccc; padding-left: 15px;">
                                    <div class="header-blue" style="margin-top: 0;">SECURITY DEPOSITS</div>
                                    <p class="p-text">Certain hotels and resorts require a security deposit to cover potential charges, damages, or additional services used during stay. The security deposit is payable directly to M&RC. The hotel may deduct from the security deposit for, but not limited to, damage to hotel property, missing items, smoking penalties, unpaid bills or incidental expenses, excessive cleaning charges.</p>

                                    <div class="header-blue">PURCHASING OF DOMESTIC TICKETS</div>
                                    <p class="p-text">For purchased International tour packages to VISA countries, purchasing of domestic tickets or any tour activities prior to VISA issuance is highly discouraged. Non-compliance to this doesn't make the company liable to any applicable penalties to be paid to the airline in case of any changes in the booking. For non VISA countries, it is highly suggested to book domestic tickets that has atleast 14 hours to 24 hours allowance to your international flight for possible flight changes and delays. The Travel and Tour comapny is not liable for any missed connections resulting from the flight cancellations, delays, or changes to the itinerary whether it will be purchased outside the company or by client's own account.</p>

                                    <div class="header-blue">PACKAGE</div>
                                    <p class="p-text">Some packages requires a certain number of passengers in order to proceed. In the event that the required number of travelers was not met by the travel company and tour operator, they have the right to transfer passengers with PREVIOUS DENIED VISA will not be accepted. Some documents are needed to be submitted to the embassy/immigration if necessary. The rate quoted is based on a minimum number of travelers per departure. Lead guest must understand that the rate will vary if minimum number of travlers was not met or is subject to new quotation.</p>

                                    <p class="red-text" style="margin-top: 20px;">I have read and understand the Terms & Conditions detailed above and the Special Booking Conditions as stated out in the T&C of the tour package quotation I have availed, and accept them on behalf of myself and my party.</p>
                                </div>
                            </div>

                            <div class="sig-box" style="margin-top: 50px;">
                                <div class="sig-line">${bookingDetails?.leadFullName || user?.firstname + ' ' + user?.lastname}</div>
                                <div style="font-size: 9px; font-weight: bold;">Signature over printed name</div>
                            </div>
                            <div class="sig-box" style="float: right; margin-top: 50px;">
                                <div class="sig-line">${dayjs(booking?.createdAt).format('MMMM D, YYYY')}</div>
                                <div style="font-size: 9px; font-weight: bold;">Date</div>
                            </div>
                        </div>
                    </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });

        } catch (error) {
            Alert.alert("Error", "Could not generate PDF. Please try again.");
            console.error(error);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <SafeAreaView style={BookingInvoiceStyle.safeArea}>
            <StatusBar barStyle="dark-content" />
            <Header openSidebar={() => setSidebarVisible(true)} />
            {isAdminView ? (
                <AdminSidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />
            ) : (
                <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />
            )}

            {loading ? (
                <ActivityIndicator size="large" color="#305797" style={{ marginTop: 50 }} />
            ) : (
                <ScrollView contentContainerStyle={BookingInvoiceStyle.container} showsVerticalScrollIndicator={false}>

                    <TouchableOpacity style={BookingInvoiceStyle.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={16} color="#fff" />
                        <Text style={BookingInvoiceStyle.backButtonText}>Back</Text>
                    </TouchableOpacity>

                    <Text style={BookingInvoiceStyle.pageTitle}>Booking Invoice</Text>
                    <Text style={BookingInvoiceStyle.pageSubtitle}>Review your balance and download the booking invoice.</Text>

                    <View style={BookingInvoiceStyle.metaContainer}>
                        <View style={BookingInvoiceStyle.metaRow}>
                            <View style={BookingInvoiceStyle.metaItem}>
                                <Text style={BookingInvoiceStyle.metaLabel}>Reference</Text>
                                <Text style={BookingInvoiceStyle.metaValue}>{reference}</Text>
                            </View>
                            <View style={BookingInvoiceStyle.metaItem}>
                                <Text style={BookingInvoiceStyle.metaLabel}>Package</Text>
                                <Text style={BookingInvoiceStyle.metaValue} numberOfLines={1}>{packageName}</Text>
                            </View>
                            <View style={[BookingInvoiceStyle.metaItem, { width: '100%' }]}>
                                <Text style={BookingInvoiceStyle.metaLabel}>Travel Date</Text>
                                <Text style={BookingInvoiceStyle.metaValue}>{formattedTravelDate}</Text>
                            </View>
                        </View>

                        <View style={BookingInvoiceStyle.statsRow}>
                            <View style={BookingInvoiceStyle.statCard}>
                                <Text style={BookingInvoiceStyle.statLabel}>Total Price</Text>
                                <Text style={BookingInvoiceStyle.statAmount}>{formatCurrency(totalPrice)}</Text>
                            </View>
                            <View style={BookingInvoiceStyle.statCard}>
                                <Text style={BookingInvoiceStyle.statLabel}>Paid Amount</Text>
                                <Text style={BookingInvoiceStyle.statAmount}>{formatCurrency(paidAmount)}</Text>
                            </View>
                            <View style={[BookingInvoiceStyle.statCard, BookingInvoiceStyle.statHighlight]}>
                                <Text style={BookingInvoiceStyle.statLabel}>Balance</Text>
                                <Text style={[BookingInvoiceStyle.statAmount, remainingBalance > 0 && BookingInvoiceStyle.statAmountRed]}>{formatCurrency(remainingBalance)}</Text>
                                <Text style={[BookingInvoiceStyle.statusTag, { backgroundColor: paymentStatus.bg, color: paymentStatus.color }]}>
                                    {paymentStatus.label}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={{ marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8faff', borderWidth: 1, borderColor: '#305797', borderRadius: 8, paddingVertical: 12, gap: 8 }}
                            onPress={handleViewInvoice}
                        >
                            <Ionicons name="document-text-outline" size={18} color="#305797" />
                            <Text style={{ fontFamily: "Montserrat_600SemiBold", fontSize: 13, color: '#305797' }}>Preview Booking Invoice</Text>
                        </TouchableOpacity>
                    </View>

                    {remainingBalance > 0 && booking?.status !== 'Cancelled' && rawBooking?.computedStatus !== 'Cancelled' && (
                        <View style={BookingInvoiceStyle.card}>
                            <Text style={BookingInvoiceStyle.cardTitle}>Payment Methods</Text>
                            <Text style={[BookingInvoiceStyle.pageSubtitle, { marginBottom: 16 }]}>Select a payment method to complete your booking.</Text>

                            <View style={BookingInvoiceStyle.methodGridContainer}>
                                <TouchableOpacity
                                    style={[
                                        BookingInvoiceStyle.methodGridCard,
                                        method === 'paymongo' && BookingInvoiceStyle.methodGridCardSelected,
                                        hasPendingTransaction && { opacity: 0.45 }
                                    ]}
                                    onPress={() => setMethod('paymongo')}
                                    activeOpacity={0.9}
                                    disabled={hasPendingTransaction}
                                >
                                    <View style={BookingInvoiceStyle.methodRadioHeader}>
                                        <View style={[BookingInvoiceStyle.radioCircle, method === 'paymongo' && BookingInvoiceStyle.radioCircleSelected]}>
                                            {method === 'paymongo' && <View style={BookingInvoiceStyle.radioInner} />}
                                        </View>
                                    </View>
                                    <Text style={BookingInvoiceStyle.modeTitle}>Paymongo</Text>
                                    <Text style={BookingInvoiceStyle.modeDesc}>Pay securely via Credit Card, GCash, or Maya. Rates depend on the transaction method.</Text>
                                    <Text style={[BookingInvoiceStyle.modeNote, { color: '#ef4444', fontStyle: 'italic', marginTop: 8 }]}>
                                        Note: The rate for using this payment method is 3.5%.
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        BookingInvoiceStyle.methodGridCard,
                                        method === 'manual' && BookingInvoiceStyle.methodGridCardSelected,
                                        hasPendingTransaction && { opacity: 0.45 }
                                    ]}
                                    onPress={() => setMethod('manual')}
                                    activeOpacity={0.9}
                                    disabled={hasPendingTransaction}
                                >
                                    <View style={BookingInvoiceStyle.methodRadioHeader}>
                                        <View style={[BookingInvoiceStyle.radioCircle, method === 'manual' && BookingInvoiceStyle.radioCircleSelected]}>
                                            {method === 'manual' && <View style={BookingInvoiceStyle.radioInner} />}
                                        </View>
                                    </View>
                                    <Text style={BookingInvoiceStyle.modeTitle}>Manual Payment</Text>
                                    <Text style={BookingInvoiceStyle.modeDesc}>Direct deposit. You will need to upload proof of payment for manual verification by our team.</Text>
                                    <Text style={[BookingInvoiceStyle.modeNote, { color: '#ef4444', fontStyle: 'italic', marginTop: 8 }]}>
                                        Note: The verification of your payment may take up to 1-2 business days.
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {method === 'manual' && !hasPendingTransaction && (
                                <View style={BookingInvoiceStyle.manualBankSection}>
                                    <Text style={[BookingInvoiceStyle.cardTitle, { fontSize: 16, marginBottom: 12 }]}>Available Bank Accounts</Text>
                                    <View style={BookingInvoiceStyle.bankGrid}>
                                        {[
                                            { name: 'BDO Unibank', acc: '0012-3456-7890' },
                                            { name: 'BPI', acc: '9876-5432-10' },
                                            { name: 'Metro Bank', acc: '0012-3456-7890' },
                                            { name: 'Land Bank', acc: '9876-5432-10' },
                                        ].map((bank, index) => (
                                            <View key={index} style={BookingInvoiceStyle.bankGridCard}>
                                                <Text style={BookingInvoiceStyle.bankName}>{bank.name}</Text>
                                                <Text style={BookingInvoiceStyle.bankAccount}>{bank.acc}</Text>
                                                <Text style={BookingInvoiceStyle.bankHolder}>M&RC TRAVEL AND TOURS</Text>
                                            </View>
                                        ))}
                                    </View>

                                    <View style={BookingInvoiceStyle.uploadSection}>
                                        <Text style={BookingInvoiceStyle.uploadTitle}>Upload Proof of Payment</Text>
                                        <Text style={BookingInvoiceStyle.uploadSubtitle}>Please upload a clear screenshot or photo of your deposit slip.</Text>

                                        <TouchableOpacity style={BookingInvoiceStyle.selectImageBtn} onPress={pickImage}>
                                            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                                            <Text style={BookingInvoiceStyle.selectImageBtnText}>Select Receipt Image</Text>
                                        </TouchableOpacity>

                                        <View style={BookingInvoiceStyle.imagePreviewContainer}>
                                            <Text style={BookingInvoiceStyle.previewImageLabel}>Preview</Text>
                                            <View style={BookingInvoiceStyle.previewImageBox}>
                                                {proofImage ? (
                                                    <View style={BookingInvoiceStyle.imageWrapper}>
                                                        <Image source={{ uri: proofImage.uri }} style={BookingInvoiceStyle.previewSelectedImage} resizeMode="contain" />
                                                        <TouchableOpacity style={BookingInvoiceStyle.removeImageBtn} onPress={() => setProofImage(null)}>
                                                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                                        </TouchableOpacity>
                                                    </View>
                                                ) : (
                                                    <Text style={BookingInvoiceStyle.noImageText}>No image selected</Text>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            )}

                            <View style={BookingInvoiceStyle.checkoutSection}>
                                <Text style={BookingInvoiceStyle.checkoutTitle}>Amount to Pay</Text>
                                <Text style={BookingInvoiceStyle.checkoutAmount}>
                                    {hasPendingTransaction ? 'Pending Payments...' : formatCurrency(remainingBalance)}
                                </Text>

                                <TouchableOpacity
                                    style={[
                                        BookingInvoiceStyle.checkoutButton,
                                        hasPendingTransaction && { backgroundColor: '#d1d5db' }
                                    ]}
                                    onPress={handleProceedClick}
                                    disabled={paymentLoading || hasPendingTransaction}
                                >
                                    {paymentLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={BookingInvoiceStyle.checkoutButtonText}>Confirm & Proceed</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={BookingInvoiceStyle.card}>
                        <Text style={BookingInvoiceStyle.cardTitle}>Transaction History</Text>

                        <View style={BookingInvoiceStyle.noticeBox}>
                            <Text style={BookingInvoiceStyle.noticeText}>
                                <Text style={{ fontFamily: 'Montserrat_700Bold' }}>Note:</Text> Using a PayMongo gateway has a convenience fee of 3.5% and ₱15.
                            </Text>
                        </View>

                        {transactions.length === 0 ? (
                            <Text style={{ color: '#888', marginTop: 10 }}>No transactions yet.</Text>
                        ) : (
                            transactions.map((txn, index) => (
                                <View key={index} style={BookingInvoiceStyle.txnCard}>
                                    <View style={BookingInvoiceStyle.txnRow}>
                                        <Text style={BookingInvoiceStyle.txnLabel}>Date:</Text>
                                        <Text style={BookingInvoiceStyle.txnValue}>{dayjs(txn.createdAt).format("MMM D, YYYY")}</Text>
                                    </View>
                                    <View style={BookingInvoiceStyle.txnRow}>
                                        <Text style={BookingInvoiceStyle.txnLabel}>Method:</Text>
                                        <Text style={BookingInvoiceStyle.txnValue}>{txn.method || "N/A"}</Text>
                                    </View>
                                    <View style={[BookingInvoiceStyle.txnRow, { marginTop: 8 }]}>
                                        <Text style={BookingInvoiceStyle.txnLabel}>Amount:</Text>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={BookingInvoiceStyle.txnValue}>{formatCurrency(txn.amount)}</Text>
                                            <Text style={[BookingInvoiceStyle.statusTag, {
                                                backgroundColor: (txn.status === "Successful" || txn.status === "Paid") ? '#f6ffed' : '#fffbe6',
                                                color: (txn.status === "Successful" || txn.status === "Paid") ? '#389e0d' : '#d48806',
                                                marginTop: 4
                                            }]}>
                                                {txn.status}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>

                    <View style={BookingInvoiceStyle.card}>
                        <Text style={BookingInvoiceStyle.cardTitle}>Travelers Information</Text>
                        <Text style={[BookingInvoiceStyle.pageSubtitle, { marginBottom: 16 }]}>Review and update traveler information as needed.</Text>

                        {travelersWithDocs.length === 0 ? (
                            <Text style={{ color: '#888' }}>No traveler information available yet.</Text>
                        ) : (
                            travelersWithDocs.map((traveler, index) => (
                                <View key={index} style={BookingInvoiceStyle.travelerDocSection}>
                                    <Text style={BookingInvoiceStyle.travelerName}>
                                        Traveler {index + 1}: {traveler.firstName} {traveler.lastName}
                                    </Text>
                                    <Text style={[BookingInvoiceStyle.pageSubtitle, { marginBottom: 12 }]}>Please confirm the traveler's details below. Update any incorrect information before finalizing.</Text>

                                    <View style={BookingInvoiceStyle.travelerDetailsRow}>
                                        <Text style={BookingInvoiceStyle.travelerDetailText}>Title: <Text style={{ fontFamily: 'Roboto_500Medium', color: '#333' }}>{traveler.title}</Text></Text>
                                        <Text style={BookingInvoiceStyle.travelerDetailText}>Room: <Text style={{ fontFamily: 'Roboto_500Medium', color: '#333' }}>{traveler.roomType}</Text></Text>
                                        <Text style={BookingInvoiceStyle.travelerDetailText}>Birthday: <Text style={{ fontFamily: 'Roboto_500Medium', color: '#333' }}>{safeDate(traveler.birthday)}</Text></Text>
                                        <Text style={BookingInvoiceStyle.travelerDetailText}>Age: <Text style={{ fontFamily: 'Roboto_500Medium', color: '#333' }}>{traveler.age}</Text></Text>
                                        <Text style={BookingInvoiceStyle.travelerDetailText}>Passenger Type: <Text style={{ fontFamily: 'Roboto_500Medium', color: '#333' }}>{traveler.passengerType}</Text></Text>
                                        <Text style={BookingInvoiceStyle.travelerDetailText}>Passport #: <Text style={{ fontFamily: 'Roboto_500Medium', color: '#333' }}>{traveler.passportNo}</Text></Text>
                                        <Text style={[BookingInvoiceStyle.travelerDetailText, { width: '100%' }]}>Expiry: <Text style={{ fontFamily: 'Roboto_500Medium', color: '#333' }}>{safeDate(traveler.passportExpiry)}</Text></Text>
                                    </View>

                                    <View style={BookingInvoiceStyle.docGrid}>
                                        {traveler.passportFile ? (
                                            <View style={BookingInvoiceStyle.docCol}>
                                                <Text style={BookingInvoiceStyle.docLabel}>Passport / ID</Text>
                                                <Image source={{ uri: traveler.passportFile }} style={BookingInvoiceStyle.docImage} resizeMode="cover" />
                                            </View>
                                        ) : (
                                            <View style={BookingInvoiceStyle.docCol}>
                                                <Text style={{ color: '#aaa', fontSize: 12 }}>No Passport Uploaded</Text>
                                            </View>
                                        )}

                                        {traveler.photoFile ? (
                                            <View style={BookingInvoiceStyle.docCol}>
                                                <Text style={BookingInvoiceStyle.docLabel}>2x2 Photo</Text>
                                                <Image source={{ uri: traveler.photoFile }} style={BookingInvoiceStyle.docImage} resizeMode="cover" />
                                            </View>
                                        ) : (
                                            <View style={BookingInvoiceStyle.docCol}>
                                                <Text style={{ color: '#aaa', fontSize: 12 }}>No Photo Uploaded</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))
                        )}
                    </View>

                    <View style={BookingInvoiceStyle.card}>
                        <Text style={BookingInvoiceStyle.cardTitle}>Booking Registration</Text>
                        <Text style={{ color: '#555', marginBottom: 16 }}>Download your complete registration forms and terms & conditions.</Text>

                        <TouchableOpacity
                            style={BookingInvoiceStyle.pdfButton}
                            onPress={handleDownloadRegistrationForms}
                            disabled={isGeneratingPdf}
                        >
                            {isGeneratingPdf ? (
                                <ActivityIndicator color="#305797" />
                            ) : (
                                <>
                                    <Ionicons name="document-text-outline" size={20} color="#305797" />
                                    <Text style={BookingInvoiceStyle.pdfButtonText}>Download Registration PDF</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            )}

            <Modal visible={isProceedModalOpen} transparent animationType="fade">
                <View style={BookingInvoiceStyle.modalOverlay}>
                    <View style={BookingInvoiceStyle.modalBox}>
                        <TouchableOpacity style={BookingInvoiceStyle.closeIcon} onPress={() => setIsProceedModalOpen(false)}>
                            <Ionicons name="close" size={24} color="#9ca3af" />
                        </TouchableOpacity>

                        <Text style={BookingInvoiceStyle.modalTitle}>Proceed to Payment</Text>
                        <Text style={BookingInvoiceStyle.modalSubtitle}>Are you sure you want to proceed with the payment?</Text>

                        <View style={BookingInvoiceStyle.modalButtonRow}>
                            <TouchableOpacity style={BookingInvoiceStyle.proceedBtn} onPress={executePaymentFlow}>
                                <Text style={BookingInvoiceStyle.proceedBtnText}>Proceed</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={BookingInvoiceStyle.cancelBtn} onPress={() => setIsProceedModalOpen(false)}>
                                <Text style={BookingInvoiceStyle.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={showInvoiceModal} animationType="slide" transparent={true}>
                <View style={PaymentStyle.invModalOverlay}>
                    <SafeAreaView style={{ flex: 1, width: '100%', padding: 15, justifyContent: 'center' }}>
                        <View style={PaymentStyle.invPaper}>
                            <TouchableOpacity style={PaymentStyle.invCloseBtn} onPress={() => setShowInvoiceModal(false)}>
                                <Ionicons name="close-circle" size={28} color="#b54747" />
                            </TouchableOpacity>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={PaymentStyle.invHeader}>
                                    <View style={PaymentStyle.invCompanyBlock}>
                                        <Image source={require('../../assets/images/Logored.png')} style={PaymentStyle.invLogo} resizeMode="contain" />
                                        <View style={PaymentStyle.invCompanyDetails}>
                                            <Text style={PaymentStyle.invCompanyName}>M&RC Travel and Tours</Text>
                                            <Text style={PaymentStyle.invMutedText}>2nd Floor #1 Cor Fatima street, San Antonio Avenue Valley 1</Text>
                                            <Text style={PaymentStyle.invMutedText}>Parañaque City, Philippines</Text>
                                            <Text style={PaymentStyle.invMutedText}>1709 PHL</Text>
                                            <Text style={PaymentStyle.invMutedText}>+63 969 055 4806</Text>
                                            <Text style={PaymentStyle.invMutedText}>info1@mrctravels.com</Text>
                                        </View>
                                    </View>
                                    <View style={PaymentStyle.invTitleBlock}>
                                        <Text style={PaymentStyle.invTitleText}>Invoice {booking?.invoiceNumber || (booking?.invoice && booking.invoice.number) || invoiceNumber}</Text>
                                    </View>
                                </View>

                                <View style={PaymentStyle.invDivider} />

                                <View style={PaymentStyle.invBillRow}>
                                    <View style={PaymentStyle.invBillTo}>
                                        <Text style={PaymentStyle.invTinyLabel}>BILL TO</Text>
                                        <Text style={PaymentStyle.invCustomerName}>{customerName.toUpperCase()}</Text>
                                        <Text style={PaymentStyle.invMutedText}>{bookingDetails?.leadContact || user?.phonenum || '--'}</Text>
                                        <Text style={PaymentStyle.invMutedText}>Reference: {reference}</Text>
                                        <Text style={PaymentStyle.invMutedText}>Travel Date: {formattedTravelDate}</Text>
                                    </View>
                                    <View style={PaymentStyle.invSummaryGrid}>
                                        <View style={PaymentStyle.invSummaryCol}>
                                            <Text style={PaymentStyle.invTinyLabel}>DATE</Text>
                                            <Text style={PaymentStyle.invSummaryValue}>{issueDate.format('MM/DD/YYYY')}</Text>
                                        </View>
                                        <View style={[PaymentStyle.invSummaryCol, PaymentStyle.invDarkBg]}>
                                            <Text style={[PaymentStyle.invTinyLabel, { color: '#fff' }]}>TOTAL PRICE</Text>
                                            <Text style={[PaymentStyle.invSummaryValue, { color: '#fff' }]} numberOfLines={2}>
                                                PHP {formatPesoNumber(previewTotalAmount)}
                                            </Text>
                                        </View>
                                        <View style={PaymentStyle.invSummaryCol}>
                                            <Text style={PaymentStyle.invTinyLabel}>DUE DATE</Text>
                                            <Text style={PaymentStyle.invSummaryValue}>{dueDateDisplay.format('MM/DD/YYYY')}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={PaymentStyle.invTable}>
                                    <View style={PaymentStyle.invTableHeader}>
                                        <Text style={[PaymentStyle.invCell, { flex: 1.5 }]}>DATE</Text>
                                        <Text style={[PaymentStyle.invCell, { flex: 2 }]}>ACTIVITY</Text>
                                        <Text style={[PaymentStyle.invCell, { flex: 3 }]}>DESCRIPTION</Text>
                                        <Text style={[PaymentStyle.invCell, { flex: 1, textAlign: 'center' }]}>QTY</Text>
                                        <Text style={[PaymentStyle.invCell, { flex: 1.5, textAlign: 'right' }]}>RATE</Text>
                                        <Text style={[PaymentStyle.invCell, { flex: 1.5, textAlign: 'right' }]}>AMOUNT</Text>
                                    </View>
                                    {previewInvoiceItems.map((item, idx) => (
                                        <View key={`inv-row-${idx}`} style={PaymentStyle.invTableRow}>
                                            <Text style={[PaymentStyle.invCell, { flex: 1.5 }]}>{dayjs(item.date).format('MM/DD/YYYY')}</Text>
                                            <Text style={[PaymentStyle.invCell, { flex: 2 }]}>{item.activity}</Text>
                                            <Text style={[PaymentStyle.invCell, { flex: 3 }]} numberOfLines={2}>{item.description}</Text>
                                            <Text style={[PaymentStyle.invCell, { flex: 1, textAlign: 'center' }]}>{item.qty}</Text>
                                            <Text style={[PaymentStyle.invCell, { flex: 1.5, textAlign: 'right' }]}>PHP {formatPesoNumber(item.rate)}</Text>
                                            <Text style={[PaymentStyle.invCell, { flex: 1.5, textAlign: 'right' }]}>PHP {formatPesoNumber(Number(item.qty || 0) * Number(item.rate || 0))}</Text>
                                        </View>
                                    ))}
                                </View>

                                {paymentMode === 'Deposit' && paymentSchedule.length > 0 && (
                                    <View style={PaymentStyle.invScheduleSection}>
                                        <Text style={[PaymentStyle.invScheduleLabel, { marginBottom: 8 }]}>PAYMENT SCHEDULE ({String(paymentFrequency).toUpperCase()})</Text>
                                        <View style={PaymentStyle.invScheduleHeaderRow}>
                                            <Text style={[PaymentStyle.invScheduleLabel, { flex: 1.7 }]}>DESCRIPTION</Text>
                                            <Text style={[PaymentStyle.invScheduleLabel, { flex: 1.4 }]}>DUE DATE</Text>
                                            <Text style={[PaymentStyle.invScheduleLabel, { flex: 1.3, textAlign: 'right' }]}>AMOUNT</Text>
                                            <Text style={[PaymentStyle.invScheduleLabel, { flex: 1, textAlign: 'right' }]}>STATUS</Text>
                                        </View>
                                        {paymentSchedule.map((row, idx) => (
                                            <View key={`sched-row-${idx}`} style={PaymentStyle.invScheduleRow}>
                                                <Text style={[PaymentStyle.invCell, { flex: 1.7 }]}>{row.label}</Text>
                                                <Text style={[PaymentStyle.invCell, { flex: 1.4 }]}>{dayjs(row.date).format('MMM D, YYYY')}</Text>
                                                <Text style={[PaymentStyle.invCell, { flex: 1.3, textAlign: 'right' }]}>PHP {formatPesoNumber(row.amount)}</Text>
                                                <Text
                                                    style={[
                                                        PaymentStyle.invCell,
                                                        {
                                                            flex: 1,
                                                            textAlign: 'right',
                                                            fontFamily: 'Montserrat_700Bold',
                                                            color: row.status === 'PAID' ? '#389e0d' : '#d97706',
                                                        },
                                                    ]}
                                                >
                                                    {row.status}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                <View style={PaymentStyle.invFooter}>
                                    <View style={[PaymentStyle.invBankInfo, { flex: 1 }]}>
                                        <Text style={[PaymentStyle.invMutedText, { marginBottom: 10 }]}>Payment to be deposited in below bank details:</Text>
                                        <Text style={PaymentStyle.invTinyLabel}>PESO ACCOUNT:</Text>
                                        <Text style={PaymentStyle.invMutedText}>BANK: BDO UNIBANK - TRIDENT TOWER BRANCH</Text>
                                        <Text style={PaymentStyle.invMutedText}>ACCOUNT NAME: M&RC TRAVEL AND TOURS</Text>
                                        <Text style={PaymentStyle.invMutedText}>ACCOUNT NUMBER: 006830132692</Text>
                                    </View>
                                    <View style={[PaymentStyle.invTotalContainer, { flex: 1.5 }]}>
                                        <View style={PaymentStyle.invTotalRow}>
                                            <Text style={PaymentStyle.invTotalLabel}>TOTAL PRICE</Text>
                                            <Text style={PaymentStyle.invTotalValue}>PHP {formatPesoNumber(previewTotalAmount)}</Text>
                                        </View>
                                        <View style={[PaymentStyle.invTotalRow, { borderTopWidth: 0 }]}>
                                            <Text style={PaymentStyle.invTotalLabel}>PAID TO DATE</Text>
                                            <Text style={PaymentStyle.invTotalValue}>PHP {formatPesoNumber(paidAmount)}</Text>
                                        </View>
                                        <View style={[PaymentStyle.invTotalRow, { backgroundColor: '#f4f6f8', paddingHorizontal: 4, paddingVertical: 10 }]}>
                                            <Text style={[PaymentStyle.invTotalLabel, { color: '#b91c1c' }]}>REMAINING BAL.</Text>
                                            <Text style={[PaymentStyle.invTotalValue, { color: '#b91c1c' }]}>PHP {formatPesoNumber(Math.max(previewTotalAmount - paidAmount, 0))}</Text>
                                        </View>
                                        <Text style={[PaymentStyle.invThankYou, { marginTop: 5 }]}>THANK YOU.</Text>
                                    </View>
                                </View>
                            </ScrollView>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>

        </SafeAreaView>
    );
}