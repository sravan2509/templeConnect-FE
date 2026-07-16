import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../theme";
import { SearchBar } from "../../components/SearchBar";
import { QuickAccessItem } from "../../components/QuickAccessItem";
import { PromoCard } from "../../components/PromoCard";
import { PriestCard } from "../../components/PriestCard";
import { TempleCard } from "../../components/TempleCard";

const PRIESTS = [
  { name: "Pandit Sharma", rating: 4.5 },
  { name: "Acharya Gupta", rating: 5 },
  { name: "Pandit Rao", rating: 4 },
];

const TEMPLES = [
  { name: "Hanuman Temple", distance: "2.3 km away" },
  { name: "Shiva Temple", distance: "3.7 km away" },
  { name: "Durga Temple", distance: "5.1 km away" },
  { name: "Krishna Temple", distance: "6.8 km away" },
];

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>🛕</Text>
          <Text style={styles.headerTitle}>Temple Connect</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerIcon}>🔔</Text>
          <TouchableOpacity onPress={() => navigation.getParent()?.navigate("profile")}>
            <Text style={styles.headerIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SearchBar
          placeholder="Search temples, priests, rituals..."
          onPress={() => navigation.push("Node", { tabId: "home", nodeId: "quick-links" })}
        />

        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickAccessRow}>
          <QuickAccessItem icon="🛕" label="Find Temples" onPress={() => navigation.getParent()?.navigate("temples")} />
          <QuickAccessItem icon="🧑" label="Priests" onPress={() => navigation.getParent()?.navigate("connect")} />
          <QuickAccessItem
            icon="📅"
            label="Book Puja"
            onPress={() => navigation.push("Node", { tabId: "home", nodeId: "book-priest-astrologer" })}
          />
          <QuickAccessItem icon="📖" label="Learn" onPress={() => navigation.getParent()?.navigate("rituals")} />
        </View>

        <PromoCard
          title="Get Personalized Ritual Guidance"
          subtitle="Connect with verified priests for spiritual consultations"
          onPress={() => navigation.getParent()?.navigate("rituals")}
        />

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Priests Online Now</Text>
          <TouchableOpacity onPress={() => navigation.getParent()?.navigate("connect")}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
          {PRIESTS.map((p) => (
            <PriestCard key={p.name} name={p.name} rating={p.rating} onPress={() => navigation.getParent()?.navigate("connect")} />
          ))}
        </ScrollView>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Temples Near You</Text>
          <TouchableOpacity onPress={() => navigation.getParent()?.navigate("temples")}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.templeGrid}>
          {TEMPLES.map((t) => (
            <View key={t.name} style={styles.templeGridItem}>
              <TempleCard name={t.name} distance={t.distance} onPress={() => navigation.getParent()?.navigate("temples")} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logo: { fontSize: 24, marginRight: spacing.sm },
  headerTitle: { color: colors.primary, fontSize: 20, fontWeight: "800" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  headerIcon: { fontSize: 20, marginLeft: spacing.md },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: spacing.md },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  viewAll: { color: colors.primary, fontWeight: "600", fontSize: 13 },
  quickAccessRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.lg },
  hScroll: { marginBottom: spacing.lg },
  templeGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  templeGridItem: { width: "48%" },
});
