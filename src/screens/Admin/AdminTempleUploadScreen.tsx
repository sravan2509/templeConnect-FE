import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, Platform, RefreshControl, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { AdminHeader } from "../../components/AdminHeader";
import { colors, spacing } from "../../theme";
import {
  AdminTemple, addTempleEvent, addTemplePuja, deleteDBTemple, deleteTempleEvent, deleteTemplePuja, getTempleTemplateRequest,
  importTemplesCSV, listAllDBTemples, updateDBTemple, uploadTemplesFile,
} from "../../api/admin";
import { getErrorMessage } from "../../api/client";
import { formatDate } from "../../utils/format";

const SOURCE_LABELS: Record<string, string> = {
  upload: "📄 Uploaded",
  import: "📋 Imported (CSV)",
  admin: "✏️ Edited by admin",
  google: "🔎 Saved from Google search",
  search: "🔎 Saved from search",
};

const ACCEPTED_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/comma-separated-values",
  "application/csv",
  "application/vnd.ms-excel",
];

export default function AdminTempleUploadScreen() {
  const [temples, setTemples] = useState<AdminTemple[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"upload" | "template" | "import" | null>(null);
  const [filter, setFilter] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [editing, setEditing] = useState<AdminTemple | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  const fetchTemples = useCallback(async () => {
    try { setTemples(await listAllDBTemples(showSaved)); }
    catch (e) { Alert.alert("Error", getErrorMessage(e)); }
    finally { setLoading(false); }
  }, [showSaved]);

  useFocusEffect(useCallback(() => { fetchTemples(); }, [fetchTemples]));

  async function downloadTemplate() {
    setBusy("template");
    try {
      const { url, headers } = await getTempleTemplateRequest();
      const target = `${FileSystem.cacheDirectory}temple_upload_template.xlsx`;
      const res = await FileSystem.downloadAsync(url, target, { headers });
      if (res.status !== 200) throw new Error(`Download failed (HTTP ${res.status})`);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(res.uri, { mimeType: ACCEPTED_TYPES[0], dialogTitle: "Save the temple template", UTI: "org.openxmlformats.spreadsheetml.sheet" });
      } else {
        Alert.alert("Template downloaded", res.uri);
      }
    } catch (e) {
      Alert.alert("Could not download template", getErrorMessage(e));
    } finally { setBusy(null); }
  }

  async function handleUpload() {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ACCEPTED_TYPES, copyToCacheDirectory: true });
      if (res.canceled) return;
      const file = res.assets[0];
      if (!/\.(xlsx|csv)$/i.test(file.name)) return Alert.alert("Unsupported file", "Please choose a .xlsx or .csv file.");
      setBusy("upload");
      const result = await uploadTemplesFile({ uri: file.uri, name: file.name, type: file.mimeType || "application/octet-stream" });
      const errorText = result.errors?.length ? `\n\nIssues:\n${result.errors.slice(0, 5).join("\n")}${result.errors.length > 5 ? `\n…and ${result.errors.length - 5} more` : ""}` : "";
      Alert.alert("Upload complete", `Created: ${result.created}\nUpdated: ${result.updated}\nSkipped: ${result.skipped}${errorText}`);
      fetchTemples();
    } catch (e) {
      Alert.alert("Upload failed", getErrorMessage(e));
    } finally { setBusy(null); }
  }

  async function handleImport() {
    if (!csvText.trim()) return Alert.alert("Paste CSV data first");
    setBusy("import");
    try {
      const r = await importTemplesCSV(csvText);
      Alert.alert("Import complete", `Created: ${r.created}\nMerged: ${r.merged}\nSkipped: ${r.skipped}\nLocation looked up: ${r.googleEnriched}`);
      setCsvText(""); setShowImport(false);
      fetchTemples();
    } catch (e) { Alert.alert("Import failed", getErrorMessage(e)); }
    finally { setBusy(null); }
  }

  function handleDelete(t: AdminTemple) {
    Alert.alert("Delete temple", `Delete ${t.name} and its events and pujas?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try { await deleteDBTemple(t.id); fetchTemples(); }
        catch (e) { Alert.alert("Error", getErrorMessage(e)); }
      } },
    ]);
  }

  const q = filter.trim().toLowerCase();
  const visible = q ? temples.filter((t) => `${t.name} ${t.city ?? ""} ${t.state ?? ""} ${t.deityName ?? ""}`.toLowerCase().includes(q)) : temples;

  return (
    <View style={styles.safe}>
      <AdminHeader title="🛕 Temples" />
      <FlatList
        data={visible}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={false} onRefresh={fetchTemples} />}
        ListHeaderComponent={
          <>
            <Text style={styles.desc}>Upload an Excel/CSV file (use the template) to add or update temples. Re-uploading updates temples with the same name and city.</Text>
            <View style={styles.btnRow}>
              <Button title="Download Template" variant="secondary" onPress={downloadTemplate} loading={busy === "template"} style={styles.flexBtn} />
              <Button title="Upload File" onPress={handleUpload} loading={busy === "upload"} style={styles.flexBtn} />
            </View>
            <Button title={showImport ? "Hide CSV Paste" : "Paste CSV Instead"} variant="secondary" onPress={() => setShowImport(!showImport)} style={{ marginBottom: spacing.sm }} />
            {showImport && (
              <Card>
                <Text style={styles.sub}>Columns: name, city, state, deity, address, lat, lon, phone, website, history, significance, sevas. First row must be headers. Temples with the same name and city are merged.</Text>
                <TextField value={csvText} onChangeText={setCsvText} multiline autoCapitalize="none" autoCorrect={false}
                  placeholder={"name,city,state,deity,lat,lon\nSomeswara Temple,Bhimavaram,Andhra Pradesh,Shiva,16.54,81.52"} style={{ minHeight: 140, fontFamily: "monospace", fontSize: 13 }} />
                <Button title="Import & Merge" onPress={handleImport} loading={busy === "import"} />
              </Card>
            )}
            <View style={styles.toggleRow}>
              <Text style={styles.sub}>Also show temples saved from user searches</Text>
              <Switch value={showSaved} onValueChange={(v) => { setShowSaved(v); setLoading(true); }} trackColor={{ true: colors.primary, false: colors.border }} />
            </View>
            <TextField value={filter} onChangeText={setFilter} placeholder={`Filter ${temples.length} temples...`} />
            {loading && <ActivityIndicator color={colors.primary} />}
          </>
        }
        ListEmptyComponent={!loading ? <Text style={styles.empty}>{q ? "No temples match." : "No temples in the database yet."}</Text> : null}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={{ flexDirection: "row", gap: spacing.md }}>
                <TouchableOpacity onPress={() => setEditing(item)} hitSlop={8}><Text style={styles.editBtn}>Edit</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={8}><Text style={styles.deleteBtn}>Delete</Text></TouchableOpacity>
              </View>
            </View>
            {item.deityName ? <Text style={styles.sub}>Deity: {item.deityName}</Text> : null}
            {(item.city || item.state) ? <Text style={styles.sub}>📍 {[item.city, item.state].filter(Boolean).join(", ")}</Text> : null}
            <Text style={styles.sub}>{item.events.length} event(s) · {item.templePujas.length} puja(s){item.lat == null ? " · ⚠️ no coordinates" : ""}</Text>
            <Text style={styles.source}>{SOURCE_LABELS[item.source] ?? item.source}</Text>
          </Card>
        )}
      />
      {editing && <TempleEditor temple={editing} onClose={() => setEditing(null)} onSaved={(t) => { setEditing(t); fetchTemples(); }} />}
    </View>
  );
}

type FieldKey = "name" | "deityName" | "address" | "city" | "state" | "contactDetails" | "websiteLink" | "templeHistory" | "significance" | "sevas";
const FIELDS: { key: FieldKey; label: string; multiline?: boolean }[] = [
  { key: "name", label: "Name *" },
  { key: "deityName", label: "Deity" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "contactDetails", label: "Contact details" },
  { key: "websiteLink", label: "Website" },
  { key: "templeHistory", label: "History", multiline: true },
  { key: "significance", label: "Significance", multiline: true },
  { key: "sevas", label: "Sevas & offerings", multiline: true },
];

function TempleEditor({ temple, onClose, onSaved }: { temple: AdminTemple; onClose: () => void; onSaved: (t: AdminTemple) => void }) {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<Record<FieldKey, string>>(() =>
    Object.fromEntries(FIELDS.map((f) => [f.key, (temple[f.key] as string | null) ?? ""])) as Record<FieldKey, string>
  );
  const [lat, setLat] = useState(temple.lat != null ? String(temple.lat) : "");
  const [lon, setLon] = useState(temple.lon != null ? String(temple.lon) : "");
  const [event, setEvent] = useState({ name: "", date: "", time: "" });
  const [puja, setPuja] = useState({ name: "", time: "", schedule: "" });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.name.trim()) return Alert.alert("Name required");
    const latN = lat.trim() ? Number(lat) : null;
    const lonN = lon.trim() ? Number(lon) : null;
    if ((latN !== null && (!Number.isFinite(latN) || Math.abs(latN) > 90)) || (lonN !== null && (!Number.isFinite(lonN) || Math.abs(lonN) > 180))) {
      return Alert.alert("Invalid coordinates", "Latitude must be between -90 and 90, longitude between -180 and 180.");
    }
    setSaving(true);
    try {
      const payload: any = { lat: latN, lon: lonN };
      for (const f of FIELDS) payload[f.key] = form[f.key].trim() || null;
      onSaved(await updateDBTemple(temple.id, payload));
      Alert.alert("Saved", "Temple updated");
    } catch (e) { Alert.alert("Error", getErrorMessage(e)); }
    finally { setSaving(false); }
  }

  async function addEvent() {
    if (!event.name.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(event.date.trim())) return Alert.alert("Event details", "Enter a name and a date as YYYY-MM-DD.");
    try {
      onSaved(await addTempleEvent(temple.id, { name: event.name.trim(), date: event.date.trim(), time: event.time.trim() || undefined }));
      setEvent({ name: "", date: "", time: "" });
    } catch (e) { Alert.alert("Error", getErrorMessage(e)); }
  }

  async function addPuja() {
    if (!puja.name.trim()) return Alert.alert("Puja name required");
    try {
      onSaved(await addTemplePuja(temple.id, { name: puja.name.trim(), time: puja.time.trim() || undefined, schedule: puja.schedule.trim() || undefined }));
      setPuja({ name: "", time: "", schedule: "" });
    } catch (e) { Alert.alert("Error", getErrorMessage(e)); }
  }

  async function remove(fn: () => Promise<void>) {
    try { await fn(); onSaved({ ...temple, ...(await listAllDBTemples()).find((t) => t.id === temple.id)! }); }
    catch (e) { Alert.alert("Error", getErrorMessage(e)); }
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.safe}>
        <View style={[styles.modalHeader, { paddingTop: (Platform.OS === "ios" ? insets.top : 0) + spacing.md }]}>
          <Text style={styles.modalTitle} numberOfLines={1}>Edit {temple.name}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}><Text style={styles.editBtn}>Done</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl + insets.bottom }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
          <Card>
            {FIELDS.map((f) => (
              <TextField key={f.key} label={f.label} value={form[f.key]} onChangeText={(v) => setForm({ ...form, [f.key]: v })} multiline={f.multiline} autoCapitalize={f.key === "websiteLink" ? "none" : "sentences"} />
            ))}
            <View style={styles.btnRow}>
              <View style={{ flex: 1 }}><TextField label="Latitude" value={lat} onChangeText={setLat} keyboardType="numbers-and-punctuation" /></View>
              <View style={{ flex: 1 }}><TextField label="Longitude" value={lon} onChangeText={setLon} keyboardType="numbers-and-punctuation" /></View>
            </View>
            <Button title="Save Details" onPress={save} loading={saving} />
          </Card>

          <Text style={styles.sectionLabel}>Events</Text>
          <Card>
            {temple.events.length === 0 && <Text style={styles.sub}>No events yet.</Text>}
            {temple.events.map((e) => (
              <View key={e.id} style={styles.itemRow}>
                <Text style={styles.itemText}>📅 {e.name} · {formatDate(e.date)}{e.time ? ` · ${e.time}` : ""}</Text>
                <TouchableOpacity onPress={() => remove(() => deleteTempleEvent(temple.id, e.id))} hitSlop={8}><Text style={styles.deleteBtn}>Remove</Text></TouchableOpacity>
              </View>
            ))}
            <TextField label="Event name" value={event.name} onChangeText={(v) => setEvent({ ...event, name: v })} placeholder="Maha Shivaratri" />
            <View style={styles.btnRow}>
              <View style={{ flex: 1 }}><TextField label="Date" value={event.date} onChangeText={(v) => setEvent({ ...event, date: v })} placeholder="YYYY-MM-DD" /></View>
              <View style={{ flex: 1 }}><TextField label="Time" value={event.time} onChangeText={(v) => setEvent({ ...event, time: v })} placeholder="6:00 PM" /></View>
            </View>
            <Button title="+ Add Event" variant="secondary" onPress={addEvent} />
          </Card>

          <Text style={styles.sectionLabel}>Daily Pujas & Sevas</Text>
          <Card>
            {temple.templePujas.length === 0 && <Text style={styles.sub}>No pujas yet.</Text>}
            {temple.templePujas.map((p) => (
              <View key={p.id} style={styles.itemRow}>
                <Text style={styles.itemText}>🪔 {p.name}{p.time ? ` · ${p.time}` : ""}{p.schedule ? ` (${p.schedule})` : ""}</Text>
                <TouchableOpacity onPress={() => remove(() => deleteTemplePuja(temple.id, p.id))} hitSlop={8}><Text style={styles.deleteBtn}>Remove</Text></TouchableOpacity>
              </View>
            ))}
            <TextField label="Puja name" value={puja.name} onChangeText={(v) => setPuja({ ...puja, name: v })} placeholder="Suprabhata Seva" />
            <View style={styles.btnRow}>
              <View style={{ flex: 1 }}><TextField label="Time" value={puja.time} onChangeText={(v) => setPuja({ ...puja, time: v })} placeholder="5:30 AM" /></View>
              <View style={{ flex: 1 }}><TextField label="Schedule" value={puja.schedule} onChangeText={(v) => setPuja({ ...puja, schedule: v })} placeholder="Daily" /></View>
            </View>
            <Button title="+ Add Puja" variant="secondary" onPress={addPuja} />
          </Card>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  desc: { color: colors.textMuted, marginBottom: spacing.md, lineHeight: 20 },
  btnRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  flexBtn: { flex: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "700", flex: 1 },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  editBtn: { color: colors.primary, fontWeight: "700" },
  deleteBtn: { color: colors.danger, fontWeight: "600" },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm, gap: spacing.sm },
  source: { color: colors.primaryDark, fontSize: 12, marginTop: spacing.xs, fontWeight: "600" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.md, paddingBottom: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: "700", flex: 1 },
  sectionLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "700", textTransform: "uppercase", marginTop: spacing.md, marginBottom: spacing.sm },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.xs, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.sm },
  itemText: { color: colors.text, flex: 1 },
});
