import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { Button } from "../../components/Button";
import { SectionHeader } from "../../components/SectionHeader";
import { colors, spacing } from "../../theme";
import { forgotPassword } from "../../api/auth";
import { getErrorMessage } from "../../api/client";

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequestReset() {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const res = await forgotPassword(email.toLowerCase());
      // For development, we show the code in an alert. In production, this would be an email.
      Alert.alert("Reset Code Sent", `Use this code to reset: ${res.code}`);
      navigation.navigate("ResetPassword", { email: email.toLowerCase() });
    } catch (err: any) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen safeTop>
      <SectionHeader title="Forgot Password" />
      <Text style={styles.subtitle}>Enter your email to receive a reset code</Text>
      <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
      <Button title="Send Reset Code" onPress={handleRequestReset} loading={loading} style={{ marginTop: spacing.sm }} />
      <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.link}>
        <Text style={styles.linkText}>Back to Log In</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
  link: { marginTop: spacing.lg, alignItems: "center" },
  linkText: { color: colors.accent },
});
