import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Point this at your backend. Use your machine's LAN IP for physical devices
// (localhost only works on iOS simulator); Android emulator uses 10.0.2.2.
export const API_BASE_URL = "http://localhost:4000/api";

// TODO(revert): set to false (or delete) to stop short-circuiting API calls with dummy data
export const MOCK_API = true;

export const apiClient = axios.create({ baseURL: API_BASE_URL });

export const TOKEN_KEY = "temple-connect-token";

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
