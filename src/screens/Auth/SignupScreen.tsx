import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { Button } from "../../components/Button";
import { SectionHeader } from "../../components/SectionHeader";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing } from "../../theme";
import { isValidEmail } from "../../api/auth";
import { showAuthError } from "./LoginScreen";

export default function SignupScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name.trim()) return Alert.alert("Name required", "Please enter your name.");
    if (!isValidEmail(email)) return Alert.alert("Check your email", "Please enter a valid email address.");
    if (password.length < 8) return Alert.alert("Weak password", "Password must be at least 8 characters.");
    if (password !== confirm) return Alert.alert("Passwords don't match", "Please re-enter the same password.");
    setLoading(true);
    try {
      await signUp(name, email, password);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        Alert.alert("Account already exists", "An account with this email already exists. Would you like to log in instead?", [
          { text: "Cancel", style: "cancel" },
          { text: "Log in", onPress: () => navigation.navigate("Login", { email: email.trim() }) },
        ]);
        return;
      }
      showAuthError("Signup Failed", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen safeTop>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} hitSlop={12}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>
      <SectionHeader title="Create Account" />
      <Text style={styles.subtitle}>Join Temple Connect</Text>
      <TextField label="Name" value={name} onChangeText={setName} placeholder="Your name" autoComplete="name" />
      <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="you@example.com" />
      <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" placeholder="At least 8 characters" />
      <TextField label="Confirm Password" value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="new-password" placeholder="Re-enter password" onSubmitEditing={handleSignup} returnKeyType="go" />
      <Button title="Sign Up" onPress={handleSignup} loading={loading} style={{ marginTop: spacing.sm }} />
      <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.link}>
        <Text style={styles.linkText}>Already have an account? Log in</Text>
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
