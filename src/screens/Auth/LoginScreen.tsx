import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { Button } from "../../components/Button";
import { SectionHeader } from "../../components/SectionHeader";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing } from "../../theme";
import { getErrorMessage, API_BASE_URL } from "../../api/client";

export default function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      const msg = getErrorMessage(err);
      if (msg.toLowerCase().includes("cannot connect") || msg.toLowerCase().includes("network")) {
        Alert.alert(
          "Connection Error",
          `${msg}\n\nAPI: ${API_BASE_URL}\n\n1. Start backend: cd templeConnect-BE && npm run dev\n2. Check your phone and PC are on same WiFi / connected via USB`,
        );
      } else {
        Alert.alert("Login Failed", msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <SectionHeader title="Temple Connect" />
      <Text style={styles.subtitle}>Sign in to continue</Text>
      <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
      <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
      <Button title="Log In" onPress={handleLogin} loading={loading} style={{ marginTop: spacing.sm }} />
      <TouchableOpacity onPress={() => navigation.navigate("Signup")} style={styles.link}>
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
  link: { marginTop: spacing.lg, alignItems: "center" },
  linkText: { color: colors.accent },
});
