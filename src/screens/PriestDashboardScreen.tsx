import { useState, useCallback } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { SectionHeader } from "../components/SectionHeader";
import { colors, spacing, radius } from "../theme";
import { useAuth } from "../context/AuthContext";
import { getPriestStats, acceptBooking, rejectBooking, completeBooking } from "../api/admin";
import { getErrorMessage } from "../api/client";
import { formatDateTime } from "../utils/format";

export default function PriestDashboardScreen({ navigation }: any) {
  const { signOut } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try { setStats(await getPriestStats()); setError(null); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  async function act(bookingId: string, action: () => Promise<unknown>, title: string, message: string) {
    setBusyId(bookingId);
    try { await action(); Alert.alert(title, message); await loadData(); }
    catch (e) { Alert.alert("Error", getErrorMessage(e)); }
    finally { setBusyId(null); }
  }

  function confirmReject(bookingId: string) {
    Alert.alert("Decline booking?", "The devotee will be notified.", [
      { text: "Keep", style: "cancel" },
      { text: "Decline", style: "destructive", onPress: () => act(bookingId, () => rejectBooking(bookingId), "Declined", "The devotee has been notified.") },
    ]);
  }

  function confirmLogout() {
    Alert.alert("Log out?", "You'll need to sign in again to use the app.", [{ text: "Cancel", style: "cancel" }, { text: "Log Out", style: "destructive", onPress: signOut }]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧑‍🦱 Priest Bookings</Text>
        <TouchableOpacity onPress={confirmLogout} hitSlop={12}><Text style={styles.logoutBtn}>Log Out</Text></TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={loadData} />}
      >
        {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />}
        {error && <Text style={styles.error}>{error}</Text>}
        {stats && (
          <View style={styles.statsRow}>
            <StatBadge label="Total" value={stats.stats.total} />
            <StatBadge label="Pending" value={stats.stats.pending} color={colors.star} />
            <StatBadge label="Confirmed" value={stats.stats.confirmed} color={colors.success} />
            <StatBadge label="Completed" value={stats.stats.completed} color={colors.accent} />
          </View>
        )}

        <SectionHeader title="Upcoming & Open Bookings" />
        {stats?.upcoming?.length === 0 && <Text style={styles.empty}>No upcoming bookings.</Text>}
        {stats?.upcoming?.map((b: any) => {
          const isPast = new Date(b.scheduledAt).getTime() <= Date.now();
          const busy = busyId === b.id;
          return (
            <Card key={b.id}>
              <Text style={styles.bookingName}>{b.puja?.icon} {b.puja?.name}</Text>
              <Text style={styles.sub}>Devotee: {b.user?.name}</Text>
              <Text style={styles.sub}>🗓 {formatDateTime(b.scheduledAt)}{b.puja?.duration ? ` · ${b.puja.duration}` : ""}</Text>
              <Text style={[styles.status, { color: b.status === "confirmed" ? colors.success : colors.star }]}>
                {b.status.toUpperCase()}{b.paid ? " · PAID" : ""}
              </Text>
              {b.notes ? <Text style={styles.sub}>Notes: {b.notes}</Text> : null}
              <View style={styles.actions}>
                {b.status === "pending" && isPast && (
                  <>
                    <Text style={styles.expired}>The requested time has passed. Decline so the devotee can rebook.</Text>
                    <Button title="Decline" variant="secondary" disabled={busy} onPress={() => confirmReject(b.id)} style={styles.actionBtn} />
                  </>
                )}
                {b.status === "pending" && !isPast && (
                  <>
                    <Button title="Accept" loading={busy} onPress={() => act(b.id, () => acceptBooking(b.id), "Accepted", "Booking confirmed. The devotee has been notified.")} style={styles.actionBtn} />
                    <Button title="Decline" variant="secondary" disabled={busy} onPress={() => confirmReject(b.id)} style={styles.actionBtn} />
                  </>
                )}
                {b.status === "confirmed" && isPast && (
                  <Button title="Mark Completed" loading={busy} onPress={() => act(b.id, () => completeBooking(b.id), "Completed", "The devotee can now leave a review.")} style={styles.actionBtn} />
                )}
                {b.status === "confirmed" && (
                  <Button title="💬 Chat" variant="secondary" onPress={() => navigation.navigate("Chat", { openUser: { id: b.user?.id, name: b.user?.name } })} style={styles.actionBtn} />
                )}
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBadge({ label, value, color = colors.primary }: { label: string; value: number; color?: string }) {
  return (
    <View style={[styles.stat, { borderColor: color }]}>
      <Text style={[styles.statVal, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  logoutBtn: { color: colors.danger, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  stat: { flex: 1, alignItems: "center", backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1.5, paddingVertical: spacing.sm },
  statVal: { fontSize: 20, fontWeight: "800" },
  statLabel: { color: colors.textMuted, fontSize: 11 },
  bookingName: { color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: spacing.xs },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  status: { fontSize: 12, fontWeight: "800", marginTop: spacing.xs },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  actionBtn: { flexGrow: 1, paddingVertical: spacing.sm },
  empty: { color: colors.textMuted, marginBottom: spacing.md },
  expired: { color: colors.danger, fontSize: 12, width: "100%" },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
