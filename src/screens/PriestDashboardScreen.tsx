import { useState, useCallback } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { SectionHeader } from "../components/SectionHeader";
import { colors, spacing, radius } from "../theme";
import { useAuth } from "../context/AuthContext";
import { getPriestStats, acceptBooking, rejectBooking } from "../api/admin";
import { getErrorMessage } from "../api/client";

export default function PriestDashboardScreen({ navigation }: any) {
  const { signOut } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try { setStats(await getPriestStats()); } catch {}
  }

  async function handleAccept(bookingId: string) {
    try { await acceptBooking(bookingId); Alert.alert("Accepted", "Booking confirmed. Devotee notified."); loadData(); }
    catch (e: any) { Alert.alert("Error", getErrorMessage(e)); }
  }

  async function handleReject(bookingId: string) {
    try { await rejectBooking(bookingId); Alert.alert("Rejected", "Booking declined."); loadData(); }
    catch (e: any) { Alert.alert("Error", getErrorMessage(e)); }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧑‍🦱 Priest Bookings</Text>
        <TouchableOpacity onPress={signOut}><Text style={styles.logoutBtn}>Logout</Text></TouchableOpacity>
      </View>
      <Screen scroll={false}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {stats && (
            <View style={styles.statsRow}>
              <StatBadge label="Total" value={stats.stats.total} />
              <StatBadge label="Pending" value={stats.stats.pending} color={colors.star} />
              <StatBadge label="Confirmed" value={stats.stats.confirmed} color={colors.success} />
              <StatBadge label="Completed" value={stats.stats.completed} color={colors.accent} />
            </View>
          )}

          <SectionHeader title="Upcoming Bookings" />
          {stats?.upcoming?.length === 0 && <Text style={styles.empty}>No upcoming bookings.</Text>}
          {stats?.upcoming?.map((b: any) => (
            <Card key={b.id}>
              <Text style={styles.bookingName}>{b.puja?.icon} {b.puja?.name}</Text>
              <Text style={styles.sub}>Devotee: {b.user?.name}</Text>
              <Text style={styles.sub}>{new Date(b.scheduledAt).toLocaleDateString()} · {b.status.toUpperCase()}</Text>
              {b.status === "pending" && (
                <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm }}>
                  <Button title="✅ Accept" onPress={() => handleAccept(b.id)} style={{ flex: 1 }} />
                  <Button title="❌ Reject" variant="secondary" onPress={() => handleReject(b.id)} style={{ flex: 1 }} />
                </View>
              )}
            </Card>
          ))}
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}

function StatBadge({ label, value, color = colors.primary }: { label: string; value: number; color?: string }) {
  return <View style={[s.stat, { borderColor: color }]}>
    <Text style={[s.statVal, { color }]}>{value}</Text>
    <Text style={s.statLabel}>{label}</Text>
  </View>;
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.card, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { color: colors.primary, fontSize: 18, fontWeight: "700" },
  logoutBtn: { color: colors.danger, fontWeight: "600" },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md },
  bookingName: { color: colors.text, fontSize: 15, fontWeight: "700" },
  empty: { color: colors.textMuted, textAlign: "center", padding: spacing.lg },
});

const s = StyleSheet.create({
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm, marginHorizontal: 2, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  statVal: { fontSize: 18, fontWeight: "800" },
  statLabel: { color: colors.textMuted, fontSize: 10 },
});
