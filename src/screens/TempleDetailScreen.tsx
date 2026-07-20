import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { SectionHeader } from "../components/SectionHeader";
import { colors, spacing, radius } from "../theme";
import { TempleResult } from "../api/temples";

export default function TempleDetailScreen({ route, navigation }: any) {
  const temple: TempleResult = route.params?.temple;

  if (!temple) {
    return <Screen><Text style={styles.empty}>No temple selected.</Text></Screen>;
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionHeader title={temple.name} />
        <Card style={styles.hero}>
          <Text style={styles.heroIcon}>🛕</Text>
          <Text style={styles.heroName}>{temple.name}</Text>
        </Card>

        <Card>
          <Text style={styles.label}>📍 Location</Text>
          <Text style={styles.value}>{temple.address || temple.city || "Location not available"}</Text>
          {temple.state && <Text style={styles.sub}>{temple.state}, India</Text>}
        </Card>

        {temple.location && (
          <Card>
            <Text style={styles.label}>🗺️ Coordinates</Text>
            <Text style={styles.value}>{temple.location.lat.toFixed(4)}, {temple.location.lon.toFixed(4)}</Text>
          </Card>
        )}

        <Card>
          <Text style={styles.label}>ℹ️ Details</Text>
          <Text style={styles.sub}>
            This is one of the renowned temples from our curated database of famous Hindu temples across India.
            Visit during morning or evening aarti for the best spiritual experience.
          </Text>
        </Card>

        <Button title="Book a Puja at this Temple" onPress={() => navigation.getParent()?.navigate("connect")}
          style={{ marginTop: spacing.md }} />
        <Button title="Find on Map" variant="secondary"
          onPress={() => navigation.navigate("Map", { lat: temple.location?.lat, lng: temple.location?.lon })}
          style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", paddingVertical: spacing.xl, backgroundColor: colors.peach },
  heroIcon: { fontSize: 48, marginBottom: spacing.sm },
  heroName: { color: colors.text, fontSize: 22, fontWeight: "800", textAlign: "center" },
  label: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.xs, textTransform: "uppercase", letterSpacing: 1 },
  value: { color: colors.text, fontSize: 15, fontWeight: "600" },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
});
