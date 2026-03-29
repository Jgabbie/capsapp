import axios from "axios";
import { Platform } from "react-native";

const getApiBaseUrl = () => {
  if (Platform.OS === "web") {
    return "http://localhost:5000/api";
  }

  // 🔥 BYPASSING THE EMULATOR BRIDGE 🔥
  // Using your laptop's actual Wi-Fi IP address instead of 10.0.2.2
  return "http://192.168.1.56:5000/api";
};

const API_BASE_URL = getApiBaseUrl();

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