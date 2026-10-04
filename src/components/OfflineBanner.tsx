import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";
import { isOnline } from "../utils/network";
import { colors, spacing } from "../theme";

/**
 * App-wide banner shown above the tab bar on every screen while the device has no internet.
 * Briefly confirms when the connection comes back.
 */
export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const [offline, setOffline] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);
  const translate = useRef(new Animated.Value(200)).current;
  const wasOffline = useRef(false);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = isOnline(state);
      setOffline(!online);
      if (online && wasOffline.current) {
        setJustReconnected(true);
        hideTimer = setTimeout(() => setJustReconnected(false), 2500);
      }
      wasOffline.current = !online;
    });
    return () => { unsubscribe(); if (hideTimer) clearTimeout(hideTimer); };
  }, []);

  const visible = offline || justReconnected;
  useEffect(() => {
    Animated.timing(translate, { toValue: visible ? 0 : 200, duration: 250, useNativeDriver: true }).start();
  }, [visible, translate]);

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[styles.banner, { bottom: insets.bottom + 72, backgroundColor: offline ? colors.danger : colors.success, transform: [{ translateY: translate }] }]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      {offline ? (
        <TouchableOpacity onPress={() => NetInfo.refresh()} activeOpacity={0.8}>
          <Text style={styles.title}>No internet connection</Text>
          <Text style={styles.text}>Please check your internet connection. Tap to retry.</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.title}>Back online</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Floating pill above the tab bar, so it never hides headers or back buttons.
  banner: {
    position: "absolute", left: spacing.md, right: spacing.md, zIndex: 1000, elevation: 20,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
  },
  title: { color: "#fff", fontWeight: "800", fontSize: 15, textAlign: "center" },
  text: { color: "#fff", fontSize: 13, textAlign: "center", marginTop: 2 },
});
