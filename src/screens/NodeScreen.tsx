import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { ListRow } from "../components/ListRow";
import { ToggleRow } from "../components/ToggleRow";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { SectionHeader } from "../components/SectionHeader";
import { colors, spacing } from "../theme";
import { findNode } from "../content/tree";
import { useAuth } from "../context/AuthContext";

export default function NodeScreen({ route, navigation }: any) {
  const { tabId, nodeId } = route.params as { tabId: string; nodeId: string };
  const node = findNode(tabId, nodeId);
  const { user, signOut } = useAuth();

  if (!node) {
    return (
      <Screen>
        <Text style={styles.subtitle}>Screen not found.</Text>
      </Screen>
    );
  }

  const isHub = node.kind === "hub" && (node.children?.length ?? 0) > 0;
  const hasRows = !isHub && (node.rows?.length ?? 0) > 0;

  return (
    <Screen>
      {node.id === "profile-root" && user && (
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() ?? "?"}</Text>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </Card>
      )}

      <SectionHeader title={node.title} />
      {node.subtitle ? <Text style={styles.subtitle}>{node.subtitle}</Text> : null}

      {isHub &&
        node.children!.map((child) => (
          <ListRow
            key={child.id}
            icon={child.icon}
            title={child.title}
            subtitle={child.subtitle}
            onPress={() => {
              if (child.kind === "temple-search") {
                navigation.navigate("TempleSearch");
              } else if (child.kind === "birth-chart-form") {
                navigation.navigate("BirthChartForm");
              } else if (child.kind === "birth-chart-result") {
                navigation.navigate("BirthChartResult");
              } else {
                navigation.push("Node", { tabId, nodeId: child.id });
              }
            }}
          />
        ))}

      {hasRows &&
        node.rows!.map((row) =>
          row.toggle ? (
            <ToggleRow key={row.label} icon={row.icon} label={row.label} defaultOn={row.defaultOn} />
          ) : (
            <ListRow key={row.label} icon={row.icon} title={row.label} subtitle={row.value} chevron={!row.value} />
          )
        )}

      {!isHub && !hasRows && (
        <Card>
          <Text style={styles.detailText}>
            {node.subtitle ?? `${node.title} — content and design for this screen will be wired up once we review the Figma spec together.`}
          </Text>
        </Card>
      )}

      {node.id === "profile-root" && <Button title="Log Out" variant="secondary" onPress={signOut} style={{ marginTop: spacing.lg }} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.textMuted, marginBottom: spacing.md },
  detailText: { color: colors.text, lineHeight: 20 },
  profileCard: { alignItems: "center", paddingVertical: spacing.lg },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  profileName: { color: colors.text, fontSize: 18, fontWeight: "700" },
  profileEmail: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
});
