import React, { useEffect } from 'react';
import { View, Image, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SplashScreenStyle from '../../styles/clientstyles/SplashScreenStyle';

export default function SplashScreen() {
    const navigation = useNavigation();

    useEffect(() => {
        
        const timer = setTimeout(() => {
            navigation.replace('login');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={SplashScreenStyle.container}>
            <Image 
                source={require('../../assets/images/splashlogo.png')} 
                style={SplashScreenStyle.logo} 
            />
            <Text style={SplashScreenStyle.footerText}>By TRAVEX</Text>
        </View>
    );
}