import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Screen } from "../components/Screen";
import { TempleCard } from "../components/TempleCard";
import { colors, spacing, radius } from "../theme";
import { searchTemples, TempleResult } from "../api/temples";
import { autocompletePlaces, AutocompleteItem } from "../api/admin";
import { getErrorMessage } from "../api/client";

export default function TempleSearchScreen({ navigation, route }: any) {
  const [query, setQuery] = useState<string>(route.params?.query ?? "");
  const [results, setResults] = useState<TempleResult[]>([]);
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const skipAutocomplete = useRef(false);
  const searchId = useRef(0);

  useEffect(() => {
    if (route.params?.query) handleSearch(route.params.query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.query]);

  useEffect(() => {
    if (skipAutocomplete.current) { skipAutocomplete.current = false; return; }
    if (query.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const t = setTimeout(async () => {
      try {
        const s = await autocompletePlaces(query.trim());
        setSuggestions(s);
        setShowSuggestions(s.length > 0);
      } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  async function handleSearch(text?: string) {
    const q = (text ?? query).trim();
    if (!q) return;
    Keyboard.dismiss();
    setShowSuggestions(false);
    setLoading(true);
    setError(null);
    const id = ++searchId.current;
    try {
      const data = await searchTemples(q);
      if (id === searchId.current) setResults(data);
    } catch (e) {
      if (id === searchId.current) { setResults([]); setError(getErrorMessage(e)); }
    } finally {
      if (id === searchId.current) { setLoading(false); setSearched(true); }
    }
  }

  function selectSuggestion(item: AutocompleteItem) {
    skipAutocomplete.current = true;
    setQuery(item.label);
    setShowSuggestions(false);
    if (item.type === "temple" && item.placeId) {
      navigation.navigate("TempleDetail", { temple: { name: item.label.split(",")[0], placeId: item.placeId } });
    } else {
      handleSearch(item.label);
    }
  }

  return (
    <Screen scroll={false}>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            // A new query makes the previous "no results" / error message stale.
            if (searched) { setSearched(false); setError(null); }
          }}
          placeholder="Temple, deity or city — e.g. Shiva temples in Chennai"
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={() => handleSearch()} accessibilityLabel="Search">
          <Text style={styles.searchBtnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {showSuggestions && (
        <View style={styles.sugBox}>
          {suggestions.map((s, i) => (
            <TouchableOpacity key={s.placeId || `${s.label}-${i}`} style={styles.sugItem} onPress={() => selectSuggestion(s)}>
              <Text style={styles.sugLabel} numberOfLines={1}>{s.type === "temple" ? "🛕" : "📍"} {s.label}</Text>
              <Text style={styles.sugType}>{s.type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading && <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={results}
        keyExtractor={(item) => item.placeId}
        numColumns={2}
        keyboardShouldPersistTaps="handled"
        columnWrapperStyle={{ gap: spacing.sm }}
        contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <View style={{ flex: 1 / 2 }}>
            <TempleCard
              name={item.name}
              distance={[item.city, item.state].filter(Boolean).join(", ") || item.address?.split(",").slice(-3).join(",").trim() || ""}
              badge={item.curated ? "✓" : undefined}
              onPress={() => navigation.navigate("TempleDetail", { temple: item })}
            />
          </View>
        )}
        ListEmptyComponent={
          !loading && !error ? (
            <Text style={styles.empty}>
              {searched && results.length === 0 ? "No temples found. Try a city name, a deity (e.g. \"Hanuman\") or a famous temple." : showSuggestions ? "" : "Search for temples by name, deity, or city."}
            </Text>
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: { flexDirection: "row", marginTop: spacing.sm, marginBottom: spacing.sm, gap: spacing.sm },
  input: { flex: 1, backgroundColor: colors.cardAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, fontSize: 15 },
  searchBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.md, justifyContent: "center", alignItems: "center" },
  searchBtnText: { fontSize: 20 },
  sugBox: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, maxHeight: 240, overflow: "hidden" },
  sugItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm },
  sugLabel: { color: colors.text, fontSize: 14, flex: 1 },
  sugType: { color: colors.textMuted, fontSize: 11 },
  error: { color: colors.danger, textAlign: "center", marginVertical: spacing.sm },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl, paddingHorizontal: spacing.lg },
});
