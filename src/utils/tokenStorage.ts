import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

/**
 * Session token storage. Uses the OS keystore (Keychain / Android Keystore) via expo-secure-store,
 * with an in-memory copy so API requests don't hit storage every time.
 * Falls back to AsyncStorage on web, where SecureStore isn't available.
 */
const KEY = "temple-connect-token";
const LEGACY_KEY = "temple-connect-token"; // previous AsyncStorage location

let cached: string | null | undefined;
const useSecure = Platform.OS !== "web";

export async function getToken(): Promise<string | null> {
  if (cached !== undefined) return cached;
  if (useSecure) {
    cached = await SecureStore.getItemAsync(KEY);
    if (!cached) {
      // One-time migration from the old plain-text AsyncStorage location.
      const legacy = await AsyncStorage.getItem(LEGACY_KEY);
      if (legacy) {
        await SecureStore.setItemAsync(KEY, legacy);
        await AsyncStorage.removeItem(LEGACY_KEY);
        cached = legacy;
      }
    }
  } else {
    cached = await AsyncStorage.getItem(KEY);
  }
  return cached ?? null;
}

export async function setToken(token: string): Promise<void> {
  cached = token;
  if (useSecure) await SecureStore.setItemAsync(KEY, token);
  else await AsyncStorage.setItem(KEY, token);
}

export async function clearToken(): Promise<void> {
  cached = null;
  if (useSecure) await SecureStore.deleteItemAsync(KEY);
  await AsyncStorage.removeItem(LEGACY_KEY);
}
