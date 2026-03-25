import axios from "axios";
import { Platform } from "react-native";

const getApiBaseUrl = () => {
  // 1. If running in the web browser, use localhost safely
  if (Platform.OS === "web") {
    return "http://localhost:5000/api";
  }
  
  // 2. Fallback for physical phones
  return "http://192.168.1.7:5000/api";
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