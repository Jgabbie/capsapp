import { View, Text, TextInput, TouchableOpacity, ImageBackground, Modal, ActivityIndicator, ToastAndroid, Platform, Image } from 'react-native'
import React, { useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import { Ionicons } from '@expo/vector-icons' // 🔥 ADDED: Icon library

import ResetPassConfirmStyle from '../../styles/clientstyles/ResetPassConfirmStyle'
import ModalStyle from '../../styles/componentstyles/ModalStyle'
import { api } from '../../utils/api' 

export default function ResetPassConfirm() {
    const cs = useNavigation()
    const route = useRoute() 
    
    const { token } = route.params || {};

    const [fontsLoaded] = useFonts({
        Montserrat_700Bold,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold
    })

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [errorPassword, setErrorPassword] = useState("")
    const [errorConfirm, setErrorConfirm] = useState("")
    
    // 🔥 NEW: States to track password visibility
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [loading, setLoading] = useState(false)
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

    if (!fontsLoaded) return null;

    const showMessage = (message) => {
        if (Platform.OS === "android") {
            ToastAndroid.show(message, ToastAndroid.LONG);
        } else {
            alert(message); 
        }
    }

    const validatePassword = (val) => {
        if (!val) return "Password is required.";
        if (val.length < 8) return "Must be at least 8 characters.";
        if (!/[A-Z]/.test(val)) return "Must contain 1 uppercase letter.";
        if (!/[0-9]/.test(val)) return "Must contain 1 number.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(val)) return "Must contain 1 special character.";
        return "";
    }

    const validateConfirm = (val) => {
        if (!val) return "Confirm Password is required.";
        if (val !== password) return "Passwords do not match.";
        return "";
    }

    const handleSubmit = async () => {
        const passErr = validatePassword(password)
        const confErr = validateConfirm(confirmPassword)
        
        setErrorPassword(passErr)
        setErrorConfirm(confErr)

        if (passErr || confErr) return;

        setLoading(true)
        try {
            const response = await api.post('/users/auth/reset-password', { 
                newPassword: password, 
                token: token 
            })
            if (response.data.success || response.status === 200) {
                setIsSuccessModalOpen(true)
            }
        } catch (err) {
            showMessage(err.response?.data?.message || "Failed to reset password")
        } finally {
            setLoading(false)
        }
    }

    return (
        <ImageBackground
            source={require("../../assets/images/Forgot BG Mobile.png")}
            style={ResetPassConfirmStyle.container}
            resizeMode='cover'
        >
            <View style={ResetPassConfirmStyle.container}>
                
                {/* 🔥 1. NEW LOGO: Placed exactly on top of the title */}
                <Text style={ResetPassConfirmStyle.heading}>Set New Password</Text>

                <Text style={ResetPassConfirmStyle.label}>New Password</Text>
                <View style={ResetPassConfirmStyle.passwordContainer}>
                    <TextInput
                        style={[ResetPassConfirmStyle.input, errorPassword ? ResetPassConfirmStyle.inputErrorBorder : null]}
                        placeholder="Enter new password"
                        secureTextEntry={!showPassword}
                        maxLength={20}
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text)
                            setErrorPassword("")
                        }}
                    />
                    {/* 🔥 2. CONDITIONAL EYE ICON */}
                    {password.length > 0 && (
                        <TouchableOpacity style={ResetPassConfirmStyle.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
                {/* 🔥 3. FIXED ERROR CONTAINER */}
                <View style={ResetPassConfirmStyle.errorContainer}>
                    {errorPassword ? <Text style={ResetPassConfirmStyle.fieldError}>{errorPassword}</Text> : null}
                </View>

                <Text style={ResetPassConfirmStyle.label}>Confirm Password</Text>
                <View style={ResetPassConfirmStyle.passwordContainer}>
                    <TextInput
                        style={[ResetPassConfirmStyle.input, errorConfirm ? ResetPassConfirmStyle.inputErrorBorder : null]}
                        placeholder="Confirm new password"
                        secureTextEntry={!showConfirmPassword}
                        maxLength={20}
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text)
                            setErrorConfirm("")
                        }}
                    />
                    {/* 🔥 CONDITIONAL EYE ICON */}
                    {confirmPassword.length > 0 && (
                        <TouchableOpacity style={ResetPassConfirmStyle.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={22} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
                {/* 🔥 FIXED ERROR CONTAINER */}
                <View style={ResetPassConfirmStyle.errorContainer}>
                    {errorConfirm ? <Text style={ResetPassConfirmStyle.fieldError}>{errorConfirm}</Text> : null}
                </View>

                {/* 🔥 4. REMEMBER PASSWORD LINK (On top of Confirm Button) */}
                <View style={ResetPassConfirmStyle.linkContainer}>
                    <TouchableOpacity onPress={() => cs.navigate("login")}>
                        <Text style={ResetPassConfirmStyle.linkText}>Remember password? Login here</Text>
                    </TouchableOpacity>
                </View>

                {/* Confirm Password Button */}
                <TouchableOpacity 
                    style={[ResetPassConfirmStyle.button, { opacity: loading ? 0.7 : 1 }]} 
                    onPress={handleSubmit} 
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={ResetPassConfirmStyle.buttonText}>Confirm Password</Text>}
                </TouchableOpacity>

                {/* 🔥 LOGO AT BOTTOM */}
                <Image 
                    source={require('../../assets/images/TransLogo.png')} 
                    style={ResetPassConfirmStyle.bottomLogo} 
                    resizeMode="contain" 
                />

            </View>

            {/* Success Modal */}
            <Modal transparent animationType='fade' visible={isSuccessModalOpen}>
                <View style={ModalStyle.modalOverlay}>
                    <View style={ModalStyle.modalBox}>
                        <Text style={ModalStyle.modalTitle}>Password Changed</Text>
                        <Text style={[ModalStyle.modalText, { marginBottom: 20 }]}>Your password has been updated successfully.</Text>

                        <TouchableOpacity 
                            style={ModalStyle.modalButton} 
                            onPress={() => {
                                setIsSuccessModalOpen(false)
                                cs.navigate("login")
                            }}
                        >
                            <Text style={ModalStyle.modalButtonText}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    )
}