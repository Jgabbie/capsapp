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
import UserPreference from './screens/client/UserPreference';
import Packages from './screens/client/Packages';
import PackageDetails from './screens/client/PackageDetails';
import Wishlist from './screens/client/Wishlist';
import UserBookings from './screens/client/UserBookings';
import UserTransactions from './screens/client/UserTransactions';
import BookingInvoice from './screens/client/BookingInvoice';
import UserApplications from './screens/client/UserApplications';

// 🔥 RESTORED QUOTATION IMPORTS
import UserPackageQuotation from './screens/client/UserPackageQuotation';
import UserQuotationRequest from './screens/client/UserQuotationRequest';
import QuotationCheckout from './screens/client/QuotationCheckout';
import QuotationForm from './screens/client/QuotationForm';

import PassportGuidance from './screens/client/PassportGuidance';
import PassportGuidanceNew from './screens/client/PassportGuidanceNew';
import PassportGuidanceReNew from './screens/client/PassportGuidanceReNew';
import PassportProgress from './screens/client/PassportProgress';

import VisaGuidance from './screens/client/VisaGuidance';
import VisaDetailsGuidance from './screens/client/VisaDetailsGuidance';
import VisaProgress from './screens/client/VisaProgress';

import PaymentMethod from './screens/client/PaymentMethod';
import PaymentMode from './screens/client/PaymentMode';
import PaymentSuccess from './screens/client/PaymentSuccess';

import SuccessfulPaymentPassport from './screens/client/SuccessfulPaymentPassport';
import SuccessfulPaymentVisa from './screens/client/SuccessfulPaymentVisa';

import AboutUs from './screens/client/AboutUs';
import FAQs from './screens/client/FAQs';

import { UserProvider, useUser } from './context/UserContext';

const MyScreen = createNativeStackNavigator();

const prefix = Linking.createURL('/');

function AppNavigator() {
  const { user, loading } = useUser();

  const linking = {
    prefixes: [prefix, 'capsapp://'],
    config: {
      screens: {
        resetpassconfirm: 'resetpassconfirm',
        paymentmethod: 'paymentmethod',
        paymentsuccess: 'paymentsuccess',
        successfulpaymentpassport: 'successfulpaymentpassport',
        successfulpaymentvisa: 'successfulpaymentvisa',
        home: 'home',
      },
    },
  };

  if (loading) {
    return null; 
  }

  return (
    <NavigationContainer linking={linking}>
      <MyScreen.Navigator screenOptions={{ headerShown: false }}>
        
        {!user ? (
          <>
            <MyScreen.Screen name="splash" component={SplashScreen} />
            <MyScreen.Screen name="login" component={Login} />
            <MyScreen.Screen name="signup" component={Signup} />
            <MyScreen.Screen name="passwordreset" component={PasswordReset} />
            <MyScreen.Screen name="resetpassconfirm" component={ResetPassConfirm} />
          </>
        ) : (
          <>
            <MyScreen.Screen name="home" component={Home} />
            <MyScreen.Screen name="profile" component={Profile} />
            <MyScreen.Screen name="userpreference" component={UserPreference} />
            <MyScreen.Screen name="packages" component={Packages} />
            <MyScreen.Screen name="packagedetails" component={PackageDetails} />
            <MyScreen.Screen name="wishlist" component={Wishlist} />
            
            <MyScreen.Screen name="userbookings" component={UserBookings} />
            <MyScreen.Screen name="usertransactions" component={UserTransactions} />
            <MyScreen.Screen name="bookinginvoice" component={BookingInvoice} />
            <MyScreen.Screen name="userapplications" component={UserApplications} />

            {/* 🔥 RESTORED QUOTATION SCREENS */}
            <MyScreen.Screen name="userquotations" component={UserPackageQuotation} />
            <MyScreen.Screen name="userquotationrequest" component={UserQuotationRequest} />
            <MyScreen.Screen name="quotationcheckout" component={QuotationCheckout} />
            <MyScreen.Screen name="quotationform" component={QuotationForm} />
            
            <MyScreen.Screen name="paymentmethod" component={PaymentMethod} />
            <MyScreen.Screen name="paymentmode" component={PaymentMode} />
            <MyScreen.Screen name="paymentsuccess" component={PaymentSuccess} />
            <MyScreen.Screen name="successfulpaymentpassport" component={SuccessfulPaymentPassport} />
            <MyScreen.Screen name="successfulpaymentvisa" component={SuccessfulPaymentVisa} />

            <MyScreen.Screen name="passportguidance" component={PassportGuidance} />
            <MyScreen.Screen name="passportguidancenew" component={PassportGuidanceNew} />
            <MyScreen.Screen name="passportguidancerenew" component={PassportGuidanceReNew} />
            <MyScreen.Screen name="passportprogress" component={PassportProgress} />
            <MyScreen.Screen name="visaguidance" component={VisaGuidance} />
            <MyScreen.Screen name="visadetailsguidance" component={VisaDetailsGuidance} />
            <MyScreen.Screen name="visaprogress" component={VisaProgress} />
            
            <MyScreen.Screen name="aboutus" component={AboutUs} />
            <MyScreen.Screen name="faqs" component={FAQs} />
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