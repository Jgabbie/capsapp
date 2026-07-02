import { View, Text, TextInput, TouchableOpacity, Modal, ImageBackground, ToastAndroid, ActivityIndicator, ScrollView, KeyboardAvoidingView, Image, BackHandler } from 'react-native'
import React, { useState, useCallback } from 'react'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Ionicons } from '@expo/vector-icons'
import SignupStyle from '../../styles/clientstyles/SignupStyle'
import ModalStyle from '../../styles/componentstyles/ModalStyle'

import {
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_700Bold
} from '@expo-google-fonts/montserrat'

import {
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold
} from '@expo-google-fonts/roboto'

import { api } from '../../utils/api'

export default function Signup() {
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })

    const cs = useNavigation()

    const [modalVisible, setModalVisible] = useState(false)
    const [loading, setLoading] = useState(false)

    //visibility toggles for passwords
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    //state for backend general errors (like "Email already exists")
    const [backendError, setBackendError] = useState("")

    const [termsModalVisible, setTermsModalVisible] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);


    //prevent hardware back button from navigating back to the previous screen
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => true

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress)
            return () => subscription.remove()
        }, [])
    )

    const [user, setUser] = useState({
        username: "",
        firstname: "",
        lastname: "",
        email: "",
        phonenum: "",
        password: "",
        confirmpassword: "",
    })

    const [errors, setErrors] = useState({
        username: "",
        firstname: "",
        lastname: "",
        email: "",
        phonenum: "",
        password: "",
        confirmpassword: "",
        terms: "",
    })

    if (!fontsLoaded) {
        return null;
    }


    //helper function to convert names to proper case and remove invalid characters
    const toProperCase = (value) => {
        return value.toLowerCase().split(' ').map(word =>
            word.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('-')
        ).join(' ');
    }


    //validation function for each field
    const validateField = (field, value) => {
        let errorMsg = "";
        switch (field) {
            case "username":
                if (!value) errorMsg = "Username is required.";
                else if (value.length < 8) errorMsg = "Username must be at least 8 characters";
                else if (value.length > 30) errorMsg = "Username must be at most 30 characters";
                break;
            case "firstname":
                if (!value) errorMsg = "First name is required.";
                else if (value.length < 2) errorMsg = "First name must be at least 2 characters.";
                else if (value.endsWith(' ')) errorMsg = "First name must not end with a space.";
                else if (value.length > 30) errorMsg = "First name must be at most 30 characters.";
                break;
            case "lastname":
                if (!value) errorMsg = "Last name is required.";
                else if (value.length < 2) errorMsg = "Last name must be at least 2 characters.";
                else if (/[ -]$/.test(value)) errorMsg = "Last name must not end with a space or dash.";
                else if (value.length > 30) errorMsg = "Last name must be at most 30 characters.";
                break;
            case "email":
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!value) errorMsg = "Email is required.";
                else if (!emailRegex.test(value)) errorMsg = "Invalid Email.";
                break;
            case "phonenum":
                const rawNum = value.replace(/\D/g, "");
                if (!rawNum) errorMsg = "Phone is required.";
                else if (rawNum.length < 11) errorMsg = "Phone must be 11 digits";
                else if (!rawNum.startsWith("09")) errorMsg = "Number must start with 09";
                break;
            case "password":
                if (!value) errorMsg = "Password is required.";
                else if (value.length < 8) errorMsg = "Password must be at least 8 characters.";
                else if (!/[A-Z]/.test(value)) errorMsg = "Password must contain at least one uppercase letter.";
                else if (!/[0-9]/.test(value)) errorMsg = "Password must contain at least one number.";
                else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) errorMsg = "Password must contain at least one special character.";
                break;
            case "confirmpassword":
                if (!value) errorMsg = "Confirm Password is required.";
                else if (value !== user.password) errorMsg = "Passwords do not match";
                break;
            default:
                break;
        }
        return errorMsg;
    }


    //handler for input changes, applies validation and formatting
    const changeHandler = (field, value) => {
        let finalValue = value;

        if (field === 'firstname' || field === 'lastname') {
            const cleaned = value.replace(/[^A-Za-z\s-]/g, '');
            finalValue = toProperCase(cleaned).slice(0, 30);
        } else if (field === 'phonenum') {
            const cleaned = value.replace(/\D/g, "").slice(0, 11);
            if (cleaned.length <= 4) {
                finalValue = cleaned;
            } else if (cleaned.length <= 7) {
                finalValue = `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
            } else {
                finalValue = `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
            }
        } else if (field === 'username') {
            finalValue = value.replace(/[^A-Za-z0-9]/g, "").slice(0, 30);
        }

        setUser(prev => ({ ...prev, [field]: finalValue }));

        const fieldError = validateField(field, finalValue);
        setErrors(prev => ({ ...prev, [field]: fieldError }));

        // Clear the general backend error if the user starts fixing fields
        setBackendError("");
    }


    //signup function to handle form submission, validation, and API call
    const handleSignup = async () => {
        const newErrors = {};
        let hasError = false;

        Object.keys(user).forEach(field => {
            const errorMsg = validateField(field, user[field]);
            newErrors[field] = errorMsg;
            if (errorMsg) hasError = true;
        });

        if (!acceptedTerms) {
            newErrors.terms = "Please agree to the Terms and Conditions.";
            hasError = true;
        } else {
            newErrors.terms = "";
        }

        setErrors(newErrors);
        setBackendError("");

        if (hasError) {
            ToastAndroid.show("Please fix the errors above.", ToastAndroid.SHORT);
            return;
        }

        setLoading(true);

        try {
            const fullPhoneNumber = user.phonenum.replace(/\D/g, "");

            const response = await api.post('/users/create-user', {
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phonenum: fullPhoneNumber,
                password: user.password
            });

            if (response.data.success) {
                setModalVisible(true);
            } else {
                setBackendError(response.data.message || "Signup failed");
            }
        } catch (err) {
            setBackendError(err.response?.data?.message || "Network Error");
        } finally {
            setLoading(false);
        }
    }





    return (
        <ImageBackground
            source={require("../../assets/images/Signup BG Mobile.png")}
            style={SignupStyle.container}
            resizeMode='cover'
        >
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View>
                        <Text style={SignupStyle.signupSecondHeading}>Create an Account</Text>

                        {/* USERNAME */}
                        <Text style={SignupStyle.signupLabel}>Username</Text>
                        <TextInput
                            placeholder="Enter username"
                            placeholderTextColor="#6b7280"
                            maxLength={30}
                            style={[SignupStyle.signupInputs, errors.username && SignupStyle.inputErrorBorder]}
                            value={user.username}
                            onChangeText={(e) => changeHandler("username", e)}
                        />
                        {errors.username ? <Text style={SignupStyle.fieldError}>{errors.username}</Text> : null}

                        {/* NAMES */}
                        <View style={SignupStyle.fullNameContainer}>
                            <View>
                                <Text style={[SignupStyle.signupLabel, { marginLeft: 2 }]}>First Name</Text>
                                <TextInput
                                    placeholder="First name"
                                    placeholderTextColor="#6b7280"
                                    maxLength={30}
                                    style={[SignupStyle.nameInputs, errors.firstname && SignupStyle.inputErrorBorder]}
                                    value={user.firstname}
                                    onChangeText={(e) => changeHandler("firstname", e)}
                                />
                                {errors.firstname ? <Text style={[SignupStyle.fieldError, { width: 160, marginLeft: 5 }]}>{errors.firstname}</Text> : null}
                            </View>

                            <View>
                                <Text style={[SignupStyle.signupLabel, { marginLeft: 2 }]}>Last Name</Text>
                                <TextInput
                                    placeholder="Last name"
                                    placeholderTextColor="#6b7280"
                                    maxLength={30}
                                    style={[SignupStyle.nameInputs, errors.lastname && SignupStyle.inputErrorBorder]}
                                    value={user.lastname}
                                    onChangeText={(e) => changeHandler("lastname", e)}
                                />
                                {errors.lastname ? <Text style={[SignupStyle.fieldError, { width: 160, marginLeft: 5 }]}>{errors.lastname}</Text> : null}
                            </View>
                        </View>

                        {/* EMAIL */}
                        <Text style={SignupStyle.signupLabel}>Email</Text>
                        <TextInput
                            placeholder="Enter email"
                            placeholderTextColor="#6b7280"
                            maxLength={40}
                            keyboardType="email-address"
                            style={[SignupStyle.signupInputs, errors.email && SignupStyle.inputErrorBorder]}
                            value={user.email}
                            onChangeText={(e) => changeHandler("email", e)}
                        />
                        {errors.email ? <Text style={SignupStyle.fieldError}>{errors.email}</Text> : null}

                        {/* PHONE NUMBER */}
                        <Text style={SignupStyle.signupLabel}>Phone Number</Text>
                        <View style={[SignupStyle.phoneContainer, errors.phonenum && SignupStyle.inputErrorBorder]}>
                            <TextInput
                                maxLength={13}
                                keyboardType="numeric"
                                style={SignupStyle.phoneInput}
                                value={user.phonenum}
                                placeholder="0912 345 6789"
                                placeholderTextColor="#6b7280"
                                onChangeText={(e) => changeHandler("phonenum", e)}
                            />
                        </View>
                        {errors.phonenum ? <Text style={SignupStyle.fieldError}>{errors.phonenum}</Text> : null}

                        {/* PASSWORD */}
                        <Text style={SignupStyle.signupLabel}>Password</Text>
                        <View style={[SignupStyle.passwordContainer, errors.password && SignupStyle.inputErrorBorder]}>
                            <TextInput
                                maxLength={20}
                                style={SignupStyle.passwordInput}
                                placeholder="Enter password"
                                placeholderTextColor="#6b7280"
                                secureTextEntry={!showPassword}
                                value={user.password}
                                onChangeText={(e) => changeHandler("password", e)}
                            />
                            {/*  CONDITIONAL EYE: Only shows if there is text */}
                            {user.password.length > 0 && (
                                <TouchableOpacity style={SignupStyle.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#94a3b8" />
                                </TouchableOpacity>
                            )}
                        </View>
                        {errors.password ? <Text style={SignupStyle.fieldError}>{errors.password}</Text> : null}

                        {/* CONFIRM PASSWORD */}
                        <Text style={SignupStyle.signupLabel}>Confirm Password</Text>
                        <View style={[SignupStyle.passwordContainer, errors.confirmpassword && SignupStyle.inputErrorBorder]}>
                            <TextInput
                                maxLength={20}
                                style={SignupStyle.passwordInput}
                                placeholder="Confirm password"
                                placeholderTextColor="#6b7280"
                                secureTextEntry={!showConfirmPassword}
                                value={user.confirmpassword}
                                onChangeText={(e) => changeHandler("confirmpassword", e)}
                            />
                            {/*  CONDITIONAL EYE: Only shows if there is text */}
                            {user.confirmpassword.length > 0 && (
                                <TouchableOpacity style={SignupStyle.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={22} color="#94a3b8" />
                                </TouchableOpacity>
                            )}
                        </View>
                        {errors.confirmpassword ? <Text style={SignupStyle.fieldError}>{errors.confirmpassword}</Text> : null}

                        {/* BACKEND ERROR DISPLAY (Username/Email taken) */}
                        {backendError ? <Text style={SignupStyle.generalError}>{backendError}</Text> : null}

                        {/* TERMS AND CONDITIONS */}
                        <View style={SignupStyle.termsContainer}>
                            <View style={SignupStyle.termsRow}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={SignupStyle.termsCheckboxTouch}
                                    onPress={() => {
                                        const nextValue = !acceptedTerms;

                                        setAcceptedTerms(nextValue);

                                        if (nextValue) {
                                            setErrors(prev => ({
                                                ...prev,
                                                terms: ""
                                            }));
                                        }
                                    }}
                                >
                                    <View
                                        style={[
                                            SignupStyle.termsCheckbox,
                                            acceptedTerms && SignupStyle.termsCheckboxChecked,
                                            errors.terms && SignupStyle.termsCheckboxError
                                        ]}
                                    >
                                        {acceptedTerms && (
                                            <Ionicons
                                                name="checkmark"
                                                size={14}
                                                color="#ffffff"
                                            />
                                        )}
                                    </View>
                                </TouchableOpacity>

                                <Text style={SignupStyle.termsText}>
                                    I agree to the
                                </Text>

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => setTermsModalVisible(true)}
                                >
                                    <Text style={SignupStyle.termsLink}>
                                        Terms and Conditions
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={SignupStyle.termsErrorContainer}>
                                <Text style={SignupStyle.termsError}>
                                    {errors.terms || ""}
                                </Text>
                            </View>
                        </View>

                        {/* LINKS & BUTTON */}
                        <View style={SignupStyle.signupLinksContainer}>
                            <Text onPress={() => {
                                setUser({
                                    username: "",
                                    firstname: "",
                                    lastname: "",
                                    email: "",
                                    phonenum: "",
                                    password: "",
                                    confirmpassword: "",
                                });
                                setErrors({
                                    username: "",
                                    firstname: "",
                                    lastname: "",
                                    email: "",
                                    phonenum: "",
                                    password: "",
                                    confirmpassword: "",
                                    terms: "",
                                });
                                setAcceptedTerms(false);
                                setTermsModalVisible(false);
                                setBackendError("");
                                cs.navigate("login");
                            }} style={SignupStyle.signupLinks}>Already have an account? Login</Text>
                        </View>

                        <TouchableOpacity
                            style={[SignupStyle.signupButton, { opacity: loading ? 0.7 : 1 }]}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={SignupStyle.signupButtonText}>Signup</Text>}
                        </TouchableOpacity>

                        {/*  LOGO AT BOTTOM */}
                        <Image
                            source={require('../../assets/images/TransLogo.png')}
                            style={SignupStyle.bottomLogo}
                            resizeMode="contain"
                        />

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Success Modal */}
            <Modal
                transparent
                animationType='fade'
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={ModalStyle.modalOverlay}>
                    <View style={ModalStyle.modalBox}>
                        <Text style={ModalStyle.modalTitle}>Check Your Email</Text>
                        <Text style={ModalStyle.modalText}>Your account was created. Open the verification link we sent to your email, then return to the login screen.</Text>

                        <TouchableOpacity
                            style={ModalStyle.modalButton}
                            onPress={() => {
                                setModalVisible(false)
                                // clear form before navigating
                                setUser({
                                    username: "",
                                    firstname: "",
                                    lastname: "",
                                    email: "",
                                    phonenum: "",
                                    password: "",
                                    confirmpassword: "",
                                });
                                setErrors({
                                    username: "",
                                    firstname: "",
                                    lastname: "",
                                    email: "",
                                    phonenum: "",
                                    password: "",
                                    confirmpassword: "",
                                    terms: "",
                                });
                                setBackendError("");
                                setAcceptedTerms(false);
                                setTermsModalVisible(false);
                                cs.navigate("login")
                            }}
                        >
                            <Text style={ModalStyle.modalButtonText}>Go Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            <Modal
                transparent
                animationType="fade"
                visible={termsModalVisible}
                onRequestClose={() => setTermsModalVisible(false)}
            >
                <View style={ModalStyle.modalOverlay}>
                    <View style={SignupStyle.termsModalBox}>
                        <Text style={SignupStyle.termsModalTitle}>
                            Terms and Conditions
                        </Text>

                        <ScrollView
                            style={SignupStyle.termsModalScroll}
                            contentContainerStyle={SignupStyle.termsModalContent}
                            showsVerticalScrollIndicator={true}
                            nestedScrollEnabled
                        >
                            <Text style={SignupStyle.termsSectionTitle}>
                                1. Acceptance of Terms
                            </Text>

                            <Text style={SignupStyle.termsParagraph}>
                                By creating or accessing an account with M&RC
                                Travel and Tours, you agree to comply with these
                                Terms and Conditions.
                            </Text>

                            <Text style={SignupStyle.termsSectionTitle}>
                                2. Account Information
                            </Text>

                            <Text style={SignupStyle.termsParagraph}>
                                You are responsible for providing accurate account
                                information and keeping your login credentials secure.
                            </Text>

                            <Text style={SignupStyle.termsSectionTitle}>
                                3. Booking and Payment
                            </Text>

                            <Text style={SignupStyle.termsParagraph}>
                                All bookings are subject to availability. Prices,
                                deposits, payment deadlines, and cancellation policies
                                may vary depending on the selected travel package or
                                service.
                            </Text>

                            <Text style={SignupStyle.termsSectionTitle}>
                                4. Cancellations and Refunds
                            </Text>

                            <Text style={SignupStyle.termsParagraph}>
                                Cancellation and refund eligibility will depend on the
                                applicable package, airline, hotel, embassy, or service
                                provider policy.
                            </Text>

                            <Text style={SignupStyle.termsSectionTitle}>
                                5. User Responsibilities
                            </Text>

                            <Text style={SignupStyle.termsParagraph}>
                                Users must submit complete and valid information and
                                documents. M&RC Travel and Tours will not be responsible
                                for delays caused by incomplete, inaccurate, or expired
                                documents.
                            </Text>

                            <Text style={SignupStyle.termsSectionTitle}>
                                6. Privacy
                            </Text>

                            <Text style={SignupStyle.termsParagraph}>
                                Personal information will be collected and processed
                                only for account management, booking, payment, travel
                                documentation, and related services.
                            </Text>

                            <Text style={SignupStyle.termsSectionTitle}>
                                7. Changes to the Terms
                            </Text>

                            <Text style={SignupStyle.termsParagraph}>
                                M&RC Travel and Tours may update these Terms and
                                Conditions when necessary. Continued use of the platform
                                means that you accept the updated terms.
                            </Text>
                        </ScrollView>

                        <View style={SignupStyle.termsModalFooter}>
                            <TouchableOpacity
                                style={SignupStyle.termsCloseButton}
                                onPress={() => setTermsModalVisible(false)}
                            >
                                <Text style={SignupStyle.termsButtonText}>
                                    Close
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={SignupStyle.termsAgreeButton}
                                onPress={() => {
                                    setAcceptedTerms(true);

                                    setErrors(prev => ({
                                        ...prev,
                                        terms: ""
                                    }));

                                    setTermsModalVisible(false);
                                }}
                            >
                                <Text style={SignupStyle.termsButtonText}>
                                    I Agree
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    )
}