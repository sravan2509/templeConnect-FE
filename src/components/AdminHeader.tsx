import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing } from "../theme";
import { useAuth } from "../context/AuthContext";

/** Header for admin screens: safe-area aware, with account actions. */
export function AdminHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { signOut, user } = useAuth();

  function openMenu() {
    Alert.alert(user?.name ?? "Admin", user?.email, [
      { text: "Change Password", onPress: () => navigation.navigate("ChangePassword") },
      { text: "Log Out", style: "destructive", onPress: signOut },
      { text: "Close", style: "cancel" },
    ]);
  }

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={openMenu} hitSlop={12} accessibilityLabel="Account menu">
        <Text style={styles.account}>👤 Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.md, paddingBottom: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { color: colors.text, fontSize: 20, fontWeight: "800" },
  account: { color: colors.primary, fontWeight: "700" },
});
