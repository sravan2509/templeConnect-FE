import { StyleSheet, Switch, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

export function ToggleRow({
  icon, label, value, onChange,
}: {
  icon?: string; label: string; value?: boolean; onChange?: (val: boolean) => void;
}) {
  const on = !!value;
  return (
    <View style={styles.row}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={on}
        onValueChange={(v) => onChange?.(v)}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.card,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    paddingVertical: spacing.md, paddingHorizontal: spacing.md, marginBottom: spacing.sm,
  },
  icon: { fontSize: 20, marginRight: spacing.md },
  label: { flex: 1, color: colors.text, fontSize: 15, fontWeight: "600" },
});
