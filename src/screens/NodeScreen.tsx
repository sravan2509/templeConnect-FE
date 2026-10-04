import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Screen } from "../components/Screen";
import { ListRow } from "../components/ListRow";
import { ToggleRow } from "../components/ToggleRow";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { BookingCard } from "../components/BookingCard";
import { NotificationList } from "../components/NotificationList";
import { colors, spacing } from "../theme";
import { findNode, TreeNode } from "../content/tree";
import { useAuth } from "../context/AuthContext";
import { apiClient, getErrorMessage } from "../api/client";
import {
  getFAQs, searchKnowledgeBase, getNotificationPrefs, updateNotificationPrefs, getCheckins, getBookingHistory,
  getBookmarks, deleteBookmark, createSupportTicket, getSupportTickets, updateMe, deleteAccount, NotificationPrefs,
} from "../api/profile";
import { listBookings } from "../api/connect";
import { getNotifications, markAllNotificationsRead } from "../api/admin";
import { formatDate, formatDateTime } from "../utils/format";

const KB_CATEGORY: Record<string, string> = {
  "cultural-content": "cultural",
  "kids-stories-micro-videos": "kids",
  "temple-etiquette-practices": "etiquette",
};

const PREF_ROWS: { key: keyof NotificationPrefs; icon: string; label: string }[] = [
  { key: "bookingUpdates", icon: "📅", label: "Booking Updates" },
  { key: "pujaReminders", icon: "🛕", label: "Puja Reminders" },
  { key: "templeEventAlerts", icon: "🎉", label: "Temple Event Alerts" },
  { key: "dailySuggestions", icon: "💫", label: "Daily Suggestions" },
  { key: "promotionalOffers", icon: "🏷️", label: "Offers & Announcements" },
];

