import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { SectionHeader } from "../components/SectionHeader";
import { ListRow } from "../components/ListRow";
import { colors, spacing, radius } from "../theme";
import { TempleResult, getTempleTimings, getTempleEvents, getTempleHistory, setReminder } from "../api/temples";
import { createBookmark, deleteBookmark, getBookmarks } from "../api/profile";
import { getErrorMessage } from "../api/client";

export default function TempleDetailScreen({ route, navigation }: any) {
  const temple: TempleResult = route.params?.temple;
  const [timings, setTimings] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [history, setHistory] = useState<any>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);

  useEffect(() => {
    if (!temple) return;
    (async () => {
      try { setTimings(await getTempleTimings(temple.placeId)); } catch {}
      try { setEvents(await getTempleEvents(temple.placeId)); } catch {}
      try { setHistory(await getTempleHistory(temple.placeId)); } catch {}
      try {
        const bms = await getBookmarks();
        const found = bms.find((b: any) => b.placeId === temple.placeId);
        if (found) { setBookmarked(true); setBookmarkId(found.id); }
      } catch {}
    })();
  }, []);

  async function toggleBookmark() {
    try {
      if (bookmarked && bookmarkId) {
        await deleteBookmark(bookmarkId);
        setBookmarked(false);
      } else {
        const b = await createBookmark(temple.placeId, temple.name, temple.address || "");
        setBookmarked(true);
        setBookmarkId(b.id);
      }
    } catch (e: any) { Alert.alert("Error", getErrorMessage(e)); }
  }

  async function handleReminder() {
    try {
      await setReminder(temple.placeId);
      Alert.alert("Reminder Set", "You'll be reminded about this temple.");
    } catch (e: any) { Alert.alert("Error", getErrorMessage(e)); }
  }

  if (!temple) return <Screen><Text style={styles.empty}>No temple selected.</Text></Screen>;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={styles.hero}>
          <Text style={styles.heroIcon}>🛕</Text>
          <Text style={styles.heroName}>{temple.name}</Text>
        </Card>

        <Card><Text style={styles.label}>Location</Text><Text style={styles.value}>{temple.address || `${temple.city}, ${temple.state}`}</Text></Card>

        {history && (
          <Card><Text style={styles.label}>History</Text><Text style={styles.desc}>{history.history || "A renowned Hindu temple."}</Text><Text style={styles.sub}>Deity: {history.deity || "Various"} · Built: {history.builtCentury || "Ancient"}</Text></Card>
        )}

        {timings && (
          <Card><Text style={styles.label}>Timings</Text><Text style={styles.value}>{timings.openTime} - {timings.closeTime}</Text>
            {timings.dailySevas?.map((s: any, i: number) => <Text key={i} style={styles.sub}>{s.name}: {s.time}</Text>)}
          </Card>
        )}

        {events.length > 0 && (
          <Card><Text style={styles.label}>Upcoming Events</Text>
            {events.map((e: any) => <Text key={e.id} style={styles.sub}>📅 {e.name}: {e.date}</Text>)}
          </Card>
        )}

        <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.md }}>
          <Button title={bookmarked ? "★ Saved" : "☆ Save"} variant={bookmarked ? "primary" : "secondary"} onPress={toggleBookmark} style={{ flex: 1 }} />
          <Button title="🔔 Remind" variant="secondary" onPress={handleReminder} style={{ flex: 1 }} />
        </View>
        <Button title="Book a Puja Here" onPress={() => navigation.navigate("BookPuja")} style={{ marginTop: spacing.sm }} />
        <Button title="View on Map" variant="secondary" onPress={() => navigation.navigate("Map", { lat: temple.location?.lat, lng: temple.location?.lon })} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", paddingVertical: spacing.xl, backgroundColor: colors.peach },
  heroIcon: { fontSize: 48, marginBottom: spacing.sm },
  heroName: { color: colors.text, fontSize: 22, fontWeight: "800", textAlign: "center" },
  label: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.xs, textTransform: "uppercase" },
  value: { color: colors.text, fontSize: 15, fontWeight: "600" },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  desc: { color: colors.text, fontSize: 14, lineHeight: 20 },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
});
