import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { SectionHeader } from "../components/SectionHeader";
import { TextField } from "../components/TextField";
import { BookingCard } from "../components/BookingCard";
import { SlotPicker, Slot, firstAvailableSlot, slotToISO } from "../components/SlotPicker";
import { colors, spacing, radius } from "../theme";
import { listPujas, getPriestsByPuja, createBooking, listBookings, getPriestReviews, Priest, Puja, Booking, Review } from "../api/connect";
import { getErrorMessage } from "../api/client";
import { formatDate, formatDateTime, formatPrice } from "../utils/format";

type Step = "pujas" | "priests" | "book" | "bookings";
const LANGUAGES = ["All", "Hindi", "English", "Telugu", "Tamil", "Sanskrit", "Kannada", "Marathi", "Gujarati", "Punjabi"];
const STEP_LABELS: Record<Step, string> = { pujas: "1. Puja", priests: "2. Priest", book: "3. Confirm", bookings: "My Bookings" };

export default function BookPujaScreen({ route }: any) {
  const [step, setStep] = useState<Step>(route.params?.step === "bookings" ? "bookings" : "pujas");
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [pq, setPq] = useState("");
  const [selPuja, setSelPuja] = useState<Puja | null>(null);
  const [priests, setPriests] = useState<Priest[]>([]);
  const [selPriest, setSelPriest] = useState<Priest | null>(null);
  const [lang, setLang] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [showLang, setShowLang] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [slot, setSlot] = useState<Slot>(firstAvailableSlot);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPujas = useCallback(async () => {
    try { setPujas(await listPujas()); setError(null); } catch (e) { setError(getErrorMessage(e)); }
  }, []);
  const loadBookings = useCallback(async () => {
    try { setBookings(await listBookings()); } catch (e) { setError(getErrorMessage(e)); }
  }, []);

  useEffect(() => { loadPujas(); }, [loadPujas]);
  useFocusEffect(useCallback(() => { loadBookings(); }, [loadBookings]));

  const filteredPujas = useMemo(
    () => (pq ? pujas.filter((p) => `${p.name} ${p.category} ${p.description ?? ""}`.toLowerCase().includes(pq.toLowerCase())) : pujas),
    [pq, pujas]
  );
  const filteredPriests = useMemo(
    () => priests.filter((p) => (lang === "All" || p.languages.toLowerCase().includes(lang.toLowerCase())) && p.rating >= minRating),
    [priests, lang, minRating]
  );

  async function selectPuja(p: Puja) {
    setSelPuja(p); setSelPriest(null); setLoading(true); setError(null);
    try { setPriests(await getPriestsByPuja(p.id)); setStep("priests"); }
    catch (e) { Alert.alert("Error", getErrorMessage(e)); }
    finally { setLoading(false); }
  }

  async function selectPriest(p: Priest) {
    setSelPriest(p); setSlot(firstAvailableSlot()); setNotes(""); setReviews([]); setStep("book");
    try { setReviews(await getPriestReviews(p.id)); } catch {}
  }

  async function handleBook() {
    if (!selPriest || !selPuja) return;
    setBooking(true);
    try {
      await createBooking(selPriest.id, selPuja.id, slotToISO(slot), notes.trim() || undefined);
      Alert.alert("Booking requested 🙏", `${selPriest.name} will confirm your ${selPuja.name}. You'll get a notification once it's confirmed.`);
      setSelPuja(null); setSelPriest(null);
      setStep("bookings");
      loadBookings();
    } catch (e) {
      Alert.alert("Could not book", getErrorMessage(e));
    } finally { setBooking(false); }
  }

  const price = selPriest?.price ?? selPuja?.basePrice ?? 0;
  const canGoTo = (s: Step) => s === "pujas" || s === "bookings" || (s === "priests" && !!selPuja) || (s === "book" && !!selPriest);
  const upcoming = bookings.filter((b) => b.status === "pending" || b.status === "confirmed");
  const past = bookings.filter((b) => b.status !== "pending" && b.status !== "confirmed");

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.stepRow}>
        {(Object.keys(STEP_LABELS) as Step[]).map((s) => (
          <TouchableOpacity key={s} disabled={!canGoTo(s)} onPress={() => setStep(s)} style={[styles.stepBtn, step === s && styles.stepBtnActive]}>
            <Text style={[styles.stepL, step === s && styles.stepLA, !canGoTo(s) && { opacity: 0.4 }]}>{STEP_LABELS[s]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Screen safeBottom={false}>
        {error && <Text style={styles.error}>{error}</Text>}
        {loading && <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />}

        {step === "pujas" && (
          <>
            <SectionHeader title="Select a Puja" />
            <TextInput style={styles.input} value={pq} onChangeText={setPq} placeholder="Search pujas..." placeholderTextColor={colors.textMuted} />
            {filteredPujas.length === 0 && !error && <Text style={styles.empty}>No pujas match your search.</Text>}
            {filteredPujas.map((p) => (
              <TouchableOpacity key={p.id} onPress={() => selectPuja(p)} disabled={loading}>
                <Card>
                  <Text style={styles.name}>{p.icon} {p.name}</Text>
                  {p.description ? <Text style={styles.sub}>{p.description}</Text> : null}
                  <Text style={styles.sub}>From {formatPrice(p.basePrice)} · {p.duration}</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}

        {step === "priests" && selPuja && (
          <>
            <SectionHeader title={`Priests for ${selPuja.name}`} />
            <View style={styles.filterRow}>
              <TouchableOpacity style={styles.fBtn} onPress={() => setShowLang(true)}>
                <Text style={styles.fBtnText}>🗣️ {lang} ▾</Text>
              </TouchableOpacity>
              {[0, 4, 4.5].map((r) => (
                <TouchableOpacity key={r} style={[styles.chip, minRating === r && styles.chipA]} onPress={() => setMinRating(r)}>
                  <Text style={[styles.chipT, minRating === r && styles.chipTA]}>⭐ {r === 0 ? "All" : `${r}+`}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {filteredPriests.length === 0 && (
              <Text style={styles.empty}>{priests.length === 0 ? "No priests offer this puja yet. Please choose another puja." : "No priests match these filters."}</Text>
            )}
            {filteredPriests.map((p) => (
              <TouchableOpacity key={p.id} onPress={() => selectPriest(p)}>
                <Card>
                  <Text style={styles.name}>{p.verified ? "✅ " : ""}{p.name}</Text>
                  <Text style={styles.sub}>⭐ {p.rating.toFixed(1)} ({p.reviewCount} reviews) · {p.experienceYears} yrs experience</Text>
                  <Text style={styles.sub}>🗣 {p.languages || "—"}</Text>
                  <Text style={styles.price}>{formatPrice(p.price ?? selPuja.basePrice)}</Text>
                </Card>
              </TouchableOpacity>
            ))}
            <Modal visible={showLang} transparent animationType="fade" onRequestClose={() => setShowLang(false)}>
              <View style={styles.modalO}>
                <View style={styles.modalB}>
                  {LANGUAGES.map((l) => (
                    <TouchableOpacity key={l} style={[styles.modalI, lang === l && styles.modalIA]} onPress={() => { setLang(l); setShowLang(false); }}>
                      <Text style={[styles.modalIT, lang === l && styles.modalITA]}>{l}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Modal>
          </>
        )}

        {step === "book" && selPriest && selPuja && (
          <>
            <SectionHeader title="Confirm Booking" />
            <Card>
              <Text style={styles.name}>{selPuja.icon} {selPuja.name}</Text>
              <Text style={styles.sub}>{selPuja.duration}</Text>
              <Text style={styles.price}>{formatPrice(price)}</Text>
            </Card>
            <Card>
              <Text style={styles.name}>{selPriest.verified ? "✅ " : ""}{selPriest.name}</Text>
              <Text style={styles.sub}>⭐ {selPriest.rating.toFixed(1)} ({selPriest.reviewCount}) · {selPriest.languages}</Text>
              {selPriest.bio ? <Text style={[styles.sub, { marginTop: spacing.xs }]}>{selPriest.bio}</Text> : null}
              {reviews.length > 0 && (
                <View style={{ marginTop: spacing.sm }}>
                  <Text style={styles.label}>Recent reviews</Text>
                  {reviews.slice(0, 3).map((r) => (
                    <Text key={r.id} style={styles.sub}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)} {r.comment ? `“${r.comment}”` : ""} — {r.user?.name ?? "Devotee"}, {formatDate(r.createdAt)}</Text>
                  ))}
                </View>
              )}
            </Card>
            <SlotPicker value={slot} onChange={setSlot} />
            <TextField label="Notes for the priest (optional)" value={notes} onChangeText={setNotes} multiline maxLength={500} placeholder="Address, family names, special requests..." />
            <Text style={styles.sub}>Requested time: {formatDateTime(slotToISO(slot))}</Text>
            <Button title="Request Booking" onPress={handleBook} loading={booking} style={{ marginTop: spacing.md }} />
            <Text style={styles.hint}>The priest confirms your request. You can pay and chat with them once it's confirmed.</Text>
          </>
        )}

        {step === "bookings" && (
          <>
            <SectionHeader title="Upcoming" />
            {upcoming.length === 0 && <Text style={styles.empty}>No upcoming bookings.</Text>}
            {upcoming.map((b) => <BookingCard key={b.id} booking={b} onChanged={loadBookings} />)}
            {past.length > 0 && <SectionHeader title="Past" />}
            {past.map((b) => <BookingCard key={b.id} booking={b} onChanged={loadBookings} />)}
            <Button title="Book Another Puja" onPress={() => { setStep("pujas"); setSelPuja(null); setSelPriest(null); }} style={{ marginTop: spacing.md }} />
          </>
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  stepRow: { flexDirection: "row", justifyContent: "space-around", marginHorizontal: spacing.md, marginTop: spacing.sm, padding: 4, backgroundColor: colors.cardAlt, borderRadius: radius.md },
  stepBtn: { paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.sm, borderRadius: radius.sm },
  stepBtnActive: { backgroundColor: colors.card },
  stepL: { color: colors.textMuted, fontSize: 12, fontWeight: "600" },
  stepLA: { color: colors.primary },
  input: { backgroundColor: colors.cardAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: 14, marginBottom: spacing.sm },
  name: { color: colors.text, fontSize: 15, fontWeight: "700" },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  price: { color: colors.primaryDark, fontSize: 15, fontWeight: "800", marginTop: spacing.xs },
  label: { color: colors.textMuted, fontSize: 12, textTransform: "uppercase", marginBottom: 2 },
  hint: { color: colors.textMuted, fontSize: 12, textAlign: "center", marginTop: spacing.sm },
  empty: { color: colors.textMuted, textAlign: "center", marginVertical: spacing.md },
  error: { color: colors.danger, marginVertical: spacing.sm },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: spacing.sm, alignItems: "center" },
  fBtn: { paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs + 2, borderRadius: radius.sm, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  fBtnText: { color: colors.text, fontSize: 12 },
  chip: { paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs + 2, borderRadius: radius.sm, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border },
  chipA: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipT: { color: colors.textMuted, fontSize: 12 },
  chipTA: { color: "#fff" },
  modalO: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)", padding: spacing.lg },
  modalB: { backgroundColor: colors.card, borderRadius: radius.lg, paddingVertical: spacing.sm },
  modalI: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  modalIA: { backgroundColor: colors.cardAlt },
  modalIT: { color: colors.text, fontSize: 15 },
  modalITA: { color: colors.primary, fontWeight: "700" },
});
