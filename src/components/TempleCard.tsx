import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius, spacing } from "../theme";

export function TempleCard({
  name,
  distance,
  badge,
  onPress,
}: {
  name: string;
  distance: string;
  badge?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageBox}>
        <Text style={styles.icon}>🛕</Text>
        {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.name} numberOfLines={2}>{name}</Text>
        {distance ? <Text style={styles.distance} numberOfLines={1}>📍 {distance}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  imageBox: {
    backgroundColor: colors.peach,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 34 },
  badge: { position: "absolute", top: 8, right: 8, backgroundColor: colors.success, color: "#fff", fontSize: 11, fontWeight: "800", paddingHorizontal: 6, borderRadius: 8, overflow: "hidden" },
  textWrap: { padding: spacing.sm + 2, minHeight: 64 },
  name: { color: colors.text, fontSize: 14, fontWeight: "700", marginBottom: 2 },
  distance: { color: colors.textMuted, fontSize: 12 },
});
