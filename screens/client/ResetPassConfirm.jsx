import { View, Text, TextInput, TouchableOpacity, ImageBackground, Modal, ActivityIndicator, ToastAndroid } from 'react-native'
import React, { useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import ResetPassConfirmStyle from '../../styles/clientstyles/ResetPassConfirmStyle'
import ModalStyle from '../../styles/componentstyles/ModalStyle'
import axios from 'axios'

export default function ResetPassConfirm() {
    const cs = useNavigation()
    const route = useRoute() 
    
    // Catch the token passed from the PasswordReset screen
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
    
    const [loading, setLoading] = useState(false)
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

    if (!fontsLoaded) return null;

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
            const response = await axios.post('http://10.0.2.2:5000/api/auth/reset-password', { 
                newPassword: password, 
                token: token 
            })
            if (response.data.success || response.status === 200) {
                setIsSuccessModalOpen(true)
            }
        } catch (err) {
            ToastAndroid.show(err.response?.data?.message || "Failed to reset password", ToastAndroid.LONG)
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
                <TextInput
                    style={[ResetPassConfirmStyle.input, errorPassword && ResetPassConfirmStyle.inputErrorBorder]}
                    secureTextEntry={true}
                    maxLength={20}
                    value={password}
                    onChangeText={(val) => {
                        setPassword(val)
                        setErrorPassword(validatePassword(val))
                    }}
                />
                {errorPassword ? <Text style={ResetPassConfirmStyle.fieldError}>{errorPassword}</Text> : null}

                <Text style={ResetPassConfirmStyle.label}>Confirm Password</Text>
                <TextInput
                    style={[ResetPassConfirmStyle.input, errorConfirm && ResetPassConfirmStyle.inputErrorBorder]}
                    secureTextEntry={true}
                    maxLength={20}
                    value={confirmPassword}
                    onChangeText={(val) => {
                        setConfirmPassword(val)
                        // Immediate match check
                        if (val !== password) setErrorConfirm("Passwords do not match.")
                        else setErrorConfirm("")
                    }}
                />
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