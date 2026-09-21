import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { SectionHeader } from "../components/SectionHeader";
import { colors, spacing, radius } from "../theme";
import { getAdminDashboard, createPriest, updatePriest, deletePriest, listPujas, createPuja, updatePuja, deletePuja, listKbArticles, createKbArticle, updateKbArticle, deleteKbArticle, createFaq, updateFaq, deleteFaq, listSuggestions, createSuggestion, updateSuggestion, deleteSuggestion, importTemplesCSV } from "../api/admin";
import { getFAQs as getFaqs } from "../api/profile";
import { listPriests } from "../api/connect";
import { getErrorMessage } from "../api/client";

type Tab = "dashboard" | "pujas" | "priests" | "content" | "import";

export default function AdminDashboardScreen() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [pujas, setPujas] = useState<any[]>([]);
  const [priests, setPriests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [showPujaForm, setShowPujaForm] = useState(false);
  const [pn, setPn] = useState(""); const [pd, setPd] = useState(""); const [pp, setPp] = useState("");
  const [pdur, setPdur] = useState(""); const [pcat, setPcat] = useState("general"); const [picon, setPicon] = useState("🛕");
  const [editingPuja, setEditingPuja] = useState<any>(null);

  const [showPriestForm, setShowPriestForm] = useState(false);
  const [prId, setPrId] = useState(""); const [prName, setPrName] = useState(""); const [prEmail, setPrEmail] = useState("");
  const [prPass, setPrPass] = useState(""); const [prPhone, setPrPhone] = useState("");
  const [prLang, setPrLang] = useState(""); const [prExp, setPrExp] = useState("");
  const [prQual, setPrQual] = useState(""); const [prBio, setPrBio] = useState("");
  const [selPujas, setSelPujas] = useState<string[]>([]);
  const [editingPriestId, setEditingPriestId] = useState<string | null>(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const s = await getAdminDashboard();
      setStats(s);
    } catch {}
    try { setPujas(await listPujas()); } catch {}
    try { setPriests(await listPriests()); } catch {}
    setLoading(false);
  }

  // ── Puja handlers ──
  function resetPujaForm() { setPn(""); setPd(""); setPp(""); setPdur(""); setPcat("general"); setPicon("🛕"); setShowPujaForm(false); setEditingPuja(null); }
  function startEditPuja(p: any) { setEditingPuja(p); setPn(p.name); setPd(p.description || ""); setPp(String(p.basePrice)); setPdur(p.duration); setPcat(p.category); setPicon(p.icon); setShowPujaForm(true); }
  async function savePuja() {
    if (!pn.trim()) return Alert.alert("Error", "Name required");
    try {
      const data = { name: pn, description: pd, basePrice: parseInt(pp) || 1000, duration: pdur || "60 mins", category: pcat, icon: picon };
      if (editingPuja) {
        await updatePuja(editingPuja.id, data);
      } else {
        await createPuja(data);
      }
      Alert.alert("Done", editingPuja ? "Puja updated" : "Puja added");
      resetPujaForm(); loadAll();
    } catch (e: any) { Alert.alert("Error", getErrorMessage(e)); }
  }
  async function handleDeletePuja(id: string, name: string) {
    Alert.alert("Delete", `Delete "${name}"?`, [{ text: "Cancel" }, { text: "Delete", style: "destructive", onPress: async () => { await deletePuja(id); loadAll(); } }]);
  }

  // ── Priest handlers ──
  function resetPriestForm() { setPrName(""); setPrEmail(""); setPrPass(""); setPrPhone(""); setPrLang(""); setPrExp(""); setPrQual(""); setPrBio(""); setSelPujas([]); setShowPriestForm(false); setEditingPriestId(null); }
  function startEditPriest(p: any) {
    setEditingPriestId(p.id); setPrName(p.name); setPrEmail(""); setPrPass(""); setPrPhone(p.phone || "");
    setPrLang(p.languages); setPrExp(String(p.experienceYears)); setPrQual(p.qualifications); setPrBio(p.bio || "");
    setSelPujas(p.priestPujas?.map((pp: any) => pp.pujaId) || []);
    setShowPriestForm(true);
  }
  async function savePriest() {
    if (!prName.trim()) return Alert.alert("Error", "Name required");
    try {
      const data: any = { name: prName, phone: prPhone, languages: prLang, experienceYears: parseInt(prExp)||0, qualifications: prQual, bio: prBio, pujaIds: selPujas };
      if (editingPriestId) {
        await updatePriest(editingPriestId, data);
        Alert.alert("Done", "Priest updated");
      } else {
        if (prEmail && prPass) { data.email = prEmail; data.password = prPass; }
        await createPriest(data);
        Alert.alert("Done", "Priest added");
      }
      resetPriestForm(); loadAll();
    } catch (e: any) { Alert.alert("Error", getErrorMessage(e)); }
  }
  async function handleDeletePriest(id: string, name: string) {
    Alert.alert("Delete", `Delete "${name}"?`, [{ text: "Cancel" }, { text: "Delete", style: "destructive", onPress: async () => { await deletePriest(id); loadAll(); } }]);
  }
  function togglePuja(id: string) { setSelPujas(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); }

  if (loading) return <Screen><Text style={styles.loading}>Loading...</Text></Screen>;

  return (
    <Screen scroll={false}>
      <View style={styles.tabRow}>
        {(["dashboard", "pujas", "priests", "content", "import"] as Tab[]).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === "dashboard" ? "📊" : t === "pujas" ? "🛕" : t === "priests" ? "🧑‍🦱" : t === "content" ? "📝" : "📥"}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {tab === "dashboard" && stats && (
          <>
            <SectionHeader title="Analytics" />
            <View style={styles.statsGrid}>
              <StatCard label="Users" value={stats.stats.users} icon="👥" />
              <StatCard label="Pujas" value={stats.stats.pujas} icon="🛕" />
              <StatCard label="Priests" value={stats.stats.priests} icon="🧑‍🦱" />
              <StatCard label="Bookings" value={stats.stats.bookings} icon="📅" />
            </View>
            <SectionHeader title="Recent Bookings" />
            {(stats.recentBookings || []).map((b: any) => (
              <Card key={b.id}>
                <Text style={styles.name}>{b.user?.name} → {b.priest?.name}</Text>
                <Text style={styles.sub}>{b.puja?.name} · {new Date(b.scheduledAt).toLocaleDateString()}</Text>
                <Text style={[styles.chip, b.status === "confirmed" && { color: colors.success }, b.status === "cancelled" && { color: colors.danger }]}>{b.status.toUpperCase()}</Text>
              </Card>
            ))}
          </>
        )}

        {tab === "pujas" && (
          <>
            <Button title={showPujaForm ? "Cancel" : "+ Add Puja"} onPress={() => { setShowPujaForm(!showPujaForm); if (showPujaForm) resetPujaForm(); }} variant={showPujaForm ? "secondary" : "primary"} style={{ marginBottom: spacing.sm }} />
            {showPujaForm && (
              <Card style={{ marginBottom: spacing.md }}>
                <TextField label="Name *" value={pn} onChangeText={setPn} />
                <TextField label="Description" value={pd} onChangeText={setPd} />
                <View style={{ flexDirection: "row", gap: spacing.sm }}>
                  <View style={{ flex: 1 }}><TextField label="Price" value={pp} onChangeText={setPp} keyboardType="numeric" /></View>
                  <View style={{ flex: 1 }}><TextField label="Duration" value={pdur} onChangeText={setPdur} /></View>
                </View>
                <TextField label="Icon" value={picon} onChangeText={setPicon} />
                <Button title={editingPuja ? "Update Puja" : "Save Puja"} onPress={savePuja} style={{ marginTop: spacing.sm }} />
              </Card>
            )}
            {pujas.map(p => (
              <Card key={p.id}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{p.icon} {p.name}</Text>
                    <Text style={styles.sub}>₹{p.basePrice} · {p.duration} · {p.category}</Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: spacing.sm }}>
                    <TouchableOpacity onPress={() => startEditPuja(p)}><Text>✏️</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeletePuja(p.id, p.name)}><Text>🗑️</Text></TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}
          </>
        )}

        {tab === "priests" && (
          <>
            <Button title={showPriestForm ? "Cancel" : "+ Add Priest"} onPress={() => { setShowPriestForm(!showPriestForm); if (showPriestForm) resetPriestForm(); }} variant={showPriestForm ? "secondary" : "primary"} style={{ marginBottom: spacing.sm }} />
            {showPriestForm && (
              <Card style={{ marginBottom: spacing.md }}>
                <TextField label="Name *" value={prName} onChangeText={setPrName} />
                {!editingPriestId && <><TextField label="Email (for login)" value={prEmail} onChangeText={setPrEmail} /><TextField label="Password" value={prPass} onChangeText={setPrPass} secureTextEntry /></>}
                <TextField label="Phone" value={prPhone} onChangeText={setPrPhone} />
                <TextField label="Languages" value={prLang} onChangeText={setPrLang} />
                <TextField label="Experience Years" value={prExp} onChangeText={setPrExp} keyboardType="numeric" />
                <TextField label="Qualifications" value={prQual} onChangeText={setPrQual} />
                <TextField label="Bio" value={prBio} onChangeText={setPrBio} />
                <Text style={styles.label}>Pujas:</Text>
                <View style={styles.chipWrap}>
                  {pujas.map(p => (
                    <TouchableOpacity key={p.id} style={[styles.cChip, selPujas.includes(p.id) && styles.cChipActive]} onPress={() => togglePuja(p.id)}>
                      <Text style={[styles.cChipText, selPujas.includes(p.id) && styles.cChipTextActive]}>{p.icon} {p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Button title={editingPriestId ? "Update Priest" : "Save Priest"} onPress={savePriest} style={{ marginTop: spacing.sm }} />
              </Card>
            )}
            {priests.map(p => (
              <Card key={p.id}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{p.verified ? "✅ " : ""}{p.name} ⭐{p.rating}</Text>
                    <Text style={styles.sub}>{p.languages} · {p.experienceYears}yrs</Text>
                    <Text style={styles.sub}>Pujas: {p.priestPujas?.map((pp: any) => pp.puja.name).join(", ") || "None"}</Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center" }}>
                    <TouchableOpacity onPress={() => startEditPriest(p)}><Text>✏️</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeletePriest(p.id, p.name)}><Text>🗑️</Text></TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}
          </>
        )}

        {tab === "content" && <ContentTab />}

        {tab === "import" && <ImportTab />}
      </ScrollView>
    </Screen>
  );
}

function ContentTab() {
  const [subt, setSubt] = useState<"kb" | "faq" | "sug">("kb");
  const [kb, setKb] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [sugs, setSugs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [q, setQ] = useState("");
  const [ans, setAns] = useState("");

  useEffect(() => {
    if (subt === "kb") { (async () => { try { setKb(await listKbArticles() || []); } catch { } })(); }
    if (subt === "faq") { (async () => { try { setFaqs(await getFaqs() || []); } catch { } })(); }
    if (subt === "sug") { (async () => { try { setSugs(await listSuggestions() || []); } catch { } })(); }
  }, [subt]);

  function resetForm() { setShowForm(false); setEditId(null); setTitle(""); setBody(""); setQ(""); setAns(""); }

  function editItem(item: any) {
    setEditId(item.id); setShowForm(true);
    if (subt === "kb") { setTitle(item.title); setBody(item.summary || item.content || ""); }
    if (subt === "faq") { setQ(item.question); setAns(item.answer); }
    if (subt === "sug") { setTitle(item.title); setBody(item.body); }
  }

  async function handleSave() {
    try {
      if (subt === "kb") {
        if (editId) await updateKbArticle(editId, { title, content: body }); else await createKbArticle({ title, content: body, category: "general" });
        setKb(await listKbArticles() || []);
      }
      if (subt === "faq") {
        if (editId) await updateFaq(editId, { question: q, answer: ans }); else await createFaq({ question: q, answer: ans });
        setFaqs(await getFaqs() || []);
      }
      if (subt === "sug") {
        if (editId) await updateSuggestion(editId, { title, body }); else await createSuggestion({ title, body });
        setSugs(await listSuggestions() || []);
      }
      resetForm();
    } catch (e: any) { Alert.alert("Error", e?.friendlyMessage || "Failed"); }
  }

  async function handleDelete(id: string) {
    Alert.alert("Delete", "Are you sure?", [{ text: "Cancel" }, { text: "Delete", style: "destructive", onPress: async () => {
      try {
        if (subt === "kb") { await deleteKbArticle(id); setKb(await listKbArticles() || []); }
        if (subt === "faq") { await deleteFaq(id); setFaqs(await getFaqs() || []); }
        if (subt === "sug") { await deleteSuggestion(id); setSugs(await listSuggestions() || []); }
      } catch {}
    }}]);
  }

  const items = subt === "kb" ? kb : subt === "faq" ? faqs : sugs;

  return (
    <View>
      <View style={{ flexDirection: "row", marginBottom: spacing.md, gap: spacing.sm }}>
        {(["kb","faq","sug"] as const).map(s => (
          <TouchableOpacity key={s} style={[styles.subtab, subt === s && styles.subtabActive]} onPress={() => { setSubt(s); resetForm(); }}>
            <Text style={[styles.subtabText, subt === s && styles.subtabTextActive]}>{s === "kb" ? "Articles" : s === "faq" ? "FAQs" : "Suggestions"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title={showForm ? "Cancel" : "+ Add"} onPress={() => setShowForm(!showForm)} variant={showForm ? "secondary" : "primary"} style={{ marginBottom: spacing.sm }} />

      {showForm && (
        <Card style={{ marginBottom: spacing.md }}>
          {subt === "faq" ? (
            <><TextField label="Question" value={q} onChangeText={setQ} /><TextField label="Answer" value={ans} onChangeText={setAns} /></>
          ) : (
            <><TextField label="Title" value={title} onChangeText={setTitle} /><TextField label="Body/Content" value={body} onChangeText={setBody} /></>
          )}
          <Button title={editId ? "Update" : "Save"} onPress={handleSave} style={{ marginTop: spacing.sm }} />
        </Card>
      )}

      {items.map((item: any) => (
        <Card key={item.id}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.title || item.question}</Text>
              <Text style={styles.sub}>{item.body || item.answer || item.content}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              <TouchableOpacity onPress={() => editItem(item)}><Text>✏️</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}><Text>🗑️</Text></TouchableOpacity>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}

function ImportTab() {
  const [csvText, setCsvText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    if (!csvText.trim()) { Alert.alert("Error", "Paste CSV data first"); return; }
    setLoading(true);
    try {
      const res = await importTemplesCSV(csvText);
      setResult(res);
      Alert.alert("Import Done", `Created: ${res.created}, Merged: ${res.merged}, Skipped: ${res.skipped}, Google enriched: ${res.googleEnriched}`);
    } catch (e: any) { Alert.alert("Error", e?.friendlyMessage || "Import failed"); }
    setLoading(false);
  }

  return (
    <View>
      <SectionHeader title="Import Temples (CSV)" />
      <Card>
        <Text style={styles.sub}>Paste CSV content with columns: name, city, state, deity, address, lat, lon, phone, website, history, significance, sevas</Text>
        <Text style={styles.sub}>First row must be headers. Duplicate temples (same name+city) are merged automatically. If Google API key is set, missing lat/lon are auto-enriched.</Text>
        <TextField label="CSV Data" value={csvText} onChangeText={setCsvText} placeholder={'name,city,state,deity,lat,lon\nSomeswara Temple,Bhimavaram,Andhra Pradesh,Shiva,16.54,81.78\n...'} />
        <Button title={loading ? "Importing..." : "Import & Merge"} onPress={handleImport} loading={loading} />
      </Card>
      {result && (
        <Card>
          <Text style={styles.name}>Results</Text>
          <Text style={styles.sub}>Created: {result.created} | Merged: {result.merged} | Skipped: {result.skipped} | Google enriched: {result.googleEnriched}</Text>
        </Card>
      )}
    </View>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statIcon}>{icon}</Text>
      <Text style={s.statVal}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: "row", marginBottom: spacing.sm, backgroundColor: colors.cardAlt, borderRadius: radius.md, padding: 2 },
  tab: { flex: 1, paddingVertical: spacing.sm + 2, alignItems: "center", borderRadius: radius.sm },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontWeight: "600", fontSize: 18 },
  tabTextActive: { color: "#fff" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.md },
  name: { color: colors.text, fontSize: 15, fontWeight: "700" },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  chip: { color: colors.star, fontSize: 12, fontWeight: "700", marginTop: spacing.xs },
  label: { color: colors.textMuted, fontSize: 12, marginTop: spacing.sm, marginBottom: 4 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  cChip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border },
  cChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  cChipText: { color: colors.textMuted, fontSize: 11 },
  cChipTextActive: { color: "#fff" },
  loading: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
  empty: { color: colors.textMuted, textAlign: "center", padding: spacing.lg },
  subtab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.cardAlt },
  subtabActive: { backgroundColor: colors.primary },
  subtabText: { color: colors.textMuted, fontSize: 12, fontWeight: "600" },
  subtabTextActive: { color: "#fff" },
  contentCard: { marginBottom: spacing.sm },
});

const s = StyleSheet.create({
  stat: { width: "48%", backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, marginHorizontal: "1%", alignItems: "center", borderWidth: 1, borderColor: colors.border },
  statIcon: { fontSize: 24, marginBottom: spacing.xs },
  statVal: { color: colors.text, fontSize: 24, fontWeight: "800" },
  statLabel: { color: colors.textMuted, fontSize: 11 },
});
