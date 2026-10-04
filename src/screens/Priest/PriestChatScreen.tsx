import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { colors, radius, spacing } from "../../theme";
import { ChatUser, getChatUsers } from "../../api/admin";
import { getErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { ChatThread } from "../../components/ChatThread";

export default function PriestChatScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  // iOS keyboard avoidance needs the distance from the screen top to the thread (status bar + header).
  const HEADER_HEIGHT = 57;
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selected, setSelected] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setUsers(await getChatUsers());
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { if (!selected) load(); }, [load, selected]));

  // Opened from a booking card: jump straight into that devotee's conversation.
  const openUser = route?.params?.openUser;
  useEffect(() => {
    if (openUser?.id) {
      setSelected({ id: openUser.id, name: openUser.name ?? "Devotee", unreadCount: 0, lastMessageAt: null });
      navigation?.setParams({ openUser: undefined });
    }
  }, [openUser?.id]);

  if (selected) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setSelected(null); load(); }} hitSlop={12}>
            <Text style={styles.backBtn}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{selected.name}</Text>
          <View style={{ width: 50 }} />
        </View>
        <ChatThread otherUserId={selected.id} myUserId={user?.id} placeholder="Type a message..." keyboardOffset={insets.top + HEADER_HEIGHT} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 Chats</Text>
      </View>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ padding: spacing.md }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
          ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : null}
          ListEmptyComponent={<Text style={styles.empty}>No chats yet. Devotees with bookings will appear here.</Text>}
          renderItem={({ item: u }) => (
            <TouchableOpacity style={styles.userCard} onPress={() => setSelected(u)}>
              <View style={styles.row}>
                <Text style={styles.userName}>{u.name}</Text>
                {u.unreadCount > 0 && (
                  <View style={styles.badge}><Text style={styles.badgeText}>{u.unreadCount}</Text></View>
                )}
              </View>
              <Text style={styles.sub}>
                {u.lastMessageAt ? `Last message ${new Date(u.lastMessageAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}` : "No messages yet"}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingVertical: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: "700", flexShrink: 1 },
  backBtn: { color: colors.primary, fontSize: 16, fontWeight: "600" },
  userCard: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  badge: { backgroundColor: colors.danger, borderRadius: 10, minWidth: 20, height: 20, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
