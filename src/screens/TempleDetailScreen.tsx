import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View, Linking } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { colors, spacing } from "../theme";
import { TempleResult, getTempleDetail } from "../api/temples";
import { createBookmark, deleteBookmark, getBookmarks } from "../api/profile";
import { getErrorMessage } from "../api/client";

export default function TempleDetailScreen({ route, navigation }: any) {
  const paramTemple: TempleResult = route.params?.temple;
  const [templeData, setTempleData] = useState<any>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);

  useEffect(() => {
    if (!paramTemple) return;
    (async () => {
      try { 
        const detail = await getTempleDetail(paramTemple.placeId);
        setTempleData(detail);
      } catch {}
      try {
        const bms = await getBookmarks();
        const found = bms.find((b: any) => b.placeId === paramTemple.placeId);
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
        const b = await createBookmark(paramTemple.placeId, paramTemple.name, paramTemple.address || "");
        setBookmarked(true);
        setBookmarkId(b.id);
      }
    } catch (e: any) { Alert.alert("Error", getErrorMessage(e)); }
  }

  if (!paramTemple) return <Screen><Text style={styles.empty}>No temple selected.</Text></Screen>;

  const displayData = templeData || paramTemple;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={styles.hero}>
          <Text style={styles.heroIcon}>🛕</Text>
          <Text style={styles.heroName}>{displayData.name}</Text>
          {displayData.source === "db" && <Text style={styles.verifiedBadge}>✓ Verified</Text>}
        </Card>

        <Card>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{displayData.address || `${displayData.city || ""}, ${displayData.state || ""}`.replace(/^, /, "")}</Text>
        </Card>

        {templeData && (
          <>
            <Card>
              <Text style={styles.label}>About</Text>
              <Text style={styles.desc}>{templeData.history || "A renowned Hindu temple."}</Text>
              <Text style={styles.sub}>Deity: {templeData.deity || "Various"} · Built: {templeData.builtCentury || "Ancient"}</Text>
            </Card>

            {templeData.significance && (
              <Card>
                <Text style={styles.label}>Significance</Text>
                <Text style={styles.desc}>{templeData.significance}</Text>
              </Card>
            )}

            {templeData.timings && (
              <Card>
                <Text style={styles.label}>Timings</Text>
                <Text style={styles.value}>{templeData.timings.openTime} - {templeData.timings.closeTime}</Text>
              </Card>
            )}

            {templeData.sevas && (
              <Card>
                <Text style={styles.label}>Sevas & Offerings</Text>
                <Text style={styles.desc}>{templeData.sevas}</Text>
              </Card>
            )}

            {templeData.events?.length > 0 && (
              <Card>
                <Text style={styles.label}>Upcoming Events</Text>
                {templeData.events.map((e: any) => <Text key={e.id} style={styles.sub}>📅 {e.name}: {e.date} {e.time ? `(${e.time})` : ""}</Text>)}
              </Card>
            )}

            {(templeData.contactDetails || templeData.websiteLink) && (
              <Card>
                <Text style={styles.label}>Contact Information</Text>
                {templeData.contactDetails && <Text style={styles.sub}>📞 {templeData.contactDetails}</Text>}
                {templeData.websiteLink && (
                  <Text style={[styles.sub, { color: colors.primary }]} onPress={() => Linking.openURL(templeData.websiteLink)}>
                    🌐 {templeData.websiteLink}
                  </Text>
                )}
              </Card>
            )}
          </>
        )}

        <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.lg }}>
          <Button title={bookmarked ? "★ Saved" : "☆ Save"} variant={bookmarked ? "primary" : "secondary"} onPress={toggleBookmark} style={{ flex: 1 }} />
          <Button title="View on Map" variant="secondary" onPress={() => navigation.navigate("Map", { lat: displayData.location?.lat || displayData.lat, lng: displayData.location?.lon || displayData.lon })} style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", paddingVertical: spacing.xl, backgroundColor: colors.peach, position: "relative" },
  heroIcon: { fontSize: 48, marginBottom: spacing.sm },
  heroName: { color: colors.text, fontSize: 22, fontWeight: "800", textAlign: "center" },
  verifiedBadge: { position: "absolute", top: spacing.md, right: spacing.md, backgroundColor: colors.success, color: "#fff", fontSize: 10, fontWeight: "700", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  label: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.xs, textTransform: "uppercase" },
  value: { color: colors.text, fontSize: 15, fontWeight: "600" },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  desc: { color: colors.text, fontSize: 14, lineHeight: 20 },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
});
