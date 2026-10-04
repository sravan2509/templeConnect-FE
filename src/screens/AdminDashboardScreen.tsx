import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { SectionHeader } from "../components/SectionHeader";
import { AdminHeader } from "../components/AdminHeader";
import { colors, spacing, radius } from "../theme";
import {
  getAdminDashboard, createPriest, updatePriest, deletePriest, listPujas, createPuja, updatePuja, deletePuja,
  listKbArticles, createKbArticle, updateKbArticle, deleteKbArticle, listAdminFaqs, createFaq, updateFaq, deleteFaq,
  listSuggestions, createSuggestion, updateSuggestion, deleteSuggestion, sendDailySuggestionPush,
  AdminStats, KbArticle, KB_CATEGORIES, Puja, PriestInput,
} from "../api/admin";
import { listPriests, Priest } from "../api/connect";
import { isValidEmail } from "../api/auth";
import { getErrorMessage } from "../api/client";
import { formatDate, formatPrice } from "../utils/format";

type Section = "dashboard" | "pujas" | "priests" | "content";
const TITLES: Record<Section, string> = { dashboard: "📊 Dashboard", pujas: "🪔 Pujas", priests: "🧑‍🦱 Priests", content: "📚 Content" };
const PUJA_CATEGORIES = ["general", "home", "planets", "devi", "samskara", "astrology", "spiritual", "shaiva"];

/** Runs a mutation, reports errors, and reloads. */
async function attempt(fn: () => Promise<unknown>, reload: () => void, success?: string) {
  try {
    const result = await fn();
    if (typeof result === "string") Alert.alert("Done", result);
    else if (success) Alert.alert("Done", success);
    reload();
    return true;
  } catch (e) {
    Alert.alert("Error", getErrorMessage(e));
    return false;
  }
}

function confirmDelete(name: string, onConfirm: () => void) {
  Alert.alert("Delete", `Delete "${name}"?`, [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: onConfirm }]);
}

export default function AdminDashboardScreen({ section }: { section: Section }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AdminHeader title={TITLES[section]} />
      {section === "dashboard" && <DashboardSection />}
      {section === "pujas" && <PujasSection />}
      {section === "priests" && <PriestsSection />}
      {section === "content" && <ContentSection />}
    </View>
  );
}

function useLoader<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { setData(await loader()); setError(null); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  return { data, error, loading, load };
}

function Scroll({ children, onRefresh }: { children: React.ReactNode; onRefresh: () => void }) {
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}>
      {children}
    </ScrollView>
  );
}

// ── Dashboard ──────────────────────────────────────────────

