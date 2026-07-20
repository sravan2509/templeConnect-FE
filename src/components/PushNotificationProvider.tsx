import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usePushNotifications } from "../hooks/usePushNotifications";

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  usePushNotifications(user?.id);
  return <>{children}</>;
}
