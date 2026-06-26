const EXPO_PUSH_ENDPOINT =
    "https://exp.host/--/api/v2/push/send";

const ANDROID_CHANNEL_ID =
    "mrc-notifications-v3";

const isExpoPushToken = token =>
    typeof token === "string" &&
    /^(ExpoPushToken|ExponentPushToken)\[[^\]]+\]$/.test(
        token
    );

export const sendExpoPushNotification = async ({
    tokens = [],
    title,
    message,
    data = {},
}) => {
    const validTokens = [
        ...new Set(
            tokens.filter(isExpoPushToken)
        ),
    ];

    if (validTokens.length === 0) {
        return [];
    }

    const payload = validTokens.map(token => ({
        to: token,
        sound: "default",
        title,
        body: message,
        priority: "high",
        channelId: ANDROID_CHANNEL_ID,
        data,
    }));

    const response = await fetch(
        EXPO_PUSH_ENDPOINT,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Accept-Encoding":
                    "gzip, deflate",
                "Content-Type":
                    "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    const responseData =
        await response.json();

    if (!response.ok) {
        throw new Error(
            responseData?.errors?.[0]?.message ||
            "Expo rejected the push notification."
        );
    }

    const tickets = Array.isArray(
        responseData.data
    )
        ? responseData.data
        : responseData.data
            ? [responseData.data]
            : [];

    return tickets;
};