import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../api/client";

const PUSH_TOKEN_KEY = "push-token";
let pushTokenRegistered = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerPushToken(userId: string) {
  if (pushTokenRegistered) return;
  pushTokenRegistered = true;

  try {
    const cached = await AsyncStorage.getItem(PUSH_TOKEN_KEY + ":" + userId);
    if (cached) return;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("[PUSH] Permission denied - using in-app notifications only");
      return;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      console.log("[PUSH] Token:", token);
      await apiClient.post("/admin/push-token", { token });
      await AsyncStorage.setItem(PUSH_TOKEN_KEY + ":" + userId, token);
      console.log("[PUSH] Device push enabled");
    } catch (tokenErr: any) {
      if (tokenErr.message?.includes("projectId") || tokenErr.message?.includes("Expo Go")) {
        console.log("[PUSH] Expo Go detected - push notifications work only in development builds. In-app notifications will still work.");
      } else {
        console.log("[PUSH] Token failed:", tokenErr.message);
      }
    }
  } catch (err: any) {
    console.log("[PUSH] Setup failed, in-app notifications will still work:", err.message?.substring(0, 80));
    pushTokenRegistered = false;
  }
}

export function usePushNotifications(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;
    registerPushToken(userId);

    const sub1 = Notifications.addNotificationReceivedListener((notification) => {
      console.log("[NOTIF] Received:", notification.request.content.title);
    });

    const sub2 = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("[NOTIF] Tapped:", response.notification.request.content.title);
    });

    return () => {
      sub1.remove();
      sub2.remove();
      pushTokenRegistered = false;
    };
  }, [userId]);
}
