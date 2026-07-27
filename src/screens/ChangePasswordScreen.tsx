import React, { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { Screen } from "./../components/Screen";
import { TextField } from "./../components/TextField";
import { Button } from "./../components/Button";
import { SectionHeader } from "./../components/SectionHeader";
import { colors, spacing } from "./../theme";
import { changePassword } from "./../api/auth";
import { getErrorMessage } from "./../api/client";

export default function ChangePasswordScreen({ navigation }: any) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleChangePassword() {
    if (!oldPassword || !newPassword) {
      Alert.alert("Error", "Please enter both old and new passwords");
      return;
    }
    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      Alert.alert("Success", "Password changed successfully");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <SectionHeader title="Change Password" />
      <Text style={styles.subtitle}>Update your account password</Text>
      
      <TextField 
        label="Old Password" 
        value={oldPassword} 
        onChangeText={setOldPassword} 
        secureTextEntry 
      />
      <TextField 
        label="New Password" 
        value={newPassword} 
        onChangeText={setNewPassword} 
        secureTextEntry 
      />
      
      <Button 
        title="Update Password" 
        onPress={handleChangePassword} 
        loading={loading} 
        style={{ marginTop: spacing.sm }} 
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
});
