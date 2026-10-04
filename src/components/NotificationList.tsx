import { StyleSheet, Text } from "react-native";
import { Card } from "./Card";
import { colors, spacing } from "../theme";
import type { Notification } from "../api/admin";

const TYPE_LABELS: Record<string, string> = {
  new_booking: "New booking",
  booking_confirmed: "Booking confirmed",
  booking_declined: "Booking declined",
  booking_cancelled: "Booking cancelled",
  booking_rescheduled: "Booking rescheduled",
  booking_completed: "Puja completed",
  daily_suggestion: "Daily suggestion",
};

export function NotificationList({ items }: { items: Notification[] }) {
  if (items.length === 0) return <Text style={styles.empty}>No notifications yet.</Text>;
  return (
    <>
      {items.map((item) => (
        <Card key={item.id} style={item.read ? undefined : styles.unread}>
          <Text style={styles.title}>{item.read ? "" : "🔵 "}{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })} · {TYPE_LABELS[item.type] ?? "Update"}</Text>
        </Card>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  unread: { borderColor: colors.primary, borderWidth: 2 },
  title: { color: colors.text, fontSize: 15, fontWeight: "700", marginBottom: spacing.xs },
  body: { color: colors.text, lineHeight: 20 },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
});
