import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { SectionHeader } from "../components/SectionHeader";
import { colors, spacing, radius } from "../theme";
import { useAuth } from "../context/AuthContext";
import { getPriestProfile, getPriestStats, updatePriestProfile, acceptBooking, rejectBooking, listPujas } from "../api/admin";
import { getErrorMessage } from "../api/client";

export default function PriestDashboardScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [pujas, setPujas] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [lang, setLang] = useState("");
  const [bio, setBio] = useState("");
  const [selectedPujas, setSelectedPujas] = useState<string[]>([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try { setPujas(await listPujas()); } catch {}
    try {
      const p = await getPriestProfile(); setProfile(p);
      setName(p.name); setPhone(p.phone || ""); setLang(p.languages); setBio(p.bio || "");
      setSelectedPujas(p.priestPujas?.map((pp: any) => pp.pujaId) || []);
    } catch {}
    try { setStats(await getPriestStats()); } catch {}
  }

  async function handleSaveProfile() {
    try {
      await updatePriestProfile({ name, phone, languages: lang, bio, pujaIds: selectedPujas });
      Alert.alert("Saved", "Profile updated");
      setEditing(false);
      loadData();
    } catch (e: any) { Alert.alert("Error", getErrorMessage(e)); }
  }

  async function handleAccept(bookingId: string) {
    try { await acceptBooking(bookingId); Alert.alert("Accepted", "Booking confirmed. Devotee notified."); loadData(); }
    catch (e: any) { Alert.alert("Error", getErrorMessage(e)); }
  }

  async function handleReject(bookingId: string) {
    try { await rejectBooking(bookingId); Alert.alert("Rejected", "Booking declined."); loadData(); }
    catch (e: any) { Alert.alert("Error", getErrorMessage(e)); }
  }

  function togglePuja(id: string) {
    setSelectedPujas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧑‍🦱 Priest Panel</Text>
        <TouchableOpacity onPress={signOut}><Text style={styles.logoutBtn}>Logout</Text></TouchableOpacity>
      </View>
      <Screen>
        <ScrollView showsVerticalScrollIndicator={false}>
          {profile && (
            <Card style={styles.profileCard}>
              <Text style={styles.name}>{profile.verified ? "✅ " : ""}{profile.name}</Text>
              <Text style={styles.sub}>⭐{profile.rating} · {profile.reviewCount} reviews · {profile.experienceYears} yrs</Text>
              <Text style={styles.sub}>{profile.qualifications}</Text>
            </Card>
          )}

          {stats && (
            <View style={styles.statsRow}>
              <StatBadge label="Total" value={stats.stats.total} />
              <StatBadge label="Pending" value={stats.stats.pending} color={colors.star} />
              <StatBadge label="Confirmed" value={stats.stats.confirmed} color={colors.success} />
              <StatBadge label="Completed" value={stats.stats.completed} color={colors.accent} />
            </View>
          )}

          <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md }}>
            <Button title={editing ? "Cancel" : "✏️ Edit Profile"} onPress={() => setEditing(!editing)}
              variant={editing ? "secondary" : "primary"} style={{ flex: 1 }} />
          </View>

          {editing && (
            <Card style={{ marginBottom: spacing.md }}>
              <Text style={styles.label}>Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} />
              <Text style={styles.label}>Phone</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} />
              <Text style={styles.label}>Languages</Text>
              <TextInput style={styles.input} value={lang} onChangeText={setLang} />
              <Text style={styles.label}>Bio</Text>
              <TextInput style={styles.input} value={bio} onChangeText={setBio} multiline />
              <Text style={styles.label}>My Pujas</Text>
              <View style={styles.chipWrap}>
                {pujas.map(p => (
                  <TouchableOpacity key={p.id} style={[styles.chip, selectedPujas.includes(p.id) && styles.chipActive]}
                    onPress={() => togglePuja(p.id)}>
                    <Text style={[styles.chipText, selectedPujas.includes(p.id) && styles.chipTextActive]}>{p.icon} {p.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Button title="Save Profile" onPress={handleSaveProfile} style={{ marginTop: spacing.sm }} />
            </Card>
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
  profileCard: { alignItems: "center", padding: spacing.lg },
  name: { color: colors.text, fontSize: 18, fontWeight: "700" },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: 12, marginTop: spacing.sm, marginBottom: 2 },
  input: { backgroundColor: colors.cardAlt, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, color: colors.text, padding: spacing.sm, fontSize: 14 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: spacing.xs },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 11 },
  chipTextActive: { color: "#fff" },
  bookingName: { color: colors.text, fontSize: 15, fontWeight: "700" },
  empty: { color: colors.textMuted, textAlign: "center", padding: spacing.lg },
});

const s = StyleSheet.create({
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm, marginHorizontal: 2, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  statVal: { fontSize: 18, fontWeight: "800" },
  statLabel: { color: colors.textMuted, fontSize: 10 },
});
