import { View, Text, TextInput, TouchableOpacity, ImageBackground, ToastAndroid, Alert, Platform } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useFonts } from '@expo-google-fonts/montserrat'
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import LoginStyle from '../../styles/clientstyles/LoginStyle'
import axios from 'axios'

export default function Login() {

    const cs = useNavigation()

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

    const showMessage = (message) => {
        if (Platform.OS === "android") {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert(message);
        }
    }

    const handleLogin = async () => {
        if (!getUsername || !getPassword) {
            setError("Fill in both fields");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const response = await axios.post('http://10.0.2.2:5000/api/login-user', { // Android emulator http://10.0.2.2:5000/api/get-user
                username: getUsername,
                password: getPassword
            });

            if (response.data.success) {
                showMessage("Login successful!");
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

                <TouchableOpacity style={LoginStyle.loginButton} onPress={handleLogin}>
                    <Text style={LoginStyle.loginButtonText}>Login</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>

    )
}