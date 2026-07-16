import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius, spacing } from "../theme";

export function PriestCard({
  name,
  rating,
  online = true,
  onPress,
}: {
  name: string;
  rating: number;
  online?: boolean;
  onPress?: () => void;
}) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarIcon}>👤</Text>
        </View>
        {online ? <View style={styles.onlineDot} /> : null}
      </View>
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
      <Text style={styles.stars}>
        {"★".repeat(fullStars)}
        {hasHalf ? "⯪" : ""}
        {"☆".repeat(5 - fullStars - (hasHalf ? 1 : 0))}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 128,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "center",
    marginRight: spacing.md,
  },
  avatarWrap: { marginBottom: spacing.sm },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarIcon: { fontSize: 24 },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.card,
  },
  name: { color: colors.text, fontSize: 14, fontWeight: "700", marginBottom: spacing.xs },
  stars: { color: colors.star, fontSize: 13 },
});
