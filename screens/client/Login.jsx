import { View, Text, TextInput, TouchableOpacity, ImageBackground, ToastAndroid, Alert, Platform, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import LoginStyle from '../../styles/clientstyles/LoginStyle'
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
            const response = await api.post('/login-user', {
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

                if (Platform.OS === "web" && typeof window !== "undefined") {
                    const pathname = String(window.location.pathname || "").toLowerCase()
                    const search = new URLSearchParams(window.location.search || "")
                    const bookingStatus = search.get("booking") || ""

                    if (bookingStatus && pathname.includes("/packagedetails")) {
                        cs.navigate("packagedetails")
                        return
                    }

                    if (bookingStatus && pathname.includes("/quotationcheckout")) {
                        cs.navigate("quotationcheckout")
                        return
                    }
                }

            } else {
                setError(response.data.message || "Invalid username or password");
            }

        } catch (err) {
            setError(err.response?.data?.message || err.message || "Network error");
        } finally {
            setLoading(false);
        }
    }


    return (
        <ImageBackground
            source={require("../../assets/images/login_background.png")}
            style={LoginStyle.container}
            resizeMode='cover'
        >
            <View>
                <Text style={LoginStyle.loginHeading}>Welcome</Text>
                <Text style={LoginStyle.loginSecondHeading}>Login Here</Text>

                <Text style={LoginStyle.loginLabel}>Username</Text>
                <TextInput style={LoginStyle.loginInputs} onChangeText={(e) => { setUsername(e) }}></TextInput>

                <Text style={LoginStyle.loginLabel}>Password</Text>
                <TextInput style={LoginStyle.loginInputs} onChangeText={(e) => { setPassword(e) }} secureTextEntry={true}></TextInput>

                <Text style={LoginStyle.errorMessage}>{getError}</Text>

                <View style={LoginStyle.loginLinksContainer}>
                    <Text onPress={() => { cs.navigate("signup") }} style={LoginStyle.loginLinks}>Don't have an account? Signup here</Text>
                    <Text onPress={() => { cs.navigate("resetpassword") }} style={LoginStyle.loginLinks}>Forgot your password?</Text>
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
            </View>
        </ImageBackground>

    )
}