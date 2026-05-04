import { View, Text, TextInput, TouchableOpacity, ImageBackground, Image, ToastAndroid, Alert, Platform, ActivityIndicator, Modal, KeyboardAvoidingView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import { Ionicons } from '@expo/vector-icons'
import LoginStyle from '../../styles/clientstyles/LoginStyle'
import ModalStyle from '../../styles/componentstyles/ModalStyle'
import { api } from '../../utils/api'
import { useUser } from '../../context/UserContext'

export default function Login() {
    const cs = useNavigation()
    const { setUser } = useUser()

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })

    const [loading, setLoading] = useState(false)
    const [getUsername, setUsername] = useState("")
    const [getPassword, setPassword] = useState("")
    const [getError, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    // OTP Modal States
    const [isOTPModalOpen, setIsOTPModalOpen] = useState(false)
    const [otp, setOtp] = useState("")
    const [errorOtp, setErrorOtp] = useState("")
    const [timer, setTimer] = useState(0)
    const [unverifiedEmail, setUnverifiedEmail] = useState("")

    useEffect(() => {
        let interval = null
        if (timer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000)
        }
        return () => clearInterval(interval)
    }, [timer])

    if (!fontsLoaded) return null;

    const normalizeRole = (role) => {
        const normalized = String(role || "").trim().toLowerCase()
        if (normalized === "user" || normalized === "users") return "customer"
        return normalized
    }

    const showMessage = (message) => {
        if (Platform.OS === "android") {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert(message);
        }
    }

    const handleLogin = async () => {
        const normalizedUsername = getUsername.trim();
        const normalizedPassword = getPassword;

        if (!normalizedUsername || !normalizedPassword) {
            setError("Fill in both fields");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const response = await api.post('/users/login-user', {
                username: normalizedUsername,
                password: normalizedPassword
            });

            if (response.data.success) {
                const role = response.data.role
                const normalizedRole = normalizeRole(role)

                // Only allow Customer/Users
                if (normalizedRole !== "users" && normalizedRole !== "customer") {
                    setError("Unauthorized role. Only Customers can sign in to the mobile app.")
                    return
                }

                const canonicalRole = "Customer"

                // 🔥 UPDATE: Added loginOnce to the context payload
                setUser({
                    _id: response.data.userId,
                    username: response.data.username,
                    role: canonicalRole,
                    loginOnce: response.data.loginOnce
                })

                showMessage("Login successful!");
                // 🛑 Manual navigation removed! App.jsx handles the redirect automatically now.

            } else {
                setError(response.data.message || "Invalid username or password");
            }

        } catch (err) {
            const status = err.response?.status;
            const data = err.response?.data;

            if (status === 403 && data?.email) {
                try {
                    const email = data.email;
                    await api.post('/users/auth/send-verify-otp', { email: email });
                    setUnverifiedEmail(email);
                    setTimer(60);
                    setIsOTPModalOpen(true);
                } catch (otpErr) {
                    setError(otpErr.response?.data?.message || "Failed to send verification email.");
                }
            } else {
                setError(data?.message || err.message || "Network error");
            }
        } finally {
            setLoading(false);
        }
    }

    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            setErrorOtp("OTP must be 6 digits.");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/users/auth/verify-account', {
                otp: otp,
                email: unverifiedEmail
            });

            if (response.data.success || response.status === 200) {
                setIsOTPModalOpen(false);
                setOtp("");
                showMessage("Account verified successfully!");
                handleLogin();
            }
        } catch (err) {
            setErrorOtp(err.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    }

    const resendOTP = async () => {
        try {
            await api.post('/users/auth/send-verify-otp', { email: unverifiedEmail })
            showMessage("OTP sent!");
            setTimer(60);
        } catch (err) {
            showMessage(err.response?.data?.message || "Verification failed");
        }
    }

    return (
        <ImageBackground
            source={require("../../assets/images/Login BG Mobile.png")}
            style={LoginStyle.container}
            resizeMode='cover'
        >
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                {/* 🔥 MOVED LOGO: Now exactly on top of the welcome title! */}
                <Image 
                    source={require('../../assets/images/TransLogo.png')} 
                    style={LoginStyle.topLogo} 
                    resizeMode="contain" 
                />

                <Text style={LoginStyle.loginHeading}>Welcome</Text>
                <Text style={LoginStyle.loginSecondHeading}>Login Here</Text>

                <View style={LoginStyle.inputWrapper}>
                    <Text style={LoginStyle.loginLabel}>Username</Text>
                    <TextInput
                        style={[LoginStyle.loginInputs, getError ? LoginStyle.inputErrorBorder : null]}
                        placeholder="Enter username"
                        value={getUsername}
                        onChangeText={(text) => {
                            setUsername(text)
                            setError("")
                        }}
                    />
                </View>

                <View style={LoginStyle.inputWrapper}>
                    <Text style={LoginStyle.loginLabel}>Password</Text>
                    <View style={{ position: 'relative', justifyContent: 'center' }}>
                        <TextInput
                            style={[LoginStyle.loginInputs, { paddingRight: 50 }, getError ? LoginStyle.inputErrorBorder : null]}
                            placeholder="Enter password"
                            value={getPassword}
                            onChangeText={(text) => {
                                setPassword(text)
                                setError("")
                            }}
                            secureTextEntry={!showPassword}
                        />
                        
                        {/* 🔥 CHANGED: Only renders the icon if there is text! */}
                        {getPassword.length > 0 && (
                            <TouchableOpacity 
                                style={{ position: 'absolute', right: 15 }} 
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#94a3b8" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* 🔥 CHANGED: Wrapped error in a fixed-height container to stop the layout jump */}
                <View style={LoginStyle.errorContainer}>
                    {getError ? <Text style={LoginStyle.errorText}>{getError}</Text> : null}
                </View>

                <View style={LoginStyle.loginLinksContainer}>
                    <TouchableOpacity onPress={() => { cs.navigate("signup") }}>
                        <Text style={LoginStyle.loginLinks}>Signup here</Text>
                    </TouchableOpacity>

                    <Text style={LoginStyle.loginLinksDivider}>|</Text>

                    <TouchableOpacity onPress={() => { cs.navigate("passwordreset") }}>
                        <Text style={LoginStyle.loginLinks}>Forgot password</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[LoginStyle.loginButton, { opacity: loading ? 0.7 : 1 }]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={LoginStyle.loginButtonText}>Login</Text>
                    )}
                </TouchableOpacity>

                {/* 🔥 NEW TEXT: Placed exactly where the bottom logo used to be */}
                <Text style={LoginStyle.byTravexText}>BY TRAVEX</Text>

                {/* OTP Verification Modal */}
                <Modal transparent animationType='fade' visible={isOTPModalOpen}>
                    <View style={ModalStyle.modalOverlay}>
                        <View style={ModalStyle.modalBox}>
                            <Text style={ModalStyle.modalTitle}>Verify OTP</Text>
                            <Text style={[ModalStyle.modalText, { marginBottom: 15 }]}>We've sent a verification code to your Email</Text>

                            <TextInput
                                style={LoginStyle.otpInput}
                                keyboardType="numeric"
                                maxLength={6}
                                value={otp}
                                onChangeText={(val) => {
                                    setOtp(val.replace(/[^0-9]/g, ''))
                                    setErrorOtp("")
                                }}
                            />
                            {/* Change this line inside the Modal */}
                            {errorOtp ? (
                                <Text style={[
                                    LoginStyle.errorMessage,
                                    {
                                        marginLeft: 0,
                                        marginBottom: 10,
                                        textAlign: 'center',
                                        width: '100%',     // 🔥 ADD THIS: Forces text to span the whole modal
                                        alignSelf: 'center' // 🔥 ADD THIS: Extra insurance for centering
                                    }
                                ]}>
                                    {errorOtp}
                                </Text>
                            ) : null}

                            <TouchableOpacity style={[ModalStyle.modalButton, { width: 200 }]} onPress={handleVerifyOTP} disabled={loading}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={ModalStyle.modalButtonText}>Submit</Text>}
                            </TouchableOpacity>

                            {timer > 0 ? (
                                <Text style={LoginStyle.timerText}>Wait for <Text style={LoginStyle.timerHighlight}>{timer}</Text> sec to resend</Text>
                            ) : (
                                <TouchableOpacity onPress={resendOTP} style={{ marginTop: 15 }}>
                                    <Text style={[LoginStyle.loginLinks, { textDecorationLine: 'none' }]}>Didn't get the code? Click here</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity onPress={() => setIsOTPModalOpen(false)} style={{ marginTop: 20 }}>
                                <Text style={[LoginStyle.loginLinks, { color: '#992A46', textDecorationLine: 'none' }]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </ImageBackground>
    )
}