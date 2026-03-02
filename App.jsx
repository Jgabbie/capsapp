import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import Signup from './screens/client/Signup';
import Login from './screens/client/Login';
import Home from './screens/client/Home';
import Profile from './screens/client/Profile';
import Packages from './screens/client/Packages';
import PackageDetails from './screens/client/PackageDetails';
import Wishlist from './screens/client/Wishlist';
import UserBookings from './screens/client/UserBookings';
import UserTransactions from './screens/client/UserTransactions';
import PassportGuidance from './screens/client/PassportGuidance';
import VisaGuidance from './screens/client/VisaGuidance';

import AdminDashboard from './screens/admin/AdminDashboard';
import UserManagement from './screens/admin/UserManagement';
import BookingManagement from './screens/admin/BookingManagement';
import TransactionManagement from './screens/admin/TransactionManagement';
import PackageManagement from './screens/admin/PackageManagement';
import ReviewManagement from './screens/admin/ReviewManagement';
import CancellationRequests from './screens/admin/CancellationRequests';
import PassportApplications from './screens/admin/PassportApplications';
import VisaApplications from './screens/admin/VisaApplications';
import Logging from './screens/admin/Logging';
import Auditing from './screens/admin/Auditing';


export default function App() {

  const MyScreen = createNativeStackNavigator()

  return (
    <NavigationContainer>
      <MyScreen.Navigator initialRouteName='reviewmanagement' screenOptions={{ headerShown: false }}>


        <MyScreen.Screen name="login" component={Login} options={{ headerShown: false }} />
        <MyScreen.Screen name="signup" component={Signup} options={{ headerShown: false }} />
        <MyScreen.Screen name="profile" component={Profile} options={{ headerShown: false }} />
        <MyScreen.Screen name="home" component={Home} options={{ headerShown: false }} />
        <MyScreen.Screen name="packages" component={Packages} options={{ headerShown: false }} />
        <MyScreen.Screen name="packagedetails" component={PackageDetails} options={{ headerShown: false }} />
        <MyScreen.Screen name="wishlist" component={Wishlist} options={{ headerShown: false }} />
        <MyScreen.Screen name="usertransactions" component={UserTransactions} options={{ headerShown: false }} />
        <MyScreen.Screen name="userbookings" component={UserBookings} options={{ headerShown: false }} />
        <MyScreen.Screen name="passportguidance" component={PassportGuidance} options={{ headerShown: false }} />
        <MyScreen.Screen name="visaguidance" component={VisaGuidance} options={{ headerShown: false }} />

        <MyScreen.Screen name="admindashboard" component={AdminDashboard} options={{ headerShown: false }} />
        <MyScreen.Screen name="usermanagement" component={UserManagement} options={{ headerShown: false }} />
        <MyScreen.Screen name="bookingmanagement" component={BookingManagement} options={{ headerShown: false }} />
        <MyScreen.Screen name="transactionmanagement" component={TransactionManagement} options={{ headerShown: false }} />
        <MyScreen.Screen name="packagemanagement" component={PackageManagement} options={{ headerShown: false }} />
        <MyScreen.Screen name="reviewmanagement" component={ReviewManagement} options={{ headerShown: false }} />
        <MyScreen.Screen name="cancellationrequests" component={CancellationRequests} options={{ headerShown: false }} />
        <MyScreen.Screen name="passportapplications" component={PassportApplications} options={{ headerShown: false }} />
        <MyScreen.Screen name="visaapplications" component={VisaApplications} options={{ headerShown: false }} />
        <MyScreen.Screen name="logging" component={Logging} options={{ headerShown: false }} />
        <MyScreen.Screen name="auditing" component={Auditing} options={{ headerShown: false }} />


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
