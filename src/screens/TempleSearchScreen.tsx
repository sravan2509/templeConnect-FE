import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { colors, spacing } from "../theme";
import { searchTemples, TempleResult } from "../api/temples";

export default function TempleSearchScreen({ navigation }: any) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TempleResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchTemples(query);
      setResults(data);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Search failed. Check the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll={false}>
      <View style={styles.searchBar}>
        <TextField
          label="Search temples"
          value={query}
          onChangeText={setQuery}
          placeholder="e.g. Krishna Temple near Munich"
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Button title="Search" onPress={handleSearch} loading={loading} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={results}
        keyExtractor={(item) => item.placeId}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.name}>{item.name}</Text>
            {item.address ? <Text style={styles.address}>{item.address}</Text> : null}
            {item.rating != null ? <Text style={styles.rating}>⭐ {item.rating}</Text> : null}
          </Card>
        )}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Search for a temple to see results here.</Text> : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBar: { marginBottom: spacing.sm },
  name: { color: colors.text, fontSize: 16, fontWeight: "700" },
  address: { color: colors.textMuted, marginTop: spacing.xs },
  rating: { color: colors.primary, marginTop: spacing.xs },
  error: { color: colors.danger, marginBottom: spacing.sm },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
});
