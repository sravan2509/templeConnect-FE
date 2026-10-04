import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, radius, spacing } from "../theme";
import { ChatMessage, getMessages, markChatRead, sendMessage } from "../api/admin";
import { getErrorMessage } from "../api/client";

const POLL_MS = 4000;

/** Message list + composer for a 1:1 conversation. Polls while the screen is focused. */
export function ChatThread({ otherUserId, myUserId, placeholder, keyboardOffset = 0 }: {
  otherUserId: string;
  myUserId?: string;
  placeholder: string;
  keyboardOffset?: number;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const msgs = await getMessages(otherUserId);
      setMessages(msgs);
      setError(null);
      if (msgs.some((m) => m.fromUserId === otherUserId && !m.read)) await markChatRead(otherUserId);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [otherUserId]);

  useFocusEffect(
    useCallback(() => {
      fetchMessages();
      const interval = setInterval(fetchMessages, POLL_MS);
      return () => clearInterval(interval);
    }, [fetchMessages])
  );

  useEffect(() => {
    if (messages.length) setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages.length]);

  async function handleSend() {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const msg = await sendMessage(otherUserId, body);
      setText("");
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    } catch (e) {
      // Keep the typed text so the user can retry.
      Alert.alert("Message not sent", getErrorMessage(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={keyboardOffset}>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.lg, flexGrow: 1 }}
          ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : null}
          ListEmptyComponent={<Text style={styles.empty}>No messages yet. Say namaste 🙏</Text>}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item: m }) => {
            const isMe = m.fromUserId === myUserId;
            return (
              <View style={[styles.msgWrap, isMe ? styles.msgMeWrap : styles.msgThemWrap]}>
                <View style={[styles.bubble, isMe ? styles.msgMe : styles.msgThem]}>
                  <Text style={isMe ? styles.textMe : styles.textThem}>{m.text}</Text>
                  <Text style={[styles.time, { color: isMe ? "rgba(255,255,255,0.75)" : colors.textMuted }]}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {isMe ? (m.read ? "  ✓✓" : "  ✓") : ""}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity style={[styles.sendBtn, (!text.trim() || sending) && { opacity: 0.5 }]} onPress={handleSend} disabled={!text.trim() || sending}>
          {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendText}>Send</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  msgWrap: { marginBottom: spacing.sm, flexDirection: "row" },
  msgMeWrap: { justifyContent: "flex-end" },
  msgThemWrap: { justifyContent: "flex-start" },
  bubble: { maxWidth: "80%", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.lg },
  msgMe: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  msgThem: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  textMe: { color: "#fff", fontSize: 15 },
  textThem: { color: colors.text, fontSize: 15 },
  time: { fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  inputArea: { flexDirection: "row", alignItems: "flex-end", padding: spacing.sm, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
  input: { flex: 1, maxHeight: 120, backgroundColor: colors.cardAlt, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
  sendBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 42, justifyContent: "center", minWidth: 64, alignItems: "center" },
  sendText: { color: "#fff", fontWeight: "700" },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
  error: { color: colors.danger, textAlign: "center", marginBottom: spacing.sm },
});
