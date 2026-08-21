import React, { useState, useEffect, useRef } from "react";
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { SectionHeader } from "../components/SectionHeader";
import { colors, spacing, radius } from "../theme";
import { submitBirthChart, getBirthChart, autocompleteCities } from "../api/astrology";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export default function BirthChartFormScreen({ navigation }: any) {
  const [selDay, setSelDay] = useState(1);
  const [selMonth, setSelMonth] = useState(1);
  const [selYear, setSelYear] = useState(1995);
  const [selHour, setSelHour] = useState(12);
  const [selMin, setSelMin] = useState(0);
  const [place, setPlace] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{label: string, lat: number, lon: number}>>([]);
  const [showSug, setShowSug] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-fill existing birth data on mount
  useEffect(() => {
    (async () => {
      try {
        const chart = await getBirthChart();
        if (chart) {
          setIsEditing(true);
          // Parse dob (YYYY-MM-DD)
          const [y, m, d] = chart.dob.split("-").map(Number);
          if (y) setSelYear(y);
          if (m) setSelMonth(m);
          if (d) setSelDay(d);
          // Parse time (HH:MM)
          const [h, min] = chart.time.split(":").map(Number);
          if (h !== undefined) setSelHour(h);
          if (min !== undefined) setSelMin(min);
          // Set place
          if (chart.placeName) setPlace(chart.placeName);
        }
      } catch {}
    })();
  }, []);

  const handlePlaceChange = (text: string) => {
    setPlace(text);
    if (text.length < 2) { setSuggestions([]); setShowSug(false); return; }
    // Proper debounce with cleanup
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const s = await autocompleteCities(text);
        setSuggestions(s);
        setShowSug(s.length > 0);
      } catch {}
    }, 300);
  };

  const formatDate = () => `${selDay} ${MONTHS[selMonth - 1]} ${selYear}`;
  const formatTime = () => `${String(selHour).padStart(2, "0")}:${String(selMin).padStart(2, "0")}`;

  async function handleSubmit() {
    if (!place) {
      Alert.alert("Missing Info", "Please fill all fields: date, time, and place.");
      return;
    }
    const dob = `${selYear}-${String(selMonth).padStart(2, "0")}-${String(selDay).padStart(2, "0")}`;
    const time = `${String(selHour).padStart(2, "0")}:${String(selMin).padStart(2, "0")}`;
    setLoading(true);
    try {
      const chart = await submitBirthChart(dob, time, place);
      Alert.alert("Profile Created", `Nakshatra: ${chart.nakshatra}\nRashi: ${chart.rashi}\nDeity: ${chart.deityRecommendation?.primaryDeity}`);
      navigation.navigate("BirthChartResult");
    } catch (err: any) {
      Alert.alert("Error", err?.friendlyMessage || err?.response?.data?.error || "Please try again");
    } finally { setLoading(false); }
  }

  return (
    <Screen>
      <SectionHeader title="Birth Details" />
      <Text style={styles.subtitle}>Used to calculate your Nakshatra and Rashi</Text>

      {/* Date of Birth */}
      <Text style={styles.label}>Date of Birth</Text>
      <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.pickerIcon}>📅</Text>
        <Text style={styles.pickerText}>{formatDate()}</Text>
        <Text style={styles.pickerChevron}>▼</Text>
      </TouchableOpacity>

      {/* Time of Birth */}
      <Text style={styles.label}>Time of Birth</Text>
      <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.pickerIcon}>🕐</Text>
        <Text style={styles.pickerText}>{formatTime()}</Text>
        <Text style={styles.pickerChevron}>▼</Text>
      </TouchableOpacity>

      {/* Place of Birth */}
      <Text style={styles.label}>Place of Birth</Text>
      <TextField label="" value={place} onChangeText={handlePlaceChange} placeholder="Hyderabad, India" />
      {showSug && (
        <View style={styles.sugBox}>
          {suggestions.map((s, i) => (
            <TouchableOpacity key={i} style={styles.sugItem} onPress={() => { setPlace(s.label); setShowSug(false); }}>
              <Text style={styles.sugLabel}>📍 {s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Button title={isEditing ? "Update" : "Calculate"} onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.md }} />

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date of Birth</Text>
            <View style={styles.pickerRow}>
              {/* Day */}
              <View style={styles.pickerCol}>
                <Text style={styles.pickerColLabel}>Day</Text>
                <ScrollView style={styles.scrollCol} showsVerticalScrollIndicator={false}>
                  {DAYS.map(d => (
                    <TouchableOpacity key={d} style={[styles.scrollItem, selDay === d && styles.scrollItemActive]} onPress={() => setSelDay(d)}>
                      <Text style={[styles.scrollItemText, selDay === d && styles.scrollItemTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {/* Month */}
              <View style={styles.pickerCol}>
                <Text style={styles.pickerColLabel}>Month</Text>
                <ScrollView style={styles.scrollCol} showsVerticalScrollIndicator={false}>
                  {MONTHS.map((m, i) => (
                    <TouchableOpacity key={m} style={[styles.scrollItem, selMonth === i + 1 && styles.scrollItemActive]} onPress={() => setSelMonth(i + 1)}>
                      <Text style={[styles.scrollItemText, selMonth === i + 1 && styles.scrollItemTextActive]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {/* Year */}
              <View style={styles.pickerCol}>
                <Text style={styles.pickerColLabel}>Year</Text>
                <ScrollView style={styles.scrollCol} showsVerticalScrollIndicator={false}>
                  {YEARS.map(y => (
                    <TouchableOpacity key={y} style={[styles.scrollItem, selYear === y && styles.scrollItemActive]} onPress={() => setSelYear(y)}>
                      <Text style={[styles.scrollItemText, selYear === y && styles.scrollItemTextActive]}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <Button title="Done" onPress={() => setShowDatePicker(false)} style={{ marginTop: spacing.md }} />
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time of Birth</Text>
            <View style={styles.pickerRow}>
              {/* Hour */}
              <View style={styles.pickerCol}>
                <Text style={styles.pickerColLabel}>Hour (24h)</Text>
                <ScrollView style={styles.scrollCol} showsVerticalScrollIndicator={false}>
                  {HOURS.map(h => (
                    <TouchableOpacity key={h} style={[styles.scrollItem, selHour === h && styles.scrollItemActive]} onPress={() => setSelHour(h)}>
                      <Text style={[styles.scrollItemText, selHour === h && styles.scrollItemTextActive]}>{String(h).padStart(2, "0")}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {/* Minute */}
              <View style={styles.pickerCol}>
                <Text style={styles.pickerColLabel}>Minute</Text>
                <ScrollView style={styles.scrollCol} showsVerticalScrollIndicator={false}>
                  {MINUTES.map(m => (
                    <TouchableOpacity key={m} style={[styles.scrollItem, selMin === m && styles.scrollItemActive]} onPress={() => setSelMin(m)}>
                      <Text style={[styles.scrollItemText, selMin === m && styles.scrollItemTextActive]}>{String(m).padStart(2, "0")}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <Button title="Done" onPress={() => setShowTimePicker(false)} style={{ marginTop: spacing.md }} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
  label: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.xs, marginTop: spacing.sm },
  pickerBtn: { flexDirection: "row", alignItems: "center", backgroundColor: colors.cardAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.md, marginBottom: spacing.sm },
  pickerIcon: { fontSize: 18, marginRight: spacing.sm },
  pickerText: { color: colors.text, fontSize: 16, fontWeight: "600", flex: 1 },
  pickerChevron: { color: colors.textMuted, fontSize: 12 },
  sugBox: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, maxHeight: 150 },
  sugItem: { padding: spacing.sm + 2, borderBottomWidth: 1, borderBottomColor: colors.border },
  sugLabel: { color: colors.text, fontSize: 14 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: colors.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: "70%" },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: spacing.md },
  pickerRow: { flexDirection: "row", gap: spacing.sm },
  pickerCol: { flex: 1 },
  pickerColLabel: { color: colors.textMuted, fontSize: 12, textAlign: "center", marginBottom: spacing.xs },
  scrollCol: { height: 200, backgroundColor: colors.cardAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  scrollItem: { paddingVertical: spacing.sm + 2, alignItems: "center" },
  scrollItemActive: { backgroundColor: colors.primary, borderRadius: radius.sm, marginHorizontal: 4 },
  scrollItemText: { color: colors.text, fontSize: 16 },
  scrollItemTextActive: { color: "#fff", fontWeight: "700" },
});
