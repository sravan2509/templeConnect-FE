import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius, spacing } from "../theme";

export function QuickAccessItem({ icon, label, onPress }: { icon: string; label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.wrap} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", width: 74 },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.peach,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  icon: { fontSize: 26 },
  label: { color: colors.text, fontSize: 12, textAlign: "center" },
});
