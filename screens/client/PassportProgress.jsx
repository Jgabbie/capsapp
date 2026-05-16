import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Linking, Modal, Platform, TouchableWithoutFeedback, TextInput, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import dayjs from "dayjs";
import DateTimePicker from '@react-native-community/datetimepicker';

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import PaymentStyle from "../../styles/clientstyles/PaymentStyle";
import PassportProgressStyle from "../../styles/clientstyles/PassportProgressStyle";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";
import QRCodeMaricar from '../../assets/images/QRCode_GCash_Maricar.jpg';
import QRCodeRhon from '../../assets/images/QRCode_GCash_Rhon.jpg';


// Status color mapping for passport application statuses
const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
        case 'application submitted':
            return 'blue';
        case 'application approved':
            return 'purple';
        case 'payment completed':
            return 'cyan';
        case 'documents uploaded':
            return 'orange';
        case 'documents approved':
            return 'geekblue';
        case 'documents received':
            return 'gold';
        case 'documents submitted':
            return 'magenta';
        case 'processing by dfa':
            return 'volcano';
        case 'dfa approved':
            return 'green';
        case 'passport released':
            return 'success';
        default:
            return 'default';
    }
};

const PASSPORT_STEPS = [
    { title: 'Application Submitted', description: 'Application Submitted' },
    { title: 'Application Approved', description: 'Application Approved' },
    { title: 'Payment Completed', description: 'Payment Completed' },
    { title: 'Documents Uploaded', description: 'Documents Uploaded' },
    { title: 'Documents Approved', description: 'Documents Approved' },
    { title: 'Documents Received', description: 'Documents Received' },
    { title: 'Documents Submitted', description: 'Documents Submitted' },
    { title: 'Processing by DFA', description: 'Processing by DFA' },
    { title: 'DFA Approved', description: 'DFA Approved' },
    { title: 'Passport Released', description: 'Passport Released' },
];

