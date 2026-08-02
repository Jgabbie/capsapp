import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Linking, Modal, Platform, TouchableWithoutFeedback, Image, ToastAndroid, Pressable, BackHandler } from "react-native";
import * as ExpoLinking from 'expo-linking';
import Pdf from "react-native-pdf";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import dayjs from "dayjs";
import { Calendar } from 'react-native-calendars';

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import VisaProgressStyle from "../../styles/clientstyles/VisaProgressStyle";
import PaymentStyle from '../../styles/clientstyles/PaymentStyle';
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";

import {
    useFonts,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";


const timeSlots = [
    "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
];


//get file extension from uri or filename, ignoring query params
const getFileExtension = (value = '') => {
    const cleanValue = String(value).split('?')[0];
    const match = /\.([a-zA-Z0-9]+)$/.exec(cleanValue);
    return match ? match[1].toLowerCase() : '';
};


//get image mime type from asset object, with fallbacks for common image extensions
const getImageMimeType = (asset = {}) => {
    if (asset.mimeType && String(asset.mimeType).includes('/')) {
        return asset.mimeType;
    }

    const extension = getFileExtension(asset.fileName || asset.uri);
    if (extension === 'png') return 'image/png';
    if (extension === 'webp') return 'image/webp';
    if (extension === 'heic') return 'image/heic';
    if (extension === 'heif') return 'image/heif';
    return 'image/jpeg';
};


//get image file name from asset object, with fallbacks for uri and default name
const getImageFileName = (asset = {}) => {
    if (asset.fileName) return asset.fileName;

    const uriName = String(asset.uri || '').split('/').pop();
    if (uriName && getFileExtension(uriName)) return uriName;

    const extension = getImageMimeType(asset).split('/')[1] || 'jpg';
    return `proof_image.${extension === 'jpeg' ? 'jpg' : extension}`;
};

const MAX_REQUIREMENT_FILE_SIZE = 3 * 1024 * 1024;


//sanitize file name to remove invalid characters and replace spaces with underscores
const sanitizeFileName = (value = 'document.pdf') => (
    String(value || 'document.pdf')
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
        .replace(/\s+/g, '_')
);


//get safe base name for pdf file, removing .pdf extension and sanitizing
const getSafePdfBaseName = (value = 'document') => {
    const sanitized = sanitizeFileName(value);
    return sanitized.replace(/\.pdf$/i, '') || 'document';
};


//get status Colors
const getStatusColors = (status) => {
    switch (String(status || '').trim().toLowerCase()) {
        // Yellow
        case 'application submitted':
        case 'documents submitted':
            return {
                backgroundColor: '#FEF3C7',
                textColor: '#92400E',
                borderColor: '#F59E0B',
            };

        // Green
        case 'application approved':
        case 'payment completed':
        case 'documents approved':
        case 'dfa approved':
        case 'embassy approved':
        case 'passport released':
            return {
                backgroundColor: '#DCFCE7',
                textColor: '#166534',
                borderColor: '#22C55E',
            };

        // Blue
        case 'documents uploaded':
        case 'documents received':
        case 'processing by dfa':
        case 'processing by embassy':
            return {
                backgroundColor: '#DBEAFE',
                textColor: '#1D4ED8',
                borderColor: '#3B82F6',
            };

        // Red for rejected status
        case 'rejected':
            return {
                backgroundColor: '#FEE2E2',
                textColor: '#B91C1C',
                borderColor: '#EF4444',
            };

        default:
            return {
                backgroundColor: '#F3F4F6',
                textColor: '#4B5563',
                borderColor: '#D1D5DB',
            };
    }
};


export default function VisaProgress() {
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_600SemiBold,
        Montserrat_700Bold,
    });

    const cs = useNavigation()
    const route = useRoute()
    const { user } = useUser()
    const [isSidebarVisible, setSidebarVisible] = useState(false)

    const applicationId = route.params?.applicationId;

    const [application, setApplication] = useState(null)
    const [servicePrice, setServicePrice] = useState(0)
    const [serviceRequirements, setServiceRequirements] = useState([])
    const [serviceAdditionalRequirements, setServiceAdditionalRequirements] = useState([])
    const [dynamicSteps, setDynamicSteps] = useState([])
    const [loading, setLoading] = useState(true)

    const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(null);
    const [customPreferredDate, setCustomPreferredDate] = useState(null);
    const [pendingCustomPreferredDate, setPendingCustomPreferredDate] = useState(null);
    const [customPreferredTime, setCustomPreferredTime] = useState(null);
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('paymongo');
    const [paymentMethods, setPaymentMethods] = useState([]);

    const [creatingPayment, setCreatingPayment] = useState(false);
    const [proofImage, setProofImage] = useState(null);
    const [uploadedRequirements, setUploadedRequirements] = useState({});
    const [selectedFiles, setSelectedFiles] = useState({});
    const [uploadingAll, setUploadingAll] = useState(false);
    const [showDocumentsSuccessModal, setShowDocumentsSuccessModal] = useState(false);
    const [showClaimPreferenceSuccessModal, setShowClaimPreferenceSuccessModal] = useState(false);
    const [passportReleaseOption, setPassportReleaseOption] = useState('pickup');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [savingReleaseOption, setSavingReleaseOption] = useState(false);
    const [enlargedQR, setEnlargedQR] = useState(null);
    const [requirementPreview, setRequirementPreview] = useState(null);

    //additional local state used by helper functions
    //alias for api used across file
    const apiFetch = api;
    //id alias
    const id = applicationId;

    const [process, setProcess] = useState([]);
    const [requirements, setRequirements] = useState([]);
    const [steps, setSteps] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [requirementFiles, setRequirementFiles] = useState({});
    const [uploading, setUploading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const [deliveryFeePendingManualPayment, setDeliveryFeePendingManualPayment] = useState(false);
    const [deliveryFeePaid, setDeliveryFeePaid] = useState(false);
    const [pendingManualPayment, setPendingManualPayment] = useState(false);
    const [servicePendingManualPayment, setServicePendingManualPayment] = useState(false);

    //modal / UI flags used by functions
    const [isConfirmDocumentsOpen, setIsConfirmDocumentsOpen] = useState(false);
    const [isDocumentsUploadedModalOpen, setIsDocumentsUploadedModalOpen] = useState(false);
    const [isDateSelectedModalOpen, setIsDateSelectedModalOpen] = useState(false);
    const [isPassportReleaseOptionSelectedModalOpen, setIsPassportReleaseOptionSelectedModalOpen] = useState(false);

    const [releaseErrors, setReleaseErrors] = useState({
        deliveryAddress: '',
    });


    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        try {
            const res = await api.get("/payment-methods/get-methods");
            setPaymentMethods(res.data);
        } catch (err) {
            console.log(err);
        }
    };


    const methodsWithImage = paymentMethods.filter(method => method.image);
    const methodsWithoutImage = paymentMethods.filter(method => !method.image);



    //disable back button
    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                () => true
            );

            return () => backHandler.remove();
        }, [])
    );


    //navigation alias used in some functions
    const navigate = (path) => {
        try {
            const routeName = typeof path === 'string' ? path.replace(/^\//, '') : path;
            cs.navigate(routeName);
        } catch (e) {
            cs.goBack && cs.goBack();
        }
    };


    //simple notification shim using Alert
    const notification = {
        error: ({ message }) => Alert.alert('Error', String(message || '')),
        warning: ({ message }) => Alert.alert('Warning', String(message || '')),
        success: ({ message }) => Alert.alert('Success', String(message || '')),
    };


    //show toast message for Android or notification for iOS
    const showToast = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(String(message || ''), ToastAndroid.SHORT);
            return;
        }

        notification.success({ message });
    };


    // keep compatibility with some code that uses `method` and `setMethod`
    const method = paymentMethod;
    const setMethod = setPaymentMethod;


    //appointment selection state (some parts of the file use a different name)
    const [selectedSuggestedIndex, setSelectedSuggestedIndex] = useState(null);
    useEffect(() => {
        // keep both schedule selection states in sync
        if (selectedScheduleIndex !== null) setSelectedSuggestedIndex(selectedScheduleIndex);
    }, [selectedScheduleIndex]);


    //derive status text used in several helpers (handle array or string)
    const statusText = Array.isArray(application?.status) && application.status.length > 0
        ? application.status[application.status.length - 1]
        : (application?.status || application?.statusText || '');
    const appStatus = statusText || '';
    const currentStatusColors = getStatusColors(appStatus);
    const normalizedAppStatus = String(appStatus || '').toLowerCase();
    const hasChosenSuggestedSchedule = Boolean(
        String(application?.suggestedAppointmentScheduleChosen?.date || '').trim() ||
        String(application?.suggestedAppointmentScheduleChosen?.time || '').trim()
    );


    //keep steps derived from process to support legacy variable `steps`
    useEffect(() => {
        setSteps(Array.isArray(process) ? process : []);
    }, [process]);

    const isOthersSelected = selectedSuggestedIndex === 'others';
    const canConfirmSchedule = selectedSuggestedIndex !== null && (selectedSuggestedIndex !== 'others' || (customPreferredDate && customPreferredTime));

    const [confirmingSuggested, setConfirmingSuggested] = useState(false);

    //selected appointment values
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);


    //handle custom date and time pickers
    const rawMinimumCustomDate = dayjs()
        .add(14, 'day')
        .startOf('day');


    const getNextAvailableWeekday = (date) => {
        let nextDate = dayjs(date);

        while (nextDate.day() === 0 || nextDate.day() === 6) {
            nextDate = nextDate.add(1, 'day');
        }

        return nextDate.format('YYYY-MM-DD');
    };


    const minimumCustomDate =
        rawMinimumCustomDate.format('YYYY-MM-DD');


    const earliestAvailableCustomDate =
        getNextAvailableWeekday(rawMinimumCustomDate);


    const openCustomDatePicker = () => {
        setPendingCustomPreferredDate(
            customPreferredDate
                ? dayjs(customPreferredDate).format('YYYY-MM-DD')
                : earliestAvailableCustomDate
        );

        setShowCustomDatePicker(true);
    };


    const closeCustomDatePicker = () => {
        setPendingCustomPreferredDate(
            customPreferredDate
                ? dayjs(customPreferredDate).format('YYYY-MM-DD')
                : null
        );

        setShowCustomDatePicker(false);
    };


    const selectCustomPreferredDate = (dateString) => {
        const selectedDate = dayjs(dateString);

        if (selectedDate.day() === 0 || selectedDate.day() === 6) {
            Alert.alert(
                'Invalid Date',
                'Appointments are only available from Monday to Friday.'
            );
            return;
        }

        setPendingCustomPreferredDate(dateString);
    };


    const applyCustomPreferredDate = () => {
        if (!pendingCustomPreferredDate) return;

        const selectedDate = dayjs(pendingCustomPreferredDate);

        if (selectedDate.isBefore(rawMinimumCustomDate, 'day')) {
            Alert.alert(
                'Invalid Date',
                'The appointment must be scheduled at least 14 days from today.'
            );
            return;
        }

        if (selectedDate.day() === 0 || selectedDate.day() === 6) {
            Alert.alert(
                'Invalid Date',
                'Appointments are only available from Monday to Friday.'
            );
            return;
        }

        setCustomPreferredDate(pendingCustomPreferredDate);
        setShowCustomDatePicker(false);
    };

    const handleCustomTimeChange = (event, time) => {
        setShowCustomTimePicker(false);
        if (time) setCustomPreferredTime(time);
    };


    //pick proof image from gallery
    const pickProofImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setProofImage({
                    uri: asset.uri,
                    fileName: getImageFileName(asset),
                    mimeType: getImageMimeType(asset),
                    size: asset.fileSize
                });
            }
        } catch (e) {
            console.error(e);
            notification.error({ message: 'Could not pick image' });
        }
    };


    //handle start payment, delegating to existing payment handler
    const handleStartPayment = async (paymentPurpose = 'visa') => {
        // Delegate to existing payment handler
        await handleSubmitPayment(paymentPurpose);
    };


    //normalize picked document to ensure it has uri, name, type, and size
    const normalizePickedDocument = (asset = {}) => {
        const name = asset.name || asset.fileName || String(asset.uri || '').split('/').pop() || `document-${Date.now()}`;
        return {
            uri: asset.uri,
            name,
            type: asset.mimeType || asset.type || 'application/octet-stream',
            size: asset.size,
        };
    };


    //prepare local PDF for sharing, downloading if necessary, and returning a local URI
    const prepareLocalPdfForShare = async (file = {}) => {
        const sourceUri = file.uri || file.url;
        if (!sourceUri) return null;

        const baseName = getSafePdfBaseName(file.name || 'preview');
        const pdfName = `${baseName}-${Date.now()}.pdf`;
        const targetUri = `${FileSystem.cacheDirectory}${pdfName}`;

        try {
            if (/^https?:\/\//i.test(sourceUri)) {
                const downloaded = await FileSystem.downloadAsync(sourceUri, targetUri);
                return downloaded?.uri || null;
            }

            if (sourceUri.startsWith('content://')) {
                await FileSystem.copyAsync({ from: sourceUri, to: targetUri });
                return targetUri;
            }

            return sourceUri;
        } catch (error) {
            console.error('Could not prepare PDF share file:', error);
            return sourceUri.startsWith('file://') ? sourceUri : null;
        }
    };


    //pick requirement file (PDF or image) and store it in state, validating size
    const pickRequirementFile = async (key) => {
        try {
            const res = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
                multiple: false,
            });

            if (res.canceled || res.type === 'cancel') {
                return;
            }

            const asset = res.assets?.[0] || res;
            if (!asset?.uri) {
                notification.error({ message: 'Could not read selected file. Please try again.' });
                return;
            }

            const pickedFile = normalizePickedDocument(asset);
            if (pickedFile.size && pickedFile.size > MAX_REQUIREMENT_FILE_SIZE) {
                notification.warning({ message: 'File must be 3 MB or smaller.' });
                return;
            }

            const fileObj = {
                uid: String(Date.now()),
                name: pickedFile.name,
                url: pickedFile.uri,
                originFileObj: pickedFile,
            };

            setRequirementFiles(prev => ({ ...prev, [key]: [fileObj] }));
            setSelectedFiles(prev => ({ ...prev, [key]: pickedFile }));
            showToast('File selected');
        } catch (e) {
            console.error(e);
            notification.error({ message: 'Failed to pick file' });
        }
    };


    //render requirement item with label, file selection, and preview button
    const renderRequirementItem = (req, idx) => {
        const key = req.key || req.req || req.label || `requirement-${idx}`;
        const label = getRequirementLabel(key, idx);
        const selectedFile = selectedFiles[key];
        const existingUploadedUrl = application?.submittedDocuments?.[key] || null;
        const hasFile = Boolean(requirementFiles[key]?.length || selectedFile || existingUploadedUrl);
        const isRequestedRequirement = isRequirementVisibleForResubmission(req, idx);
        const isValidRequirement = resubmissionRequested && !isRequestedRequirement;

        return (
            <View key={key} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eef2f7' }}>
                <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#1f2937', fontSize: 14 }}>{label}</Text>
                {isValidRequirement && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: 6, backgroundColor: '#ecfdf3', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
                        <Ionicons name="checkmark-circle" size={14} color="#059669" />
                        <Text style={{ color: '#059669', fontSize: 11, fontFamily: 'Montserrat_600SemiBold' }}>Valid Requirement</Text>
                    </View>
                )}
                <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>PDF, JPG, or PNG. Max 3 MB.</Text>
                {!isValidRequirement && (
                    <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <TouchableOpacity onPress={() => pickRequirementFile(key)} style={{ padding: 8, backgroundColor: '#eef2ff', borderRadius: 8 }}>
                            <Text style={{ color: '#305797' }}>{hasFile ? 'Change File' : 'Select File'}</Text>
                        </TouchableOpacity>
                        {hasFile && (
                            <TouchableOpacity
                                onPress={() => previewSelectedRequirementFile(selectedFile || requirementFiles[key]?.[0] || existingUploadedUrl)}
                                style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: '#dbe4f0' }}
                            >
                                <Text style={{ color: '#305797', fontSize: 12 }}>Preview</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                {hasFile && (
                    <Text numberOfLines={1} style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
                        {selectedFile?.name || requirementFiles[key]?.[0]?.name || String(existingUploadedUrl || '').split('/').pop() || 'Ready to submit'}
                    </Text>
                )}
            </View>
        );
    };


    //submit all selected files, validating required documents and file sizes, then upload to backend
    const submitAllSelectedFiles = async () => {
        if (!selectedFiles || Object.keys(selectedFiles).length === 0) {
            notification.warning({ message: 'No files selected' });
            return;
        }

        const orderedRequirements = visibleRequirements.map((req, idx) => ({
            key: req.key || req.req || req.label || `requirement-${idx}`,
            label: req.req || req.label || `Requirement ${idx + 1}`,
        }));

        const requiredRequirements = resubmissionRequested
            ? orderedRequirements.filter((req, idx) => isRequirementVisibleForResubmission(visibleRequirements[idx], idx))
            : orderedRequirements;

        if (resubmissionRequested && requiredRequirements.length === 0) {
            notification.warning({ message: 'No document is currently marked for resubmission.' });
            return;
        }

        const missingRequirements = requiredRequirements.filter(req => !selectedFiles[req.key]);
        if (missingRequirements.length > 0) {
            notification.warning({ message: 'Please upload all required documents before submitting.' });
            return;
        }

        const oversizedFile = requiredRequirements
            .map(req => selectedFiles[req.key])
            .find(file => file?.size && file.size > MAX_REQUIREMENT_FILE_SIZE);

        if (oversizedFile) {
            notification.warning({ message: `${oversizedFile.name || 'Selected file'} must be 3 MB or smaller.` });
            return;
        }

        try {
            setUploadingAll(true);
            const formData = new FormData();
            const appendedOrder = [];
            requiredRequirements.forEach(req => {
                const file = selectedFiles[req.key];
                if (file?.uri) {
                    formData.append('files', file);
                    appendedOrder.push(req.key);
                }
            });

            const uploadRes = await apiFetch.post('/upload/upload-booking-documents', formData, {
                headers: {
                    ...withUserHeader(user._id).headers,
                    'Content-Type': 'multipart/form-data',
                },
            });
            const uploadedUrls = Array.isArray(uploadRes?.data?.urls) ? uploadRes.data.urls : [];

            if (uploadedUrls.length !== appendedOrder.length) {
                throw new Error('Failed to upload all selected files.');
            }

            const submittedDocuments = {};
            appendedOrder.forEach((key, index) => {
                submittedDocuments[key] = uploadedUrls[index];
            });

            await apiFetch.put(`/visa/applications/${id}/documents`, { submittedDocuments }, withUserHeader(user._id));
            const refreshed = await apiFetch.get(`/visa/applications/${id}`, withUserHeader(user._id));
            setApplication(refreshed?.data || refreshed);
            setRequirementFiles({});
            setSelectedFiles({});
            setShowDocumentsSuccessModal(true);
        } catch (e) {
            console.error(e);
            notification.error({ message: 'Failed to submit files' });
        } finally {
            setUploadingAll(false);
        }
    };


    //format appointment time into 12-hour format with AM/PM, handling various input formats
    const formatAppointmentTime = (value) => {
        if (!value) return '';

        // Handles Date objects
        if (value instanceof Date) {
            return dayjs(value).format('hh:mm A');
        }

        const rawValue = String(value).trim().toUpperCase();

        // Already uses 12-hour format, such as 8:30 AM
        const twelveHourMatch = rawValue.match(
            /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i
        );

        if (twelveHourMatch) {
            const hour = Number(twelveHourMatch[1]);
            const minute = Number(twelveHourMatch[2]);
            const period = twelveHourMatch[3].toUpperCase();

            if (
                hour >= 1 &&
                hour <= 12 &&
                minute >= 0 &&
                minute <= 59
            ) {
                return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
            }
        }

        // Converts 24-hour values, such as 13:30, into 01:30 PM
        const twentyFourHourMatch = rawValue.match(
            /^(\d{1,2}):(\d{2})(?::\d{2})?$/
        );

        if (twentyFourHourMatch) {
            const hour = Number(twentyFourHourMatch[1]);
            const minute = Number(twentyFourHourMatch[2]);

            if (
                hour >= 0 &&
                hour <= 23 &&
                minute >= 0 &&
                minute <= 59
            ) {
                const period = hour >= 12 ? 'PM' : 'AM';
                const twelveHour = hour % 12 || 12;

                return `${String(twelveHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
            }
        }

        const parsedTime = dayjs(value);

        return parsedTime.isValid()
            ? parsedTime.format('hh:mm A')
            : rawValue;
    };


    // Normalize schedule slot data into a consistent format
    const normalizeScheduleSlot = (slot) => {
        if (!slot || typeof slot !== 'object') {
            return { date: '', time: '' };
        }

        const rawDate =
            slot.date ||
            slot.preferredDate ||
            slot.appointmentDate ||
            slot.scheduleDate ||
            '';

        const rawTime =
            slot.time ||
            slot.preferredTime ||
            slot.appointmentTime ||
            slot.scheduleTime ||
            '';

        const parsedDate = rawDate ? dayjs(rawDate) : null;

        const date = parsedDate?.isValid()
            ? parsedDate.format('YYYY-MM-DD')
            : String(rawDate || '');

        let time = '';

        if (rawTime) {
            time = formatAppointmentTime(rawTime);
        } else if (parsedDate?.isValid()) {
            time = parsedDate.format('hh:mm A');
        }

        return { date, time };
    };


    //normalize legacy process steps into an array for UI mapping
    const normalizeVisaProcessSteps = (raw) => {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        try {
            return Object.keys(raw).map(k => ({
                title: k,
                ...raw[k]
            }));
        } catch (e) {
            return [];
        }
    };


    //normalize legacy requirements into an array for UI mapping
    const normalizeResubmissionTarget = (target) => {
        if (!target) return null;
        return String(target).trim().toLowerCase();
    };


    //check if a value is an image source (URL or data URI)
    const isImageSource = (val) => {
        if (!val) return false;
        return String(val).match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) !== null || String(val).startsWith('data:image');
    };


    //check if a file object is an image based on its type or URI
    const isImageFile = (file = {}) => {
        const type = String(file.type || file.mimeType || '').toLowerCase();
        return type.startsWith('image/') || isImageSource(file.uri || file.url || file.name);
    };


    //get uploaded document entries from application, handling legacy keys
    const getUploadedDocumentEntries = () => {
        const docs = application?.submittedDocuments || application?.submitted_documents || {};
        return Object.entries(docs || {});
    };


    //open a document URL using Linking, with error handling
    const openDocument = async (url) => {
        if (!url) return;
        try {
            await Linking.openURL(url);
        } catch (e) {
            notification.error({ message: 'Unable to open document' });
        }
    };


    //preview a selected requirement file (image or PDF) in a modal, setting state for the preview
    const previewSelectedRequirementFile = async (fileOrUrl) => {
        const file = typeof fileOrUrl === 'string' ? { uri: fileOrUrl, name: 'Document' } : fileOrUrl;
        const uri = file?.uri || file?.url;
        if (!uri) {
            notification.error({ message: 'Preview unavailable' });
            return;
        }

        if (isImageFile(file)) {
            setRequirementPreview({
                uri,
                name: file.name || 'Image preview',
                type: file.type || 'image',
                kind: 'image',
            });
            return;
        }

        setRequirementPreview({
            uri,
            name: file.name || 'PDF document',
            type: file.type || 'application/pdf',
            kind: 'document',
        });
    };


    //share requirement preview PDF using Sharing API or fallback to opening in browser
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

            const uri = await prepareLocalPdfForShare(requirementPreview);
            if (!uri) throw new Error('PDF URI unavailable');

            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Share PDF document',
                UTI: 'com.adobe.pdf',
            });
        } catch (e) {
            console.error('Unable to share PDF:', e);
            notification.error({ message: 'Unable to share PDF' });
        }
    };


    //retrieve resubmission targets from application, normalizing and deduplicating them
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

    const resubmissionRequested = requestedResubmissionTargets.length > 0;

    const terminalStatuses = new Set(['processing by embassy', 'embassy approved', 'passport released']);

    const appointmentDate = application?.preferredDate
        ? dayjs(application.preferredDate)
        : application?.suggestedAppointmentScheduleChosen && application.suggestedAppointmentScheduleChosen.date
            ? dayjs(application.suggestedAppointmentScheduleChosen.date)
            : null;


    //get the date when the current status was set, checking status history and fallback to updatedAt or createdAt
    const getStatusSetDate = (app) => {
        if (!app) return null;
        const history = app.statusHistory;
        if (Array.isArray(history) && history.length > 0) {
            for (let i = history.length - 1; i >= 0; i--) {
                const h = history[i];
                if (String(h.status).toLowerCase() === String(statusText || '').toLowerCase()) {
                    return dayjs(h.changedAt);
                }
            }
        }
        if (app.statusUpdatedAt) return dayjs(app.statusUpdatedAt);
        if (app.updatedAt) return dayjs(app.updatedAt);
        if (app.createdAt) return dayjs(app.createdAt);
        return null;
    };


    //get step set date for a specific title from process steps or status history
    const getStepSetDateForTitle = (app, title) => {
        if (!app || !title) return null;

        const stepFromProcess = app?.processSteps?.[title];
        if (stepFromProcess?.setDate) {
            const parsed = dayjs(stepFromProcess.setDate);
            if (parsed.isValid()) return parsed;
        }

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


    //get the most recent staff/admin who changed the status (if available)
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

    const statusSetDate = getStatusSetDate(application);
    const managerName = getManagerName(application);
    const deadlineDays = application?.statusDeadlineDays ?? null;
    const createdAt = application?.createdAt
        ? dayjs(application.createdAt).startOf('day')
        : null;
    let statusDeadlineDate = !terminalStatuses.has(String(statusText || '').toLowerCase())
        ? (application?.statusDeadlineDate
            ? dayjs(application.statusDeadlineDate)
            : statusSetDate && Number.isFinite(deadlineDays)
                ? statusSetDate.add(deadlineDays, 'day').startOf('day')
                : appointmentDate && Number.isFinite(deadlineDays)
                    ? appointmentDate.add(deadlineDays, 'day').startOf('day')
                    : null)
        : null;

    if (String(statusText || '').toLowerCase() === 'payment completed' && application?.secondChance && application?.secondDeadline) {
        statusDeadlineDate = dayjs(application.secondDeadline);
    }
    const penaltyStateLabel = application?.reachedSecondDeadline
        ? 'Penalty Expired'
        : application?.secondChance
            ? 'Penalty Paid'
            : application?.onPenalty
                ? 'On Penalty'
                : null;


    //format remaining time until deadline, returning a string like "2 days left" or "Deadline overdue"
    const formatRemainingTime = (deadlineDate) => {
        if (!deadlineDate) return null;
        const daysLeft = deadlineDate.diff(dayjs(), 'day');
        const hoursLeft = deadlineDate.diff(dayjs(), 'hour');

        if (daysLeft < 0) {
            return 'Deadline overdue';
        } else if (daysLeft === 0) {
            return `${hoursLeft} hour${hoursLeft === 1 ? '' : 's'} left`;
        } else {
            return `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
        }
    };


    //check pending manual payments for penalty, regular payment, and delivery fee, updating state accordingly
    const checkPendingManualPayment = async () => {
        try {
            if (!user || !user._id) return;
            const transactionsRes = await apiFetch.get(`/transaction/application/${id}`, withUserHeader(user._id));
            const transactions = Array.isArray(transactionsRes?.data) ? transactionsRes.data : (transactionsRes?.data?.transactions || []);
            const hasPendingPenalty = transactions.some(
                (tx) => tx.status === 'Pending' &&
                    tx.method === 'Manual' &&
                    (tx.applicationType === 'Visa Penalty Fee')
            );

            const hasPendingRegularPayment = transactions.some(
                (tx) => tx.status === 'Pending' &&
                    tx.method === 'Manual' &&
                    (tx.applicationType === 'Visa Application')
            );

            const hasPendingDeliveryFeePayment = transactions.some(
                (tx) => tx.status === 'Pending' &&
                    tx.method === 'Manual' &&
                    (tx.applicationType === 'Delivery Fee')
            );

            const hasSuccessfulDeliveryFeePayment = transactions.some(
                (tx) => tx.status === 'Successful' &&
                    (tx.applicationType === 'Delivery Fee')
            );

            setDeliveryFeePendingManualPayment(hasPendingDeliveryFeePayment);
            setDeliveryFeePaid(hasSuccessfulDeliveryFeePayment);
            setPendingManualPayment(hasPendingPenalty);
            setServicePendingManualPayment(hasPendingRegularPayment);
        } catch (err) {
            console.error('Could not fetch transactions:', err);
        }
    };


    //fetch application details and service requirements
    useEffect(() => {
        if (!id || !user || !user._id) {
            return;
        }

        const fetchApplication = async () => {
            setLoading(true);
            try {
                const res = await apiFetch.get(`/visa/applications/${id}`, withUserHeader(user._id));
                const data = res?.data || res;
                setApplication(data);
                setProcess(normalizeVisaProcessSteps(data?.processSteps || {}));
                // If the application has a serviceId, fetch the service for requirements and price
                if (data && data.serviceId) {
                    try {
                        const serviceId = data.serviceId._id || data.serviceId;
                        const serviceResEndpoint = `/visa-services/get-service/${serviceId}`;
                        const serviceRes = await apiFetch.get(serviceResEndpoint, withUserHeader(user._id));
                        const serviceData = serviceRes?.data || serviceRes;
                        const visaRequirements = serviceData.visaRequirements || [];
                        const additionalRequirements = serviceData.visaAdditionalRequirements || serviceData.additionalRequirements || [];
                        setRequirements(visaRequirements);
                        setServiceRequirements(visaRequirements);
                        setServiceAdditionalRequirements(additionalRequirements);
                        const price = Number(serviceData.visaPrice) || 0;
                        setServicePrice(price);
                    } catch (err) {
                        console.error('Failed to fetch service:', err);
                        setRequirements([]);
                        setServiceRequirements([]);
                        setServiceAdditionalRequirements([]);
                    }
                } else {
                    setRequirements([]);
                    setServiceRequirements([]);
                    setServiceAdditionalRequirements([]);
                }
            } catch (err) {
                console.error('Failed to fetch application:', err);
                notification.error({ message: 'Failed to load visa application details' });
            } finally {
                setLoading(false);
            }
        };
        fetchApplication();
        checkPendingManualPayment();
    }, [id, user]);


    const statusValue = statusText;

    const currentStep = statusValue
        ? Math.max(
            0,
            process.findIndex(
                s => String(s.title || '').toLowerCase() === String(statusValue || '').toLowerCase()
            )
        )
        : 0;

    const currentStepIndex = currentStep;

    const isDeliveryFeeStage =
        String(statusValue || '').toLowerCase() === 'passport released' &&
        String(application?.passportReleaseOption || '').toLowerCase() === 'delivery';

    const isDeliveryFeeFullyPaidStatus = String(statusValue || '').toLowerCase() === 'delivery fee fully paid';
    const isDeliveryFeePaid = isDeliveryFeeFullyPaidStatus || deliveryFeePaid;

    const deliveryFeeAmount = Number(application?.deliveryFee || 0);
    const hasDeliveryDate = Boolean(String(application?.deliveryDate || '').trim()) && String(application?.deliveryDate || '').toLowerCase() !== 'to be announced';
    const isDeliveryFeeUnavailable = deliveryFeeAmount <= 0 && !hasDeliveryDate;
    const isApplicationPaymentDisabled = servicePendingManualPayment;
    const isDeliveryPaymentDisabled = deliveryFeePendingManualPayment;
    const isPenaltyPaymentDisabled = pendingManualPayment;


    useEffect(() => {
        if (isDeliveryFeeStage && isDeliveryFeeUnavailable && method === 'manual') {
            setMethod('paymongo');
        }
    }, [isDeliveryFeeStage, isDeliveryFeeUnavailable, method]);


    //validate file size before upload, showing notification if too large
    const beforeUpload = (file) => {
        const isLt3M = file.size / 1024 / 1024 < 3;
        if (!isLt3M) {
            notification.error({ message: 'Image/PDF must be smaller than 3MB!', placement: 'topRight' });
        }
        return isLt3M || Upload.LIST_IGNORE;
    };


    //submit documents
    const handleSubmitDocuments = async () => {
        if (uploading) {
            notification.warning({ message: "Please wait until uploads finish", placement: 'topRight' });
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();
            const orderedRequirements = visibleRequirements.map((req, idx) => ({
                key: req.key || req.req || `${req.label}-${idx}`,
                label: req.req || req.label || `Requirement ${idx + 1}`
            }));

            const missingRequirements = [];
            orderedRequirements.forEach((req) => {
                const fileItem = requirementFiles[req.key]?.[0];
                if (fileItem?.originFileObj) {
                    formData.append("files", fileItem.originFileObj);
                } else {
                    missingRequirements.push(req.label);
                }
            });

            if (missingRequirements.length > 0) {
                notification.warning({ message: "Please upload all required documents before submitting.", placement: 'topRight' });
                return;
            }

            if (resubmissionRequested && orderedRequirements.length === 0) {
                notification.warning({ message: "The requested document is not available for upload.", placement: 'topRight' });
                return;
            }

            const uploadRes = await apiFetch.post(
                '/upload/upload-visa-requirements',
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            const uploaded = uploadRes.urls || [];
            const submittedDocuments = {};
            let uploadIndex = 0;

            orderedRequirements.forEach((req) => {
                if (requirementFiles[req.key]?.length) {
                    submittedDocuments[req.key] = uploaded[uploadIndex] || null;
                    uploadIndex += 1;
                } else {
                    submittedDocuments[req.key] = null;
                }
            });

            await apiFetch.put(`/visa/applications/${id}/documents`, {
                submittedDocuments
            });

            const documentsStatus = process.find(
                step => String(step.title || '').toLowerCase() === 'documents uploaded'
            )?.title || 'Documents uploaded';

            await apiFetch.put(`/visa/applications/${id}/status`, {
                status: documentsStatus
            });

            const refreshed = await apiFetch.get(`/visa/applications/${id}`);
            setApplication(refreshed);
            setIsDocumentsUploadedModalOpen(true);
        } catch (err) {
            console.error(err);
            notification.error({ message: "Failed to submit documents", placement: 'topRight' });
        } finally {
            setUploading(false);
        }
    };


    // dynamically handle file list changes, ensuring only one file is kept and generating a preview URL if needed
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


    //handle payment submission
    const handleSubmitPayment = async (paymentPurpose = 'visa') => {
        const isDeliveryPayment = paymentPurpose === 'delivery';
        const isPenaltyPayment = paymentPurpose === 'penalty';
        const hasPendingPayment = isDeliveryPayment
            ? deliveryFeePendingManualPayment
            : isPenaltyPayment
                ? pendingManualPayment
                : servicePendingManualPayment;

        if (hasPendingPayment) {
            notification.warning({ message: 'You already have a pending manual payment for this application. Please wait for verification.' });
            return;
        }

        if (isDeliveryPayment && deliveryFeeAmount <= 0) {
            notification.warning({ message: 'Delivery fee is not available yet. Please wait for admin to send it.' });
            return;
        }

        if (method === 'manual' && !proofImage) {
            notification.warning({ message: 'Please upload a receipt first.' });
            return;
        }

        try {
            setPaymentLoading(true);
            setCreatingPayment(true);

            if (method === 'manual') {
                const amountToPay = isPenaltyPayment ? 1500 : (isDeliveryPayment ? deliveryFeeAmount : servicePrice);

                if (!proofImage?.uri) {
                    console.error('Invalid proof image structure:', proofImage);
                    notification.error({ message: 'Invalid proof image. Please try again.' });
                    setPaymentLoading(false);
                    setCreatingPayment(false);
                    return;
                }

                const formData = new FormData();

                const receiptFile = {
                    uri: proofImage.uri,
                    name: proofImage.fileName || getImageFileName(proofImage),
                    type: getImageMimeType(proofImage),
                };

                formData.append('file', receiptFile);

                const uploadRes = await apiFetch.post(
                    '/upload/upload-receipt',
                    formData,
                    {
                        headers: {
                            ...withUserHeader(user._id).headers,
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                const imageUrl = uploadRes?.data?.url || uploadRes?.data?.data?.url;

                if (!imageUrl) {
                    throw new Error('No uploaded image URL returned');
                }

                const manualPaymentEndpoint = isDeliveryPayment
                    ? '/payment/manual-delivery-fee'
                    : isPenaltyPayment
                        ? '/payment/manual-visa-penalty'
                        : '/payment/manual-visa';

                const paymentRes = await apiFetch.post(
                    manualPaymentEndpoint,
                    {
                        applicationId: application._id,
                        applicationNumber: application.applicationNumber,
                        amount: amountToPay,
                        proofImage: imageUrl,
                    },
                    withUserHeader(user._id)
                );

                const redirectUrl = paymentRes?.data?.redirectUrl;
                if (redirectUrl && /^https?:\/\//i.test(redirectUrl)) {
                    await Linking.openURL(redirectUrl);
                } else {
                    cs.navigate('successfulmanualpaymentvisa');
                }
                if (isDeliveryPayment) {
                    setDeliveryFeePendingManualPayment(true);
                } else if (isPenaltyPayment) {
                    setPendingManualPayment(true);
                } else {
                    setServicePendingManualPayment(true);
                }
                setPaymentCompleted(true);
                setProofImage(null);

            } else if (method === 'paymongo') {
                if (!application) {
                    notification.error({ message: 'Application not found.' });
                    return;
                }

                const successDeepLink = ExpoLinking.createURL('successfulpaymentvisa', {
                    queryParams: {
                        applicationId: application._id,
                        payment: 'success',
                        type: isDeliveryPayment
                            ? 'delivery'
                            : isPenaltyPayment
                                ? 'penalty'
                                : 'service',
                    },
                });

                const cancelDeepLink = ExpoLinking.createURL('visaprogress', {
                    queryParams: {
                        applicationId: application._id,
                        payment: 'cancel',
                        type: isDeliveryPayment
                            ? 'delivery'
                            : isPenaltyPayment
                                ? 'penalty'
                                : 'service',
                    },
                });

                const payload = {
                    applicationId: application._id,
                    applicationNumber: application.applicationNumber,
                    totalPrice: isDeliveryPayment
                        ? deliveryFeeAmount
                        : isPenaltyPayment
                            ? 1500
                            : servicePrice,
                    successUrl: successDeepLink,
                    cancelUrl: cancelDeepLink
                };

                const endpoint = isDeliveryPayment
                    ? '/payment/create-checkout-session-delivery-fee'
                    : isPenaltyPayment
                        ? '/payment/create-checkout-session-visa-penalty'
                        : '/payment/create-checkout-session-visa';
                const paymongoResponse = await apiFetch.post(endpoint, payload, withUserHeader(user._id));
                const checkoutUrl = paymongoResponse?.data?.data?.attributes?.checkout_url;

                if (checkoutUrl) {
                    try {
                        await Linking.openURL(checkoutUrl);
                    } catch (e) {
                        console.error('Failed to open PayMongo URL:', e);
                    }
                } else {
                    console.error('PayMongo Response Structure:', paymongoResponse);
                    throw new Error('Failed to create PayMongo checkout session - URL missing');
                }
            }

        } catch (err) {
            console.error('Payment error:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
            });
            notification.error({ message: err.response?.data?.message || err.response?.data?.error || err.message || 'Payment failed' });
        } finally {
            setPaymentLoading(false);
            setCreatingPayment(false);
        }
    };


    //handle file preview
    const handlePreview = async (file) => {
        const src = typeof file === 'string'
            ? file
            : file.preview || file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : null);
        if (src) {
            try { await Linking.openURL(src); } catch (e) { console.error(e); }
            return;
        }
        notification.error({ message: 'Preview unavailable', placement: 'topRight' });
    };


    //confirm submit documents modal open
    const confirmSubmitDocuments = () => {
        setIsConfirmDocumentsOpen(true);
    };


    //handle file upload for a specific requirement, generating a preview URL and updating state
    const handleUpload = (requirementKey) => async ({ file, onSuccess, onError }) => {
        setUploading(true);
        try {
            const originFileObj = file.originFileObj || file;
            const previewUrl = URL.createObjectURL(originFileObj);

            setRequirementFiles(prev => ({
                ...prev,
                [requirementKey]: [{
                    uid: file.uid,
                    name: file.name,
                    url: previewUrl,
                    originFileObj
                }],
            }));

            notification.success({ message: 'File ready for submission', placement: 'topRight' });
            onSuccess('ok');
        } catch (err) {
            console.error(err);
            notification.error({ message: 'Failed to process file', placement: 'topRight' });
            onError(err);
        } finally {
            setUploading(false);
        }
    };


    const allUploadRequirements = [...serviceRequirements, ...serviceAdditionalRequirements];

    const requirementLabelMap = allUploadRequirements.reduce((acc, req, idx) => {
        const mapKey = req.key || req.req || req.label || `Requirement ${idx + 1}`;
        acc[mapKey] = req.req || req.label || mapKey;
        return acc;
    }, {});


    //get the label for a requirement based on its key or fallback index, checking the label map and all requirements
    const getRequirementLabel = (key, fallbackIndex) => {
        if (requirementLabelMap[key]) {
            return requirementLabelMap[key];
        }

        const keyMatch = String(key || '').match(/-(\d+)$/);
        const indexFromKey = keyMatch ? Number(keyMatch[1]) : Number(fallbackIndex);
        const requirementByIndex = allUploadRequirements[indexFromKey];

        if (requirementByIndex?.req) {
            return requirementByIndex.req;
        }

        if (requirementByIndex?.label) {
            return requirementByIndex.label;
        }

        return key;
    };


    //check if a resubmission target is requested, normalizing the target and checking against the requested targets
    const isRequestedResubmissionTarget = (target) => {
        if (!resubmissionRequested) return true;
        return requestedResubmissionTargets.includes(normalizeResubmissionTarget(target));
    };


    //get resubmission target variants for matching, including normalized, compact, kebab-case, and snake_case forms
    const getResubmissionTargetVariants = (target) => {
        const normalized = normalizeResubmissionTarget(target);
        if (!normalized) return [];

        const compact = normalized.replace(/[_\-\s]+/g, '');
        const kebab = normalized.replace(/[_\s]+/g, '-');
        const snake = normalized.replace(/[\-\s]+/g, '_');

        return [normalized, compact, kebab, snake];
    };


    //is a requirement visible for resubmission based on requested targets and fallback index, checking variants for matching
    const isRequirementVisibleForResubmission = (req, fallbackIndex) => {
        if (!resubmissionRequested) return true;

        const fallbackKey = `requirement-${fallbackIndex}`;
        const candidates = [
            req?.key,
            req?.req,
            req?.label,
            fallbackKey,
        ];

        const candidateVariants = new Set();
        candidates.forEach((candidate) => {
            getResubmissionTargetVariants(candidate).forEach((variant) => {
                candidateVariants.add(variant);
            });
        });

        return requestedResubmissionTargets.some((target) => {
            const variants = getResubmissionTargetVariants(target);
            return variants.some((variant) => candidateVariants.has(variant));
        });
    };

    const visibleServiceRequirements = serviceRequirements;

    const visibleAdditionalRequirements = serviceAdditionalRequirements;

    const visibleRequirements = [...visibleServiceRequirements, ...visibleAdditionalRequirements];


    //handle confirming a suggested appointment schedule, validating selection and sending the chosen date and time to the server
    const handleConfirmSuggested = async () => {

        if (!application?.suggestedAppointmentSchedules || selectedSuggestedIndex === null) {
            notification.warning({ message: 'Please select an appointment option first.', placement: 'topRight' });
            return;
        }

        let dateToSend = null;
        let timeToSend = null;

        if (selectedSuggestedIndex === 'others') {
            if (!customPreferredDate || !customPreferredTime) {
                notification.warning({ message: 'Please fill in all custom date and time fields.', placement: 'topRight' });
                return;
            }

            dateToSend = dayjs(customPreferredDate).format('YYYY-MM-DD');
            timeToSend = formatAppointmentTime(customPreferredTime);

        } else if (typeof selectedSuggestedIndex === 'number') {
            const selected = normalizeScheduleSlot(application.suggestedAppointmentSchedules[selectedSuggestedIndex]);

            if (!selected?.date || !selected?.time) {
                notification.error({ message: 'Selected option is missing date or time.', placement: 'topRight' });
                return;
            }

            dateToSend = dayjs(selected.date).format('YYYY-MM-DD');
            timeToSend = formatAppointmentTime(selected.time);
        }

        try {
            setConfirmingSuggested(true);

            await apiFetch.put(`/visa/applications/${id}/choose-appointment`, {
                date: dateToSend,
                time: timeToSend
            }, withUserHeader(user._id));

            // optional: sync UI state after success
            setSelectedDate(dateToSend);
            setSelectedTime(timeToSend);

            const refreshed = await apiFetch.get(`/visa/applications/${id}`, withUserHeader(user._id));
            setApplication(refreshed?.data || refreshed);
            setIsDateSelectedModalOpen(true);
        } catch (error) {
            notification.error({ message: 'Failed to confirm appointment schedule.', placement: 'topRight' });
        } finally {
            setConfirmingSuggested(false);
        }
    };


    //handle releasing the passport with the selected option, validating input and sending the choice to the server
    const handleReleaseOption = async () => {
        if (!passportReleaseOption) {
            notification.warning({ message: 'Please select a release option first.' });
            return
        }

        const errors = {
            deliveryAddress: '',
        };

        if (passportReleaseOption === 'delivery' && !deliveryAddress.trim()) {
            errors.deliveryAddress = 'Please provide your delivery address.';
        }

        setReleaseErrors(errors);

        if (errors.deliveryAddress) {
            return;
        }

        try {
            setSavingReleaseOption(true);
            await apiFetch.put(`/visa/applications/${id}/passport-release-option`,
                {
                    option: passportReleaseOption,
                    deliveryAddress: passportReleaseOption === 'delivery' ? deliveryAddress : ""
                },
                withUserHeader(user._id)
            );

            const refreshed = await apiFetch.get(
                `/visa/applications/${id}`,
                withUserHeader(user._id)
            );

            setApplication(refreshed?.data || refreshed);

            setDeliveryAddress("")
            setShowClaimPreferenceSuccessModal(true);

        } catch (error) {
            console.error(error);
            notification.error({ message: 'Failed to update release option.' });
        } finally {
            setSavingReleaseOption(false);
        }
    }

    const savePassportReleaseOption = handleReleaseOption;


    //disable dates for appointment selection, preventing weekends and dates within two weeks from today
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


    //disable hours for appointment selection, allowing only 8 AM to 5 PM
    const disabledHours = () => {
        const hours = [];
        for (let i = 0; i < 24; i++) {
            if (i < 8 || i > 17) {
                hours.push(i);
            }
        }
        return hours;
    }


    //if no applicationId is present, navigate back to the home screen
    useEffect(() => {
        if (!applicationId) {
            navigate('/home');
        }
    }, [applicationId, navigate]);


    //upload proof image for manual payment, generating a preview URL and updating state
    const normalizedStatus = Array.isArray(application?.status)
        ? String(application.status[application.status.length - 1] || '').toLowerCase()
        : String(application?.status || application?.statusText || '').toLowerCase();

    const isOnPenalty = application?.onPenalty === true || application?.penaltyOn === true;
    const hasSecondChance = application?.secondChance === true;
    const showPenaltyPaymentSection = isOnPenalty && !hasSecondChance && normalizedStatus !== 'rejected';


    const shouldShow =
        normalizedStatus === 'payment completed' ||
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
                <TouchableOpacity onPress={() => cs.goBack()} style={{ marginTop: 20, padding: 10, backgroundColor: '#305797', borderRadius: 8 }}>
                    <Text style={{ color: '#fff' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }





    return (
        <View style={VisaProgressStyle.container}>
            <Header openSidebar={() => setSidebarVisible(true)} />
            <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

            <ScrollView contentContainerStyle={VisaProgressStyle.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={VisaProgressStyle.headerContainer}>
                    <TouchableOpacity onPress={() => cs.goBack()} style={VisaProgressStyle.backButton}>
                        <Ionicons name="arrow-back" size={16} color="#fff" />
                        <Text style={VisaProgressStyle.backButtonText}>Back</Text>
                    </TouchableOpacity>
                </View>

                <Text style={VisaProgressStyle.title}>Visa Application Details</Text>

                {/* Application Info Card */}
                <View style={VisaProgressStyle.card}>
                    <Text style={VisaProgressStyle.cardTitle}>Application Info</Text>

                    {/* Penalty */}
                    {showPenaltyPaymentSection && (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "flex-start",
                                backgroundColor: "#FEF2F2",
                                borderLeftWidth: 5,
                                borderLeftColor: "#DC2626",
                                padding: 14,
                                borderRadius: 12,
                                marginBottom: 12,
                            }}
                        >
                            <Ionicons
                                name="warning"
                                size={24}
                                color="#DC2626"
                                style={{ marginRight: 12, marginTop: 2 }}
                            />

                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        color: "#991B1B",
                                        fontFamily: "Montserrat_700Bold",
                                        fontSize: 15,
                                    }}
                                >
                                    Penalty Fee Required
                                </Text>

                                <Text
                                    style={{
                                        color: "#7F1D1D",
                                        fontFamily: "Montserrat_500Medium",
                                        marginTop: 4,
                                        lineHeight: 20,
                                    }}
                                >
                                    A penalty fee must be paid before you can continue with your application.
                                </Text>
                            </View>
                        </View>
                    )}

                    {normalizedAppStatus === "application submitted" && !hasChosenSuggestedSchedule && (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "flex-start",
                                backgroundColor: "#EFF6FF",
                                borderLeftWidth: 5,
                                borderLeftColor: "#3B82F6",
                                padding: 14,
                                borderRadius: 12,
                                marginBottom: 12,
                            }}
                        >
                            <Ionicons
                                name="document-text"
                                size={24}
                                color="#2563EB"
                                style={{ marginRight: 12, marginTop: 2 }}
                            />

                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        color: "#1E40AF",
                                        fontFamily: "Montserrat_700Bold",
                                        fontSize: 15,
                                    }}
                                >
                                    Application Submitted
                                </Text>

                                <Text
                                    style={{
                                        color: "#1D4ED8",
                                        fontFamily: "Montserrat_500Medium",
                                        marginTop: 4,
                                        lineHeight: 20,
                                    }}
                                >
                                    Your application has been submitted successfully. Please wait while M&amp;RC reviews your application.
                                </Text>
                            </View>
                        </View>
                    )}

                    {hasChosenSuggestedSchedule && normalizedAppStatus === "application submitted" && (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "flex-start",
                                backgroundColor: "#EFF6FF",
                                borderLeftWidth: 5,
                                borderLeftColor: "#3B82F6",
                                padding: 14,
                                borderRadius: 12,
                                marginBottom: 12,
                            }}
                        >
                            <Ionicons
                                name="calendar"
                                size={24}
                                color="#2563EB"
                                style={{ marginRight: 12, marginTop: 2 }}
                            />

                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        color: "#1E40AF",
                                        fontFamily: "Montserrat_700Bold",
                                        fontSize: 15,
                                    }}
                                >
                                    Preferred Appointment Submitted
                                </Text>

                                <Text
                                    style={{
                                        color: "#1D4ED8",
                                        fontFamily: "Montserrat_500Medium",
                                        marginTop: 4,
                                        lineHeight: 20,
                                    }}
                                >
                                    You have submitted your preferred appointment date. Please wait while M&RC reviews and confirms your appointment schedule.
                                </Text>
                            </View>
                        </View>
                    )}


                    {normalizedAppStatus.toLowerCase() === "application approved" && (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "flex-start",
                                backgroundColor: "#ECFDF5",
                                borderLeftWidth: 5,
                                borderLeftColor: "#10B981",
                                padding: 14,
                                borderRadius: 12,
                                marginBottom: 12,
                            }}
                        >
                            <Ionicons
                                name="checkmark-circle"
                                size={24}
                                color="#10B981"
                                style={{ marginRight: 12, marginTop: 2 }}
                            />

                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        color: "#065F46",
                                        fontFamily: "Montserrat_700Bold",
                                        fontSize: 15,
                                    }}
                                >
                                    Application Approved
                                </Text>

                                <Text
                                    style={{
                                        color: "#047857",
                                        fontFamily: "Montserrat_500Medium",
                                        marginTop: 4,
                                        lineHeight: 20,
                                    }}
                                >
                                    Your application has been approved. You may now proceed with the required payment to continue your application.
                                </Text>
                            </View>
                        </View>
                    )}

                    {normalizedAppStatus.toLowerCase() === "payment completed" && !showPenaltyPaymentSection && (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "flex-start",
                                backgroundColor: "#ECFDF5",
                                borderLeftWidth: 5,
                                borderLeftColor: "#10B981",
                                padding: 14,
                                borderRadius: 12,
                                marginBottom: 12,
                            }}
                        >
                            <Ionicons
                                name="card"
                                size={24}
                                color="#10B981"
                                style={{ marginRight: 12, marginTop: 2 }}
                            />

                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        color: "#065F46",
                                        fontFamily: "Montserrat_700Bold",
                                        fontSize: 15,
                                    }}
                                >
                                    Payment Completed
                                </Text>

                                <Text
                                    style={{
                                        color: "#047857",
                                        fontFamily: "Montserrat_500Medium",
                                        marginTop: 4,
                                        lineHeight: 20,
                                    }}
                                >
                                    Your payment has been received successfully. Please upload the required documents to continue the application process.
                                </Text>
                            </View>
                        </View>
                    )}

                    {normalizedAppStatus.toLowerCase() === "documents uploaded" && (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "flex-start",
                                backgroundColor: "#EFF6FF",
                                borderLeftWidth: 5,
                                borderLeftColor: "#3B82F6",
                                padding: 14,
                                borderRadius: 12,
                                marginBottom: 12,
                            }}
                        >
                            <Ionicons
                                name="cloud-upload"
                                size={24}
                                color="#2563EB"
                                style={{ marginRight: 12, marginTop: 2 }}
                            />

                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        color: "#1E40AF",
                                        fontFamily: "Montserrat_700Bold",
                                        fontSize: 15,
                                    }}
                                >
                                    Documents Uploaded
                                </Text>

                                <Text
                                    style={{
                                        color: "#1D4ED8",
                                        fontFamily: "Montserrat_500Medium",
                                        marginTop: 4,
                                        lineHeight: 20,
                                    }}
                                >
                                    Your required documents have been uploaded successfully. They are currently being reviewed by M&amp;RC.
                                </Text>
                            </View>
                        </View>
                    )}







                    {/* Passport Released - Delivery */}
                    {normalizedAppStatus === "passport released" &&
                        application.deliveryFee !== "" &&
                        application.passportReleaseOption === "delivery" && (
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "flex-start",
                                    backgroundColor: "#ECFDF5",
                                    borderLeftWidth: 5,
                                    borderLeftColor: "#10B981",
                                    padding: 14,
                                    borderRadius: 12,
                                    marginBottom: 12,
                                }}
                            >
                                <Ionicons
                                    name="car"
                                    size={24}
                                    color="#10B981"
                                    style={{ marginRight: 12, marginTop: 2 }}
                                />

                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            color: "#065F46",
                                            fontFamily: "Montserrat_700Bold",
                                            fontSize: 15,
                                        }}
                                    >
                                        Passport Delivery
                                    </Text>

                                    {application.deliveryFee === 0 ? (
                                        <Text
                                            style={{
                                                color: "#047857",
                                                fontFamily: "Montserrat_500Medium",
                                                marginTop: 4,
                                                lineHeight: 20,
                                            }}
                                        >
                                            Your delivery details will be provided soon. Please check back later.
                                        </Text>
                                    ) : (
                                        <Text
                                            style={{
                                                color: "#047857",
                                                fontFamily: "Montserrat_500Medium",
                                                marginTop: 4,
                                                lineHeight: 20,
                                            }}
                                        >
                                            Delivery Fee: ₱{application.deliveryFee}
                                            {"\n"}
                                            Delivery Date:{" "}
                                            {dayjs(application.deliveryDate).format("MMM D, YYYY")}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        )}

                    {/* Passport Released - Pickup */}
                    {normalizedAppStatus === "passport released" &&
                        application.passportReleaseOption === "pickup" && (
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "flex-start",
                                    backgroundColor: "#ECFDF5",
                                    borderLeftWidth: 5,
                                    borderLeftColor: "#10B981",
                                    padding: 14,
                                    borderRadius: 12,
                                    marginBottom: 12,
                                }}
                            >
                                <Ionicons
                                    name="business"
                                    size={24}
                                    color="#10B981"
                                    style={{ marginRight: 12, marginTop: 2 }}
                                />

                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            color: "#065F46",
                                            fontFamily: "Montserrat_700Bold",
                                            fontSize: 15,
                                        }}
                                    >
                                        Passport Ready for Pickup
                                    </Text>

                                    <Text
                                        style={{
                                            color: "#047857",
                                            fontFamily: "Montserrat_500Medium",
                                            marginTop: 4,
                                            lineHeight: 20,
                                        }}
                                    >
                                        Kindly pick up your passport from the M&RC office. You'll receive an email once it is ready for collection.
                                    </Text>
                                </View>
                            </View>
                        )}

                    {/* Documents Approved */}
                    {normalizedAppStatus === "documents approved" && (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "flex-start",
                                backgroundColor: "#ECFDF5",
                                borderLeftWidth: 5,
                                borderLeftColor: "#10B981",
                                padding: 14,
                                borderRadius: 12,
                                marginBottom: 12,
                            }}
                        >
                            <Ionicons
                                name="checkmark-circle"
                                size={24}
                                color="#10B981"
                                style={{ marginRight: 12, marginTop: 2 }}
                            />

                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        color: "#065F46",
                                        fontFamily: "Montserrat_700Bold",
                                        fontSize: 15,
                                    }}
                                >
                                    Documents Approved
                                </Text>

                                <Text
                                    style={{
                                        color: "#047857",
                                        fontFamily: "Montserrat_500Medium",
                                        marginTop: 4,
                                        lineHeight: 20,
                                    }}
                                >
                                    Your submitted documents have been reviewed and approved successfully.
                                </Text>
                            </View>
                        </View>
                    )}

                    {normalizedAppStatus === "embassy approved" && (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "flex-start",
                                backgroundColor: "#ECFDF5",
                                borderLeftWidth: 5,
                                borderLeftColor: "#10B981",
                                padding: 14,
                                borderRadius: 12,
                                marginBottom: 12,
                            }}
                        >
                            <Ionicons
                                name="ribbon"
                                size={24}
                                color="#10B981"
                                style={{ marginRight: 12, marginTop: 2 }}
                            />

                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        color: "#065F46",
                                        fontFamily: "Montserrat_700Bold",
                                        fontSize: 15,
                                    }}
                                >
                                    Embassy Approved
                                </Text>

                                <Text
                                    style={{
                                        color: "#047857",
                                        fontFamily: "Montserrat_500Medium",
                                        marginTop: 4,
                                        lineHeight: 20,
                                    }}
                                >
                                    Congratulations! The embassy has officially approved your visa application. Your application has successfully completed the embassy review process.
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Rejected */}
                    {normalizedAppStatus === "rejected" && (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "flex-start",
                                backgroundColor: "#FEF2F2",
                                borderLeftWidth: 5,
                                borderLeftColor: "#DC2626",
                                padding: 14,
                                borderRadius: 12,
                                marginBottom: 12,
                            }}
                        >
                            <Ionicons
                                name="close-circle"
                                size={24}
                                color="#DC2626"
                                style={{ marginRight: 12, marginTop: 2 }}
                            />

                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        color: "#991B1B",
                                        fontFamily: "Montserrat_700Bold",
                                        fontSize: 15,
                                    }}
                                >
                                    Application Rejected
                                </Text>

                                <Text
                                    style={{
                                        color: "#7F1D1D",
                                        fontFamily: "Montserrat_500Medium",
                                        marginTop: 4,
                                        lineHeight: 20,
                                    }}
                                >
                                    Your application has been rejected. Please review the provided remarks or contact M&RC for further assistance.
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* General Reminder */}
                    {normalizedAppStatus !== "application submitted" &&
                        normalizedAppStatus !== "application approved" &&
                        normalizedAppStatus !== "payment completed" &&
                        normalizedAppStatus !== "documents uploaded" &&
                        normalizedAppStatus !== "documents approved" &&
                        normalizedAppStatus !== "embassy approved" &&
                        normalizedAppStatus !== "passport released" &&
                        normalizedAppStatus !== "rejected" && (
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "flex-start",
                                    backgroundColor: "#FFFBEB",
                                    borderLeftWidth: 5,
                                    borderLeftColor: "#F59E0B",
                                    padding: 14,
                                    borderRadius: 12,
                                    marginBottom: 12,
                                }}
                            >
                                <Ionicons
                                    name="information-circle"
                                    size={24}
                                    color="#D97706"
                                    style={{ marginRight: 12, marginTop: 2 }}
                                />

                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            color: "#92400E",
                                            fontFamily: "Montserrat_700Bold",
                                            fontSize: 15,
                                        }}
                                    >
                                        Progress Update
                                    </Text>

                                    <Text
                                        style={{
                                            color: "#B45309",
                                            fontFamily: "Montserrat_500Medium",
                                            marginTop: 4,
                                            lineHeight: 20,
                                        }}
                                    >
                                        Refer to the Progress Tracker below to monitor the latest status of your application.
                                    </Text>
                                </View>
                            </View>
                        )}

                    {normalizedAppStatus.toLowerCase() === "passport released" && (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "flex-start",
                                backgroundColor: "#ECFDF5",
                                borderLeftWidth: 5,
                                borderLeftColor: "#15803D",
                                padding: 14,
                                borderRadius: 12,
                                marginBottom: 12,
                            }}
                        >
                            <Ionicons
                                name="checkmark-done-circle"
                                size={24}
                                color="#15803D"
                                style={{ marginRight: 12, marginTop: 2 }}
                            />

                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        color: "#15803D",
                                        fontFamily: "Montserrat_700Bold",
                                        fontSize: 15,
                                    }}
                                >
                                    Passport Released!
                                </Text>

                                <Text
                                    style={{
                                        color: "#15803D",
                                        fontFamily: "Montserrat_500Medium",
                                        marginTop: 4,
                                        lineHeight: 20,
                                    }}
                                >
                                    Your passport has been released and is now ready for pickup or has been dispatched for delivery, depending on the release option you selected.
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Reference</Text>
                        <Text style={VisaProgressStyle.infoValue}>{application.applicationNumber || application._id}</Text>
                    </View>

                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Status</Text>

                        <View
                            style={[
                                VisaProgressStyle.statusTag,
                                {
                                    backgroundColor: currentStatusColors.backgroundColor,
                                    borderColor: currentStatusColors.borderColor,
                                    borderWidth: 1,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    VisaProgressStyle.statusText,
                                    {
                                        color: currentStatusColors.textColor,
                                    },
                                ]}
                            >
                                {appStatus}
                            </Text>
                        </View>
                    </View>

                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Date Submitted</Text>
                        <Text style={VisaProgressStyle.infoValue}>{dayjs(application.createdAt).format('MMM D, YYYY')}</Text>
                    </View>

                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Applicant Name</Text>
                        <Text style={VisaProgressStyle.infoValue}>{application.applicantName || 'N/A'}</Text>
                    </View>

                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Managed By</Text>
                        <Text style={VisaProgressStyle.infoValue}>{managerName || 'N/A'}</Text>
                    </View>

                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Preferred Date</Text>
                        <Text style={VisaProgressStyle.infoValue}>{dayjs(application.preferredDate).format('MMM D, YYYY')}</Text>
                    </View>

                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Preferred Time</Text>
                        <Text style={VisaProgressStyle.infoValue}>{application.preferredTime}</Text>
                    </View>



                    <View style={VisaProgressStyle.infoRow}>
                        <Text style={VisaProgressStyle.infoLabel}>Application Type</Text>
                        <Text style={VisaProgressStyle.infoValue}>{application.serviceName}</Text>
                    </View>

                    <View style={[VisaProgressStyle.infoRow, { borderBottomWidth: 0 }]}>
                        <Text style={VisaProgressStyle.infoLabel}>Total Price</Text>
                        <Text style={[VisaProgressStyle.infoValue, { fontFamily: 'Montserrat_700Bold', color: '#305797' }]}>
                            ₱{servicePrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                    </View>
                </View>

                {normalizedAppStatus === 'embassy approved' && (
                    <View style={VisaProgressStyle.card}>
                        <Text style={VisaProgressStyle.cardTitle}>Choose how to claim your passport</Text>
                        <Text style={{ color: '#6b7280', marginBottom: 12, fontSize: 13 }}>
                            Select Pickup or Delivery. If you choose Delivery, enter your address below.
                        </Text>

                        <View style={{ gap: 10 }}>
                            <TouchableOpacity
                                onPress={() => setPassportReleaseOption('pickup')}
                                style={{
                                    borderWidth: 1,
                                    borderColor: passportReleaseOption === 'pickup' ? '#305797' : '#d1d5db',
                                    backgroundColor: passportReleaseOption === 'pickup' ? '#eaf1ff' : '#fff',
                                    borderRadius: 12,
                                    padding: 14,
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1f2937' }}>Pickup</Text>
                                    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: passportReleaseOption === 'pickup' ? '#305797' : '#9ca3af', alignItems: 'center', justifyContent: 'center' }}>
                                        {passportReleaseOption === 'pickup' && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#305797' }} />}
                                    </View>
                                </View>
                                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>Pick up your passport at the designated location.</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setPassportReleaseOption('delivery')}
                                style={{
                                    borderWidth: 1,
                                    borderColor: passportReleaseOption === 'delivery' ? '#305797' : '#d1d5db',
                                    backgroundColor: passportReleaseOption === 'delivery' ? '#eaf1ff' : '#fff',
                                    borderRadius: 12,
                                    padding: 14,
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1f2937' }}>Delivery</Text>
                                    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: passportReleaseOption === 'delivery' ? '#305797' : '#9ca3af', alignItems: 'center', justifyContent: 'center' }}>
                                        {passportReleaseOption === 'delivery' && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#305797' }} />}
                                    </View>
                                </View>
                                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>Have your passport delivered to your address.</Text>
                            </TouchableOpacity>

                            {passportReleaseOption === 'delivery' && (
                                <View style={{ marginTop: 2 }}>
                                    <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#1f2937', marginBottom: 8 }}>Delivery Address</Text>
                                    <TextInput
                                        maxLength={100}
                                        value={deliveryAddress}
                                        autoCapitalize="words"
                                        autoCorrect={false}
                                        onChangeText={(text) => {
                                            const cleanedAddress = text
                                                .replace(/[^a-zA-Z0-9\s.'#&()/:;\-]/g, "")
                                                .replace(/[^\S\r\n]{2,}/g, " ")
                                                .replace(/^\s+/, "");

                                            setDeliveryAddress(cleanedAddress);

                                            setReleaseErrors(prev => ({
                                                ...prev,
                                                deliveryAddress: '',
                                            }));
                                        }}
                                        placeholder="Enter your complete delivery address"
                                        placeholderTextColor="#9ca3af"
                                        multiline
                                        numberOfLines={4}
                                        style={{
                                            minHeight: 110,
                                            borderWidth: 1,
                                            borderColor: releaseErrors.deliveryAddress ? '#dc2626' : '#d1d5db',
                                            borderRadius: 12,
                                            paddingHorizontal: 14,
                                            paddingVertical: 12,
                                            textAlignVertical: 'top',
                                            backgroundColor: '#fff',
                                            color: '#1f2937',
                                            fontFamily: 'Montserrat_400Regular',
                                        }}
                                    />
                                    {releaseErrors.deliveryAddress ? (
                                        <Text
                                            style={{
                                                color: '#dc2626',
                                                fontSize: 12,
                                                marginTop: 4,
                                                fontFamily: 'Montserrat_500Medium',
                                            }}
                                        >
                                            {releaseErrors.deliveryAddress}
                                        </Text>
                                    ) : null}
                                </View>
                            )}

                            <TouchableOpacity
                                onPress={savePassportReleaseOption}
                                disabled={savingReleaseOption}
                                style={{
                                    backgroundColor: '#305797',
                                    borderRadius: 10,
                                    paddingVertical: 12,
                                    alignItems: 'center',
                                    opacity: savingReleaseOption ? 0.7 : 1,
                                }}
                            >
                                {savingReleaseOption ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontFamily: 'Montserrat_600SemiBold' }}>Submit Claim Preference</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}




                {/* SERVICE FEE */}
                {normalizedAppStatus === 'application approved' && (
                    <View style={VisaProgressStyle.card}>
                        <Text style={VisaProgressStyle.cardTitle}>Application Payment</Text>
                        <Text style={{ color: '#6b7280', marginBottom: 12, fontSize: 13, fontFamily: 'Montserrat_500Medium' }}>Complete payment for your visa application to proceed.</Text>

                        <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', padding: 12, borderRadius: 8, marginBottom: 12, alignItems: 'center' }}>
                            <Text style={{ color: '#6b7280', fontSize: 12, fontFamily: 'Montserrat_500Medium' }}>Application Fee</Text>
                            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#305797', fontSize: 18, marginTop: 6 }}>
                                ₱{servicePrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Text>
                        </View>

                        {isApplicationPaymentDisabled && (
                            <Text style={{ color: '#b45309', marginBottom: 12, fontSize: 13, fontFamily: 'Montserrat_600SemiBold' }}>
                                A pending payment transaction already exists for this application.
                            </Text>
                        )}

                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                            <TouchableOpacity
                                disabled={isApplicationPaymentDisabled}
                                onPress={() => setPaymentMethod('paymongo')}
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: paymentMethod === 'paymongo' ? '#305797' : '#d1d5db',
                                    backgroundColor: paymentMethod === 'paymongo' ? '#eaf1ff' : '#fff',
                                    borderRadius: 12,
                                    padding: 14,
                                    opacity: isApplicationPaymentDisabled ? 0.45 : 1,
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1f2937' }}>Paymongo</Text>
                                    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: paymentMethod === 'paymongo' ? '#305797' : '#9ca3af', alignItems: 'center', justifyContent: 'center' }}>
                                        {paymentMethod === 'paymongo' && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#305797' }} />}
                                    </View>
                                </View>
                                <Text style={{ fontSize: 10, color: '#6b7280', fontFamily: 'Montserrat_500Medium' }}>Pay securely through card, GCash, GrabPay, Maya, or QRPH.</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                disabled={isApplicationPaymentDisabled}
                                onPress={() => setPaymentMethod('manual')}
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: paymentMethod === 'manual' ? '#305797' : '#d1d5db',
                                    backgroundColor: paymentMethod === 'manual' ? '#eaf1ff' : '#fff',
                                    borderRadius: 12,
                                    padding: 14,
                                    opacity: isApplicationPaymentDisabled ? 0.45 : 1,
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1f2937' }}>Manual</Text>
                                    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: paymentMethod === 'manual' ? '#305797' : '#9ca3af', alignItems: 'center', justifyContent: 'center' }}>
                                        {paymentMethod === 'manual' && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#305797' }} />}
                                    </View>
                                </View>
                                <Text style={{ fontSize: 10, color: '#6b7280', fontFamily: 'Montserrat_500Medium' }}>Upload your proof of payment for manual verification.</Text>
                            </TouchableOpacity>
                        </View>


                        {paymentMethod === 'manual' && (
                            <View style={PaymentStyle.manualBankSection}>
                                <Text style={[PaymentStyle.sectionTitle, { fontSize: 16, marginBottom: 12 }]}>Available Bank Accounts</Text>
                                <View style={PaymentStyle.bankGrid}>
                                    {methodsWithImage.map((item) => (
                                        <View
                                            key={item._id}
                                            style={PaymentStyle.bankGridCard}
                                        >
                                            <Text style={PaymentStyle.bankName}>
                                                {item.paymentType}
                                            </Text>

                                            <Text style={PaymentStyle.bankAccount}>
                                                {item.number}
                                            </Text>

                                            <Text style={PaymentStyle.bankHolder}>
                                                {item.accountName}
                                            </Text>

                                            {item.additionalInfo ? (
                                                <Text style={PaymentStyle.bankHolder}>
                                                    {item.additionalInfo}
                                                </Text>
                                            ) : null}

                                            <TouchableOpacity
                                                onPress={() => setEnlargedQR(item.image)}
                                            >
                                                <Image
                                                    source={{ uri: item.image }}
                                                    style={{
                                                        width: 100,
                                                        height: 100,
                                                        alignSelf: "center",
                                                        marginTop: 8,
                                                    }}
                                                    resizeMode="contain"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    ))}

                                    {methodsWithoutImage.map((item) => (
                                        <View
                                            key={item._id}
                                            style={PaymentStyle.bankGridCardFull}
                                        >
                                            <Text style={PaymentStyle.bankName}>
                                                {item.paymentType}
                                            </Text>

                                            <Text style={PaymentStyle.bankAccount}>
                                                {item.number}
                                            </Text>

                                            <Text style={PaymentStyle.bankHolder}>
                                                {item.accountName}
                                            </Text>

                                            {item.additionalInfo ? (
                                                <Text style={PaymentStyle.bankHolder}>
                                                    {item.additionalInfo}
                                                </Text>
                                            ) : null}
                                        </View>
                                    ))}
                                </View>

                                <View style={PaymentStyle.uploadSection}>
                                    <Text style={PaymentStyle.uploadTitle}>Upload Proof of Payment</Text>
                                    <Text style={PaymentStyle.uploadSubtitle}>Please upload a clear screenshot or photo of your deposit slip or transfer confirmation.</Text>
                                    <Text style={PaymentStyle.uploadSubtitle}>Accepted formats: JPG or PNG. Max size: 2MB.</Text>
                                    <Text style={[PaymentStyle.uploadSubtitle, { color: '#ef4444', fontStyle: 'italic', marginTop: 4 }]}>
                                        Note: Our team will manually verify your payment, which may take 1-2 business days. You will receive a confirmation email once your payment is verified.
                                    </Text>

                                    <TouchableOpacity style={PaymentStyle.selectImageBtn} onPress={pickProofImage}>
                                        <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                                        <Text style={PaymentStyle.selectImageBtnText}>Select Receipt Image</Text>
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
                        )}

                        <TouchableOpacity
                            style={[VisaProgressStyle.submitBtn, (creatingPayment || isApplicationPaymentDisabled) && { opacity: 0.7 }]}
                            disabled={creatingPayment || isApplicationPaymentDisabled || !servicePrice || (paymentMethod === 'manual' && !proofImage)}
                            onPress={() => handleStartPayment('visa')}
                        >
                            {creatingPayment ? <ActivityIndicator color="#fff" /> : <Text style={VisaProgressStyle.submitBtnText}>{paymentMethod === 'manual' ? 'Submit Manual Payment' : 'Pay with Paymongo'}</Text>}
                        </TouchableOpacity>
                    </View>
                )}



                {/* DELIVERY FEE */}
                {isDeliveryFeeStage && !isDeliveryFeePaid && (
                    <View style={VisaProgressStyle.card}>
                        <Text style={VisaProgressStyle.cardTitle}>Application Payment</Text>
                        <Text style={{ color: '#6b7280', marginBottom: 12, fontSize: 13 }}>Kindly pay the delivery fee of PHP {application.deliveryFee}.</Text>
                        {isDeliveryPaymentDisabled && (
                            <Text style={{ color: '#b45309', marginBottom: 12, fontSize: 13, fontFamily: 'Montserrat_600SemiBold' }}>
                                A pending payment transaction already exists for this application.
                            </Text>
                        )}

                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                            <TouchableOpacity
                                disabled={isDeliveryPaymentDisabled}
                                onPress={() => setPaymentMethod('paymongo')}
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: paymentMethod === 'paymongo' ? '#305797' : '#d1d5db',
                                    backgroundColor: paymentMethod === 'paymongo' ? '#eaf1ff' : '#fff',
                                    borderRadius: 12,
                                    padding: 14,
                                    opacity: isDeliveryPaymentDisabled ? 0.45 : 1,
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
                                disabled={isDeliveryPaymentDisabled}
                                onPress={() => setPaymentMethod('manual')}
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: paymentMethod === 'manual' ? '#305797' : '#d1d5db',
                                    backgroundColor: paymentMethod === 'manual' ? '#eaf1ff' : '#fff',
                                    borderRadius: 12,
                                    padding: 14,
                                    opacity: isDeliveryPaymentDisabled ? 0.45 : 1,
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
                            <View style={PaymentStyle.manualBankSection}>
                                <Text style={[PaymentStyle.sectionTitle, { fontSize: 16, marginBottom: 12 }]}>Available Bank Accounts</Text>
                                <View style={PaymentStyle.bankGrid}>
                                    {methodsWithImage.map((item) => (
                                        <View
                                            key={item._id}
                                            style={PaymentStyle.bankGridCard}
                                        >
                                            <Text style={PaymentStyle.bankName}>
                                                {item.paymentType}
                                            </Text>

                                            <Text style={PaymentStyle.bankAccount}>
                                                {item.number}
                                            </Text>

                                            <Text style={PaymentStyle.bankHolder}>
                                                {item.accountName}
                                            </Text>

                                            {item.additionalInfo ? (
                                                <Text style={PaymentStyle.bankHolder}>
                                                    {item.additionalInfo}
                                                </Text>
                                            ) : null}

                                            <TouchableOpacity
                                                onPress={() => setEnlargedQR(item.image)}
                                            >
                                                <Image
                                                    source={{ uri: item.image }}
                                                    style={{
                                                        width: 100,
                                                        height: 100,
                                                        alignSelf: "center",
                                                        marginTop: 8,
                                                    }}
                                                    resizeMode="contain"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    ))}

                                    {methodsWithoutImage.map((item) => (
                                        <View
                                            key={item._id}
                                            style={PaymentStyle.bankGridCardFull}
                                        >
                                            <Text style={PaymentStyle.bankName}>
                                                {item.paymentType}
                                            </Text>

                                            <Text style={PaymentStyle.bankAccount}>
                                                {item.number}
                                            </Text>

                                            <Text style={PaymentStyle.bankHolder}>
                                                {item.accountName}
                                            </Text>

                                            {item.additionalInfo ? (
                                                <Text style={PaymentStyle.bankHolder}>
                                                    {item.additionalInfo}
                                                </Text>
                                            ) : null}
                                        </View>
                                    ))}
                                </View>

                                <View style={PaymentStyle.uploadSection}>
                                    <Text style={PaymentStyle.uploadTitle}>Upload Proof of Payment</Text>
                                    <Text style={PaymentStyle.uploadSubtitle}>Please upload a clear screenshot or photo of your deposit slip or transfer confirmation.</Text>
                                    <Text style={PaymentStyle.uploadSubtitle}>Accepted formats: JPG or PNG. Max size: 2MB.</Text>
                                    <Text style={[PaymentStyle.uploadSubtitle, { color: '#ef4444', fontStyle: 'italic', marginTop: 4 }]}>
                                        Note: Our team will manually verify your payment, which may take 1-2 business days. You will receive a confirmation email once your payment is verified.
                                    </Text>

                                    <TouchableOpacity style={PaymentStyle.selectImageBtn} onPress={pickProofImage}>
                                        <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                                        <Text style={PaymentStyle.selectImageBtnText}>Select Receipt Image</Text>
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
                        )}

                        <TouchableOpacity
                            style={[VisaProgressStyle.submitBtn, (creatingPayment || isDeliveryPaymentDisabled) && { opacity: 0.7 }]}
                            disabled={creatingPayment || isDeliveryPaymentDisabled || deliveryFeeAmount <= 0 || (paymentMethod === 'manual' && !proofImage)}
                            onPress={() => handleStartPayment('delivery')}
                        >
                            {creatingPayment ? <ActivityIndicator color="#fff" /> : <Text style={VisaProgressStyle.submitBtnText}>{paymentMethod === 'manual' ? 'Submit Manual Payment' : 'Pay with Paymongo'}</Text>}
                        </TouchableOpacity>
                    </View>
                )}



                {/* PENALTY FEE */}
                {showPenaltyPaymentSection && (
                    <View style={VisaProgressStyle.card}>
                        <Text style={VisaProgressStyle.cardTitle}>Penalty Payment</Text>

                        <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', padding: 12, borderRadius: 8, marginBottom: 12, alignItems: 'center' }}>
                            <Text style={{ color: '#6b7280', fontSize: 12, fontFamily: 'Montserrat_500Medium' }}>Penalty Fee</Text>
                            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#305797', fontSize: 18, marginTop: 6 }}>
                                ₱ 1,500.00
                            </Text>
                        </View>

                        <Text style={{ color: '#6b7280', marginBottom: 12, fontSize: 13 }}>Kindly pay the penalty fee of PHP 1,500.00. Before you can continue with your application</Text>
                        {isPenaltyPaymentDisabled && (
                            <Text style={{ color: '#b45309', marginBottom: 12, fontSize: 13, fontFamily: 'Montserrat_600SemiBold' }}>
                                A pending payment transaction already exists for this application.
                            </Text>
                        )}

                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                            <TouchableOpacity
                                disabled={isPenaltyPaymentDisabled}
                                onPress={() => setPaymentMethod('paymongo')}
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: paymentMethod === 'paymongo' ? '#305797' : '#d1d5db',
                                    backgroundColor: paymentMethod === 'paymongo' ? '#eaf1ff' : '#fff',
                                    borderRadius: 12,
                                    padding: 14,
                                    opacity: isPenaltyPaymentDisabled ? 0.45 : 1,
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
                                disabled={isPenaltyPaymentDisabled}
                                onPress={() => setPaymentMethod('manual')}
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: paymentMethod === 'manual' ? '#305797' : '#d1d5db',
                                    backgroundColor: paymentMethod === 'manual' ? '#eaf1ff' : '#fff',
                                    borderRadius: 12,
                                    padding: 14,
                                    opacity: isPenaltyPaymentDisabled ? 0.45 : 1,
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
                            <View style={PaymentStyle.manualBankSection}>
                                <Text style={[PaymentStyle.sectionTitle, { fontSize: 16, marginBottom: 12 }]}>Available Bank Accounts</Text>
                                <View style={PaymentStyle.bankGrid}>
                                    {methodsWithImage.map((item) => (
                                        <View
                                            key={item._id}
                                            style={PaymentStyle.bankGridCard}
                                        >
                                            <Text style={PaymentStyle.bankName}>
                                                {item.paymentType}
                                            </Text>

                                            <Text style={PaymentStyle.bankAccount}>
                                                {item.number}
                                            </Text>

                                            <Text style={PaymentStyle.bankHolder}>
                                                {item.accountName}
                                            </Text>

                                            {item.additionalInfo ? (
                                                <Text style={PaymentStyle.bankHolder}>
                                                    {item.additionalInfo}
                                                </Text>
                                            ) : null}

                                            <TouchableOpacity
                                                onPress={() => setEnlargedQR(item.image)}
                                            >
                                                <Image
                                                    source={{ uri: item.image }}
                                                    style={{
                                                        width: 100,
                                                        height: 100,
                                                        alignSelf: "center",
                                                        marginTop: 8,
                                                    }}
                                                    resizeMode="contain"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    ))}

                                    {methodsWithoutImage.map((item) => (
                                        <View
                                            key={item._id}
                                            style={PaymentStyle.bankGridCardFull}
                                        >
                                            <Text style={PaymentStyle.bankName}>
                                                {item.paymentType}
                                            </Text>

                                            <Text style={PaymentStyle.bankAccount}>
                                                {item.number}
                                            </Text>

                                            <Text style={PaymentStyle.bankHolder}>
                                                {item.accountName}
                                            </Text>

                                            {item.additionalInfo ? (
                                                <Text style={PaymentStyle.bankHolder}>
                                                    {item.additionalInfo}
                                                </Text>
                                            ) : null}
                                        </View>
                                    ))}
                                </View>

                                <View style={PaymentStyle.uploadSection}>
                                    <Text style={PaymentStyle.uploadTitle}>Upload Proof of Payment</Text>
                                    <Text style={PaymentStyle.uploadSubtitle}>Please upload a clear screenshot or photo of your deposit slip or transfer confirmation.</Text>
                                    <Text style={PaymentStyle.uploadSubtitle}>Accepted formats: JPG or PNG. Max size: 2MB.</Text>
                                    <Text style={[PaymentStyle.uploadSubtitle, { color: '#ef4444', fontStyle: 'italic', marginTop: 4 }]}>
                                        Note: Our team will manually verify your payment, which may take 1-2 business days. You will receive a confirmation email once your payment is verified.
                                    </Text>

                                    <TouchableOpacity style={PaymentStyle.selectImageBtn} onPress={pickProofImage}>
                                        <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                                        <Text style={PaymentStyle.selectImageBtnText}>Select Receipt Image</Text>
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
                        )}

                        <TouchableOpacity
                            style={[VisaProgressStyle.submitBtn, (creatingPayment || isPenaltyPaymentDisabled) && { opacity: 0.7 }]}
                            disabled={creatingPayment || isPenaltyPaymentDisabled || (paymentMethod === 'manual' && !proofImage)}
                            onPress={() => handleStartPayment('penalty')}
                        >
                            {creatingPayment ? <ActivityIndicator color="#fff" /> : <Text style={VisaProgressStyle.submitBtnText}>{paymentMethod === 'manual' ? 'Submit Manual Payment' : 'Pay with Paymongo'}</Text>}
                        </TouchableOpacity>
                    </View>
                )}
















                {/* UPLOAD REQUIREMENTS */}
                {normalizedAppStatus === 'payment completed' && visibleRequirements.length > 0 && (!isOnPenalty || hasSecondChance) && (
                    <View style={VisaProgressStyle.card}>
                        <Text style={VisaProgressStyle.cardTitle}>Upload Requirements</Text>
                        <Text style={{ color: '#6b7280', marginBottom: 12, fontSize: 13 }}>
                            Please prepare and upload the following requirements for your visa application.
                        </Text>

                        {visibleServiceRequirements.length > 0 && (
                            <View style={{ marginBottom: visibleAdditionalRequirements.length > 0 ? 18 : 0 }}>
                                <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1f2937', fontSize: 14, marginBottom: 8 }}>Required Documents</Text>
                                <View style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 14 }}>
                                    {visibleServiceRequirements.map(renderRequirementItem)}
                                </View>
                            </View>
                        )}

                        {visibleAdditionalRequirements.length > 0 && (
                            <View>
                                <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1f2937', fontSize: 14, marginBottom: 8 }}>Additional Documents</Text>
                                <View style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 14 }}>
                                    {visibleAdditionalRequirements.map((req, idx) => renderRequirementItem(req, visibleServiceRequirements.length + idx))}
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[VisaProgressStyle.submitBtn, uploadingAll && { opacity: 0.7 }, { marginTop: 16 }]}
                            disabled={uploadingAll || Object.keys(selectedFiles).length === 0}
                            onPress={submitAllSelectedFiles}
                        >
                            {uploadingAll ? <ActivityIndicator color="#fff" /> : <Text style={VisaProgressStyle.submitBtnText}>Submit All Documents</Text>}
                        </TouchableOpacity>
                    </View>
                )}

                {normalizedAppStatus === 'documents uploaded' && getUploadedDocumentEntries().length > 0 && (
                    <View style={VisaProgressStyle.card}>
                        <Text style={VisaProgressStyle.cardTitle}>Uploaded Documents</Text>
                        <Text style={{ color: '#6b7280', marginBottom: 12, fontSize: 13 }}>
                            These are the documents currently saved on your visa application.
                        </Text>

                        <View style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 14 }}>
                            {getUploadedDocumentEntries().map(([key, value]) => {
                                const entryIsImage = isImageSource(value);
                                const requirementLabel = requirementLabelMap[key] || key.replace(/_/g, ' ');

                                return (
                                    <View key={key} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eef2f7' }}>
                                        <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#1f2937', fontSize: 14, marginBottom: 8 }}>
                                            {String(requirementLabel).toUpperCase()
                                            }
                                        </Text>

                                        {/* Image preview intentionally removed — only provide preview link */}

                                        <TouchableOpacity onPress={() => openDocument(value)}>
                                            <Text style={{ color: '#305797', fontSize: 12 }}>Preview / Open Document</Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}


                {normalizedAppStatus === 'application submitted' && !hasChosenSuggestedSchedule && Array.isArray(application?.suggestedAppointmentSchedules) && (
                    <View style={VisaProgressStyle.card}>
                        <Text style={VisaProgressStyle.cardTitle}>Suggested Appointment Options</Text>

                        {application.suggestedAppointmentSchedules?.length > 0 ? (
                            <>
                                <Text style={{ color: '#6b7280', marginBottom: 15, fontSize: 13 }}>Please select a date and time for your Embassy appointment.</Text>

                                {application.suggestedAppointmentSchedules.map((slot, index) => (
                                    (() => {
                                        const normalizedSlot = normalizeScheduleSlot(slot);
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    VisaProgressStyle.optionCard,
                                                    selectedScheduleIndex === index && VisaProgressStyle.optionCardSelected
                                                ]}
                                                onPress={() => setSelectedScheduleIndex(index)}
                                            >
                                                <View style={VisaProgressStyle.optionTag}>
                                                    <Text style={VisaProgressStyle.optionTagText}>Option {index + 1}</Text>
                                                </View>
                                                <Text style={VisaProgressStyle.optionDate}>
                                                    {normalizedSlot.date ? dayjs(normalizedSlot.date).format("MMM DD, YYYY") : 'No date provided'}
                                                </Text>
                                                <Text style={VisaProgressStyle.optionTime}>{normalizedSlot.time || 'No time provided'}</Text>
                                            </TouchableOpacity>
                                        );
                                    })()
                                ))}

                                <TouchableOpacity
                                    style={[
                                        VisaProgressStyle.optionCard,
                                        isOthersSelected && VisaProgressStyle.optionCardSelected
                                    ]}
                                    onPress={() => setSelectedScheduleIndex('others')}
                                >
                                    <View style={VisaProgressStyle.optionTag}>
                                        <Text style={VisaProgressStyle.optionTagText}>Others</Text>
                                    </View>
                                    <Text style={VisaProgressStyle.optionDate}>Enter your preferred date and time</Text>
                                    <Text style={VisaProgressStyle.optionTime}>Select your preferred appointment date and time.</Text>

                                    {isOthersSelected && (
                                        <View style={{ marginTop: 14 }}>
                                            <TouchableOpacity
                                                onPress={openCustomDatePicker}
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
                                                <Text style={{ color: customPreferredDate ? '#1f2937' : '#9ca3af', fontFamily: 'Montserrat_400Regular' }}>
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
                                                <Text style={{ color: customPreferredTime ? '#1f2937' : '#9ca3af', fontFamily: 'Montserrat_400Regular' }}>
                                                    {customPreferredTime || 'Select Preferred Time'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[VisaProgressStyle.submitBtn, !canConfirmSchedule && { opacity: 0.5 }]}
                                    disabled={!canConfirmSchedule}
                                    onPress={handleConfirmSuggested}
                                >
                                    {confirmingSuggested ? <ActivityIndicator color="#fff" /> : <Text style={VisaProgressStyle.submitBtnText}>Confirm Selected Date</Text>}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <Text style={{ color: '#6b7280', fontSize: 12, fontFamily: 'Montserrat_400Regular' }}>No suggested dates yet. Please check back later.</Text>
                        )}
                    </View>
                )}


                {/* Progress Tracker Card */}
                <View style={VisaProgressStyle.card}>
                    <Text style={VisaProgressStyle.cardTitle}>Progress Tracker</Text>
                    <View style={{ marginTop: 10 }}>
                        {/* Header with current status set date */}
                        <View style={{ backgroundColor: '#f1f5f9', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                            <View>
                                <Text style={{ fontSize: 13, color: '#374151' }}>
                                    <Text style={{ fontFamily: 'Montserrat_700Bold' }}>Current status set on:</Text> {statusSetDate ? dayjs(statusSetDate).format('MMM D, YYYY') : '—'}
                                </Text>
                            </View>
                        </View>

                        {steps.map((step, index) => {
                            const title = String(step?.title || '');
                            const isCompleted = index <= currentStepIndex;
                            const isActive = index === currentStepIndex;
                            const isLast = index === steps.length - 1;

                            const stepSetDate = getStepSetDateForTitle(application, title);
                            const stepDeadlineRaw = step?.deadlineDate;
                            const parsedStepDeadline = stepDeadlineRaw ? dayjs(stepDeadlineRaw) : null;
                            const hasStepDeadline = Boolean(parsedStepDeadline?.isValid?.());
                            const stepDeadlineDate = hasStepDeadline ? parsedStepDeadline.startOf('day') : null;
                            const stepDaysLeft = stepDeadlineDate ? stepDeadlineDate.diff(dayjs().startOf('day'), 'day') : null;

                            return (
                                <View key={index} style={VisaProgressStyle.stepItem}>
                                    <View style={VisaProgressStyle.stepIndicator}>
                                        <View style={[VisaProgressStyle.stepCircle, isCompleted ? VisaProgressStyle.stepCircleActive : VisaProgressStyle.stepCircleInactive]}>
                                            <Text style={isCompleted ? VisaProgressStyle.stepNumberActive : VisaProgressStyle.stepNumberInactive}>
                                                {index + 1}
                                            </Text>
                                        </View>
                                        {!isLast && (
                                            <View style={[VisaProgressStyle.stepLine, isCompleted && !isActive ? VisaProgressStyle.stepLineActive : {}]} />
                                        )}
                                    </View>

                                    <View style={VisaProgressStyle.stepContent}>
                                        <Text style={isCompleted ? VisaProgressStyle.stepTitleActive : VisaProgressStyle.stepTitleInactive}>
                                            {title}
                                        </Text>
                                        <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 6, fontFamily: 'Montserrat_500Medium' }}>
                                            Set on: {stepSetDate ? dayjs(stepSetDate).format('MMM D, YYYY') : '—'}
                                        </Text>
                                        {hasStepDeadline && stepDeadlineDate && (
                                            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4, fontFamily: 'Montserrat_500Medium' }}>
                                                Deadline: {dayjs(stepDeadlineDate).format('MMM D, YYYY')}
                                                {stepDaysLeft !== null && (
                                                    <Text style={{ color: stepDaysLeft < 0 ? '#dc2626' : '#6b7280' }}>
                                                        {` (${formatRemainingTime(stepDeadlineDate)})`}
                                                    </Text>
                                                )}
                                            </Text>
                                        )}
                                        {isActive && (
                                            <Text style={[VisaProgressStyle.stepDesc, { marginTop: 6 }]}>Current Stage</Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                <Modal
                    visible={showCustomDatePicker}
                    transparent
                    animationType="fade"
                    statusBarTranslucent
                    onRequestClose={closeCustomDatePicker}
                >
                    <Pressable
                        style={VisaProgressStyle.dateModalOverlay}
                        onPress={closeCustomDatePicker}
                    >
                        <Pressable
                            style={VisaProgressStyle.dateModalCard}
                            onPress={(event) => event.stopPropagation()}
                        >
                            <View style={VisaProgressStyle.dateModalHeader}>
                                <View style={VisaProgressStyle.dateModalHeaderContent}>
                                    <View style={VisaProgressStyle.dateModalHeaderIcon}>
                                        <Ionicons
                                            name="calendar"
                                            size={21}
                                            color="#305797"
                                        />
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text style={VisaProgressStyle.dateModalTitle}>
                                            Preferred Date
                                        </Text>

                                        <Text style={VisaProgressStyle.dateModalSubtitle}>
                                            Appointments are available Monday to Friday.
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={VisaProgressStyle.dateModalCloseButton}
                                    onPress={closeCustomDatePicker}
                                >
                                    <Ionicons
                                        name="close"
                                        size={21}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
                            </View>

                            <Calendar
                                key={
                                    pendingCustomPreferredDate ||
                                    customPreferredDate ||
                                    earliestAvailableCustomDate
                                }
                                initialDate={
                                    pendingCustomPreferredDate ||
                                    customPreferredDate ||
                                    earliestAvailableCustomDate
                                }
                                minDate={minimumCustomDate}
                                onDayPress={({ dateString }) => {
                                    selectCustomPreferredDate(dateString);
                                }}
                                markedDates={{
                                    [
                                        pendingCustomPreferredDate ||
                                        customPreferredDate ||
                                        earliestAvailableCustomDate
                                    ]: {
                                        selected: true,
                                        selectedColor: '#305797',
                                        selectedTextColor: '#ffffff'
                                    }
                                }}
                                enableSwipeMonths
                                hideExtraDays
                                disableAllTouchEventsForDisabledDays
                                renderArrow={(direction) => (
                                    <View style={VisaProgressStyle.dateCalendarArrow}>
                                        <Ionicons
                                            name={
                                                direction === 'left'
                                                    ? 'chevron-back'
                                                    : 'chevron-forward'
                                            }
                                            size={18}
                                            color="#305797"
                                        />
                                    </View>
                                )}
                                style={VisaProgressStyle.dateCalendar}
                                theme={{
                                    backgroundColor: '#ffffff',
                                    calendarBackground: '#ffffff',

                                    textSectionTitleColor: '#94a3b8',
                                    textDisabledColor: '#d1d5db',
                                    dayTextColor: '#334155',
                                    monthTextColor: '#1e293b',

                                    selectedDayBackgroundColor: '#305797',
                                    selectedDayTextColor: '#ffffff',
                                    todayTextColor: '#305797',
                                    arrowColor: '#305797',

                                    textDayFontFamily: 'Montserrat_400Regular',
                                    textMonthFontFamily: 'Montserrat_700Bold',
                                    textDayHeaderFontFamily: 'Roboto_500Medium',

                                    textDayFontSize: 14,
                                    textMonthFontSize: 16,
                                    textDayHeaderFontSize: 12
                                }}
                            />

                            <View style={VisaProgressStyle.dateSelectedContainer}>
                                <View style={VisaProgressStyle.dateSelectedIcon}>
                                    <Ionicons
                                        name="checkmark"
                                        size={17}
                                        color="#305797"
                                    />
                                </View>

                                <View>
                                    <Text style={VisaProgressStyle.dateSelectedLabel}>
                                        Selected date
                                    </Text>

                                    <Text style={VisaProgressStyle.dateSelectedValue}>
                                        {dayjs(
                                            pendingCustomPreferredDate ||
                                            customPreferredDate ||
                                            earliestAvailableCustomDate
                                        ).format('MMMM D, YYYY')}
                                    </Text>
                                </View>
                            </View>

                            <Text style={VisaProgressStyle.dateAvailabilityNote}>
                                Earliest available weekday:{' '}
                                {dayjs(earliestAvailableCustomDate).format(
                                    'MMMM D, YYYY'
                                )}
                            </Text>

                            <View style={VisaProgressStyle.dateModalActions}>
                                <TouchableOpacity
                                    style={VisaProgressStyle.dateModalCancelButton}
                                    onPress={closeCustomDatePicker}
                                    activeOpacity={0.75}
                                >
                                    <Text style={VisaProgressStyle.dateModalCancelText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={VisaProgressStyle.dateModalConfirmButton}
                                    onPress={applyCustomPreferredDate}
                                    activeOpacity={0.75}
                                >
                                    <Ionicons
                                        name="checkmark"
                                        size={18}
                                        color="#ffffff"
                                    />

                                    <Text style={VisaProgressStyle.dateModalConfirmText}>
                                        Confirm Date
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </Pressable>
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

                <Modal visible={showClaimPreferenceSuccessModal} transparent animationType="fade" onRequestClose={() => setShowClaimPreferenceSuccessModal(false)}>
                    <TouchableOpacity style={VisaProgressStyle.modalOverlay} activeOpacity={1} onPress={() => setShowClaimPreferenceSuccessModal(false)}>
                        <TouchableWithoutFeedback>
                            <View style={VisaProgressStyle.modalCard}>
                                <View style={VisaProgressStyle.modalIconContainer}>
                                    <Ionicons name="checkmark" size={32} color="#059669" />
                                </View>
                                <Text style={VisaProgressStyle.modalTitle}>
                                    Claim Preference Submitted
                                </Text>
                                <Text style={VisaProgressStyle.modalDesc}>
                                    Your claim preference has been submitted. Our team will review it shortly.
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowClaimPreferenceSuccessModal(false)}
                                    style={VisaProgressStyle.modalButton}
                                >
                                    <Text style={VisaProgressStyle.modalButtonText}>Got It</Text>
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

                <Modal
                    visible={!!requirementPreview}
                    animationType="slide"
                    onRequestClose={() => setRequirementPreview(null)}
                >
                    <View style={{ flex: 1, backgroundColor: "#fff" }}>

                        <View
                            style={{
                                height: 60,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingHorizontal: 16,
                                borderBottomWidth: 1,
                                borderBottomColor: "#eee",
                            }}
                        >
                            <Text
                                numberOfLines={1}
                                style={{
                                    flex: 1,
                                    fontWeight: "600",
                                    fontSize: 16,
                                }}
                            >
                                {requirementPreview?.name}
                            </Text>

                            <TouchableOpacity
                                onPress={() => setRequirementPreview(null)}
                            >
                                <Ionicons name="close" size={28} />
                            </TouchableOpacity>
                        </View>

                        {requirementPreview?.kind === "document" ? (
                            <View style={{ flex: 1 }}>
                                {requirementPreview?.kind === "document" && requirementPreview?.uri ? (
                                    <Pdf
                                        source={{ uri: requirementPreview.uri }}
                                        style={{ flex: 1 }}
                                    />
                                ) : requirementPreview?.kind === "image" && requirementPreview?.uri ? (
                                    <Image
                                        source={{ uri: requirementPreview.uri }}
                                        style={{ flex: 1, resizeMode: "contain" }}
                                    />
                                ) : null}
                            </View>
                        ) : requirementPreview?.uri ? (
                            <Image
                                source={{ uri: requirementPreview.uri }}
                                style={{
                                    flex: 1,
                                    width: "100%",
                                    resizeMode: "contain",
                                }}
                            />
                        ) : null}
                    </View>
                </Modal>

                <Modal
                    visible={uploadingAll}
                    transparent
                    animationType="fade"
                    statusBarTranslucent
                >
                    <View style={VisaProgressStyle.loadingOverlay}>
                        <View style={VisaProgressStyle.loadingCard}>
                            <ActivityIndicator
                                size="large"
                                color="#305797"
                            />

                            <Text style={VisaProgressStyle.loadingText}>
                                Uploading documents...
                            </Text>

                            <Text style={VisaProgressStyle.loadingSubtext}>
                                Please do not close the app or tap anything.
                            </Text>
                        </View>
                    </View>
                </Modal>

                <Modal visible={paymentLoading} transparent animationType="fade">
                    <View style={VisaProgressStyle.loadingOverlay}>
                        <View style={VisaProgressStyle.loadingCard}>
                            <ActivityIndicator size="large" color="#305797" />
                            <Text style={VisaProgressStyle.loadingText}>Processing payment...</Text>
                            <Text style={VisaProgressStyle.loadingSubtext}>Please do not close the app or tap anything.</Text>
                        </View>
                    </View>
                </Modal>

                <Modal visible={isDateSelectedModalOpen} transparent animationType="fade" onRequestClose={() => setIsDateSelectedModalOpen(false)}>
                    <TouchableOpacity style={VisaProgressStyle.modalOverlay} activeOpacity={1} onPress={() => setIsDateSelectedModalOpen(false)}>
                        <TouchableWithoutFeedback>
                            <View style={VisaProgressStyle.modalCard}>
                                <View style={VisaProgressStyle.modalIconContainer}>
                                    <Ionicons name="checkmark" size={32} color="#059669" />
                                </View>
                                <Text style={VisaProgressStyle.modalTitle}>
                                    Appointment Date has been selected
                                </Text>
                                <Text style={VisaProgressStyle.modalDesc}>
                                    Your appointment schedule has been confirmed. Please check your email for further instructions.
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setIsDateSelectedModalOpen(false)}
                                    style={VisaProgressStyle.modalButton}
                                >
                                    <Text style={VisaProgressStyle.modalButtonText}>Got It</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </TouchableOpacity>
                </Modal>

                <Modal visible={showDocumentsSuccessModal} transparent animationType="fade">
                    <TouchableOpacity style={VisaProgressStyle.modalOverlay} activeOpacity={1} onPress={() => setShowDocumentsSuccessModal(false)}>
                        <TouchableWithoutFeedback>
                            <View style={VisaProgressStyle.modalCard}>
                                <View style={VisaProgressStyle.modalIconContainer}>
                                    <Ionicons name="checkmark" size={32} color="#059669" />
                                </View>
                                <Text style={VisaProgressStyle.modalTitle}>
                                    Files Successfully Uploaded
                                </Text>
                                <Text style={VisaProgressStyle.modalDesc}>
                                    Your files has been submitted. Our team will review it shortly.
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowDocumentsSuccessModal(false)}
                                    style={VisaProgressStyle.modalButton}
                                >
                                    <Text style={VisaProgressStyle.modalButtonText}>Got It</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </TouchableOpacity>
                </Modal>

            </ScrollView>
        </View >
    );
}

