import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../theme";
import { SearchBar } from "../../components/SearchBar";
import { QuickAccessItem } from "../../components/QuickAccessItem";
import { PromoCard } from "../../components/PromoCard";
import { PriestCard } from "../../components/PriestCard";
import { TempleCard } from "../../components/TempleCard";
import { useAuth } from "../../context/AuthContext";
import { getDashboard } from "../../api/profile";
import { listPriests, Priest } from "../../api/connect";

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [priests, setPriests] = useState<Priest[]>([]);
  const [temples, setTemples] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try { const d = await getDashboard(); setDashboard(d); } catch {}
      try { const p = await listPriests(); setPriests(p.slice(0, 3)); } catch {}
    })();
  }, []);

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
        {user && (
          <Text style={styles.greeting}>
            {dashboard?.greeting || "Namaste"}, {user.name} 🙏
          </Text>
        )}

        <SearchBar
          placeholder="Search temples, priests, rituals..."
          onPress={() => navigation.navigate("TempleSearch")}
        />

        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickAccessRow}>
          <QuickAccessItem icon="🛕" label="Find Temples" onPress={() => navigation.navigate("TempleSearch")} />
          <QuickAccessItem icon="🧑" label="Priests" onPress={() => navigation.getParent()?.navigate("connect")} />
          <QuickAccessItem icon="📅" label="Book Puja" onPress={() => navigation.getParent()?.navigate("connect")} />
          <QuickAccessItem icon="📖" label="Learn" onPress={() => navigation.getParent()?.navigate("rituals")} />
        </View>

        <PromoCard
          title="Discover Your Spiritual Profile"
          subtitle="Get personalized deity recommendations based on your birth star"
          onPress={() => navigation.navigate("BirthChartForm")}
        />

        {priests.length > 0 && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Available Priests</Text>
              <TouchableOpacity onPress={() => navigation.getParent()?.navigate("connect")}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {priests.map((p) => (
                <PriestCard
                  key={p.id}
                  name={p.name}
                  rating={p.rating}
                  onPress={() => navigation.getParent()?.navigate("connect")}
                />
              ))}
            </ScrollView>
          </>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Famous Temples</Text>
          <TouchableOpacity onPress={() => navigation.navigate("TempleSearch")}>
            <Text style={styles.viewAll}>Search More</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.templeGrid}>
          {MOCK_TEMPLES.map((t) => (
            <View key={t.name} style={styles.templeGridItem}>
              <TempleCard
                name={t.name}
                distance={t.distance}
                onPress={() => navigation.navigate("TempleSearch")}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const MOCK_TEMPLES = [
  { name: "Tirumala Temple", distance: "Tirupati" },
  { name: "Kashi Vishwanath", distance: "Varanasi" },
  { name: "Somnath Temple", distance: "Gujarat" },
  { name: "Meenakshi Temple", distance: "Madurai" },
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: colors.card, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logo: { fontSize: 24, marginRight: spacing.sm },
  headerTitle: { color: colors.primary, fontSize: 20, fontWeight: "800" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  headerIcon: { fontSize: 20, marginLeft: spacing.md },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  greeting: { color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: spacing.md },
  sectionHeaderRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.sm,
  },
  viewAll: { color: colors.primary, fontWeight: "600", fontSize: 13 },
  quickAccessRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.lg },
  hScroll: { marginBottom: spacing.lg },
  templeGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  templeGridItem: { width: "48%" },
});
