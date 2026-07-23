import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, NativeModules } from "react-native";

function getDevServerIP(): string {
  if (typeof process !== "undefined" && (process as any).env?.EXPO_PUBLIC_API_URL) {
    return (process as any).env.EXPO_PUBLIC_API_URL;
  }

  const scriptURL =
    (NativeModules as any)?.SourceCode?.scriptURL ??
    (NativeModules as any)?.PlatformConstants?.ServerURL ??
    "";

  const match = scriptURL.match(/^https?:\/\/([\d.]+):\d+/);
  if (match?.[1]) {
    return `http://${match[1]}:4000/api`;
  }

  try {
    const { expoConfig } = require("expo-constants") as any;
    if (expoConfig?.hostUri) {
      const hostMatch = expoConfig.hostUri.match(/^([\d.]+):/);
      if (hostMatch?.[1]) {
        return `http://${hostMatch[1]}:4000/api`;
      }
    }
  } catch {}

  return Platform.select({
    android: "http://10.0.2.2:4000/api",
    ios: "http://localhost:4000/api",
    default: "http://localhost:4000/api",
  })!;
}

export const API_BASE_URL = getDevServerIP();

if (__DEV__) {
  console.log(`[API] ${Platform.OS} => ${API_BASE_URL}`);
}

export const apiClient = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

export const TOKEN_KEY = "temple-connect-token";

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export let forceLogout = () => {};
export function setForceLogout(cb: () => void) { forceLogout = cb; }

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    if (error.response) {
      if (error.response.status === 401) {
        forceLogout();
      }
      const msg = error.response.data?.error || error.response.data?.message || `Server error (${error.response.status})`;
      (error as any).friendlyMessage = msg;
    } else if (error.code === "ECONNABORTED") {
      (error as any).friendlyMessage = "Request timed out. Check your connection.";
    } else if (error.message === "Network Error") {
      (error as any).friendlyMessage = `Cannot connect to ${API_BASE_URL}. Is the backend running?`;
    } else {
      (error as any).friendlyMessage = error.message || "Unknown error occurred";
    }
    return Promise.reject(error);
  }
);


export function getErrorMessage(err: any): string {
  return err?.friendlyMessage || err?.response?.data?.error || err?.message || "Something went wrong";
}