export default function NodeScreen({ route, navigation }: any) {
  const { tabId, nodeId } = route.params as { tabId: string; nodeId: string };
  const node = findNode(tabId, nodeId);
  const { user, signOut, updateSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchNodeData = useCallback(async () => {
    if (!node || node.kind === "hub") return;
    setLoading(true); setError(null);
    try {
      if (KB_CATEGORY[node.id]) {
        const items = await searchKnowledgeBase();
        setData(items.filter((a: any) => a.category === KB_CATEGORY[node.id]));
      } else {
        switch (node.id) {
          case "upcoming-bookings": setData(await listBookings("upcoming")); break;
          case "booking-history": setData(await getBookingHistory()); break;
          case "saved-temples": setData(await getBookmarks()); break;
          case "visit-history": setData(await getCheckins()); break;
          case "notification-preferences": setData(await getNotificationPrefs()); break;
          case "help-center": {
            const [faqs, tickets] = await Promise.all([getFAQs(), getSupportTickets().catch(() => [])]);
            setData({ faqs, tickets });
            break;
          }
          case "temple-guidelines": setData((await apiClient.get("/home/dos-and-donts")).data); break;
          case "notifications": {
            const notifs = await getNotifications();
            setData(notifs);
            if (notifs.some((n) => !n.read)) markAllNotificationsRead().catch(() => {});
            break;
          }
          default: setData(null);
        }
      }
    } catch (e) { setError(getErrorMessage(e)); }
    setLoading(false);
  }, [node?.id]);

  useFocusEffect(useCallback(() => { fetchNodeData(); }, [fetchNodeData]));

  if (!node) return <Screen><Text style={styles.err}>Screen not found.</Text></Screen>;

  const isHub = node.kind === "hub" && (node.children?.length ?? 0) > 0;

  function navigateTo(child: TreeNode) {
    switch (child.kind) {
      case "temple-search": navigation.navigate("TempleSearch"); break;
      case "birth-chart-form": navigation.navigate("BirthChartForm"); break;
      case "birth-chart-result": navigation.navigate("BirthChartResult"); break;
      case "book-puja": navigation.navigate("BookPuja"); break;
      case "map-view": navigation.navigate("Map"); break;
      default: navigation.push("Node", { tabId, nodeId: child.id });
    }
  }

  return (
    <Screen refreshControl={!isHub ? <RefreshControl refreshing={false} onRefresh={fetchNodeData} /> : undefined}>
      {node.id === "profile-root" && user && (
        <Card style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() ?? "?"}</Text></View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </Card>
      )}
      {node.subtitle && !isHub && <Text style={styles.subtitle}>{node.subtitle}</Text>}
      {loading && data === null && <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {isHub && node.children!.map((child) => (
        <ListRow key={child.id} icon={child.icon} title={child.title} subtitle={child.subtitle} onPress={() => navigateTo(child)} />
      ))}

      {!isHub && node.id === "account" && <AccountSection user={user} updateSession={updateSession} signOut={signOut} />}
      {!isHub && data !== null && renderContent()}

      {node.id === "profile-root" && (
        <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
          <Button title={user?.hasPassword === false ? "Set a Password" : "Change Password"} variant="secondary" onPress={() => navigation.navigate("ChangePassword")} />
          <Button title="Log Out" variant="secondary" onPress={() => Alert.alert("Log out?", "You'll need to sign in again to use the app.", [{ text: "Cancel", style: "cancel" }, { text: "Log Out", style: "destructive", onPress: signOut }])} />
        </View>
      )}
    </Screen>
  );

  function renderContent() {
    switch (node!.id) {
      case "notifications":
        return <NotificationList items={data} />;

      case "upcoming-bookings":
      case "booking-history":
        if (data.length === 0) {
          return (
            <Card>
              <Text style={styles.detailText}>{node!.id === "upcoming-bookings" ? "No upcoming bookings." : "No past bookings yet."}</Text>
              <Button title="Book a Puja" onPress={() => navigation.navigate("BookPuja")} style={{ marginTop: spacing.sm }} />
            </Card>
          );
        }
        return data.map((b: any) => <BookingCard key={b.id} booking={b} onChanged={fetchNodeData} />);

      case "saved-temples":
        if (data.length === 0) return <Card><Text style={styles.detailText}>No saved temples yet. Tap ☆ Save on any temple to bookmark it.</Text></Card>;
        return data.map((item: any) => (
          <TouchableOpacity key={item.id} onPress={() => navigation.navigate("TempleDetail", { temple: { name: item.name, placeId: item.placeId, address: item.address, location: item.lat != null ? { lat: item.lat, lon: item.lon } : null } })}>
            <Card>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>🛕 {item.name}</Text>
                  {item.address ? <Text style={styles.sub}>{item.address}</Text> : null}
                </View>
                <TouchableOpacity hitSlop={10} onPress={async () => {
                  try { await deleteBookmark(item.id); fetchNodeData(); } catch (e) { Alert.alert("Error", getErrorMessage(e)); }
                }}>
                  <Text style={styles.remove}>Remove</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </TouchableOpacity>
        ));

      case "visit-history":
        if (data.length === 0) return <Card><Text style={styles.detailText}>No visits yet. Tap “✓ Check in” on a temple page when you visit.</Text></Card>;
        return data.map((c: any) => (
          <Card key={c.id}>
            <Text style={styles.cardTitle}>📍 {c.templeName}</Text>
            <Text style={styles.sub}>{formatDateTime(c.visitedAt)}</Text>
          </Card>
        ));

      case "notification-preferences": {
        const toggle = (key: keyof NotificationPrefs) => async (val: boolean) => {
          const previous = data;
          setData({ ...data, [key]: val });
          try { await updateNotificationPrefs({ [key]: val }); }
          catch (e) { setData(previous); Alert.alert("Error", getErrorMessage(e)); }
        };
        return <View>{PREF_ROWS.map((r) => <ToggleRow key={r.key} icon={r.icon} label={r.label} value={data[r.key]} onChange={toggle(r.key)} />)}</View>;
      }

      case "temple-guidelines":
        return <Card>{data.map((d: string, i: number) => <Text key={i} style={[styles.detailText, { marginBottom: spacing.sm }]}>🙏 {d}</Text>)}</Card>;

      case "help-center":
        return <HelpSection faqs={data.faqs} tickets={data.tickets} expanded={expanded} setExpanded={setExpanded} onTicketCreated={fetchNodeData} />;

      default:
        // Knowledge base article lists
        if (Array.isArray(data)) {
          if (data.length === 0) return <Card><Text style={styles.detailText}>No articles yet.</Text></Card>;
          return data.map((a: any) => {
            const open = expanded === a.id;
            return (
              <TouchableOpacity key={a.id} onPress={() => setExpanded(open ? null : a.id)} activeOpacity={0.8}>
                <Card>
                  <Text style={styles.cardTitle}>{a.title}</Text>
                  <Text style={styles.detailText}>{open ? a.content : a.summary}</Text>
                  <Text style={styles.more}>{open ? "Show less ▲" : "Read more ▼"}</Text>
                </Card>
              </TouchableOpacity>
            );
          });
        }
        return null;
    }
  }
}

function AccountSection({ user, updateSession, signOut }: { user: any; updateSession: (u: any) => Promise<void>; signOut: () => Promise<void> }) {
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const googleOnly = user?.hasPassword === false;

  async function saveName() {
    if (!name.trim()) return Alert.alert("Name required", "Please enter your name.");
    setSaving(true);
    try {
      const me = await updateMe(name.trim());
      await updateSession({ ...user, ...me });
      Alert.alert("Saved", "Your name was updated.");
    } catch (e) { Alert.alert("Error", getErrorMessage(e)); }
    finally { setSaving(false); }
  }

  function confirmDelete() {
    if (googleOnly ? password.trim().toUpperCase() !== "DELETE" : !password) {
      return Alert.alert("Confirmation required", googleOnly ? "Type DELETE to confirm." : "Enter your password to confirm.");
    }
    Alert.alert("Delete account permanently?", "Your bookings, birth chart, saved temples and messages will be deleted. This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        setDeleting(true);
        try { await deleteAccount(googleOnly ? { confirmText: password } : { password }); await signOut(); }
        catch (e) { Alert.alert("Could not delete account", getErrorMessage(e)); }
        finally { setDeleting(false); }
      } },
    ]);
  }

  return (
    <>
      <Card>
        <TextField label="Name" value={name} onChangeText={setName} />
        <Text style={styles.sub}>Email: {user?.email}</Text>
        {user?.googleLinked ? <Text style={styles.sub}>Signed in with Google ✓</Text> : null}
        <Button title="Save" onPress={saveName} loading={saving} disabled={name.trim() === user?.name} style={{ marginTop: spacing.md }} />
      </Card>
      <Card style={{ borderColor: colors.danger }}>
        <Text style={[styles.cardTitle, { color: colors.danger }]}>Delete Account</Text>
        {!showDelete ? (
          <Button title="Delete My Account" variant="secondary" onPress={() => setShowDelete(true)} style={{ marginTop: spacing.sm, borderColor: colors.danger }} />
        ) : (
          <>
            <TextField
              label={googleOnly ? 'Type DELETE to confirm' : "Confirm with your password"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!googleOnly}
              autoCapitalize={googleOnly ? "characters" : "none"}
            />
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              <Button title="Cancel" variant="secondary" onPress={() => { setShowDelete(false); setPassword(""); }} style={{ flex: 1 }} />
              <Button title="Delete" onPress={confirmDelete} loading={deleting} style={{ flex: 1, backgroundColor: colors.danger }} />
            </View>
          </>
        )}
      </Card>
    </>
  );
}

