import { useState, useCallback } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, spacing } from "../../theme";
import { Screen } from "../../components/Screen";
import { NotificationList } from "../../components/NotificationList";
import { getNotifications, markAllNotificationsRead, Notification } from "../../api/admin";
import { getErrorMessage } from "../../api/client";

export default function PriestNotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          const notifs = await getNotifications();
          if (!isActive) return;
          setNotifications(notifs);
          setError(null);
          if (notifs.some((n) => !n.read)) markAllNotificationsRead().catch(() => {});
        } catch (e) {
          if (isActive) setError(getErrorMessage(e));
        } finally {
          if (isActive) setLoading(false);
        }
      })();
      return () => { isActive = false; };
    }, [])
  );

  return (
    <Screen safeTop>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔔 Notifications</Text>
      </View>
      {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {!loading && <NotificationList items={notifications} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingVertical: spacing.md },
  headerTitle: { color: colors.text, fontSize: 22, fontWeight: "700" },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
