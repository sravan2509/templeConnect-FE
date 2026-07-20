import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, TextInput } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { colors, spacing, radius } from "../theme";
import { searchTemples, TempleResult } from "../api/temples";
import { autocompletePlaces, AutocompleteItem } from "../api/admin";

export default function TempleSearchScreen({ navigation }: any) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TempleResult[]>([]);
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const timer = setTimeout(async () => {
      try {
        const s = await autocompletePlaces(query);
        setSuggestions(s);
        setShowSuggestions(s.length > 0);
      } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  async function handleSearch(text?: string) {
    const q = (text || query).trim();
    if (!q) return;
    setShowSuggestions(false);
    setLoading(true);
    try { setResults(await searchTemples(q)); } catch {}
    setLoading(false);
  }

  function selectSuggestion(item: AutocompleteItem) {
    setQuery(item.label);
    setShowSuggestions(false);
    handleSearch(item.label);
  }

  return (
    <Screen scroll={false}>
      <View style={styles.searchWrap}>
        <TextInput style={styles.input} value={query} onChangeText={setQuery}
          placeholder="Search temple name, deity, or state..." placeholderTextColor={colors.textMuted}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search" />
        <TouchableOpacity style={styles.searchBtn} onPress={() => handleSearch()}>
          <Text style={styles.searchBtnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {showSuggestions && (
        <View style={styles.suggestionsBox}>
          {suggestions.map((s, i) => (
            <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => selectSuggestion(s)}>
              <Text style={styles.sugLabel}>{s.type === "temple" ? "🛕" : "📍"} {s.label}</Text>
              <Text style={styles.sugType}>{s.type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading && <Text style={styles.loading}>Searching...</Text>}

      <FlatList
        data={results}
        keyExtractor={(item) => item.placeId}
        contentContainerStyle={{ paddingTop: spacing.sm }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate("TempleDetail", { temple: item })}>
            <Card>
              <Text style={styles.name}>🛕 {item.name}</Text>
              <Text style={styles.sub}>{item.address || `${item.city}, ${item.state}`}</Text>
              {item.rating && <Text style={styles.rating}>⭐ {item.rating}</Text>}
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Search for temples to see results.</Text> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: { flexDirection: "row", marginBottom: spacing.sm, gap: spacing.sm },
  input: { flex: 1, backgroundColor: colors.cardAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, fontSize: 15 },
  searchBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.md, justifyContent: "center", alignItems: "center" },
  searchBtnText: { fontSize: 20 },
  suggestionsBox: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, maxHeight: 200, overflow: "scroll" },
  suggestionItem: { flexDirection: "row", justifyContent: "space-between", padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  sugLabel: { color: colors.text, fontSize: 14 },
  sugType: { color: colors.textMuted, fontSize: 11 },
  name: { color: colors.text, fontSize: 15, fontWeight: "700" },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  rating: { color: colors.primary, fontSize: 12, marginTop: 2 },
  loading: { color: colors.textMuted, textAlign: "center", marginVertical: spacing.md },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
});
