import { useState, useCallback, useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { colors, spacing, radius } from "../../theme";
import { SearchBar } from "../../components/SearchBar";
import { PromoCard } from "../../components/PromoCard";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { SectionHeader } from "../../components/SectionHeader";
import { useAuth } from "../../context/AuthContext";
import { getAstroProfile, AstroProfile } from "../../api/astrology";
import { getDailySuggestion, DailySuggestion, getUnreadCount } from "../../api/admin";
import { getTemplesNearby, TempleResult } from "../../api/temples";

export default function HomeScreen({ navigation }: any) {
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState<AstroProfile | null>(null);
  const [suggestion, setSuggestion] = useState<DailySuggestion | null>(null);
  const [temples, setTemples] = useState<TempleResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        try { 
          const prof = await getAstroProfile();
          if (isActive) setProfile(prof);
        } catch {}
        try { 
          const sug = await getDailySuggestion();
          if (isActive) setSuggestion(sug);
        } catch {}
        try {
          const res = await getUnreadCount();
          if (isActive) setUnreadCount(res.count);
        } catch {}
        if (isActive) setLoading(false);
      })();
      return () => { isActive = false; };
    }, [])
  );

  useEffect(() => {
    if (!profile) return;
    (async () => {
      try {
        const deity = profile.deityRecommendation.primaryDeity;
        const nearby = await getTemplesNearby(profile.birthDetails.lat, profile.birthDetails.lng, deity, 500);
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
            <View>
              <Text style={styles.headerIcon}>🔔</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          {isAdmin && <TouchableOpacity onPress={() => navigation.navigate("AdminDashboard")}>
            <Text style={styles.headerIcon}>⚙️</Text>
          </TouchableOpacity>}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Namaste{user ? `, ${user.name}` : ""} 🙏</Text>

        {loading ? <Text style={styles.loading}>Loading your spiritual profile...</Text> : profile ? (
          <>
            <Card style={styles.profileCardBox}>
              <Text style={styles.sectionTitle}>🌙 Your Nakshatra: {profile.nakshatra.name} (Pada {profile.nakshatra.pada})</Text>
              <Text style={styles.sub}>Rashi: {profile.rashi.name} ({profile.rashi.englishName}) · {profile.rashi.element} · {profile.rashi.quality}</Text>
              <Text style={styles.sub}>Ruled by {profile.nakshatra.rulingPlanet} (Nak) / {profile.rashi.rulingPlanet} (Rashi)</Text>
            </Card>

            <PromoCard title={`🛕 Lord ${profile.deityRecommendation.primaryDeity}`}
              subtitle={`Your recommended deity for temple worship based on ${profile.nakshatra.name} Nakshatra.`}
              onPress={() => navigation.navigate("TempleSearch")} />

            {suggestion && (
              <Card style={styles.sugCard}>
                <Text style={styles.sugTitle}>💫 {suggestion.title}</Text>
                <Text style={styles.sugBody}>{suggestion.body}</Text>
              </Card>
            )}

            {temples.length > 0 && (
              <>
                <SectionHeader title={`${profile.deityRecommendation.primaryDeity} Temples Near You`} />
                {temples.map((t, i) => (
                  <TouchableOpacity key={i} onPress={() => navigation.navigate("TempleDetail", { temple: t })}>
                    <Card>
                      <Text style={styles.templeName}>🛕 {t.name}</Text>
                      <Text style={styles.sub}>{t.city}, {t.state} {t.distanceKm ? `· ${t.distanceKm.toFixed(0)} km` : ""}</Text>
                    </Card>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        ) : (
          <Card>
            <Text style={styles.emptyTitle}>Set Up Your Spiritual Profile</Text>
            <Text style={styles.sub}>Enter your birth details to discover your Nakshatra, Rashi, and personalized deity recommendations.</Text>
            <Button title="Enter Birth Details" onPress={() => navigation.navigate("BirthChartForm")} style={{ marginTop: spacing.md }} />
          </Card>
        )}

        <Button title={profile ? "Edit Birth Details" : "Enter Birth Details"}
          onPress={() => navigation.navigate("BirthChartForm")}
          variant={profile ? "secondary" : "primary"} style={{ marginTop: spacing.sm }} />

        <SearchBar placeholder="Search temples by name or deity..." onPress={() => navigation.navigate("TempleSearch")} />

        <PromoCard title="🛕 Book a Puja" subtitle="Browse pujas, select a priest, and book your ceremony"
          onPress={() => navigation.navigate("BookPuja")} />
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
  headerIcon: { fontSize: 20, marginLeft: spacing.md },
  badge: { position: "absolute", top: -4, right: -4, backgroundColor: colors.primary, borderRadius: 10, width: 18, height: 18, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.card },
  badgeText: { color: colors.card, fontSize: 10, fontWeight: "700" },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  greeting: { color: colors.text, fontSize: 20, fontWeight: "700", marginBottom: spacing.md },
  loading: { color: colors.textMuted, textAlign: "center", marginVertical: spacing.lg },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "700", marginBottom: spacing.xs },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  profileCardBox: { backgroundColor: colors.cardAlt, borderColor: colors.primary, borderWidth: 1 },
  sugCard: { borderColor: colors.accent, borderWidth: 1, backgroundColor: colors.cardAlt },
  sugTitle: { color: colors.accent, fontSize: 15, fontWeight: "700", marginBottom: spacing.xs },
  sugBody: { color: colors.text, fontSize: 13, lineHeight: 18 },
  templeName: { color: colors.text, fontSize: 15, fontWeight: "700" },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: "700", marginBottom: spacing.xs },
});
