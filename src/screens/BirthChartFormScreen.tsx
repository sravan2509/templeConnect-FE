import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { SectionHeader } from "../components/SectionHeader";
import { colors, spacing, radius } from "../theme";
import { submitBirthChart } from "../api/astrology";
import { autocompletePlaces, AutocompleteItem } from "../api/admin";

export default function BirthChartFormScreen({ navigation }: any) {
  const [day, setDay] = useState(""); const [month, setMonth] = useState(""); const [year, setYear] = useState("");
  const [hour, setHour] = useState(""); const [min, setMinute] = useState("");
  const [place, setPlace] = useState("");
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePlaceChange = (text: string) => {
    setPlace(text);
    if (text.length < 2) { setSuggestions([]); setShowSug(false); return; }
    setTimeout(async () => {
      try { const s = await autocompletePlaces(text); setSuggestions(s); setShowSug(s.length > 0); } catch {}
    }, 300);
  };

  async function handleSubmit() {
    if (!day || !month || !year || !hour || !min || !place) {
      Alert.alert("Missing Info", "Please fill all fields: date, time, and place.");
      return;
    }
    const dob = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    const time = `${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
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

      <Text style={styles.label}>Date of Birth</Text>
      <View style={styles.dateRow}>
        <TextField label="DD" value={day} onChangeText={setDay} placeholder="15" keyboardType="numeric" style={{ flex: 1 }} />
        <TextField label="MM" value={month} onChangeText={setMonth} placeholder="08" keyboardType="numeric" style={{ flex: 1 }} />
        <TextField label="YYYY" value={year} onChangeText={setYear} placeholder="1995" keyboardType="numeric" style={{ flex: 1.5 }} />
      </View>

      <Text style={styles.label}>Time of Birth</Text>
      <View style={styles.dateRow}>
        <TextField label="HH (24h)" value={hour} onChangeText={setHour} placeholder="14" keyboardType="numeric" style={{ flex: 1 }} />
        <TextField label="MM" value={min} onChangeText={setMinute} placeholder="30" keyboardType="numeric" style={{ flex: 1 }} />
      </View>

      <Text style={styles.label}>Place of Birth</Text>
      <TextField label="" value={place} onChangeText={handlePlaceChange} placeholder="Hyderabad, India" />
      {showSug && (
        <View style={styles.sugBox}>
          {suggestions.map((s, i) => (
            <TouchableOpacity key={i} style={styles.sugItem} onPress={() => { setPlace(s.label); setShowSug(false); }}>
              <Text style={styles.sugLabel}>{s.type === "temple" ? "🛕" : "📍"} {s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Button title="Calculate" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.md }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
  label: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.xs, marginTop: spacing.sm },
  dateRow: { flexDirection: "row", gap: spacing.sm },
  sugBox: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, maxHeight: 150 },
  sugItem: { padding: spacing.sm + 2, borderBottomWidth: 1, borderBottomColor: colors.border },
  sugLabel: { color: colors.text, fontSize: 14 },
});
