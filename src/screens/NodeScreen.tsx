import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { ListRow } from "../components/ListRow";
import { ToggleRow } from "../components/ToggleRow";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { SectionHeader } from "../components/SectionHeader";
import { colors, spacing } from "../theme";
import { findNode, TreeNode } from "../content/tree";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/client";
import { getFAQs, searchKnowledgeBase, getNotificationPrefs, getCheckins, getBookingHistory } from "../api/profile";
import { listBookings } from "../api/connect";
import { getForecast, getRecommendations } from "../api/astrology";
import { getNotifications } from "../api/admin";

export default function NodeScreen({ route, navigation }: any) {
  const { tabId, nodeId } = route.params as { tabId: string; nodeId: string };
  const node = findNode(tabId, nodeId);
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => { fetchNodeData(); }, [nodeId]);

  async function fetchNodeData() {
    if (!node) return;
    setLoading(true); setError(null);
    try {
      switch (node.id) {
        case "cultural-content": case "kids-stories-micro-videos": case "temple-etiquette-practices": {
          const items = await searchKnowledgeBase();
          const cat = node.id === "cultural-content" ? "cultural" : node.id === "kids-stories-micro-videos" ? "kids" : "etiquette";
          setData(items.filter((a: any) => a.category === cat));
          break;
        }
        case "upcoming-bookings": { setData(await listBookings("upcoming")); break; }
        case "booking-history": { setData(await getBookingHistory()); break; }
        case "notification-preferences": { setData(await getNotificationPrefs()); break; }
        case "help-center": { setData(await getFAQs()); break; }
        case "notifications": { setData(await getNotifications()); break; }
        default: setData(null);
      }
    } catch (e: any) { setError(getErrorMessage(e)); }
    setLoading(false);
  }

  if (!node) return <Screen><Text style={styles.err}>Screen not found.</Text></Screen>;

  const isHub = node.kind === "hub" && (node.children?.length ?? 0) > 0;
  const hasRows = (node.rows?.length ?? 0) > 0;

  return (
    <Screen>
      {node.id === "profile-root" && user && (
        <Card style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() ?? "?"}</Text></View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </Card>
      )}
      <SectionHeader title={node.title} />
      {node.subtitle && <Text style={styles.subtitle}>{node.subtitle}</Text>}
      {loading && <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {isHub && !loading && node.children!.map(child => (
        <ListRow key={child.id} icon={child.icon} title={child.title} subtitle={child.subtitle} onPress={() => navigateTo(child)} />
      ))}
      {hasRows && renderRows()}
      {!isHub && !hasRows && !loading && data !== null && renderContent()}

      {node.id === "profile-root" && <Button title="Log Out" variant="secondary" onPress={signOut} style={{ marginTop: spacing.lg }} />}
    </Screen>
  );

  function navigateTo(child: TreeNode) {
    switch (child.kind) {
      case "temple-search": navigation.navigate("TempleSearch"); break;
      case "birth-chart-form": navigation.navigate("BirthChartForm"); break;
      case "birth-chart-result": navigation.navigate("BirthChartResult"); break;
      case "book-puja": navigation.navigate("BookPuja"); break;
      case "map-view": navigation.navigate("Map"); break;
      case "admin-dashboard": navigation.navigate("AdminDashboard"); break;
      default: navigation.push("Node", { tabId, nodeId: child.id });
    }
  }

  function renderRows() {
    return node!.rows!.map(row => row.toggle
      ? <ToggleRow key={row.label} icon={row.icon} label={row.label} defaultOn={row.defaultOn} />
      : <ListRow key={row.label} icon={row.icon} title={row.label} subtitle={row.value} chevron={!row.value} />
    );
  }

  function renderContent() {
    if (Array.isArray(data)) {
      if (data.length === 0) return <Card><Text style={styles.detailText}>No items found.</Text></Card>;
      return data.map((item: any, i: number) => {
        if (item.title) return <Card key={i}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.detailText}>{item.summary || item.answer || item.content}</Text></Card>;
        if (item.question) return <Card key={i}><Text style={styles.cardTitle}>{item.question}</Text><Text style={styles.detailText}>{item.answer}</Text></Card>;
        if (item.type && item.body) return (
          <Card key={i} style={item.read ? {} : { borderColor: colors.primary, borderWidth: 2 }}>
            <Text style={styles.cardTitle}>{item.read ? "" : "🔵 "}{item.title}</Text>
            <Text style={styles.detailText}>{item.body}</Text>
            <Text style={styles.sub}>{new Date(item.createdAt).toLocaleString()} · {item.type}</Text>
          </Card>
        );
        if (item.puja?.name) return <Card key={i}><Text style={styles.cardTitle}>{item.puja.icon} {item.puja.name}</Text><Text style={styles.sub}>Priest: {item.priest?.name} · {new Date(item.scheduledAt).toLocaleDateString()}</Text><Text style={[styles.status, item.status === "confirmed" && {color: colors.success}]}>{item.status.toUpperCase()}</Text></Card>;
        return null;
      });
    }
    if (typeof data === "object" && data?.pujaReminders !== undefined) {
      return <View>
        <ToggleRow icon="🛕" label="Puja Reminders" defaultOn={data.pujaReminders} />
        <ToggleRow icon="📅" label="Booking Updates" defaultOn={data.bookingUpdates} />
        <ToggleRow icon="💫" label="Daily Suggestions" defaultOn={data.dailySuggestions} />
      </View>;
    }
    return <Card><Text style={styles.detailText}>Content loaded.</Text></Card>;
  }
}

const styles = StyleSheet.create({
  subtitle: { color: colors.textMuted, marginBottom: spacing.md },
  detailText: { color: colors.text, lineHeight: 20 },
  error: { color: colors.danger, padding: spacing.sm }, err: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
  profileCard: { alignItems: "center", paddingVertical: spacing.lg },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primaryDark, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  profileName: { color: colors.text, fontSize: 18, fontWeight: "700" },
  profileEmail: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: "700", marginBottom: spacing.xs },
  sub: { color: colors.textMuted, fontSize: 12 }, status: { color: colors.star, fontSize: 13, fontWeight: "700", marginTop: spacing.xs },
});
