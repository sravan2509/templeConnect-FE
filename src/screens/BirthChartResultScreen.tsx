import { useState, useCallback } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { SectionHeader } from "../components/SectionHeader";
import { colors, radius, spacing } from "../theme";
import { getAstroProfile, AstroProfile } from "../api/astrology";

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
  const [profile, setProfile] = useState<AstroProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          const data = await getAstroProfile();
          if (isActive) {
            setProfile(data);
            setError(null);
          }
        } catch (err: any) {
          if (isActive) {
            if (err?.response?.status === 404) {
              setError("No birth chart found. Please add your birth details first.");
            } else {
              setError(err?.response?.data?.error ?? "Failed to load profile.");
            }
          }
        } finally {
          if (isActive) setLoading(false);
        }
      })();
      return () => { isActive = false; };
    }, [])
  );

  if (loading) {
    return (
      <Screen scroll={false}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      </Screen>
    );
  }

  if (error || !profile) {
    return (
      <Screen scroll={false}>
        <SectionHeader title="Your Spiritual Profile" />
        <Text style={styles.empty}>{error || "No data available."}</Text>
        <Button
          title="Add Birth Details"
          onPress={() => navigation.navigate("BirthChartForm")}
          style={{ marginTop: spacing.md }}
        />
      </Screen>
    );
  }

  const { rashi, nakshatra, moonLongitude, deityRecommendation, birthDetails } = profile;

  return (
    <Screen scroll={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <SectionHeader title="Your Spiritual Profile" />

        <Card>
          <Text style={styles.label}>Birth Details</Text>
          <Text style={styles.value}>{birthDetails.date} · {birthDetails.time}</Text>
          <Text style={styles.sub}>{birthDetails.place}</Text>
        </Card>

        <SectionHeader title="Zodiac & Star" />
        <View style={styles.statRow}>
          <StatCard icon="🌙" label="Nakshatra" value={nakshatra.name} />
          <StatCard icon="♈" label="Rashi" value={`${rashi.name} (${rashi.englishName})`} />
        </View>

        <View style={styles.statRow}>
          <StatCard icon="🪐" label="Ruling Planet (Nak)" value={nakshatra.rulingPlanet} />
          <StatCard icon="⭐" label="Ruling Planet (Rashi)" value={rashi.rulingPlanet} />
        </View>

        <View style={styles.statRow}>
          <StatCard icon="🔥" label="Element" value={rashi.element} />
          <StatCard icon="📐" label="Quality" value={rashi.quality} />
        </View>

        <SectionHeader title="Recommended Deity" />
        <Card>
          <View style={styles.deityHeader}>
            <Text style={styles.deityIcon}>🛕</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.deityName}>Lord {deityRecommendation.primaryDeity}</Text>
              <Text style={styles.sub}>Primary deity for temple worship</Text>
            </View>
          </View>
          <Text style={styles.description}>{deityRecommendation.description}</Text>
        </Card>

        <SectionHeader title="Moon Longitude" />
        <Card>
          <View style={styles.coordRow}>
            <Text style={styles.label}>Tropical:</Text>
            <Text style={styles.value}>{moonLongitude.tropical}°</Text>
          </View>
          <View style={styles.coordRow}>
            <Text style={styles.label}>Sidereal:</Text>
            <Text style={styles.value}>{moonLongitude.sidereal}°</Text>
          </View>
          <View style={styles.coordRow}>
            <Text style={styles.label}>Ayanamsa (Lahiri):</Text>
            <Text style={styles.value}>{moonLongitude.ayanamsa}°</Text>
          </View>
        </Card>

        <Button
          title="Find Nearby Temples"
          onPress={() => navigation.navigate("temples", { screen: "TempleSearch", params: { deity: deityRecommendation.primaryDeity } })}
          style={{ marginTop: spacing.md }}
        />
        <Button
          title="Edit Birth Details"
          variant="secondary"
          onPress={() => navigation.navigate("BirthChartForm")}
          style={{ marginTop: spacing.sm }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.xs },
  value: { color: colors.text, fontSize: 16, fontWeight: "700" },
  sub: { color: colors.textMuted, marginTop: spacing.xs, fontSize: 13 },
  empty: { color: colors.textMuted, marginBottom: spacing.md },
  statRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.sm },
  statCard: { flex: 1, alignItems: "center" },
  statIconBox: {
    width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.peach,
    alignItems: "center", justifyContent: "center", marginBottom: spacing.sm,
  },
  statIcon: { fontSize: 22 },
  statLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 2 },
  statValue: { color: colors.text, fontSize: 14, fontWeight: "700", textAlign: "center" },
  deityHeader: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  deityIcon: { fontSize: 32, marginRight: spacing.md },
  deityName: { color: colors.text, fontSize: 20, fontWeight: "700" },
  description: { color: colors.text, lineHeight: 20, fontSize: 14 },
  coordRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
});
