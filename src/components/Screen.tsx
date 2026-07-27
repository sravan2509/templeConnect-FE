import React from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "../theme";

export function Screen({
  children,
  scroll = true,
  style,
  safeTop = false,
  safeBottom = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  safeTop?: boolean;
  safeBottom?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const Content = scroll ? ScrollView : View;
  
  return (
    <View style={[
      styles.safe, 
      safeTop && { paddingTop: insets.top },
      safeBottom && { paddingBottom: insets.bottom }
    ]}>
      <Content
        style={[styles.content, style]}
        contentContainerStyle={scroll ? styles.scrollContent : undefined}
      >
        {children}
      </Content>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, paddingHorizontal: spacing.md },
  scrollContent: { paddingBottom: spacing.xl, paddingTop: spacing.sm },
});
