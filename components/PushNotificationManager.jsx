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
            responseSubscription.remove();
        };
    }, [user?._id]);

    return null;
}