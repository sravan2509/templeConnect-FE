import React, { useState, useEffect, useCallback, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, spacing, radius } from "../../theme";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { getChatUsers, getMessages, sendMessage, markChatRead } from "../../api/admin";
import { useAuth } from "../../context/AuthContext";

export default function PriestChatScreen() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          const fetchedUsers = await getChatUsers();
          if (isActive) {
            setUsers(fetchedUsers);
            setLoading(false);
          }
        } catch {
          if (isActive) setLoading(false);
        }
      })();
      return () => { isActive = false; };
    }, [])
  );

  useEffect(() => {
    if (!selectedUser) return;
    let isActive = true;
    const fetchMsgs = async () => {
      try {
        const msgs = await getMessages(selectedUser.id);
        if (isActive) {
          setMessages(msgs);
        }
        // Mark as read when messages are fetched
        await markChatRead(selectedUser.id);
      } catch {}
    };
    fetchMsgs();
    const interval = setInterval(fetchMsgs, 3000);
    return () => { isActive = false; clearInterval(interval); };
  }, [selectedUser]);

  const handleSend = async () => {
    if (!text.trim() || !selectedUser) return;
    const currentText = text;
    setText("");
    try {
      const msg = await sendMessage(selectedUser.id, currentText);
      setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {}
  };

  if (selectedUser) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedUser(null)}>
            <Text style={styles.backBtn}>⬅ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedUser.name}</Text>
          <View style={{ width: 50 }} />
        </View>
        <ScrollView 
          ref={scrollRef}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((m, i) => {
            const isMe = m.fromUserId === user?.id;
            return (
              <View key={i} style={[styles.msgWrap, isMe ? styles.msgMeWrap : styles.msgThemWrap]}>
                <View style={[styles.msgBubble, isMe ? styles.msgMe : styles.msgThem]}>
                  <Text style={[styles.msgText, isMe ? styles.msgMeText : styles.msgThemText]}>{m.text}</Text>
                  <View style={styles.msgFooter}>
                    <Text style={[styles.msgTime, isMe ? styles.msgMeTime : styles.msgThemTime]}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {isMe && (
                      <Text style={[styles.msgStatus, { color: m.read ? "#87CEEB" : "rgba(255,255,255,0.7)" }]}>
                        {m.read ? " ✓✓" : " ✓"}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
        <View style={styles.inputArea}>
          <TextInput 
            style={styles.input} 
            value={text} 
            onChangeText={setText} 
            placeholder="Type a message..." 
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <Screen>
      <View style={styles.headerFlat}>
        <Text style={styles.headerTitle}>💬 Chat</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />}
        {!loading && users.length === 0 && (
          <Text style={styles.empty}>You have no recent chats.</Text>
        )}
        {!loading && users.map((u, i) => (
          <TouchableOpacity key={i} style={styles.userCard} onPress={() => setSelectedUser(u)}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.userName}>{u.name}</Text>
              {u.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{u.unreadCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.sub}>Tap to view messages</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerFlat: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.md },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { color: colors.primary, fontSize: 18, fontWeight: "700" },
  backBtn: { color: colors.primary, fontWeight: "600" },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
  userCard: { backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  userName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
  unreadBadge: { backgroundColor: colors.danger, borderRadius: 12, minWidth: 24, height: 24, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  unreadBadgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  
  msgWrap: { flexDirection: "row", marginBottom: spacing.sm },
  msgMeWrap: { justifyContent: "flex-end" },
  msgThemWrap: { justifyContent: "flex-start" },
  msgBubble: { maxWidth: "80%", padding: spacing.md, borderRadius: radius.md },
  msgMe: { backgroundColor: colors.primary, borderBottomRightRadius: 0 },
  msgThem: { backgroundColor: colors.card, borderBottomLeftRadius: 0, borderWidth: 1, borderColor: colors.border },
  msgText: { fontSize: 15 },
  msgMeText: { color: "#fff" },
  msgThemText: { color: colors.text },
  msgFooter: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 4 },
  msgTime: { fontSize: 10 },
  msgMeTime: { color: "rgba(255,255,255,0.7)" },
  msgThemTime: { color: colors.textMuted },
  msgStatus: { fontSize: 10, marginLeft: 4 },
  
  inputArea: { flexDirection: "row", padding: spacing.md, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, alignItems: "center" },
  input: { flex: 1, backgroundColor: colors.bg, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.text, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
  sendBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 999 },
  sendBtnText: { color: "#fff", fontWeight: "700" }
});
