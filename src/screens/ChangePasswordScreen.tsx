import React, { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { colors, spacing } from "../theme";
import { changePassword } from "../api/auth";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function ChangePasswordScreen({ navigation }: any) {
  const { updateSession, user } = useAuth();
  // Google-only accounts have no password yet: they set one without a current password.
  const settingFirst = user?.hasPassword === false;
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleChangePassword() {
    if ((!settingFirst && !oldPassword) || !newPassword) return Alert.alert("Error", settingFirst ? "Please enter a new password" : "Please enter your current and new passwords");
    if (newPassword.length < 8) return Alert.alert("Weak password", "New password must be at least 8 characters");
    if (newPassword !== confirm) return Alert.alert("Passwords don't match", "Please re-enter the same new password");
    setLoading(true);
    try {
      const res = await changePassword(settingFirst ? undefined : oldPassword, newPassword);
      // Other devices are signed out; keep this one signed in with the new token.
      await updateSession(res.user, res.token);
      Alert.alert("Success", settingFirst ? "Password set. You can now also log in with your email and password." : "Password changed. You've been signed out on other devices.");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.subtitle}>
        {settingFirst ? "You signed up with Google. Set a password to also log in with your email." : "Update your account password"}
      </Text>
      {!settingFirst && <TextField label="Current Password" value={oldPassword} onChangeText={setOldPassword} secureTextEntry />}
      <TextField label="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="At least 8 characters" />
      <TextField label="Confirm New Password" value={confirm} onChangeText={setConfirm} secureTextEntry />
      <Button title="Update Password" onPress={handleChangePassword} loading={loading} style={{ marginTop: spacing.sm }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
});
