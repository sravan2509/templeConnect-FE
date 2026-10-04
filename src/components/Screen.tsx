import React from "react";
import { RefreshControlProps, ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "../theme";

export function Screen({
  children,
  scroll = true,
  style,
  safeTop = false,
  safeBottom = true,
  refreshControl,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  safeTop?: boolean;
  safeBottom?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safe, safeTop && { paddingTop: insets.top }, safeBottom && { paddingBottom: insets.bottom }]}>
      {scroll ? (
        <ScrollView
          style={[styles.content, style]}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          // iOS: insets content above the keyboard (correct under headers, unlike KeyboardAvoidingView).
          // Android resizes the window for the keyboard on its own.
          automaticallyAdjustKeyboardInsets
          keyboardDismissMode="interactive"
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, style]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, paddingHorizontal: spacing.md },
  scrollContent: { paddingBottom: spacing.xl, paddingTop: spacing.sm },
});
