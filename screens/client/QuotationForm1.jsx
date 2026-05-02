import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Image, TouchableOpacity, SafeAreaView, StatusBar, Modal, Alert } from 'react-native';
import QuotationFormStepStyle from '../../styles/clientstyles/QuotationFormStepStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import { useUser } from '../../context/UserContext'; 
import { api } from '../../utils/api'; 

const formatLongDate = (dateVal) => {
    if (!dateVal) return "";
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateVal).toLocaleDateString('en-US', options);
};

const calculateAge = (birthdateString) => {
    if (!birthdateString || birthdateString.length < 10) return "";
    const today = new Date();
    const birthDate = new Date(birthdateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age.toString();
};

const assignRooms = (travelers) => {
    if (!travelers || travelers.length === 0) return [];

    const roomState = {
        SINGLE: { number: 1, count: 0, max: 1 },
        DOUBLE: { number: 1, count: 0, max: 2 },
        TWIN: { number: 1, count: 0, max: 2 },
        TRIPLE: { number: 1, count: 0, max: 3 }
    };

    return travelers.map(t => {
        let rType = String(t.roomType || '').trim().toUpperCase();
        
        let baseType = '';
        if (rType.includes('TWIN')) baseType = 'TWIN';
        else if (rType.includes('DOUBLE')) baseType = 'DOUBLE';
        else if (rType.includes('TRIPLE')) baseType = 'TRIPLE';
        else if (rType.includes('SINGLE')) baseType = 'SINGLE';

        if (!baseType) return rType; 

        const state = roomState[baseType];
        
        if (state.count >= state.max) {
            state.number += 1;
            state.count = 0;
        }
        
        state.count += 1;
        return `${baseType} ${state.number}`;
    });
};

export default function QuotationForm1({ route, navigation }) {
    const { user } = useUser();
    const { setupData, travelerUploads, travelersData } = route.params || {}; 
    
    const totalCount = (setupData?.travelerCounts?.adult || 0) + 
                       (setupData?.travelerCounts?.child || 0) + 
                       (setupData?.travelerCounts?.infant || 0);

    const packageType = setupData?.packageType || setupData?.pkg?.packageType || '';
    const isDomestic = String(packageType).toLowerCase().includes('domestic');

    const [fullUserData, setFullUserData] = useState(null);

    useEffect(() => {
        const fetchFullProfile = async () => {
            if (user?._id) {
                try {
                    const response = await api.get(`/users/users/${user._id}`);
                    setFullUserData(response.data.user || response.data);
                } catch (error) {
                    console.log("Failed to fetch full user profile", error);
                }
            }
        };
        fetchFullProfile();
    }, [user?._id]);

    const userContact = fullUserData?.phonenum || fullUserData?.phone || fullUserData?.contactNumber || '';
    const userAddress = fullUserData?.homeAddress || fullUserData?.address || '';
    const userGender = fullUserData?.gender?.toLowerCase() || '';
    const userTitle = userGender === 'male' ? 'MR' : (userGender === 'female' ? 'MS' : '');
    
    const isTitleLocked = !!userTitle;
    const isContactLocked = !!userContact;
    const isAddressLocked = !!userAddress;

    const [passengers, setPassengers] = useState(() => {
        if (travelersData && travelersData.length > 0) {
            const assignedRooms = assignRooms(travelersData); 
            return travelersData.map((t, index) => ({
                title: t.title || '', 
                firstName: t.firstName || '',
                lastName: t.lastName || '',
                room: assignedRooms[index], 
                bday: t.birthdate || '',
                age: calculateAge(t.birthdate) || '', 
                passport: isDomestic ? 'N/A' : (t.passportNo || ''),
                expiry: isDomestic ? 'N/A' : (t.passportExpiry || '')
            }));
        }
        return Array(totalCount).fill({
            title: '', firstName: '', lastName: '', room: '', bday: '', age: '', 
            passport: isDomestic ? 'N/A' : '', 
            expiry: isDomestic ? 'N/A' : ''
        });
    });

    const [leadGuestInfo, setLeadGuestInfo] = useState({
        title: travelersData?.[0]?.title || '',
        contact: '',
        address: ''
    });

    const [showTitleDropdown, setShowTitleDropdown] = useState(false);
    const currentDateLong = formatLongDate(new Date());

    useEffect(() => {
        if (fullUserData) {
            setLeadGuestInfo(prev => ({
                ...prev,
                title: userTitle || travelersData?.[0]?.title || prev.title,
                contact: userContact || prev.contact,
                address: userAddress || prev.address
            }));
            
            setPassengers(prev => {
                const next = [...prev];
                if (!next[0].title && userTitle) {
                    next[0].title = userTitle;
                }
                if (travelersData && travelersData.length > 0) {
                    const assignedRooms = assignRooms(travelersData); 
                    return next.map((passenger, index) => {
                        const sourceTraveler = travelersData[index];
                        if (!sourceTraveler) return passenger;
                        return {
                            ...passenger,
                            room: assignedRooms[index],
                            passport: isDomestic ? 'N/A' : (sourceTraveler.passportNo || passenger.passport),
                            expiry: isDomestic ? 'N/A' : (sourceTraveler.passportExpiry || passenger.expiry)
                        };
                    });
                }
                return next;
            });
        }
    }, [fullUserData, userTitle, userContact, userAddress, travelersData, isDomestic]);

    const isTableIncomplete = passengers.some(p => {
        const missingBasicInfo = !p.title || !p.firstName || !p.lastName || !p.room || !p.bday || !p.age;
        if (isDomestic) {
            return missingBasicInfo; 
        } else {
            return missingBasicInfo || !p.passport || !p.expiry; 
        }
    });

    const handleNext = () => {
        if (!leadGuestInfo.title || !leadGuestInfo.contact || !leadGuestInfo.address) {
            Alert.alert("Missing Information", "Please complete all Lead Guest fields.");
            return;
        }

        for (let i = 0; i < passengers.length; i++) {
            const p = passengers[i];
            
            if (!p.title || !p.firstName || !p.lastName || !p.room || !p.bday || !p.age) {
                Alert.alert("Missing Information", `Please go back to Uploads and complete the basic details for Passenger ${i + 1}.`);
                return;
            }
            
            if (!isDomestic) {
                if (!p.passport) {
                    Alert.alert("Missing Information", `Please go back to Uploads and enter the passport number for Passenger ${i + 1}.`);
                    return;
                }
                if (!p.expiry) {
                    Alert.alert("Missing Information", `Please go back to Uploads and select the passport expiry for Passenger ${i + 1}.`);
                    return;
                }
            }
        }

        navigation.navigate("quotationform2", { setupData, travelerUploads, passengers, leadGuestInfo });
    };

    return (
        <SafeAreaView style={QuotationFormStepStyle.safeArea}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={QuotationFormStepStyle.scrollViewContent} showsVerticalScrollIndicator={false}>
                
                <View style={QuotationFormStepStyle.paperPage}>
                    <Image source={require('../../assets/images/Logo.png')} style={QuotationFormStepStyle.logo} />
                    
                    <View style={QuotationFormStepStyle.headerGold}>
                        <Text style={QuotationFormStepStyle.headerGoldText}>BOOKING REGISTRATION FORM</Text>
                    </View>

                    <View style={QuotationFormStepStyle.row}>
                        <View style={[QuotationFormStepStyle.inputContainer, { flex: 1 }]}>
                            <Text style={QuotationFormStepStyle.label}>DATE OF REGISTRATION</Text>
                            <TextInput style={QuotationFormStepStyle.paperInput} value={currentDateLong} editable={false} />
                        </View>
                        <View style={[QuotationFormStepStyle.inputContainer, { flex: 1 }]}>
                            <Text style={QuotationFormStepStyle.label}>PACKAGE TRAVEL DATE</Text>
                            <TextInput style={QuotationFormStepStyle.paperInput} value={setupData?.selectedDate} editable={false} />
                        </View>
                    </View>

                    <View style={QuotationFormStepStyle.row}>
                        <View style={[QuotationFormStepStyle.inputContainer, { flex: 1.5 }]}>
                            <Text style={QuotationFormStepStyle.label}>TOUR PACKAGE TITLE</Text>
                            <TextInput 
                                style={[QuotationFormStepStyle.paperInput, { backgroundColor: '#fff', color: '#555' }]} 
                                value={setupData?.pkg?.packageName || setupData?.pkg?.title || ''} 
                                editable={false} 
                            />
                        </View>
                        <View style={[QuotationFormStepStyle.inputContainer, { flex: 1 }]}>
                            <Text style={QuotationFormStepStyle.label}>TOUR PACKAGE VIA</Text>
                            <TextInput style={QuotationFormStepStyle.paperInput} value={setupData?.airline} editable={false} />
                        </View>
                    </View>

                    <View style={QuotationFormStepStyle.headerBlue}>
                        <Text style={QuotationFormStepStyle.headerBlueText}>LEAD GUEST INFORMATION</Text>
                    </View>

                    <View style={QuotationFormStepStyle.row}>
                        <View style={[QuotationFormStepStyle.inputContainer, { flex: 0.5 }]}>
                            <Text style={QuotationFormStepStyle.label}>TITLE:</Text>
                            <TouchableOpacity 
                                style={[QuotationFormStepStyle.paperInput, { justifyContent: 'center', backgroundColor: '#fff' }]} 
                                onPress={() => setShowTitleDropdown(true)}
                                disabled={isTitleLocked}
                            >
                                <Text style={{ fontSize: 10, color: leadGuestInfo.title ? '#555' : '#888' }}>
                                    {leadGuestInfo.title || "Select title"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[QuotationFormStepStyle.inputContainer, { flex: 1.5 }]}>
                            <Text style={QuotationFormStepStyle.label}>FULL NAME:</Text>
                            <TextInput style={[QuotationFormStepStyle.paperInput, { backgroundColor: '#fff', color: '#555' }]} value={`${user?.firstname || ''} ${user?.lastname || ''}`} editable={false} />
                        </View>
                    </View>

                    <View style={QuotationFormStepStyle.row}>
                        <View style={[QuotationFormStepStyle.inputContainer, { flex: 1 }]}>
                            <Text style={QuotationFormStepStyle.label}>EMAIL ADD:</Text>
                            <TextInput style={[QuotationFormStepStyle.paperInput, { backgroundColor: '#fff', color: '#555' }]} value={user?.email || ''} editable={false} />
                        </View>
                        <View style={[QuotationFormStepStyle.inputContainer, { flex: 1 }]}>
                            <Text style={QuotationFormStepStyle.label}>CONTACT DETAILS:</Text>
                            <TextInput 
                                style={[QuotationFormStepStyle.paperInput, isContactLocked && { backgroundColor: '#fff', color: '#555' }]} 
                                value={leadGuestInfo.contact} 
                                keyboardType="phone-pad" 
                                editable={!isContactLocked}
                                onChangeText={(v) => setLeadGuestInfo({...leadGuestInfo, contact: v})} 
                            />
                        </View>
                    </View>

                    <View style={QuotationFormStepStyle.inputContainer}>
                        <Text style={QuotationFormStepStyle.label}>ADDRESS:</Text>
                        <TextInput 
                            style={[QuotationFormStepStyle.paperInput, isAddressLocked && { backgroundColor: '#fff', color: '#555' }]} 
                            value={leadGuestInfo.address} 
                            editable={!isAddressLocked}
                            onChangeText={(v) => setLeadGuestInfo({...leadGuestInfo, address: v})} 
                        />
                    </View>

                    <View style={QuotationFormStepStyle.headerBlue}>
                        <Text style={QuotationFormStepStyle.headerBlueText}>PASSENGER LIST (Including Lead Guest)</Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <View style={QuotationFormStepStyle.tableWrapper}>
                            <View style={QuotationFormStepStyle.tableHeaderRow}>
                                <Text style={[QuotationFormStepStyle.columnHeader, { width: 30 }]}>NO</Text>
                                <Text style={[QuotationFormStepStyle.columnHeader, { width: 50 }]}>TITLE</Text>
                                <Text style={[QuotationFormStepStyle.columnHeader, { width: 100 }]}>FIRST NAME</Text>
                                <Text style={[QuotationFormStepStyle.columnHeader, { width: 100 }]}>LAST NAME</Text>
                                <Text style={[QuotationFormStepStyle.columnHeader, { width: 70 }]}>ROOM</Text>
                                <Text style={[QuotationFormStepStyle.columnHeader, { width: 75 }]}>BIRTHDAY</Text>
                                <Text style={[QuotationFormStepStyle.columnHeader, { width: 35 }]}>AGE</Text>
                                <Text style={[QuotationFormStepStyle.columnHeader, { width: 80 }]}>PASSPORT #</Text>
                                <Text style={[QuotationFormStepStyle.columnHeader, { width: 75 }]}>EXPIRY</Text>
                            </View>

                            {passengers.map((p, i) => (
                                <View key={i} style={QuotationFormStepStyle.tableDataRow}>
                                    <Text style={[QuotationFormStepStyle.cellInput, { width: 30, textAlignVertical: 'center', backgroundColor: '#fff', color: '#555' }]}>{i + 1}</Text>
                                    <TextInput style={[QuotationFormStepStyle.cellInput, { width: 50, backgroundColor: '#fff', color: '#555' }]} value={p.title} editable={false} />
                                    <TextInput style={[QuotationFormStepStyle.cellInput, { width: 100, backgroundColor: '#fff', color: '#555' }]} value={p.firstName} editable={false} />
                                    <TextInput style={[QuotationFormStepStyle.cellInput, { width: 100, backgroundColor: '#fff', color: '#555' }]} value={p.lastName} editable={false} />
                                    <TextInput style={[QuotationFormStepStyle.cellInput, { width: 70, backgroundColor: '#fff', color: '#555' }]} value={p.room} editable={false} />
                                    <TextInput style={[QuotationFormStepStyle.cellInput, { width: 75, backgroundColor: '#fff', color: '#555' }]} value={p.bday} editable={false} />
                                    <TextInput style={[QuotationFormStepStyle.cellInput, { width: 35, backgroundColor: '#fff', color: '#555' }]} value={p.age} editable={false} />
                                    <TextInput style={[QuotationFormStepStyle.cellInput, { width: 80, backgroundColor: '#fff', color: '#555' }]} value={p.passport} editable={false} />
                                    <TextInput style={[QuotationFormStepStyle.cellInput, { width: 75, backgroundColor: '#fff', color: '#555' }]} value={p.expiry} editable={false} />
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    {isTableIncomplete && (
                        <Text style={QuotationFormStepStyle.errorText}>
                            Please go back and complete all traveler details before proceeding.
                        </Text>
                    )}

                    <View style={QuotationFormStepStyle.infoBlocksRow}>
                        <View style={QuotationFormStepStyle.infoBlockLeft}>
                            <Text style={QuotationFormStepStyle.guideTitle}>GUIDE IN ROOM ASSIGNMENTS:</Text>
                            <Text style={QuotationFormStepStyle.guideNote}>*Important note: All room type requests are subject for availability.</Text>
                        </View>

                        <View style={QuotationFormStepStyle.infoBlockRight}>
                            <Text style={QuotationFormStepStyle.legalText}>As the lead guest and the sole mediator between the Travel Agency and the guests enlisted of this group, I hereby confirm that all the above information is correct and true and I am happy for M&RC Travel and Tours to access this information when organizing this trip/travel for me.</Text>
                        </View>
                    </View>

                    <View style={QuotationFormStepStyle.signatureBlock}>
                        <View style={QuotationFormStepStyle.sigLine}>
                            <TextInput style={[QuotationFormStepStyle.paperInput, { width: '100%', textAlign: 'center', backgroundColor: '#fff', color: '#555' }]} value={`${user?.firstname || ''} ${user?.lastname || ''}`} editable={false} />
                            <Text style={QuotationFormStepStyle.sigText}>Signature over printed name</Text>
                        </View>
                        <View style={QuotationFormStepStyle.sigLine}>
                            <TextInput style={[QuotationFormStepStyle.paperInput, { width: '100%', textAlign: 'center', backgroundColor: '#fff', color: '#555' }]} value={currentDateLong} editable={false} />
                            <Text style={QuotationFormStepStyle.sigText}>Date</Text>
                        </View>
                    </View>
                </View>

                <View style={QuotationFormStepStyle.footerContainer}>
                    <TouchableOpacity style={QuotationAllInStyle.proceedButton} onPress={handleNext}>
                        <Text style={QuotationAllInStyle.proceedButtonText}>Next: Medical & Insurance</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={QuotationFormStepStyle.backTextButton} onPress={() => navigation.goBack()}>
                        <Text style={QuotationFormStepStyle.backText}>Back to Uploads</Text>
                    </TouchableOpacity>
                </View>

                <Modal visible={showTitleDropdown} transparent animationType="fade">
                    <TouchableOpacity style={QuotationFormStepStyle.modalOverlay} activeOpacity={1} onPress={() => setShowTitleDropdown(false)}>
                        <View style={QuotationFormStepStyle.dropdownBox}>
                            <TouchableOpacity style={QuotationFormStepStyle.dropdownItem} onPress={() => { setLeadGuestInfo({...leadGuestInfo, title: 'MR'}); setShowTitleDropdown(false); }}>
                                <Text style={QuotationFormStepStyle.dropdownText}>MR</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[QuotationFormStepStyle.dropdownItem, { borderBottomWidth: 0 }]} onPress={() => { setLeadGuestInfo({...leadGuestInfo, title: 'MS'}); setShowTitleDropdown(false); }}>
                                <Text style={QuotationFormStepStyle.dropdownText}>MS</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
}
