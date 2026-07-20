import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Platform } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { SectionHeader } from "../components/SectionHeader";
import { colors, spacing, radius } from "../theme";
import { getMapTemples, MapTemple } from "../api/admin";

export default function MapScreen({ route }: any) {
  const [temples, setTemples] = useState<MapTemple[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setTemples(await getMapTemples()); } catch {} finally { setLoading(false); }
    })();
  }, []);

  return (
    <Screen>
      <ScrollView>
        <Card style={styles.mapPlaceholder}>
          <Text style={styles.mapIcon}>🗺️</Text>
          <Text style={styles.mapText}>Temple Locations</Text>
          <Text style={styles.mapSub}>Interactive map requires react-native-maps. Showing coordinates below.</Text>
        </Card>
        <SectionHeader title={`${temples.length} Temples`} />
        {loading ? <Text style={styles.loading}>Loading...</Text> :
          temples.map((t) => (
            <Card key={t.id}>
              <Text style={styles.name}>🛕 {t.name}</Text>
              <Text style={styles.sub}>{t.city}, {t.state}</Text>
              <Text style={styles.coords}>📍 {t.lat.toFixed(4)}, {t.lng.toFixed(4)}</Text>
            </Card>
          ))
        }
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  mapPlaceholder: { height: 160, alignItems: "center", justifyContent: "center", backgroundColor: colors.peach },
  mapIcon: { fontSize: 40, marginBottom: spacing.sm },
  mapText: { color: colors.text, fontSize: 16, fontWeight: "700" },
  mapSub: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs, textAlign: "center" },
  loading: { color: colors.textMuted, textAlign: "center" },
  name: { color: colors.text, fontSize: 15, fontWeight: "700" },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  coords: { color: colors.accent, fontSize: 12, marginTop: spacing.xs },
});
