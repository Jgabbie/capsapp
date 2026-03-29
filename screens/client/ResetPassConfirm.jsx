import { View, Text, TextInput, TouchableOpacity, ImageBackground, Modal, ActivityIndicator, ToastAndroid, Platform } from 'react-native'
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
            <View>
                <Text style={ResetPassConfirmStyle.heading}>Set New Password</Text>

                <Text style={ResetPassConfirmStyle.label}>New Password</Text>
                {/* 🔥 NEW: Wrapper View for the Password Input */}
                <View style={ResetPassConfirmStyle.passwordContainer}>
                    <TextInput
                        style={[ResetPassConfirmStyle.input, errorPassword && ResetPassConfirmStyle.inputErrorBorder]}
                        secureTextEntry={!showPassword} // Toggle based on state
                        maxLength={20}
                        value={password}
                        onChangeText={(val) => {
                            setPassword(val)
                            setErrorPassword(validatePassword(val))
                        }}
                    />
                    <TouchableOpacity 
                        style={ResetPassConfirmStyle.eyeIcon} 
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Ionicons 
                            name={showPassword ? "eye-outline" : "eye-off-outline"} 
                            size={20} 
                            color="#6d6d6d" 
                        />
                    </TouchableOpacity>
                </View>
                {errorPassword ? <Text style={ResetPassConfirmStyle.fieldError}>{errorPassword}</Text> : null}


                <Text style={ResetPassConfirmStyle.label}>Confirm Password</Text>
                {/* 🔥 NEW: Wrapper View for the Confirm Password Input */}
                <View style={ResetPassConfirmStyle.passwordContainer}>
                    <TextInput
                        style={[ResetPassConfirmStyle.input, errorConfirm && ResetPassConfirmStyle.inputErrorBorder]}
                        secureTextEntry={!showConfirmPassword} // Toggle based on state
                        maxLength={20}
                        value={confirmPassword}
                        onChangeText={(val) => {
                            setConfirmPassword(val)
                            if (val !== password) setErrorConfirm("Passwords do not match.")
                            else setErrorConfirm("")
                        }}
                    />
                    <TouchableOpacity 
                        style={ResetPassConfirmStyle.eyeIcon} 
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        <Ionicons 
                            name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                            size={20} 
                            color="#6d6d6d" 
                        />
                    </TouchableOpacity>
                </View>
                {errorConfirm ? <Text style={ResetPassConfirmStyle.fieldError}>{errorConfirm}</Text> : null}


                <TouchableOpacity 
                    style={[ResetPassConfirmStyle.button, { opacity: loading ? 0.7 : 1 }]} 
                    onPress={handleSubmit} 
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={ResetPassConfirmStyle.buttonText}>Confirm Password</Text>}
                </TouchableOpacity>
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