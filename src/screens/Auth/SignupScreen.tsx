import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { Button } from "../../components/Button";
import { SectionHeader } from "../../components/SectionHeader";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing } from "../../theme";
import { getErrorMessage, API_BASE_URL } from "../../api/client";

export default function SignupScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setLoading(true);
    try {
      await signUp(name, email, password);
    } catch (err: any) {
      const msg = getErrorMessage(err);
      if (msg.toLowerCase().includes("cannot connect") || msg.toLowerCase().includes("network")) {
        Alert.alert(
          "Connection Error",
          `${msg}\n\nAPI: ${API_BASE_URL}\n\n1. Start backend: cd templeConnect-BE && npm run dev\n2. Check your phone and PC are on same WiFi / connected via USB`,
        );
      } else {
        Alert.alert("Signup Failed", msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen safeTop>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: spacing.md }}>
        <Text style={{ color: colors.primary, fontWeight: "600" }}>? Back</Text>
      </TouchableOpacity>
      <SectionHeader title="Create Account" />
      <Text style={styles.subtitle}>Join Temple Connect</Text>
      <TextField label="Name" value={name} onChangeText={setName} placeholder="Your name" />
      <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
      <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 8 characters" />
      <Button title="Sign Up" onPress={handleSignup} loading={loading} style={{ marginTop: spacing.sm }} />
      <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.link}>
        <Text style={styles.linkText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
  link: { marginTop: spacing.lg, alignItems: "center" },
  linkText: { color: colors.accent },
});
