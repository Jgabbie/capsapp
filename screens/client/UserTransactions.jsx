import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal, Image, SafeAreaView, Alert } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native'
import DateTimePicker from '@react-native-community/datetimepicker'
import dayjs from 'dayjs'
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

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

    const handleDownloadReceipt = async () => {
        if (!selectedTransaction) return;
        try {
            // 🔥 FIXED DESCRIPTION IN PDF 🔥
            const safePackageName = getTransactionItemLabel(selectedTransaction);
            
            const htmlContent = `
                <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                        <style>
                            body { font-family: 'Helvetica', sans-serif; padding: 30px; color: #333; }
                            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #374151; padding-bottom: 20px; margin-bottom: 20px; }
                            .company-details { font-size: 11px; color: #555; line-height: 1.5; }
                            .company-name { color: #305797; font-weight: bold; font-size: 18px; margin-bottom: 5px; }
                            .title { font-size: 28px; color: #333; margin: 0; font-weight: normal; }
                            .meta-row { display: flex; justify-content: space-between; margin-bottom: 30px; }
                            .billed-to .label { font-size: 10px; font-weight: bold; color: #305797; text-transform: uppercase; margin-bottom: 5px; display: block; }
                            .billed-to .name { font-size: 16px; font-weight: bold; margin: 0; color: #333; }
                            .meta-right { text-align: right; font-size: 12px; }
                            .meta-right .row { display: flex; justify-content: space-between; width: 180px; margin-bottom: 5px; }
                            .meta-right .label { font-size: 10px; font-weight: bold; color: #305797; text-transform: uppercase; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                            th { background-color: #374151; color: white; padding: 12px; text-align: left; font-size: 11px; font-weight: bold; }
                            th.right, td.right { text-align: right; }
                            td { padding: 15px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; color: #333; }
                            .summary { width: 50%; float: right; margin-top: 10px; }
                            .summary-row { display: flex; justify-content: space-between; padding: 10px 5px; font-size: 12px; color: #555; }
                            .summary-row.total { border-top: 1.5px solid #333; border-bottom: 1.5px solid #333; font-weight: bold; font-size: 16px; color: #333; }
                            .footer { clear: both; padding-top: 50px; font-size: 10px; color: #777; line-height: 1.5; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
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
                            <h1 class="title">Receipt</h1>
                        </div>
                        
                        <div class="meta-row">
                            <div class="billed-to">
                                <span class="label">Billed To</span>
                                <div class="name">You</div>
                            </div>
                            <div class="meta-right">
                                <div class="row">
                                    <span class="label">RECEIPT #</span>
                                    <span>${selectedTransaction.reference}</span>
                                </div>
                                <div class="row">
                                    <span class="label">RECEIPT DATE</span>
                                    <span>${dayjs(selectedTransaction.createdAt).format('DD-MM-YYYY')}</span>
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
                                }</tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>${safePackageName}</td>
                                    <td class="right">${formatCurrency(selectedTransaction.amount)}</td>
                                    <td class="right">${formatCurrency(selectedTransaction.amount)}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="summary">
                            <div class="summary-row">
                                <span>Subtotal</span>
                                <span>${formatCurrency(selectedTransaction.amount)}</span>
                            </div>
                            <div class="summary-row total">
                                <span>TOTAL</span>
                                <span>${formatCurrency(selectedTransaction.amount)}</span>
                            </div>
                        </div>

                        <div class="footer">
                            <div>Thank you for your purchase!</div>
                            <div>For questions or support, contact us at info1@mrctravels.com</div>
                        </div>
                    </body>
                </html>
            `;
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: `Receipt-${selectedTransaction.reference}.pdf` });
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
            // 🔥 FIXED: Specify exact filename for download 🔥
            const fileUri = FileSystem.documentDirectory + `proof-of-payment-${selectedTransaction.reference}.${fileExt}`;
            
            const { uri } = await FileSystem.downloadAsync(url, fileUri);
            await Sharing.shareAsync(uri, { dialogTitle: 'Download Proof of Payment' });
        } catch (error) {
            // 🔥 NEW: Add detailed logging to find the error 🔥
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
                                        {/* 🔥 FIXED LABEL: Date -> Date and Time 🔥 */}
                                        <Text style={UserTransactionStyle.detailLabel}>Date and Time:</Text>
                                        <Text style={UserTransactionStyle.detailValue}>{dayjs(item.createdAt).format('MMM D, YYYY h:mm A')}</Text>
                                    </View>
                                    <View style={UserTransactionStyle.detailRow}>
                                        {/* 🔥 FIXED LABEL: Method -> Payment Method 🔥 */}
                                        <Text style={UserTransactionStyle.detailLabel}>Payment Method:</Text>
                                        <Text style={UserTransactionStyle.detailValue}>{item.method || 'N/A'}</Text>
                                    </View>
                                    <View style={UserTransactionStyle.detailRow}>
                                        <Text style={UserTransactionStyle.detailLabel}>Amount:</Text>
                                        <Text style={UserTransactionStyle.amount}>{formatCurrency(item.amount)}</Text>
                                    </View>
                                </View>

                                <View style={UserTransactionStyle.actionButtonsRow}>
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
                <TouchableOpacity style={UserTransactionStyle.modalOverlay} onPress={() => setStatusModalVisible(false)} activeOpacity={1}>
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
                                <Text style={[UserTransactionStyle.modalOptionText, { fontFamily: statusFilter === opt ? 'Montserrat_700Bold' : 'Roboto_500Medium'}]}>
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
                <View style={UserTransactionStyle.modalOverlay}>
                    <View style={UserTransactionStyle.proofImageContainer}>
                        <View style={UserTransactionStyle.proofHeader}>
                            {/* 🔥 FIXED TITLE: Proof of Payment -> Proof of Payment - [Reference] 🔥 */}
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

            <Modal visible={isReceiptModalVisible} animationType="slide" transparent={true}>
                <View style={UserTransactionStyle.modalOverlay}>
                    <SafeAreaView style={{ flex: 1, width: '100%', padding: 15, justifyContent: 'center' }}>
                        <View style={UserTransactionStyle.receiptPaper}>
                            <TouchableOpacity style={UserTransactionStyle.receiptCloseBtn} onPress={() => setReceiptModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color="#b54747" />
                            </TouchableOpacity>

                            {selectedTransaction && (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    
                                    <View style={UserTransactionStyle.receiptHeaderRow}>
                                        <View style={UserTransactionStyle.receiptCompanyBlock}>
                                            <Image source={require('../../assets/images/Logored.png')} style={UserTransactionStyle.receiptLogo} resizeMode="contain" />
                                            <View style={UserTransactionStyle.receiptCompanyDetails}>
                                                <Text style={UserTransactionStyle.receiptCompanyName}>M&RC Travel and Tours</Text>
                                                <Text style={UserTransactionStyle.receiptMutedText}>2nd Floor #1 Cor Fatima street</Text>
                                                <Text style={UserTransactionStyle.receiptMutedText}>Parañaque City, Philippines</Text>
                                                <Text style={UserTransactionStyle.receiptMutedText}>+63 969 055 4806</Text>
                                                <Text style={UserTransactionStyle.receiptMutedText}>info1@mrctravels.com</Text>
                                            </View>
                                        </View>
                                        <Text style={UserTransactionStyle.receiptTitleText}>Receipt</Text>
                                    </View>

                                    <View style={UserTransactionStyle.receiptMetaRow}>
                                        <View style={UserTransactionStyle.receiptBilledTo}>
                                            <Text style={UserTransactionStyle.receiptTinyLabel}>BILLED TO</Text>
                                            <Text style={UserTransactionStyle.receiptCustomerName}>You</Text>
                                        </View>
                                        <View style={UserTransactionStyle.receiptMetaRight}>
                                            <View style={{flexDirection: 'row', justifyContent: 'space-between', width: 140, marginBottom: 4}}>
                                                <Text style={UserTransactionStyle.receiptTinyLabel}>RECEIPT #</Text>
                                                <Text style={UserTransactionStyle.receiptMetaValue}>{selectedTransaction.reference}</Text>
                                            </View>
                                            <View style={{flexDirection: 'row', justifyContent: 'space-between', width: 140}}>
                                                <Text style={UserTransactionStyle.receiptTinyLabel}>RECEIPT DATE</Text>
                                                <Text style={UserTransactionStyle.receiptMetaValue}>{dayjs(selectedTransaction.createdAt).format('DD-MM-YYYY')}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={UserTransactionStyle.receiptTable}>
                                        <View style={UserTransactionStyle.receiptTableHeader}>
                                            <Text style={[UserTransactionStyle.receiptTh, { flex: 1 }]}>QTY</Text>
                                            <Text style={[UserTransactionStyle.receiptTh, { flex: 3 }]}>Description</Text>
                                            <Text style={[UserTransactionStyle.receiptTh, { flex: 2, textAlign: 'right' }]}>Unit Price</Text>
                                            <Text style={[UserTransactionStyle.receiptTh, { flex: 2, textAlign: 'right' }]}>Amount</Text>
                                        </View>
                                        <View style={UserTransactionStyle.receiptTableRow}>
                                            <Text style={[UserTransactionStyle.receiptTd, { flex: 1 }]}>1</Text>
                                            
                                            {/* 🔥 FIXED DESCRIPTION IN MODAL 🔥 */}
                                            <Text style={[UserTransactionStyle.receiptTd, { flex: 3 }]} numberOfLines={2}>
                                                {getTransactionItemLabel(selectedTransaction)}
                                            </Text>
                                            
                                            <Text style={[UserTransactionStyle.receiptTd, { flex: 2, textAlign: 'right' }]}>{formatCurrency(selectedTransaction.amount)}</Text>
                                            <Text style={[UserTransactionStyle.receiptTd, { flex: 2, textAlign: 'right' }]}>{formatCurrency(selectedTransaction.amount)}</Text>
                                        </View>
                                    </View>

                                    <View style={UserTransactionStyle.receiptSummaryBlock}>
                                        <View style={UserTransactionStyle.receiptSummaryRow}>
                                            <Text style={UserTransactionStyle.receiptSummaryLabel}>Subtotal</Text>
                                            <Text style={UserTransactionStyle.receiptSummaryValue}>{formatCurrency(selectedTransaction.amount)}</Text>
                                        </View>
                                        <View style={UserTransactionStyle.receiptTotalRow}>
                                            <Text style={UserTransactionStyle.receiptTotalLabel}>TOTAL</Text>
                                            <Text style={UserTransactionStyle.receiptTotalValue}>{formatCurrency(selectedTransaction.amount)}</Text>
                                        </View>
                                    </View>

                                    <View style={{ marginTop: 20 }}>
                                        <Text style={UserTransactionStyle.receiptFooterText}>Thank you for your purchase!</Text>
                                        <Text style={UserTransactionStyle.receiptFooterText}>For questions or support, contact us at info1@mrctravels.com</Text>
                                    </View>

                                    <View style={{ marginTop: 25, alignItems: 'flex-end' }}>
                                        <TouchableOpacity 
                                            style={{ backgroundColor: '#305797', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                                            onPress={handleDownloadReceipt}
                                        >
                                            <Ionicons name="download-outline" size={16} color="#fff" />
                                            <Text style={{ color: '#fff', fontFamily: "Montserrat_600SemiBold", fontSize: 12 }}>Download Receipt</Text>
                                        </TouchableOpacity>
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