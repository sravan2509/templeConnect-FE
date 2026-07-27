import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, spacing, radius } from "../../theme";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { getNotifications, markAllNotificationsRead } from "../../api/admin";

export default function PriestNotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          const notifs = await getNotifications();
          if (isActive) {
            setNotifications(notifs);
            setLoading(false);
            if (notifs.some((n: any) => !n.read)) {
              markAllNotificationsRead().catch(() => {});
            }
          }
        } catch (e) {
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />}
        {!loading && notifications.length === 0 && (
          <Text style={styles.empty}>No new notifications.</Text>
        )}
        {!loading && notifications.map((item, i) => (
          <Card key={i} style={item.read ? {} : { borderColor: colors.primary, borderWidth: 2 }}>
            <Text style={styles.cardTitle}>{item.read ? "" : "🔵 "}{item.title}</Text>
            <Text style={styles.detailText}>{item.body}</Text>
            <Text style={styles.sub}>{new Date(item.createdAt).toLocaleString()} · {item.type}</Text>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.md },
  headerTitle: { color: colors.primary, fontSize: 18, fontWeight: "700" },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: "700", marginBottom: spacing.xs },
  detailText: { color: colors.text, lineHeight: 20 },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: spacing.sm },
});
