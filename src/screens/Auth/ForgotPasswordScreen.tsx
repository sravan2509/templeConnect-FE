import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { Button } from "../../components/Button";
import { SectionHeader } from "../../components/SectionHeader";
import { colors, spacing } from "../../theme";
import { forgotPassword, isValidEmail } from "../../api/auth";
import { showAuthError } from "./LoginScreen";

export default function ForgotPasswordScreen({ navigation, route }: any) {
  const [email, setEmail] = useState(route.params?.email || "");
  const [loading, setLoading] = useState(false);

  async function handleRequestReset() {
    if (!isValidEmail(email)) return Alert.alert("Check your email", "Please enter a valid email address.");
    setLoading(true);
    try {
      const normalized = email.trim().toLowerCase();
      const res = await forgotPassword(normalized);
      // devCode is only returned by a development backend with DEV_EXPOSE_RESET_CODE=true.
      const devNote = __DEV__ && res.devCode ? `\n\n(Development) Your code is ${res.devCode}` : "";
      Alert.alert("Check your email", `${res.message}${devNote}`);
      navigation.navigate("ResetPassword", { email: normalized });
    } catch (err) {
      showAuthError("Error", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen safeTop>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} hitSlop={12}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>
      <SectionHeader title="Forgot Password" />
      <Text style={styles.subtitle}>Enter your email and we'll send you a 6-digit reset code.</Text>
      <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
      <Button title="Send Reset Code" onPress={handleRequestReset} loading={loading} style={{ marginTop: spacing.sm }} />
      <TouchableOpacity onPress={() => navigation.navigate("ResetPassword", { email: email.trim().toLowerCase() })} style={styles.link}>
        <Text style={styles.linkText}>I already have a code</Text>
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
