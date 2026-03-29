import axios from "axios";
import { Platform } from "react-native";

const DEPLOYED_URL = "https://travexmobile.onrender.com/api";

//"http://localhost:5000/api"
//"http://192.168.1.56:5000/api"

const getApiBaseUrl = () => {
  if (Platform.OS === "web") {
    return DEPLOYED_URL;
  }

  // 🔥 BYPASSING THE EMULATOR BRIDGE 🔥
  // Using your laptop's actual Wi-Fi IP address instead of 10.0.2.2
  return DEPLOYED_URL;
};

const API_BASE_URL = getApiBaseUrl();

console.log("=====================================");
console.log("🚀 AXIOS TARGET URL:", API_BASE_URL);
console.log("=====================================");

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const withUserHeader = (userId) => ({
  headers: {
    "x-user-id": String(userId),
  },
});

export { API_BASE_URL };