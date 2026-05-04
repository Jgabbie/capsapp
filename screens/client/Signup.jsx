import { View, Text, TextInput, TouchableOpacity, Modal, ImageBackground, ToastAndroid, ActivityIndicator, ScrollView, KeyboardAvoidingView, Image } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import { Ionicons } from '@expo/vector-icons'
import SignupStyle from '../../styles/clientstyles/SignupStyle'
import ModalStyle from '../../styles/componentstyles/ModalStyle'

// IMPORT OUR SMART API INSTEAD OF RAW AXIOS!
import { api } from '../../utils/api'

export default function Signup() {
    const cs = useNavigation()

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })

    const [modalVisible, setModalVisible] = useState(false)
    const [loading, setLoading] = useState(false)

    // Visibility toggles for passwords
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // State for backend general errors (like "Email already exists")
    const [backendError, setBackendError] = useState("")

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
    })

    if (!fontsLoaded) {
        return null;
    }

    const toProperCase = (value) => {
        return value.toLowerCase().split(' ').map(word =>
            word.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('-')
        ).join(' ');
    }

    const validateField = (field, value) => {
        let errorMsg = "";
        switch (field) {
            case "username":
                if (!value) errorMsg = "Username is required.";
                else if (value.length < 8) errorMsg = "Username must be at least 8 characters";
                break;
            case "firstname":
                if (!value) errorMsg = "First name is required.";
                else if (value.length < 2) errorMsg = "First name must be at least 2 characters.";
                else if (value.endsWith(' ')) errorMsg = "First name must not end with a space.";
                break;
            case "lastname":
                if (!value) errorMsg = "Last name is required.";
                else if (value.length < 2) errorMsg = "Last name must be at least 2 characters.";
                else if (/[ -]$/.test(value)) errorMsg = "Last name must not end with a space or dash.";
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

    const changeHandler = (field, value) => {
        let finalValue = value;

        if (field === 'firstname' || field === 'lastname') {
            finalValue = toProperCase(value);
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
            finalValue = value.replace(/[^A-Za-z0-9]/g, "");
        }

        setUser(prev => ({ ...prev, [field]: finalValue }));

        const fieldError = validateField(field, finalValue);
        setErrors(prev => ({ ...prev, [field]: fieldError }));

        // Clear the general backend error if the user starts fixing fields
        setBackendError("");
    }

    const handleSignup = async () => {
        const newErrors = {};
        let hasError = false;

        Object.keys(user).forEach(field => {
            const errorMsg = validateField(field, user[field]);
            newErrors[field] = errorMsg;
            if (errorMsg) hasError = true;
        });

        setErrors(newErrors);
        setBackendError("");

        if (hasError) {
            ToastAndroid.show("Please fix the errors above.", ToastAndroid.SHORT);
            return;
        }

        setLoading(true);

        try {
            const fullPhoneNumber = user.phonenum.replace(/\D/g, "");

            // 🔥 CHANGED THIS LINE! 🔥
            // Uses our smart 'api' variable instead of hardcoded 10.0.2.2
            // Note: Since your old code went to /api/create-user and our api.js base URL ends with /api, 
            // we just need to append /create-user here.
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
                        {/* 🔥 NEW LOGO: Placed on top of the title */}
                        <Image 
                            source={require('../../assets/images/TransLogo.png')} 
                            style={SignupStyle.topLogo} 
                            resizeMode="contain" 
                        />

                        <Text style={SignupStyle.signupSecondHeading}>Create an Account</Text>

                        {/* USERNAME */}
                        <Text style={SignupStyle.signupLabel}>Username</Text>
                        <TextInput
                            maxLength={20}
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
                                    maxLength={20}
                                    style={[SignupStyle.nameInputs, errors.firstname && SignupStyle.inputErrorBorder]}
                                    value={user.firstname}
                                    onChangeText={(e) => changeHandler("firstname", e)}
                                />
                                {errors.firstname ? <Text style={[SignupStyle.fieldError, { width: 160, marginLeft: 5 }]}>{errors.firstname}</Text> : null}
                            </View>

                            <View>
                                <Text style={[SignupStyle.signupLabel, { marginLeft: 2 }]}>Last Name</Text>
                                <TextInput
                                    maxLength={20}
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
                            maxLength={40}
                            keyboardType="email-address"
                            style={[SignupStyle.signupInputs, errors.email && SignupStyle.inputErrorBorder]}
                            value={user.email}
                            onChangeText={(e) => changeHandler("email", e)}
                        />
                        {errors.email ? <Text style={SignupStyle.fieldError}>{errors.email}</Text> : null}

                        {/* PHONE NUMBER (+63 Locked) */}
                        <Text style={SignupStyle.signupLabel}>Phone Number</Text>
                        <View style={[SignupStyle.phoneContainer, errors.phonenum && SignupStyle.inputErrorBorder]}>
                            <View style={SignupStyle.phonePrefixBox}>
                                <Text style={SignupStyle.phonePrefixText}>+63</Text>
                            </View>
                            <TextInput
                                maxLength={13}
                                keyboardType="numeric"
                                style={SignupStyle.phoneInput}
                                value={user.phonenum}
                                placeholder="0969 437 5868"
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
                                secureTextEntry={!showPassword}
                                value={user.password}
                                onChangeText={(e) => changeHandler("password", e)}
                            />
                            {/* 🔥 CONDITIONAL EYE: Only shows if there is text */}
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
                                secureTextEntry={!showConfirmPassword}
                                value={user.confirmpassword}
                                onChangeText={(e) => changeHandler("confirmpassword", e)}
                            />
                            {/* 🔥 CONDITIONAL EYE: Only shows if there is text */}
                            {user.confirmpassword.length > 0 && (
                                <TouchableOpacity style={SignupStyle.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={22} color="#94a3b8" />
                                </TouchableOpacity>
                            )}
                        </View>
                        {errors.confirmpassword ? <Text style={SignupStyle.fieldError}>{errors.confirmpassword}</Text> : null}

                        {/* BACKEND ERROR DISPLAY (Username/Email taken) */}
                        {backendError ? <Text style={SignupStyle.generalError}>{backendError}</Text> : null}

                        {/* LINKS & BUTTON */}
                        <View style={SignupStyle.signupLinksContainer}>
                            <Text onPress={() => cs.navigate("login")} style={SignupStyle.signupLinks}>Already have an account? Login</Text>
                        </View>

                        <TouchableOpacity
                            style={[SignupStyle.signupButton, { opacity: loading ? 0.7 : 1 }]}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={SignupStyle.signupButtonText}>Signup</Text>}
                        </TouchableOpacity>

                        {/* 🔥 NEW TRAVEX TEXT: Placed exactly below the button */}
                        <Text style={SignupStyle.byTravexText}>BY TRAVEX</Text>

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
                        <Text style={ModalStyle.modalTitle}>Account Created</Text>
                        <Text style={ModalStyle.modalText}>Your Account has been successfully created</Text>

                        <TouchableOpacity
                            style={ModalStyle.modalButton}
                            onPress={() => {
                                setModalVisible(false)
                                cs.navigate("login")
                            }}
                        >
                            <Text style={ModalStyle.modalButtonText}>Go to Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    )
}