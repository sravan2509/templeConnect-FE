import { useEffect } from "react";
import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerPushToken as registerPushTokenApi } from "../api/admin";

const PUSH_TOKEN_KEY = "push-token";
let registeringFor: string | null = null;

// Expo Go (SDK 53+) no longer supports remote push on Android, and importing
// expo-notifications there logs an error. Load it only in development/production builds.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
type NotificationsModule = typeof import("expo-notifications");
let Notifications: NotificationsModule | null = null;
if (!isExpoGo) {
  Notifications = require("expo-notifications") as NotificationsModule;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/** Clears the cached registration so the next signed-in user registers this device again. */
export async function forgetPushRegistration() {
  registeringFor = null;
  const keys = await AsyncStorage.getAllKeys();
  await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith(PUSH_TOKEN_KEY)));
}

function getProjectId(): string | undefined {
  return (Constants.expoConfig?.extra as any)?.eas?.projectId ?? (Constants as any).easConfig?.projectId;
}

async function registerPushToken(userId: string) {
  if (!Notifications) {
    console.log("[PUSH] Running in Expo Go - device push disabled, in-app notifications still work.");
    return;
  }
  if (registeringFor === userId) return;
  registeringFor = userId;

  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      finalStatus = (await Notifications.requestPermissionsAsync()).status;
    }
    if (finalStatus !== "granted") {
      console.log("[PUSH] Permission denied - using in-app notifications only");
      return;
    }

    const projectId = getProjectId();
    if (!projectId) {
      console.log("[PUSH] No EAS projectId configured (set EAS_PROJECT_ID) - device push disabled, in-app notifications still work.");
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    const cached = await AsyncStorage.getItem(`${PUSH_TOKEN_KEY}:${userId}`);
    if (cached === token) return;
    await registerPushTokenApi(token);
    await AsyncStorage.setItem(`${PUSH_TOKEN_KEY}:${userId}`, token);
    console.log("[PUSH] Device push enabled");
  } catch (err: any) {
    registeringFor = null;
    console.log("[PUSH] Setup failed, in-app notifications will still work:", err?.message?.substring(0, 120));
  }
}

export function usePushNotifications(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;
    registerPushToken(userId);
    if (!Notifications) return;

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("[NOTIF] Tapped:", response.notification.request.content.title);
    });
    return () => sub.remove();
  }, [userId]);
}
