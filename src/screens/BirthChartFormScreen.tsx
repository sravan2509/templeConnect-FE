import React, { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { SectionHeader } from "../components/SectionHeader";
import { colors, spacing } from "../theme";
import { submitBirthChart } from "../api/astrology";

export default function BirthChartFormScreen({ navigation }: any) {
  const [dob, setDob] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!dob || !time || !place) {
      Alert.alert("Missing info", "Please fill date of birth, time, and place.");
      return;
    }
    setLoading(true);
    try {
      const chart = await submitBirthChart(dob, time, place);
      Alert.alert("Profile Created!", `Nakshatra: ${chart.nakshatra}\nRashi: ${chart.rashi}\nDeity: ${chart.deityRecommendation?.primaryDeity}`);
      navigation.navigate("BirthChartResult");
    } catch (err: any) {
      Alert.alert("Couldn't calculate chart", err?.response?.data?.error ?? "Please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <SectionHeader title="Birth Details" />
      <Text style={styles.subtitle}>Used to calculate your nakshatra and rashi</Text>
      <TextField label="Date of Birth (YYYY-MM-DD)" value={dob} onChangeText={setDob} placeholder="1995-08-15" />
      <TextField label="Time of Birth (HH:MM, 24h)" value={time} onChangeText={setTime} placeholder="14:30" />
      <TextField label="Place of Birth" value={place} onChangeText={setPlace} placeholder="Hyderabad, India" />
      <Button title="Calculate" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
});
