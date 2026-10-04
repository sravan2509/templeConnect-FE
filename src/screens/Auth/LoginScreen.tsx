import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { Button } from "../../components/Button";
import { SectionHeader } from "../../components/SectionHeader";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing } from "../../theme";
import { getErrorMessage, isNetworkError } from "../../api/client";
import { isProbablyOnline } from "../../utils/network";
import { isValidEmail } from "../../api/auth";

export function showAuthError(title: string, err: unknown) {
  if (isNetworkError(err)) {
    Alert.alert(isProbablyOnline() ? "Connection problem" : "No internet connection", getErrorMessage(err));
  } else {
    Alert.alert(title, getErrorMessage(err));
  }
}

export default function LoginScreen({ navigation, route }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState<string>(route?.params?.email ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-fill when arriving from signup ("account exists") or a password reset.
  useEffect(() => {
    if (route?.params?.email) setEmail(route.params.email);
  }, [route?.params?.email]);

  async function handleLogin() {
    if (!isValidEmail(email)) return Alert.alert("Check your email", "Please enter a valid email address.");
    if (!password) return Alert.alert("Password required", "Please enter your password.");
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      showAuthError("Login Failed", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen safeTop>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} hitSlop={12}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>
      <SectionHeader title="Welcome back" />
      <Text style={styles.subtitle}>Sign in to continue</Text>
      <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="you@example.com" />
      <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" placeholder="Your password" onSubmitEditing={handleLogin} returnKeyType="go" />
      <Button title="Log In" onPress={handleLogin} loading={loading} style={{ marginTop: spacing.sm }} />
      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword", { email })} style={styles.link}>
        <Text style={styles.linkText}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Signup")} style={styles.link}>
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
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
