import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL = "http://localhost:4000/api";

export const apiClient = axios.create({ baseURL: API_BASE_URL, timeout: 30000 });

export const TOKEN_KEY = "temple-connect-token";

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
