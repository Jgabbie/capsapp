import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";

import {
    registerForPushNotifications
} from "../utils/pushNotifications";

import {
    openNotificationScreen
} from "../utils/notificationNavigation";

import {
    api,
    withUserHeader
} from "../utils/api";

import { useUser } from "../context/UserContext";

export default function PushNotificationManager() {
    const { user } = useUser();

    const handledNotificationId = useRef(null);

    useEffect(() => {
        if (!user?._id) {
            return;
        }

        let isMounted = true;

        const registerToken = async () => {
            const expoPushToken =
                await registerForPushNotifications();

            if (!expoPushToken || !isMounted) {
                return;
            }

            try {
                await api.post(
                    "/notifications/push-token",
                    {
                        token: expoPushToken,
                    },
                    withUserHeader(user._id)
                );

                console.log(
                    "Expo push token registered:",
                    expoPushToken
                );
            } catch (error) {
                console.error(
                    "Failed to save push token:",
                    error.response?.data ||
                    error.message
                );
            }
        };

        const handleNotificationResponse = async (
            response
        ) => {
            const notification =
                response?.notification;

            const notificationIdentifier =
                notification?.request?.identifier;

            if (
                notificationIdentifier &&
                handledNotificationId.current ===
                notificationIdentifier
            ) {
                return;
            }

            handledNotificationId.current =
                notificationIdentifier;

            const data =
                notification?.request?.content?.data ||
                {};

            if (data.notificationId) {
                try {
                    await api.patch(
                        `/notifications/${data.notificationId}/read`,
                        {},
                        withUserHeader(user._id)
                    );
                } catch (error) {
                    console.error(
                        "Failed to mark push notification as read:",
                        error.message
                    );
                }
            }

            openNotificationScreen(data);
        };

        registerToken();

        // Runs when a notification arrives while the app is open.
        const receivedSubscription =
            Notifications.addNotificationReceivedListener(
                notification => {
                    console.log(
                        "Push received:",
                        notification.request.content
                    );
                }
            );

        // Runs when the user taps a notification.
        const responseSubscription =
            Notifications.addNotificationResponseReceivedListener(
                handleNotificationResponse
            );

        // Handles the notification that opened a terminated app.
        Notifications
            .getLastNotificationResponseAsync()
            .then(response => {
                if (response) {
                    handleNotificationResponse(response);
                }
            })
            .catch(error => {
                console.error(
                    "Initial notification response error:",
                    error
                );
            });

        return () => {
            isMounted = false;
            receivedSubscription.remove();
            responseSubscription.remove();
        };
    }, [user?._id]);

    return null;
}