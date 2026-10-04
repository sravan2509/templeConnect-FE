import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { colors, spacing } from "../theme";
import { TempleDetail, TempleResult, getTempleDetail } from "../api/temples";
import { createBookmark, createCheckin, deleteBookmark, getBookmarks } from "../api/profile";
import { getErrorMessage } from "../api/client";
import { formatDate, normalizeUrl } from "../utils/format";

export default function TempleDetailScreen({ route, navigation }: any) {
  const paramTemple: Partial<TempleResult> & { placeId: string; name: string } = route.params?.temple;
  const [detail, setDetail] = useState<TempleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [busy, setBusy] = useState<"save" | "checkin" | null>(null);

  const load = useCallback(async () => {
    if (!paramTemple?.placeId) return;
    setLoading(true);
    try {
      setDetail(await getTempleDetail(paramTemple.placeId));
      setLoadError(null);
    } catch (e: any) {
      // 404 just means we only have the basic search info for this temple.
      setLoadError(e?.response?.status === 404 ? null : getErrorMessage(e));
    } finally {
      setLoading(false);
    }
    try {
      const bms = await getBookmarks();
      setBookmarkId(bms.find((b) => b.placeId === paramTemple.placeId)?.id ?? null);
    } catch {}
  }, [paramTemple?.placeId]);

  useEffect(() => { load(); }, [load]);

  if (!paramTemple) return <Screen><Text style={styles.empty}>No temple selected.</Text></Screen>;

  const name = detail?.name ?? paramTemple.name;
  const lat = detail?.lat ?? paramTemple.location?.lat ?? null;
  const lon = detail?.lon ?? paramTemple.location?.lon ?? null;
  const locationText = detail?.address || paramTemple.address || [detail?.city ?? paramTemple.city, detail?.state ?? paramTemple.state].filter(Boolean).join(", ");

  async function toggleBookmark() {
    setBusy("save");
    try {
      if (bookmarkId) {
        await deleteBookmark(bookmarkId);
        setBookmarkId(null);
      } else {
        const b = await createBookmark(paramTemple.placeId, name, locationText || undefined, lat ?? undefined, lon ?? undefined);
        setBookmarkId(b.id);
      }
    } catch (e) { Alert.alert("Error", getErrorMessage(e)); }
    finally { setBusy(null); }
  }

  async function checkIn() {
    setBusy("checkin");
    try {
      await createCheckin(name, paramTemple.placeId, lat ?? undefined, lon ?? undefined);
      Alert.alert("Checked in 🙏", `Your visit to ${name} was added to your visit history.`);
    } catch (e) { Alert.alert("Check-in", getErrorMessage(e)); }
    finally { setBusy(null); }
  }

  async function openLink(url: string) {
    try { await Linking.openURL(url); }
    catch { Alert.alert("Cannot open link", url); }
  }

  const phone = detail?.contactDetails?.match(/\+?[\d\s-]{8,}/)?.[0]?.replace(/[\s-]/g, "");

  return (
    <Screen>
      <Card style={styles.hero}>
        <Text style={styles.heroIcon}>🛕</Text>
        <Text style={styles.heroName}>{name}</Text>
        {detail?.deity ? <Text style={styles.heroSub}>Deity: {detail.deity}</Text> : null}
        {detail?.verified && <Text style={styles.verifiedBadge}>✓ Verified</Text>}
        {detail?.rating ? <Text style={styles.heroSub}>⭐ {detail.rating.toFixed(1)}</Text> : null}
      </Card>

      {loading && <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />}
      {loadError && <Text style={styles.error}>{loadError}</Text>}

      {locationText ? (
        <Card>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{locationText}</Text>
        </Card>
      ) : null}

      {detail?.openingHours?.length ? (
        <Card>
          <Text style={styles.label}>Opening Hours {detail.openNow != null ? (detail.openNow ? "· Open now" : "· Closed now") : ""}</Text>
          {detail.openingHours.map((h) => <Text key={h} style={styles.sub}>{h}</Text>)}
        </Card>
      ) : null}

      {detail?.history ? (
        <Card>
          <Text style={styles.label}>History</Text>
          <Text style={styles.desc}>{detail.history}</Text>
        </Card>
      ) : null}

      {detail?.significance ? (
        <Card>
          <Text style={styles.label}>Significance</Text>
          <Text style={styles.desc}>{detail.significance}</Text>
        </Card>
      ) : null}

      {detail?.pujas?.length ? (
        <Card>
          <Text style={styles.label}>Daily Pujas & Sevas</Text>
          {detail.pujas.map((p) => (
            <Text key={p.id} style={styles.sub}>🪔 {p.name}{p.time ? ` · ${p.time}` : ""}{p.schedule ? ` (${p.schedule})` : ""}</Text>
          ))}
        </Card>
      ) : null}

      {detail?.sevas ? (
        <Card>
          <Text style={styles.label}>Sevas & Offerings</Text>
          <Text style={styles.desc}>{detail.sevas}</Text>
        </Card>
      ) : null}

      {detail?.events?.length ? (
        <Card>
          <Text style={styles.label}>Upcoming Events</Text>
          {detail.events.map((e) => (
            <Text key={e.id} style={styles.sub}>📅 {e.name}: {formatDate(e.date)}{e.time ? ` · ${e.time}` : ""}</Text>
          ))}
        </Card>
      ) : null}

      {(detail?.contactDetails || detail?.websiteLink) ? (
        <Card>
          <Text style={styles.label}>Contact</Text>
          {detail.contactDetails ? (
            <Text style={[styles.sub, phone && styles.link]} onPress={phone ? () => openLink(`tel:${phone}`) : undefined}>📞 {detail.contactDetails}</Text>
          ) : null}
          {detail.websiteLink ? (
            <Text style={[styles.sub, styles.link]} onPress={() => openLink(normalizeUrl(detail.websiteLink!))}>🌐 {detail.websiteLink}</Text>
          ) : null}
        </Card>
      ) : null}

      {!loading && !detail?.history && !detail?.significance && !detail?.events?.length && !detail?.pujas?.length ? (
        <Text style={styles.note}>Detailed history, timings and events haven't been added for this temple yet.</Text>
      ) : null}

      <View style={styles.btnRow}>
        <Button title={bookmarkId ? "★ Saved" : "☆ Save"} variant={bookmarkId ? "primary" : "secondary"} onPress={toggleBookmark} loading={busy === "save"} style={{ flex: 1 }} />
        <Button title="✓ Check in" variant="secondary" onPress={checkIn} loading={busy === "checkin"} style={{ flex: 1 }} />
      </View>
      {lat != null && lon != null && (
        <View style={[styles.btnRow, { marginTop: 0 }]}>
          <Button title="View on Map" variant="secondary" onPress={() => navigation.navigate("Map", { lat, lng: lon, name })} style={{ flex: 1 }} />
          <Button title="Directions" variant="secondary" onPress={() => openLink(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`)} style={{ flex: 1 }} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", paddingVertical: spacing.xl, backgroundColor: colors.peach },
  heroIcon: { fontSize: 48, marginBottom: spacing.sm },
  heroName: { color: colors.text, fontSize: 22, fontWeight: "800", textAlign: "center" },
  heroSub: { color: colors.primaryDark, fontSize: 14, marginTop: spacing.xs, fontWeight: "600" },
  verifiedBadge: { position: "absolute", top: spacing.md, right: spacing.md, backgroundColor: colors.success, color: "#fff", fontSize: 10, fontWeight: "700", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, overflow: "hidden" },
  label: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.xs, textTransform: "uppercase" },
  value: { color: colors.text, fontSize: 15, fontWeight: "600" },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  link: { color: colors.primary, textDecorationLine: "underline" },
  desc: { color: colors.text, fontSize: 14, lineHeight: 20 },
  note: { color: colors.textMuted, fontSize: 13, textAlign: "center", marginVertical: spacing.sm },
  error: { color: colors.danger, marginBottom: spacing.sm },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
  btnRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.sm },
});
