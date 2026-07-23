import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { SectionHeader } from "../components/SectionHeader";
import { colors, spacing, radius } from "../theme";
import { submitBirthChart } from "../api/astrology";
import { autocompletePlaces, AutocompleteItem } from "../api/admin";

export default function BirthChartFormScreen({ navigation }: any) {
  const [dob, setDob] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (place.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const timer = setTimeout(async () => {
      try {
        const s = await autocompletePlaces(place);
        setSuggestions(s.filter(i => i.type === "state" || i.label.includes(","))); // Mostly cities/states
        setShowSuggestions(s.length > 0);
      } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [place]);

  function selectSuggestion(item: AutocompleteItem) {
    setPlace(item.label);
    setShowSuggestions(false);
  }

  async function handleSubmit() {
    if (!dob || !time || !place) {
      Alert.alert("Missing info", "Please fill date of birth, time, and place.");
      return;
    }
    setLoading(true);
    try {
      const chart = await submitBirthChart(dob, time, place);
      Alert.alert("Profile Created!", `Nakshatra: ${chart.nakshatra}\nRashi: ${chart.rashi}\nDeity: ${chart.deityRecommendation?.primaryDeity}`);
      navigation.navigate("BirthChartResult");
    } catch (err: any) {
      Alert.alert("Couldn't calculate chart", err?.response?.data?.error ?? "Please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll={false}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <SectionHeader title="Birth Details" />
        <Text style={styles.subtitle}>Used to calculate your nakshatra and rashi</Text>
        <TextField label="Date of Birth (YYYY-MM-DD)" value={dob} onChangeText={setDob} placeholder="1995-08-15" />
        <TextField label="Time of Birth (HH:MM, 24h)" value={time} onChangeText={setTime} placeholder="14:30" />
        
        <View style={{ zIndex: 1 }}>
          <TextField 
            label="Place of Birth" 
            value={place} 
            onChangeText={(t) => { setPlace(t); setShowSuggestions(true); }} 
            placeholder="Hyderabad, India" 
          />
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsBox}>
              {suggestions.map((s, i) => (
                <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => selectSuggestion(s)}>
                  <Text style={styles.sugLabel}>📍 {s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <Button title="Calculate" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
  suggestionsBox: { 
    backgroundColor: colors.card, 
    borderRadius: radius.md, 
    borderWidth: 1, 
    borderColor: colors.border, 
    marginTop: -spacing.sm,
    marginBottom: spacing.sm, 
    maxHeight: 150, 
    overflow: "scroll",
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
    zIndex: 10
  },
  suggestionItem: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  sugLabel: { color: colors.text, fontSize: 14 },
});
