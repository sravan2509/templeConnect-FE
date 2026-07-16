import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { colors, spacing } from "../theme";

export function Screen({
  children,
  scroll = true,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}) {
  const Content = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={styles.safe}>
      <Content
        style={[styles.content, style]}
        contentContainerStyle={scroll ? styles.scrollContent : undefined}
      >
        {children}
      </Content>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, paddingHorizontal: spacing.md },
  scrollContent: { paddingBottom: spacing.xl, paddingTop: spacing.sm },
});
