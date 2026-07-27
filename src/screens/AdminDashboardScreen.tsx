import { useState, useCallback } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { SectionHeader } from "../components/SectionHeader";
import { colors, spacing, radius } from "../theme";
import { getAdminDashboard, createPriest, updatePriest, deletePriest, AdminStats, listPujas, createPuja, deletePuja, Puja, listKbArticles, createKbArticle, deleteKbArticle, KbArticle } from "../api/admin";
import { listPriests, Priest } from "../api/connect";

export default function AdminDashboardScreen({ navigation }: any) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"dashboard" | "pujas" | "priests" | "kb">("dashboard");
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [priests, setPriests] = useState<Priest[]>([]);
  const [kbArticles, setKbArticles] = useState<KbArticle[]>([]);

  // Add puja form
  const [showAddPuja, setShowAddPuja] = useState(false);
  const [pujaName, setPujaName] = useState("");
  const [pujaDesc, setPujaDesc] = useState("");
  const [pujaPrice, setPujaPrice] = useState("");
  const [pujaDuration, setPujaDuration] = useState("");
  const [pujaCategory, setPujaCategory] = useState("general");
  const [pujaIcon, setPujaIcon] = useState("🛕");

  // Add priest form
  const [showAddPriest, setShowAddPriest] = useState(false);
  const [pName, setPName] = useState("");
  const [pEmail, setPEmail] = useState("");
  const [pPassword, setPPassword] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pLang, setPLang] = useState("");
  const [pExp, setPExp] = useState("");
  const [pQual, setPQual] = useState("");
  const [pBio, setPBio] = useState("");
  const [selectedPujas, setSelectedPujas] = useState<string[]>([]);

  // Add KB form
  const [showAddKb, setShowAddKb] = useState(false);
  const [kbTitle, setKbTitle] = useState("");
  const [kbSummary, setKbSummary] = useState("");
  const [kbContent, setKbContent] = useState("");
  const [kbCategory, setKbCategory] = useState("general");

  useFocusEffect(useCallback(() => { loadAll(); }, []));
  async function loadAll() {
    try { setStats(await getAdminDashboard()); } catch {}
    try { setPujas(await listPujas()); } catch {}
    try { setPriests(await listPriests()); } catch {}
    try { setKbArticles(await listKbArticles()); } catch {}
    setLoading(false);
  }

  async function handleAddPuja() {
    if (!pujaName.trim()) { Alert.alert("Error", "Name required"); return; }
    try {
      await createPuja({ name: pujaName, description: pujaDesc, basePrice: parseInt(pujaPrice) || 1000, duration: pujaDuration || "60 mins", category: pujaCategory, icon: pujaIcon });
      Alert.alert("Done", "Puja added"); setShowAddPuja(false);
      setPujaName(""); setPujaDesc(""); setPujaPrice(""); setPujaDuration("");
      loadAll();
    } catch (e: any) { Alert.alert("Error", e?.friendlyMessage || "Failed"); }
  }

  async function handleDeletePuja(id: string, name: string) {
    Alert.alert("Delete Puja", `Delete "${name}"?`, [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deletePuja(id); loadAll(); } },
    ]);
  }

  async function handleAddPriest() {
    if (!pName.trim()) { Alert.alert("Error", "Name required"); return; }
    try {
      await createPriest({
        name: pName, email: pEmail || undefined, password: pPassword || undefined,
        phone: pPhone || undefined, languages: pLang || undefined,
        experienceYears: pExp ? parseInt(pExp) : undefined,
        qualifications: pQual || undefined, bio: pBio || undefined,
        pujaIds: selectedPujas.length > 0 ? selectedPujas : undefined,
      });
      Alert.alert("Done", "Priest added"); setShowAddPriest(false);
      setPName(""); setPEmail(""); setPPassword(""); setPPhone(""); setPLang(""); setPExp(""); setPQual(""); setPBio(""); setSelectedPujas([]);
      loadAll();
    } catch (e: any) { Alert.alert("Error", e?.friendlyMessage || "Failed"); }
  }

  async function handleDeletePriest(id: string, name: string) {
    Alert.alert("Delete Priest", `Delete "${name}"?`, [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deletePriest(id); loadAll(); } },
    ]);
  }

  async function handleAddKb() {
    if (!kbTitle.trim()) { Alert.alert("Error", "Title required"); return; }
    try {
      await createKbArticle({ title: kbTitle, summary: kbSummary, content: kbContent, category: kbCategory });
      Alert.alert("Done", "Article added"); setShowAddKb(false);
      setKbTitle(""); setKbSummary(""); setKbContent(""); setKbCategory("general");
      loadAll();
    } catch (e: any) { Alert.alert("Error", e?.friendlyMessage || "Failed"); }
  }

  async function handleDeleteKb(id: string, title: string) {
    Alert.alert("Delete Article", `Delete "${title}"?`, [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteKbArticle(id); loadAll(); } },
    ]);
  }

  function togglePujaSelection(pujaId: string) {
    setSelectedPujas(prev => prev.includes(pujaId) ? prev.filter(id => id !== pujaId) : [...prev, pujaId]);
  }

  if (loading) return <Screen scroll={false}><Text style={styles.loading}>Loading...</Text></Screen>;

  return (
    <Screen scroll={false}>
      <View style={styles.tabRow}>
        {(["dashboard", "pujas", "priests", "kb"] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === "dashboard" ? "📊 Stats" : t === "pujas" ? "🛕 Pujas" : t === "priests" ? "🧑‍🦱 Priests" : "📚 KB"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {tab === "dashboard" && stats && (
          <>
            <View style={styles.statsRow}>
              <StatBox label="Users" value={stats.stats.users} />
              <StatBox label="Pujas" value={stats.stats.pujas} />
              <StatBox label="Priests" value={stats.stats.priests} />
              <StatBox label="Bookings" value={stats.stats.bookings} />
            </View>
            <SectionHeader title="Recent Bookings" />
            {stats.recentBookings.map((b: any) => (
              <Card key={b.id}>
                <Text style={styles.cardTitle}>{b.user?.name} → {b.priest?.name}</Text>
                <Text style={styles.sub}>{b.puja?.name} · {new Date(b.scheduledAt).toLocaleDateString()}</Text>
                <Text style={styles.statusChip}>{b.status}</Text>
              </Card>
            ))}
          </>
        )}

        {tab === "pujas" && (
          <>
            <Button title="➕ Add Puja" onPress={() => setShowAddPuja(!showAddPuja)}
              variant={showAddPuja ? "secondary" : "primary"} style={{ marginBottom: spacing.md }} />
            {showAddPuja && (
              <Card style={{ marginBottom: spacing.md }}>
                <TextField label="Puja Name *" value={pujaName} onChangeText={setPujaName} placeholder="e.g. Griha Pravesh" />
                <TextField label="Description" value={pujaDesc} onChangeText={setPujaDesc} />
                <View style={{ flexDirection: "row", gap: spacing.sm }}>
                  <View style={{ flex: 1 }}><TextField label="Price" value={pujaPrice} onChangeText={setPujaPrice} keyboardType="numeric" placeholder="2100" /></View>
                  <View style={{ flex: 1 }}><TextField label="Duration" value={pujaDuration} onChangeText={setPujaDuration} placeholder="60-90 mins" /></View>
                </View>
                <TextField label="Icon" value={pujaIcon} onChangeText={setPujaIcon} placeholder="🛕" />
                <Button title="Save Puja" onPress={handleAddPuja} style={{ marginTop: spacing.sm }} />
              </Card>
            )}
            {pujas.map(p => (
              <Card key={p.id}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{p.icon} {p.name}</Text>
                    <Text style={styles.sub}>{p.description?.substring(0, 80)}</Text>
                    <Text style={styles.sub}>₹{p.basePrice} · {p.duration} · {p.category}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeletePuja(p.id, p.name)}>
                    <Text style={{ color: colors.danger, fontSize: 20 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </>
        )}

        {tab === "priests" && (
          <>
            <Button title="➕ Add Priest" onPress={() => setShowAddPriest(!showAddPriest)}
              variant={showAddPriest ? "secondary" : "primary"} style={{ marginBottom: spacing.md }} />
            {showAddPriest && (
              <Card style={{ marginBottom: spacing.md }}>
                <TextField label="Name *" value={pName} onChangeText={setPName} />
                <TextField label="Email (for login)" value={pEmail} onChangeText={setPEmail} />
                <TextField label="Password" value={pPassword} onChangeText={setPPassword} secureTextEntry />
                <TextField label="Phone" value={pPhone} onChangeText={setPPhone} />
                <TextField label="Languages" value={pLang} onChangeText={setPLang} />
                <TextField label="Experience (years)" value={pExp} onChangeText={setPExp} keyboardType="numeric" />
                <TextField label="Qualifications" value={pQual} onChangeText={setPQual} />
                <TextField label="Bio" value={pBio} onChangeText={setPBio} />
                <Text style={{ color: colors.text, fontWeight: "700", marginTop: spacing.sm, marginBottom: spacing.xs }}>Select Pujas:</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  {pujas.map(puja => (
                    <TouchableOpacity key={puja.id} style={[styles.pujaChip, selectedPujas.includes(puja.id) && styles.pujaChipActive]}
                      onPress={() => togglePujaSelection(puja.id)}>
                      <Text style={[styles.pujaChipText, selectedPujas.includes(puja.id) && styles.pujaChipTextActive]}>{puja.icon} {puja.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Button title="Save Priest" onPress={handleAddPriest} style={{ marginTop: spacing.md }} />
              </Card>
            )}
            {priests.map(p => (
              <Card key={p.id}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{p.verified ? "✅ " : ""}{p.name} ⭐{p.rating}</Text>
                    <Text style={styles.sub}>{p.languages} · {p.experienceYears} yrs exp</Text>
                    <Text style={styles.sub}>Pujas: {p.priestPujas?.map(pp => pp.puja.name).join(", ") || "None"}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeletePriest(p.id, p.name)}>
                    <Text style={{ color: colors.danger, fontSize: 20 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </>
        )}

        {tab === "kb" && (
          <>
            <Button title="➕ Add Article" onPress={() => setShowAddKb(!showAddKb)}
              variant={showAddKb ? "secondary" : "primary"} style={{ marginBottom: spacing.md }} />
            {showAddKb && (
              <Card style={{ marginBottom: spacing.md }}>
                <TextField label="Title *" value={kbTitle} onChangeText={setKbTitle} placeholder="e.g. Temple Etiquette" />
                <TextField label="Summary *" value={kbSummary} onChangeText={setKbSummary} placeholder="Brief summary" />
                <TextField label="Content *" value={kbContent} onChangeText={setKbContent} placeholder="Full content of the article..." />
                <TextField label="Category" value={kbCategory} onChangeText={setKbCategory} placeholder="general / kids / etiquette / cultural" />
                <Button title="Save Article" onPress={handleAddKb} style={{ marginTop: spacing.sm }} />
              </Card>
            )}
            {kbArticles.map(a => (
              <Card key={a.id}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{a.title}</Text>
                    <Text style={styles.sub}>{a.summary}</Text>
                    <Text style={styles.sub}>Category: {a.category}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteKb(a.id, a.title)}>
                    <Text style={{ color: colors.danger, fontSize: 20 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <View style={s.statBox}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: "row", marginBottom: spacing.md, backgroundColor: colors.cardAlt, borderRadius: radius.md, padding: 2 },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: "center", borderRadius: radius.sm },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontWeight: "600", fontSize: 12, textAlign: "center" },
  tabTextActive: { color: "#fff" },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  statusChip: { color: colors.primary, fontSize: 12, marginTop: spacing.xs, fontWeight: "600" },
  loading: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
  pujaChip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs + 2, borderRadius: radius.sm, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border },
  pujaChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pujaChipText: { color: colors.textMuted, fontSize: 11 },
  pujaChipTextActive: { color: "#fff" },
});

const s = StyleSheet.create({
  statBox: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm + 2, marginHorizontal: 2, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  statValue: { color: colors.text, fontSize: 20, fontWeight: "800" },
  statLabel: { color: colors.textMuted, fontSize: 10 },
});
