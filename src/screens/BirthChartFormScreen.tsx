import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { colors, spacing, radius } from "../theme";
import { submitBirthChart, getBirthChart, autocompleteCities } from "../api/astrology";
import { getErrorMessage } from "../api/client";
import { daysInMonth } from "../utils/format";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR - 1900 + 1 }, (_, i) => THIS_YEAR - i);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const pad = (n: number) => String(n).padStart(2, "0");

type Place = { label: string; lat: number; lon: number };

export default function BirthChartFormScreen({ navigation }: any) {
  const [selDay, setSelDay] = useState(1);
  const [selMonth, setSelMonth] = useState(1);
  const [selYear, setSelYear] = useState(1995);
  const [selHour, setSelHour] = useState(12);
  const [selMin, setSelMin] = useState(0);
  const [place, setPlace] = useState("");
  const [pickedPlace, setPickedPlace] = useState<Place | null>(null);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [searchingPlace, setSearchingPlace] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const maxDay = daysInMonth(selYear, selMonth);
  const days = useMemo(() => Array.from({ length: maxDay }, (_, i) => i + 1), [maxDay]);

  // Keep the day valid when month/year changes (e.g. 31 → Feb).
  useEffect(() => { if (selDay > maxDay) setSelDay(maxDay); }, [maxDay, selDay]);

  // Pre-fill existing birth data.
  useEffect(() => {
    (async () => {
      try {
        const chart = await getBirthChart();
        if (!chart) return;
        setIsEditing(true);
        const [y, m, d] = chart.dob.split("-").map(Number);
        if (y) setSelYear(y);
        if (m) setSelMonth(m);
        if (d) setSelDay(d);
        const [h, min] = chart.time.split(":").map(Number);
        if (!isNaN(h)) setSelHour(h);
        if (!isNaN(min)) setSelMin(min);
        if (chart.placeName) {
          setPlace(chart.placeName);
          setPickedPlace({ label: chart.placeName, lat: chart.lat, lon: chart.lon });
        }
      } catch {}
    })();
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const handlePlaceChange = (text: string) => {
    setPlace(text);
    setPickedPlace(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 2) { setSuggestions([]); setShowSug(false); return; }
    debounceRef.current = setTimeout(async () => {
      setSearchingPlace(true);
      try {
        const s = await autocompleteCities(text.trim());
        setSuggestions(s);
        setShowSug(s.length > 0);
      } catch {} finally { setSearchingPlace(false); }
    }, 400);
  };

  function pickPlace(p: Place) {
    setPlace(p.label);
    setPickedPlace(p);
    setShowSug(false);
  }

  const dob = `${selYear}-${pad(selMonth)}-${pad(selDay)}`;
  const time = `${pad(selHour)}:${pad(selMin)}`;
  const isFuture = new Date(selYear, selMonth - 1, selDay, selHour, selMin) > new Date();

  async function handleSubmit() {
    if (!place.trim()) return Alert.alert("Missing place", "Please enter your place of birth and pick it from the suggestions.");
    if (isFuture) return Alert.alert("Check the date", "Date and time of birth can't be in the future.");
    setLoading(true);
    try {
      const chart = await submitBirthChart(dob, time, place.trim(), pickedPlace?.lat, pickedPlace?.lon);
      Alert.alert(
        isEditing ? "Profile Updated" : "Profile Created",
        `Nakshatra: ${chart.nakshatra}\nRashi: ${chart.rashi}\nDeity: Lord ${chart.deityRecommendation?.primaryDeity}`
      );
      // The result screen reloads whenever it is shown, so returning to it shows the new data.
      navigation.navigate("BirthChartResult");
    } catch (err) {
      Alert.alert("Could not calculate", getErrorMessage(err));
    } finally { setLoading(false); }
  }

  return (
    <Screen>
      <Text style={styles.subtitle}>Used to calculate your Nakshatra and Rashi. The time is taken as local time at your place of birth.</Text>

      <Text style={styles.label}>Date of Birth</Text>
      <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.pickerIcon}>📅</Text>
        <Text style={styles.pickerText}>{selDay} {MONTHS[selMonth - 1]} {selYear}</Text>
        <Text style={styles.pickerChevron}>▼</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Time of Birth</Text>
      <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.pickerIcon}>🕐</Text>
        <Text style={styles.pickerText}>{time}</Text>
        <Text style={styles.pickerChevron}>▼</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Place of Birth</Text>
      <TextField value={place} onChangeText={handlePlaceChange} placeholder="e.g. Hyderabad, India" hint={pickedPlace ? "✓ Location selected" : "Type and pick your town from the list"} />
      {searchingPlace && <ActivityIndicator color={colors.primary} style={{ marginBottom: spacing.sm }} />}
      {showSug && (
        <View style={styles.sugBox}>
          {suggestions.map((s, i) => (
            <TouchableOpacity key={`${s.lat},${s.lon},${i}`} style={styles.sugItem} onPress={() => pickPlace(s)}>
              <Text style={styles.sugLabel} numberOfLines={2}>📍 {s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {isFuture && <Text style={styles.warning}>The selected date and time is in the future.</Text>}
      <Button title={isEditing ? "Update" : "Calculate"} onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.md }} />

      <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date of Birth</Text>
            <View style={styles.pickerRow}>
              <PickerColumn label="Day" items={days} selected={selDay} onSelect={setSelDay} render={String} />
              <PickerColumn label="Month" items={MONTHS.map((_, i) => i + 1)} selected={selMonth} onSelect={setSelMonth} render={(m) => MONTHS[m - 1]} />
              <PickerColumn label="Year" items={YEARS} selected={selYear} onSelect={setSelYear} render={String} />
            </View>
            <Button title="Done" onPress={() => setShowDatePicker(false)} style={{ marginTop: spacing.md }} />
          </View>
        </View>
      </Modal>

      <Modal visible={showTimePicker} transparent animationType="slide" onRequestClose={() => setShowTimePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time of Birth</Text>
            <View style={styles.pickerRow}>
              <PickerColumn label="Hour (24h)" items={HOURS} selected={selHour} onSelect={setSelHour} render={pad} />
              <PickerColumn label="Minute" items={MINUTES} selected={selMin} onSelect={setSelMin} render={pad} />
            </View>
            <Button title="Done" onPress={() => setShowTimePicker(false)} style={{ marginTop: spacing.md }} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function PickerColumn({ label, items, selected, onSelect, render }: {
  label: string; items: number[]; selected: number; onSelect: (v: number) => void; render: (v: number) => string;
}) {
  const ITEM_H = 42;
  const ref = useRef<ScrollView>(null);
  useEffect(() => {
    const idx = items.indexOf(selected);
    if (idx > 0) setTimeout(() => ref.current?.scrollTo({ y: Math.max(0, idx * ITEM_H - ITEM_H * 2), animated: false }), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View style={styles.pickerCol}>
      <Text style={styles.pickerColLabel}>{label}</Text>
      <ScrollView ref={ref} style={styles.scrollCol} showsVerticalScrollIndicator={false}>
        {items.map((v) => (
          <TouchableOpacity key={v} style={[styles.scrollItem, { height: ITEM_H }, selected === v && styles.scrollItemActive]} onPress={() => onSelect(v)}>
            <Text style={[styles.scrollItemText, selected === v && styles.scrollItemTextActive]}>{render(v)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg, lineHeight: 20 },
  label: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.xs, marginTop: spacing.sm },
  pickerBtn: { flexDirection: "row", alignItems: "center", backgroundColor: colors.cardAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.md, marginBottom: spacing.sm },
  pickerIcon: { fontSize: 18, marginRight: spacing.sm },
  pickerText: { color: colors.text, fontSize: 16, fontWeight: "600", flex: 1 },
  pickerChevron: { color: colors.textMuted, fontSize: 12 },
  sugBox: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, marginTop: -spacing.sm },
  sugItem: { padding: spacing.sm + 2, borderBottomWidth: 1, borderBottomColor: colors.border },
  sugLabel: { color: colors.text, fontSize: 14 },
  warning: { color: colors.danger, fontSize: 13 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: colors.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, paddingBottom: spacing.xl },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: spacing.md },
  pickerRow: { flexDirection: "row", gap: spacing.sm },
  pickerCol: { flex: 1 },
  pickerColLabel: { color: colors.textMuted, fontSize: 12, textAlign: "center", marginBottom: spacing.xs },
  scrollCol: { height: 210, backgroundColor: colors.cardAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  scrollItem: { alignItems: "center", justifyContent: "center" },
  scrollItemActive: { backgroundColor: colors.primary, borderRadius: radius.sm, marginHorizontal: 4 },
  scrollItemText: { color: colors.text, fontSize: 16 },
  scrollItemTextActive: { color: "#fff", fontWeight: "700" },
});
