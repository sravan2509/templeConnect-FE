import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors, radius, spacing } from "../theme";

export function SearchBar({ placeholder, onPress }: { placeholder: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.bar} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.icon}>🔍</Text>
      <Text style={styles.placeholder}>{placeholder}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.peach,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  icon: { fontSize: 18, marginRight: spacing.sm },
  placeholder: { color: colors.primaryDark, fontSize: 15, opacity: 0.8 },
});
