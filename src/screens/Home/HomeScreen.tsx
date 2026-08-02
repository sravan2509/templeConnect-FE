import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radius } from "../../theme";
import { SearchBar } from "../../components/SearchBar";
import { QuickAccessItem } from "../../components/QuickAccessItem";
import { PromoCard } from "../../components/PromoCard";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { SectionHeader } from "../../components/SectionHeader";
import { useAuth } from "../../context/AuthContext";
import { getAstroProfile } from "../../api/astrology";
import { getDailySuggestion, getUnreadCount } from "../../api/admin";
import { getTemplesNearby } from "../../api/temples";

export default function HomeScreen({ navigation }: any) {
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [temples, setTemples] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    (async () => {
      try { setProfile(await getAstroProfile()); } catch {}
      try { setSuggestion(await getDailySuggestion()); } catch {}
      try { const c = await getUnreadCount(); setUnread(c.count); } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      try {
        const deity = profile.deityRecommendation.primaryDeity;
        const nearby = await getTemplesNearby(profile.birthDetails.lat, profile.birthDetails.lng, deity, 200);
        setTemples(nearby.data || []);
      } catch {}
    })();
  }, [profile]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>🛕</Text>
          <Text style={styles.headerTitle}>Temple Connect</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.push("Node", { tabId: "home", nodeId: "notifications" })}>
            <Text style={styles.headerIcon}>🔔{unread > 0 ? <Text style={{ color: colors.danger, fontSize: 10 }}> {unread}</Text> : null}</Text>
          </TouchableOpacity>
          {isAdmin && <TouchableOpacity onPress={() => navigation.navigate("AdminDashboard")}><Text style={styles.headerIcon}>⚙️</Text></TouchableOpacity>}
          <TouchableOpacity onPress={() => navigation.getParent()?.navigate("profile")}><Text style={styles.headerIcon}>👤</Text></TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
        <Text style={styles.greeting}>Namaste{user ? `, ${user.name}` : ""} 🙏</Text>

        {profile ? (
          <>
            <Card style={styles.profileBox}>
              <Text style={styles.sectionTitle}>🌙 {profile.nakshatra.name} (Pada {profile.nakshatra.pada}) · {profile.rashi.name} ({profile.rashi.englishName})</Text>
              <Text style={styles.sub}>{profile.rashi.element} · {profile.rashi.quality} · Ruled by {profile.nakshatra.rulingPlanet}/{profile.rashi.rulingPlanet}</Text>
            </Card>
            <PromoCard title={`🛕 Lord ${profile.deityRecommendation.primaryDeity}`} subtitle="Your recommended deity based on your birth star." onPress={() => navigation.navigate("TempleSearch")} />
            {suggestion && <Card style={styles.sugCard}><Text style={styles.sugTitle}>💫 {suggestion.title}</Text><Text style={styles.sugBody}>{suggestion.body}</Text></Card>}
            {temples.length > 0 && <><SectionHeader title={`${profile.deityRecommendation.primaryDeity} Temples Near You`} />{temples.slice(0, 4).map((t: any, i: number) => <TouchableOpacity key={t.placeId || i} onPress={() => navigation.navigate("TempleDetail", { temple: t })}><Card><Text style={styles.tName}>🛕 {t.name}</Text><Text style={styles.sub}>{t.city}, {t.state}{t.distanceKm ? ` · ${t.distanceKm.toFixed(0)}km` : ""}</Text></Card></TouchableOpacity>)}</>}
          </>
        ) : (
          <Card><Text style={styles.emptyTitle}>Set Up Your Spiritual Profile</Text><Text style={styles.sub}>Enter your birth details to discover your Nakshatra, Rashi, and deity.</Text><Button title="Enter Birth Details" onPress={() => navigation.navigate("BirthChartForm")} style={{ marginTop: spacing.md }} /></Card>
        )}

        <SectionHeader title="Quick Actions" />
        <View style={styles.quickRow}>
          <QuickAccessItem icon="🛕" label="Find Temples" onPress={() => navigation.navigate("TempleSearch")} />
          <QuickAccessItem icon="🪐" label="Birth Chart" onPress={() => navigation.navigate("BirthChartForm")} />
          <QuickAccessItem icon="🛕" label="Book Puja" onPress={() => navigation.navigate("BookPuja")} />
          <QuickAccessItem icon="📖" label="Learn More" onPress={() => navigation.getParent()?.navigate("rituals")} />
        </View>

        <SearchBar placeholder="Search temples, deities, or cities..." onPress={() => navigation.navigate("TempleSearch")} />
        <PromoCard title="Book a Puja Online" subtitle="Browse 18 pujas, select a verified priest, and book your ceremony." onPress={() => navigation.navigate("BookPuja")} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.card, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logo: { fontSize: 24, marginRight: spacing.sm },
  headerTitle: { color: colors.primary, fontSize: 20, fontWeight: "800" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  headerIcon: { fontSize: 20 },
  greeting: { color: colors.text, fontSize: 20, fontWeight: "700", marginBottom: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: spacing.xs },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  profileBox: { backgroundColor: colors.cardAlt, borderColor: colors.primary, borderWidth: 1 },
  sugCard: { borderColor: colors.accent, borderWidth: 1, backgroundColor: colors.cardAlt },
  sugTitle: { color: colors.accent, fontSize: 15, fontWeight: "700", marginBottom: spacing.xs },
  sugBody: { color: colors.text, fontSize: 13, lineHeight: 18 },
  tName: { color: colors.text, fontSize: 15, fontWeight: "700" },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: "700", marginBottom: spacing.xs },
  quickRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.lg },
});
