import React, { useCallback } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { setStatusBarStyle } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing } from "../../theme";

const HIGHLIGHTS = ["🛕 Temples near you", "✅ Verified priests", "🪐 Vedic astrology"];

const FEATURES = [
  { icon: "🗺️", title: "Discover temples", text: "Find temples near you or by deity, city and state — with timings, events and directions." },
  { icon: "🪔", title: "Book a puja", text: "Choose from home ceremonies to homas, pick a priest and a time that suits you." },
  { icon: "🌙", title: "Spiritual profile", text: "Your Nakshatra, Rashi and the deity recommended for your birth star." },
  { icon: "💬", title: "Talk to your priest", text: "Chat directly with your priest to plan every detail of the ceremony." },
  { icon: "📅", title: "Temple events", text: "See festivals and utsavams at temples around you, and never miss one." },
  { icon: "📚", title: "Learn & share", text: "Temple etiquette, the meaning behind rituals, and stories for children." },
];

const STEPS = [
  { title: "Create your free account", text: "Sign up with your email in under a minute." },
  { title: "Add your birth details", text: "Discover your star, sign and recommended deity." },
  { title: "Visit, book and connect", text: "Find temples, book pujas and chat with priests." },
];

export default function LandingScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const twoColumns = width >= 360;

  // Light status-bar icons over the dark hero; restore dark icons for other screens.
  useFocusEffect(useCallback(() => {
    setStatusBarStyle("light");
    return () => setStatusBarStyle("dark");
  }, []));

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 170 + insets.bottom }}>
        {/* Hero */}
        <LinearGradient colors={["#7A3B1C", colors.primary, "#D9894F"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: insets.top + spacing.xl }]}>
          <View style={styles.glowOne} />
          <View style={styles.glowTwo} />
          <View style={styles.logoCircle}>
            <Text style={styles.logo}>🛕</Text>
          </View>
          <Text style={styles.brand}>Temple Connect</Text>
          <Text style={styles.tagline}>Your digital bridge to the divine</Text>
          <Text style={styles.heroText}>
            Discover temples, understand your spiritual profile and book authentic pujas with verified priests — all in one place.
          </Text>
          <View style={styles.highlights}>
            {HIGHLIGHTS.map((h) => (
              <View key={h} style={styles.highlight}>
                <Text style={styles.highlightText}>{h}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.eyebrow}>WHAT YOU CAN DO</Text>
          <Text style={styles.sectionTitle}>Everything for your spiritual journey</Text>
          <View style={styles.grid}>
            {FEATURES.map((f) => (
              <View key={f.title} style={[styles.feature, { width: twoColumns ? "48%" : "100%" }]}>
                <View style={styles.featureIconBox}><Text style={styles.featureIcon}>{f.icon}</Text></View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* How it works */}
        <View style={[styles.section, styles.stepsSection]}>
          <Text style={styles.eyebrow}>HOW IT WORKS</Text>
          <Text style={styles.sectionTitle}>Begin in three simple steps</Text>
          {STEPS.map((s, i) => (
            <View key={s.title} style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{i + 1}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepText}>{s.text}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* For priests */}
        <View style={styles.section}>
          <View style={styles.priestCard}>
            <Text style={styles.priestTitle}>🙏 Are you a priest?</Text>
            <Text style={styles.priestText}>
              Priests are onboarded and verified by our team. Once added, you can manage bookings, chat with devotees and keep your profile up to date.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Solid strip behind the status bar keeps its light icons readable while scrolling */}
      <View pointerEvents="none" style={[styles.statusStrip, { height: insets.top }]} />

      {/* Sticky call to action */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={() => navigation.navigate("Signup")} accessibilityRole="button">
          <Text style={styles.primaryBtnText}>Get started — it's free</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.7} onPress={() => navigation.navigate("Login")} accessibilityRole="button">
          <Text style={styles.secondaryBtnText}>I already have an account · <Text style={styles.secondaryBtnStrong}>Log in</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  statusStrip: { position: "absolute", top: 0, left: 0, right: 0, backgroundColor: "#7A3B1C" },
  hero: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + spacing.md,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
  },
  glowOne: { position: "absolute", width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(255,255,255,0.08)", top: -80, right: -90 },
  glowTwo: { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.06)", bottom: -70, left: -60 },
  logoCircle: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: "#FFF8F1",
    alignItems: "center", justifyContent: "center", marginBottom: spacing.md,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
  },
  logo: { fontSize: 50 },
  brand: { color: "#fff", fontSize: 34, fontWeight: "800", letterSpacing: 0.3 },
  tagline: { color: "#FCE3CF", fontSize: 17, fontWeight: "600", marginTop: spacing.xs },
  heroText: { color: "rgba(255,255,255,0.88)", fontSize: 15, lineHeight: 22, textAlign: "center", marginTop: spacing.md, maxWidth: 420 },
  highlights: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.sm, marginTop: spacing.lg },
  highlight: { backgroundColor: "rgba(255,255,255,0.16)", borderColor: "rgba(255,255,255,0.28)", borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: 999 },
  highlightText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  section: { paddingHorizontal: spacing.md, paddingTop: spacing.xl },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: "800", letterSpacing: 1.2, marginBottom: spacing.xs },
  sectionTitle: { color: colors.text, fontSize: 22, fontWeight: "800", marginBottom: spacing.md },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: spacing.sm + 4 },
  feature: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  featureIconBox: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.peach, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  featureIcon: { fontSize: 22 },
  featureTitle: { color: colors.text, fontSize: 15, fontWeight: "700", marginBottom: 4 },
  featureText: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },

  stepsSection: {},
  step: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, backgroundColor: colors.cardAlt, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  stepNumberText: { color: "#fff", fontWeight: "800" },
  stepTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  stepText: { color: colors.textMuted, fontSize: 13, marginTop: 2 },

  priestCard: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed", padding: spacing.md, backgroundColor: colors.card },
  priestTitle: { color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: spacing.xs },
  priestText: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },

  footer: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    backgroundColor: colors.card, paddingHorizontal: spacing.md, paddingTop: spacing.md,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 12,
  },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryBtn: { paddingVertical: spacing.md, alignItems: "center" },
  secondaryBtnText: { color: colors.textMuted, fontSize: 14 },
  secondaryBtnStrong: { color: colors.primary, fontWeight: "700" },
});
