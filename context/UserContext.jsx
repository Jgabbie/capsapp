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