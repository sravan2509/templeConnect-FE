import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import { colors, radius, spacing } from "../theme";

export function Button({
  title,
  onPress,
  loading,
  variant = "primary",
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const isPrimary = variant === "primary";
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.bg : colors.primary} />
      ) : (
        <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textSecondary]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.primary },
  disabled: { opacity: 0.5 },
  text: { fontSize: 16, fontWeight: "600" },
  textPrimary: { color: colors.bg },
  textSecondary: { color: colors.primary },
});
