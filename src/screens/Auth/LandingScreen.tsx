import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { colors, spacing, radius } from "../../theme";

export default function LandingScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logo}>🛕</Text>
          </View>
          <Text style={styles.title}>Temple Connect</Text>
          <Text style={styles.subtitle}>Your digital bridge to the divine.</Text>
          <Text style={styles.description}>
            Experience spirituality without boundaries. Discover temples, book authentic pujas, and consult with verified priests globally.
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          
          <Card style={styles.featureCard}>
            <Text style={styles.featureIcon}>🌙</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>Spiritual Profiling</Text>
              <Text style={styles.featureDesc}>Enter your birth details to automatically discover your Nakshatra, Rashi, and personalized deity recommendations.</Text>
            </View>
          </Card>

          <Card style={styles.featureCard}>
            <Text style={styles.featureIcon}>🙏</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>Book Authentic Pujas</Text>
              <Text style={styles.featureDesc}>Browse a wide variety of ceremonies. Select your preferred date, time, and connect with a specialized priest.</Text>
            </View>
          </Card>

          <Card style={styles.featureCard}>
            <Text style={styles.featureIcon}>🗺️</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>Temple Discovery</Text>
              <Text style={styles.featureDesc}>Find temples near you based on your location and deity preferences. Get directions and timing information easily.</Text>
            </View>
          </Card>

          <Card style={styles.featureCard}>
            <Text style={styles.featureIcon}>✅</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>Verified Priests</Text>
              <Text style={styles.featureDesc}>Every priest on our platform undergoes strict verification for their qualifications and experience.</Text>
            </View>
          </Card>
          
          <Card style={styles.featureCard}>
            <Text style={styles.featureIcon}>💬</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>Direct Communication</Text>
              <Text style={styles.featureDesc}>Chat directly with priests to discuss specific arrangements and requirements before your scheduled puja.</Text>
            </View>
          </Card>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      {/* Sticky Footer */}
      <View style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button 
          title="Create an Account" 
          onPress={() => navigation.navigate("Signup")} 
        />
        <Button 
          title="Log In" 
          variant="secondary" 
          onPress={() => navigation.navigate("Login")} 
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    padding: spacing.md,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logo: {
    fontSize: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: spacing.sm,
  },
  featuresSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 120, // To avoid content hiding behind the sticky footer
  },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  }
});
