import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { colors, radius, spacing } from "../../theme";
import { SearchBar } from "../../components/SearchBar";
import { QuickAccessItem } from "../../components/QuickAccessItem";
import { PromoCard } from "../../components/PromoCard";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { SectionHeader } from "../../components/SectionHeader";
import { useAuth } from "../../context/AuthContext";
import { AstroProfile, getAstroProfile } from "../../api/astrology";
import { DailySuggestion, getDailySuggestion, getUnreadCount } from "../../api/admin";
import { getNearbyEvents, getTemplesNearby, NearbyEvent, TempleResult } from "../../api/temples";
import { formatDate } from "../../utils/format";
import { isProbablyOnline } from "../../utils/network";

type Coords = { latitude: number; longitude: number };

/**
 * Current position, falling back to the last known one. Returns null when no fix is
 * available (e.g. indoors or GPS off) so the screen can show popular temples instead.
 */
async function getDeviceCoords(): Promise<Coords | null> {
  try {
    const pos = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000)),
    ]);
    if (pos) return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch {}
  try {
    const last = await Location.getLastKnownPositionAsync();
    if (last) return { latitude: last.coords.latitude, longitude: last.coords.longitude };
  } catch {}
  return null;
}

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AstroProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [suggestion, setSuggestion] = useState<DailySuggestion | null>(null);
  const [temples, setTemples] = useState<TempleResult[]>([]);
  const [events, setEvents] = useState<NearbyEvent[]>([]);
  const [unread, setUnread] = useState(0);
  const [offline, setOffline] = useState(false);
  const [locationMsg, setLocationMsg] = useState("Locating nearby temples...");
  const [templesLoading, setTemplesLoading] = useState(true);
  const coordsRef = useRef<Coords | null | undefined>(undefined); // undefined = not asked yet, null = unavailable

  // Profile, suggestion and unread count refresh every time Home is shown,
  // so a newly entered birth chart appears immediately.
  const loadProfile = useCallback(async () => {
    const [p, s, c] = await Promise.allSettled([getAstroProfile(), getDailySuggestion(), getUnreadCount()]);
    if (p.status === "fulfilled") setProfile(p.value);
    // Only a 404 means "no birth chart yet"; on network errors keep what we already showed.
    else if ((p.reason as any)?.response?.status === 404) setProfile(null);
    const reachedServer = [p, s, c].some((r) => r.status === "fulfilled" || (r.reason as any)?.response);
    setOffline(!reachedServer);
    if (s.status === "fulfilled") setSuggestion(s.value);
    if (c.status === "fulfilled") setUnread(c.value.count);
    setProfileLoaded(true);
  }, []);

  useFocusEffect(useCallback(() => { loadProfile(); }, [loadProfile]));

  const deity = profile?.deityRecommendation?.primaryDeity;

  const loadNearby = useCallback(async () => {
    setTemplesLoading(true);
    try {
      if (coordsRef.current === undefined) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        coordsRef.current = status === "granted" ? await getDeviceCoords() : null;
      }
      const coords = coordsRef.current;
      if (!coords) {
        setLocationMsg("Couldn't get your location. Showing well-known temples instead — turn on location to see temples near you.");
        const res = await getTemplesNearby(20.5937, 78.9629, deity, 2000);
        setTemples(res.data);
        setEvents([]);
        return;
      }
      const [nearby, ev] = await Promise.all([
        getTemplesNearby(coords.latitude, coords.longitude, deity, 100),
        getNearbyEvents(coords.latitude, coords.longitude).catch(() => [] as NearbyEvent[]),
      ]);
      setEvents(ev);
      if (nearby.data.length > 0) {
        setTemples(nearby.data);
        setLocationMsg("");
      } else {
        setTemples([]);
        setLocationMsg(deity ? `No ${deity} temples found within 100 km. Try searching by city.` : "No temples found within 100 km.");
      }
    } catch {
      setLocationMsg(isProbablyOnline() ? "Could not load nearby temples. Pull down to retry." : "No internet connection. Please check your internet connection and pull down to retry.");
    } finally {
      setTemplesLoading(false);
    }
  }, [deity]);

  // Runs once the profile is known (so we can filter by the recommended deity), and again if it changes.
  useEffect(() => { if (profileLoaded) loadNearby(); }, [profileLoaded, loadNearby]);

  async function onRefresh() {
    if (coordsRef.current === null) coordsRef.current = undefined; // retry location if it failed before
    await loadProfile();
    await loadNearby();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>🛕</Text>
          <Text style={styles.headerTitle}>Temple Connect</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.push("Node", { tabId: "home", nodeId: "notifications" })} hitSlop={10} accessibilityLabel="Notifications">
            <Text style={styles.headerIcon}>🔔</Text>
            {unread > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{unread > 99 ? "99+" : unread}</Text></View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.getParent()?.navigate("profile")} hitSlop={10} accessibilityLabel="Profile">
            <Text style={styles.headerIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }} refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}>
        <Text style={styles.greeting}>Namaste{user ? `, ${user.name}` : ""} 🙏</Text>

        {offline && (
          <View style={styles.offline}>
            <Text style={styles.offlineText}>📡 {isProbablyOnline() ? "Can't reach Temple Connect right now. Please try again in a moment." : "No internet connection. Please check your internet connection."} Pull down to retry.</Text>
          </View>
        )}

        {!profileLoaded ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
        ) : offline && !profile ? null : profile ? (
          <>
            <Card style={styles.profileBox}>
              <Text style={styles.sectionTitle}>🌙 {profile.nakshatra.name} (Pada {profile.nakshatra.pada}) · {profile.rashi.name} ({profile.rashi.englishName})</Text>
              <Text style={styles.sub}>{profile.rashi.element} · {profile.rashi.quality} · Ruled by {profile.nakshatra.rulingPlanet}/{profile.rashi.rulingPlanet}</Text>
            </Card>
            <PromoCard title={`🛕 Lord ${profile.deityRecommendation.primaryDeity}`} subtitle="Your recommended deity based on your birth star. Tap to find temples." onPress={() => navigation.navigate("TempleSearch", { query: `${profile.deityRecommendation.primaryDeity} temple` })} />
          </>
        ) : (
          <Card>
            <Text style={styles.emptyTitle}>Set Up Your Spiritual Profile</Text>
            <Text style={styles.sub}>Enter your birth details to discover your Nakshatra, Rashi, and deity.</Text>
            <Button title="Enter Birth Details" onPress={() => navigation.navigate("BirthChartForm")} style={{ marginTop: spacing.md }} />
          </Card>
        )}

        {suggestion && (
          <Card style={styles.sugCard}>
            <Text style={styles.sugTitle}>💫 {suggestion.title}</Text>
            <Text style={styles.sugBody}>{suggestion.body}</Text>
          </Card>
        )}

        <SectionHeader title={coordsRef.current === null
          ? (deity ? `Popular ${deity} Temples` : "Popular Temples")
          : (deity ? `${deity} Temples Near You` : "Temples Near You")} />
        {templesLoading && temples.length === 0 && <ActivityIndicator color={colors.primary} />}
        {locationMsg !== "" && !templesLoading && <Text style={[styles.sub, { marginBottom: spacing.sm }]}>{locationMsg}</Text>}
        {temples.slice(0, 5).map((t) => (
          <TouchableOpacity key={t.placeId} onPress={() => navigation.navigate("TempleDetail", { temple: t })}>
            <Card>
              <Text style={styles.tName}>🛕 {t.name}</Text>
              <Text style={styles.sub}>
                {[t.city, t.state].filter(Boolean).join(", ") || t.address || ""}
                {t.distanceKm != null && coordsRef.current ? ` · ${t.distanceKm < 1 ? "<1" : t.distanceKm.toFixed(0)} km away` : ""}
              </Text>
            </Card>
          </TouchableOpacity>
        ))}

        {events.length > 0 && (
          <>
            <SectionHeader title="Upcoming Events Nearby" />
            {events.slice(0, 5).map((e) => (
              <TouchableOpacity key={e.id} onPress={() => navigation.navigate("TempleDetail", { temple: { name: e.temple.name, placeId: e.temple.placeId, city: e.temple.city, state: e.temple.state } })}>
                <Card>
                  <Text style={styles.tName}>📅 {e.name}</Text>
                  <Text style={styles.sub}>{e.temple.name} · {formatDate(e.date)}{e.time ? ` · ${e.time}` : ""} · {e.distanceKm} km</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}

        <SectionHeader title="Quick Actions" />
        <View style={styles.quickRow}>
          <QuickAccessItem icon="🛕" label="Find Temples" onPress={() => navigation.navigate("TempleSearch")} />
          <QuickAccessItem icon="🪐" label="Birth Chart" onPress={() => navigation.navigate(profile ? "BirthChartResult" : "BirthChartForm")} />
          <QuickAccessItem icon="🪔" label="Book Puja" onPress={() => navigation.navigate("BookPuja")} />
          <QuickAccessItem icon="📖" label="Learn More" onPress={() => navigation.getParent()?.navigate("rituals")} />
        </View>

        <SearchBar placeholder="Search temples, deities, or cities..." onPress={() => navigation.navigate("TempleSearch")} />
        <PromoCard title="Book a Puja Online" subtitle="Browse pujas, choose a verified priest, and book your ceremony." onPress={() => navigation.navigate("BookPuja")} />
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
  headerRight: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  headerIcon: { fontSize: 22 },
  offline: { backgroundColor: "#FDECEA", borderColor: colors.danger, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  offlineText: { color: colors.danger, fontSize: 13, lineHeight: 18 },
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
  badge: { position: "absolute", top: -6, right: -10, backgroundColor: colors.danger, borderRadius: 10, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
});
