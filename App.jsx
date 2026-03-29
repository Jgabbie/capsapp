import { StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import SplashScreen from './screens/client/SplashScreen';
import Signup from './screens/client/Signup';
import Login from './screens/client/Login';
import PasswordReset from './screens/client/PasswordReset';
import ResetPassConfirm from './screens/client/ResetPassConfirm';

import Home from './screens/client/Home';
import Profile from './screens/client/Profile';
import Packages from './screens/client/Packages';
import PackageDetails from './screens/client/PackageDetails';
import Wishlist from './screens/client/Wishlist';
import UserBookings from './screens/client/UserBookings';
import UserTransactions from './screens/client/UserTransactions';
import BookingInvoice from './screens/client/BookingInvoice';

import PassportGuidance from './screens/client/PassportGuidance';
import PassportGuidanceNew from './screens/client/PassportGuidanceNew';
import PassportGuidanceReNew from './screens/client/PassportGuidanceReNew';
import PassportProgress from './screens/client/PassportProgress';

import VisaGuidance from './screens/client/VisaGuidance';
import VisaDetailsGuidance from './screens/client/VisaDetailsGuidance';
import VisaProgress from './screens/client/VisaProgress';

import UserPackageQuotation from './screens/client/UserPackageQuotation';
import UserQuotationRequest from './screens/client/UserQuotationRequest';
import QuotationCheckout from './screens/client/QuotationCheckout';
import QuotationForm from './screens/client/QuotationForm';
import Notifications from './screens/client/Notifications';

// 🔥 ALL-IN PACKAGE FLOW IMPORTS 🔥
import QuotationAllIn from './screens/client/QuotationAllIn';
import BookingReview from './screens/client/BookingReview';
import BookingUploads from './screens/client/BookingUploads';
import RegistrationStep1 from './screens/client/RegistrationStep1';
import RegistrationStep2 from './screens/client/RegistrationStep2';
import RegistrationStep3 from './screens/client/RegistrationStep3';
import RegistrationStep4 from './screens/client/RegistrationStep4';

// 🔥 NEW PAYMENT FLOW IMPORTS 🔥
import PaymentMode from './screens/client/PaymentMode';
import PaymentMethod from './screens/client/PaymentMethod';
import PaymentSuccess from './screens/client/PaymentSuccess';

import AboutUs from './screens/client/AboutUs';

import { UserProvider, useUser } from './context/UserContext';

const normalizeRole = (role) => {
  const normalized = String(role || '').trim().toLowerCase();
  if (normalized === 'user') return 'users';
  return normalized;
};

function AppNavigator() {
  const { user, clearUser } = useUser();
  const role = normalizeRole(user?.role);
  const isAdmin = role === 'admin';
  const isUsers = role === 'users';

  useEffect(() => {
    if (user?._id && !isAdmin && !isUsers) {
      clearUser();
    }
  }, [user?._id, isAdmin, isUsers, clearUser]);

  const MyScreen = createNativeStackNavigator();

  // --- 🔗 DEEP LINKING CONFIGURATION 🔗 ---
  const prefix = Linking.createURL('/');
  
  const linking = {
    prefixes: [prefix, 'travex://'], 
    config: {
      screens: {
        login: 'login', 
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <MyScreen.Navigator screenOptions={{ headerShown: false }}>

        {!user?._id ? (
          // --- AUTHENTICATION STACK ---
          <>
            <MyScreen.Screen name="splash" component={SplashScreen} />
            <MyScreen.Screen name="login" component={Login} />
            <MyScreen.Screen name="signup" component={Signup} />
            <MyScreen.Screen name="resetpassword" component={PasswordReset} />
            <MyScreen.Screen name="resetpassconfirm" component={ResetPassConfirm} />
          </>
        ) : (
          // --- MAIN APP STACK ---
          <>
            <MyScreen.Screen name="home" component={Home} />
            <MyScreen.Screen name="profile" component={Profile} />
            <MyScreen.Screen name="packages" component={Packages} />
            <MyScreen.Screen name="packagedetails" component={PackageDetails} />
            <MyScreen.Screen name="wishlist" component={Wishlist} />
            <MyScreen.Screen name="usertransactions" component={UserTransactions} />
            <MyScreen.Screen name="bookinginvoice" component={BookingInvoice} />
            <MyScreen.Screen name="userbookings" component={UserBookings} />
            <MyScreen.Screen name="notifications" component={Notifications} />

            {/* --- 🔥 ALL-IN BOOKING FLOW 🔥 --- */}
            <MyScreen.Screen name="quotationallin" component={QuotationAllIn} />
            <MyScreen.Screen name="bookingreview" component={BookingReview} />
            <MyScreen.Screen name="bookinguploads" component={BookingUploads} />
            <MyScreen.Screen name="registrationstep1" component={RegistrationStep1} />
            <MyScreen.Screen name="registrationstep2" component={RegistrationStep2} />
            <MyScreen.Screen name="registrationstep3" component={RegistrationStep3} />
            <MyScreen.Screen name="registrationstep4" component={RegistrationStep4} />

            {/* --- 🔥 PAYMENT FLOW 🔥 --- */}
            <MyScreen.Screen name="paymentmode" component={PaymentMode} />
            <MyScreen.Screen name="paymentmethod" component={PaymentMethod} />
            <MyScreen.Screen name="paymentsuccess" component={PaymentSuccess} />

            {/* Quotation Screens (Private Tour) */}
            <MyScreen.Screen name="userquotations" component={UserPackageQuotation} />
            <MyScreen.Screen name="userquotationrequest" component={UserQuotationRequest} />
            <MyScreen.Screen name="quotationcheckout" component={QuotationCheckout} />
            <MyScreen.Screen name="quotationform" component={QuotationForm} />

            {/* Guidance Screens */}
            <MyScreen.Screen name="passportguidance" component={PassportGuidance} />
            <MyScreen.Screen name="passportguidancenew" component={PassportGuidanceNew} />
            <MyScreen.Screen name="passportguidancerenew" component={PassportGuidanceReNew} />
            <MyScreen.Screen name="passportprogress" component={PassportProgress} />
            <MyScreen.Screen name="visaguidance" component={VisaGuidance} />
            <MyScreen.Screen name="visadetailsguidance" component={VisaDetailsGuidance} />
            <MyScreen.Screen name="visaprogress" component={VisaProgress} />
            
            <MyScreen.Screen name="aboutus" component={AboutUs} />
          </>
        )}

      </MyScreen.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppNavigator />
    </UserProvider>
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