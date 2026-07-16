import { StyleSheet, Text } from "react-native";
import { colors, spacing } from "../theme";

export function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.text}>{title}</Text>;
}

const styles = StyleSheet.create({
  text: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
});
