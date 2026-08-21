import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { colors, spacing, radius } from "../../theme";
import { getMessages, sendMessage, markChatRead } from "../../api/admin";
import { useAuth } from "../../context/AuthContext";

export default function DevoteeChatScreen({ route, navigation }: any) {
  const { priestId, priestName } = route.params as { priestId: string; priestName: string };
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    let isActive = true;
    const fetchMsgs = async () => {
      try {
        const msgs = await getMessages(priestId);
        if (isActive) {
          setMessages(msgs);
        }
        await markChatRead(priestId);
      } catch {}
    };
    fetchMsgs();
    const interval = setInterval(fetchMsgs, 3000);
    return () => { isActive = false; clearInterval(interval); };
  }, [priestId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const currentText = text;
    setText("");
    try {
      const msg = await sendMessage(priestId, currentText);
      setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {}
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>⬅ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{priestName}</Text>
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
          placeholder="Message priest..." 
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { color: colors.primary, fontSize: 18, fontWeight: "700" },
  backBtn: { color: colors.primary, fontWeight: "600" },
  
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
