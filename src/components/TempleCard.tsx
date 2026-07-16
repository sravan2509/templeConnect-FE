import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius, spacing } from "../theme";

export function TempleCard({
  name,
  distance,
  onPress,
}: {
  name: string;
  distance: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageBox}>
        <Text style={styles.icon}>🛕</Text>
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.distance}>📍 {distance}</Text>
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
    marginBottom: spacing.md,
  },
  imageBox: {
    backgroundColor: colors.peach,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 34 },
  textWrap: { padding: spacing.sm + 2 },
  name: { color: colors.text, fontSize: 14, fontWeight: "700", marginBottom: 2 },
  distance: { color: colors.textMuted, fontSize: 12 },
});
