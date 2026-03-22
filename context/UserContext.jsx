import { createContext, useContext, useEffect, useMemo, useState } from "react";

const USER_STORAGE_KEY = "capsapp_user_session";

const loadStoredUser = () => {
    if (typeof window === "undefined" || !window.localStorage) return null;
    try {
        const raw = window.localStorage.getItem(USER_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

export const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
    const [user, setUserState] = useState(loadStoredUser);

    const setUser = (nextUser) => {
        setUserState(nextUser);
        if (typeof window === "undefined" || !window.localStorage) return;
        try {
            if (nextUser) {
                window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
            } else {
                window.localStorage.removeItem(USER_STORAGE_KEY);
            }
        } catch {
        }
    };

    // <--- NEW: Helper function to easily update parts of the user profile
    const updateUser = (updates) => {
        setUserState((prev) => {
            const nextUser = { ...prev, ...updates };
            if (typeof window !== "undefined" && window.localStorage) {
                window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
            }
            return nextUser;
        });
    };

    useEffect(() => {
        if (user || typeof window === "undefined" || !window.localStorage) return;
        const restored = loadStoredUser();
        if (restored) {
            setUserState(restored);
        }
    }, [user]);

    const value = useMemo(
        () => ({
            user,
            setUser,
            updateUser, // <--- Added here
            clearUser: () => setUser(null),
        }),
        [user]
    );

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used inside UserProvider");
    }
    return context;
};