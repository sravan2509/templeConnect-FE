import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { SectionHeader } from "../components/SectionHeader";
import { colors, radius, spacing } from "../theme";
import { getAstroProfile, getForecast, getRecommendations, AstroProfile } from "../api/astrology";
import { getErrorMessage } from "../api/client";

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <Card style={s.statCard}>
      <View style={s.statIconBox}><Text style={s.statIcon}>{icon}</Text></View>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
    </Card>
  );
}

export default function BirthChartResultScreen({ navigation }: any) {
  const [profile, setProfile] = useState<AstroProfile | null>(null);
  const [forecast, setForecast] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reload whenever the screen is shown so edits to birth details appear right away.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const [p, f, r] = await Promise.all([getAstroProfile(), getForecast(), getRecommendations()]);
          if (!active) return;
          setProfile(p); setForecast(f.forecast); setRecommendations(r.recommendations); setError(null);
        } catch (e: any) {
          if (!active) return;
          setProfile(null);
          setError(e?.response?.status === 404 ? null : getErrorMessage(e));
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [])
  );

  if (loading) return <Screen><ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} /></Screen>;
  if (!profile) {
    return (
      <Screen>
        <SectionHeader title="Spiritual Profile" />
        <Text style={s.empty}>{error ?? "No birth chart found. Add your birth details first."}</Text>
        <Button title="Add Birth Details" onPress={() => navigation.navigate("BirthChartForm")} style={{ marginTop: spacing.md }} />
      </Screen>
    );
  }

  const { rashi, nakshatra, moonLongitude, deityRecommendation, birthDetails } = profile;
  return (
    <Screen>
      <Card>
        <Text style={s.label}>Birth Details</Text>
        <Text style={s.value}>{birthDetails.date} · {birthDetails.time}{birthDetails.timezone ? ` (${birthDetails.timezone})` : ""}</Text>
        <Text style={s.sub}>{birthDetails.place}</Text>
      </Card>

      <SectionHeader title="Zodiac & Star" />
      <View style={s.row}><StatCard icon="🌙" label="Nakshatra" value={`${nakshatra.name} (Pada ${nakshatra.pada})`} /><StatCard icon="♈" label="Rashi" value={`${rashi.name} (${rashi.englishName})`} /></View>
      <View style={s.row}><StatCard icon="🪐" label="Nakshatra Ruler" value={nakshatra.rulingPlanet} /><StatCard icon="⭐" label="Rashi Ruler" value={rashi.rulingPlanet} /></View>
      <View style={s.row}><StatCard icon="🔥" label="Element" value={rashi.element} /><StatCard icon="📐" label="Quality" value={rashi.quality} /></View>

      <SectionHeader title="Recommended Deity" />
      <Card>
        <View style={s.deityRow}>
          <Text style={s.deityIcon}>🛕</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.deityName}>Lord {deityRecommendation.primaryDeity}</Text>
            <Text style={s.sub}>Primary deity for temple worship</Text>
          </View>
        </View>
        <Text style={s.desc}>{deityRecommendation.description}</Text>
      </Card>

      {forecast ? <><SectionHeader title="Your Forecast" /><Card><Text style={s.desc}>{forecast}</Text></Card></> : null}
      {recommendations.length > 0 ? (
        <>
          <SectionHeader title="Recommendations" />
          <Card>{recommendations.map((r, i) => <Text key={i} style={[s.desc, { marginBottom: spacing.xs }]}>• {r}</Text>)}</Card>
        </>
      ) : null}

      <SectionHeader title="Moon Longitude" />
      <Card>
        <View style={s.coordRow}><Text style={s.label}>Tropical</Text><Text style={s.value}>{moonLongitude.tropical}°</Text></View>
        <View style={s.coordRow}><Text style={s.label}>Sidereal (Lahiri)</Text><Text style={s.value}>{moonLongitude.sidereal}°</Text></View>
        <View style={s.coordRow}><Text style={s.label}>Ayanamsa</Text><Text style={s.value}>{moonLongitude.ayanamsa}°</Text></View>
      </Card>

      <Button title={`Find ${deityRecommendation.primaryDeity} Temples`} onPress={() => navigation.navigate("TempleSearch", { query: `${deityRecommendation.primaryDeity} temple` })} style={{ marginTop: spacing.md }} />
      <Button title="Edit Birth Details" variant="secondary" onPress={() => navigation.navigate("BirthChartForm")} style={{ marginTop: spacing.sm }} />
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.sm },
  statCard: { flex: 1, alignItems: "center", marginBottom: 0 },
  statIconBox: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.peach, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  statIcon: { fontSize: 22 },
  statLabel: { color: colors.textMuted, fontSize: 11, marginBottom: 2 },
  statValue: { color: colors.text, fontSize: 13, fontWeight: "700", textAlign: "center" },
  label: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.xs },
  value: { color: colors.text, fontSize: 16, fontWeight: "700" },
  sub: { color: colors.textMuted, marginTop: spacing.xs, fontSize: 13 },
  empty: { color: colors.textMuted, marginBottom: spacing.md },
  deityRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  deityIcon: { fontSize: 32, marginRight: spacing.md },
  deityName: { color: colors.text, fontSize: 20, fontWeight: "700" },
  desc: { color: colors.text, lineHeight: 20, fontSize: 14 },
  coordRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
});
