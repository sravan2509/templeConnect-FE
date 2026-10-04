import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius, spacing } from "../theme";

const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const DAYS_AHEAD = 30;
const MIN_LEAD_MS = 60 * 60 * 1000; // backend requires 30 min; leave a buffer

export type Slot = { date: Date; hour: number };

export function slotToISO(slot: Slot): string {
  const d = new Date(slot.date);
  d.setHours(slot.hour, 0, 0, 0);
  return d.toISOString();
}

export function isSlotAvailable(date: Date, hour: number): boolean {
  const d = new Date(date);
  d.setHours(hour, 0, 0, 0);
  return d.getTime() - Date.now() >= MIN_LEAD_MS;
}

/** First bookable slot from now. */
export function firstAvailableSlot(): Slot {
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const hour = HOURS.find((h) => isSlotAvailable(date, h));
    if (hour !== undefined) return { date, hour };
  }
  return { date: new Date(), hour: HOURS[0] };
}

const fmtHour = (h: number) => `${((h + 11) % 12) + 1}:00 ${h < 12 ? "AM" : "PM"}`;

export function SlotPicker({ value, onChange }: { value: Slot; onChange: (s: Slot) => void }) {
  const dates = useMemo(() => {
    const list: Date[] = [];
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      if (HOURS.some((h) => isSlotAvailable(d, h))) list.push(d);
    }
    return list;
  }, []);

  function pickDate(d: Date) {
    const hour = isSlotAvailable(d, value.hour) ? value.hour : HOURS.find((h) => isSlotAvailable(d, h)) ?? HOURS[0];
    onChange({ date: d, hour });
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {dates.map((d) => {
          const active = d.toDateString() === value.date.toDateString();
          return (
            <TouchableOpacity key={d.toDateString()} style={[styles.dChip, active && styles.active]} onPress={() => pickDate(d)}>
              <Text style={[styles.dWeek, active && styles.activeText]}>{d.toLocaleDateString([], { weekday: "short" })}</Text>
              <Text style={[styles.dDay, active && styles.activeText]}>{d.getDate()}</Text>
              <Text style={[styles.dWeek, active && styles.activeText]}>{d.toLocaleDateString([], { month: "short" })}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <Text style={[styles.label, { marginTop: spacing.md }]}>Time</Text>
      <View style={styles.hours}>
        {HOURS.map((h) => {
          const available = isSlotAvailable(value.date, h);
          const active = value.hour === h && available;
          return (
            <TouchableOpacity key={h} disabled={!available} style={[styles.chip, active && styles.active, !available && styles.disabled]} onPress={() => onChange({ ...value, hour: h })}>
              <Text style={[styles.chipText, active && styles.activeText]}>{fmtHour(h)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: spacing.sm },
  label: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.xs, textTransform: "uppercase" },
  dChip: { width: 58, paddingVertical: spacing.sm, alignItems: "center", borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border, marginRight: spacing.xs },
  dWeek: { color: colors.textMuted, fontSize: 11 },
  dDay: { color: colors.text, fontSize: 18, fontWeight: "700" },
  hours: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border },
  chipText: { color: colors.text, fontSize: 12 },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  activeText: { color: "#fff", fontWeight: "700" },
  disabled: { opacity: 0.35 },
});
