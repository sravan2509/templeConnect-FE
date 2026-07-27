import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, FlatList } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { SectionHeader } from "../components/SectionHeader";
import { colors, spacing, radius } from "../theme";
import { listPujas, getPriestsByPuja, createBooking, listBookings, Priest, Puja, Booking } from "../api/connect";

type Step = "pujas" | "priests" | "book" | "bookings";

const LANGUAGES = ["All", "Hindi", "English", "Telugu", "Tamil", "Sanskrit", "Kannada", "Marathi", "Gujarati", "Punjabi", "Malayalam"];

export default function BookPujaScreen({ navigation }: any) {
  const [step, setStep] = useState<Step>("pujas");
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [filteredPujas, setFilteredPujas] = useState<Puja[]>([]);
  const [pujaQuery, setPujaQuery] = useState("");
  const [selectedPuja, setSelectedPuja] = useState<Puja | null>(null);
  const [priests, setPriests] = useState<Priest[]>([]);
  const [filteredPriests, setFilteredPriests] = useState<Priest[]>([]);
  const [selectedPriest, setSelectedPriest] = useState<Priest | null>(null);
  const [langFilter, setLangFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  // Date/time state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(10);
  const [selectedMin, setSelectedMin] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => { loadPujas(); loadBookings(); }, []);

  async function loadPujas() { try { const p = await listPujas(); setPujas(p); setFilteredPujas(p); } catch {} }
  async function loadBookings() { try { setBookings(await listBookings()); } catch {} }

  useEffect(() => {
    if (!pujaQuery) { setFilteredPujas(pujas); return; }
    setFilteredPujas(pujas.filter(p => p.name.toLowerCase().includes(pujaQuery.toLowerCase())));
  }, [pujaQuery, pujas]);

  useEffect(() => {
    let list = [...priests];
    if (langFilter !== "All") list = list.filter(p => p.languages.toLowerCase().includes(langFilter.toLowerCase()));
    if (ratingFilter > 0) list = list.filter(p => p.rating >= ratingFilter);
    setFilteredPriests(list);
  }, [langFilter, ratingFilter, priests]);

  async function selectPuja(puja: Puja) {
    setSelectedPuja(puja); setLoading(true);
    try { const p = await getPriestsByPuja(puja.id); setPriests(p); setFilteredPriests(p); setStep("priests"); }
    catch { Alert.alert("Error", "Failed to load priests"); }
    setLoading(false);
  }

  function selectPriest(priest: Priest) { setSelectedPriest(priest); setStep("book"); }

  function getScheduledISO() {
    const d = new Date(selectedDate);
    d.setHours(selectedHour, selectedMin, 0, 0);
    return d.toISOString();
  }

  async function handleBook() {
    if (!selectedPriest || !selectedPuja) return;
    try {
      const booking = await createBooking(selectedPriest.id, selectedPuja.id, getScheduledISO());
      Alert.alert("Booked!", `${selectedPuja.name} with ${selectedPriest.name}\nDate: ${selectedDate.toDateString()}\nTime: ${selectedHour}:${String(selectedMin).padStart(2, "0")}\n\nPending confirmation from priest.`);
      setStep("bookings"); loadBookings();
    } catch (e: any) { Alert.alert("Error", e?.friendlyMessage || "Booking failed"); }
  }

  function renderDateGrid() {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return (
      <View style={styles.dateGrid}>
        <Text style={styles.label}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dates.map((d, i) => {
            const isSel = d.toDateString() === selectedDate.toDateString();
            return (
              <TouchableOpacity key={i} style={[styles.dateChip, isSel && styles.dateChipActive]} onPress={() => setSelectedDate(d)}>
                <Text style={[styles.dateChipText, isSel && styles.dateChipTextActive]}>
                  {d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <Text style={[styles.label, { marginTop: spacing.sm }]}>Select Time</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(h => {
            const active = selectedHour === h;
            return (
              <TouchableOpacity key={h} style={[styles.chip, active && styles.chipActive]} onPress={() => { setSelectedHour(h); setSelectedMin(0); }}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{h}:00</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  if (loading) return <Screen scroll={false}><Text style={styles.loading}>Loading...</Text></Screen>;

  return (
    <Screen scroll={false}>
      <View style={styles.stepRow}>
        {(["pujas", "priests", "book", "bookings"] as Step[]).map(s => (
          <TouchableOpacity key={s} onPress={() => { if (s === "pujas" || s === "bookings") setStep(s); }}>
            <Text style={[styles.stepLabel, step === s && styles.stepLabelActive]}>
              {s === "pujas" ? "1.Puja" : s === "priests" ? "2.Priest" : s === "book" ? "3.Confirm" : "Bookings"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>

        {step === "pujas" && (
          <>
            <SectionHeader title="Select a Puja" />
            <TextInput style={styles.input} value={pujaQuery} onChangeText={setPujaQuery} placeholder="Search pujas..." placeholderTextColor={colors.textMuted} />
            {filteredPujas.map(p => (
              <TouchableOpacity key={p.id} onPress={() => selectPuja(p)}>
                <Card><Text style={styles.name}>{p.icon} {p.name}</Text><Text style={styles.sub}>₹{p.basePrice} · {p.duration} · {p.category}</Text></Card>
              </TouchableOpacity>
            ))}
          </>
        )}

        {step === "priests" && selectedPuja && (
          <>
            <SectionHeader title={`Priests: ${selectedPuja.name}`} />
            <Button title="← Back" variant="secondary" onPress={() => setStep("pujas")} style={{ marginBottom: spacing.sm }} />
            <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm }}>
              <TouchableOpacity style={styles.filterBtn} onPress={() => setShowLangPicker(true)}>
                <Text style={styles.filterBtnText}>🗣️ {langFilter}</Text>
              </TouchableOpacity>
              <Modal visible={showLangPicker} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                  <View style={styles.modalBox}>
                    <Text style={styles.modalTitle}>Filter by Language</Text>
                    {LANGUAGES.map(l => (
                      <TouchableOpacity key={l} style={[styles.modalItem, langFilter === l && styles.modalItemActive]} onPress={() => { setLangFilter(l); setShowLangPicker(false); }}>
                        <Text style={[styles.modalItemText, langFilter === l && styles.modalItemTextActive]}>{l}</Text>
                      </TouchableOpacity>
                    ))}
                    <Button title="Close" variant="secondary" onPress={() => setShowLangPicker(false)} />
                  </View>
                </View>
              </Modal>
            </View>
            <View style={styles.chipRow}>
              {[0, 3, 4, 4.5].map(r => (
                <TouchableOpacity key={r} style={[styles.chip, ratingFilter === r && styles.chipActive]} onPress={() => setRatingFilter(ratingFilter === r ? 0 : r)}>
                  <Text style={[styles.chipText, ratingFilter === r && styles.chipTextActive]}>⭐{r === 0 ? "All" : r + "+"}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {filteredPriests.length === 0 ? <Text style={styles.empty}>No priests match.</Text> :
              filteredPriests.map(p => (
                <TouchableOpacity key={p.id} onPress={() => selectPriest(p)}>
                  <Card><Text style={styles.name}>{p.verified ? "✅ " : ""}{p.name} ⭐{p.rating}</Text><Text style={styles.sub}>{p.languages} · {p.experienceYears}yrs</Text></Card>
                </TouchableOpacity>
              ))}
          </>
        )}

        {step === "book" && selectedPriest && selectedPuja && (
          <>
            <SectionHeader title="Confirm Booking" />
            <Card><Text style={styles.name}>{selectedPuja.icon} {selectedPuja.name}</Text><Text style={styles.sub}>₹{selectedPuja.basePrice} · {selectedPuja.duration}</Text></Card>
            <Card><Text style={styles.name}>🧑‍🦱 {selectedPriest.name} ⭐{selectedPriest.rating}</Text><Text style={styles.sub}>{selectedPriest.languages} · {selectedPriest.experienceYears}yrs</Text></Card>
            {renderDateGrid()}
            <Button title="Confirm Booking" onPress={handleBook} style={{ marginTop: spacing.md }} />
            <Button title="← Back" variant="secondary" onPress={() => setStep("priests")} style={{ marginTop: spacing.sm }} />
          </>
        )}

        {step === "bookings" && (
          <>
            <SectionHeader title="My Bookings" />
            {bookings.length === 0 ? <Text style={styles.empty}>No bookings.</Text> :
              bookings.map(b => (
                <Card key={b.id}>
                  <Text style={styles.name}>{b.puja?.icon} {b.puja?.name}</Text>
                  <Text style={styles.sub}>Priest: {b.priest?.name}</Text>
                  <Text style={styles.sub}>{new Date(b.scheduledAt).toLocaleString()}</Text>
                  <Text style={[styles.status, b.status === "confirmed" && { color: colors.success }, b.status === "cancelled" && { color: colors.danger }]}>{b.status.toUpperCase()}</Text>
                </Card>
              ))}
            <Button title="Book Another" onPress={() => { setStep("pujas"); setSelectedPuja(null); setSelectedPriest(null); }} style={{ marginTop: spacing.md }} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: spacing.sm, paddingVertical: spacing.xs, backgroundColor: colors.cardAlt, borderRadius: radius.md },
  stepLabel: { color: colors.textMuted, fontSize: 11, fontWeight: "600" },
  stepLabelActive: { color: colors.primary },
  input: { backgroundColor: colors.cardAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, marginBottom: spacing.sm },
  name: { color: colors.text, fontSize: 15, fontWeight: "700" },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  loading: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.md },
  chipRow: { flexDirection: "row", gap: 6, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs + 2, borderRadius: radius.sm, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 12 },
  chipTextActive: { color: "#fff" },
  status: { color: colors.star, fontSize: 13, fontWeight: "700", marginTop: spacing.xs },
  label: { color: colors.textMuted, fontSize: 12, marginTop: spacing.sm, marginBottom: spacing.xs },
  dateGrid: { marginVertical: spacing.sm },
  dateChip: { padding: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border, marginRight: spacing.xs },
  dateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateChipText: { color: colors.textMuted, fontSize: 11 },
  dateChipTextActive: { color: "#fff" },
  filterBtn: { flex: 1, padding: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  filterBtnText: { color: colors.text, fontSize: 13 },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)", padding: spacing.lg },
  modalBox: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg },
  modalTitle: { color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: spacing.md },
  modalItem: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalItemActive: { backgroundColor: colors.cardAlt },
  modalItemText: { color: colors.text, fontSize: 14 },
  modalItemTextActive: { color: colors.primary, fontWeight: "700" },
});
