import axios from "axios";
import { Platform } from "react-native";


const DEPLOYED_URL = "https://api.mrctravelandtours.com/api";

const getApiBaseUrl = () => {
  if (Platform.OS === "web") {
    return "http://localhost:5000/api";
  }


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
    "x-user-id": String(userId), // Must match middleware!
  },
});

export { API_BASE_URL };