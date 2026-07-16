import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { SectionHeader } from "../components/SectionHeader";
import { colors, radius, spacing } from "../theme";
import { BirthChart, getBirthChart } from "../api/astrology";

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <Card style={styles.statCard}>
      <View style={styles.statIconBox}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </Card>
  );
}

export default function BirthChartResultScreen({ route, navigation }: any) {
  const passedChart: BirthChart | undefined = route.params?.chart;
  const [chart, setChart] = useState<BirthChart | null>(passedChart ?? null);
  const [loading, setLoading] = useState(!passedChart);

  useEffect(() => {
    if (passedChart) return;
    (async () => {
      try {
        const data = await getBirthChart();
        setChart(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      </Screen>
    );
  }

  if (!chart) {
    return (
      <Screen>
        <SectionHeader title="Your Spiritual Profile" />
        <Text style={styles.empty}>No birth chart yet. Add your birth details to see your nakshatra and rashi.</Text>
        <Button
          title="Add Birth Details"
          onPress={() => navigation.navigate("Node", { tabId: "rituals", nodeId: "input-edit-birth-data" })}
          style={{ marginTop: spacing.md }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionHeader title="Your Spiritual Profile" />

      <View style={styles.statRow}>
        <StatCard icon="🌙" label="Nakshatra" value={chart.nakshatra ?? "—"} />
        <StatCard icon="♉" label="Rashi" value={chart.rashi ?? "—"} />
      </View>

      <Card>
        <Text style={styles.label}>Birth Details</Text>
        <Text style={styles.value}>{chart.dob} · {chart.time}</Text>
        <Text style={styles.sub}>{chart.placeName}</Text>
      </Card>

      <Button
        title="Edit Birth Details"
        variant="secondary"
        onPress={() => navigation.navigate("Node", { tabId: "rituals", nodeId: "input-edit-birth-data" })}
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.xs },
  value: { color: colors.text, fontSize: 18, fontWeight: "700" },
  sub: { color: colors.textMuted, marginTop: spacing.xs },
  empty: { color: colors.textMuted },
  statRow: { flexDirection: "row", gap: spacing.md },
  statCard: { flex: 1, alignItems: "center" },
  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.peach,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  statIcon: { fontSize: 22 },
  statLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 2 },
  statValue: { color: colors.text, fontSize: 16, fontWeight: "700" },
});
