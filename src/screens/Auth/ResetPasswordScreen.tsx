import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { Button } from "../../components/Button";
import { SectionHeader } from "../../components/SectionHeader";
import { colors, spacing } from "../../theme";
import { isValidEmail, resetPassword } from "../../api/auth";
import { showAuthError } from "./LoginScreen";

export default function ResetPasswordScreen({ route, navigation }: any) {
  const [email, setEmail] = useState<string>(route.params?.email || "");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!isValidEmail(email)) return Alert.alert("Check your email", "Please enter a valid email address.");
    if (!/^\d{6}$/.test(token.trim())) return Alert.alert("Invalid code", "Enter the 6-digit code from your email.");
    if (newPassword.length < 8) return Alert.alert("Weak password", "Password must be at least 8 characters.");
    if (newPassword !== confirm) return Alert.alert("Passwords don't match", "Please re-enter the same password.");
    setLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase(), token.trim(), newPassword);
      Alert.alert("Success", "Password reset successful! You can now log in.");
      navigation.navigate("Login", { email: email.trim().toLowerCase() });
    } catch (err) {
      showAuthError("Reset Failed", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen safeTop>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} hitSlop={12}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>
      <SectionHeader title="Reset Password" />
      <Text style={styles.subtitle}>Enter the 6-digit code we emailed you and choose a new password.</Text>
      {!route.params?.email && (
        <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
      )}
      <TextField label="Reset Code" value={token} onChangeText={setToken} placeholder="123456" keyboardType="number-pad" maxLength={6} />
      <TextField label="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="At least 8 characters" />
      <TextField label="Confirm New Password" value={confirm} onChangeText={setConfirm} secureTextEntry />
      <Button title="Reset Password" onPress={handleReset} loading={loading} style={{ marginTop: spacing.sm }} />
      <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.link}>
        <Text style={styles.linkText}>Back to Log In</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { marginBottom: spacing.md, marginTop: spacing.sm, alignSelf: "flex-start" },
  backText: { color: colors.primary, fontWeight: "600", fontSize: 16 },
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
  link: { marginTop: spacing.lg, alignItems: "center" },
  linkText: { color: colors.accent },
});
