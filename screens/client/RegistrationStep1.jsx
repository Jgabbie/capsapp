import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Image, TouchableOpacity, SafeAreaView, StatusBar, Modal, Alert } from 'react-native';
import RegistrationFormStyle from '../../styles/clientstyles/RegistrationFormStyle';
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

export default function RegistrationStep1({ route, navigation }) {
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
                // 🔥 AUTO-FILL "N/A" IF DOMESTIC
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
                            // 🔥 ENSURE "N/A" STAYS IF IT RE-RENDERS
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

        navigation.navigate("registrationstep2", { setupData, travelerUploads, passengers, leadGuestInfo });
    };

    return (
        <SafeAreaView style={RegistrationFormStyle.safeArea}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={RegistrationFormStyle.scrollViewContent} showsVerticalScrollIndicator={false}>
                
                <View style={RegistrationFormStyle.paperPage}>
                    <Image source={require('../../assets/images/Logo.png')} style={RegistrationFormStyle.logo} />
                    
                    <View style={RegistrationFormStyle.headerGold}>
                        <Text style={RegistrationFormStyle.headerGoldText}>BOOKING REGISTRATION FORM</Text>
                    </View>

                    <View style={RegistrationFormStyle.row}>
                        <View style={[RegistrationFormStyle.inputContainer, { flex: 1 }]}>
                            <Text style={RegistrationFormStyle.label}>DATE OF REGISTRATION</Text>
                            <TextInput style={RegistrationFormStyle.paperInput} value={currentDateLong} editable={false} />
                        </View>
                        <View style={[RegistrationFormStyle.inputContainer, { flex: 1 }]}>
                            <Text style={RegistrationFormStyle.label}>PACKAGE TRAVEL DATE</Text>
                            <TextInput style={RegistrationFormStyle.paperInput} value={setupData?.selectedDate} editable={false} />
                        </View>
                    </View>

                    <View style={RegistrationFormStyle.row}>
                        <View style={[RegistrationFormStyle.inputContainer, { flex: 1.5 }]}>
                            <Text style={RegistrationFormStyle.label}>TOUR PACKAGE TITLE</Text>
                            <TextInput 
                                style={[RegistrationFormStyle.paperInput, { backgroundColor: '#fff', color: '#555' }]} 
                                value={setupData?.pkg?.packageName || setupData?.pkg?.title || ''} 
                                editable={false} 
                            />
                        </View>
                        <View style={[RegistrationFormStyle.inputContainer, { flex: 1 }]}>
                            <Text style={RegistrationFormStyle.label}>TOUR PACKAGE VIA</Text>
                            <TextInput style={RegistrationFormStyle.paperInput} value={setupData?.airline} editable={false} />
                        </View>
                    </View>

                    <View style={RegistrationFormStyle.headerBlue}>
                        <Text style={RegistrationFormStyle.headerBlueText}>LEAD GUEST INFORMATION</Text>
                    </View>

                    <View style={RegistrationFormStyle.row}>
                        <View style={[RegistrationFormStyle.inputContainer, { flex: 0.5 }]}>
                            <Text style={RegistrationFormStyle.label}>TITLE:</Text>
                            <TouchableOpacity 
                                style={[RegistrationFormStyle.paperInput, { justifyContent: 'center', backgroundColor: '#fff' }]} 
                                onPress={() => setShowTitleDropdown(true)}
                                disabled={isTitleLocked}
                            >
                                <Text style={{ fontSize: 10, color: leadGuestInfo.title ? '#555' : '#888' }}>
                                    {leadGuestInfo.title || "Select title"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[RegistrationFormStyle.inputContainer, { flex: 1.5 }]}>
                            <Text style={RegistrationFormStyle.label}>FULL NAME:</Text>
                            <TextInput style={[RegistrationFormStyle.paperInput, { backgroundColor: '#fff', color: '#555' }]} value={`${user?.firstname || ''} ${user?.lastname || ''}`} editable={false} />
                        </View>
                    </View>

                    <View style={RegistrationFormStyle.row}>
                        <View style={[RegistrationFormStyle.inputContainer, { flex: 1 }]}>
                            <Text style={RegistrationFormStyle.label}>EMAIL ADD:</Text>
                            <TextInput style={[RegistrationFormStyle.paperInput, { backgroundColor: '#fff', color: '#555' }]} value={user?.email || ''} editable={false} />
                        </View>
                        <View style={[RegistrationFormStyle.inputContainer, { flex: 1 }]}>
                            <Text style={RegistrationFormStyle.label}>CONTACT DETAILS:</Text>
                            <TextInput 
                                style={[RegistrationFormStyle.paperInput, isContactLocked && { backgroundColor: '#fff', color: '#555' }]} 
                                value={leadGuestInfo.contact} 
                                keyboardType="phone-pad" 
                                editable={!isContactLocked}
                                onChangeText={(v) => setLeadGuestInfo({...leadGuestInfo, contact: v})} 
                            />
                        </View>
                    </View>

                    <View style={RegistrationFormStyle.inputContainer}>
                        <Text style={RegistrationFormStyle.label}>ADDRESS:</Text>
                        <TextInput 
                            style={[RegistrationFormStyle.paperInput, isAddressLocked && { backgroundColor: '#fff', color: '#555' }]} 
                            value={leadGuestInfo.address} 
                            editable={!isAddressLocked}
                            onChangeText={(v) => setLeadGuestInfo({...leadGuestInfo, address: v})} 
                        />
                    </View>

                    <View style={RegistrationFormStyle.headerBlue}>
                        <Text style={RegistrationFormStyle.headerBlueText}>PASSENGER LIST (Including Lead Guest)</Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <View style={RegistrationFormStyle.tableWrapper}>
                            <View style={RegistrationFormStyle.tableHeaderRow}>
                                <Text style={[RegistrationFormStyle.columnHeader, { width: 30 }]}>NO</Text>
                                <Text style={[RegistrationFormStyle.columnHeader, { width: 50 }]}>TITLE</Text>
                                <Text style={[RegistrationFormStyle.columnHeader, { width: 100 }]}>FIRST NAME</Text>
                                <Text style={[RegistrationFormStyle.columnHeader, { width: 100 }]}>LAST NAME</Text>
                                <Text style={[RegistrationFormStyle.columnHeader, { width: 70 }]}>ROOM</Text>
                                <Text style={[RegistrationFormStyle.columnHeader, { width: 75 }]}>BIRTHDAY</Text>
                                <Text style={[RegistrationFormStyle.columnHeader, { width: 35 }]}>AGE</Text>
                                <Text style={[RegistrationFormStyle.columnHeader, { width: 80 }]}>PASSPORT #</Text>
                                <Text style={[RegistrationFormStyle.columnHeader, { width: 75 }]}>EXPIRY</Text>
                            </View>

                            {passengers.map((p, i) => (
                                <View key={i} style={RegistrationFormStyle.tableDataRow}>
                                    <Text style={[RegistrationFormStyle.cellInput, { width: 30, textAlignVertical: 'center', backgroundColor: '#fff', color: '#555' }]}>{i + 1}</Text>
                                    <TextInput style={[RegistrationFormStyle.cellInput, { width: 50, backgroundColor: '#fff', color: '#555' }]} value={p.title} editable={false} />
                                    <TextInput style={[RegistrationFormStyle.cellInput, { width: 100, backgroundColor: '#fff', color: '#555' }]} value={p.firstName} editable={false} />
                                    <TextInput style={[RegistrationFormStyle.cellInput, { width: 100, backgroundColor: '#fff', color: '#555' }]} value={p.lastName} editable={false} />
                                    <TextInput style={[RegistrationFormStyle.cellInput, { width: 70, backgroundColor: '#fff', color: '#555' }]} value={p.room} editable={false} />
                                    <TextInput style={[RegistrationFormStyle.cellInput, { width: 75, backgroundColor: '#fff', color: '#555' }]} value={p.bday} editable={false} />
                                    <TextInput style={[RegistrationFormStyle.cellInput, { width: 35, backgroundColor: '#fff', color: '#555' }]} value={p.age} editable={false} />
                                    {/* Will render N/A correctly */}
                                    <TextInput style={[RegistrationFormStyle.cellInput, { width: 80, backgroundColor: '#fff', color: '#555' }]} value={p.passport} editable={false} />
                                    <TextInput style={[RegistrationFormStyle.cellInput, { width: 75, backgroundColor: '#fff', color: '#555' }]} value={p.expiry} editable={false} />
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    {isTableIncomplete && (
                        <Text style={RegistrationFormStyle.errorText}>
                            Please go back and complete all traveler details before proceeding.
                        </Text>
                    )}

                    <View style={RegistrationFormStyle.infoBlocksRow}>
                        <View style={RegistrationFormStyle.infoBlockLeft}>
                            <Text style={RegistrationFormStyle.guideTitle}>GUIDE IN ROOM ASSIGNMENTS:</Text>
                            <Text style={RegistrationFormStyle.guideNote}>*Important note: All room type requests are subject for availability.</Text>
                            <Text style={RegistrationFormStyle.guideNote}>Use of SINGLE ROOM has a single supplement charge.</Text>
                            
                            <View style={RegistrationFormStyle.guideRow}>
                                <Text style={RegistrationFormStyle.guideLabel}>TWIN BED ROOM</Text>
                                <Text style={RegistrationFormStyle.guideDesc}>- 1 Room with 2 single beds; 2 pax occupancy</Text>
                            </View>
                            <View style={RegistrationFormStyle.guideRow}>
                                <Text style={RegistrationFormStyle.guideLabel}>DOUBLE ROOM</Text>
                                <Text style={RegistrationFormStyle.guideDesc}>- 1 room with 1 double bed; 2 pax occupancy</Text>
                            </View>
                            <View style={RegistrationFormStyle.guideRow}>
                                <Text style={RegistrationFormStyle.guideLabel}>SINGLE ROOM</Text>
                                <Text style={RegistrationFormStyle.guideDesc}>- 1 room with 1 bed; 1 pax occupancy</Text>
                            </View>
                            <View style={RegistrationFormStyle.guideRow}>
                                <Text style={RegistrationFormStyle.guideLabel}>TRIPLE ROOM</Text>
                                <Text style={RegistrationFormStyle.guideDesc}>- 1 room with 3 single beds OR 1 double + 1 single</Text>
                            </View>
                        </View>

                        <View style={RegistrationFormStyle.infoBlockRight}>
                            <Text style={RegistrationFormStyle.legalText}>As the lead guest and the sole mediator between the Travel Agency and the guests enlisted of this group, I hereby confirm that all the above information is correct and true and I am happy for M&RC Travel and Tours to access this information when organizing this trip/travel for me.</Text>
                            <Text style={RegistrationFormStyle.legalText}>By signing this form, I allow M&RC Travel and Tours to keep all my and our group's data on file and access details which are necessary for this trip/travel and authorized by me.</Text>
                        </View>
                    </View>

                    <View style={RegistrationFormStyle.signatureBlock}>
                        <View style={RegistrationFormStyle.sigLine}>
                            <TextInput style={[RegistrationFormStyle.paperInput, { width: '100%', textAlign: 'center', backgroundColor: '#fff', color: '#555' }]} value={`${user?.firstname || ''} ${user?.lastname || ''}`} editable={false} />
                            <Text style={RegistrationFormStyle.sigText}>Signature over printed name</Text>
                        </View>
                        <View style={RegistrationFormStyle.sigLine}>
                            <TextInput style={[RegistrationFormStyle.paperInput, { width: '100%', textAlign: 'center', backgroundColor: '#fff', color: '#555' }]} value={currentDateLong} editable={false} />
                            <Text style={RegistrationFormStyle.sigText}>Date</Text>
                        </View>
                    </View>
                </View>

                {/* FOOTER NAVIGATION */}
                <View style={RegistrationFormStyle.footerContainer}>
                    <TouchableOpacity style={QuotationAllInStyle.proceedButton} onPress={handleNext}>
                        <Text style={QuotationAllInStyle.proceedButtonText}>Next: Medical & Insurance</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={RegistrationFormStyle.backTextButton} onPress={() => navigation.goBack()}>
                        <Text style={RegistrationFormStyle.backText}>Back to Uploads</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <Modal visible={showTitleDropdown} transparent animationType="fade">
                <TouchableOpacity style={RegistrationFormStyle.modalOverlay} activeOpacity={1} onPress={() => setShowTitleDropdown(false)}>
                    <View style={RegistrationFormStyle.dropdownBox}>
                        <TouchableOpacity style={RegistrationFormStyle.dropdownItem} onPress={() => { setLeadGuestInfo({...leadGuestInfo, title: 'MR'}); setShowTitleDropdown(false); }}>
                            <Text style={RegistrationFormStyle.dropdownText}>MR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[RegistrationFormStyle.dropdownItem, { borderBottomWidth: 0 }]} onPress={() => { setLeadGuestInfo({...leadGuestInfo, title: 'MS'}); setShowTitleDropdown(false); }}>
                            <Text style={RegistrationFormStyle.dropdownText}>MS</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}