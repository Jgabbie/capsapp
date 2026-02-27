import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Signup from './screens/Signup';
import Login from './screens/Login';

import UserManagement from './screens/admin/UserManagement';
import Packages from './screens/Packages';
import PackageDetails from './screens/PackageDetails';


export default function App() {

  const MyScreen = createNativeStackNavigator()

  return (
    <NavigationContainer>
      <MyScreen.Navigator initialRouteName='packagedetails'>
        <MyScreen.Screen name="login" component={Login} options={{ headerShown: false }} />
        <MyScreen.Screen name="signup" component={Signup} options={{ headerShown: false }} />


        <MyScreen.Screen name="usermanagement" component={UserManagement} options={{ headerShown: false }} />
        <MyScreen.Screen name="packages" component={Packages} options={{ headerShown: false }} />
      <MyScreen.Screen name="packagedetails" component={PackageDetails} options={{ headerShown: false }} /> 

      </MyScreen.Navigator>
    </NavigationContainer >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
