import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, StatusBar, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking'; 

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import AdminSidebar from "../../components/AdminSidebar";
import BookingInvoiceStyle from "../../styles/clientstyles/BookingInvoiceStyle";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";
import { generateBookingInvoicePdf } from "../../utils/bookingInvoicePdf"; 

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
    const [invoicePdfUrl, setInvoicePdfUrl] = useState("");

    const bookingDetails = booking?.bookingDetails || {};
    const reference = booking?.reference || booking?.ref || "--";

    useEffect(() => {
        if (!reference || reference === "--") {
            setLoading(false);
            return;
        }
        const fetchAllData = async () => {
            try {
                const bookingRes = await api.get(`/booking/by-reference/${reference}`, withUserHeader(user?._id));
                setBooking(bookingRes.data?.booking || rawBooking);
                setTransactions(bookingRes.data?.transactions || []);
            } catch (err) {
                console.error("Failed to load live booking details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [reference, user?._id]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency", currency: "PHP", minimumFractionDigits: 2, maximumFractionDigits: 2
        }).format(Number(value || 0));
    };

    const totalPrice = Number(booking?.totalPrice || bookingDetails?.totalPrice || 0);
    const paidAmount = transactions
        .filter(txn => txn.status === "Paid" || txn.status === "Successful" || txn.status === "Fully Paid")
        .reduce((sum, txn) => sum + Number(txn.amount || 0), 0);

    const remainingBalance = Math.max(totalPrice - paidAmount, 0);

    const transactionStatus = transactions.length === 0 ? "Pending" : (paidAmount >= totalPrice ? "Fully Paid" : "Partial");
    const getPaymentStatus = () => {
        if (booking?.status === 'Cancelled' || booking?.status === 'cancellation requested') return { label: booking.status, color: "#555", bg: "#eee" };
        if (transactionStatus === "Fully Paid" || transactionStatus === "Paid") return { label: "Fully Paid", color: "#389e0d", bg: "#f6ffed" };
        if (transactionStatus === "Pending") return { label: "Not Paid", color: "#cf1322", bg: "#fff1f0" };
        return { label: "Balance Due", color: "#d48806", bg: "#fffbe6" };
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
        } else if (typeof booking?.travelDate === 'string') {
            formattedTravelDate = booking.travelDate;
        } else if (bookingDetails?.travelDate) {
            formattedTravelDate = bookingDetails.travelDate;
        }
    } catch(e) { formattedTravelDate = '--'; }

    const handleViewInvoice = () => {
        if (invoicePdfUrl) {
            Linking.openURL(invoicePdfUrl);
        } else {
            Alert.alert("Generating...", "Please wait a moment while the invoice is generated.");
        }
    };

    useEffect(() => {
        if (!booking) return;
        try {
            const travelersCount = Number(booking?.travelers || bookingDetails?.travelers?.length || 1);
            const invoiceData = {
                company: { name: "M&RC Travel and Tours", address: "Parañaque City, Philippines", email: "info@mrc-travel.com", phone: "+63 9690554806" },
                invoice: { number: reference, issueDate: dayjs(booking?.createdAt).format("MMM D, YYYY"), status: remainingBalance > 0 ? "Unpaid" : "Paid" },
                customer: { name: bookingDetails.leadFullName || "Customer", email: user?.email || "N/A", phone: bookingDetails.leadContact || "N/A" },
                booking: { reference, packageName, travelDates: formattedTravelDate, travelers: travelersCount },
                items: [{ description: packageName, qty: 1, rate: totalPrice, amount: totalPrice }],
                subtotal: totalPrice, tax: 0, totalWithTax: totalPrice,
            };
            const { dataUri } = generateBookingInvoicePdf(invoiceData);
            setInvoicePdfUrl(dataUri);
        } catch (_error) {
            setInvoicePdfUrl("");
        }
    }, [booking, remainingBalance, totalPrice, formattedTravelDate]);

    // 🔥 "UNIVERSAL TRANSLATOR" FOR TRAVELERS 🔥
    const baseTravelers = Array.isArray(bookingDetails?.travelers) 
        ? bookingDetails.travelers 
        : Array.isArray(bookingDetails?.passengers) ? bookingDetails.passengers : [];
        
    const fallbackPassports = bookingDetails?.passportFiles || booking?.passportFiles || [];
    const fallbackPhotos = bookingDetails?.photoFiles || booking?.photoFiles || [];

    const travelersWithDocs = baseTravelers.map((t, i) => {
        const rawPassport = t.passportFile || fallbackPassports[i] || null;
        const rawPhoto = t.photoFile || fallbackPhotos[i] || null;
        return {
            title: t.title || 'MR',
            firstName: t.firstName || 'Unknown',
            lastName: t.lastName || '',
            roomType: t.roomType || t.room || 'N/A', 
            age: t.age?.toString() || 'N/A', 
            birthday: t.birthday || t.bday || t.birthdate || null, 
            passportNo: t.passportNo || t.passport || 'N/A', 
            passportExpiry: t.passportExpiry || t.expiry || null, 
            passportFile: typeof rawPassport === 'string' ? rawPassport : rawPassport?.uri || null,
            photoFile: typeof rawPhoto === 'string' ? rawPhoto : rawPhoto?.uri || null,
        };
    });

    const safeDate = (dateStr) => {
        if (!dateStr || dateStr === 'N/A' || dateStr === '') return 'N/A';
        const d = dayjs(dateStr);
        return d.isValid() ? d.format('MMM D, YYYY') : dateStr;
    };

    // --- EXACT A4 PDF LAYOUT FROM SCREENSHOTS ---
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
                            
                            <div style="border: 1px solid #000; padding: 15px; margin-top: 15px; border-radius: 4px;">
                                <div style="font-weight: bold; font-size: 11px; margin-bottom: 10px;">TRAVEL INSURANCE</div>
                                <p style="font-size: 9px; margin-bottom: 15px;">We highly encourage <strong>ALL OUR CLIENTS</strong> to have and are covered with travel insurance for health, repatriation, loss of luggage/belongings and in case of cancellation, flight delays, and the like that is why purchasing of travel insurance together with our tour packages is compulsory for your convenience and peace of mind.</p>
                                
                                <table style="width: 100%; border: none;">
                                    <tr>
                                        <td style="border: none; padding: 0; width: 90%;"><strong>Do you agree to purchase a Travel Insurance from us?</strong></td>
                                        <td style="border: none; text-align: right;"><div class="yes-no-box">${bookingDetails?.purchaseInsurance === 'Y' ? 'Y' : 'N'}</div></td>
                                    </tr>
                                </table>
                                <p style="font-style: italic; font-size: 8px; color: #555; margin-bottom: 15px;">Note: Purchasing of travel insurance from our Travel & Tours company does not hold us liable for any claims and anything about the process of claims from the insurance company. We can only provide the documents from our suppliers, operators, and airlines' end if necessary.</p>
                                
                                <table style="margin: 0;">
                                    <tr>
                                        <td style="width: 35%; text-align: right; font-weight: bold; border: 1px solid #000; background-color: #fff;">If YES, please indicate details:</td>
                                        <td style="font-style: italic; font-size: 9px; border: 1px solid #000;">Please check the conditions and coverage carefully and send us a copy of the policy so we can review as well.</td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: right; font-weight: bold; border: 1px solid #000; background-color: #fff;">If NO but chose not to purchase Travel Insurance from us:</td>
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

                        <div class="page">
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
                                <Text style={[BookingInvoiceStyle.statAmount, BookingInvoiceStyle.statAmountRed]}>{formatCurrency(remainingBalance)}</Text>
                                <Text style={[BookingInvoiceStyle.statusTag, { backgroundColor: paymentStatus.bg, color: paymentStatus.color }]}>
                                    {paymentStatus.label}
                                </Text>
                            </View>
                        </View>

                        {/* 🔥 RESTORED "VIEW INVOICE PDF" BUTTON 🔥 */}
                        <TouchableOpacity 
                            style={{ marginTop: 15, backgroundColor: '#e6f7ff', borderWidth: 1, borderColor: '#305797', padding: 12, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }} 
                            onPress={handleViewInvoice}
                        >
                            <Ionicons name="receipt-outline" size={18} color="#305797" style={{ marginRight: 8 }} />
                            <Text style={{ color: '#305797', fontFamily: 'Montserrat_600SemiBold' }}>Preview Booking Invoice</Text>
                        </TouchableOpacity>
                    </View>

                    {/* --- 2. DOCUMENTS --- */}
                    <View style={BookingInvoiceStyle.card}>
                        <Text style={BookingInvoiceStyle.cardTitle}>Traveler Documents</Text>
                        
                        {travelersWithDocs.length === 0 ? (
                            <Text style={{ color: '#888' }}>No documents uploaded yet.</Text>
                        ) : (
                            travelersWithDocs.map((traveler, index) => (
                                <View key={index} style={BookingInvoiceStyle.travelerDocSection}>
                                    <Text style={BookingInvoiceStyle.travelerName}>
                                        Traveler {index + 1}: {traveler.firstName} {traveler.lastName}
                                    </Text>
                                    
                                    <View style={BookingInvoiceStyle.travelerDetailsRow}>
                                        <Text style={BookingInvoiceStyle.travelerDetailText}>Title: {traveler.title}</Text>
                                        <Text style={BookingInvoiceStyle.travelerDetailText}>Room: {traveler.roomType}</Text>
                                        <Text style={BookingInvoiceStyle.travelerDetailText}>Age: {traveler.age}</Text>
                                        <Text style={BookingInvoiceStyle.travelerDetailText}>Passport: {traveler.passportNo}</Text>
                                        <Text style={BookingInvoiceStyle.travelerDetailText}>Birthday: {safeDate(traveler.birthday)}</Text>
                                        <Text style={BookingInvoiceStyle.travelerDetailText}>Expiry: {safeDate(traveler.passportExpiry)}</Text>
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

                    {/* --- 3. TRANSACTION HISTORY --- */}
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
                                        <Text style={BookingInvoiceStyle.txnLabel}>Date</Text>
                                        <Text style={BookingInvoiceStyle.txnValue}>{dayjs(txn.createdAt).format("MMM D, YYYY")}</Text>
                                    </View>
                                    <View style={BookingInvoiceStyle.txnRow}>
                                        <Text style={BookingInvoiceStyle.txnLabel}>Method</Text>
                                        <Text style={BookingInvoiceStyle.txnValue}>{txn.method || "N/A"}</Text>
                                    </View>
                                    <View style={[BookingInvoiceStyle.txnRow, { marginTop: 8 }]}>
                                        <Text style={BookingInvoiceStyle.txnLabel}>Amount</Text>
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

                    {/* --- 4. PROCEED TO CHECKOUT BUTTON --- */}
                    {remainingBalance > 0 && booking?.status !== 'Cancelled' && booking?.status !== 'cancellation requested' && (
                        <View style={BookingInvoiceStyle.checkoutSection}>
                            <Text style={BookingInvoiceStyle.checkoutTitle}>Amount to Pay</Text>
                            <Text style={BookingInvoiceStyle.checkoutAmount}>{formatCurrency(remainingBalance)}</Text>
                            
                            <TouchableOpacity 
                                style={BookingInvoiceStyle.checkoutButton} 
                                onPress={() => navigation.navigate('paymentmethod', { 
                                    setupData: bookingDetails, 
                                    amountToPay: remainingBalance,
                                    paymentType: 'Full Payment',
                                    passengers: travelersWithDocs,
                                    leadGuestInfo: {
                                        fullName: bookingDetails.leadFullName || '',
                                        title: bookingDetails.leadTitle || '',
                                        contact: bookingDetails.leadContact || '',
                                        address: bookingDetails.leadAddress || ''
                                    },
                                    medicalData: {
                                        dietary: bookingDetails.dietaryDetails || '',
                                        conditions: bookingDetails.medicalDetails || ''
                                    },
                                    emergency: {
                                        phone: bookingDetails.emergencyContact || '',
                                        email: bookingDetails.emergencyEmail || '',
                                        name: bookingDetails.emergencyName || '',
                                        relation: bookingDetails.emergencyRelation || ''
                                    }
                                })}
                            >
                                <Text style={BookingInvoiceStyle.checkoutButtonText}>Proceed to Payment Methods</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* --- 5. REGISTRATION PDF GENERATOR --- */}
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
        </SafeAreaView>
    );
}