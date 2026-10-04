import { useState } from "react";
import { Alert, Modal, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card } from "./Card";
import { Button } from "./Button";
import { ReviewModal } from "./ReviewModal";
import { SlotPicker, Slot, firstAvailableSlot, slotToISO } from "./SlotPicker";
import { colors, radius, spacing } from "../theme";
import { Booking, CANCELLATION_WINDOW_HOURS, cancelBooking, payForBooking, rescheduleBooking } from "../api/connect";
import { getErrorMessage } from "../api/client";
import { formatDateTime, formatPrice } from "../utils/format";

const STATUS_COLORS: Record<string, string> = {
  pending: colors.star,
  confirmed: colors.success,
  completed: colors.accent,
  cancelled: colors.danger,
};

const STATUS_HINT: Record<string, string> = {
  pending: "Waiting for the priest to confirm",
};

/** A devotee's booking with the actions allowed in its current state. */
export function BookingCard({ booking: b, onChanged }: { booking: Booking; onChanged: () => void }) {
  const navigation = useNavigation<any>();
  const [busy, setBusy] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [slot, setSlot] = useState<Slot>(firstAvailableSlot);

  const start = new Date(b.scheduledAt).getTime();
  const isOpen = b.status === "pending" || b.status === "confirmed";
  const withinWindow = b.status === "confirmed" && start - Date.now() < CANCELLATION_WINDOW_HOURS * 3600 * 1000;

  async function run(label: string, fn: () => Promise<unknown>, success?: string) {
    setBusy(label);
    try {
      await fn();
      if (success) Alert.alert("Done", success);
      onChanged();
    } catch (e) {
      Alert.alert("Error", getErrorMessage(e));
    } finally { setBusy(null); }
  }

  function confirmCancel() {
    if (withinWindow) {
      Alert.alert("Cannot cancel", `Confirmed bookings can only be cancelled at least ${CANCELLATION_WINDOW_HOURS} hours before the puja. Please chat with your priest.`);
      return;
    }
    Alert.alert("Cancel booking?", `${b.puja?.name} on ${formatDateTime(b.scheduledAt)}`, [
      { text: "Keep", style: "cancel" },
      { text: "Cancel Booking", style: "destructive", onPress: () => run("cancel", () => cancelBooking(b.id), "Your booking was cancelled.") },
    ]);
  }

  function confirmPay() {
    Alert.alert(
      "Pay for booking",
      `Amount: ${formatPrice(b.amount)}\n\nOnline payment is in test mode — no money will be charged.`,
      [{ text: "Not now", style: "cancel" }, { text: "Pay", onPress: () => run("pay", () => payForBooking(b.id), "Payment recorded.") }]
    );
  }

  async function submitReschedule() {
    setRescheduleOpen(false);
    await run("reschedule", () => rescheduleBooking(b.id, slotToISO(slot)), "New time requested. The priest will confirm it.");
  }

  return (
    <Card>
      <Text style={styles.name}>{b.puja?.icon} {b.puja?.name}</Text>
      <Text style={styles.sub}>Priest: {b.priest?.name}</Text>
      <Text style={styles.sub}>🗓 {formatDateTime(b.scheduledAt)}</Text>
      <Text style={styles.sub}>{formatPrice(b.amount)}{b.paid ? " · Paid ✓" : ""}</Text>
      <Text style={[styles.status, { color: STATUS_COLORS[b.status] ?? colors.textMuted }]}>{b.status.toUpperCase()}</Text>
      {STATUS_HINT[b.status] ? <Text style={styles.hint}>{STATUS_HINT[b.status]}</Text> : null}

      <View style={styles.actions}>
        {b.status === "confirmed" && !b.paid && (
          <Button title="Pay Now" onPress={confirmPay} loading={busy === "pay"} style={styles.btn} />
        )}
        {b.status === "confirmed" && b.priest?.userId && (
          <Button title="💬 Chat" variant="secondary" onPress={() => navigation.navigate("DevoteeChat", { priestId: b.priest!.userId, priestName: b.priest!.name })} style={styles.btn} />
        )}
        {isOpen && !withinWindow && (
          <Button title="Reschedule" variant="secondary" onPress={() => { setSlot(firstAvailableSlot()); setRescheduleOpen(true); }} loading={busy === "reschedule"} style={styles.btn} />
        )}
        {isOpen && (
          <Button title="Cancel" variant="secondary" onPress={confirmCancel} loading={busy === "cancel"} style={styles.btn} />
        )}
        {b.status === "completed" && !b.reviewed && (
          <Button title="⭐ Leave Review" variant="secondary" onPress={() => setReviewOpen(true)} style={styles.btn} />
        )}
        {b.status === "completed" && b.reviewed && <Text style={styles.hint}>You reviewed this priest. Thank you!</Text>}
      </View>

      <ReviewModal
        visible={reviewOpen}
        priestId={b.priestId}
        priestName={b.priest?.name}
        onClose={() => setReviewOpen(false)}
        onSubmitted={() => { setReviewOpen(false); onChanged(); }}
      />

      <Modal visible={rescheduleOpen} transparent animationType="slide" onRequestClose={() => setRescheduleOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Choose a new time</Text>
            <SlotPicker value={slot} onChange={setSlot} />
            <View style={styles.actions}>
              <Button title="Close" variant="secondary" onPress={() => setRescheduleOpen(false)} style={styles.btn} />
              <Button title="Request New Time" onPress={submitReschedule} style={styles.btn} />
            </View>
          </View>
        </View>
      </Modal>
    </Card>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.text, fontSize: 15, fontWeight: "700", marginBottom: 2 },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  status: { fontSize: 12, fontWeight: "800", marginTop: spacing.xs },
  hint: { color: colors.textMuted, fontSize: 12, fontStyle: "italic", marginTop: 2 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  btn: { flexGrow: 1, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, paddingBottom: spacing.xl },
  sheetTitle: { color: colors.text, fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: spacing.sm },
});
