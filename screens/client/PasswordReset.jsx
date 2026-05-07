import { View, Text, TextInput, TouchableOpacity, ImageBackground, Modal, ActivityIndicator, ToastAndroid, Image, BackHandler } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import PasswordResetStyle from '../../styles/clientstyles/PasswordResetStyle'
import ModalStyle from '../../styles/componentstyles/ModalStyle'

import { api } from '../../utils/api' 

export default function PasswordReset() {
    const cs = useNavigation()

    const [fontsLoaded] = useFonts({
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })

    const [email, setEmail] = useState("")
    const [errorEmail, setErrorEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [otp, setOtp] = useState("")
    const [errorOtp, setErrorOtp] = useState("")
    const [timer, setTimer] = useState(0)

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => true

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress)
            return () => subscription.remove()
        }, [])
    )

    useEffect(() => {
        let interval = null
        if (timer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000)
        }
        return () => clearInterval(interval)
    }, [timer])

    if (!fontsLoaded) return null;

    const validateEmail = (val) => {
        if (!val) return "Email is required.";
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) return "Invalid email address.";
        return "";
    }

    const handleSendOTP = async () => {
        const error = validateEmail(email)
        setErrorEmail(error)
        if (error) return;

        setLoading(true)
        try {
            await api.post('/users/auth/send-reset-otp', { email })
            setTimer(60)
            setIsModalOpen(true)
        } catch (err) {
            setErrorEmail(err.response?.data?.message || "Failed to send OTP")
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            setErrorOtp("OTP must be 6 digits.");
            return;
        }

        setLoading(true)
        try {
            const response = await api.post('/users/auth/check-reset-otp', { email, otp })
            if (response.data.success || response.status === 200) {
                setIsModalOpen(false)
                cs.navigate("resetpassconfirm", { email: email, token: response.data.resetToken })
            }
        } catch (err) {
            setErrorOtp(err.response?.data?.message || "Invalid OTP")
        } finally {
            setLoading(false)
        }
    }

    const resendOTP = async () => {
        try {
            await api.post('/users/auth/send-reset-otp', { email })
            ToastAndroid.show("OTP Sent!", ToastAndroid.SHORT)
            setTimer(60)
        } catch (err) {
            ToastAndroid.show("Failed to resend OTP", ToastAndroid.SHORT)
        }
    }

    return (
        <ImageBackground
            source={require("../../assets/images/Forgot BG Mobile.png")}
            style={PasswordResetStyle.container}
            resizeMode='cover'
        >
            <View style={PasswordResetStyle.container}>
                
                <Text style={PasswordResetStyle.heading}>Reset Password</Text>
                <Text style={PasswordResetStyle.subHeading}>Enter your email to receive a One-Time Password</Text>

                <Text style={PasswordResetStyle.label}>Email Address</Text>
                <TextInput
                    style={[PasswordResetStyle.input, errorEmail && PasswordResetStyle.inputErrorBorder]}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text)
                        setErrorEmail("")
                    }}
                />
                
                {/* 🔥 WRAPPED IN ERROR CONTAINER */}
                <View style={PasswordResetStyle.errorContainer}>
                    {errorEmail ? <Text style={PasswordResetStyle.fieldError}>{errorEmail}</Text> : null}
                </View>

                {/* 🔥 2. MOVED LINK TEXT: Now sitting perfectly on top of the Send OTP button */}
                <View style={[PasswordResetStyle.linksContainer, { marginTop: 5, marginBottom: 15 }]}>
                    <TouchableOpacity onPress={() => cs.navigate("login")}>
                        <Text style={PasswordResetStyle.linkText}>Remember password? Login</Text>
                    </TouchableOpacity>
                </View>

                {/* Send OTP Button */}
                <TouchableOpacity style={PasswordResetStyle.button} onPress={handleSendOTP} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={PasswordResetStyle.buttonText}>Send OTP</Text>}
                </TouchableOpacity>

                {/* 🔥 LOGO AT BOTTOM */}
                <Image 
                    source={require('../../assets/images/TransLogo.png')} 
                    style={PasswordResetStyle.bottomLogo} 
                    resizeMode="contain" 
                />

            </View>

            {/* OTP Verification Modal */}
            <Modal transparent animationType='fade' visible={isModalOpen}>
                <View style={ModalStyle.modalOverlay}>
                    <View style={ModalStyle.modalBox}>
                        <Text style={ModalStyle.modalTitle}>Verify OTP</Text>
                        <Text style={[ModalStyle.modalText, { marginBottom: 15 }]}>We sent a code to your email.</Text>

                        <TextInput
                            style={PasswordResetStyle.otpInput}
                            keyboardType="numeric"
                            maxLength={6}
                            value={otp}
                            onChangeText={(val) => {
                                setOtp(val.replace(/[^0-9]/g, ''))
                                setErrorOtp("")
                            }}
                        />
                        {errorOtp ? <Text style={[PasswordResetStyle.fieldError, { marginLeft: 0, textAlign: 'center' }]}>{errorOtp}</Text> : null}

                        <TouchableOpacity style={[ModalStyle.modalButton, { width: 200 }]} onPress={handleVerifyOTP} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={ModalStyle.modalButtonText}>Submit</Text>}
                        </TouchableOpacity>

                        {timer > 0 ? (
                            <Text style={PasswordResetStyle.timerText}>Wait for <Text style={PasswordResetStyle.timerHighlight}>{timer}</Text> sec to resend</Text>
                        ) : (
                            <TouchableOpacity onPress={resendOTP} style={{ marginTop: 15 }}>
                                <Text style={PasswordResetStyle.linkText}>Didn't get the code? Click here</Text>
                            </TouchableOpacity>
                        )}

                         <TouchableOpacity onPress={() => setIsModalOpen(false)} style={{ marginTop: 20 }}>
                                <Text style={[PasswordResetStyle.linkText, { color: '#992A46' }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    )
}