function DashboardSection() {
  const { data: stats, error, loading, load } = useLoader<AdminStats>(getAdminDashboard);
  const [sending, setSending] = useState(false);

  async function pushSuggestion() {
    setSending(true);
    try {
      const r = await sendDailySuggestionPush();
      Alert.alert("Sent", `Today's suggestion was sent to ${r.sent} of ${r.total} users (respecting their notification settings).`);
    } catch (e) { Alert.alert("Error", getErrorMessage(e)); }
    finally { setSending(false); }
  }

  return (
    <Scroll onRefresh={load}>
      {loading && <ActivityIndicator color={colors.primary} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {stats && (
        <>
          <View style={styles.statsGrid}>
            <StatCard label="Users" value={stats.stats.users} icon="👥" />
            <StatCard label="Priests" value={stats.stats.priests} icon="🧑‍🦱" />
            <StatCard label="Active Pujas" value={stats.stats.pujas} icon="🪔" />
            <StatCard label="Bookings" value={stats.stats.bookings} icon="📅" />
            <StatCard label="Temples (curated)" value={stats.stats.temples} icon="🛕" />
            <StatCard label="Donations" value={stats.stats.donations} icon="🙏" />
          </View>
          <Button title="Send Today's Suggestion to All Users" variant="secondary" onPress={pushSuggestion} loading={sending} />
          <SectionHeader title="Recent Bookings" />
          {stats.recentBookings.length === 0 && <Text style={styles.empty}>No bookings yet.</Text>}
          {stats.recentBookings.map((b: any) => (
            <Card key={b.id}>
              <Text style={styles.name}>{b.user?.name} → {b.priest?.name}</Text>
              <Text style={styles.sub}>{b.puja?.name} · {formatDate(b.scheduledAt)} · {formatPrice(b.amount)}</Text>
              <Text style={[styles.status, b.status === "confirmed" && { color: colors.success }, b.status === "completed" && { color: colors.accent }, b.status === "cancelled" && { color: colors.danger }]}>
                {b.status.toUpperCase()}{b.paid ? " · PAID" : ""}
              </Text>
            </Card>
          ))}
        </>
      )}
    </Scroll>
  );
}

// ── Pujas ──────────────────────────────────────────────────

function PujasSection() {
  const { data: pujas, error, load } = useLoader<Puja[]>(listPujas);
  const [editing, setEditing] = useState<Puja | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", duration: "", category: "general", icon: "🛕" });
  const [saving, setSaving] = useState(false);

  function startNew() { setEditing(null); setForm({ name: "", description: "", price: "", duration: "", category: "general", icon: "🛕" }); setOpen(true); }
  function startEdit(p: Puja) {
    setEditing(p);
    setForm({ name: p.name, description: p.description || "", price: String(p.basePrice), duration: p.duration, category: p.category, icon: p.icon });
    setOpen(true);
  }

  async function save() {
    const price = Number(form.price);
    if (!form.name.trim()) return Alert.alert("Name required");
    if (!Number.isFinite(price) || price <= 0) return Alert.alert("Invalid price", "Enter a price greater than 0.");
    setSaving(true);
    const data = { name: form.name.trim(), description: form.description.trim() || undefined, basePrice: price, duration: form.duration.trim() || "60 mins", category: form.category, icon: form.icon.trim() || "🛕" };
    const ok = await attempt(() => (editing ? updatePuja(editing.id, data) : createPuja(data)), load, editing ? "Puja updated" : "Puja added");
    setSaving(false);
    if (ok) setOpen(false);
  }

  return (
    <Scroll onRefresh={load}>
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title={open ? "Close Form" : "+ Add Puja"} variant={open ? "secondary" : "primary"} onPress={() => (open ? setOpen(false) : startNew())} style={{ marginBottom: spacing.sm }} />
      {open && (
        <Card>
          <Text style={styles.formTitle}>{editing ? `Edit ${editing.name}` : "New Puja"}</Text>
          <TextField label="Name *" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
          <TextField label="Description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline />
          <View style={styles.row}>
            <View style={{ flex: 1 }}><TextField label="Base price (₹) *" value={form.price} onChangeText={(v) => setForm({ ...form, price: v.replace(/[^\d.]/g, "") })} keyboardType="numeric" /></View>
            <View style={{ flex: 1 }}><TextField label="Duration" value={form.duration} onChangeText={(v) => setForm({ ...form, duration: v })} placeholder="60 mins" /></View>
          </View>
          <TextField label="Icon (emoji)" value={form.icon} onChangeText={(v) => setForm({ ...form, icon: v })} maxLength={4} />
          <Text style={styles.label}>Category</Text>
          <ChipGroup options={PUJA_CATEGORIES} value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          <Button title={editing ? "Update Puja" : "Save Puja"} onPress={save} loading={saving} style={{ marginTop: spacing.md }} />
        </Card>
      )}
      {pujas?.map((p) => (
        <Card key={p.id} style={!p.active ? { opacity: 0.6 } : undefined}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{p.icon} {p.name}{!p.active ? "  (hidden)" : ""}</Text>
              <Text style={styles.sub}>{formatPrice(p.basePrice)} · {p.duration} · {p.category}</Text>
            </View>
            <View style={styles.iconRow}>
              <Switch value={p.active} onValueChange={(v) => { attempt(() => updatePuja(p.id, { active: v }), load); }} trackColor={{ true: colors.primary, false: colors.border }} />
              <IconBtn icon="✏️" label="Edit" onPress={() => startEdit(p)} />
              <IconBtn icon="🗑️" label="Delete" onPress={() => confirmDelete(p.name, () => attempt(() => deletePuja(p.id), load, "Puja deleted"))} />
            </View>
          </View>
        </Card>
      ))}
    </Scroll>
  );
}

// ── Priests ────────────────────────────────────────────────

const emptyPriest = { name: "", email: "", password: "", phone: "", languages: "", experience: "", qualifications: "", bio: "", verified: false, pujaIds: [] as string[] };

function PriestsSection() {
  const { data, error, load } = useLoader(async () => ({ priests: await listPriests(), pujas: await listPujas() }));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyPriest);
  const [saving, setSaving] = useState(false);

  function startNew() { setEditingId(null); setForm(emptyPriest); setOpen(true); }
  function startEdit(p: Priest) {
    setEditingId(p.id);
    setForm({
      ...emptyPriest, name: p.name, phone: p.phone || "", languages: p.languages, experience: String(p.experienceYears),
      qualifications: p.qualifications, bio: p.bio || "", verified: p.verified, pujaIds: p.priestPujas?.map((pp) => pp.pujaId) || [],
    });
    setOpen(true);
  }

  async function save() {
    if (!form.name.trim()) return Alert.alert("Name required");
    if (!editingId && (form.email || form.password)) {
      if (!isValidEmail(form.email)) return Alert.alert("Invalid email");
      if (form.password.length < 8) return Alert.alert("Weak password", "Password must be at least 8 characters.");
    }
    const payload: PriestInput = {
      name: form.name.trim(), phone: form.phone.trim(), languages: form.languages.trim(), experienceYears: parseInt(form.experience, 10) || 0,
      qualifications: form.qualifications.trim(), bio: form.bio.trim(), verified: form.verified, pujaIds: form.pujaIds,
    };
    if (!editingId && form.email) { payload.email = form.email.trim().toLowerCase(); payload.password = form.password; }
    setSaving(true);
    const ok = await attempt(() => (editingId ? updatePriest(editingId, payload) : createPriest(payload)), load, editingId ? "Priest updated" : "Priest added");
    setSaving(false);
    if (ok) setOpen(false);
  }

  const toggle = (id: string) => setForm((f) => ({ ...f, pujaIds: f.pujaIds.includes(id) ? f.pujaIds.filter((x) => x !== id) : [...f.pujaIds, id] }));

  return (
    <Scroll onRefresh={load}>
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title={open ? "Close Form" : "+ Add Priest"} variant={open ? "secondary" : "primary"} onPress={() => (open ? setOpen(false) : startNew())} style={{ marginBottom: spacing.sm }} />
      {open && (
        <Card>
          <Text style={styles.formTitle}>{editingId ? "Edit Priest" : "New Priest"}</Text>
          <TextField label="Name *" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
          {!editingId && (
            <>
              <TextField label="Login email" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} autoCapitalize="none" keyboardType="email-address" hint="Optional — creates an account so the priest can log in" />
              <TextField label="Login password" value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} secureTextEntry placeholder="At least 8 characters" />
            </>
          )}
          <TextField label="Phone" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} keyboardType="phone-pad" />
          <TextField label="Languages" value={form.languages} onChangeText={(v) => setForm({ ...form, languages: v })} placeholder="Hindi, Telugu, English" />
          <TextField label="Experience (years)" value={form.experience} onChangeText={(v) => setForm({ ...form, experience: v.replace(/\D/g, "") })} keyboardType="numeric" />
          <TextField label="Qualifications" value={form.qualifications} onChangeText={(v) => setForm({ ...form, qualifications: v })} />
          <TextField label="Bio" value={form.bio} onChangeText={(v) => setForm({ ...form, bio: v })} multiline />
          <View style={[styles.rowBetween, { marginBottom: spacing.sm }]}>
            <Text style={styles.name}>✅ Verified priest</Text>
            <Switch value={form.verified} onValueChange={(v) => setForm({ ...form, verified: v })} trackColor={{ true: colors.primary, false: colors.border }} />
          </View>
          <Text style={styles.label}>Pujas offered</Text>
          <View style={styles.chipWrap}>
            {data?.pujas.map((p) => (
              <TouchableOpacity key={p.id} style={[styles.chip, form.pujaIds.includes(p.id) && styles.chipActive]} onPress={() => toggle(p.id)}>
                <Text style={[styles.chipText, form.pujaIds.includes(p.id) && styles.chipTextActive]}>{p.icon} {p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button title={editingId ? "Update Priest" : "Save Priest"} onPress={save} loading={saving} style={{ marginTop: spacing.md }} />
        </Card>
      )}
      {data?.priests.map((p) => (
        <Card key={p.id}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{p.verified ? "✅ " : ""}{p.name} · ⭐ {p.rating.toFixed(1)} ({p.reviewCount})</Text>
              <Text style={styles.sub}>{p.languages || "—"} · {p.experienceYears} yrs{p.userId ? "" : " · no login"}</Text>
              <Text style={styles.sub}>Pujas: {p.priestPujas?.map((pp) => pp.puja.name).join(", ") || "None"}</Text>
            </View>
            <View style={styles.iconRow}>
              <IconBtn icon="✏️" label="Edit" onPress={() => startEdit(p)} />
              <IconBtn icon="🗑️" label="Delete" onPress={() => confirmDelete(p.name, () => attempt(() => deletePriest(p.id), load, "Priest deleted"))} />
            </View>
          </View>
        </Card>
      ))}
    </Scroll>
  );
}

// ── Content: articles, FAQs, suggestions ───────────────────

type Sub = "kb" | "faq" | "sug";
const SUB_LABELS: Record<Sub, string> = { kb: "Articles", faq: "FAQs", sug: "Suggestions" };

function ContentSection() {
  const [sub, setSub] = useState<Sub>("kb");
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.subtabs}>
        {(Object.keys(SUB_LABELS) as Sub[]).map((s) => (
          <TouchableOpacity key={s} style={[styles.subtab, sub === s && styles.subtabActive]} onPress={() => setSub(s)}>
            <Text style={[styles.subtabText, sub === s && styles.subtabTextActive]}>{SUB_LABELS[s]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {sub === "kb" && <ArticlesEditor />}
      {sub === "faq" && <FaqEditor />}
      {sub === "sug" && <SuggestionEditor />}
    </View>
  );
}

function ArticlesEditor() {
  const { data, error, load } = useLoader<KbArticle[]>(listKbArticles);
  const [form, setForm] = useState({ title: "", summary: "", content: "", category: "cultural" as KbArticle["category"] });
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.title.trim() || !form.content.trim()) return Alert.alert("Missing fields", "Title and content are required.");
    setSaving(true);
    const payload = { title: form.title.trim(), summary: form.summary.trim() || undefined, content: form.content.trim(), category: form.category };
    const ok = await attempt(() => (editId ? updateKbArticle(editId, payload) : createKbArticle(payload)), load, "Article saved");
    setSaving(false);
    if (ok) { setOpen(false); setEditId(null); }
  }

  return (
    <Scroll onRefresh={load}>
      {error && <Text style={styles.error}>{error}</Text>}
      <Text style={styles.hint}>Articles appear in Rituals → Knowledge Base. Built-in starter articles show for any category without your own articles.</Text>
      <Button title={open ? "Close Form" : "+ Add Article"} variant={open ? "secondary" : "primary"} onPress={() => { setOpen(!open); setEditId(null); setForm({ title: "", summary: "", content: "", category: "cultural" }); }} style={{ marginBottom: spacing.sm }} />
      {open && (
        <Card>
          <Text style={styles.label}>Category</Text>
          <ChipGroup options={KB_CATEGORIES} value={form.category} onChange={(v) => setForm({ ...form, category: v as KbArticle["category"] })} />
          <TextField label="Title *" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
          <TextField label="Summary" value={form.summary} onChangeText={(v) => setForm({ ...form, summary: v })} hint="Optional — generated from the content if left blank" />
          <TextField label="Content *" value={form.content} onChangeText={(v) => setForm({ ...form, content: v })} multiline style={{ minHeight: 140 }} />
          <Button title={editId ? "Update Article" : "Save Article"} onPress={save} loading={saving} />
        </Card>
      )}
      {data?.length === 0 && <Text style={styles.empty}>No articles yet.</Text>}
      {data?.map((a) => (
        <Card key={a.id}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{a.title}</Text>
              <Text style={styles.sub}>{a.category} · {a.summary}</Text>
            </View>
            <View style={styles.iconRow}>
              <IconBtn icon="✏️" label="Edit" onPress={() => { setEditId(a.id); setForm({ title: a.title, summary: a.summary, content: a.content, category: a.category }); setOpen(true); }} />
              <IconBtn icon="🗑️" label="Delete" onPress={() => confirmDelete(a.title, () => attempt(() => deleteKbArticle(a.id), load))} />
            </View>
          </View>
        </Card>
      ))}
    </Scroll>
  );
}

function FaqEditor() {
  const { data, error, load } = useLoader(listAdminFaqs);
  const [form, setForm] = useState({ question: "", answer: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.question.trim() || !form.answer.trim()) return Alert.alert("Missing fields", "Question and answer are required.");
    setSaving(true);
    const payload = { question: form.question.trim(), answer: form.answer.trim() };
    const ok = await attempt(() => (editId ? updateFaq(editId, payload) : createFaq(payload)), load, "FAQ saved");
    setSaving(false);
    if (ok) { setOpen(false); setEditId(null); }
  }

  return (
    <Scroll onRefresh={load}>
      {error && <Text style={styles.error}>{error}</Text>}
      <Text style={styles.hint}>Until you add FAQs here, users see a built-in default set.</Text>
      <Button title={open ? "Close Form" : "+ Add FAQ"} variant={open ? "secondary" : "primary"} onPress={() => { setOpen(!open); setEditId(null); setForm({ question: "", answer: "" }); }} style={{ marginBottom: spacing.sm }} />
      {open && (
        <Card>
          <TextField label="Question *" value={form.question} onChangeText={(v) => setForm({ ...form, question: v })} />
          <TextField label="Answer *" value={form.answer} onChangeText={(v) => setForm({ ...form, answer: v })} multiline />
          <Button title={editId ? "Update FAQ" : "Save FAQ"} onPress={save} loading={saving} />
        </Card>
      )}
      {data?.length === 0 && <Text style={styles.empty}>No custom FAQs yet.</Text>}
      {data?.map((f) => (
        <Card key={f.id}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{f.question}</Text>
              <Text style={styles.sub}>{f.answer}</Text>
            </View>
            <View style={styles.iconRow}>
              <IconBtn icon="✏️" label="Edit" onPress={() => { setEditId(f.id); setForm({ question: f.question, answer: f.answer }); setOpen(true); }} />
              <IconBtn icon="🗑️" label="Delete" onPress={() => confirmDelete(f.question, () => attempt(() => deleteFaq(f.id), load))} />
            </View>
          </View>
        </Card>
      ))}
    </Scroll>
  );
}

function SuggestionEditor() {
  const { data, error, load } = useLoader(listSuggestions);
  const [form, setForm] = useState({ title: "", body: "", nakshatra: "", rashi: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.title.trim() || !form.body.trim()) return Alert.alert("Missing fields", "Title and message are required.");
    setSaving(true);
    const payload = { title: form.title.trim(), body: form.body.trim(), nakshatra: form.nakshatra.trim() || null, rashi: form.rashi.trim() || null };
    const ok = await attempt(() => (editId ? updateSuggestion(editId, payload) : createSuggestion(payload)), load, "Suggestion saved");
    setSaving(false);
    if (ok) { setOpen(false); setEditId(null); }
  }

  return (
    <Scroll onRefresh={load}>
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title={open ? "Close Form" : "+ Add Suggestion"} variant={open ? "secondary" : "primary"} onPress={() => { setOpen(!open); setEditId(null); setForm({ title: "", body: "", nakshatra: "", rashi: "" }); }} style={{ marginBottom: spacing.sm }} />
      {open && (
        <Card>
          <TextField label="Title *" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
          <TextField label="Message *" value={form.body} onChangeText={(v) => setForm({ ...form, body: v })} multiline />
          <TextField label="Only for Nakshatra" value={form.nakshatra} onChangeText={(v) => setForm({ ...form, nakshatra: v })} placeholder="e.g. Revati (leave blank for everyone)" />
          <TextField label="Only for Rashi" value={form.rashi} onChangeText={(v) => setForm({ ...form, rashi: v })} placeholder="e.g. Meena (leave blank for everyone)" />
          <Button title={editId ? "Update" : "Save"} onPress={save} loading={saving} />
        </Card>
      )}
      {data?.map((s) => (
        <Card key={s.id}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{s.title}</Text>
              <Text style={styles.sub}>{s.body}</Text>
              <Text style={styles.sub}>For: {[s.nakshatra, s.rashi].filter(Boolean).join(" · ") || "Everyone"}</Text>
            </View>
            <View style={styles.iconRow}>
              <IconBtn icon="✏️" label="Edit" onPress={() => { setEditId(s.id!); setForm({ title: s.title, body: s.body, nakshatra: s.nakshatra || "", rashi: s.rashi || "" }); setOpen(true); }} />
              <IconBtn icon="🗑️" label="Delete" onPress={() => confirmDelete(s.title, () => attempt(() => deleteSuggestion(s.id!), load))} />
            </View>
          </View>
        </Card>
      ))}
    </Scroll>
  );
}

// ── Small building blocks ──────────────────────────────────

function ChipGroup({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.chipWrap}>
      {options.map((o) => (
        <TouchableOpacity key={o} style={[styles.chip, value === o && styles.chipActive]} onPress={() => onChange(o)}>
          <Text style={[styles.chipText, value === o && styles.chipTextActive]}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function IconBtn({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={8} accessibilityLabel={label} style={{ padding: 4 }}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
    </TouchableOpacity>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, marginBottom: spacing.sm },
  empty: { color: colors.textMuted, textAlign: "center", marginVertical: spacing.md },
  hint: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.sm },
  name: { color: colors.text, fontSize: 15, fontWeight: "700" },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  status: { color: colors.star, fontSize: 12, fontWeight: "800", marginTop: spacing.xs },
  formTitle: { color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: spacing.sm },
  label: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.xs },
  row: { flexDirection: "row", gap: spacing.sm },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  iconRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs + 2, borderRadius: radius.sm, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 12 },
  chipTextActive: { color: "#fff", fontWeight: "700" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  stat: { width: "31%", flexGrow: 1, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, alignItems: "center" },
  statIcon: { fontSize: 22 },
  statVal: { color: colors.text, fontSize: 22, fontWeight: "800" },
  statLabel: { color: colors.textMuted, fontSize: 11, textAlign: "center" },
  subtabs: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.md, paddingTop: spacing.md },
  subtab: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.cardAlt, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  subtabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  subtabText: { color: colors.text, fontWeight: "600" },
  subtabTextActive: { color: "#fff" },
});
