import { StyleSheet } from 'react-native';
import { useEffect } from 'react';
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
import BookingInvoice from './screens/client/BookingInvoice';
import PassportGuidance from './screens/client/PassportGuidance';
import VisaGuidance from './screens/client/VisaGuidance';
import UserQuotations from './screens/client/UserQuotations';
import UserQuotationRequest from './screens/client/UserQuotationRequest';
import QuotationCheckout from './screens/client/QuotationCheckout';

import AdminDashboard from './screens/admin/AdminDashboard';
import UserManagement from './screens/admin/UserManagement';
import BookingManagement from './screens/admin/BookingManagement';
import TransactionManagement from './screens/admin/TransactionManagement';
import PackageManagement from './screens/admin/PackageManagement';
import ReviewManagement from './screens/admin/ReviewManagement';
import CancellationRequests from './screens/admin/CancellationRequests';
import PassportApplications from './screens/admin/PassportApplications';
import PassportApplicationView from './screens/admin/PassportApplicationView'; //not checked yet
import VisaApplications from './screens/admin/VisaApplications';
import VisaApplicationView from './screens/admin/VisaApplicationView'; //not checked yet
import Logging from './screens/admin/Logging';
import Auditing from './screens/admin/Auditing';
import AddPackages from './screens/admin/AddPackages';
import QuotationManagement from './screens/admin/QuotationManagement';
import QuotationDetailsAdmin from './screens/admin/QuotationDetailsAdmin';
import { UserProvider, useUser } from './context/UserContext';


const normalizeRole = (role) => {
  const normalized = String(role || '').trim().toLowerCase();
  if (normalized === 'user') return 'users';
  return normalized;
};

const resolveInitialRoute = (isUsers) => {
  if (typeof window === 'undefined') return 'login';
  if (!isUsers) return 'login';

  const pathname = String(window.location.pathname || '').toLowerCase();
  const search = new URLSearchParams(window.location.search || '');
  const bookingStatus = search.get('booking') || '';

  if (!bookingStatus) return 'login';
  if (pathname.includes('/packagedetails')) return 'packagedetails';
  if (pathname.includes('/quotationcheckout')) return 'quotationcheckout';
  return 'login';
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

  const initialRouteName = resolveInitialRoute(isUsers);

  const MyScreen = createNativeStackNavigator()

  return (
    <NavigationContainer>
      
      <MyScreen.Navigator initialRouteName={"passportapplications"} screenOptions={{ headerShown: false }}>


      <MyScreen.Screen name="login" component={Login} options={{ headerShown: false }} />
      <MyScreen.Screen name="signup" component={Signup} options={{ headerShown: false }} />

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
        <MyScreen.Screen name="addpackages" component={AddPackages} options={{ headerShown: false }} />
      {isUsers && (
        <>
          <MyScreen.Screen name="profile" component={Profile} options={{ headerShown: false }} />
          <MyScreen.Screen name="home" component={Home} options={{ headerShown: false }} />
          <MyScreen.Screen name="packages" component={Packages} options={{ headerShown: false }} />
          <MyScreen.Screen name="packagedetails" component={PackageDetails} options={{ headerShown: false }} />
          <MyScreen.Screen name="wishlist" component={Wishlist} options={{ headerShown: false }} />
          <MyScreen.Screen name="usertransactions" component={UserTransactions} options={{ headerShown: false }} />
          <MyScreen.Screen name="bookinginvoice" component={BookingInvoice} options={{ headerShown: false }} />
          <MyScreen.Screen name="userbookings" component={UserBookings} options={{ headerShown: false }} />
          <MyScreen.Screen name="userquotations" component={UserQuotations} options={{ headerShown: false }} />
          <MyScreen.Screen name="userquotationrequest" component={UserQuotationRequest} options={{ headerShown: false }} />
          <MyScreen.Screen name="quotationcheckout" component={QuotationCheckout} options={{ headerShown: false }} />
          <MyScreen.Screen name="passportguidance" component={PassportGuidance} options={{ headerShown: false }} />
          <MyScreen.Screen name="visaguidance" component={VisaGuidance} options={{ headerShown: false }} />
        </>
      )}

      {isAdmin && (
        <>
          <MyScreen.Screen name="bookinginvoice" component={BookingInvoice} options={{ headerShown: false }} />
          <MyScreen.Screen name="admindashboard" component={AdminDashboard} options={{ headerShown: false }} />
          <MyScreen.Screen name="usermanagement" component={UserManagement} options={{ headerShown: false }} />
          <MyScreen.Screen name="bookingmanagement" component={BookingManagement} options={{ headerShown: false }} />
          <MyScreen.Screen name="transactionmanagement" component={TransactionManagement} options={{ headerShown: false }} />
          <MyScreen.Screen name="packagemanagement" component={PackageManagement} options={{ headerShown: false }} />
          <MyScreen.Screen name="reviewmanagement" component={ReviewManagement} options={{ headerShown: false }} />
          <MyScreen.Screen name="quotationmanagement" component={QuotationManagement} options={{ headerShown: false }} />
          <MyScreen.Screen name="quotationdetailsadmin" component={QuotationDetailsAdmin} options={{ headerShown: false }} />
          <MyScreen.Screen name="cancellationrequests" component={CancellationRequests} options={{ headerShown: false }} />
          <MyScreen.Screen name="passportapplications" component={PassportApplications} options={{ headerShown: false }} />
          <MyScreen.Screen name="passportapplicationview" component={PassportApplicationView} options={{ headerShown: false }} /> {/*not checked yet */}
          <MyScreen.Screen name="visaapplications" component={VisaApplications} options={{ headerShown: false }} />
          <MyScreen.Screen name="visaapplicationview" component={VisaApplicationView} options={{ headerShown: false }} /> {/*not checked yet */}
          <MyScreen.Screen name="logging" component={Logging} options={{ headerShown: false }} />
          <MyScreen.Screen name="auditing" component={Auditing} options={{ headerShown: false }} />
        </>
      )}


      </MyScreen.Navigator>
    </NavigationContainer >
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
