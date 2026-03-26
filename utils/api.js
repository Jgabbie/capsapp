import axios from "axios";
import { Platform } from "react-native";

const getApiBaseUrl = () => {
  // 1. If running in the web browser, use localhost safely
  if (Platform.OS === "web") {
    return "http://localhost:5000/api";
  }
  
  // 2. Bulletproof Android Emulator IP (Never changes!)
  return "http://10.0.2.2:5000/api";
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