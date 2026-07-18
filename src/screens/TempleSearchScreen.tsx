import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { colors, spacing, radius } from "../theme";
import { searchTemples, searchTemplesByDeity, getIndianStates, getDistricts, TempleResult } from "../api/temples";

const DEITIES = [
  "Shiva", "Vishnu", "Hanuman", "Ganesha", "Krishna", "Lakshmi", "Durga", "Kartikeya", "Surya", "Saraswati", "Rama",
];

export default function TempleSearchScreen({ navigation }: any) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"text" | "deity">("text");
  const [selectedDeity, setSelectedDeity] = useState("Shiva");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [results, setResults] = useState<TempleResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadStates() {
    if (states.length > 0) return;
    try {
      const res = await getIndianStates();
      setStates(res.data);
    } catch {}
  }

  async function loadDistricts(state: string) {
    if (!state) { setDistricts([]); return; }
    try {
      const res = await getDistricts(state);
      setDistricts(res.data);
    } catch { setDistricts([]); }
  }

  async function handleSearch() {
    setLoading(true);
    setError(null);
    try {
      if (mode === "text" && query.trim()) {
        const data = await searchTemples(query);
        setResults(data);
      } else if (mode === "deity" && selectedState) {
        const res = await searchTemplesByDeity({
          deity: selectedDeity,
          searchState: selectedState,
          searchDistrict: selectedDistrict || undefined,
        });
        setResults(res.data);
      } else {
        setError("Please enter a search query or select a state for deity search.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  function renderDeityChip(deity: string) {
    const active = selectedDeity === deity;
    return (
      <TouchableOpacity
        key={deity}
        style={[styles.chip, active && styles.chipActive]}
        onPress={() => setSelectedDeity(deity)}
      >
        <Text style={[styles.chipText, active && styles.chipTextActive]}>{deity}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Screen scroll={false}>
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, mode === "text" && styles.tabActive]} onPress={() => setMode("text")}>
          <Text style={[styles.tabText, mode === "text" && styles.tabTextActive]}>Text Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, mode === "deity" && styles.tabActive]} onPress={() => { setMode("deity"); loadStates(); }}>
          <Text style={[styles.tabText, mode === "deity" && styles.tabTextActive]}>By Deity</Text>
        </TouchableOpacity>
      </View>

      {mode === "text" ? (
        <View style={styles.searchBar}>
          <TextField label="Search temples" value={query} onChangeText={setQuery} placeholder="e.g. Krishna Temple" onSubmitEditing={handleSearch} returnKeyType="search" />
          <Button title="Search" onPress={handleSearch} loading={loading} />
        </View>
      ) : (
        <View>
          <Text style={styles.label}>Select Deity</Text>
          <View style={styles.chipRow}>{DEITIES.map(renderDeityChip)}</View>

          <Text style={styles.label}>State</Text>
          <TouchableOpacity style={styles.selectField} onPress={loadStates}>
            <Text style={{ color: colors.text }}>
              {selectedState || "Tap to select state..."}
            </Text>
          </TouchableOpacity>
          {states.length > 0 && (
            <View style={styles.chipRow}>
              {states.slice(0, 10).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, selectedState === s && styles.chipActive]}
                  onPress={() => { setSelectedState(s); loadDistricts(s); }}
                >
                  <Text style={[styles.chipText, selectedState === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {districts.length > 0 && (
            <>
              <Text style={styles.label}>District (optional)</Text>
              <View style={styles.chipRow}>
                {districts.slice(0, 10).map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.chip, selectedDistrict === d && styles.chipActive]}
                    onPress={() => setSelectedDistrict(d === selectedDistrict ? "" : d)}
                  >
                    <Text style={[styles.chipText, selectedDistrict === d && styles.chipTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Button title="Find Temples" onPress={handleSearch} loading={loading} style={{ marginTop: spacing.md }} />
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={results}
        keyExtractor={(item) => item.placeId}
        contentContainerStyle={{ paddingTop: spacing.sm }}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.name}>{item.name}</Text>
            {item.address ? <Text style={styles.address}>{item.address}</Text> : null}
            {item.city ? <Text style={styles.address}>{item.city}, {item.state}</Text> : null}
            {item.rating != null ? <Text style={styles.rating}>⭐ {item.rating}</Text> : null}
            {item.distanceKm != null ? <Text style={styles.rating}>📍 {item.distanceKm.toFixed(1)} km away</Text> : null}
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Search for temples to see results.</Text> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: "row", marginBottom: spacing.md, backgroundColor: colors.cardAlt, borderRadius: radius.md, padding: 2 },
  tab: { flex: 1, paddingVertical: spacing.sm + 2, alignItems: "center", borderRadius: radius.sm },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontWeight: "600", fontSize: 14 },
  tabTextActive: { color: "#fff" },
  searchBar: { marginBottom: spacing.sm },
  label: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.xs, marginTop: spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs + 2, borderRadius: radius.sm, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 12 },
  chipTextActive: { color: "#fff" },
  selectField: { padding: spacing.md, backgroundColor: colors.cardAlt, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  name: { color: colors.text, fontSize: 16, fontWeight: "700" },
  address: { color: colors.textMuted, marginTop: spacing.xs, fontSize: 12 },
  rating: { color: colors.primary, marginTop: spacing.xs, fontSize: 13 },
  error: { color: colors.danger, marginBottom: spacing.sm },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
});
