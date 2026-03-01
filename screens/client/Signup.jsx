import { View, Text, TextInput, TouchableOpacity, Modal, ImageBackground, ToastAndroid } from 'react-native'
import React, { useContext, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import SignupStyle from '../../styles/clientstyles/SignupStyle'
import axios from 'axios'


export default function Signup() {

    const cs = useNavigation()

    const [modalVisible, setModalVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [getError, setError] = useState("")

    const [user, setUser] = useState({
        username: "",
        firstname: "",
        lastname: "",
        email: "",
        phonenum: "",
        password: "",
        confirmpassword: "",
    })

    const changeHandler = (textField, value) => {
        setUser({ ...user, [textField]: value })
    }

    const handleSignup = async () => {
        // Basic validation
        const { username, firstname, lastname, email, phonenum, password, confirmpassword } = user
        if (!username || !firstname || !lastname || !email || !phonenum || !password || !confirmpassword) {
            setError("Fill up all fields")
            return
        }
        if (password !== confirmpassword) {
            setError("Password and Confirm Password do not match")
            return
        }

        setError("")
        setLoading(true)

        try {
            const response = await axios.post('http://10.0.2.2:5000/api/create-user', { //http://localhost/api/create-user
                username,
                firstname,
                lastname,
                email,
                phonenum,
                password
            })

            if (response.data.success) {
                ToastAndroid.show("Account created successfully!", ToastAndroid.SHORT)
                cs.navigate("login")
            } else {
                setError(response.data.message || "Signup failed")
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ImageBackground
            source={require("../../assets/images/login_background.png")}
            style={SignupStyle.container}
            resizeMode='cover'
        >
            <View>
                <Text style={SignupStyle.signupHeading}>Welcome</Text>
                <Text style={SignupStyle.signupSecondHeading}>Create an Account</Text>

                <Text style={SignupStyle.signupLabel}>Username</Text>
                <TextInput maxLength={30} style={SignupStyle.signupInputs} onChangeText={(e) => { changeHandler("username", e) }}></TextInput>

                <View style={SignupStyle.fullNameContainer}>
                    <View>
                        <Text style={SignupStyle.signupLabel} >First Name</Text>
                        <TextInput maxLength={20} style={SignupStyle.nameInputs} onChangeText={(e) => { changeHandler("firstname", e) }}></TextInput>
                    </View>

                    <View>
                        <Text style={SignupStyle.signupLabel}>Last Name</Text>
                        <TextInput maxLength={20} style={SignupStyle.nameInputs} onChangeText={(e) => { changeHandler("lastname", e) }}></TextInput>
                    </View>
                </View>

                <Text style={SignupStyle.signupLabel}>Email</Text>
                <TextInput maxLength={30} style={SignupStyle.signupInputs} onChangeText={(e) => { changeHandler("email", e) }}></TextInput>

                <Text style={SignupStyle.signupLabel}>Phone Number</Text>
                <TextInput maxLength={11} style={SignupStyle.signupInputs} onChangeText={(e) => { changeHandler("phonenum", e) }}></TextInput>

                <Text style={SignupStyle.signupLabel}>Password</Text>
                <TextInput maxLength={20} style={SignupStyle.signupInputs} secureTextEntry={true} onChangeText={(e) => { changeHandler("password", e) }}></TextInput>

                <Text style={SignupStyle.signupLabel}>Confirm Password</Text>
                <TextInput maxLength={20} style={SignupStyle.signupInputs} secureTextEntry={true} onChangeText={(e) => { changeHandler("confirmpassword", e) }}></TextInput>

                <Text style={SignupStyle.errorMessage}>{getError}</Text>

                <View style={SignupStyle.signupLinksContainer}>
                    <Text onPress={() => { cs.navigate("login") }} style={SignupStyle.signupLinks}>Already have an account? Login here</Text>
                </View>


                <TouchableOpacity style={SignupStyle.signupButton} onPress={handleSignup}>
                    <Text style={SignupStyle.signupButtonText} >Signup</Text>
                </TouchableOpacity>

                {/* <Modal
                    transparent
                    animationType='fade'
                    visible={modalVisible}
                    onRequestClose={() => { setModalVisible }}
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
                </Modal> */}
            </View>
        </ImageBackground>

    )
}
