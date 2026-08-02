import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { SectionHeader } from "../components/SectionHeader";
import { colors, spacing, radius } from "../theme";
import { listPujas, getPriestsByPuja, createBooking, listBookings, cancelBooking, getPriestReviews, Priest, Puja, Booking } from "../api/connect";
import { submitReview } from "../api/admin";
import { getErrorMessage } from "../api/client";

type Step = "pujas" | "priests" | "book" | "bookings";
const LANGUAGES = ["All", "Hindi", "English", "Telugu", "Tamil", "Sanskrit", "Kannada", "Marathi", "Gujarati"];

export default function BookPujaScreen() {
  const [step, setStep] = useState<Step>("pujas");
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [fpujas, setFpujas] = useState<Puja[]>([]);
  const [pq, setPq] = useState("");
  const [selPuja, setSelPuja] = useState<Puja | null>(null);
  const [priests, setPriests] = useState<Priest[]>([]);
  const [fpriests, setFpriests] = useState<Priest[]>([]);
  const [selPriest, setSelPriest] = useState<Priest | null>(null);
  const [lang, setLang] = useState("All");
  const [rating, setRating] = useState(0);
  const [showLang, setShowLang] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selDate, setSelDate] = useState(new Date());
  const [selHour, setSelHour] = useState(10);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => { loadPujas(); loadBookings(); }, []);
  async function loadPujas() { try { const p = await listPujas(); setPujas(p); setFpujas(p); } catch {} }
  async function loadBookings() { try { setBookings(await listBookings()); } catch {} }

  useEffect(() => { setFpujas(pq ? pujas.filter(p => p.name.toLowerCase().includes(pq.toLowerCase())) : pujas); }, [pq, pujas]);
  useEffect(() => {
    let l = [...priests];
    if (lang !== "All") l = l.filter(p => p.languages.toLowerCase().includes(lang.toLowerCase()));
    if (rating > 0) l = l.filter(p => p.rating >= rating);
    setFpriests(l);
  }, [lang, rating, priests]);

  async function selectPuja(p: Puja) { setSelPuja(p); setLoading(true); try { const pr = await getPriestsByPuja(p.id); setPriests(pr); setFpriests(pr); setStep("priests"); } catch {} setLoading(false); }
  function selectPriest(p: Priest) { setSelPriest(p); setStep("book"); }
  function getISO() { const d = new Date(selDate); d.setHours(selHour, 0, 0, 0); return d.toISOString(); }

  async function handleBook() {
    if (!selPriest || !selPuja) return;
    try { await createBooking(selPriest.id, selPuja.id, getISO()); Alert.alert("Booked!", `Pending confirmation from priest.`); setStep("bookings"); loadBookings(); }
    catch (e: any) { Alert.alert("Error", getErrorMessage(e)); }
  }

  async function handleReschedule(bid: string) {
    Alert.alert("Reschedule", "Cancel current booking and create a new one. Select date/time again.", [
      { text: "Cancel" },
      { text: "Proceed", onPress: async () => {
        await cancelBooking(bid);
        setStep("pujas"); setSelPuja(null); setSelPriest(null);
        loadBookings();
      }},
    ]);
  }

  async function handleCancel(bid: string) {
    Alert.alert("Cancel Booking", "Are you sure?", [
      { text: "No" },
      { text: "Yes, Cancel", style: "destructive", onPress: async () => {
        try { await cancelBooking(bid); loadBookings(); } catch (e: any) { Alert.alert("Error", getErrorMessage(e)); }
      }},
    ]);
  }

  async function handleReview(bid: string, pid: string) {
    try { await submitReview(pid, 5); Alert.alert("Thanks!", "Review submitted."); loadBookings(); }
    catch (e: any) { Alert.alert("Error", getErrorMessage(e)); }
  }

  function renderDateGrid() {
    const dates = [];
    for (let i = 0; i < 14; i++) { const d = new Date(); d.setDate(d.getDate() + i); dates.push(d); }
    return (
      <View style={styles.dateGrid}>
        <Text style={styles.label}>Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dates.map((d, i) => { const is = d.toDateString() === selDate.toDateString(); return <TouchableOpacity key={i} style={[styles.dChip, is && styles.dChipA]} onPress={() => setSelDate(d)}><Text style={[styles.dChipT, is && styles.dChipTA]}>{d.getDate()}/{d.getMonth() + 1}</Text></TouchableOpacity>; })}
        </ScrollView>
        <Text style={[styles.label, { marginTop: spacing.sm }]}>Time</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(h => { const a = selHour === h; return <TouchableOpacity key={h} style={[styles.chip, a && styles.chipA]} onPress={() => setSelHour(h)}><Text style={[styles.chipT, a && styles.chipTA]}>{h}:00</Text></TouchableOpacity>; })}
        </View>
      </View>
    );
  }

  if (loading) return <Screen><Text style={styles.loading}>Loading...</Text></Screen>;
  const steps: Step[] = ["pujas", "priests", "book", "bookings"];
  return (
    <Screen scroll={false}>
      <View style={styles.stepRow}>{steps.map(s => <TouchableOpacity key={s} onPress={() => { if (s !== "book" || selPriest) setStep(s); }}><Text style={[styles.stepL, step === s && styles.stepLA]}>{s === "pujas" ? "1.Puja" : s === "priests" ? "2.Priest" : s === "book" ? "3.Confirm" : "Bookings"}</Text></TouchableOpacity>)}</View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {step === "pujas" && (<><SectionHeader title="Select Puja" /><TextInput style={styles.input} value={pq} onChangeText={setPq} placeholder="Search pujas..." placeholderTextColor={colors.textMuted} />{fpujas.map(p => <TouchableOpacity key={p.id} onPress={() => selectPuja(p)}><Card><Text style={styles.name}>{p.icon} {p.name}</Text><Text style={styles.sub}>₹{p.basePrice} · {p.duration}</Text></Card></TouchableOpacity>)}</>)}
        {step === "priests" && selPuja && (<><SectionHeader title={`Priests: ${selPuja.name}`} /><Button title="← Back" variant="secondary" onPress={() => setStep("pujas")} style={{ marginBottom: spacing.sm }} /><TouchableOpacity style={styles.fBtn} onPress={() => setShowLang(true)}><Text>🗣️ {lang}</Text></TouchableOpacity><Modal visible={showLang} transparent animationType="slide"><View style={styles.modalO}><View style={styles.modalB}>{LANGUAGES.map(l => <TouchableOpacity key={l} style={[styles.modalI, lang === l && styles.modalIA]} onPress={() => { setLang(l); setShowLang(false); }}><Text style={[styles.modalIT, lang === l && styles.modalITA]}>{l}</Text></TouchableOpacity>)}<Button title="Close" variant="secondary" onPress={() => setShowLang(false)} /></View></View></Modal><View style={styles.chipRow}>{[0, 3, 4, 4.5].map(r => <TouchableOpacity key={r} style={[styles.chip, rating === r && styles.chipA]} onPress={() => setRating(rating === r ? 0 : r)}><Text style={[styles.chipT, rating === r && styles.chipTA]}>⭐{r === 0 ? "All" : r + "+"}</Text></TouchableOpacity>)}</View>{fpriests.map(p => <TouchableOpacity key={p.id} onPress={() => selectPriest(p)}><Card><Text style={styles.name}>{p.verified ? "✅ " : ""}{p.name} ⭐{p.rating}</Text><Text style={styles.sub}>{p.languages} · {p.experienceYears}yrs</Text></Card></TouchableOpacity>)}</>)}
        {step === "book" && selPriest && selPuja && (<>
          <Card><Text style={styles.name}>{selPuja.icon} {selPuja.name} · ₹{selPuja.basePrice}</Text></Card>
          <Card><Text style={styles.name}>🧑‍🦱 {selPriest.name} ⭐{selPriest.rating}</Text><Text style={styles.sub}>{selPriest.languages} · {selPriest.experienceYears}yrs</Text></Card>
          {reviews.length > 0 && <Card><Text style={styles.name}>Reviews ({reviews.length})</Text>{reviews.map((r: any, i: number) => <Text key={r.id || i} style={styles.sub}>⭐{r.rating} - {r.comment || r.user?.name}</Text>)}</Card>}
          {renderDateGrid()}<Button title="Confirm Booking" onPress={handleBook} style={{ marginTop: spacing.md }} /></>)}
        {step === "bookings" && (<><SectionHeader title="My Bookings" />{bookings.length === 0 ? <Text style={styles.empty}>No bookings.</Text> : bookings.map(b => <Card key={b.id}><Text style={styles.name}>{b.puja?.icon} {b.puja?.name}</Text><Text style={styles.sub}>Priest: {b.priest?.name}</Text><Text style={styles.sub}>{new Date(b.scheduledAt).toLocaleString()}</Text><Text style={[styles.status, b.status === "confirmed" && { color: colors.success }, b.status === "cancelled" && { color: colors.danger }]}>{b.status.toUpperCase()}</Text>{b.status === "pending" || b.status === "confirmed" ? <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm }}><Button title="Cancel" variant="secondary" onPress={() => handleCancel(b.id)} style={{ flex: 1 }} /></View> : null}{b.status === "completed" ? <Button title="⭐ Leave Review" variant="secondary" onPress={() => handleReview(b.id, b.priestId)} style={{ marginTop: spacing.sm }} /> : null}</Card>)}<Button title="Book Another" onPress={() => { setStep("pujas"); setSelPuja(null); setSelPriest(null); }} style={{ marginTop: spacing.md }} /></>)}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: spacing.sm, paddingVertical: spacing.xs, backgroundColor: colors.cardAlt, borderRadius: radius.md },
  stepL: { color: colors.textMuted, fontSize: 11, fontWeight: "600" },
  stepLA: { color: colors.primary },
  input: { backgroundColor: colors.cardAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, marginBottom: spacing.sm },
  name: { color: colors.text, fontSize: 15, fontWeight: "700" },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  loading: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.md },
  chipRow: { flexDirection: "row", gap: 6, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs + 2, borderRadius: radius.sm, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border },
  chipA: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipT: { color: colors.textMuted, fontSize: 12 },
  chipTA: { color: "#fff" },
  status: { color: colors.star, fontSize: 13, fontWeight: "700", marginTop: spacing.xs },
  label: { color: colors.textMuted, fontSize: 12, marginTop: spacing.sm, marginBottom: spacing.xs },
  dateGrid: { marginVertical: spacing.sm },
  dChip: { padding: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border, marginRight: spacing.xs },
  dChipA: { backgroundColor: colors.primary, borderColor: colors.primary },
  dChipT: { color: colors.textMuted, fontSize: 11 },
  dChipTA: { color: "#fff" },
  fBtn: { padding: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  modalO: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)", padding: spacing.lg },
  modalB: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg },
  modalI: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalIA: { backgroundColor: colors.cardAlt },
  modalIT: { color: colors.text, fontSize: 14 },
  modalITA: { color: colors.primary, fontWeight: "700" },
});