export default function PassportApplication() {
    const route = useRoute();
    const navigation = useNavigation();

    const id = route?.params?.applicationId || null; // Use applicationId from route params
    const { user } = useUser();

    const [loading, setLoading] = useState(true);
    const [application, setApplication] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [birthCertList, setBirthCertList] = useState([]);
    const [govIdList, setGovIdList] = useState([]);
    const [applicationFormList, setApplicationFormList] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState({});
    const [uploadingDocumentKey, setUploadingDocumentKey] = useState(null);
    const [uploadingAll, setUploadingAll] = useState(false);

    const [method, setMethod] = useState(null); // default selected payment method  
    const paymentMethod = method;
    const normalizePickedDocument = (asset) => ({
        uri: asset.uri,
        name: asset.name || asset.fileName || `document-${Date.now()}`,
        type: asset.mimeType || asset.type || 'application/octet-stream',
        size: asset.size,
    });

    const pickDocumentForKey = async (key) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
                multiple: false,
            });

            if (result.canceled || !result.assets?.length) {
                return;
            }

            const asset = result.assets[0];
            setSelectedFiles(prev => ({
                ...prev,
                [key]: normalizePickedDocument(asset),
            }));
        } catch (error) {
            console.error('Failed to pick document:', error);
            Alert.alert('Error', 'Could not open the file picker.');
        }
    };

    const removeSelectedFile = (key) => {
        setSelectedFiles(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const submitAllSelectedFiles = async () => {
        await handleSubmit();
    };

    const setPaymentMethod = setMethod;
    const [fileList, setFileList] = useState([]);
    const [proofImage, setProofImage] = useState(null);
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const creatingPayment = paymentLoading;

    const [pendingManualPayment, setPendingManualPayment] = useState(false);
    const [servicePendingManualPayment, setServicePendingManualPayment] = useState(false);
    const isApplicationPaymentDisabled = servicePendingManualPayment;
    const isPenaltyPaymentDisabled = pendingManualPayment;

    const [selectedSuggestedIndex, setSelectedSuggestedIndex] = useState(null);
    const [customDateTime, setCustomDateTime] = useState({ date: null, time: null });
    const [confirmingSuggested, setConfirmingSuggested] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    const [releaseOption, setReleaseOption] = useState(null);
    const [deliveryAddress, setDeliveryAddress] = useState("");

    const [isConfirmDocumentsOpen, setIsConfirmDocumentsOpen] = useState(false);
    const [isSelectDateModalOpen, setIsSelectDateModalOpen] = useState(false);
    const [isDateSelectedModalOpen, setIsDateSelectedModalOpen] = useState(false);
    const [isDocumentsUploadedModalOpen, setIsDocumentsUploadedModalOpen] = useState(false);
    const [isPassportReleaseOptionSelectedModalOpen, setIsPassportReleaseOptionSelectedModalOpen] = useState(false);
    const [showAppointmentSuccessModal, setShowAppointmentSuccessModal] = useState(false);
    const [showDocumentsSuccessModal, setShowDocumentsSuccessModal] = useState(false);
    const [enlargedQR, setEnlargedQR] = useState(null);
    const [requirementPreview, setRequirementPreview] = useState(null);
    const [isSidebarVisible, setSidebarVisible] = useState(false);

    // Schedule selection state (for 'Others' custom date/time option)
    const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(null);
    const [customPreferredDate, setCustomPreferredDate] = useState(null);
    const [customPreferredTime, setCustomPreferredTime] = useState(null);
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);
    const [confirmingSchedule, setConfirmingSchedule] = useState(false);

    const normalizeScheduleSlot = (slot) => {
        if (!slot || typeof slot !== 'object') return { date: '', time: '' };
        const rawDate = slot.date || slot.preferredDate || slot.appointmentDate || slot.scheduleDate || '';
        const rawTime = slot.time || slot.preferredTime || slot.appointmentTime || slot.scheduleTime || '';

        const parsedDate = rawDate ? dayjs(rawDate) : null;
        const date = parsedDate?.isValid() ? parsedDate.format('YYYY-MM-DD') : String(rawDate || '');

        let time = '';
        if (rawTime) {
            const parsedTime = dayjs(String(rawTime), ['HH:mm', 'H:mm', 'hh:mm A', 'h:mm A', 'HH:mm:ss'], true);
            time = parsedTime.isValid() ? parsedTime.format('HH:mm') : String(rawTime);
        } else if (parsedDate?.isValid()) {
            time = parsedDate.format('HH:mm');
        }

        return { date, time };
    };

    const formatTimeForDisplay = (time) => {
        if (!time) return 'No time provided';

        const parsedTime = dayjs(String(time), ['HH:mm', 'H:mm', 'hh:mm A', 'h:mm A', 'HH:mm:ss'], true);
        if (parsedTime.isValid()) {
            return parsedTime.format('hh:mm A');
        }

        return String(time);
    };

    const isOthersSelected = selectedScheduleIndex === 'others';
    const canConfirmSchedule = selectedScheduleIndex !== null && !confirmingSchedule && (
        !isOthersSelected || (customPreferredDate && customPreferredTime)
    );

    const handleCustomDateChange = (_event, selectedDate) => {
        if (selectedDate) setCustomPreferredDate(selectedDate);
        if (Platform.OS !== 'ios') setShowCustomDatePicker(false);
    };

    const handleCustomTimeChange = (_event, selectedTime) => {
        if (selectedTime) setCustomPreferredTime(selectedTime);
        if (Platform.OS !== 'ios') setShowCustomTimePicker(false);
    };

    const handleConfirmSchedule = async () => {
        if (selectedScheduleIndex === null) {
            Alert.alert('Notice', 'Please select an appointment option first.');
            return;
        }

        const isOthersOption = selectedScheduleIndex === 'others';
        const selected = isOthersOption
            ? {
                date: customPreferredDate ? dayjs(customPreferredDate).format('YYYY-MM-DD') : '',
                time: customPreferredTime || ''
            }
            : normalizeScheduleSlot(application.suggestedAppointmentSchedules[selectedScheduleIndex]);

        if (!selected?.date || !selected?.time) {
            Alert.alert('Error', 'Please provide both date and time.');
            return;
        }

        try {
            setConfirmingSchedule(true);
            await api.put(`/passport/applications/${application._id}/choose-appointment`, {
                date: selected.date,
                time: selected.time
            }, withUserHeader(user._id));

            setSelectedScheduleIndex(null);
            setCustomPreferredDate(null);
            setCustomPreferredTime(null);
            setShowCustomDatePicker(false);
            setShowCustomTimePicker(false);

            const allApps = await api.get('/passport/applications', withUserHeader(user._id));
            const refreshed = allApps.data.find(app => app._id === id);
            setApplication(refreshed);
            setShowAppointmentSuccessModal(true);
            setIsDateSelectedModalOpen(true);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to confirm appointment schedule.');
        } finally {
            setConfirmingSchedule(false);
        }
    };

    useEffect(() => {
        if (!id || !user?._id) {
            return
        }
        const fetchApplication = async () => {
            setLoading(true);
            try {
                const res = await api.get('/passport/applications', withUserHeader(user._id));
                const appData = res.data.find(app => app._id === id);
                if (!appData) throw new Error('Application not found');
                setApplication(appData);
            } catch (err) {
                Alert.alert('Error', 'Failed to load passport application details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        //PENDING MANUAL PAYEMENTS
        const checkPendingManualPayment = async () => {
            try {
                const transactionsRes = await api.get(`/transaction/application/${id}`, withUserHeader(user._id));
                const transactions = Array.isArray(transactionsRes.data) ? transactionsRes.data : (transactionsRes.data?.transactions || []);
                const hasPendingPenalty = transactions.some(
                    (tx) => tx.status === 'Pending' &&
                        (tx.applicationType === 'Passport Penalty Fee')
                );

                const hasPendingRegularPayment = transactions.some(
                    (tx) => tx.status === 'Pending' &&
                        (tx.applicationType === 'Passport Application')
                );

                setPendingManualPayment(hasPendingPenalty);
                setServicePendingManualPayment(hasPendingRegularPayment);
            } catch (err) {
                if (err?.response?.status === 404) {
                    // No transactions found for this application - treat as no pending payments
                    setPendingManualPayment(false);
                    setServicePendingManualPayment(false);
                } else {
                    console.error('Could not fetch transactions:', err);
                }
            }
        };
        fetchApplication();
        checkPendingManualPayment();
    }, [id, user?._id]);

    const normalizeResubmissionTarget = (target) => {
        switch (target) {
            case 'birthCertificate':
                return 'birthCert';
            case 'applicationForm':
            case 'govId':
                return target;
            default:
                return null;
        }
    };

    const requestedResubmissionTargets = (() => {
        const targets = [];

        if (Array.isArray(application?.resubmissionTargets)) {
            application.resubmissionTargets.forEach((target) => {
                const normalized = normalizeResubmissionTarget(target);
                if (normalized) {
                    targets.push(normalized);
                }
            });
        }

        const legacyTarget = normalizeResubmissionTarget(application?.resubmissionTarget);
        if (legacyTarget) {
            targets.push(legacyTarget);
        }

        return [...new Set(targets)];
    })();

    const resubmissionRequested = Boolean(
        application &&
        (application.status || '').toLowerCase() === 'payment completed' &&
        requestedResubmissionTargets.length > 0
    );

    const isRequestedResubmissionTarget = (target) => !resubmissionRequested || requestedResubmissionTargets.includes(target);

    const hasSelectedFileForTarget = (target) => {
        switch (target) {
            case 'birthCert':
                return Boolean(selectedFiles.birthCert);
            case 'applicationForm':
                return Boolean(selectedFiles.applicationForm);
            case 'govId':
                return Boolean(selectedFiles.govId);
            default:
                return false;
        }
    };

    const getStepSetDateForTitle = (app, title) => {
        if (!app || !title) return null;
        const history = app.statusHistory;
        if (Array.isArray(history) && history.length > 0) {
            for (let i = history.length - 1; i >= 0; i--) {
                const h = history[i];
                if (String(h.status).toLowerCase() === String(title).toLowerCase()) {
                    return dayjs(h.changedAt);
                }
            }
        }
        return null;
    };

    // Find the current step index based on status
    const currentStep = application
        ? Math.max(
            0,
            PASSPORT_STEPS.findIndex(
                s => (s.title || '').toLowerCase() === (application.status || '').toLowerCase()
            )
        )
        : 0;

    // Build timeline for progress tracker (uses backend-decorated processSteps when available)
    const stepTimeline = PASSPORT_STEPS.map((s, idx) => {
        const title = String(s.title || '').trim();
        const proc = application?.processSteps?.[title] || {};
        const setDate = proc.setDate ? dayjs(proc.setDate) : getStepSetDateForTitle(application, title);
        const deadlineDate = proc.deadlineDate ? dayjs(proc.deadlineDate) : null;
        const daysLeft = deadlineDate ? deadlineDate.diff(dayjs(), 'day') : null;
        const isCompleted = idx <= currentStep;
        const isActive = idx === currentStep;
        const isLast = idx === PASSPORT_STEPS.length - 1;

        return {
            step: title,
            index: idx,
            isCompleted,
            isActive,
            isLast,
            setDate,
            deadlineDate,
            daysLeft,
        };
    });

    // Get deadline and set date from processSteps object
    const getProcessStepInfo = (stepTitle) => {
        if (!application?.processSteps || !application.processSteps[stepTitle]) {
            return { setDate: null, deadlineDate: null };
        }
        const step = application.processSteps[stepTitle];
        return {
            setDate: step.setDate ? dayjs(step.setDate) : null,
            deadlineDate: step.deadlineDate ? dayjs(step.deadlineDate) : null,
        };
    };

    // Compute status set date and deadline for client view
    const statusDeadlineDaysMap = {
        'Payment Completed': 5,
    };

    const appointmentDate = application?.preferredDate
        ? dayjs(application.preferredDate)
        : application?.suggestedAppointmentScheduleChosen && application.suggestedAppointmentScheduleChosen.date
            ? dayjs(application.suggestedAppointmentScheduleChosen.date)
            : null;

    const appointmentOptions = Array.isArray(application?.suggestedAppointmentSchedules)
        ? application.suggestedAppointmentSchedules
        : [];

    const getStatusSetDate = (app) => {
        if (!app) return null;
        const history = app.statusHistory;
        if (Array.isArray(history) && history.length > 0) {
            for (let i = history.length - 1; i >= 0; i--) {
                const h = history[i];
                if (String(h.status).toLowerCase() === String(app.status).toLowerCase()) {
                    return dayjs(h.changedAt);
                }
            }
        }
        if (app.statusUpdatedAt) return dayjs(app.statusUpdatedAt);
        if (app.updatedAt) return dayjs(app.updatedAt);
        if (app.createdAt) return dayjs(app.createdAt);
        return null;
    };

    const openDocument = (url) => {
        if (url) Linking.openURL(url).catch(err => console.error("Couldn't open document", err));
    };

    const shareRequirementPreviewPdf = async () => {
        if (!requirementPreview?.uri) return;

        try {
            const isShareAvailable = await Sharing.isAvailableAsync();

            if (!isShareAvailable) {
                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                    window.open(requirementPreview.uri, '_blank', 'noopener,noreferrer');
                    return;
                }

                await Linking.openURL(requirementPreview.uri);
                return;
            }

            // prepare local file if needed
            const uri = requirementPreview.uri;
            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Share PDF document',
                UTI: 'com.adobe.pdf',
            });
        } catch (e) {
            console.error('Unable to share PDF:', e);
            Alert.alert('Unable to share PDF');
        }
    };

    const previewFile = (fileOrUrl) => {
        const file = typeof fileOrUrl === 'string' ? { uri: fileOrUrl, name: 'Document' } : fileOrUrl;
        const uri = file?.uri || file?.url;
        if (!uri) {
            Alert.alert('Preview unavailable', 'Could not preview this file');
            return;
        }

        if (isImageSource(file)) {
            setRequirementPreview({
                uri,
                name: file.name || 'Image preview',
                kind: 'image',
            });
        } else {
            setRequirementPreview({
                uri,
                name: file.name || (typeof fileOrUrl === 'string' ? fileOrUrl.split('/').pop() : 'Document'),
                kind: 'document',
            });
        }
    };

    const isImageSource = (fileOrUrl) => {
        const value = typeof fileOrUrl === 'string'
            ? fileOrUrl
            : fileOrUrl?.uri || fileOrUrl?.name || fileOrUrl?.mimeType || '';

        return /\.(png|jpe?g|gif|webp|bmp|heic|heif)$/i.test(value) || String(fileOrUrl?.mimeType || '').startsWith('image/') || /\bimage\//i.test(String(fileOrUrl?.mimeType || ''));
    };

    const getUploadedDocumentEntries = () => {
        const docs = application?.submittedDocuments || {
            birthCertificate: application?.birthCertificate,
            applicationForm: application?.applicationForm,
            govId: application?.govId,
        } || {};
        return Object.entries(docs).filter(([, value]) => Boolean(value));
    };

    const passportRequirements = [
        { key: 'birthCertificate', label: 'PSA Birth Certificate' },
        { key: 'birthCert', label: 'PSA Birth Certificate' },
        { key: 'applicationForm', label: 'Application Form' },
        { key: 'govId', label: 'Government-issued ID' },
    ];

    // Get the most recent staff/admin who changed the status (if available)
    const getManagerName = (app) => {
        try {
            if (!app) return null;
            const history = app.statusHistory;
            if (Array.isArray(history) && history.length > 0) {
                const applicantId = String(app.userId?._id || app.userId || '');
                const applicantName = String(app.username || '').trim().toLowerCase();

                for (let i = history.length - 1; i >= 0; i -= 1) {
                    const entry = history[i];
                    const changedById = String(entry?.changedBy?._id || entry?.changedBy || '');
                    const changedByName = String(entry?.changedByName || '').trim();

                    if (applicantId && changedById && changedById === applicantId) {
                        continue;
                    }

                    if (changedByName && applicantName && changedByName.toLowerCase() === applicantName) {
                        continue;
                    }

                    if (entry?.changedBy && typeof entry.changedBy === 'object') {
                        const first = entry.changedBy.firstname || entry.changedBy.username || '';
                        const lastn = entry.changedBy.lastname || '';
                        const full = [first, lastn].map(s => (s || '').trim()).filter(Boolean).join(' ');
                        if (full) return full;
                    }

                    if (changedByName) return changedByName;
                    if (entry?.changedBy && typeof entry.changedBy === 'string') return entry.changedBy;
                }

                return null;
            }
            return null;
        } catch (e) {
            return null;
        }
    };

    const currentStatusSetDate = getStatusSetDate(application);
    const statusSetDate = currentStatusSetDate; // alias for compatibility with other components
    const appStatus = (application?.status || '').toString();
    const hasSuggestedAppointmentScheduleChosen = Boolean(application?.suggestedAppointmentScheduleChosen);
    const passportApplicationFee = 2000;
    const deadlineDays = application?.statusDeadlineDays ?? statusDeadlineDaysMap[application?.status] ?? null;
    let statusDeadlineDate = application?.statusDeadlineDate
        ? dayjs(application.statusDeadlineDate)
        : appointmentDate && Number.isFinite(deadlineDays)
            ? appointmentDate.subtract(deadlineDays, 'day').startOf('day')
            : null;

    if (String(application?.status || '').toLowerCase() === 'payment completed' && application?.secondChance && application?.secondDeadline) {
        statusDeadlineDate = dayjs(application.secondDeadline);
    }
    const penaltyStateLabel = application?.reachedSecondDeadline
        ? 'Penalty Expired'
        : application?.secondChance
            ? 'Penalty Paid'
            : application?.onPenalty
                ? 'On Penalty'
                : null;

    const [hasProcessedRejection, setHasProcessedRejection] = useState(false);

    // Auto-reject application if deadline is passed
    useEffect(() => {
        if (!application || !statusDeadlineDate || hasProcessedRejection) return;

        const terminalStatuses = ['Rejected', 'Passport Released'];
        if (terminalStatuses.includes(application.status)) return;

        const isDeadlinePassed = statusDeadlineDate.isBefore(dayjs(), 'day');
        if (isDeadlinePassed) {
            setHasProcessedRejection(true);
            const updateStatus = async () => {
                try {
                    await api.put(
                        `/passport/applications/${id}/status`,
                        { status: 'Rejected' },
                        withUserHeader(user?._id)
                    );
                    Alert.alert(
                        'Application Rejected',
                        'Your application has been rejected due to missed deadline.'
                    );
                    setApplication(prev => ({ ...prev, status: 'Rejected' }));
                } catch (err) {
                    console.error('Failed to auto-reject application:', err);
                }
            };
            updateStatus();
        }
    }, [statusDeadlineDate, application, hasProcessedRejection, id]);

    //for payment
    const pickProofImage = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission required', 'Please allow photo library access to upload your receipt.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (result.canceled || !result.assets?.length) {
                return;
            }

            const asset = result.assets[0];
            setProofImage({
                uri: asset.uri,
                name: asset.fileName || asset.name || `receipt-${Date.now()}.jpg`,
                type: asset.mimeType || 'image/jpeg',
            });
        } catch (error) {
            console.error('Failed to pick proof image:', error);
            Alert.alert('Error', 'Could not open the photo library.');
        }
    };

    const handleUploadChange = ({ fileList: newFileList }) => {
        if (newFileList.length > 1) {
            newFileList = [newFileList[newFileList.length - 1]];
        }

        newFileList = newFileList.map(file => {
            if (!file.preview && file.originFileObj) {
                file.preview = URL.createObjectURL(file.originFileObj);
            }
            return file;
        });

        setFileList(newFileList);
    };


    //SUBMIT PAYMENT
    const handleSubmitPayment = async () => {
        const isPenalty = application?.onPenalty === true || application?.penaltyOn === true;

        if ((isPenalty && isPenaltyPaymentDisabled) || (!isPenalty && isApplicationPaymentDisabled)) {
            Alert.alert('Notice', 'A pending payment transaction already exists for this application. Please wait for verification.');
            return;
        }

        if (method === 'manual' && !proofImage) {
            Alert.alert('Warning', 'Please upload a receipt first.');
            return;
        }

        try {
            setPaymentLoading(true);

            if (method === 'manual') {
                if (!proofImage?.uri) {
                    throw new Error('Invalid proof image: missing URI');
                }

                const formData = new FormData();
                formData.append('file', {
                    uri: proofImage.uri,
                    type: proofImage.type || 'image/jpeg',
                    name: proofImage.name || `receipt-${Date.now()}.jpg`,
                });

                const uploadRes = await api.post('/upload/upload-receipt', formData, {
                    headers: {
                        "x-user-id": String(user._id),
                        "Content-Type": "multipart/form-data",
                    },
                    transformRequest: [(data) => data],
                    timeout: 60000,
                });

                const imageUrl = uploadRes.data.url;

                const amountToPay = isPenalty ? 1500 : 2000;
                const endpoint = isPenalty ? '/payment/manual-passport-penalty' : '/payment/manual-passport';

                const paymentRes = await api.post(endpoint, {
                    applicationId: application._id,
                    applicationNumber: application.applicationNumber,
                    amount: amountToPay,
                    proofImage: imageUrl,
                }, withUserHeader(user._id));

                setPaymentCompleted(true);
                setProofImage(null);

                setTimeout(() => {
                    navigation.navigate('successfulmanualpaymentpassport');
                }, 500);

            } else if (method === 'paymongo') {
                // Make sure application exists

                if (!application) {
                    Alert.alert('Error', 'Application not found.');
                    return;
                }

                const payload = {
                    applicationId: application._id,
                    applicationNumber: application.applicationNumber,
                    totalPrice: isPenalty ? 1500 : 2000,
                    packageName: isPenalty ? 'Passport Penalty Fee' : 'Passport Application',
                };

                // Send request to create checkout session
                const endpoint = isPenalty ? '/payment/create-checkout-session-passport-penalty' : '/payment/create-checkout-session-passport';
                const paymongoResponse = await api.post(endpoint, payload, withUserHeader(user._id));
                const checkoutUrl = paymongoResponse?.data?.data?.attributes?.checkout_url || paymongoResponse?.data?.attributes?.checkout_url;

                if (checkoutUrl) {
                    Linking.openURL(checkoutUrl).catch(err => {
                        console.error('Failed to open PayMongo URL:', err);
                        Alert.alert('Error', 'Could not open payment page. Please try again.');
                    });
                } else {
                    console.error("PayMongo Response Structure:", paymongoResponse);
                    throw new Error("Failed to create PayMongo checkout session - URL missing");
                }
            }

        } catch (err) {
            console.error('Payment Error:', err.message, err.response?.status);

            let errorMessage = 'Payment failed';
            if (!err.response) {
                errorMessage = 'Network error - Could not reach the server. Please check your internet connection and try again.';
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleStartPayment = handleSubmitPayment;

    const renderRequirementUploadCard = (doc) => {
        const selectedFile = selectedFiles[doc.key];
        const uploadedUrl = uploadedDocuments[doc.key] || application?.submittedDocuments?.[doc.key];
        const selectedFileIsImage = isImageSource(selectedFile);

        return (
            <View key={doc.key} style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, backgroundColor: '#fff' }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1f2937', marginBottom: 6 }}>{doc.label}</Text>
                <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 10 }}>PDF, JPG, or PNG</Text>

                <TouchableOpacity
                    onPress={() => pickDocumentForKey(doc.key)}
                    style={{
                        backgroundColor: '#305797',
                        borderRadius: 10,
                        paddingVertical: 12,
                        alignItems: 'center',
                        opacity: uploadingDocumentKey === doc.key ? 0.7 : 1,
                    }}
                    disabled={uploadingDocumentKey === doc.key || uploadingAll}
                >
                    {uploadingDocumentKey === doc.key ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={{ color: '#fff', fontFamily: 'Montserrat_600SemiBold' }}>
                            {uploadedUrl ? 'Replace File' : (selectedFile ? 'Change Selected' : 'Select File')}
                        </Text>
                    )}
                </TouchableOpacity>

                {selectedFile ? (
                    <View style={{ marginTop: 8, backgroundColor: '#f0f9ff', borderRadius: 8, padding: 10 }}>
                        {selectedFileIsImage ? (
                            <View style={{ marginBottom: 10, borderRadius: 10, overflow: 'hidden', backgroundColor: '#e5eefc' }}>
                                <Image
                                    source={{ uri: selectedFile.uri }}
                                    style={{ width: '100%', height: 160 }}
                                    resizeMode="cover"
                                />
                            </View>
                        ) : null}

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: '#305797', fontSize: 12, fontFamily: 'Montserrat_600SemiBold' }}>
                                    {selectedFile.name || 'File selected'}
                                </Text>
                                <Text style={{ color: '#16a34a', fontSize: 11, marginTop: 2 }}>Ready to upload</Text>
                            </View>
                            <TouchableOpacity onPress={() => removeSelectedFile(doc.key)}>
                                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : uploadedUrl ? (
                    <View style={{ marginTop: 8 }}>
                        <Text style={{ color: '#16a34a', fontSize: 12 }}>File uploaded</Text>
                        <TouchableOpacity onPress={() => openDocument(uploadedUrl)}>
                            <Text style={{ color: '#305797', fontSize: 12, marginTop: 6 }}>Preview</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
            </View>
        );
    };

    //RENDER UPLOAD DOCUMENTS
    const renderReadOnlyFile = (url, label) => {
        // Check if the URL contains '.pdf' (case insensitive)
        const isPdf = typeof url === 'string' && url.toLowerCase().split(/[?#]/)[0].endsWith('.pdf');

        const handleDownload = () => {
            if (!url) return;
            const downloadUrl = url.includes('cloudinary.com')
                ? url.replace('/upload/', '/upload/fl_attachment/')
                : url;
            window.location.href = downloadUrl;
        };

        if (!url) {
            return <div style={{ fontSize: 13, color: '#6b7280' }}>No file</div>;
        }

        return (
            <View style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 320 }}>
                <TouchableOpacity
                    onPress={() => handlePreview(url)}
                >
                    <Text style={{ color: '#305797', fontSize: 12 }}>Preview File</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleDownload}
                >
                    <Text style={{ color: '#305797', fontSize: 12 }}>Download {isPdf ? 'PDF' : 'File'}</Text>
                </TouchableOpacity>
            </View>
        );
    };


    const getRequirementPreviewFile = (key) => {
        const submittedDocuments = application?.submittedDocuments || application?.documents || {};

        switch (key) {
            case 'birthCert':
                return selectedFiles.birthCert || birthCertList[0] || submittedDocuments.birthCertificate || application?.birthCertificate || null;
            case 'applicationForm':
                return selectedFiles.applicationForm || applicationFormList[0] || submittedDocuments.applicationForm || application?.applicationForm || null;
            case 'govId':
                return selectedFiles.govId || govIdList[0] || submittedDocuments.govId || application?.govId || null;
            default:
                return null;
        }
    };

    const uploadedDocuments = application?.submittedDocuments || application?.documents || {};

    //HANDLE PREVIEW FOR UPLOADED FILES
    const handlePreview = (file) => {
        const src = typeof file === 'string'
            ? file
            : file.preview || file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : null);
        if (src) {
            window.open(src, '_blank', 'noopener,noreferrer');
            return;
        }
        Alert.alert('Error', 'Preview unavailable');
    };

    //ADD PREVIEW URL TO FILES FOR UPLOADED DOCUMENTS
    const withPreview = (newList) =>
        newList.map((file) => {
            if (!file.preview && file.originFileObj) {
                file.preview = URL.createObjectURL(file.originFileObj);
            }
            return file;
        });

    const beforeRequirementUpload = (file) => {
        const isLt3M = file.size / 1024 / 1024 < 3;
        if (!isLt3M) {
            Alert.alert('Error', 'Image/PDF must be smaller than 3MB!');
        }
        return isLt3M || Upload.LIST_IGNORE;
    };

    //HANDLE SUBMISSION OF UPLOADED DOCUMENTS
    const handleSubmit = async () => {
        if (uploading || uploadingAll) {
            Alert.alert('Warning', "Please wait until uploads finish");
            return;
        }

        if (!resubmissionRequested) {
            if (!selectedFiles.birthCert || !selectedFiles.applicationForm || !selectedFiles.govId) {
                Alert.alert('Warning', "Please upload the required documents before submitting.");
                return;
            }
        } else {
            if (requestedResubmissionTargets.length === 0) {
                Alert.alert('Warning', "No document is currently marked for resubmission.");
                return;
            }
            if (!requestedResubmissionTargets.some(hasSelectedFileForTarget)) {
                Alert.alert('Warning', "Please upload the requested document before submitting.");
                return;
            }
        }
        try {
            setUploading(true);
            setUploadingAll(true);

            const formData = new FormData();

            const appendSelectedFile = (file) => ({
                uri: file.uri,
                type: file.type || 'application/octet-stream',
                name: file.name || `document-${Date.now()}`,
            });

            const appendedOrder = [];
            if (selectedFiles.birthCert && isRequestedResubmissionTarget('birthCert')) {
                if (!selectedFiles.birthCert?.uri) {
                    Alert.alert('Error', 'PSA Birth Certificate file is invalid. Please reselect the file.');
                    return;
                }
                formData.append('files', appendSelectedFile(selectedFiles.birthCert));
                appendedOrder.push('birthCertificate');
            }

            if (selectedFiles.applicationForm && isRequestedResubmissionTarget('applicationForm')) {
                if (!selectedFiles.applicationForm?.uri) {
                    Alert.alert('Error', 'Application Form file is invalid. Please reselect the file.');
                    return;
                }
                formData.append('files', appendSelectedFile(selectedFiles.applicationForm));
                appendedOrder.push('applicationForm');
            }

            if (selectedFiles.govId && isRequestedResubmissionTarget('govId')) {
                if (!selectedFiles.govId?.uri) {
                    Alert.alert('Error', 'Government-issued ID file is invalid. Please reselect the file.');
                    return;
                }
                formData.append('files', appendSelectedFile(selectedFiles.govId));
                appendedOrder.push('govId');
            }



            if (!formData.has('files')) {
                Alert.alert('Warning', "Please upload the required documents before submitting.");
                return;
            }

            const res = await api.post(
                '/upload/upload-passport-requirements',
                formData,
                {
                    headers: {
                        ...(withUserHeader(user._id)?.headers || {}),
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            const uploaded = res?.data?.urls || res?.data?.data?.urls || [];
            // Map uploaded urls back to the fields we appended in order
            const payload = {};
            let urlIndex = 0;
            appendedOrder.forEach((key) => {
                const url = uploaded[urlIndex];
                if (!url) return;
                payload[key] = url;
                urlIndex += 1;
            });

            await api.put(
                `/passport/applications/${id}/documents`,
                { submittedDocuments: payload },
                withUserHeader(user._id)
            );

            // reset
            setBirthCertList([]);
            setApplicationFormList([]);
            setGovIdList([]);

            const allApps = await api.get('/passport/applications', withUserHeader(user._id));
            const refreshed = allApps.data.find(app => app._id === id);
            setApplication(refreshed);

            setSelectedFiles({});
            setBirthCertList([]);
            setApplicationFormList([]);
            setGovIdList([]);
            setIsDocumentsUploadedModalOpen(true);
            setShowDocumentsSuccessModal(true);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to submit documents');
        } finally {
            setUploading(false);
            setUploadingAll(false);
        }
    };

    //HANDLE CONFIRMATION OF SUGGESTED APPOINTMENT
    const handleConfirmSuggested = async () => {
        if (!application?.suggestedAppointmentSchedules || selectedSuggestedIndex === null) {
            Alert.alert('Notice', 'Please select an appointment option first.');
            return;
        }

        let dateToSend = null;
        let timeToSend = null;

        if (selectedSuggestedIndex === 'others') {
            if (!customPreferredDate || !customPreferredTime) {
                Alert.alert('Error', 'Please fill in all custom date and time fields.');
                return;
            }

            dateToSend = dayjs(customPreferredDate).format('YYYY-MM-DD');
            timeToSend = customPreferredTime;

        } else if (typeof selectedSuggestedIndex === 'number') {
            const selected = application.suggestedAppointmentSchedules[selectedSuggestedIndex];

            if (!selected?.date || !selected?.time) {
                Alert.alert('Error', 'Selected option is missing date or time.');
                return;
            }

            dateToSend = dayjs(selected.date).format('YYYY-MM-DD');
            timeToSend = selected.time;
        }

        try {
            setConfirmingSuggested(true);

            await api.put(`/passport/applications/${id}/choose-appointment`, {
                date: dateToSend,
                time: timeToSend
            }, withUserHeader(user._id));

            // optional: keep state in sync
            setSelectedDate(dateToSend);
            setSelectedTime(timeToSend);

            const allApps = await api.get('/passport/applications', withUserHeader(user._id));
            const refreshed = allApps.data.find(app => app._id === id);
            setApplication(refreshed);
            setShowAppointmentSuccessModal(true);
            setIsDateSelectedModalOpen(true);
        } catch (error) {
            Alert.alert('Error', 'Failed to confirm appointment schedule.');
        } finally {
            setConfirmingSuggested(false);
        }
    };


    const disableDates = (current) => {
        const today = dayjs().startOf('day');
        const twoWeeksFromNow = today.add(14, 'day');

        return (
            current &&
            (
                current < twoWeeksFromNow ||
                current.day() === 0 ||
                current.day() === 6
            )
        );
    };
    const disabledHours = () => {
        const hours = [];
        for (let i = 0; i < 24; i++) {
            if (i < 8 || i > 17) {
                hours.push(i);
            }
        }
        return hours;
    };

    const timeSlots = [
        "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
        "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
        "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
    ];


    //IF NO ID IN URL, GO BACK TO USER APPLICATIONS
    useEffect(() => {
        if (!id) {
            navigation.navigate('Home');
        }
    }, [id, navigation]);


    //UPLOAD DOCUMENTS SECTION STATUS CONDITION
    const status = application?.status?.toLowerCase();
    const isOnPenalty = application?.onPenalty === true || application?.penaltyOn === true;
    const hasSecondChance = application?.secondChance === true;
    const showPenaltyPaymentSection = isOnPenalty && !hasSecondChance;

    const shouldShow =
        status === 'payment completed' ||
        application?.secondChance === true;

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f5f7fa', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#305797" />
                <Text style={{ marginTop: 10, color: '#6b7280' }}>Loading details...</Text>
            </View>
        );
    }

    if (!application) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f5f7fa', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#6b7280' }}>Application not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20, padding: 10, backgroundColor: '#305797', borderRadius: 8 }}>
                    <Text style={{ color: '#fff' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={PassportProgressStyle.container}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={PassportProgressStyle.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={PassportProgressStyle.headerContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={PassportProgressStyle.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text style={PassportProgressStyle.title}>Passport Details</Text>
                </View>

                {/* Application Info Card */}
                <View style={PassportProgressStyle.card}>
                    <Text style={PassportProgressStyle.cardTitle}>Application Info</Text>

                    {showPenaltyPaymentSection && (
                        <View style={{ backgroundColor: '#fee2e2', padding: 8, borderRadius: 8, marginBottom: 10 }}>
                            <Text style={{ color: '#b91c1c', fontFamily: 'Montserrat_600SemiBold' }}>You are currently on Penalty, kindly pay the penalty fee to continue with your application.</Text>
                        </View>
                    )}

                    {appStatus.toLowerCase() === 'documents approved' && (
                        <View style={{ backgroundColor: '#ecfdf4', padding: 8, borderRadius: 8, marginBottom: 10 }}>
                            <Text style={{ color: '#059669', fontFamily: 'Montserrat_600SemiBold' }}>Documents Approved</Text>
                        </View>
                    )}

                    {appStatus.toLowerCase() === 'dfa approved' && (
                        <View style={{ backgroundColor: '#ecfdf4', padding: 8, borderRadius: 8, marginBottom: 10 }}>
                            <Text style={{ color: '#059669', fontFamily: 'Montserrat_600SemiBold' }}>Congratulations! Your documents have been approved by the DFA.</Text>
                        </View>
                    )}

                    {appStatus.toLowerCase() === 'rejected' && (
                        <View style={{ backgroundColor: '#fee2e2', padding: 8, borderRadius: 8, marginBottom: 10 }}>
                            <Text style={{ color: '#96050c', fontFamily: 'Montserrat_600SemiBold' }}>Documents Rejected</Text>
                        </View>
                    )}

                    {appStatus.toLowerCase() !== 'application submitted' && appStatus.toLowerCase() !== 'application approved' && appStatus.toLowerCase() !== 'payment completed' && appStatus.toLowerCase() !== 'documents uploaded' &&
                        appStatus.toLowerCase() !== 'documents approved' && appStatus.toLowerCase() !== 'dfa approved' && appStatus.toLowerCase() !== 'passport released' && appStatus.toLowerCase() !== 'rejected' && (
                            <View style={{ backgroundColor: '#fdfdec', padding: 8, borderRadius: 8, marginBottom: 10 }}>
                                <Text style={{ color: '#969405', fontFamily: 'Montserrat_600SemiBold' }}>Kindly Refer to the Progress Tracker to Track your Application</Text>
                            </View>
                        )}

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Reference</Text>
                        <Text style={PassportProgressStyle.infoValue}>{application.applicationNumber || application.applicationId || application._id}</Text>
                    </View>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Status</Text>
                        <View style={PassportProgressStyle.statusTag}>
                            <Text style={PassportProgressStyle.statusText}>{appStatus}</Text>
                        </View>
                    </View>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Date Submitted</Text>
                        <Text style={PassportProgressStyle.infoValue}>{dayjs(application.createdAt).format('MMM D, YYYY')}</Text>
                    </View>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Applicant Name</Text>
                        <Text style={PassportProgressStyle.infoValue}>{application.username || 'N/A'}</Text>
                    </View>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Managed By</Text>
                        <Text style={PassportProgressStyle.infoValue}>{application.managedBy || 'N/A'}</Text>
                    </View>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>DFA Location</Text>
                        <Text style={PassportProgressStyle.infoValue}>{application.dfaLocation}</Text>
                    </View>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Preferred Date</Text>
                        <Text style={PassportProgressStyle.infoValue}>{dayjs(application.preferredDate).format('MMM D, YYYY')}</Text>
                    </View>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Preferred Time</Text>
                        <Text style={PassportProgressStyle.infoValue}>{application.preferredTime}</Text>
                    </View>

                    <View style={PassportProgressStyle.infoRow}>
                        <Text style={PassportProgressStyle.infoLabel}>Application Fee</Text>
                        <Text style={PassportProgressStyle.infoValue}>
                            ₱ {passportApplicationFee.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                    </View>

                    {statusDeadlineDate?.isValid() && (
                        <View style={PassportProgressStyle.infoRow}>
                            <Text style={PassportProgressStyle.infoLabel}>Deadline</Text>
                            <Text style={PassportProgressStyle.infoValue}>{statusDeadlineDate.format('MMM D, YYYY')}</Text>
                        </View>
                    )}

                    <View style={[PassportProgressStyle.infoRow, { borderBottomWidth: 0 }]}>
                        <Text style={PassportProgressStyle.infoLabel}>Application Type</Text>
                        <Text style={[PassportProgressStyle.infoValue, { fontFamily: 'Montserrat_700Bold', color: '#305797' }]}>
                            {application.applicationType}
                        </Text>
                    </View>
                </View>






                {/* SERVICE FEE */}
                {appStatus.toLowerCase() === 'application approved' && (
                    <View style={PassportProgressStyle.card}>
                        <Text style={PassportProgressStyle.cardTitle}>Application Payment</Text>
                        <Text style={{ color: '#6b7280', marginBottom: 12, fontSize: 13 }}>Complete payment for your passport application to proceed.</Text>

                        <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', padding: 12, borderRadius: 8, marginBottom: 12, alignItems: 'center' }}>
                            <Text style={{ color: '#6b7280', fontSize: 12 }}>Application Fee</Text>
                            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#305797', fontSize: 18, marginTop: 6 }}>
                                ₱ 2,000.00
                            </Text>
                        </View>

                        {isApplicationPaymentDisabled && (
                            <Text style={{ color: '#b45309', marginBottom: 12, fontSize: 13, fontFamily: 'Montserrat_600SemiBold' }}>
                                A pending payment transaction already exists for this application.
                            </Text>
                        )}

                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                            <TouchableOpacity
                                onPress={() => setPaymentMethod('paymongo')}
                                disabled={isApplicationPaymentDisabled}
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: paymentMethod === 'paymongo' ? '#305797' : '#d1d5db',
                                    backgroundColor: paymentMethod === 'paymongo' ? '#eaf1ff' : '#fff',
                                    borderRadius: 12,
                                    padding: 14,
                                    opacity: isApplicationPaymentDisabled ? 0.55 : 1,
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1f2937' }}>Paymongo</Text>
                                    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: paymentMethod === 'paymongo' ? '#305797' : '#9ca3af', alignItems: 'center', justifyContent: 'center' }}>
                                        {paymentMethod === 'paymongo' && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#305797' }} />}
                                    </View>
                                </View>
                                <Text style={{ fontSize: 12, color: '#6b7280' }}>Pay securely through card, GCash, GrabPay, Maya, or QRPH.</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setPaymentMethod('manual')}
                                disabled={isApplicationPaymentDisabled}
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: paymentMethod === 'manual' ? '#305797' : '#d1d5db',
                                    backgroundColor: paymentMethod === 'manual' ? '#eaf1ff' : '#fff',
                                    borderRadius: 12,
                                    padding: 14,
                                    opacity: isApplicationPaymentDisabled ? 0.55 : 1,
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1f2937' }}>Manual</Text>
                                    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: paymentMethod === 'manual' ? '#305797' : '#9ca3af', alignItems: 'center', justifyContent: 'center' }}>
                                        {paymentMethod === 'manual' && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#305797' }} />}
                                    </View>
                                </View>
                                <Text style={{ fontSize: 12, color: '#6b7280' }}>Upload your proof of payment for manual verification.</Text>
                            </TouchableOpacity>
                        </View>

                        {paymentMethod === 'manual' && (
                            <View style={{ marginBottom: 14 }}>
                                <View style={PaymentStyle.manualBankSection}>
                                    <Text style={[PaymentStyle.sectionTitle, { fontSize: 16, marginBottom: 12 }]}>Available Bank Accounts</Text>
                                    <View style={PaymentStyle.bankGrid}>
                                        {[
                                            { name: 'GCASH', acc: '09690554806', holder: 'MA***R C.', qr: QRCodeMaricar },
                                            { name: 'GCASH', acc: '09688880405', holder: 'RHN C.', qr: QRCodeRhon },
                                            { name: 'BDO', acc: '006838032692', holder: 'M&RC TRAVEL AND TOURS' },
                                        ].map((bank, index) => (
                                            <View key={index} style={[PaymentStyle.bankGridCard, index === 2 && { width: '100%' }]}>
                                                <Text style={PaymentStyle.bankName}>{bank.name}</Text>
                                                <Text style={PaymentStyle.bankAccount}>{bank.acc}</Text>
                                                <Text style={PaymentStyle.bankHolder}>{bank.holder}</Text>
                                                {bank.qr ? (
                                                    <TouchableOpacity onPress={() => setEnlargedQR(bank.qr)}>
                                                        <Image source={bank.qr} style={{ width: 100, height: 100, marginTop: 8, alignSelf: 'center' }} resizeMode="contain" />
                                                    </TouchableOpacity>
                                                ) : (
                                                    <Text style={{ marginTop: 8, textAlign: 'center', color: '#6b7280', fontFamily: 'Roboto_400Regular' }}></Text>
                                                )}
                                            </View>
                                        ))}
                                    </View>

                                    <View style={PaymentStyle.uploadSection}>
                                        <Text style={PaymentStyle.uploadTitle}>Upload Proof of Payment</Text>
                                        <Text style={PaymentStyle.uploadSubtitle}>Please upload a clear screenshot or photo of your deposit slip or transfer confirmation.</Text>
                                        <Text style={PaymentStyle.uploadSubtitle}>Accepted formats: JPG or PNG. Max size: 2MB.</Text>
                                        <Text style={[PaymentStyle.uploadSubtitle, { color: '#ef4444', fontStyle: 'italic', marginTop: 4 }]}>Our team will manually verify your payment within 1-2 business days.</Text>

                                        <TouchableOpacity style={PaymentStyle.selectImageBtn} onPress={pickProofImage}>
                                            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                                            <Text style={PaymentStyle.selectImageBtnText}>{proofImage ? 'Change Proof Image' : 'Select Receipt Image'}</Text>
                                        </TouchableOpacity>

                                        {proofImage && (
                                            <View style={PaymentStyle.imagePreviewContainer}>
                                                <Text style={PaymentStyle.previewImageLabel}>Preview</Text>
                                                <View style={PaymentStyle.previewImageBox}>
                                                    <View style={PaymentStyle.imageWrapper}>
                                                        <Image source={{ uri: proofImage.uri }} style={PaymentStyle.previewSelectedImage} resizeMode="contain" />
                                                        <TouchableOpacity style={PaymentStyle.removeImageBtn} onPress={() => setProofImage(null)}>
                                                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[PassportProgressStyle.submitBtn, creatingPayment && { opacity: 0.7 }]}
                            disabled={creatingPayment || isApplicationPaymentDisabled || (paymentMethod === 'manual' && !proofImage)}
                            onPress={handleStartPayment}
                        >
                            {creatingPayment ? <ActivityIndicator color="#fff" /> : <Text style={PassportProgressStyle.submitBtnText}>{paymentMethod === 'manual' ? 'Submit Manual Payment' : 'Pay with Paymongo'}</Text>}
                        </TouchableOpacity>
                    </View>
                )}





                {/* PENALTY FEE */}
                {showPenaltyPaymentSection && (
                    <View style={PassportProgressStyle.card}>
                        <Text style={PassportProgressStyle.cardTitle}>Application Payment</Text>
                        <Text style={{ color: '#6b7280', marginBottom: 12, fontSize: 13 }}>Kindly pay the penalty fee of PHP 1,500.00. Before you can continue with your application</Text>

                        <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', padding: 12, borderRadius: 8, marginBottom: 12, alignItems: 'center' }}>
                            <Text style={{ color: '#6b7280', fontSize: 12 }}>Penalty Fee</Text>
                            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#305797', fontSize: 18, marginTop: 6 }}>
                                ₱ 1,500.00
                            </Text>
                        </View>

                        {isPenaltyPaymentDisabled && (
                            <Text style={{ color: '#b45309', marginBottom: 12, fontSize: 13, fontFamily: 'Montserrat_600SemiBold' }}>
                                A pending payment transaction already exists for this application.
                            </Text>
                        )}

                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                            <TouchableOpacity
                                onPress={() => setPaymentMethod('paymongo')}
                                disabled={isPenaltyPaymentDisabled}
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: paymentMethod === 'paymongo' ? '#305797' : '#d1d5db',
                                    backgroundColor: paymentMethod === 'paymongo' ? '#eaf1ff' : '#fff',
                                    borderRadius: 12,
                                    padding: 14,
                                    opacity: isPenaltyPaymentDisabled ? 0.55 : 1,
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1f2937' }}>Paymongo</Text>
                                    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: paymentMethod === 'paymongo' ? '#305797' : '#9ca3af', alignItems: 'center', justifyContent: 'center' }}>
                                        {paymentMethod === 'paymongo' && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#305797' }} />}
                                    </View>
                                </View>
                                <Text style={{ fontSize: 12, color: '#6b7280' }}>Pay securely through card, GCash, GrabPay, Maya, or QRPH.</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setPaymentMethod('manual')}
                                disabled={isPenaltyPaymentDisabled}
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: paymentMethod === 'manual' ? '#305797' : '#d1d5db',
                                    backgroundColor: paymentMethod === 'manual' ? '#eaf1ff' : '#fff',
                                    borderRadius: 12,
                                    padding: 14,
                                    opacity: isPenaltyPaymentDisabled ? 0.55 : 1,
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1f2937' }}>Manual</Text>
                                    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: paymentMethod === 'manual' ? '#305797' : '#9ca3af', alignItems: 'center', justifyContent: 'center' }}>
                                        {paymentMethod === 'manual' && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#305797' }} />}
                                    </View>
                                </View>
                                <Text style={{ fontSize: 12, color: '#6b7280' }}>Upload your proof of payment for manual verification.</Text>
                            </TouchableOpacity>
                        </View>

                        {paymentMethod === 'manual' && (
                            <View style={{ marginBottom: 14 }}>
                                <View style={PaymentStyle.manualBankSection}>
                                    <Text style={[PaymentStyle.sectionTitle, { fontSize: 16, marginBottom: 12 }]}>Available Bank Accounts</Text>
                                    <View style={PaymentStyle.bankGrid}>
                                        {[
                                            { name: 'GCASH', acc: '09690554806', holder: 'MA***R C.', qr: QRCodeMaricar },
                                            { name: 'GCASH', acc: '09688880405', holder: 'RHN C.', qr: QRCodeRhon },
                                            { name: 'BDO', acc: '006838032692', holder: 'M&RC TRAVEL AND TOURS' },
                                        ].map((bank, index) => (
                                            <View key={index} style={[PaymentStyle.bankGridCard, index === 2 && { width: '100%' }]}>
                                                <Text style={PaymentStyle.bankName}>{bank.name}</Text>
                                                <Text style={PaymentStyle.bankAccount}>{bank.acc}</Text>
                                                <Text style={PaymentStyle.bankHolder}>{bank.holder}</Text>
                                                {bank.qr ? (
                                                    <TouchableOpacity onPress={() => setEnlargedQR(bank.qr)}>
                                                        <Image source={bank.qr} style={{ width: 100, height: 100, marginTop: 8, alignSelf: 'center' }} resizeMode="contain" />
                                                    </TouchableOpacity>
                                                ) : (
                                                    <Text style={{ marginTop: 8, textAlign: 'center', color: '#6b7280', fontFamily: 'Roboto_400Regular' }}></Text>
                                                )}
                                            </View>
                                        ))}
                                    </View>

                                    <View style={PaymentStyle.uploadSection}>
                                        <Text style={PaymentStyle.uploadTitle}>Upload Proof of Payment</Text>
                                        <Text style={PaymentStyle.uploadSubtitle}>Please upload a clear screenshot or photo of your deposit slip or transfer confirmation.</Text>
                                        <Text style={PaymentStyle.uploadSubtitle}>Accepted formats: JPG or PNG. Max size: 2MB.</Text>
                                        <Text style={[PaymentStyle.uploadSubtitle, { color: '#ef4444', fontStyle: 'italic', marginTop: 4 }]}>Our team will manually verify your payment within 1-2 business days.</Text>

                                        <TouchableOpacity style={PaymentStyle.selectImageBtn} onPress={pickProofImage}>
                                            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                                            <Text style={PaymentStyle.selectImageBtnText}>{proofImage ? 'Change Proof Image' : 'Select Receipt Image'}</Text>
                                        </TouchableOpacity>

                                        {proofImage && (
                                            <View style={PaymentStyle.imagePreviewContainer}>
                                                <Text style={PaymentStyle.previewImageLabel}>Preview</Text>
                                                <View style={PaymentStyle.previewImageBox}>
                                                    <View style={PaymentStyle.imageWrapper}>
                                                        <Image source={{ uri: proofImage.uri }} style={PaymentStyle.previewSelectedImage} resizeMode="contain" />
                                                        <TouchableOpacity style={PaymentStyle.removeImageBtn} onPress={() => setProofImage(null)}>
                                                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[PassportProgressStyle.submitBtn, creatingPayment && { opacity: 0.7 }]}
                            disabled={creatingPayment || isPenaltyPaymentDisabled || (paymentMethod === 'manual' && !proofImage)}
                            onPress={handleStartPayment}
                        >
                            {creatingPayment ? <ActivityIndicator color="#fff" /> : <Text style={PassportProgressStyle.submitBtnText}>{paymentMethod === 'manual' ? 'Submit Manual Payment' : 'Pay with Paymongo'}</Text>}
                        </TouchableOpacity>
                    </View>
                )}





                {/* UPLOAD REQUIREMENTS */}
                {appStatus.toLowerCase() === 'payment completed' && (!isOnPenalty || hasSecondChance) && (
                    <View style={PassportProgressStyle.card}>
                        <Text style={PassportProgressStyle.cardTitle}>Upload Requirements</Text>
                        <Text style={{ color: '#6b7280', marginBottom: 12, fontSize: 13 }}>
                            Please prepare and upload the following requirements for your passport application.
                        </Text>

                        <View style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 14 }}>
                            {passportRequirements.filter((doc) => doc.key !== 'birthCertificate').map((doc, idx, filteredDocs) => {
                                const selectedFile = selectedFiles[doc.key];
                                const uploadedUrl = uploadedDocuments[doc.key]
                                    || application?.submittedDocuments?.[doc.key]
                                    || (doc.key === 'birthCert' ? (uploadedDocuments.birthCertificate || application?.submittedDocuments?.birthCertificate) : null);
                                const hasFile = Boolean(uploadedUrl || selectedFile);
                                const isValidRequirement = !isRequestedResubmissionTarget(doc.key);

                                return (
                                    <View key={doc.key} style={{ paddingVertical: 12, borderBottomWidth: idx === filteredDocs.length - 1 ? 0 : 1, borderBottomColor: '#eef2f7' }}>
                                        <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#1f2937', fontSize: 14 }}>{doc.label}</Text>
                                        {isValidRequirement && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: 6, backgroundColor: '#ecfdf3', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
                                                <Ionicons name="checkmark-circle" size={14} color="#059669" />
                                                <Text style={{ color: '#059669', fontSize: 11, fontFamily: 'Montserrat_600SemiBold' }}>Valid Requirement</Text>
                                            </View>
                                        )}
                                        <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>PDF, JPG, or PNG. Max 3 MB.</Text>
                                        {!isValidRequirement && (
                                            <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                                <TouchableOpacity
                                                    onPress={() => pickDocumentForKey(doc.key)}
                                                    disabled={uploadingDocumentKey === doc.key || uploadingAll}
                                                    style={{ padding: 8, backgroundColor: '#eef2ff', borderRadius: 8, opacity: uploadingDocumentKey === doc.key ? 0.7 : 1 }}
                                                >
                                                    {uploadingDocumentKey === doc.key ? (
                                                        <ActivityIndicator color="#305797" size="small" />
                                                    ) : (
                                                        <Text style={{ color: '#305797', fontFamily: 'Montserrat_600SemiBold', fontSize: 13 }}>{hasFile ? 'Change File' : 'Select File'}</Text>
                                                    )}
                                                </TouchableOpacity>
                                                {hasFile && (
                                                    <TouchableOpacity
                                                        onPress={() => previewFile(selectedFile || uploadedUrl)}
                                                        style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: '#dbe4f0' }}
                                                    >
                                                        <Text style={{ color: '#305797', fontSize: 12, fontFamily: 'Montserrat_600SemiBold' }}>Preview</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        )}
                                        {hasFile && (
                                            <Text numberOfLines={1} style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
                                                {selectedFile?.name || uploadedUrl?.split('/').pop() || 'Ready to submit'}
                                            </Text>
                                        )}
                                    </View>
                                );
                            })}
                        </View>

                        <TouchableOpacity
                            style={[PassportProgressStyle.submitBtn, uploadingAll && { opacity: 0.7 }, { marginTop: 16 }]}
                            disabled={uploadingAll || Object.keys(selectedFiles).length === 0}
                            onPress={submitAllSelectedFiles}
                        >
                            {uploadingAll ? <ActivityIndicator color="#fff" /> : <Text style={PassportProgressStyle.submitBtnText}>Submit All Documents</Text>}
                        </TouchableOpacity>
                    </View>
                )}


                {/* UPLOADED DOCUMENTS */}
                {appStatus.toLowerCase() === "payment completed" && (!isOnPenalty || hasSecondChance) && getUploadedDocumentEntries().length > 0 && (
                    <View style={PassportProgressStyle.card}>
                        <Text style={PassportProgressStyle.cardTitle}>Uploaded Documents</Text>
                        <Text style={{ color: '#6b7280', marginBottom: 12, fontSize: 13 }}>
                            These are the documents currently saved on your passport application.
                        </Text>

                        <View style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 14 }}>
                            {getUploadedDocumentEntries().map(([key, value]) => {
                                const requirementLabel = passportRequirements.find((doc) => doc.key === key)?.label || key.replace(/_/g, ' ');

                                return (
                                    <View key={key} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eef2f7' }}>
                                        <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#1f2937', fontSize: 14, marginBottom: 8 }}>
                                            {String(requirementLabel).toUpperCase()}
                                        </Text>

                                        <TouchableOpacity onPress={() => openDocument(value)}>
                                            <Text style={{ color: '#305797', fontSize: 12 }}>Preview / Open Document</Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}


                {appStatus.toLowerCase() === 'application submitted' && !hasSuggestedAppointmentScheduleChosen && (
                    <View style={PassportProgressStyle.card}>
                        <Text style={PassportProgressStyle.cardTitle}>Suggested Appointment Options</Text>

                        {appointmentOptions.length > 0 ? (
                            <>
                                <Text style={{ color: '#6b7280', marginBottom: 15, fontSize: 13 }}>Please select a date and time for your DFA appointment.</Text>

                                {appointmentOptions.map((slot, index) => (
                                    (() => {
                                        const normalizedSlot = normalizeScheduleSlot(slot);
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    PassportProgressStyle.optionCard,
                                                    selectedScheduleIndex === index && PassportProgressStyle.optionCardSelected
                                                ]}
                                                onPress={() => setSelectedScheduleIndex(index)}
                                            >
                                                <View style={PassportProgressStyle.optionTag}>
                                                    <Text style={PassportProgressStyle.optionTagText}>Option {index + 1}</Text>
                                                </View>
                                                <Text style={PassportProgressStyle.optionDate}>
                                                    {normalizedSlot.date ? dayjs(normalizedSlot.date).format("MMM DD, YYYY") : 'No date provided'}
                                                </Text>
                                                <Text style={PassportProgressStyle.optionTime}>{formatTimeForDisplay(normalizedSlot.time)} </Text>
                                            </TouchableOpacity>
                                        );
                                    })()
                                ))}

                                <TouchableOpacity
                                    style={[
                                        PassportProgressStyle.optionCard,
                                        isOthersSelected && PassportProgressStyle.optionCardSelected
                                    ]}
                                    onPress={() => setSelectedScheduleIndex('others')}
                                >
                                    <View style={PassportProgressStyle.optionTag}>
                                        <Text style={PassportProgressStyle.optionTagText}>Others</Text>
                                    </View>
                                    <Text style={PassportProgressStyle.optionDate}>Enter your preferred date and time</Text>
                                    <Text style={PassportProgressStyle.optionTime}>Pick both values from the native date and time pickers.</Text>

                                    {isOthersSelected && (
                                        <View style={{ marginTop: 14 }}>
                                            <TouchableOpacity
                                                onPress={() => setShowCustomDatePicker(true)}
                                                style={{
                                                    borderWidth: 1,
                                                    borderColor: '#d1d5db',
                                                    borderRadius: 8,
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 12,
                                                    marginBottom: 10,
                                                    backgroundColor: '#fff',
                                                }}
                                            >
                                                <Text style={{ color: customPreferredDate ? '#1f2937' : '#9ca3af', fontFamily: 'Roboto_400Regular' }}>
                                                    {customPreferredDate ? dayjs(customPreferredDate).format('MMM D, YYYY') : 'Select Preferred Date'}
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => setShowCustomTimePicker(true)}
                                                style={{
                                                    borderWidth: 1,
                                                    borderColor: '#d1d5db',
                                                    borderRadius: 8,
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 12,
                                                    backgroundColor: '#fff',
                                                }}
                                            >
                                                <Text style={{ color: customPreferredTime ? '#1f2937' : '#9ca3af', fontFamily: 'Roboto_400Regular' }}>
                                                    {customPreferredTime || 'Select Preferred Time'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[PassportProgressStyle.submitBtn, !canConfirmSchedule && { opacity: 0.5 }]}
                                    disabled={!canConfirmSchedule}
                                    onPress={handleConfirmSchedule}
                                >
                                    {confirmingSchedule ? <ActivityIndicator color="#fff" /> : <Text style={PassportProgressStyle.submitBtnText}>Confirm Selected Date</Text>}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <Text style={{ color: '#6b7280', fontSize: 14 }}>No suggested dates yet. Please check back later.</Text>
                        )}
                    </View>
                )}

                <Modal visible={showCustomDatePicker} transparent animationType="fade" onRequestClose={() => setShowCustomDatePicker(false)}>
                    <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 }} activeOpacity={1} onPress={() => setShowCustomDatePicker(false)}>
                        <TouchableWithoutFeedback>
                            <View style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' }}>
                                <DateTimePicker
                                    value={customPreferredDate || dayjs().add(14, 'days').toDate()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    minimumDate={dayjs().add(14, 'days').toDate()}
                                    onChange={handleCustomDateChange}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </TouchableOpacity>
                </Modal>

                <Modal visible={showCustomTimePicker} transparent animationType="fade" onRequestClose={() => setShowCustomTimePicker(false)}>
                    <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 }} activeOpacity={1} onPress={() => setShowCustomTimePicker(false)}>
                        <TouchableWithoutFeedback>
                            <View style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', maxHeight: '60%' }}>
                                <View style={{ padding: 20, borderBottomWidth: 1, borderColor: '#e5e7eb', width: '100%', backgroundColor: '#f9fafb' }}>
                                    <Text style={{ fontSize: 16, fontFamily: 'Montserrat_700Bold', color: '#1f2937', textAlign: 'center' }}>Select Time</Text>
                                </View>
                                <ScrollView style={{ width: '100%' }}>
                                    {timeSlots.map((slot, i) => (
                                        <TouchableOpacity key={i} style={{ paddingVertical: 16, borderBottomWidth: 1, borderColor: '#f3f4f6', alignItems: 'center' }}
                                            onPress={() => { setCustomPreferredTime(slot); setShowCustomTimePicker(false); }}>
                                            <Text style={{ fontSize: 16, fontFamily: customPreferredTime === slot ? "Montserrat_700Bold" : "Roboto_500Medium", color: customPreferredTime === slot ? '#305797' : '#374151' }}>{slot}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </TouchableOpacity>
                </Modal>

                {/* Progress Tracker Card */}
                <View style={PassportProgressStyle.card}>
                    <Text style={PassportProgressStyle.cardTitle}>Progress Tracker</Text>

                    <View style={{ marginTop: 10 }}>
                        <View style={{ backgroundColor: '#eef2f7', borderRadius: 14, padding: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, color: '#1f2937', marginBottom: 6 }}>
                                    <Text style={{ fontWeight: '700' }}>Current status set on:</Text> {currentStatusSetDate?.isValid() ? currentStatusSetDate.format('MMM D, YYYY') : '—'}
                                </Text>
                            </View>
                            <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
                                <View style={{ backgroundColor: '#fff3cc', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, marginBottom: 8 }}>
                                    <Text style={{ color: '#92400e', fontWeight: '700' }}>Time-limited action</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={{ marginTop: 10 }}>
                        {stepTimeline.map((timelineStep) => {
                            const { step, index, isCompleted, isActive, isLast, setDate, deadlineDate, daysLeft } = timelineStep;

                            return (
                                <View key={index} style={PassportProgressStyle.stepItem}>
                                    <View style={PassportProgressStyle.stepIndicator}>
                                        <View style={[PassportProgressStyle.stepCircle, isCompleted ? PassportProgressStyle.stepCircleActive : PassportProgressStyle.stepCircleInactive]}>
                                            <Text style={isCompleted ? PassportProgressStyle.stepNumberActive : PassportProgressStyle.stepNumberInactive}>
                                                {index + 1}
                                            </Text>
                                        </View>
                                        {!isLast && (
                                            <View style={[PassportProgressStyle.stepLine, isCompleted && !isActive ? PassportProgressStyle.stepLineActive : {}]} />
                                        )}
                                    </View>

                                    <View style={PassportProgressStyle.stepContent}>
                                        <Text style={isCompleted ? PassportProgressStyle.stepTitleActive : PassportProgressStyle.stepTitleInactive}>
                                            {step}
                                        </Text>

                                        <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
                                            Set on: {setDate?.isValid() ? setDate.format('MMM D, YYYY') : '—'}
                                        </Text>

                                        {deadlineDate && (
                                            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
                                                Deadline: {deadlineDate.format('MMM D, YYYY')}
                                                {typeof daysLeft === 'number' && (
                                                    <Text style={{ color: daysLeft < 0 ? '#dc2626' : '#6b7280' }}>
                                                        {` (${daysLeft < 0 ? `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} overdue` : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`})`}
                                                    </Text>
                                                )}
                                            </Text>
                                        )}

                                        {isActive && (
                                            <Text style={[PassportProgressStyle.stepDesc, { marginTop: 6 }]}>
                                                Current Stage
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

            </ScrollView>

            {/* Appointment Success Modal */}
            <Modal visible={showAppointmentSuccessModal} transparent animationType="fade" onRequestClose={() => setShowAppointmentSuccessModal(false)}>
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}
                    activeOpacity={1}
                    onPress={() => setShowAppointmentSuccessModal(false)}
                >
                    <TouchableWithoutFeedback>
                        <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', width: '85%' }}>
                            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#d1fae5', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                                <Ionicons name="checkmark" size={32} color="#059669" />
                            </View>
                            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#1f2937', marginBottom: 8, textAlign: 'center' }}>
                                Appointment Date has been selected
                            </Text>
                            <Text style={{ fontFamily: 'Roboto_400Regular', fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20, lineHeight: 20 }}>
                                Your appointment schedule has been confirmed. Please check your email for further instructions.
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowAppointmentSuccessModal(false)}
                                style={{ backgroundColor: '#305797', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 32 }}
                            >
                                <Text style={{ color: '#fff', fontFamily: 'Montserrat_600SemiBold', fontSize: 14 }}>Got It</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            {/* Documents Upload Success Modal */}
            <Modal visible={showDocumentsSuccessModal} transparent animationType="fade" onRequestClose={() => setShowDocumentsSuccessModal(false)}>
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}
                    activeOpacity={1}
                    onPress={() => setShowDocumentsSuccessModal(false)}
                >
                    <TouchableWithoutFeedback>
                        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', maxWidth: 400 }}>
                            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <Ionicons name="checkmark-circle" size={40} color="#10b981" />
                            </View>
                            <Text style={{ fontSize: 18, fontFamily: 'Montserrat_700Bold', color: '#1f2937', marginBottom: 8, textAlign: 'center' }}>
                                Files Uploaded Successfully!
                            </Text>
                            <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 20, textAlign: 'center', lineHeight: 20 }}>
                                All your passport documents have been uploaded. Our team will review them shortly.
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowDocumentsSuccessModal(false)}
                                style={{ backgroundColor: '#305797', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }}
                            >
                                <Text style={{ color: '#fff', fontFamily: 'Montserrat_600SemiBold' }}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            <Modal visible={!!enlargedQR} transparent animationType="fade" onRequestClose={() => setEnlargedQR(null)}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setEnlargedQR(null)}>
                    <View style={{ position: 'relative', width: '85%', aspectRatio: 1 }}>
                        <Image source={enlargedQR} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                        <TouchableOpacity
                            style={{ position: 'absolute', top: -40, right: -10, width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => setEnlargedQR(null)}
                        >
                            <Ionicons name="close-circle" size={40} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={!!requirementPreview} transparent animationType="fade" onRequestClose={() => setRequirementPreview(null)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <View style={{ width: '100%', maxWidth: 520, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
                            <Text numberOfLines={1} style={{ flex: 1, fontFamily: 'Montserrat_700Bold', color: '#1f2937', fontSize: 14, marginRight: 12 }}>
                                {requirementPreview?.name || 'Preview'}
                            </Text>
                            <TouchableOpacity onPress={() => setRequirementPreview(null)}>
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        {requirementPreview?.kind === 'image' ? (
                            <View style={{ width: '100%', aspectRatio: 1, backgroundColor: '#111827' }}>
                                <Image source={{ uri: requirementPreview.uri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                            </View>
                        ) : (
                            <View style={{ padding: 24, alignItems: 'center' }}>
                                <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                                    <Ionicons name="document-text-outline" size={38} color="#305797" />
                                </View>
                                <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1f2937', fontSize: 16, marginBottom: 8, textAlign: 'center' }}>PDF Ready to Preview</Text>
                                <Text style={{ color: '#6b7280', fontSize: 13, lineHeight: 19, textAlign: 'center', marginBottom: 18 }}>
                                    PDF preview currently uses your device share sheet so you can open it in your preferred PDF app.
                                </Text>
                                <TouchableOpacity
                                    onPress={shareRequirementPreviewPdf}
                                    style={{ backgroundColor: '#305797', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 }}
                                >
                                    <Text style={{ color: '#fff', fontFamily: 'Montserrat_600SemiBold', fontSize: 13 }}>Share PDF</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

        </View>
    );
}