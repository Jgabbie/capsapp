import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import * as Notifications from "expo-notifications";

import {
    registerForPushNotifications,
} from "../utils/pushNotifications";

import {
    openNotificationScreen,
} from "../utils/notificationNavigation";

import {
    api,
    withUserHeader,
} from "../utils/api";

import { useUser } from "../context/UserContext";

export default function PushNotificationManager() {
    const { user } = useUser();
    const handledNotificationId = useRef(null);

    // useEffect(() => {
    //     Alert.alert(
    //         "Push Manager Mounted",
    //         JSON.stringify({
    //             hasUser: Boolean(user),
    //             userId: user?._id || user?.id || user?.userId || null,
    //         }, null, 2)
    //     );

    //     const userId =
    //         user?._id ||
    //         user?.id ||
    //         user?.userId;

    //     if (!userId) {
    //         return;
    //     }

    //     const registerToken = async () => {
    //         try {
    //             Alert.alert(
    //                 "Push Step 1",
    //                 "Starting push token registration"
    //             );

    //             const token =
    //                 await registerForPushNotifications();

    //             Alert.alert(
    //                 "Push Step 2",
    //                 token || "No Expo push token returned"
    //             );

    //             if (!token) {
    //                 return;
    //             }

    //             const response = await api.post(
    //                 "/notifications/push-token",
    //                 {
    //                     token,
    //                 },
    //                 withUserHeader(userId)
    //             );

    //             Alert.alert(
    //                 "Push Step 3",
    //                 JSON.stringify(response.data, null, 2)
    //             );
    //         } catch (error) {
    //             Alert.alert(
    //                 "Push Registration Error",
    //                 JSON.stringify(
    //                     {
    //                         message: error.message,
    //                         status: error.response?.status,
    //                         data: error.response?.data,
    //                     },
    //                     null,
    //                     2
    //                 )
    //             );
    //         }
    //     };

    //     registerToken();
    // }, [user?._id, user?.id, user?.userId]);

    useEffect(() => {
        if (!user?._id) {
            return;
        }

        let active = true;

        const registerToken = async () => {
            try {
                const token =
                    await registerForPushNotifications();

                if (!active) return;

                if (!token) {
                    Alert.alert(
                        "Push Registration Failed",
                        "No Expo push token was generated."
                    );
                    return;
                }

                const response = await api.post(
                    "/notifications/push-token",
                    { token },
                    withUserHeader(user._id)
                );

                // Alert.alert(
                //     "Push Token Saved",
                //     JSON.stringify(response.data, null, 2)
                // );
            } catch (error) {
                Alert.alert(
                    "Push Token Error",
                    JSON.stringify(
                        error.response?.data || {
                            status: error.response?.status,
                            message: error.message,
                        },
                        null,
                        2
                    )
                );
            }
        };

        registerToken();

        // const receivedSubscription =
        //     Notifications.addNotificationReceivedListener(
        //         notification => {
        //             Alert.alert(
        //                 "Push Received",
        //                 notification.request.content.title ||
        //                 "Notification received"
        //             );
        //         }
        //     );

        const responseSubscription =
            Notifications.addNotificationResponseReceivedListener(
                response => {
                    const data =
                        response.notification?.request?.content?.data ||
                        {};

                    openNotificationScreen(data);
                }
            );

        return () => {
            active = false;
            receivedSubscription.remove();
            responseSubscription.remove();
        };
    }, [user?._id]);

    return null;
}