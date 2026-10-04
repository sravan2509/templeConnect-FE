import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius, spacing } from "../theme";
import { useAuth } from "../context/AuthContext";
import { GoogleSignInCancelled, googleUnavailableReason } from "../utils/googleSignIn";
import { getErrorMessage, isNetworkError } from "../api/client";

/** "Continue with Google" — signs in existing accounts and creates new ones. */
export function GoogleButton({ disabled }: { disabled?: boolean }) {
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const unavailable = googleUnavailableReason();

  async function handlePress() {
    if (unavailable) return Alert.alert("Google sign-in", unavailable);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      if (err instanceof GoogleSignInCancelled) return; // user closed the picker
      Alert.alert(isNetworkError(err) ? "No internet connection" : "Google sign-in failed", getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.or}>or</Text>
        <View style={styles.line} />
      </View>
      <TouchableOpacity
        style={[styles.button, (disabled || busy) && { opacity: 0.6 }]}
        onPress={handlePress}
        disabled={disabled || busy}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
      >
        {busy ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <>
            <View style={styles.logo}>
              <Text style={styles.logoText}>G</Text>
            </View>
            <Text style={styles.label}>Continue with Google</Text>
          </>
        )}
      </TouchableOpacity>
      {unavailable ? <Text style={styles.note}>{unavailable}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: spacing.md },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { color: colors.textMuted, marginHorizontal: spacing.md, fontSize: 13 },
  button: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff", borderRadius: radius.md, borderWidth: 1, borderColor: "#DADCE0",
    paddingVertical: spacing.md - 2, minHeight: 52,
  },
  logo: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", marginRight: spacing.sm + 2 },
  logoText: { color: "#4285F4", fontSize: 20, fontWeight: "900" },
  label: { color: "#1F1F1F", fontSize: 16, fontWeight: "600" },
  note: { color: colors.textMuted, fontSize: 12, textAlign: "center", marginTop: spacing.xs },
});
