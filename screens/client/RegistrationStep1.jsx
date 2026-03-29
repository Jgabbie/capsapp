import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Image, TouchableOpacity, SafeAreaView, StatusBar, Modal, Alert } from 'react-native';
import RegistrationFormStyle from '../../styles/clientstyles/RegistrationFormStyle';
import QuotationAllInStyle from '../../styles/clientstyles/QuotationAllInStyle';
import { useUser } from '../../context/UserContext'; 

// Helper to format date like "March 29, 2026"
const formatLongDate = (dateVal) => {
    if (!dateVal) return "";
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateVal).toLocaleDateString('en-US', options);
};

// 🔥 Helper to auto-format dates with slashes (MM/DD/YYYY) 🔥
const formatDateInput = (text) => {
    // Strip out anything that isn't a number
    const cleaned = text.replace(/[^0-9]/g, '');
    
    // Inject slashes based on length
    if (cleaned.length >= 5) {
        return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    } else if (cleaned.length >= 3) {
        return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
};

export default function RegistrationStep1({ route, navigation }) {
    const { user } = useUser();
    const { setupData, travelerUploads } = route.params || {};
    
    const totalCount = (setupData?.travelerCounts?.adult || 0) + 
                       (setupData?.travelerCounts?.child || 0) + 
                       (setupData?.travelerCounts?.infant || 0);

    const [passengers, setPassengers] = useState(Array(totalCount).fill({
        title: '', firstName: '', lastName: '', room: '', bday: '', age: '', passport: '', expiry: ''
    }));

    const [leadGuestInfo, setLeadGuestInfo] = useState({
        title: '', contact: '', address: ''
    });

    const [showTitleDropdown, setShowTitleDropdown] = useState(false);
    const currentDateLong = formatLongDate(new Date());

    useEffect(() => {
        if (user) {
            const updated = [...passengers];
            updated[0] = { ...updated[0], firstName: user.firstname, lastName: user.lastname };
            setPassengers(updated);

            setLeadGuestInfo(prev => ({
                ...prev,
                contact: user.phone || user.contactNumber || user.contactDetails || prev.contact,
                address: user.address || prev.address
            }));
        }
    }, [user]);

    const updatePassenger = (index, field, value) => {
        const updated = [...passengers];
        updated[index] = { ...updated[index], [field]: value };
        setPassengers(updated);
    };

    // 🔥 LIVE VALIDATION CHECK FOR RED TEXT 🔥
    const isTableIncomplete = passengers.some(p => 
        !p.title || !p.firstName || !p.lastName || !p.room || !p.bday || !p.age || !p.passport || !p.expiry
    );

    // 🔥 SUBMIT VALIDATION HANDLER 🔥
    const handleNext = () => {
        // 1. Check Lead Guest
        if (!leadGuestInfo.title || !leadGuestInfo.contact || !leadGuestInfo.address) {
            Alert.alert("Missing Information", "Please complete all Lead Guest fields.");
            return;
        }

        // 2. Check Passenger Table Empty Fields
        if (isTableIncomplete) {
            Alert.alert("Missing Information", "Please complete all fields in the Passenger List.");
            return;
        }

        // 3. Check Date Formats (MM/DD/YY or MM/DD/YYYY)
        const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{2,4}$/;
        
        for (let i = 0; i < passengers.length; i++) {
            if (!dateRegex.test(passengers[i].bday)) {
                Alert.alert("Invalid Format", `Passenger ${i + 1}: Birthday must be MM/DD/YY or MM/DD/YYYY`);
                return;
            }
            if (!dateRegex.test(passengers[i].expiry)) {
                Alert.alert("Invalid Format", `Passenger ${i + 1}: Passport Expiry must be MM/DD/YY or MM/DD/YYYY`);
                return;
            }
        }

        // 4. Proceed if all checks pass
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
                            <TextInput style={RegistrationFormStyle.paperInput} value={setupData?.pkg?.title} editable={false} />
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
                                style={[RegistrationFormStyle.paperInput, { justifyContent: 'center' }]} 
                                onPress={() => setShowTitleDropdown(true)}
                            >
                                <Text style={{ fontSize: 10, color: leadGuestInfo.title ? '#000' : '#888' }}>
                                    {leadGuestInfo.title || "Please select a title"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[RegistrationFormStyle.inputContainer, { flex: 1.5 }]}>
                            <Text style={RegistrationFormStyle.label}>FULL NAME:</Text>
                            <TextInput style={RegistrationFormStyle.paperInput} value={`${user?.firstname || ''} ${user?.lastname || ''}`} editable={false} />
                        </View>
                    </View>

                    <View style={RegistrationFormStyle.row}>
                        <View style={[RegistrationFormStyle.inputContainer, { flex: 1 }]}>
                            <Text style={RegistrationFormStyle.label}>EMAIL ADD:</Text>
                            <TextInput style={RegistrationFormStyle.paperInput} value={user?.email || ''} editable={false} />
                        </View>
                        <View style={[RegistrationFormStyle.inputContainer, { flex: 1 }]}>
                            <Text style={RegistrationFormStyle.label}>CONTACT DETAILS:</Text>
                            <TextInput style={RegistrationFormStyle.paperInput} value={leadGuestInfo.contact} keyboardType="phone-pad" onChangeText={(v) => setLeadGuestInfo({...leadGuestInfo, contact: v})} />
                        </View>
                    </View>

                    <View style={RegistrationFormStyle.inputContainer}>
                        <Text style={RegistrationFormStyle.label}>ADDRESS:</Text>
                        <TextInput style={RegistrationFormStyle.paperInput} value={leadGuestInfo.address} onChangeText={(v) => setLeadGuestInfo({...leadGuestInfo, address: v})} />
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

                            {/* Dynamic Rows */}
                            {passengers.map((p, i) => (
                                <View key={i} style={RegistrationFormStyle.tableDataRow}>
                                    <Text style={[RegistrationFormStyle.cellInput, { width: 30, textAlignVertical: 'center', backgroundColor: '#fafafa' }]}>{i + 1}</Text>
                                    <TextInput style={[RegistrationFormStyle.cellInput, { width: 50 }]} placeholder="MR/MS" onChangeText={(v) => updatePassenger(i, 'title', v)} value={p.title} />
                                    <TextInput style={[RegistrationFormStyle.cellInput, { width: 100 }]} value={p.firstName} onChangeText={(v) => updatePassenger(i, 'firstName', v)} />
                                    <TextInput style={[RegistrationFormStyle.cellInput, { width: 100 }]} value={p.lastName} onChangeText={(v) => updatePassenger(i, 'lastName', v)} />
                                    <TextInput style={[RegistrationFormStyle.cellInput, { width: 70 }]} placeholder="SINGLE" onChangeText={(v) => updatePassenger(i, 'room', v)} value={p.room} />
                                    
                                    {/* 🔥 BIRTHDAY - Auto Format with Slashes 🔥 */}
                                    <TextInput 
                                        style={[RegistrationFormStyle.cellInput, { width: 75 }]} 
                                        placeholder="MM/DD/YY" 
                                        keyboardType="numeric"
                                        maxLength={10}
                                        onChangeText={(v) => updatePassenger(i, 'bday', formatDateInput(v))} 
                                        value={p.bday} 
                                    />
                                    
                                    {/* Age - Numbers Only */}
                                    <TextInput 
                                        style={[RegistrationFormStyle.cellInput, { width: 35 }]} 
                                        keyboardType="numeric" 
                                        maxLength={3}
                                        value={p.age}
                                        onChangeText={(v) => updatePassenger(i, 'age', v.replace(/[^0-9]/g, ''))} 
                                    />
                                    
                                    {/* 🔥 PASSPORT - Numbers Only 🔥 */}
                                    <TextInput 
                                        style={[RegistrationFormStyle.cellInput, { width: 80 }]} 
                                        keyboardType="numeric" 
                                        value={p.passport}
                                        onChangeText={(v) => updatePassenger(i, 'passport', v.replace(/[^0-9]/g, ''))} 
                                    />
                                    
                                    {/* 🔥 EXPIRY - Auto Format with Slashes 🔥 */}
                                    <TextInput 
                                        style={[RegistrationFormStyle.cellInput, { width: 75 }]} 
                                        placeholder="MM/DD/YY" 
                                        keyboardType="numeric"
                                        maxLength={10}
                                        onChangeText={(v) => updatePassenger(i, 'expiry', formatDateInput(v))} 
                                        value={p.expiry} 
                                    />
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    {/* 🔥 RED TEXT WARNING 🔥 */}
                    {isTableIncomplete && (
                        <Text style={RegistrationFormStyle.errorText}>
                            Please complete all traveler details before proceeding.
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
                            <TextInput style={[RegistrationFormStyle.paperInput, { width: '100%', textAlign: 'center' }]} value={`${user?.firstname || ''} ${user?.lastname || ''}`} editable={false} />
                            <Text style={RegistrationFormStyle.sigText}>Signature over printed name</Text>
                        </View>
                        <View style={RegistrationFormStyle.sigLine}>
                            <TextInput style={[RegistrationFormStyle.paperInput, { width: '100%', textAlign: 'center' }]} value={currentDateLong} editable={false} />
                            <Text style={RegistrationFormStyle.sigText}>Date</Text>
                        </View>
                    </View>
                </View>

                {/* 🔥 FOOTER NAVIGATION 🔥 */}
                <View style={RegistrationFormStyle.footerContainer}>
                    <TouchableOpacity 
                        style={QuotationAllInStyle.proceedButton}
                        onPress={handleNext} // Calls our new validation logic
                    >
                        <Text style={QuotationAllInStyle.proceedButtonText}>Next: Medical & Insurance</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={RegistrationFormStyle.backTextButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={RegistrationFormStyle.backText}>Back to Uploads</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <Modal visible={showTitleDropdown} transparent animationType="fade">
                <TouchableOpacity 
                    style={RegistrationFormStyle.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setShowTitleDropdown(false)}
                >
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