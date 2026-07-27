import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { Button } from "../../components/Button";
import { SectionHeader } from "../../components/SectionHeader";
import { colors, spacing } from "../../theme";
import { resetPassword } from "../../api/auth";
import { getErrorMessage } from "../../api/client";

export default function ResetPasswordScreen({ route, navigation }: any) {
  const email = route.params?.email || "";
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!token || !newPassword) {
      Alert.alert("Error", "Please enter the code and a new password");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, token, newPassword);
      Alert.alert("Success", "Password reset successful! You can now log in.");
      navigation.navigate("Login");
    } catch (err: any) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen safeTop>
      <SectionHeader title="Reset Password" />
      <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>
      <TextField label="Reset Code" value={token} onChangeText={setToken} placeholder="123456" keyboardType="number-pad" />
      <TextField label="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="••••••••" />
      <Button title="Reset Password" onPress={handleReset} loading={loading} style={{ marginTop: spacing.sm }} />
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