function HelpSection({ faqs, tickets, expanded, setExpanded, onTicketCreated }: {
  faqs: { id: string; question: string; answer: string }[];
  tickets: { id: string; subject: string; message: string; status: string; createdAt: string }[];
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  onTicketCreated: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!message.trim()) return Alert.alert("Message required", "Please describe how we can help.");
    setSending(true);
    try {
      await createSupportTicket(subject.trim() || "General Support", message.trim());
      setSubject(""); setMessage("");
      Alert.alert("Sent", "Our team will get back to you soon.");
      onTicketCreated();
    } catch (e) { Alert.alert("Error", getErrorMessage(e)); }
    finally { setSending(false); }
  }

  return (
    <>
      <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>
      {faqs.map((f) => {
        const open = expanded === f.id;
        return (
          <TouchableOpacity key={f.id} onPress={() => setExpanded(open ? null : f.id)} activeOpacity={0.8}>
            <Card>
              <Text style={styles.cardTitle}>{open ? "▾" : "▸"} {f.question}</Text>
              {open && <Text style={styles.detailText}>{f.answer}</Text>}
            </Card>
          </TouchableOpacity>
        );
      })}

      <Text style={styles.sectionLabel}>Contact Support</Text>
      <Card>
        <TextField label="Subject" value={subject} onChangeText={setSubject} placeholder="e.g. Booking issue" maxLength={150} />
        <TextField label="Message" value={message} onChangeText={setMessage} multiline maxLength={5000} placeholder="Describe your question or problem" />
        <Button title="Send" onPress={send} loading={sending} />
      </Card>

      {tickets.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>My Requests</Text>
          {tickets.map((t) => (
            <Card key={t.id}>
              <Text style={styles.cardTitle}>{t.subject}</Text>
              <Text style={styles.detailText} numberOfLines={3}>{t.message}</Text>
              <Text style={styles.sub}>{formatDate(t.createdAt)} · {t.status.toUpperCase()}</Text>
            </Card>
          ))}
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.md },
  detailText: { color: colors.text, lineHeight: 20 },
  error: { color: colors.danger, padding: spacing.sm },
  err: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
  profileCard: { alignItems: "center", paddingVertical: spacing.lg, marginTop: spacing.sm },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primaryDark, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  profileName: { color: colors.text, fontSize: 18, fontWeight: "700" },
  profileEmail: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: "700", marginBottom: spacing.xs },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  more: { color: colors.primary, fontSize: 12, marginTop: spacing.xs, fontWeight: "600" },
  remove: { color: colors.danger, fontWeight: "600", fontSize: 13 },
  rowBetween: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  sectionLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "700", textTransform: "uppercase", marginTop: spacing.md, marginBottom: spacing.sm },
});
