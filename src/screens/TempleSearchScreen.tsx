import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { TempleCard } from "../components/TempleCard";
import { colors, spacing, radius } from "../theme";
import { searchTemples, TempleResult, searchTemplesByDeity } from "../api/temples";
import { autocompletePlaces, AutocompleteItem } from "../api/admin";

const DEITY_KEYWORDS: Record<string, string[]> = {
  "shiva": ["Shiva"], "vishnu": ["Vishnu"], "hanuman": ["Hanuman"], "ganesh": ["Ganesha"],
  "krishna": ["Krishna"], "lakshmi": ["Lakshmi"], "durga": ["Durga"], "kartikeya": ["Kartikeya"],
  "surya": ["Surya"], "saraswati": ["Saraswati"], "rama": ["Rama"],
};

export default function TempleSearchScreen({ navigation }: any) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TempleResult[]>([]);
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const t = setTimeout(async () => {
      try { const s = await autocompletePlaces(query); setSuggestions(s); setShowSuggestions(s.length > 0); }
      catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  async function handleSearch(text?: string) {
    const q = (text || query).trim();
    if (!q) return;
    setShowSuggestions(false);
    setLoading(true);
    try {
      const ql = q.toLowerCase();
      let foundDeity = false;
      for (const [kw, deities] of Object.entries(DEITY_KEYWORDS)) {
        if (ql.includes(kw)) {
          try {
            const res = await searchTemplesByDeity({ deity: deities[0], searchState: "" });
            if (res?.data?.length) {
              const filtered = res.data.filter((t: any) =>
                !ql.includes(ql.match(/[a-z]{3,}\s*[a-z]{3,}/)?.[0] || "") ||
                t.city?.toLowerCase().includes(ql) || t.state?.toLowerCase().includes(ql)
              );
              setResults(filtered.length > 0 ? filtered.slice(0, 15) : res.data.slice(0, 10));
              foundDeity = true;
            }
          } catch {}
          break;
        }
      }
      if (!foundDeity) {
        const data = await searchTemples(q);
        setResults(data);
      }
    } catch {}
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
          placeholder="Search temple, deity, or city..." placeholderTextColor={colors.textMuted}
          onSubmitEditing={() => handleSearch()} returnKeyType="search" />
        <TouchableOpacity style={styles.searchBtn} onPress={() => handleSearch()}>
          <Text style={styles.searchBtnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {showSuggestions && (
        <View style={styles.sugBox}>
          {suggestions.map((s, i) => (
            <TouchableOpacity key={s.placeId || i} style={styles.sugItem} onPress={() => selectSuggestion(s)}>
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
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.sm, marginBottom: spacing.sm }}
        contentContainerStyle={{ paddingTop: spacing.sm }}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate("TempleDetail", { temple: item })}>
            <TempleCard name={item.name} distance={item.city || item.state || ""} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Search for temples by name, deity, or city.</Text> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: { flexDirection: "row", marginBottom: spacing.sm, gap: spacing.sm },
  input: { flex: 1, backgroundColor: colors.cardAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, fontSize: 15 },
  searchBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.md, justifyContent: "center", alignItems: "center" },
  searchBtnText: { fontSize: 20 },
  sugBox: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, maxHeight: 200 },
  sugItem: { flexDirection: "row", justifyContent: "space-between", padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  sugLabel: { color: colors.text, fontSize: 14 },
  sugType: { color: colors.textMuted, fontSize: 11 },
  loading: { color: colors.textMuted, textAlign: "center", marginVertical: spacing.md },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
});
