import { useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "./Button";
import { TextField } from "./TextField";
import { colors, radius, spacing } from "../theme";
import { submitReview } from "../api/connect";
import { getErrorMessage } from "../api/client";

export function ReviewModal({ visible, priestId, priestName, onClose, onSubmitted }: {
  visible: boolean;
  priestId: string;
  priestName?: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (rating < 1) return Alert.alert("Choose a rating", "Tap the stars to rate your experience.");
    setSaving(true);
    try {
      await submitReview(priestId, rating, comment.trim() || undefined);
      Alert.alert("Thank you 🙏", "Your review has been submitted.");
      setRating(0); setComment("");
      onSubmitted();
    } catch (e) {
      Alert.alert("Could not submit review", getErrorMessage(e));
    } finally { setSaving(false); }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => { if (!rating && !comment.trim()) onClose(); }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Rate {priestName || "your priest"}</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setRating(n)} hitSlop={6} accessibilityLabel={`${n} star${n > 1 ? "s" : ""}`}>
                <Text style={[styles.star, n <= rating && styles.starOn]}>{n <= rating ? "★" : "☆"}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextField label="Comment (optional)" value={comment} onChangeText={setComment} multiline maxLength={1000} placeholder="How was the ceremony?" />
          <View style={styles.row}>
            <Button title="Cancel" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
            <Button title="Submit" onPress={submit} loading={saving} style={{ flex: 1 }} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: spacing.lg },
  box: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg },
  title: { color: colors.text, fontSize: 18, fontWeight: "700", textAlign: "center" },
  stars: { flexDirection: "row", justifyContent: "center", gap: spacing.sm, marginVertical: spacing.md },
  star: { fontSize: 36, color: colors.border },
  starOn: { color: colors.star },
  row: { flexDirection: "row", gap: spacing.sm },
});
