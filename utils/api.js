import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

const explicitApiUrl = process.env.EXPO_PUBLIC_API_URL;

const normalizeApiUrl = (url) => {
  if (!url) return "";
  const trimmed = String(url).trim().replace(/\/$/, "");
  if (trimmed.endsWith("/api")) return trimmed;
  return `${trimmed}/api`;
};

const getApiBaseUrl = () => {
  // 1. If you have an explicit URL in your .env, use it
  const normalizedExplicit = normalizeApiUrl(explicitApiUrl);
  if (normalizedExplicit) return normalizedExplicit;

  // 2. Web fallback
  if (Platform.OS === "web") {
    return "http://localhost:5000/api";
  }

  // 3. Expo Go Dynamic IP
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.linkingUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    "";

  const host = hostUri
    .replace(/^https?:\/\//, "")
    .replace(/^exp:\/\//, "")
    .split(":")[0]
    .split("/")[0];

  if (host) {
    // We added the /api back here to match your server.js!
    return `http://${host}:5000/api`;
  }

  // 4. Android Emulator Fallback
  return Platform.OS === "android" ? "http://10.0.2.2:5000/api" : "http://localhost:5000/api";
};

const API_BASE_URL = getApiBaseUrl();

// 🚨 DIAGNOSTIC TRACKER: Look at your Expo terminal when the app reloads
console.log("=====================================");
console.log("🚀 AXIOS TARGET URL:", API_BASE_URL);
console.log("=====================================");

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const withUserHeader = (userId) => ({
  headers: {
    "x-user-id": String(userId),
  },
});

export { API_BASE_URL };