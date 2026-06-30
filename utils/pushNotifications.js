import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});


export async function configureNotificationChannel() {
    if (Platform.OS !== "android") return;

    await Notifications.setNotificationChannelAsync(
        "mrc-notifications-v3",
        {
            name: "M&RC Notifications",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#305797",
            enableVibrate: true,
            showBadge: true,
        }
    );
}

export async function registerForPushNotifications() {
    try {
        await configureNotificationChannel();

        const currentPermission =
            await Notifications.getPermissionsAsync();

        let finalStatus = currentPermission.status;

        if (finalStatus !== "granted") {
            const requestedPermission =
                await Notifications.requestPermissionsAsync();

            finalStatus = requestedPermission.status;
        }

        if (finalStatus !== "granted") {
            console.log(
                "Push notification permission was not granted."
            );
            return null;
        }

        const projectId =
            Constants.expoConfig?.extra?.eas?.projectId ??
            Constants.easConfig?.projectId;

        if (!projectId) {
            throw new Error(
                "Expo projectId is missing from the application configuration."
            );
        }

        const tokenResponse =
            await Notifications.getExpoPushTokenAsync({
                projectId,
            });

        // console.log("Expo push token:", tokenResponse.data);

        return tokenResponse.data;
    } catch (error) {
        console.error(
            "Push notification registration error:",
            error
        );

        return null;
    }
}