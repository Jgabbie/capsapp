import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal, Image, SafeAreaView, Alert } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native'
import DateTimePicker from '@react-native-community/datetimepicker'
import dayjs from 'dayjs'
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';

import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import UserTransactionStyle from '../../styles/clientstyles/UserTransactionStyle'
import { api, withUserHeader } from '../../utils/api'
import { useUser } from '../../context/UserContext'

export default function UserTransactions() {
    const cs = useNavigation()
    const { user } = useUser()
    const [isSidebarVisible, setSidebarVisible] = useState(false)
    const [loading, setLoading] = useState(true)
    const [getTransac, setTransac] = useState([])

    const [searchText, setSearchText] = useState('')
    const [statusFilter, setStatusFilter] = useState('Status')
    const [dateFilter, setDateFilter] = useState(null)

    const [isStatusModalVisible, setStatusModalVisible] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false)

    const [selectedTransaction, setSelectedTransaction] = useState(null)
    const [isProofModalVisible, setProofModalVisible] = useState(false)
    const [isReceiptModalVisible, setReceiptModalVisible] = useState(false)

    const getCurrentUserFullName = () => {
        const fullName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim();
        return fullName || user?.username || 'Customer';
    }

    const statusOptions = useMemo(() => {
        const priority = ['Successful', 'Pending', 'Failed', 'Cancelled'];
        const available = new Set();

        getTransac.forEach((item) => {
            const status = String(item?.status || '').trim();
            if (status) available.add(status);
        });

        return priority.filter((status) => available.has(status)).concat(
            [...available].filter((status) => !priority.includes(status))
        );
    }, [getTransac])

    const formatCurrency = (value) => {
        return `₱${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getCompactInvoiceNumber = (item) => {
        const invoice = String(item?.invoiceNumber || '').trim();
        if (invoice) return invoice.replace(/^INV[-\s]*/i, '');

        const digits = String(item?.reference || '').replace(/\D/g, '');
        return digits ? digits.slice(-4) : '0000';
    };

    const getTransactionItemLabel = (item) => {
        const applicationType = String(item?.applicationType || '').trim();
        if (applicationType) return applicationType;

        return item?.bookingId?.packageId?.packageName || item?.packageName || item?.bookingId?.packageName || 'Tour Package';
    };

    const getItemType = (item) => {
        return getTransactionItemLabel(item);
    };

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!user?._id) return;
            try {
                setLoading(true);
                const response = await api.get('/transaction/my-transactions', withUserHeader(user._id))
                const transactions = response.data.transactions || response.data || [];
                setTransac(Array.isArray(transactions) ? transactions : []);
            } catch (error) {
                console.log("TRANSACTION CRASH REASON:", error.response?.data || error.message);
            } finally {
                setLoading(false)
            }
        }
        fetchTransactions()
    }, [user?._id])

    const filteredTransactions = useMemo(() => {
        return getTransac.filter((item) => {
            const text = searchText.toLowerCase();
            const pName = getTransactionItemLabel(item);

            const matchesSearch = !text ||
                pName.toLowerCase().includes(text) ||
                item.reference?.toLowerCase().includes(text) ||
                item.method?.toLowerCase().includes(text);

            const matchesStatus = statusFilter === 'Status' || statusFilter === 'All Status' ||
                item.status === statusFilter;

            const matchesDate = !dateFilter ||
                new Date(item.createdAt).toDateString() === dateFilter.toDateString();

            return matchesSearch && matchesStatus && matchesDate;
        })
    }, [getTransac, searchText, statusFilter, dateFilter])

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) setDateFilter(selectedDate);
    };

    const getStatusStyle = (status) => {
        const normalized = String(status || 'Successful').trim();
        switch (normalized) {
            case 'Failed':
            case 'Cancelled':
                return { bg: '#fff1f0', text: '#cf1322' };
            case 'Pending':
                return { bg: '#fffbe6', text: '#d48806' };
            case 'Successful':
            default:
                return { bg: '#f6ffed', text: '#389e0d' };
        }
    };

    const canViewReceipt = (status) => {
        // Always allow viewing receipts, even when status is Pending or Failed
        return true;
    };

    const handleDownloadReceipt = async () => {
        if (!selectedTransaction) return;
        try {
            const safePackageName = getTransactionItemLabel(selectedTransaction);
            const invoiceNumber = getCompactInvoiceNumber(selectedTransaction);
            const receiptDate = selectedTransaction.createdAt
                ? dayjs(selectedTransaction.createdAt).format('DD-MM-YYYY')
                : '--';
            const receiptAmount = formatCurrency(selectedTransaction.amount);

            // compute status label/color for watermark in PDF
            const rawStatus = (selectedTransaction?.status || '').toString().toLowerCase();
            const isPaid = rawStatus === 'successful';
            const statusLabel = isPaid ? 'PAID' : (rawStatus === 'pending' || rawStatus === 'failed' ? 'NOT PAID' : (selectedTransaction?.status || '').toString().toUpperCase());
            const statusColor = isPaid ? '#389e0d' : '#cf1322';

            // Load and convert logo image to base64
            const logoAsset = Asset.fromModule(require('../../assets/images/LastPushLogo.png'));
            if (!logoAsset.localUri) {
                await logoAsset.downloadAsync();
            }
            const logoPath = logoAsset.localUri || logoAsset.uri;
            const logoBase64 = await FileSystem.readAsStringAsync(logoPath, { encoding: 'base64' });
            const logoDataUri = `data:image/png;base64,${logoBase64}`;

            const htmlContent = `
                <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                        <style>
                            @page { size: A4; margin: 12mm 4mm; }
                            body { font-family: 'Helvetica', sans-serif; margin: 0; padding: 0; color: #111827; background: #fff; }
                            .paper { background: #fff; border: none; border-radius: 6px; padding: 22px 12px; min-height: 273mm; box-sizing: border-box; }
                            .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 2px solid #1f2a44; padding-bottom: 14px; margin-bottom: 18px; }
                            .header-left { display: flex; gap: 12px; align-items: flex-start; flex: 1; }
                            .logo { width: 64px; height: 64px; object-fit: contain; }
                            .company-name { color: #000; font-weight: 700; font-size: 16px; margin-bottom: 2px; }
                            .company-details { font-size: 11px; color: #555; line-height: 1.35; }
                            .title { font-size: 30px; color: #000; margin: 0; font-weight: 500; white-space: nowrap; }
                            .meta-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 0; margin-bottom: 18px; }
                            .billed-to { flex: 1; min-width: 220px; }
                            .billed-to .label { font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 5px; display: block; }
                            .billed-to .name { font-size: 16px; font-weight: 700; margin: 0; color: #000; }
                            .meta-grid { display: flex; gap: 0; min-width: 330px; }
                            .meta-box { min-width: 110px; border: 1px solid #d1d5db; padding: 12px 10px; text-align: center; }
                            .meta-box.primary { background: #1f2a44; color: #fff; border-color: #1f2a44; }
                            .meta-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: inherit; margin-bottom: 8px; display: block; }
                            .meta-value { font-size: 13px; font-weight: 700; color: inherit; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                            thead tr { border-bottom: 1px solid #000; }
                            th { background: transparent; color: #000; padding: 6px 0; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; }
                            tbody tr { border-bottom: 1px solid #000; }
                            td { padding: 8px 0; font-size: 11px; color: #6b7280; }
                            th.right, td.right { text-align: right; }
                            .bottom-grid { display: flex; justify-content: space-between; gap: 28px; align-items: flex-start; }
                            .bank { flex: 1; font-size: 11px; color: #555; line-height: 1.5; }
                            .bank-title { font-size: 11px; font-weight: 700; color: #1f2a44; text-transform: uppercase; margin-bottom: 4px; }
                            .bank-section { margin-bottom: 12px; }
                            .divider { height: 1px; background: #000; width: 72%; margin: 6px 0 10px; }
                            .summary { min-width: 240px; }
                            .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 12px; color: #6b7280; }
                            .summary-row .value { font-weight: 700; color: #000; }
                            .summary-row.total { border-top: 1px solid #000; margin-top: 6px; padding-top: 12px; font-size: 13px; }
                        </style>
                    </head>
                    <body>
                        <div class="paper" style="position:relative;">
                            <div style="position:absolute; top:45%; left:0; right:0; text-align:center; z-index:1; pointer-events:none;">
                                <div style="font-size:84px; color: ${statusColor}; opacity:0.08; font-weight:800; transform: rotate(-20deg);">${statusLabel}</div>
                            </div>
                            <div style="position:relative; z-index:2;">
                            <div class="header">
                                <div class="header-left">
                                    <img class="logo" src="${logoDataUri}" />
                                    <div>
                                        <div class="company-name">M&RC Travel and Tours</div>
                                        <div class="company-details">
                                            2nd Floor #1 Cor Fatima street, San Antonio Avenue Valley 1<br/>
                                            Parañaque City, Philippines<br/>
                                            1709 PHL<br/>
                                            +63 969 055 4806<br/>
                                            info1@mrctravels.com
                                        </div>
                                    </div>
                                </div>
                                <h1 class="title">INVOICE ${invoiceNumber}</h1>
                            </div>
                        </div>

                            <div class="meta-row">
                                <div class="billed-to">
                                    <span class="label">BILLED TO</span>
                                    <div class="name">${getCurrentUserFullName()}</div>
                                </div>
                                <div class="meta-grid">
                                    <div class="meta-box">
                                        <span class="meta-label">DATE</span>
                                        <div class="meta-value">${receiptDate}</div>
                                    </div>
                                    <div class="meta-box primary">
                                        <span class="meta-label">AMOUNT TO PAY</span>
                                        <div class="meta-value">${receiptAmount}</div>
                                    </div>
                                    <div class="meta-box">
                                        <span class="meta-label">REFERENCE</span>
                                        <div class="meta-value">${selectedTransaction.reference}</div>
                                    </div>
                                </div>
                            </div>

                            <table>
                                <thead>
                                    <tr>
                                        <th>QTY</th>
                                        <th>DESCRIPTION</th>
                                        <th class="right">UNIT PRICE</th>
                                        <th class="right">AMOUNT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>${safePackageName}</td>
                                        <td class="right">${receiptAmount}</td>
                                        <td class="right">${receiptAmount}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div class="bottom-grid">
                                <div class="bank">
                                    <div class="bank-section">
                                        <div class="bank-title">Bank Account:</div>
                                        <div>Bank: BDO UNIBANK</div>
                                        <div>Account Name: M&amp;RC Travel and Tours</div>
                                        <div>Account #: 006838032692</div>
                                    </div>

                                    <div class="bank-section">
                                        <div class="bank-title">USD Account:</div>
                                        <div>Bank: BDO UNIBANK</div>
                                        <div>Account Name: M&amp;RC Travel and Tours</div>
                                        <div>Account #: 113190015176</div>
                                    </div>

                                    <div class="divider"></div>

                                    <div class="bank-section">
                                        <div class="bank-title">GCash:</div>
                                        <div>Rhon Carle - 0968 888 0405</div>
                                        <div>Maricar Carle - 0969 055 4806</div>
                                    </div>
                                </div>

                                <div class="summary">
                                    <div class="summary-row">
                                        <span>Total</span>
                                        <span class="value">${receiptAmount}</span>
                                    </div>
                                    <div class="summary-row total">
                                        <span>Total Due</span>
                                        <span class="value">${receiptAmount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </body>
                </html>
            `;
            const { uri } = await Print.printToFileAsync({ html: htmlContent });

            // Rename the PDF to use the reference code
            const fileName = `Receipt-${selectedTransaction.reference}.pdf`;
            const newPath = `${FileSystem.documentDirectory}${fileName}`;
            await FileSystem.copyAsync({ from: uri, to: newPath });

            await Sharing.shareAsync(newPath, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: fileName });
        } catch (error) {
            console.error("PDF Error:", error);
            Alert.alert("Error", "Failed to download receipt.");
        }
    };

    const handleDownloadProof = async () => {
        if (!selectedTransaction?.proofImage) return;
        try {
            const url = selectedTransaction.proofImage;
            const fileExt = url.split('.').pop().split('?')[0] || 'jpg';
            //  FIXED: Specify exact filename for download 
            const fileUri = FileSystem.documentDirectory + `proof-of-payment-${selectedTransaction.reference}.${fileExt}`;

            const { uri } = await FileSystem.downloadAsync(url, fileUri);
            await Sharing.shareAsync(uri, { dialogTitle: 'Download Proof of Payment' });
        } catch (error) {
            //  NEW: Add detailed logging to find the error 
            console.error("Download Image Error:", error);
            console.log("Error Reason:", error.message);
            Alert.alert("Error", `Could not download image. Reason: ${error.message || 'Unknown'}`);
        }
    };


    return (
        <View style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={UserTransactionStyle.container} showsVerticalScrollIndicator={false}>

                <Text style={UserTransactionStyle.title}>My Transactions</Text>
                <Text style={UserTransactionStyle.subtitle}>View your payment history and receipts.</Text>

                <View style={UserTransactionStyle.searchRow}>
                    <View style={UserTransactionStyle.searchBar}>
                        <Ionicons name="search" size={16} color="#777" />
                        <TextInput
                            style={UserTransactionStyle.searchInput}
                            placeholder='Search reference or package...'
                            placeholderTextColor="#999"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>

                    <View style={UserTransactionStyle.dropdownGroup}>
                        <TouchableOpacity style={UserTransactionStyle.dropdownButton} onPress={() => setStatusModalVisible(true)}>
                            <Text style={UserTransactionStyle.dropdownText}>{statusFilter}</Text>
                            <Ionicons name="chevron-down" size={12} color="#305797" />
                        </TouchableOpacity>

                        <TouchableOpacity style={UserTransactionStyle.dropdownButton} onPress={() => setShowDatePicker(true)}>
                            <Text style={UserTransactionStyle.dropdownText}>
                                {dateFilter ? dayjs(dateFilter).format('MMM D, YYYY') : 'Date'}
                            </Text>
                            <Ionicons name="calendar-outline" size={12} color="#305797" />
                        </TouchableOpacity>

                        {(statusFilter !== 'Status' || dateFilter) && (
                            <TouchableOpacity onPress={() => { setStatusFilter('Status'); setDateFilter(null); }} style={{ justifyContent: 'center', paddingHorizontal: 5 }}>
                                <Ionicons name="refresh-circle" size={32} color="#ff4d4f" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#305797" style={{ marginTop: 50 }} />
                ) : filteredTransactions.length === 0 ? (
                    <View style={UserTransactionStyle.emptyContainer}>
                        <Image source={require('../../assets/images/empty_logo.png')} style={UserTransactionStyle.emptyImage} />
                        <Text style={UserTransactionStyle.emptyText}>No Transactions found</Text>
                    </View>
                ) : (
                    filteredTransactions.map((item) => {
                        const statusStyle = getStatusStyle(item.status);
                        const pName = getTransactionItemLabel(item);
                        const itemType = getItemType(item);
                        const cardTitle = itemType;
                        const allowReceiptView = canViewReceipt(item.status);

                        return (
                            <View key={item._id} style={UserTransactionStyle.transactionCard}>
                                <View style={UserTransactionStyle.cardHeader}>
                                    <Text style={UserTransactionStyle.transactionRef}>{item.reference}</Text>
                                    <View style={[UserTransactionStyle.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                        <Text style={[UserTransactionStyle.transactionStatus, { color: statusStyle.text }]}>
                                            {item.status || 'Successful'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={UserTransactionStyle.cardBody}>
                                    <Text style={UserTransactionStyle.packageName} numberOfLines={1}>{cardTitle}</Text>
                                    <View style={UserTransactionStyle.detailRow}>
                                        <Text style={UserTransactionStyle.detailLabel}>Items:</Text>
                                        <Text style={UserTransactionStyle.detailValue}>{pName}</Text>
                                    </View>
                                    <View style={UserTransactionStyle.detailRow}>
                                        {/*  FIXED LABEL: Date -> Date and Time  */}
                                        <Text style={UserTransactionStyle.detailLabel}>Date and Time:</Text>
                                        <Text style={UserTransactionStyle.detailValue}>{dayjs(item.createdAt).format('MMM D, YYYY h:mm A')}</Text>
                                    </View>
                                    <View style={UserTransactionStyle.detailRow}>
                                        {/*  FIXED LABEL: Method -> Payment Method  */}
                                        <Text style={UserTransactionStyle.detailLabel}>Payment Method:</Text>
                                        <Text style={UserTransactionStyle.detailValue}>{item.method || 'N/A'}</Text>
                                    </View>
                                    <View style={UserTransactionStyle.detailRow}>
                                        <Text style={UserTransactionStyle.detailLabel}>Amount:</Text>
                                        <Text style={UserTransactionStyle.amount}>{formatCurrency(item.amount)}</Text>
                                    </View>
                                </View>

                                <View style={UserTransactionStyle.actionButtonsRow}>
                                    {allowReceiptView ? (
                                        <TouchableOpacity
                                            style={UserTransactionStyle.viewButton}
                                            onPress={() => {
                                                setSelectedTransaction(item);
                                                setReceiptModalVisible(true);
                                            }}
                                        >
                                            <Ionicons name="receipt-outline" size={14} color="#fff" />
                                            <Text style={UserTransactionStyle.buttonText}>View</Text>
                                        </TouchableOpacity>
                                    ) : null}

                                    {item.method?.toLowerCase() === 'manual' && (
                                        <TouchableOpacity
                                            style={UserTransactionStyle.viewProofButton}
                                            onPress={() => {
                                                if (!item.proofImage) {
                                                    Alert.alert("No Proof", "No proof image available for this transaction.");
                                                    return;
                                                }
                                                setSelectedTransaction(item);
                                                setProofModalVisible(true);
                                            }}
                                        >
                                            <Ionicons name="image-outline" size={14} color="#fff" />
                                            <Text style={UserTransactionStyle.buttonText}>View Proof</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        )
                    })
                )}
            </ScrollView>

            <Modal transparent visible={isStatusModalVisible} animationType="fade">
                <TouchableOpacity style={UserTransactionStyle.receiptModalOverlay} onPress={() => setStatusModalVisible(false)} activeOpacity={1}>
                    <View style={UserTransactionStyle.modalContent}>
                        <Text style={{ textAlign: 'center', fontSize: 18, fontFamily: 'Montserrat_700Bold', color: '#305797', marginVertical: 15 }}>
                            Select Status
                        </Text>
                        {statusOptions.map((opt, index) => (
                            <TouchableOpacity
                                key={opt}
                                style={[UserTransactionStyle.modalOption, { borderTopWidth: index === 0 ? 0 : 1, borderTopColor: '#f0f0f0' }]}
                                onPress={() => { setStatusFilter(opt); setStatusModalVisible(false); }}
                            >
                                <Text style={[UserTransactionStyle.modalOptionText, { fontFamily: statusFilter === opt ? 'Montserrat_700Bold' : 'Roboto_500Medium' }]}>
                                    {opt}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {showDatePicker && (
                <DateTimePicker
                    value={dateFilter || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}

            <Modal visible={isProofModalVisible} animationType="fade" transparent={true}>
                <View style={UserTransactionStyle.receiptModalOverlay}>
                    <View style={UserTransactionStyle.proofImageContainer}>
                        <View style={UserTransactionStyle.proofHeader}>
                            {/*  FIXED TITLE: Proof of Payment -> Proof of Payment - [Reference]  */}
                            <Text style={UserTransactionStyle.proofTitle}>Proof of Payment - {selectedTransaction?.reference || ""}</Text>
                            <TouchableOpacity onPress={() => setProofModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                        {selectedTransaction?.proofImage ? (
                            <>
                                <Image
                                    source={{ uri: selectedTransaction.proofImage }}
                                    style={UserTransactionStyle.proofImage}
                                    resizeMode="contain"
                                />
                                <View style={{ width: '100%', marginTop: 15 }}>
                                    <TouchableOpacity
                                        style={{ backgroundColor: '#305797', paddingVertical: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                        onPress={handleDownloadProof}
                                    >
                                        <Ionicons name="download-outline" size={18} color="#fff" />
                                        <Text style={{ color: '#fff', fontFamily: "Montserrat_600SemiBold", fontSize: 13 }}>Download Image</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <Text>No image available</Text>
                        )}
                    </View>
                </View>
            </Modal>

            <Modal visible={isReceiptModalVisible} transparent animationType="fade" onRequestClose={() => setReceiptModalVisible(false)}>
                <View style={UserTransactionStyle.receiptModalOverlay}>
                    <SafeAreaView style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={UserTransactionStyle.receiptPaper}>
                            <TouchableOpacity style={UserTransactionStyle.receiptCloseBtn} onPress={() => setReceiptModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#1f2a44" />
                            </TouchableOpacity>

                            {selectedTransaction && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 10 }}>
                                    <View style={[UserTransactionStyle.receiptWideCanvas, { position: 'relative' }]}>
                                        {/* Watermark showing transaction status */}
                                        <View pointerEvents="none" style={{ position: 'absolute', top: '40%', left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
                                            {
                                                (() => {
                                                    const raw = (selectedTransaction?.status || '').toString().toLowerCase();
                                                    const isPaid = raw === 'successful';
                                                    const label = isPaid ? 'PAID' : (raw === 'pending' || raw === 'failed' ? 'NOT PAID' : raw.toUpperCase());
                                                    const color = isPaid ? '#389e0d' : '#cf1322';
                                                    return (
                                                        <Text style={{ fontSize: 84, color, opacity: 0.08, fontWeight: '800', transform: [{ rotate: '-20deg' }] }}>
                                                            {label}
                                                        </Text>
                                                    )
                                                })()
                                            }
                                        </View>
                                        {/* Header with logo, company, and invoice number */}
                                        <View style={UserTransactionStyle.receiptHeaderRow}>
                                            <View style={UserTransactionStyle.receiptHeaderLeft}>
                                                <Image source={require('../../assets/images/LastPushLogo.png')} style={UserTransactionStyle.receiptLogo} resizeMode="contain" />
                                                <View style={UserTransactionStyle.receiptCompanyDetails}>
                                                    <Text style={UserTransactionStyle.receiptCompanyName}>M&RC Travel and Tours</Text>
                                                    <Text style={UserTransactionStyle.receiptMutedText}>2nd Floor #1 Cor Fatima street, San Antonio Avenue Valley 1</Text>
                                                    <Text style={UserTransactionStyle.receiptMutedText}>Parañaque City, Philippines</Text>
                                                    <Text style={UserTransactionStyle.receiptMutedText}>1709 PHL </Text>
                                                    <Text style={UserTransactionStyle.receiptMutedText}>+63 969 055 4806</Text>
                                                    <Text style={UserTransactionStyle.receiptMutedText}>info1@mrctravels.com</Text>
                                                </View>
                                            </View>
                                            <View style={UserTransactionStyle.receiptInvoiceBlock}>
                                                <Text style={UserTransactionStyle.receiptInvoiceText}>INVOICE {getCompactInvoiceNumber(selectedTransaction)}</Text>
                                            </View>
                                        </View>

                                        {/* Billed To section + Meta boxes (Date, Amount to Pay, Reference) */}
                                        <View style={UserTransactionStyle.receiptMetaRow}>
                                            <View style={UserTransactionStyle.receiptBilledTo}>
                                                <Text style={UserTransactionStyle.receiptTinyLabel}>BILLED TO</Text>
                                                <Text style={UserTransactionStyle.receiptCustomerName}>{selectedTransaction.bookingId?.bookingDetails?.leadFullName || getCurrentUserFullName()}</Text>
                                            </View>

                                            <View style={UserTransactionStyle.receiptMetaGrid}>
                                                <View style={UserTransactionStyle.receiptMetaBox}>
                                                    <Text style={UserTransactionStyle.receiptMetaLabel}>DATE</Text>
                                                    <Text style={UserTransactionStyle.receiptMetaValue}>{selectedTransaction.createdAt ? dayjs(selectedTransaction.createdAt).format('DD-MM-YYYY') : '--'}</Text>
                                                </View>
                                                <View style={[UserTransactionStyle.receiptMetaBox, UserTransactionStyle.receiptMetaBoxPrimary]}>
                                                    <Text style={[UserTransactionStyle.receiptMetaLabel, UserTransactionStyle.receiptMetaLabelLight]}>AMOUNT TO PAY</Text>
                                                    <Text style={[UserTransactionStyle.receiptMetaValue, UserTransactionStyle.receiptMetaValueLight]}>{formatCurrency(selectedTransaction.amount)}</Text>
                                                </View>
                                                <View style={UserTransactionStyle.receiptMetaBox}>
                                                    <Text style={UserTransactionStyle.receiptMetaLabel}>REFERENCE</Text>
                                                    <Text style={UserTransactionStyle.receiptMetaValue}>{selectedTransaction.reference}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Table */}
                                        <View style={UserTransactionStyle.receiptTable}>

                                            {/* HEADER ROW */}
                                            <View style={UserTransactionStyle.receiptTableHeader}>
                                                <Text style={[UserTransactionStyle.receiptTh, { width: 50, textAlign: 'left' }]}>QTY</Text>
                                                <Text style={[UserTransactionStyle.receiptTh, { width: 70, textAlign: 'center' }]}>DESCRIPTION</Text>
                                                <Text style={[UserTransactionStyle.receiptTh, { width: 340, textAlign: 'center' }]}>UNIT PRICE</Text>
                                                <Text style={[UserTransactionStyle.receiptTh, { width: 60, textAlign: 'right' }]}>AMOUNT</Text>
                                            </View>

                                            {/* DATA ROW */}
                                            <View style={UserTransactionStyle.receiptTableRow}>
                                                <Text style={[UserTransactionStyle.receiptTd, { width: 50, textAlign: 'left' }]}>1</Text>
                                                <Text style={[UserTransactionStyle.receiptTd, { width: 55, textAlign: 'center' }]} numberOfLines={2}>
                                                    {getTransactionItemLabel(selectedTransaction)}
                                                </Text>
                                                <Text style={[UserTransactionStyle.receiptTd, { width: 370, textAlign: 'center' }]}>{formatCurrency(selectedTransaction.amount)}</Text>
                                                <Text style={[UserTransactionStyle.receiptTd, { width: 50, textAlign: 'right' }]}>{formatCurrency(selectedTransaction.amount)}</Text>
                                            </View>

                                        </View>

                                        {/* Bottom section: Bank info and Totals */}
                                        <View style={UserTransactionStyle.receiptBottomGrid}>
                                            <View style={UserTransactionStyle.receiptBankInfo}>
                                                <View style={UserTransactionStyle.receiptBankSection}>
                                                    <Text style={UserTransactionStyle.receiptBankTitle}>BANK ACCOUNT:</Text>
                                                    <Text style={UserTransactionStyle.receiptBankText}>Bank: BDO UNIBANK</Text>
                                                    <Text style={UserTransactionStyle.receiptBankText}>Account Name: M&RC Travel and Tours</Text>
                                                    <Text style={UserTransactionStyle.receiptBankText}>Account #: 006838032692</Text>
                                                </View>

                                                <View style={UserTransactionStyle.receiptBankSection}>
                                                    <Text style={UserTransactionStyle.receiptBankTitle}>USD ACCOUNT:</Text>
                                                    <Text style={UserTransactionStyle.receiptBankText}>Bank: BDO UNIBANK</Text>
                                                    <Text style={UserTransactionStyle.receiptBankText}>Account Name: M&RC Travel and Tours</Text>
                                                    <Text style={UserTransactionStyle.receiptBankText}>Account #: 113190015176</Text>
                                                </View>

                                                <View style={UserTransactionStyle.receiptDivider} />

                                                <View style={UserTransactionStyle.receiptBankSection}>
                                                    <Text style={UserTransactionStyle.receiptBankTitle}>GCASH:</Text>
                                                    <Text style={UserTransactionStyle.receiptBankText}>Rhon Carle - 0968 888 0405</Text>
                                                    <Text style={UserTransactionStyle.receiptBankText}>Maricar Carle - 0969 055 4806</Text>
                                                </View>
                                            </View>

                                            <View style={UserTransactionStyle.receiptSummaryBlock}>
                                                <View style={UserTransactionStyle.receiptSummaryRow}>
                                                    <Text style={UserTransactionStyle.receiptSummaryLabel}>Total</Text>
                                                    <Text style={UserTransactionStyle.receiptSummaryValue}>{formatCurrency(selectedTransaction.amount)}</Text>
                                                </View>
                                                <View style={UserTransactionStyle.receiptTotalRow}>
                                                    <Text style={UserTransactionStyle.receiptTotalLabel}>Total Due</Text>
                                                    <Text style={UserTransactionStyle.receiptTotalValue}>{formatCurrency(selectedTransaction.amount)}</Text>
                                                </View>
                                                <TouchableOpacity style={UserTransactionStyle.receiptDownloadButton} onPress={handleDownloadReceipt}>
                                                    <Ionicons name="download-outline" size={14} color="#fff" />
                                                    <Text style={{ color: '#fff', fontFamily: "Montserrat_600SemiBold", fontSize: 11 }}>Download Receipt</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </ScrollView>
                            )}
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>

        </View>
    )
}