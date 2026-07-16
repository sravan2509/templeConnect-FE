import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius, spacing } from "../theme";

export function PromoCard({
  title,
  subtitle,
  icon = "✨",
  onPress,
}: {
  title: string;
  subtitle: string;
  icon?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  textWrap: { flex: 1, paddingRight: spacing.md },
  title: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: spacing.xs },
  subtitle: { color: "#F0DDCB", fontSize: 13, lineHeight: 18 },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 22 },
});
