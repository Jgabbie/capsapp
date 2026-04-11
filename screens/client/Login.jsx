import { View, Text, TextInput, TouchableOpacity, ImageBackground, ToastAndroid, Alert, Platform, ActivityIndicator, Modal } from 'react-native'
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
        if (normalized === "user") return "users"
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
                const canonicalRole = normalizedRole === "admin" ? "Admin" : "Users"

                if (normalizedRole !== "admin" && normalizedRole !== "users") {
                    setError("Unauthorized role. Only Users or Admin can sign in.")
                    return
                }

                setUser({
                    _id: response.data.userId,
                    username: response.data.username,
                    role: canonicalRole,
                })

                showMessage("Login successful!");
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
            <Text style={LoginStyle.loginHeading}>Welcome</Text>
            <Text style={LoginStyle.loginSecondHeading}>Login Here</Text>

            <View style={LoginStyle.inputWrapper}>
                <Text style={LoginStyle.loginLabel}>Username</Text>
                <TextInput 
                    style={LoginStyle.loginInputs} 
                    onChangeText={(e) => { 
                        setUsername(e);
                        setError(""); 
                    }}
                    value={getUsername}
                />
            </View>

            <View style={LoginStyle.inputWrapper}>
                <Text style={LoginStyle.loginLabel}>Password</Text>
                <View style={LoginStyle.passwordContainer}>
                    <TextInput 
                        style={LoginStyle.passwordInput} 
                        onChangeText={(e) => { 
                            setPassword(e);
                            setError(""); 
                        }} 
                        secureTextEntry={!showPassword}
                        value={getPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={LoginStyle.eyeIcon}>
                        <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#6d6d6d" />
                    </TouchableOpacity>
                </View>
            </View>

            {getError ? (
                <View style={LoginStyle.inputWrapper}>
                    <Text style={LoginStyle.errorMessage}>{getError}</Text>
                </View>
            ) : null}

            <View style={LoginStyle.loginLinksContainer}>
                <TouchableOpacity onPress={() => { cs.navigate("signup") }}>
                    <Text style={LoginStyle.loginLinks}>Signup here</Text>
                </TouchableOpacity>
                
                <Text style={LoginStyle.loginLinksDivider}>|</Text>
                
                <TouchableOpacity onPress={() => { cs.navigate("resetpassword") }}>
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
                        {errorOtp ? <Text style={[LoginStyle.errorMessage, { marginLeft: 0, textAlign: 'center' }]}>{errorOtp}</Text> : null}

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
        </ImageBackground>
    )
}