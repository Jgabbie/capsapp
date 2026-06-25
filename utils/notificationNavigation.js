import {
    createNavigationContainerRef
} from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

let pendingNotificationData = null;

const routeMap = {
    userpackagequotation: "userquotations",
    userpackagequotations: "userquotations",
    package: "packagedetails",
    packagedetails: "packagedetails",
    usertransactions: "usertransactions",
    userapplications: "userapplications",
    notifications: "notifications",
};

function getNavigationTarget(data = {}) {
    const rawLink = data.link || data.route || "";

    if (!rawLink) {
        return null;
    }

    let routeKey = String(rawLink)
        .replace(/^\/+|\/+$/g, "")
        .split("?")[0]
        .toLowerCase()
        .replace(/[-\\/]/g, "");

    const targetRoute = routeMap[routeKey] || routeKey;

    let routeState = data.routeState || {};

    if (typeof routeState === "string") {
        try {
            routeState = JSON.parse(routeState);
        } catch {
            routeState = {};
        }
    }

    const params = {};

    const packageId =
        routeState.packageItem ||
        routeState.packageId ||
        routeState.id;

    if (packageId) {
        params.id = packageId;
    }

    if (routeState.pkg || routeState.rawPackage) {
        params.pkg =
            routeState.pkg ||
            routeState.rawPackage;
    }

    if (routeState.bookingId) {
        params.bookingId = routeState.bookingId;
    }

    if (routeState.applicationId) {
        params.applicationId =
            routeState.applicationId;
    }

    if (routeState.reference) {
        params.reference = routeState.reference;
    }

    if (Object.keys(params).length === 0) {
        Object.assign(params, routeState);
    }

    return {
        name: targetRoute,
        params:
            Object.keys(params).length > 0
                ? params
                : undefined,
    };
}

export function openNotificationScreen(data = {}) {
    const target = getNavigationTarget(data);

    if (!target) {
        return;
    }

    if (!navigationRef.isReady()) {
        pendingNotificationData = data;
        return;
    }

    navigationRef.navigate(
        target.name,
        target.params
    );
}

export function flushPendingNotification() {
    if (
        !pendingNotificationData ||
        !navigationRef.isReady()
    ) {
        return;
    }

    const savedData = pendingNotificationData;
    pendingNotificationData = null;

    openNotificationScreen(savedData);
}