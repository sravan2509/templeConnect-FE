import axios, { AxiosError } from "axios";
import { getToken } from "../utils/tokenStorage";
import { NO_INTERNET_MESSAGE, SERVER_UNREACHABLE_MESSAGE, isProbablyOnline } from "../utils/network";
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

/** Encodes an id for use as a URL path segment (temple ids can contain ':' or spaces). */
export const seg = (value: string) => encodeURIComponent(value);

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
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
      // A 401 on an authenticated request means the session ended (expired, password changed, account deleted).
      const sentToken = !!error.config?.headers?.Authorization;
      const isAuthCall = (error.config?.url || "").startsWith("/auth/");
      if (error.response.status === 401 && sentToken && !isAuthCall) {
        forceLogout();
      }
      const msg = error.response.data?.error || error.response.data?.message || `Server error (${error.response.status})`;
      (error as any).friendlyMessage = msg;
    } else {
      // No response at all: either the phone is offline or the server is unreachable.
      (error as any).isNetworkError = true;
      if (!isProbablyOnline()) {
        (error as any).friendlyMessage = NO_INTERNET_MESSAGE;
      } else if (error.code === "ECONNABORTED") {
        (error as any).friendlyMessage = "The request took too long. Please check your internet connection and try again.";
      } else {
        (error as any).friendlyMessage = __DEV__ ? `${SERVER_UNREACHABLE_MESSAGE}

(Dev: cannot reach ${API_BASE_URL} — is the backend running?)` : SERVER_UNREACHABLE_MESSAGE;
      }
    }
    return Promise.reject(error);
  }
);

export function isNetworkError(err: any): boolean {
  return !!err?.isNetworkError;
}

export function getErrorMessage(err: any): string {
  return err?.friendlyMessage || err?.response?.data?.error || err?.message || "Something went wrong";
}
